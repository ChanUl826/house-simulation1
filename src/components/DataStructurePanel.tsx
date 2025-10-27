import React, { useState } from 'react';
import './DataStructurePanel.css';

interface Device {
  id: string;
  name: string;
  room: string;
  power: number;
  on: boolean;
}

interface DataStructurePanelProps {
  devices: Device[];
  powerHistory: number[];
  gameComplete: boolean;
  onClose?: () => void;
}

type ViewMode = 'array' | 'queue' | 'priority' | 'tree';

const DataStructurePanel: React.FC<DataStructurePanelProps> = ({
  devices,
  powerHistory,
  gameComplete,
  onClose
}) => {
  const [mode, setMode] = useState<ViewMode>('array');

  // 방별 기기 그룹화 (트리용)
  const devicesByRoom = devices.reduce((acc, device) => {
    if (!acc[device.room]) {
      acc[device.room] = [];
    }
    acc[device.room].push(device);
    return acc;
  }, {} as Record<string, Device[]>);

  return (
    <div className={`data-structure-panel ${gameComplete ? 'panel-visible' : 'panel-hidden'}`}>
      <div className="panel-content">
        <div className="panel-header">
          <h2>🧠 자료구조 시각화</h2>
          {onClose && (
            <button className="close-button" onClick={onClose}>
              ✕
            </button>
          )}
        </div>

        <div className="mode-selector">
          <label>모드 선택:</label>
          <select value={mode} onChange={(e) => setMode(e.target.value as ViewMode)}>
            <option value="array">📦 배열 (Array)</option>
            <option value="queue">🔄 큐 (Queue)</option>
            <option value="priority">⚡ 우선순위 큐 (Priority Queue)</option>
            <option value="tree">🌳 트리 (Tree)</option>
          </select>
        </div>

        {/* 배열 모드 */}
        {mode === 'array' && (
          <div className="visualization-section">
            <h3>📦 배열 (devices[])</h3>
            <div className="array-visual">
              {devices.map((device, index) => (
                <div
                  key={device.id}
                  className={`array-cell ${device.on ? 'on' : 'off'}`}
                  title={`인덱스: ${index}\n이름: ${device.name}\n전력: ${device.power}W\n상태: ${device.on ? 'ON' : 'OFF'}`}
                >
                  <div className="device-name">{device.name}</div>
                  <div className="device-power">{device.power}W</div>
                  <div className={`device-status ${device.on ? 'status-on' : 'status-off'}`}>
                    {device.on ? '⚡' : '💤'}
                  </div>
                </div>
              ))}
            </div>
            <div className="array-info">
              <p>총 길이: {devices.length}</p>
              <p>켜진 기기: {devices.filter(d => d.on).length}</p>
            </div>
          </div>
        )}

        {/* 큐 모드 */}
        {mode === 'queue' && (
          <div className="visualization-section">
            <h3>🔄 큐 (powerHistory)</h3>
            <div className="queue-visual">
              <div className="queue-label start">Front (최신)</div>
              {powerHistory.slice().reverse().map((power, index) => (
                <div key={index} className="queue-cell">
                  <div className="queue-value">{power}W</div>
                  <div className="queue-index">{powerHistory.length - index - 1}</div>
                </div>
              ))}
              <div className="queue-label end">Rear (오래됨)</div>
            </div>
            <div className="queue-info">
              <p>큐 길이: {powerHistory.length}</p>
              <p>최근 값: {powerHistory[powerHistory.length - 1] || 0}W</p>
            </div>
          </div>
        )}

        {/* 우선순위 큐 모드 */}
        {mode === 'priority' && (
          <div className="visualization-section">
            <h3>⚡ 우선순위 큐 (Power Priority)</h3>
            <div className="priority-info">
              <p>전력 소비량 높은 순서대로 정렬</p>
              <p>전력 초과 시 높은 우선순위 기기가 먼저 꺼집니다</p>
            </div>
            <div className="priority-visual">
              {[...devices].sort((a, b) => b.power - a.power).map((device, index) => (
                <div
                  key={device.id}
                  className={`priority-cell ${device.on ? 'on' : 'off'}`}
                  style={{
                    borderLeftColor: device.on ? `hsl(${(index + 1) * 20}, 70%, 50%)` : '#999'
                  }}
                >
                  <div className="priority-index">#{index + 1}</div>
                  <div className="priority-content">
                    <div className="device-name">{device.name}</div>
                    <div className="device-power">{device.power}W</div>
                    <div className={`device-status ${device.on ? 'status-on' : 'status-off'}`}>
                      {device.on ? '⚡ ON' : '💤 OFF'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 트리 모드 */}
        {mode === 'tree' && (
          <div className="visualization-section">
            <h3>🌳 트리 (Room Hierarchy)</h3>
            <div className="tree-visual">
              <div className="tree-node root">
                <div className="node-label">🏠 Smart Home</div>
                {Object.entries(devicesByRoom).map(([room, roomDevices]) => (
                  <div key={room} className="tree-branch">
                    <div className="tree-node room">
                      <div className="node-label">🏘️ {room}</div>
                      <div className="room-devices">
                        {roomDevices.map(device => (
                          <div key={device.id} className={`tree-node device ${device.on ? 'device-on' : 'device-off'}`}>
                            <div className="node-label">
                              {device.name}
                              <span className="device-indicator">{device.on ? '⚡' : '💤'}</span>
                            </div>
                            <div className="device-detail">{device.power}W</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataStructurePanel;
