import React from "react";
import { createRoot } from "react-dom/client";
import Button from "./components/Button.jsx";
import "./standalone.css";

function App() {
  return (
    <main className="min-h-screen bg-slate-100 p-10">
      <h1 className="mb-6 text-3xl font-bold">Vite Remote Standalone</h1>

      <Button />
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
