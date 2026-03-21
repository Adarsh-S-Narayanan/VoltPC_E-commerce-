import React from "react";

const FeaturedPCs = ({ onConfigure, onAddToCart, pcs = [], components = [] }) => {
  const displayPcs = pcs;

  const isOutOfStock = (pc) => {
    return Object.values(pc.specs).some((specName) => {
      // Try finding in passed components first
      const part = components.find((p) => p.name === specName);
      return part?.stock === 0;
    });
  };

  return (
    <section className="py-20 px-0 max-w-[1440px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-black/5 dark:border-[#312938] pb-8 transition-colors">
        <div>
          <h2 className="text-4xl font-black text-gray-900 dark:text-white tracking-tighter mb-2 uppercase">
            Battle-Tested Loadouts
          </h2>
          <p className="text-gray-600 dark:text-gray-400 font-medium">
            Pre-configured by engineers for maximum thermal efficiency and
            stability.
          </p>
        </div>
      </div>

      {displayPcs.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-8">
          {displayPcs.map((pc) => {
            const stockIssue = isOutOfStock(pc);
            return (
              <div
                key={pc.id}
                className={`group relative bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border transition-all duration-500 flex flex-col ${stockIssue ? "opacity-60 grayscale-[0.3]" : "hover:border-primary hover:shadow-glow"} ${stockIssue ? 'border-red-500/20' : 'border-black/5 dark:border-[#312938]'}`}
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-gray-100 dark:bg-black/40">
                  <img
                    src={pc.image}
                    alt={pc.title || pc.name}
                    className={`w-full h-full object-cover transition-transform duration-700 ${stockIssue ? "" : "group-hover:scale-110 grayscale group-hover:grayscale-0"}`}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-surface-dark via-transparent to-transparent opacity-60 transition-colors"></div>

                  <div className="absolute top-4 left-4 flex gap-2">
                    <div className="bg-white/80 dark:bg-black/80 backdrop-blur text-gray-900 dark:text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full border border-black/5 dark:border-white/10 uppercase">
                      {pc.category}
                    </div>
                    {stockIssue && (
                       <div className="bg-red-500 text-white text-[10px] font-black tracking-widest px-3 py-1 rounded-full shadow-lg uppercase">
                         Out of Stock
                       </div>
                    )}
                  </div>
                </div>

                <div className="p-3 md:p-8 flex flex-col flex-grow">
                  <div className="flex items-center justify-between mb-1 md:mb-2">
                    <span className="text-primary text-[7px] md:text-[10px] font-black tracking-[0.2em] uppercase">
                      {pc.tagline || (pc.brand || "ENGINEERED")}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-yellow-500 text-sm fill-1">
                        star
                      </span>
                      <span className="text-gray-900 dark:text-white text-xs font-bold transition-colors">
                        {(pc.rating || 4.5).toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-sm md:text-3xl font-black text-gray-900 dark:text-white mb-1 md:mb-3 tracking-tighter uppercase transition-colors h-10 md:h-auto line-clamp-2">
                    {pc.title || pc.name}
                  </h3>
                  <p className="hidden md:block text-gray-600 dark:text-gray-400 text-sm mb-8 leading-relaxed line-clamp-2 transition-colors">
                    {pc.description || "Precision engineered for high-performance computing tasks."}
                  </p>

                  <div className="hidden md:block space-y-4 mb-10 border-t border-black/5 dark:border-white/5 pt-6 transition-colors font-mono">
                    <SpecItem icon="memory" text={pc.specs?.cpu || "N/A"} />
                    <SpecItem icon="videogame_asset" text={pc.specs?.gpu || "N/A"} />
                    <SpecItem icon="bolt" text={pc.specs?.ram || "N/A"} />
                    <SpecItem icon="storage" text={pc.specs?.storage || "N/A"} />
                  </div>

                  <div className="mt-auto flex flex-col md:flex-row md:items-center justify-between pt-3 md:pt-6 border-t border-black/5 dark:border-white/5 transition-colors gap-3 md:gap-0">
                    <div>
                      <span className="block text-[7px] md:text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-0.5 md:mb-1">
                        Starting at
                      </span>
                      <span className="text-lg md:text-2xl font-black text-gray-900 dark:text-white font-mono transition-colors">
                        ₹{(pc.price || (pc.startingPrice || 0)).toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2 w-full md:w-auto">
                      <button
                        onClick={() => !stockIssue && (onAddToCart ? onAddToCart(pc, true) : onConfigure?.(pc))}
                        disabled={stockIssue}
                        className={`text-[7px] md:text-[10px] flex-1 font-black uppercase py-2 md:py-4 px-3 md:px-8 rounded-lg md:rounded-xl transition-all tracking-widest translate-y-0 active:translate-y-1 ${
                          stockIssue
                            ? "bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed"
                            : "bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary hover:text-white shadow-lg"
                        }`}
                      >
                        {stockIssue ? (
                          <span className="text-[6px] md:text-[10px]">Notify Me</span>
                        ) : (
                          "Buy Now"
                        )}
                      </button>
                      {!stockIssue && onAddToCart && (
                        <button
                          onClick={() => onAddToCart(pc, false)}
                          className="bg-primary hover:bg-[#6a19b0] text-white py-2 md:py-4 px-2 md:px-4 rounded-lg md:rounded-xl flex items-center justify-center transition-all shadow-lg active:translate-y-1"
                          title="Add to Cart"
                        >
                          <span className="material-symbols-outlined text-[14px] md:text-base">shopping_cart</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-20 text-center border border-dashed border-black/10 dark:border-white/10 rounded-3xl transition-colors">
          <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700 mb-4 transition-colors">
            search_off
          </span>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 uppercase transition-colors">
            No matching configurations
          </h3>
          <p className="text-gray-500 text-sm transition-colors">
            Try adjusting your filters or head to the Build Lab for a custom
            rig.
          </p>
        </div>
      )}
    </section>
  );
};

const SpecItem = ({ icon, text }) => (
  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 transition-colors">
    <span className="material-symbols-outlined text-primary text-[18px]">
      {icon}
    </span>
    <span className="font-bold tracking-tight truncate uppercase">{text}</span>
  </div>
);

export default FeaturedPCs;
