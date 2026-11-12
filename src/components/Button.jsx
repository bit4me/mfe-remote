import React from "react";

export default function Button({ children = "Remote Button", onClick }) {
  return (
    <button
      onClick={() => {
        console.log("🔥 [REMOTE] Button clicked!");
        alert("Remote Webpack App 호출 성공!");
      }}
      className="
        rounded-lg bg-indigo-600
        px-5 py-3 font-semibold text-white
        transition-colors hover:bg-indigo-700
      "
    >
      {children}
    </button>
  );
}
