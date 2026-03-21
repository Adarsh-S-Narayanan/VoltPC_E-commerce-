import React, { useState, useMemo } from "react";
import FeaturedPCs from "../components/FeaturedPCs";
import FilterButton from "../components/FilterButton";
import PageHeader from "../components/PageHeader";

export default function PreBuildsPage({ onConfigure, onAddToCart, prebuilts = [] }) {
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPcs = useMemo(() => {
    let result = prebuilts;
    switch (activeFilter) {
      case "GAMING":
        result = prebuilts.filter((pc) => pc.category === "GAMING");
        break;
      case "VISUAL":
        result = prebuilts.filter((pc) => pc.category === "HYBRID");
        break;
      case "AI":
        result = prebuilts.filter((pc) => pc.category === "WORKSTATION");
        break;
      case "BUDGET":
        result = prebuilts.filter((pc) => (pc.price || (pc.startingPrice || 0)) < 150000);
        break;
      case "MID":
        result = prebuilts.filter(
          (pc) => (pc.price || (pc.startingPrice || 0)) >= 150000 && (pc.price || (pc.startingPrice || 0)) < 400000,
        );
        break;
      case "HIGH":
        result = prebuilts.filter((pc) => (pc.price || (pc.startingPrice || 0)) >= 400000);
        break;
      default:
        result = prebuilts;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(pc => 
        (pc.name || pc.title || "").toLowerCase().includes(q) ||
        (pc.description || "").toLowerCase().includes(q)
      );
    }

    return result;
  }, [activeFilter, prebuilts, searchQuery]);

  return (
    <div className="pt-20 bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <PageHeader 
          title="READY TO DEPLOY" 
          description="Skip the build wait. These flagship configurations are pre-assembled, stress-tested, and ready for same-day dispatch."
        />

        {/* Search Bar */}
        <div className="mb-6 relative max-w-md">
          <input
            type="text"
            placeholder="Search pre-builds..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-surface-dark border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-11 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            search
          </span>
        </div>

        {/* Functional Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <FilterButton
            label="All Models"
            active={activeFilter === "ALL"}
            onClick={() => setActiveFilter("ALL")}
          />
          <FilterButton
            label="Elite Gaming"
            active={activeFilter === "GAMING"}
            onClick={() => setActiveFilter("GAMING")}
          />
          <FilterButton
            label="Visual Computing"
            active={activeFilter === "VISUAL"}
            onClick={() => setActiveFilter("VISUAL")}
          />
          <FilterButton
            label="AI Workstations"
            active={activeFilter === "AI"}
            onClick={() => setActiveFilter("AI")}
          />
        </div>

        <div className="flex flex-wrap gap-3 mb-12 border-t border-black/5 dark:border-white/5 pt-4 transition-colors">
          <div className="flex items-center text-[10px] font-black text-gray-400 dark:text-gray-600 uppercase tracking-widest mr-2">
            Price Tier:
          </div>
          <FilterButton
            label="Budget (<₹1.5L)"
            active={activeFilter === "BUDGET"}
            onClick={() => setActiveFilter("BUDGET")}
          />
          <FilterButton
            label="Mid Spec (₹1.5L - ₹4L)"
            active={activeFilter === "MID"}
            onClick={() => setActiveFilter("MID")}
          />
          <FilterButton
            label="High End (>₹4L)"
            active={activeFilter === "HIGH"}
            onClick={() => setActiveFilter("HIGH")}
          />
        </div>

        <FeaturedPCs onConfigure={onConfigure} onAddToCart={onAddToCart} pcs={filteredPcs} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-10 border border-black/5 dark:border-white/5 shadow-light-card dark:shadow-none hover:border-primary/50 transition-all group overflow-hidden relative">
            <div className="relative z-10">
              <span className="text-primary text-xs font-black tracking-[0.3em] uppercase mb-2 block">
                Limited Edition
              </span>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 transition-colors">
                THE NEBULA V2
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md transition-colors">
                Our most compact powerhouse. Featuring a liquid-cooled 14900KS
                in a custom 12L chassis with bespoke cabling.
              </p>
              <button
                onClick={() => {
                  const pc = prebuilts.find((p) => p.id === "p-nebula") || prebuilts.find(p => p.name.includes("NEBULA"));
                  if (pc) onAddToCart ? onAddToCart(pc, true) : onConfigure?.(pc);
                }}
                className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-primary dark:hover:bg-primary hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Buy Now
              </button>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 dark:opacity-30 group-hover:opacity-20 dark:group-hover:opacity-50 transition-opacity">
              <img
                src="https://images.unsplash.com/photo-1591488320449-011701bb6704?auto=format&fit=crop&q=80&w=800"
                className="w-full h-full object-cover"
                alt="PC Build"
              />
            </div>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-3xl p-10 border border-black/5 dark:border-white/5 shadow-light-card dark:shadow-none hover:border-primary/50 transition-all group overflow-hidden relative">
            <div className="relative z-10">
              <span className="text-primary text-xs font-black tracking-[0.3em] uppercase mb-2 block">
                Enterprise Grade
              </span>
              <h2 className="text-4xl font-black text-gray-900 dark:text-white mb-4 transition-colors">
                QUANTUM RACK
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md transition-colors">
                Rack-mountable performance. Optimized for server-side rendering,
                cluster computing and heavy AI inference.
              </p>
              <button
                onClick={() => {
                  const pc = prebuilts.find((p) => p.id === "p-titan") || prebuilts.find(p => p.name.includes("TITAN"));
                  if (pc) onAddToCart ? onAddToCart(pc, true) : onConfigure?.(pc);
                }}
                className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-primary dark:hover:bg-primary hover:text-white transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                Buy Now
              </button>
            </div>
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-10 dark:opacity-30 group-hover:opacity-20 dark:group-hover:opacity-50 transition-opacity">
              <img
                src="https://images.unsplash.com/photo-1558494949-ef010cbdcc51?auto=format&fit=crop&q=80&w=800"
                className="w-full h-full object-cover"
                alt="Server Rack"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
