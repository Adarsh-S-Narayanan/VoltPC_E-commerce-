import React from "react";

const Toast = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-primary text-white px-8 py-4 rounded-xl shadow-glow font-bold uppercase tracking-widest text-sm animate-in fade-in slide-in-from-bottom-4">
      {message}
    </div>
  );
};

export default Toast;
