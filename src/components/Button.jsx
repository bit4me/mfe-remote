import React from "react";
import "./Button.css";

const Button = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 transform hover:-translate-y-0.5"
    >
      {children || "Remote Button dsafsd"}
    </button>
  );
};

export default Button;
