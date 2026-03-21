import React, { useState, useRef, useEffect } from "react";
import { chatWithSystemAssistant } from "../services/geminiService";

const AssistantChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Welcome to VoltPC Engineering. I'm BOT-01. How can I assist with your build today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setLoading(true);

    try {
      const history = messages
        .filter((m, idx) =>
          idx === 0 && m.role === "assistant" ? false : true,
        )
        .map((m) => ({
          role: m.role === "user" ? "user" : "model",
          parts: [{ text: m.text }],
        }));
      const reply = await chatWithSystemAssistant(history, userMsg);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: reply || "System error. Recalibrating..." },
      ]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "Critical Error: Unable to establish stable connection to the LLM.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-[85px] right-4 md:bottom-6 md:right-6 z-[100]">
      {isOpen ? (
        <div className="w-[calc(100vw-32px)] sm:w-[380px] h-[500px] sm:h-[550px] bg-surface-dark/95 backdrop-blur-xl border border-primary/30 rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-300">
          <div className="p-5 bg-gradient-to-r from-primary to-[#6a19b0] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="size-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <span className="material-symbols-outlined text-white text-xl">
                  smart_toy
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-black text-xs uppercase tracking-[0.2em] text-white">
                  System Assistant
                </span>
                <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest flex items-center gap-1">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Node-01 Active
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="size-8 rounded-full hover:bg-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all"
            >
              <span className="material-symbols-outlined text-xl">close</span>
            </button>
          </div>

          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-5 space-y-6 scroll-smooth custom-scrollbar bg-[radial-gradient(circle_at_top,rgba(123,29,205,0.05)_0%,transparent_100%)]"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {m.role === "assistant" && (
                  <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/20">
                    <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-white rounded-tr-none shadow-glow text-right"
                      : "bg-white/5 text-gray-200 border border-white/10 rounded-tl-none"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                  <span className="material-symbols-outlined text-primary text-lg">bolt</span>
                </div>
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/10 flex gap-1.5 items-center">
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-duration:0.8s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-5 bg-black/40 border-t border-white/10 backdrop-blur-md">
            <div className="relative group">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about performance..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl pl-5 pr-14 py-3.5 text-sm focus:border-primary focus:ring-1 focus:ring-primary transition-all text-white outline-none placeholder:text-gray-500"
              />

              <button
                disabled={loading}
                onClick={handleSend}
                className="absolute right-2 top-2 size-10 bg-primary hover:bg-[#6a19b0] text-white rounded-xl shadow-lg hover:shadow-glow transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group-hover:scale-105"
              >
                <span className="material-symbols-outlined text-xl">send</span>
              </button>
            </div>
            <p className="mt-3 text-[9px] text-center text-gray-500 font-bold uppercase tracking-[0.2em]">
              Powered by VoltPC Neural Engine
            </p>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 md:w-16 md:h-16 bg-primary rounded-full flex items-center justify-center shadow-glow hover:shadow-glow-hover hover:scale-110 transition-all duration-300 group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
          <span className="material-symbols-outlined text-white text-2xl md:text-3xl group-hover:rotate-12 transition-transform relative z-10">
            smart_toy
          </span>
        </button>
      )}
    </div>
  );
};

export default AssistantChat;

