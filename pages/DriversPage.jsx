import React from "react";

const DriversPage = ({ onBack }) => {
  const driverCategories = [
    {
      title: "Graphics Processing Units",
      icon: "monitor",
      description: "Essential drivers for maximum gaming performance and stability.",
      links: [
        { name: "NVIDIA GeForce Drivers", url: "https://www.nvidia.com/Download/index.aspx", color: "bg-green-500/10 text-green-500 border-green-500/20" },
        { name: "AMD Radeon Software", url: "https://www.amd.com/en/support", color: "bg-red-500/10 text-red-500 border-red-500/20" },
        { name: "Intel Graphics Drivers", url: "https://www.intel.com/content/www/us/en/download-center/home.html", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" }
      ]
    },
    {
      title: "Motherboard & Chipset",
      icon: "memory",
      description: "Core system drivers for chipset, audio, and network controllers.",
      links: [
        { name: "ASUS Download Center", url: "https://www.asus.com/support/Download-Center/", color: "bg-blue-400/10 text-blue-400 border-blue-400/20" },
        { name: "MSI Support Center", url: "https://www.msi.com/support/download", color: "bg-red-600/10 text-red-600 border-red-600/20" },
        { name: "Gigabyte Download", url: "https://www.gigabyte.com/Support/Download-Center", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
        { name: "ASRock Support", url: "https://www.asrock.com/support/index.asp", color: "bg-gray-400/10 text-gray-400 border-gray-400/20" }
      ]
    },
    {
      title: "Peripherals & Eco-system",
      icon: "mouse",
      description: "Control software for RGB, macros, and device customization.",
      links: [
        { name: "Corsair iCUE", url: "https://www.corsair.com/us/en/s/downloads", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
        { name: "Logitech G HUB", url: "https://www.logitechg.com/en-us/innovation/g-hub.html", color: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
        { name: "Razer Synapse", url: "https://www.razer.com/synapse-3", color: "bg-lime-500/10 text-lime-500 border-lime-500/20" }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      {/* Background Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                Resource Hub
              </span>
              <div className="flex items-center gap-1.5 text-green-500 text-[10px] font-bold uppercase tracking-widest">
                <span className="material-symbols-outlined text-sm">verified</span>
                Verified Links
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none transition-colors">
              Driver <span className="text-primary italic">Repository</span>
            </h1>
            <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl font-medium transition-colors">
              Access official manufacturers' driver portals for your VoltPC components. 
              Keeping your system updated ensures peak performance and hardware longevity.
            </p>
          </div>
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-black/5 dark:bg-white/5 text-gray-900 dark:text-white font-bold uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-500 group border border-black/5 dark:border-white/5 active:scale-95"
          >
            ← Back to Portal
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {driverCategories.map((category, idx) => (
            <div
              key={idx}
              className="group p-8 rounded-[32px] bg-gray-50 dark:bg-zinc-900/50 border border-gray-200 dark:border-white/5 hover:border-primary/30 transition-all duration-500 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-700">
                <span className="material-symbols-outlined text-6xl text-primary">{category.icon}</span>
              </div>
              
              <div className="size-14 rounded-2xl bg-white dark:bg-black flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-sm mb-6 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-500">
                <span className="material-symbols-outlined text-3xl text-primary">{category.icon}</span>
              </div>

              <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2 transition-colors">
                {category.title}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed transition-colors">
                {category.description}
              </p>

              <div className="flex flex-col gap-3">
                {category.links.map((link, lIdx) => (
                  <a
                    key={lIdx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 hover:scale-[1.02] active:scale-95 group/link ${link.color}`}
                  >
                    <span className="font-bold text-sm tracking-tight">{link.name}</span>
                    <span className="material-symbols-outlined text-lg opacity-50 group-hover/link:opacity-100 transition-opacity">open_in_new</span>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-16 p-8 rounded-3xl bg-primary/5 border border-primary/10 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium max-w-3xl mx-auto leading-relaxed uppercase tracking-widest">
            <span className="text-primary font-black">Warning:</span> Always ensure you are downloading drivers directly from the official manufacturer's website. VoltPC is not responsible for 3rd party software. For custom professional overclocking profiles, please contact your individual VoltPC tech lead.
          </p>
        </div>
      </div>
    </div>
  );
};

export default DriversPage;
