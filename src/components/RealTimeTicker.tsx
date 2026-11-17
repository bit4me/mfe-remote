// src/Ticker/RealTimeTicker.tsx
import React, { useState, useEffect, useRef, useId } from "react";
import { io, Socket } from "socket.io-client";
import "./Ticker.css";

interface TickerItem {
  name: string;
  price: string;
  change: string;
  isUp: boolean;
}

// 💡 속성(Props) 인터페이스 선언: showSettings 옵션을 추가합니다.
interface RealTimeTickerProps {
  id?: string;
  showSettings?: boolean;
  initialSpeed?: number;
  initialHoverMode?: "pause" | "slow";
  initialLoopMode?: "continuous" | "reset";
  initialGapWidth?: number;
}

const SOCKET_SERVER_URL = "http://192.168.0.8:8006";

// 💡 [향후 확장용] 전광판의 시작 부분에 들어갈 엘리먼트
const StartElement: React.FC = () => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0 10px" /* 패딩 축소 */,
        color: "#00c73c",
        fontWeight: "bold",
        fontSize: "11px" /* 폰트 크기 축소 */,
        backgroundColor: "#eef1f4",
        height: "100%",
        borderRadius: "2px",
        margin: "0 6px",
        lineHeight: "20px",
      }}
    >
      [모두가 즐거운 투자]
    </div>
  );
};

// 💡 [향후 확장용] 전광판의 끝 부분에 들어갈 엘리먼트
const EndElement: React.FC = () => {
  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0 10px" /* 패딩 축소 */,
        color: "#ff4c4c",
        fontWeight: "bold",
        fontSize: "11px" /* 폰트 크기 축소 */,
        backgroundColor: "#eef1f4",
        height: "100%",
        borderRadius: "2px",
        margin: "0 6px",
        lineHeight: "20px",
      }}
    >
      <p>
        Copyright &copy; {new Date().getFullYear()} 이신혜 이신혜 이신혜 이신혜
        이신혜 이신혜 이신혜 이신혜 이신혜. All rights reserved.
      </p>
    </div>
  );
};

