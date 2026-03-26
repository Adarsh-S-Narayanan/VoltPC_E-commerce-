import React, { useState } from "react";
import PageHeader from "../components/PageHeader";
import InputField from "../components/InputField";

const SupportPage = ({ onNavigate }) => {
  const [formState, setFormState] = useState("idle");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormState("sending");
    setTimeout(() => setFormState("success"), 1500);
  };

  return (
    <div className="pt-20 bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <PageHeader 
          title="MISSION CONTROL" 
          description="Technical documentation, driver repositories, and direct engineer access."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20 max-w-4xl mx-auto">
          <SupportCard
            icon="auto_repair"
            title="Troubleshooting"
            desc="Exhaustive guides for thermal optimization, BIOS tuning, and driver stability."
            onClick={() => onNavigate("troubleshoot")}
          />

          <SupportCard
            icon="download"
            title="Driver Cloud"
            desc="Access the latest firmware and utility software specifically tuned for your build serial."
            onClick={() => onNavigate("drivers")}
          />
        </div>

        <div className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-3xl p-12 relative overflow-hidden shadow-light-card dark:shadow-none transition-all duration-300">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-6 tracking-tight transition-colors">
                STILL NEED HELP?
              </h2>
              {formState === "success" ? (
                <div className="bg-primary/5 dark:bg-primary/20 border border-primary/20 dark:border-primary/40 rounded-2xl p-8 animate-in fade-in zoom-in transition-all">
                  <span className="material-symbols-outlined text-primary text-5xl mb-4">
                    check_circle
                  </span>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    TRANSMISSION RECEIVED
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Our engineering team will decrypt your message and respond
                    within 2-4 standard business hours.
                  </p>
                  <button
                    onClick={() => setFormState("idle")}
                    className="mt-6 text-primary font-bold uppercase tracking-widest text-xs hover:opacity-70 transition-opacity"
                  >
                    Submit Another Ticket
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 transition-colors">
                    Our team of hardware specialists is ready to assist with any
                    technical inquiry or configuration challenge.
                  </p>
                  <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
                    <InputField
                      required
                      placeholder="Full Name"
                    />
                    <InputField
                      required
                      type="email"
                      placeholder="Email Address"
                    />
                    <InputField
                      required
                      isTextArea
                      placeholder="Describe your issue..."
                    />
                    <button
                      disabled={formState === "sending"}
                      className="w-full bg-primary hover:bg-[#6a19b0] disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white py-4 rounded-xl font-black uppercase tracking-widest transition-all shadow-glow active:scale-95"
                    >
                      {formState === "sending"
                        ? "Sending Transmission..."
                        : "Send Transmission"}
                    </button>
                  </form>
                </>
              )}
            </div>
            <div className="hidden lg:block opacity-10 dark:opacity-50 transition-opacity">
              <span className="material-symbols-outlined text-[300px] text-primary select-none">
                support_agent
              </span>
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
};

const SupportCard = ({ icon, title, desc, onClick }) => (
  <div 
    onClick={onClick}
    className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 p-8 rounded-2xl hover:border-primary shadow-light-card dark:shadow-none transition-all group cursor-pointer"
  >
    <span className="material-symbols-outlined text-4xl text-primary mb-6 group-hover:scale-110 transition-transform inline-block">
      {icon}
    </span>
    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 uppercase tracking-tight transition-colors">
      {title}
    </h3>
    <p className="text-gray-500 dark:text-gray-400 leading-relaxed transition-colors">
      {desc}
    </p>
    <button className="mt-8 text-gray-900 dark:text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2 hover:text-primary transition-colors">
      Learn More{" "}
      <span className="material-symbols-outlined text-sm">arrow_forward</span>
    </button>
  </div>
);

export default SupportPage;
