import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Draggable } from 'gsap/Draggable';
import HouseSVG from './HouseSVG';
import EnergyPanel from './EnergyPanel';
import DataStructurePanel from './DataStructurePanel';
import StatusBar from './StatusBar';
import './HouseGame.css';

// Register GSAP plugin
gsap.registerPlugin(Draggable);

interface Device {
  id: string;
  name: string;
  room: string;
  power: number;
  on: boolean;
}

// Room 설정
class Room {
  value: number = 0;
  items: number;
  fill: string;
  viewBox: string;

  constructor(fill: string, viewBox: string, items: number = 4) {
    this.items = items;
    this.fill = fill;
    this.viewBox = viewBox;
  }
}

const rooms: any = {
  dressingroom: new Room('#cd5c5c', '30 202 150 100', 4), // mirror, locker, dressingroom-table, dressingroom-lamp
  livingroom: new Room('#66cdaa', '153 198 165 105', 5), // tv, sofa, painting, livingroom-table, livingroom-lamp (5 items)
  kitchen: new Room('#f0e68c', '305 202 150 100', 4), // kitchen-chair-1, kitchen-chair-2, kitchen-table, kitchen-lamp (4 items)
  bedroom: new Room('#ffe4c4', '103 104 155 98', 4), // bed, bedroom-table-1, bedroom-table-2, bedroom-lamp (4 items)
  bathroom: new Room('#ffffe0', '259 104 165 100', 4), // bath, toilet, bathroom-table, bathroom-lamp
  cabinet: new Room('#d8Bfd8', '105 -20 255 150', 4), // bookcase, cabinet-chair, laptop, cabinet-lamp
  totalItems: 0
};

