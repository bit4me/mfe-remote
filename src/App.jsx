import React from "react";
import Button from "./components/Button.jsx";
import MarqueeTicker from "./components/RealTimeTicker.tsx";

const App = () => {
  return (
    <div className="p-8 border-4 border-dashed border-indigo-500 rounded-xl m-4 bg-white">
      <h1 className="text-3xl font-extrabold text-indigo-600 mb-2">
        Remote 독립 애플리케이션
      </h1>
      <p className="text-gray-600 mb-6">
        이 영역은 Remote 프로젝트 자체 화면입니다 (Port: 5001).
      </p>
      <Button>Remote 내부에서 사용하는 버튼</Button>
      <MarqueeTicker> test </MarqueeTicker>
    </div>
  );
};

export default App;
