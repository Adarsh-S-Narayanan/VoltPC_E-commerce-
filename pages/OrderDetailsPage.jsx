import React, { useState } from "react";

const OrderDetailsPage = ({ order, onBack }) => {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "builder",
      text: `Greetings. I'm ${order.builder.name}. I've just finished the initial thermal paste application and I'm moving onto cable management. Any specific lighting preferences for the RGB controller?`,
    },
  ]);

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    setMessages([...messages, { role: "user", text: chatInput }]);
    setChatInput("");
  };

  const statusSteps = [
    "Validated",
    "Assembling",
    "Testing",
    "QA Pass",
    "Shipped",
    "Delivered",
  ];
  const currentStatusIndex = statusSteps.indexOf(order.status);

  return (
    <div className="pt-24 min-h-screen bg-background-light dark:bg-background-dark max-w-[1440px] mx-auto px-6 pb-20 transition-colors duration-300">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-primary transition-colors mb-8 group"
      >
        <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
          arrow_back
        </span>
        <span className="text-xs font-black uppercase tracking-widest">
          Return to Dashboard
        </span>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <header className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-3xl p-10 relative overflow-hidden shadow-light-card dark:shadow-none transition-all duration-300">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter uppercase transition-colors">
                    Order: {order.id}
                  </h1>
                  <p className="text-primary text-xs font-black uppercase tracking-[0.3em] mt-1">
                    Status: {order.status}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest mb-1 transition-colors">
                    Transmission Date
                  </p>
                  <p className="text-gray-900 dark:text-white font-mono transition-colors">
                    {order.date}
                  </p>
                </div>
              </div>

              <div className="mt-12">
                <div className="flex justify-between relative">
                  <div className="absolute top-4 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/5 z-0 transition-colors"></div>
                  <div
                    className="absolute top-4 left-0 h-0.5 bg-primary z-0 transition-all duration-1000"
                    style={{
                      width: `${(currentStatusIndex / (statusSteps.length - 1)) * 100}%`,
                    }}
                  ></div>

                  {statusSteps.map((step, idx) => (
                    <div
                      key={step}
                      className="relative z-10 flex flex-col items-center gap-3"
                    >
                      <div
                        className={`size-8 rounded-full border-2 flex items-center justify-center transition-all ${
                          idx <= currentStatusIndex
                            ? "bg-primary border-primary text-white shadow-glow"
                            : "bg-white dark:bg-surface-dark border-black/10 dark:border-white/10 text-gray-300 dark:text-gray-700"
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {idx < currentStatusIndex
                            ? "check"
                            : idx === currentStatusIndex
                              ? "settings"
                              : "lock"}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-black uppercase tracking-widest text-center max-w-[60px] transition-colors ${
                          idx <= currentStatusIndex
                            ? "text-gray-900 dark:text-white"
                            : "text-gray-300 dark:text-gray-700"
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          </header>

          <section className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-3xl p-10 shadow-light-card dark:shadow-none transition-all duration-300">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-widest flex items-center gap-3 transition-colors">
              <span className="material-symbols-outlined text-primary">location_on</span>
              Shipping & Identity
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 dark:bg-black/40 rounded-xl border border-black/5 dark:border-white/5 relative">
                <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Customer Profile</p>
                <p className="text-gray-900 dark:text-white font-bold text-sm tracking-tight">{order.customerName || "N/A"}</p>
                {order.email && <p className="text-gray-500 text-sm mt-1">{order.email}</p>}
                {order.contact && <p className="text-gray-500 text-sm mt-1">{order.contact}</p>}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-black/40 rounded-xl border border-black/5 dark:border-white/5 relative">
                <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest mb-2">Destination Vector</p>
                <p className="text-gray-900 dark:text-white font-bold text-sm leading-relaxed">{order.address || "N/A"}</p>
                {order.payment && <p className="text-primary text-[10px] font-black uppercase tracking-widest mt-3">Payment: {order.payment}</p>}
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-3xl p-10 shadow-light-card dark:shadow-none transition-all duration-300">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-widest flex items-center gap-3 transition-colors">
              <span className="material-symbols-outlined text-primary">inventory_2</span>
              Rig Manifest
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {order.items.map((item) => (
                <div
                  key={item.cartId}
                  className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-black/40 rounded-2xl border border-black/5 dark:border-white/5 transition-colors"
                >
                  <div className="size-12 rounded-lg overflow-hidden bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 flex-none transition-colors">
                    <img
                      src={item.image}
                      className="w-full h-full object-cover"
                      alt={item.name}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="text-gray-900 dark:text-white text-sm font-bold truncate transition-colors">
                      {item.name}
                    </p>
                    <p className="text-gray-400 dark:text-gray-500 text-[10px] font-black uppercase tracking-widest transition-colors">
                      {item.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:col-span-1 space-y-8">
          <section className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-3xl overflow-hidden flex flex-col h-[600px] shadow-light-card dark:shadow-none transition-all duration-300">
            <div className="p-8 border-b border-black/5 dark:border-white/5 bg-gradient-to-r from-primary/5 dark:from-primary/10 to-transparent transition-colors">
              <div className="flex items-center gap-4">
                <div className="size-14 rounded-2xl overflow-hidden border-2 border-primary/30 shadow-glow">
                  <img
                    src={order.builder.avatar}
                    className="w-full h-full object-cover"
                    alt={order.builder.name}
                  />
                </div>
                <div>
                  <h3 className="text-gray-900 dark:text-white font-black uppercase tracking-widest transition-colors">
                    {order.builder.name}
                  </h3>
                  <p className="text-primary text-[10px] font-bold uppercase">
                    {order.builder.specialty}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="size-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-gray-400 dark:text-gray-500 text-[9px] font-black uppercase tracking-widest transition-colors">
                      Assigned Builder
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-black/20 custom-scrollbar transition-colors">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed transition-all ${
                      m.role === "user"
                        ? "bg-primary text-white rounded-br-none shadow-glow"
                        : "bg-white dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-black/5 dark:border-white/5 rounded-bl-none shadow-sm dark:shadow-none"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-white dark:bg-surface-dark border-t border-black/5 dark:border-white/5 transition-colors">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Message your builder..."
                  className="w-full bg-gray-100 dark:bg-black/40 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-gray-900 dark:text-white focus:border-primary outline-none transition-all"
                />

                <button
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:opacity-70 transition-opacity"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
              <p className="text-center text-[9px] text-gray-400 dark:text-gray-600 mt-4 uppercase font-black tracking-widest italic transition-colors">
                Secure encrypted tunnel active
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