// 💡 매개변수에서 showSettings의 기본값을 true로 정의합니다.
const RealTimeTicker: React.FC<RealTimeTickerProps> = ({
  showSettings = true,
  initialSpeed = 3,
  initialHoverMode = "slow",
  initialLoopMode = "reset",
  initialGapWidth = 300,
}) => {
  // 💡 [해결 1] 상/하단 두 개 배치 시 라디오 버튼이 뒤엉키지 않도록 컴포넌트별 고유 식별자 생성
  const uniqueId = useId();

  const [tickerData, setTickerData] = useState<TickerItem[]>([]);
  const [connected, setConnected] = useState<boolean>(false);

  const [speed, setSpeed] = useState<number>(initialSpeed);
  const [selectedStock, setSelectedStock] = useState<TickerItem | null>(null);

  const [hoverMode, setHoverMode] = useState<"pause" | "slow">(
    initialHoverMode,
  );
  const [loopMode, setLoopMode] = useState<"continuous" | "reset">(
    initialLoopMode,
  );
  const [gapWidth, setGapWidth] = useState<number>(initialGapWidth);

  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const offsetRef = useRef<number>(0);
  const isHoveredRef = useRef<boolean>(false);
  const prevLoopModeRef = useRef<"continuous" | "reset">("continuous");

  // 💡 [해결 2] 초당 60회 도는 무한 애니메이션 루프 내에서 최신 리액트 상태를 지연 없이 매핑할 거울 레퍼런스
  const stateRef = useRef({ speed, hoverMode, loopMode, gapWidth });

  // 상태가 사용자에 의해 클릭/조작되어 바뀔 때마다 거울(Ref) 값을 가볍고 빠르게 동기화합니다.
  useEffect(() => {
    stateRef.current = { speed, hoverMode, loopMode, gapWidth };
  }, [speed, hoverMode, loopMode, gapWidth]);

  // 외부 프롭스 변경 시 상태를 한 번 초기화해주는 로직 (사용자 실시간 클릭을 해치지 않게 작동)
  useEffect(() => {
    setSpeed(initialSpeed);
  }, [initialSpeed]);
  useEffect(() => {
    setHoverMode(initialHoverMode);
  }, [initialHoverMode]);
  useEffect(() => {
    setLoopMode(initialLoopMode);
  }, [initialLoopMode]);
  useEffect(() => {
    setGapWidth(initialGapWidth);
  }, [initialGapWidth]);

  // 웹소켓 연결
  useEffect(() => {
    const socket: Socket = io(SOCKET_SERVER_URL);
    socket.on("connect", () => setConnected(true));
    socket.on("ticker_update", (updatedData: TickerItem[]) =>
      setTickerData(updatedData),
    );
    socket.on("disconnect", () => setConnected(false));
    return () => {
      socket.disconnect();
    };
  }, []);

  // 모드 전환 시 위치 보정
  useEffect(() => {
    if (prevLoopModeRef.current !== loopMode) {
      if (loopMode === "reset" && containerRef.current) {
        offsetRef.current = containerRef.current.clientWidth;
      } else {
        offsetRef.current = 0;
      }
      prevLoopModeRef.current = loopMode;
    }
  }, [loopMode]);

  // 프레임 루프 롤링 엔진
  useEffect(() => {
    if (tickerData.length === 0) return;

    const renderLoop = () => {
      if (!contentRef.current || !containerRef.current) {
        requestRef.current = requestAnimationFrame(renderLoop);
        return;
      }

      // 💡 무한 루프 내부는 상태 레퍼런스 거울(stateRef)을 온전히 바라보게 하여 리액트 렌더링 락(Lock)을 방지합니다.
      const currentConfig = stateRef.current;

      let currentStep = currentConfig.speed * 0.5;
      if (isHoveredRef.current) {
        if (currentConfig.hoverMode === "pause") currentStep = 0;
        else currentStep = currentConfig.speed * 0.5 * 0.2;
      }

      offsetRef.current -= currentStep;
      const items = contentRef.current.children;

      if (currentConfig.loopMode === "continuous") {
        if (items.length >= 2) {
          const firstSetWidth = (
            items[0] as HTMLDivElement
          ).getBoundingClientRect().width;
          if (Math.abs(offsetRef.current) >= firstSetWidth) {
            offsetRef.current = offsetRef.current + firstSetWidth;
          }
        }
      } else {
        if (items.length >= 2) {
          const firstSetWidth = (
            items[0] as HTMLDivElement
          ).getBoundingClientRect().width;
          const gapWidthVal = (
            items[1] as HTMLDivElement
          ).getBoundingClientRect().width;
          const resetThreshold = firstSetWidth + gapWidthVal;

          if (Math.abs(offsetRef.current) >= resetThreshold) {
            offsetRef.current = offsetRef.current + resetThreshold;
          }
        }
      }

      contentRef.current.style.transform = `translateX(${offsetRef.current}px)`;
      requestRef.current = requestAnimationFrame(renderLoop);
    };

    requestRef.current = requestAnimationFrame(renderLoop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [tickerData]); // 의존성 배열에서 변수들을 제거하여 렌더 루프 충돌 차단

  if (tickerData.length === 0) {
    return (
      <div
        style={{
          padding: "15px",
          fontSize: "12px",
          color: "#666",
          textAlign: "center",
        }}
      >
        금융 시세 수신 중...
      </div>
    );
  }

  const TickerTrackSet = () => (
    <div style={{ display: "flex", alignItems: "center" }}>
      <StartElement />
      {tickerData.map((item, index) => (
        <div
          key={`${item.name}-${index}`}
          className={`ticker-item ${item.isUp ? "up-card" : "down-card"}`}
          onClick={() => setSelectedStock(item)}
        >
          <span className="ticker-name">{item.name}</span>
          <span className="ticker-price">{item.price}</span>
          <span className="ticker-change">
            {item.isUp ? "▲" : "▼"} {item.change}
          </span>
        </div>
      ))}
      <EndElement />
    </div>
  );

  return (
    <div className="ticker-container">
      {/* 💡 showSettings 조건부 스코프 처리 */}
      {showSettings && (
        <div className="ticker-controls">
          <span
            style={{
              color: connected ? "#00c73c" : "#f44336",
              fontWeight: "bold",
            }}
          >
            {connected ? "● 바이낸스 실시간 시세 연동" : "○ 연결 유실됨"}
          </span>

          <div className="controls-right">
            {/* 회전 방식 */}
            {/* 💡 고유 uniqueId 결합으로 라디오 그룹 완전 분리 보장 */}
            <div
              className="mode-selection"
              style={{ borderRight: "1px solid #e5e5e5", paddingRight: "12px" }}
            >
              <span style={{ fontWeight: "bold", marginRight: "4px" }}>
                회전 방식:
              </span>
              <label>
                <input
                  type="radio"
                  name={`loop-mode-${uniqueId}`}
                  value="continuous"
                  checked={loopMode === "continuous"}
                  onChange={() => setLoopMode("continuous")}
                />
                무한 이어붙이기
              </label>
              <label>
                <input
                  type="radio"
                  name={`loop-mode-${uniqueId}`}
                  value="reset"
                  checked={loopMode === "reset"}
                  onChange={() => setLoopMode("reset")}
                />
                우측 끝 재진입
              </label>
            </div>

            {/* 공백 너비 슬라이더 */}
            {loopMode === "reset" && (
              <div
                className="slider-box"
                style={{
                  borderRight: "1px solid #e5e5e5",
                  paddingRight: "12px",
                }}
              >
                <label
                  htmlFor={`gap-slider-${uniqueId}`}
                  style={{ fontWeight: "bold" }}
                >
                  공백 너비: {gapWidth}px
                </label>
                <input
                  id={`gap-slider-${uniqueId}`}
                  type="range"
                  min="50"
                  max="800"
                  step="50"
                  value={gapWidth}
                  onChange={(e) => setGapWidth(Number(e.target.value))}
                />
              </div>
            )}

            {/* 마우스 반응 */}
            {/* 💡 고유 uniqueId 결합으로 마우스 반응 그룹 독립 구동 */}
            <div
              className="mode-selection"
              style={{ borderRight: "1px solid #e5e5e5", paddingRight: "12px" }}
            >
              <span style={{ fontWeight: "bold", marginRight: "4px" }}>
                마우스 반응:
              </span>
              <label>
                <input
                  type="radio"
                  name={`hover-mode-${uniqueId}`}
                  value="slow"
                  checked={hoverMode === "slow"}
                  onChange={() => setHoverMode("slow")}
                />
              </label>
              감속
              <label>
                <input
                  type="radio"
                  name={`hover-mode-${uniqueId}`}
                  value="pause"
                  checked={hoverMode === "pause"}
                  onChange={() => setHoverMode("pause")}
                />
              </label>
              멈춤
            </div>

            {/* 속도 조절 */}
            <div className="slider-box">
              <label
                htmlFor={`speed-slider-${uniqueId}`}
                style={{ fontWeight: "bold" }}
              >
                속도: {speed}
              </label>
              <input
                id={`speed-slider-${uniqueId}`}
                type="range"
                min="1"
                max="10"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
              />
            </div>
          </div>
        </div>
      )}

      {/* 전광판 배너 본체 */}
      <div
        className="IndexTicker_marquee-wrap"
        ref={containerRef}
        onMouseEnter={() => {
          isHoveredRef.current = true;
        }}
        onMouseLeave={() => {
          isHoveredRef.current = false;
        }}
      >
        <div className="IndexTicker_marquee-content" ref={contentRef}>
          {loopMode === "continuous" ? (
            // 🔄 [무한 이어붙이기 모드]: 트랙 세트를 2번 연속 배치하여 경계면 연결
            <>
              <TickerTrackSet />
              <TickerTrackSet />
            </>
          ) : (
            // 🚀 [우측 끝 재진입 모드]: 트랙 세트 사이에 가변 공백 컴포넌트 삽입
            <>
              <TickerTrackSet />
              {/* 가변 공백 갭 확보 */}
              <div
                style={{
                  width: `${gapWidth}px`,
                  minWidth: `${gapWidth}px`,
                  height: "10px",
                }}
              />
              <TickerTrackSet />
            </>
          )}
        </div>
      </div>

      {/* 상세 정보 모달 */}
      {selectedStock && (
        <div
          className="ticker-modal-overlay"
          onClick={() => setSelectedStock(null)}
        >
          <div
            className="ticker-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>{selectedStock.name} 종목 동향</h3>
            <div className="modal-info-row">
              <span>현재가</span>
              <span className={selectedStock.isUp ? "text-up" : "text-down"}>
                {selectedStock.price}
              </span>
            </div>
            <div className="modal-info-row">
              <span>전일대비</span>
              <span className={selectedStock.isUp ? "text-up" : "text-down"}>
                {selectedStock.isUp ? "▲ " : "▼ "}
                {selectedStock.change}
              </span>
            </div>
            <p className="modal-desc">
              본 정보는 실시간 바이낸스(Binance) 웹소켓 스트리밍 기반
              지표입니다.
            </p>
            <button
              className="modal-close-btn"
              onClick={() => setSelectedStock(null)}
            >
              창 닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeTicker;
