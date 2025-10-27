import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from 'recharts';
import './EnergyPanel.css';

interface Device {
  id: string;
  name: string;
  room: string;
  power: number;
  on: boolean;
}

interface EnergyPanelProps {
  devices: Device[];
  setDevices: React.Dispatch<React.SetStateAction<Device[]>>;
  gameComplete: boolean;
}

const EnergyPanel: React.FC<EnergyPanelProps> = ({ devices, setDevices, gameComplete }) => {
  const [totalPower, setTotalPower] = useState(0);
  const [chartData, setChartData] = useState<{ time: string; power: number }[]>([]);
  const [timeMultiplier, setTimeMultiplier] = useState(1);
  const [simulationTime, setSimulationTime] = useState(0);
  const [dailyEnergy, setDailyEnergy] = useState(0);
  const [roomPower, setRoomPower] = useState<{ room: string; power: number }[]>([]);
  const [powerLimit, setPowerLimit] = useState(800); // 전력 제한 설정
  const [autoShutoff, setAutoShutoff] = useState(false); // 자동 절전 모드
  const lastShutoffTime = React.useRef<number>(0); // 마지막 절전 시간 추적
  
  const pricePerWh = 0.000275;
  const totalCost = Math.round(totalPower * pricePerWh * 1000);

  useEffect(() => {
    setTotalPower(devices.filter(d => d.on).reduce((sum, d) => sum + d.power, 0));
  }, [devices]);

  // 전력 초과 시 자동 절전
  useEffect(() => {
    if (!autoShutoff) return;
    
    if (totalPower > powerLimit && gameComplete) {
      // 2초 이내에 이미 절전했으면 스킵 (무한 루프 방지)
      const now = Date.now();
      if (now - lastShutoffTime.current < 2000) return;
      
      // 전력 소비가 높은 순으로 정렬하여 끄기
      const sortedDevices = [...devices]
        .filter(d => d.on)
        .sort((a, b) => b.power - a.power);
      
      // 제한을 초과한 전력만큼 기기 끄기
      let powerToTurnOff = totalPower - powerLimit;
      
      const devicesToTurnOff: string[] = [];
      
      for (const device of sortedDevices) {
        if (powerToTurnOff <= 0) break;
        devicesToTurnOff.push(device.id);
        powerToTurnOff -= device.power;
      }
      
      if (devicesToTurnOff.length > 0) {
        lastShutoffTime.current = now;
        setDevices(prev =>
          prev.map(d => devicesToTurnOff.includes(d.id) ? { ...d, on: false } : d)
        );
      }
    }
  }, [totalPower, powerLimit, autoShutoff, devices, gameComplete, setDevices]);

  // 시뮬레이션 시간 진행
  useEffect(() => {
    const interval = setInterval(() => {
      setSimulationTime(prev => prev + timeMultiplier);
      
      // 일일 누적 에너지 계산 (매 1초마다)
      // W를 Wh로 변환: 현재 전력(W) * 경과 시간(h) = 누적 에너지(Wh)
      setDailyEnergy(prev => {
        // 1초당 에너지 증가량 = currentPower / 3600 Wh
        return prev + (totalPower * timeMultiplier / 3600);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeMultiplier, totalPower]);

  // 방별 전력 계산
  useEffect(() => {
    const roomData = devices
      .filter(d => d.on)
      .reduce((acc, device) => {
        const roomIndex = acc.findIndex(r => r.room === device.room);
        if (roomIndex >= 0) {
          acc[roomIndex].power += device.power;
        } else {
          acc.push({ room: device.room, power: device.power });
        }
        return acc;
      }, [] as { room: string; power: number }[]);
    setRoomPower(roomData);
  }, [devices]);

  // 차트 데이터 업데이트
  useEffect(() => {
    const updateChart = () => {
      const time = `${Math.floor(simulationTime / 60)}:${String(Math.floor(simulationTime % 60)).padStart(2, '0')}`;
      setChartData(prev => {
        const newData = [...prev, { time, power: totalPower }];
        return newData.slice(-20);
      });
    };
    
    updateChart();
    const interval = setInterval(updateChart, 1000);
    return () => clearInterval(interval);
  }, [totalPower, timeMultiplier]);

  const toggleDevice = (id: string) => {
    setDevices(prev => prev.map(d => (d.id === id ? { ...d, on: !d.on } : d)));
  };

  const resetDaily = () => {
    setDailyEnergy(0);
    setChartData([]);
  };

  const COLORS = ['#66cdaa', '#4F695A', '#CB7861', '#6F8282', '#AA5541', '#8BB29E', '#EBB177'];

  return (
    <div className={`energy-panel ${gameComplete ? 'panel-visible' : 'panel-hidden'}`}>
      <h2>⚡ 에너지 제어 패널</h2>

      {/* 시간 배율 컨트롤 */}
      <div className="time-control">
        <label className="time-control-label">⏱️ 시뮬레이션 속도</label>
        <div className="time-buttons">
          {[0.5, 1, 2, 5, 10].map(speed => (
            <button
              key={speed}
              className={`time-button ${timeMultiplier === speed ? 'active' : ''}`}
              onClick={() => setTimeMultiplier(speed)}
            >
              {speed}x
            </button>
          ))}
        </div>
        <div className="simulation-time">
          경과 시간: {Math.floor(simulationTime / 60)}:{(simulationTime % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* 일일 누적 소비 */}
      <div className="daily-energy">
        <div className="daily-header">
          <span>📊 일일 누적 소비</span>
          <button className="reset-btn" onClick={resetDaily}>초기화</button>
        </div>
        <div className="daily-stats">
          <div className="stat-item">
            <span className="stat-label">에너지</span>
            <span className="stat-value">{dailyEnergy >= 1 ? (dailyEnergy / 1000).toFixed(3) : dailyEnergy.toFixed(1)} {dailyEnergy >= 1 ? 'kWh' : 'Wh'}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">예상 요금</span>
            <span className="stat-value">{(dailyEnergy * pricePerWh).toFixed(2)} 원</span>
          </div>
        </div>
      </div>

      {/* 전력 제한 설정 */}
      <div className="power-limit-control">
        <div className="power-limit-header">
          <label className="limit-label">⚡ 전력 제한 설정</label>
          <span className={`limit-status ${totalPower > powerLimit ? 'exceeded' : 'normal'}`}>
            {totalPower > powerLimit ? '⚠️ 초과' : '✅ 정상'}
          </span>
        </div>
        <div className="limit-slider">
          <input
            type="range"
            min="200"
            max="1000"
            step="50"
            value={powerLimit}
            onChange={(e) => setPowerLimit(Number(e.target.value))}
            className="power-slider"
          />
          <div className="limit-value">{powerLimit}W</div>
        </div>
        <div className="current-power">
          현재 전력: <span className={totalPower > powerLimit ? 'warning' : ''}>{totalPower}W</span>
        </div>
        <label className="auto-shutoff-label">
          <input
            type="checkbox"
            checked={autoShutoff}
            onChange={(e) => setAutoShutoff(e.target.checked)}
          />
          <span>전력 초과 시 자동 절전 모드</span>
        </label>
      </div>

      <div className="power-info">
        <div className="power-item">
          <span className="power-label">총 전력:</span>
          <span className={`power-value ${totalPower > powerLimit ? 'exceeded' : ''}`}>
            {totalPower} W
          </span>
        </div>
        <div className="power-item">
          <span className="cost-label">요금(1시간):</span>
          <span className="cost-value">{totalCost.toLocaleString()} 원</span>
        </div>
      </div>

      <div className="device-list">
        {devices.map(d => (
          <div key={d.id} className={`device-row ${d.on ? 'device-on' : ''}`}>
            <div className="device-info">
              <span className="device-name">{d.name}</span>
              <span className="device-power">{d.power}W</span>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={d.on} 
                onChange={() => toggleDevice(d.id)} 
              />
              <span className="slider"></span>
            </label>
          </div>
        ))}
      </div>

      {/* 방별 전력 분포 */}
      {roomPower.length > 0 && (
        <div className="room-chart-container">
          <h4>🏠 방별 전력 분포</h4>
          <div className="room-chart">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={roomPower}
                  dataKey="power"
                  nameKey="room"
                  cx="50%"
                  cy="50%"
                  outerRadius={50}
                  label={(entry) => `${entry.room}: ${entry.power}W`}
                >
                  {roomPower.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="chart-container">
        <h3>📊 시뮬레이션 소비 그래프 (배율: {timeMultiplier}x)</h3>
        <div className="chart-wrapper" style={{ height: '320px', minHeight: '320px', maxHeight: '320px' }}>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                label={{ value: '시뮬레이션 시간', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                domain={[0, 'dataMax']}
                label={{ value: '전력 (W)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ccc' }}
                formatter={(value: number) => [`${value} W`, '전력 소비량']}
                labelFormatter={(label) => `시뮬레이션 시간: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="power" 
                stroke="#66cdaa" 
                strokeWidth={3} 
                dot={{ fill: '#66cdaa', r: 4 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default EnergyPanel;
