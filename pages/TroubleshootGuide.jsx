import React, { useState } from "react";

const TroubleshootGuide = ({ onBack }) => {
  const [activeCategory, setActiveCategory] = useState(null);

  const categories = [
    {
      id: "power",
      title: "Power & Boot Issues",
      icon: "power_settings_new",
      issues: [
        {
          q: "System won't turn on at all",
          a: "Ensure the PSU switch (on the back of the case) is in the 'I' position. Check that the power cable is firmly seated in both the wall and the PSU. Try a different wall outlet."
        },
        {
          q: "PC turns on but no display (No POST)",
          a: "Reseat your RAM modules—ensure they 'click' into place. Verify the monitor cable is plugged into the GPU, not the motherboard. Check for any debug LEDs on your motherboard."
        },
        {
          q: "Random shutdowns or restarts",
          a: "Check for loose power cables inside the case (24-pin ATX and 8-pin CPU). Ensure your CPU temperatures aren't exceeding 95°C under load."
        }
      ]
    },
    {
      id: "display",
      title: "Display & Graphics",
      icon: "monitor",
      issues: [
        {
          q: "Screen flickering or artifacts",
          a: "Update your GPU drivers to the latest version. Try a different DisplayPort or HDMI cable. Lower your refresh rate slightly to see if the cable is the bottleneck."
        },
        {
          q: "Low FPS in games",
          a: "Ensure 'High Performance' power plan is enabled in Windows. Check if 'Game Mode' is on. Verify that the GPU is in the primary PCIe x16 slot."
        }
      ]
    },
    {
      id: "thermal",
      title: "Thermals & Cooling",
      icon: "ac_unit",
      issues: [
        {
          q: "High CPU/GPU temperatures",
          a: "Check if the fans are spinning correctly. Ensure there is adequate clear space around the case intakes. Clean any dust filters with compressed air."
        },
        {
          q: "Fans are too loud",
          a: "Adjust your fan curves in the BIOS or using software like FanControl. Ensure 'Silent' or 'Standard' profile is selected if not overclocking."
        }
      ]
    },
    {
      id: "rgb",
      title: "RGB & Software",
      icon: "palette",
      issues: [
        {
          q: "RGB lights are not syncing",
          a: "Ensure the software (iCUE, Armoury Crate, etc.) is updated. Check if the RGB header is firmly connected to the motherboard."
        },
        {
          q: "Blue Screen of Death (BSOD)",
          a: "Note the error code (e.g., WHEA_UNCORRECTABLE_ERROR). This often points to unstable overclocks or failing storage. Try resetting BIOS to defaults."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                Self-Service Portal
              </span>
              <div className="flex items-center gap-1.5 text-primary text-[10px] font-bold uppercase tracking-widest opacity-70">
                <span className="material-symbols-outlined text-sm">settings_suggest</span>
                Engineer Verified
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none transition-colors">
              Troubleshoot <span className="text-primary italic">Guide</span>
            </h1>
            <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl font-medium transition-colors">
              Our engineering team has documented solutions for the most common technical hurdles. 
              Search by category to restore your system to peak operational status.
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-500 group border border-black/5 dark:border-white/5 active:scale-95"
          >
            ← Back to Portal
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id === activeCategory ? null : cat.id)}
              className={`p-6 rounded-3xl border transition-all duration-300 text-left group ${
                activeCategory === cat.id
                  ? "bg-primary border-primary text-white shadow-glow"
                  : "bg-gray-50 dark:bg-zinc-900/50 border-gray-200 dark:border-white/5 text-gray-900 dark:text-white hover:border-primary/50"
              }`}
            >
              <span className={`material-symbols-outlined text-3xl mb-4 block transition-transform group-hover:scale-110 ${
                activeCategory === cat.id ? "text-white" : "text-primary"
              }`}>
                {cat.icon}
              </span>
              <h3 className="font-black uppercase tracking-tight text-sm">{cat.title}</h3>
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {categories
            .filter((c) => !activeCategory || c.id === activeCategory)
            .map((cat) => (
              <div key={cat.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {!activeCategory && (
                  <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4 mt-8 flex items-center gap-2">
                    <span className="w-8 h-px bg-primary/30"></span>
                    {cat.title}
                  </h2>
                )}
                <div className="grid gap-4">
                  {cat.issues.map((issue, iidx) => (
                    <div
                      key={iidx}
                      className="bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 rounded-[2rem] p-8 hover:border-primary/20 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-xs shrink-0 mt-1">
                          Q
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 dark:text-white transition-colors">
                          {issue.q}
                        </h4>
                      </div>
                      <div className="mt-6 flex items-start gap-4">
                        <div className="size-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-black text-xs shrink-0 mt-1">
                          A
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                          {issue.a}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>

        {/* Support CTA */}
        <div className="mt-20 p-12 rounded-[3rem] bg-gradient-to-br from-primary to-primary-dark text-white relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
            <span className="material-symbols-outlined text-[200px]">engineering</span>
          </div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Still Encountering Resistance?</h2>
            <p className="text-white/70 font-medium mb-8 leading-relaxed">
              If these guides haven't resolved your anomaly, our veteran engineers are standing by. 
              We offer real-time debugging for any VoltPC build.
            </p>
            <button className="px-8 py-4 bg-white text-primary font-black uppercase tracking-widest rounded-2xl hover:bg-opacity-90 transition-all shadow-xl active:scale-95">
              Contact Engineer Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TroubleshootGuide;
