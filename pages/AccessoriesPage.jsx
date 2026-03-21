import React, { useState, useMemo } from "react";
import PageHeader from "../components/PageHeader";
import Toast from "../components/Toast";

const AccessoriesPage = ({ onAddToCart, accessories = [] }) => {
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAccessories = useMemo(() => {
    if (!searchQuery.trim()) return accessories;
    const q = searchQuery.toLowerCase();
    return accessories.filter(item => 
      (item.name || "").toLowerCase().includes(q) ||
      (item.category || "").toLowerCase().includes(q) ||
      (item.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }, [accessories, searchQuery]);

  const handleAdd = (item, redirect = false) => {
    onAddToCart?.(item, redirect);
    if (!redirect) {
      setToast(`${item.name} added to cart.`);
      setTimeout(() => setToast(null), 3000);
    }
  };

  return (
    <div className="pt-20 bg-background-light dark:bg-background-dark min-h-screen transition-colors duration-300">
      <div className="max-w-[1440px] mx-auto px-6 py-12">
        <PageHeader 
          title="COMPLETE YOUR BATTLESTATION" 
          description="Curated peripherals engineered to complement the performance of your VoltPC rig."
          centered
        />

        {/* Search Bar */}
        <div className="mb-10 max-w-xl mx-auto relative">
          <input
            type="text"
            placeholder="Search accessories by name, category, or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-surface-dark border border-black/10 dark:border-white/10 rounded-xl px-4 py-3 pl-11 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
          />
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            search
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredAccessories.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-2xl overflow-hidden group hover:border-primary transition-all shadow-light-card dark:shadow-xl hover:shadow-glow/20"
            >
              <div className="aspect-square overflow-hidden relative bg-gray-100 dark:bg-black/20 transition-colors">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex gap-2">
                  {(item.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/80 dark:bg-black/80 backdrop-blur text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded text-gray-900 dark:text-white border border-black/5 dark:border-white/10"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="p-6">
                <span className="text-primary text-[10px] font-black uppercase tracking-widest">
                  {item.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1 mb-4 truncate transition-colors">
                  {item.name}
                </h3>
                <div className="flex flex-col gap-4 mt-2">
                  <span className="text-2xl font-black text-gray-900 dark:text-white font-mono transition-colors">
                    ₹{(item.price || 0).toLocaleString()}
                  </span>
                  <div className="flex gap-2 w-full">
                    <button
                      onClick={() => handleAdd(item, true)}
                      className="text-[10px] flex-1 font-black uppercase py-4 px-4 rounded-xl transition-all tracking-widest translate-y-0 active:translate-y-1 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-primary dark:hover:bg-primary hover:text-white shadow-lg"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={() => handleAdd(item, false)}
                      className="bg-primary hover:bg-[#6a19b0] text-white py-4 px-4 rounded-xl flex items-center justify-center transition-all shadow-lg active:translate-y-1"
                      title="Add to Cart"
                    >
                      <span className="material-symbols-outlined text-base">shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Toast message={toast} />
    </div>
  );
};

export default AccessoriesPage;
