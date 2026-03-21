import React from "react";

const BuildLab = () => {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 max-w-[1440px] mx-auto overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-center">
        <div className="relative group">
          {/* Decorative Elements */}
          <div className="absolute -inset-4 bg-primary/10 dark:bg-primary/20 rounded-[2rem] blur-2xl group-hover:bg-primary/30 transition-all duration-700"></div>

          <div className="relative bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-[2rem] p-4 overflow-hidden shadow-2xl">
            <img
              src="https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80&w=1200"
              alt="Engineering Workspace"
              className="w-full aspect-video object-cover rounded-[1.5rem] grayscale group-hover:grayscale-0 transition-all duration-700"
            />

            {/* UI Overlay Simulation */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 bg-white/90 dark:bg-black/80 backdrop-blur-xl p-3 md:p-4 rounded-2xl border border-black/5 dark:border-white/10 shadow-2xl animate-in slide-in-from-right-8 duration-1000">
              <div className="flex items-center gap-3 mb-2 md:mb-3">
                <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">
                  Thermal Probe Active
                </span>
              </div>
              <div className="space-y-2">
                <div className="h-1 w-32 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-2/3 bg-primary shadow-glow"></div>
                </div>
                <div className="h-1 w-24 bg-gray-200 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full w-1/2 bg-primary/60 shadow-glow"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <span className="text-primary text-xs font-black uppercase tracking-[0.4em] mb-4 block">
              Neural Configurator v4
            </span>
            <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter uppercase mb-6">
              THE BUILD <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary dark:to-white">
                LABORATORY
              </span>
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed max-w-xl font-light">
              Step into our virtual assembly floor. Our real-time compatibility
              engine monitors wattage, thermal clearance, and physical
              dimensions while you engineer your ultimate machine.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FeatureBox
              icon="biometrics"
              title="Expert Validation"
              desc="Every build is hand-vetted by a Master Engineer before assembly begins."
            />

            <FeatureBox
              icon="query_stats"
              title="Live Telemetry"
              desc="Simulate performance benchmarks across 50+ modern titles instantly."
            />
          </div>

          <div className="pt-6">
            <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">
                verified
              </span>
              ISO 9001 Certified Assembly Procedures
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const FeatureBox = ({ icon, title, desc }) => (
  <div className="p-6 bg-gray-50 dark:bg-white/[0.02] border border-black/5 dark:border-white/5 rounded-2xl hover:border-primary/30 transition-colors">
    <span className="material-symbols-outlined text-primary mb-4">{icon}</span>
    <h3 className="text-gray-900 dark:text-white font-black uppercase tracking-widest text-sm mb-2">
      {title}
    </h3>
    <p className="text-gray-500 text-xs leading-relaxed">{desc}</p>
  </div>
);

export default BuildLab;