const HouseGame: React.FC = () => {
  const svgRef = useRef<SVGSVGElement>(null);
  const instancesRef = useRef<Draggable[]>([]);
  
  // 게임 완료 여부
  const [gameComplete, setGameComplete] = useState(false);
  
  // 자료구조 패널 표시 여부
  const [showDataPanel, setShowDataPanel] = useState(false);
  
  // 기기 상태 (에너지 시뮬레이터 공유)
  // SVG에 실제로 존재하는 전기 사용 기기만 포함
  const [devices, setDevices] = useState<Device[]>([
    { id: 'tv', name: 'TV', room: 'livingroom', power: 150, on: false },
    { id: 'kitchen-lamp', name: 'Kitchen Lamp', room: 'kitchen', power: 60, on: false },
    { id: 'laptop', name: 'Laptop', room: 'cabinet', power: 80, on: false },
    { id: 'bedroom-lamp', name: 'Bedroom Lamp', room: 'bedroom', power: 40, on: false },
    { id: 'livingroom-lamp', name: 'Living Room Lamp', room: 'livingroom', power: 50, on: false },
    { id: 'dressingroom-lamp', name: 'Dressing Room Lamp', room: 'dressingroom', power: 40, on: false },
    { id: 'bathroom-lamp', name: 'Bathroom Lamp', room: 'bathroom', power: 35, on: false },
    { id: 'cabinet-lamp', name: 'Cabinet Lamp', room: 'cabinet', power: 45, on: false },
    { id: 'air-conditioner', name: 'Air Conditioner', room: 'livingroom', power: 300, on: false },
  ]);

  // 전력 사용 이력 (큐 구조용)
  const [powerHistory, setPowerHistory] = useState<number[]>([]);
  
  // 전력 사용량 추적 (1초마다 업데이트)
  useEffect(() => {
    const interval = setInterval(() => {
      const totalPower = devices
        .filter(d => d.on)
        .reduce((sum, d) => sum + d.power, 0);
      
      setPowerHistory(prev => {
        const newHistory = [...prev, totalPower];
        // 최대 20개만 유지 (FIFO 큐)
        if (newHistory.length > 20) {
          return newHistory.slice(-20);
        }
        return newHistory;
      });
    }, 1000);
    
    return () => clearInterval(interval);
  }, [devices]);

  // 각 기기 ON/OFF에 따라 SVG 스타일 변화
  useEffect(() => {
    if (!svgRef.current) return;
    devices.forEach(d => {
      const itemEl = svgRef.current!.querySelector(`.item-${d.id}`);
      if (itemEl) {
        gsap.to(itemEl, {
          duration: 0.4,
          opacity: d.on ? 1 : 0.5,
          filter: d.on ? 'brightness(1.2)' : 'brightness(0.7)',
          ease: 'power1.out',
        });
      }
    });

    // 모든 방의 조명 상태 설정
    const allRooms = svgRef.current!.querySelectorAll('#house > path[id]');
    const lampDevices = devices.filter(d => d.id.includes('lamp'));
    
    allRooms.forEach((room: Element) => {
      const roomId = (room as SVGPathElement).id;
      const hasLight = lampDevices.some(l => l.on && l.room === roomId);
      
      // 해당 방의 가구가 모두 올바르게 배치되었는지 확인
      const roomFurnitureComplete = rooms[roomId] && rooms[roomId].value >= rooms[roomId].items;
      
      if (hasLight && roomFurnitureComplete) {
        // 조명이 켜지고 가구도 모두 배치된 방: 적당히 밝고 채도도 적당히
        gsap.to(room, {
          duration: 0.1,
          filter: 'brightness(1.2) saturate(1.5)',
          ease: 'none',
          immediateRender: false,
        });
      } else {
        // 조명이 꺼졌거나 가구가 모두 배치되지 않은 방: 적당히 어둡게
        gsap.to(room, {
          duration: 0.1,
          filter: 'brightness(0.7)',
          ease: 'none',
          immediateRender: false,
        });
      }
    });

    // TV 화면 색상 변화
    const tvDevice = devices.find(d => d.id === 'tv');
    if (tvDevice) {
      const tvScreen = svgRef.current!.querySelector('#tv-screen') as SVGPathElement;
      if (tvScreen) {
        gsap.to(tvScreen, {
          duration: 0.4,
          fill: tvDevice.on ? '#f0c000' : '#4F695A',
          ease: 'power1.out',
        });
      }
    }

    // 노트북 화면 색상 변화
    const laptopDevice = devices.find(d => d.id === 'laptop');
    if (laptopDevice) {
      const laptopScreen = svgRef.current!.querySelector('#laptop-screen') as SVGPathElement;
      if (laptopScreen) {
        gsap.to(laptopScreen, {
          duration: 0.4,
          fill: laptopDevice.on ? '#f0c000' : '#4F695A',
          ease: 'power1.out',
        });
      }
    }

    // 에어컨 ON/OFF: 시원 효과 (조명 효과와 함께 적용)
    const acDevice = devices.find(d => d.id === 'air-conditioner');
    
    allRooms.forEach((room: Element) => {
      const roomId = (room as SVGPathElement).id;
      const hasLight = lampDevices.some(l => l.on && l.room === roomId);
      
      if (acDevice && acDevice.on) {
        // 에어컨 ON: 시원한 느낌 (청록/파란 톤)
        if (hasLight) {
          // 조명 + 에어컨: 밝고 시원한 느낌
          gsap.to(room, {
            duration: 0.3,
            filter: 'brightness(1.2) saturate(1.5) hue-rotate(-20deg)',
            ease: 'none',
          });
        } else {
          // 에어컨만: 시원한 느낌
          gsap.to(room, {
            duration: 0.3,
            filter: 'brightness(0.7) hue-rotate(-20deg)',
            ease: 'none',
          });
        }
      } else if (acDevice && !acDevice.on) {
        // 에어컨 OFF: 일반 상태로 복귀 (이미 조명 설정에서 처리됨)
      }
    });

    // 얼음 결정 아이콘 표시
    const iceCrystal = svgRef.current!.querySelector('#ice-crystal');
    if (iceCrystal && acDevice) {
      gsap.to(iceCrystal, {
        duration: 0.3,
        opacity: acDevice.on ? 1 : 0,
        scale: acDevice.on ? 1 : 0.8,
        ease: 'power2.out'
      });
    }

  }, [devices]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svgEl = svgRef.current;

    // 초기 상태 설정
    gsap.set(['.item', '.place', '#ground', '#smile'], {
      transformOrigin: 'center'
    });

    // 모든 방을 초기에 적당히 밝게 설정
    const initialRooms = svgRef.current.querySelectorAll('#house > path[id]');
    initialRooms.forEach((room: Element) => {
      gsap.set(room, {
        filter: 'brightness(0.8)'
      });
    });

    // 모든 아이템을 먼저 화면 아래(y: 400)에 배치 (조명 포함)
    gsap.set('.item', { autoAlpha: 1, y: 400, x: 0 });
    
    const tlThrowItems = gsap.timeline();
    const tlEnd = gsap.timeline({ paused: true });

    // 모든 아이템을 위로 올림 (조명 포함)
    const allItems = document.querySelectorAll('.item');
    allItems.forEach((item, index) => {
      tlThrowItems.to(item, {
        duration: 0.35,
        y: 0,
        ease: 'elastic.out(0.3)'
      }, index * 0.1);
    });

    tlEnd.to('#ground', 0.55, {
      morphSVG: '#smile',
      delay: 1.05
    });


    // Helper 함수
    const cursorHide = () => {
      svgEl.classList.add('no-cursor');
    };
    const cursorShow = () => {
      svgEl.classList.remove('no-cursor');
    };
    const zoomIn = (viewBox: string) => {
      gsap.to(svgEl, {
        duration: 0.95,
        attr: { viewBox },
        ease: 'power3.out'
      });
    };
    const zoomOut = () => {
      gsap.to(svgEl, {
        duration: 1.15,
        attr: { viewBox: '0 0 500 500' },
        ease: 'power3.out'
      });
    };

    // Draggable 생성 (모든 아이템 포함)
    const s = 4;
    const instances = Draggable.create('.item', {
      bounds: window,
      throwProps: true,
      snap: {
        x: (v: number) => Math.round(v / s) * s,
        y: (v: number) => Math.round(v / s) * s
      },

      onDrag: function () {
        const hitTarget = this.target.getAttribute('data-item');
        const room = this.target.getAttribute('data-room');
        if (!hitTarget || !room) return;

        // 아이템 확대/축소
        if (this.hitTest(`#${room}`, '85%')) {
          gsap.to(`.item-${hitTarget}`, {
            duration: 0.6,
            scale: 1.05,
            ease: 'bounce.out'
          });

          // GSAP로 place 애니메이션 (원본처럼)
          // scale과 opacity를 동시에 적용하되, transform 속성을 명시적으로 지정
          gsap.to(`.place-${hitTarget}`, {
            duration: 0.35,
            opacity: 0,
            scale: 0,
            ease: 'power2.out',
            transformOrigin: 'center center'
          });
        } else {
          gsap.to(`.item-${hitTarget}`, {
            duration: 0.4,
            scale: 1,
            ease: 'bounce.out'
          });

          // GSAP로 place 애니메이션
          gsap.to(`.place-${hitTarget}`, {
            duration: 0.3,
            opacity: 1,
            scale: 1,
            ease: 'power2.out',
            transformOrigin: 'center center'
          });
        }

        // 확대/축소 뷰박스
        if (this.hitTest(`#${room}`, '50%')) {
          cursorHide();
          if (rooms[room]) zoomIn(rooms[room].viewBox);
        } else {
          cursorShow();
          zoomOut();
        }
      },

      onDragEnd: function () {
        cursorShow();
        zoomOut();

        const hitTarget = this.target.getAttribute('data-item');
        const room = this.target.getAttribute('data-room');
        const dirty = +this.target.getAttribute('data-dirty') || 0;
        if (!hitTarget || !room) return;

        if (this.hitTest(`#${room}`, '70%') && !dirty) {
          rooms[room].value++;
          rooms.totalItems++;
          this.target.setAttribute('data-dirty', '1');
        } else if (!this.hitTest(`#${room}`, '70%') && dirty) {
          rooms[room].value--;
          rooms.totalItems--;
          this.target.setAttribute('data-dirty', '0');
        }

        if (rooms[room].value >= rooms[room].items) {
          gsap.to(`#${room}`, {
            duration: 0.85,
            fill: rooms[room].fill,
            ease: 'back.out'
          });
        }

        if (rooms.totalItems >= 25) { // Total items: dressingroom(4) + livingroom(5) + kitchen(4) + bedroom(4) + bathroom(4) + cabinet(4) + tv(1) = 25
          tlEnd.play();
        }
      }
    });

    instancesRef.current = instances;

    // cleanup
    return () => {
      instances.forEach(i => i.kill());
    };
  }, []);

  // rooms.totalItems 변경 감지하여 게임 완료 처리
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (rooms.totalItems >= 25 && !gameComplete) { // Total items: 25
        setGameComplete(true);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, [gameComplete]);

  const skipToEnd = () => {
    if (!svgRef.current) return;

    setGameComplete(true);

    const items = svgRef.current.querySelectorAll('.item');
    let completedCount = 0;
    
    items.forEach((item) => {
      const hitTarget = item.getAttribute('data-item');
      const room = item.getAttribute('data-room');
      if (!hitTarget || !room) return;

      // 해당 .place의 위치 가져오기
      const placeEl = svgRef.current!.querySelector(`.place-${hitTarget}`) as SVGGraphicsElement;
      if (placeEl) {
        // GSAP Draggable 인스턴스 찾기
        const draggableInstance = instancesRef.current.find(inst => inst.target === item);
        
        if (draggableInstance) {
          // Draggable 비활성화
          draggableInstance.disable();
          
          // place와 item의 BBox로 위치 계산 (단순화)
          const placeBBox = placeEl.getBBox();
          const placeCenterX = placeBBox.x + placeBBox.width / 2;
          const placeCenterY = placeBBox.y + placeBBox.height / 2;
          
          const itemBBox = (item as SVGGraphicsElement).getBBox();
          const itemCenterX = itemBBox.x + itemBBox.width / 2;
          const itemCenterY = itemBBox.y + itemBBox.height / 2;
          
          // 이동 거리
          const dx = placeCenterX - itemCenterX;
          const dy = placeCenterY - itemCenterY;
          
          // 현재 GSAP transform 가져오기
          const gsTransform = (item as any)._gsTransform || { x: 0, y: 0 };
          
          // 새로운 절대 위치로 이동
          gsap.to(item, {
            duration: 1,
            x: gsTransform.x + dx,
            y: gsTransform.y + dy,
            ease: 'back.out(1.7)',
            onComplete: () => {
              // place 애니메이션
              gsap.to(`.place-${hitTarget}`, {
                duration: 0.3,
                opacity: 0,
                scale: 0,
                ease: 'power2.out'
              });
              
              // 상태 업데이트
              const dirty = item.getAttribute('data-dirty');
              if (!dirty || dirty === '0') {
                const roomName = item.getAttribute('data-room');
                if (roomName && rooms[roomName]) {
                  rooms[roomName].value++;
                  rooms.totalItems++;
                }
              }
              item.setAttribute('data-dirty', '1');
              
              completedCount++;
              // 모든 가구 이동 완료 후 방 색칠
              if (completedCount === items.length) {
                Object.keys(rooms).forEach((roomName) => {
                  if (rooms[roomName].items > 0) {
                    gsap.to(`#${roomName}`, {
                      duration: 0.85,
                      fill: rooms[roomName].fill,
                      ease: 'back.out'
                    });
                  }
                });

                // 마지막 애니메이션 - 줌아웃 + 미소 효과
                gsap.to('svg', { 
                  duration: 1.5, 
                  attr: { viewBox: '0 0 500 500' }, 
                  ease: 'power2.inOut' 
                });
                
                setTimeout(() => {
                  const tlEnd = gsap.timeline();
                  tlEnd.to('#ground', 0.55, {
                    morphSVG: '#smile',
                    delay: 1.05
                  });
                }, 800);
              }
            }
          });
        }
      }
    });
  };

  return (
    <div className="house-layout">
      <EnergyPanel devices={devices} setDevices={setDevices} gameComplete={gameComplete} />
      <StatusBar devices={devices} gameComplete={gameComplete} />
      <div className="house-main">
        <HouseSVG ref={svgRef} />
        {!gameComplete && (
          <button 
            className="skip-button" 
            onClick={skipToEnd}
          >
            건너뛰기
          </button>
        )}
        {gameComplete && (
          <button 
            className="data-panel-toggle" 
            onClick={() => setShowDataPanel(!showDataPanel)}
          >
            {showDataPanel ? '📊 패널 숨기기' : '📊 자료구조 보기'}
          </button>
        )}
      </div>
      <DataStructurePanel 
        devices={devices} 
        powerHistory={powerHistory} 
        gameComplete={gameComplete && showDataPanel}
        onClose={() => setShowDataPanel(false)}
      />
    </div>
  );
};

export default HouseGame;
