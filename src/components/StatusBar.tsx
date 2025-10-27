import React, { useState, useEffect, useRef } from 'react';
import './StatusBar.css';

interface Device {
  id: string;
  name: string;
  room: string;
  power: number;
  on: boolean;
}

interface StatusBarProps {
  devices: Device[];
  gameComplete: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ devices, gameComplete }) => {
  const [tip, setTip] = useState('');
  const [logs, setLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const logContentRef = useRef<HTMLDivElement>(null);
  
  const tips = [
    "💡 불필요한 조명은 꺼주세요!",
    "🌬️ 냉장고 문은 자주 열지 마세요.",
    "🔌 사용하지 않는 콘센트는 뽑아두세요.",
    "📺 TV 2시간 이상 미사용 시 절전 모드를 권장합니다.",
    "💻 노트북 배터리 충전 완료 후 전원을 차단하세요.",
    "🌟 LED 조명은 일반 백열등보다 80% 절전됩니다.",
  ];

  // 전력 소비량 계산
  const totalPower = devices
    .filter(d => d.on)
    .reduce((sum, d) => sum + d.power, 0);

  const pricePerWh = 0.000275;
  // 시간당 요금 계산 (Wh 단위로 변환: W * 1h = Wh)
  const hourlyCost = totalPower * pricePerWh;
  const activeDevicesCount = devices.filter(d => d.on).length;

  // 랜덤 팁 설정
  useEffect(() => {
    setTip(tips[Math.floor(Math.random() * tips.length)]);
  }, []);

  // 전력 변화 로그 (간소화 - 전력 변화가 있을 때만)
  useEffect(() => {
    if (gameComplete && totalPower > 0) {
      const message = `[${new Date().toLocaleTimeString()}] 전력: ${totalPower}W (${activeDevicesCount}개 기기 ON)`;
      setLogs(prev => {
        // 중복 체크 - 같은 메시지가 이미 있는지 확인
        const lastLog = prev[prev.length - 1];
        if (lastLog && lastLog === message) {
          return prev;
        }
        return [...prev, message].slice(-10);
      });
    }
  }, [totalPower, activeDevicesCount, gameComplete]);

  // 로그가 추가될 때마다 맨 아래로 스크롤
  useEffect(() => {
    if (logContentRef.current) {
      logContentRef.current.scrollTop = logContentRef.current.scrollHeight;
    }
  }, [logs]);

  if (!gameComplete) return null;

  // 게이지 비율 계산 (1000W를 최대값으로)
  const gaugePercentage = Math.min((totalPower / 1000) * 100, 100);
  
  return (
    <>
      {/* 상단 팁 배너 */}
      {tip && (
        <div className="tip-banner">
          {tip}
        </div>
      )}

      {/* 전력 게이지 */}
      <div className="power-gauge-container">
        <div className="gauge-label">
          현재 전력 소비량
          <span className="gauge-power">{totalPower}W</span>
        </div>
        <div className="gauge">
          <div 
            className={`gauge-fill ${totalPower > 1000 ? 'gauge-warning' : ''}`}
            style={{ width: `${gaugePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* 하단 상태 바 */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-label">총 전력:</span>
          <span className="status-value">{totalPower}W</span>
        </div>
        <div className="status-divider">|</div>
        <div className="status-item">
          <span className="status-label">요금:</span>
          <span className="status-value">{hourlyCost.toFixed(2)}원/시</span>
        </div>
        <div className="status-divider">|</div>
        <div className="status-item">
          <span className="status-label">ON 기기:</span>
          <span className="status-value">{activeDevicesCount}개</span>
        </div>
        {totalPower > 1000 && (
          <>
            <div className="status-divider">|</div>
            <div className="status-item warning">
              <span className="status-label">⚠️ 전력 경고</span>
            </div>
          </>
        )}
      </div>

      {/* 이벤트 로그 패널 */}
      <div className="event-log-container">
        <button 
          className="log-toggle" 
          onClick={() => setShowLogs(!showLogs)}
        >
          {showLogs ? '📋 로그 숨기기' : '📋 이벤트 로그'}
          {logs.length > 0 && <span className="log-count">{logs.length}</span>}
        </button>
        
        {showLogs && (
          <div className="event-log-panel">
            <div className="log-header">📝 최근 이벤트 (최대 10개)</div>
            <div className="log-content" ref={logContentRef}>
              {logs.length === 0 ? (
                <div className="log-empty">아직 이벤트가 없습니다.</div>
              ) : (
                logs.map((log, index) => (
                  <div key={index} className="log-entry">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default StatusBar;
