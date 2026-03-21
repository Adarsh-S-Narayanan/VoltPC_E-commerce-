import React, { useState, useEffect, useMemo } from "react";
import * as api from "../services/apiService";

const AdminPage = ({ onRefresh }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState("inventory"); // 'inventory' | 'orders'
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [stockFilter, setStockFilter] = useState("all"); // 'all', 'low', 'out'
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    brand: "",
    price: 0,
    stock: 0,
    category: "",
    category_type: "COMPONENT",
    image: "",
    tags: "", // Used for accessory comma separated
    tagline: "", // Prebuilt
    description: "", // Prebuilt
    socket: "", // Component
    wattage: 0, // Component
    specs: {
      cores: "", clock: "", // Component
      cpu: "", gpu: "", ram: "", storage: "", cooler: "" // Prebuilt
    }
  });
  const [savingId, setSavingId] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (viewMode === "orders" && orders.length === 0) {
      loadOrders();
    }
  }, [viewMode]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setIsLoadingOrders(true);
      const data = await api.fetchOrders();
      setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } catch (err) {
      console.error("Failed to load orders:", err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.category_type) return;

    try {
      setIsAdding(true);
      
      // Clean up payload based on category_type
      let payload = {
        name: newItem.name,
        brand: newItem.brand,
        price: newItem.price,
        stock: newItem.stock,
        category: newItem.category,
        category_type: newItem.category_type,
        image: newItem.image,
        id: `item-${Date.now()}`
      };

      if (newItem.category_type === "COMPONENT") {
        payload.socket = newItem.socket;
        payload.wattage = newItem.wattage;
        payload.specs = { cores: newItem.specs.cores, clock: newItem.specs.clock };
      } else if (newItem.category_type === "PREBUILT") {
        payload.tagline = newItem.tagline;
        payload.description = newItem.description;
        payload.specs = { 
          cpu: newItem.specs.cpu, 
          gpu: newItem.specs.gpu, 
          ram: newItem.specs.ram, 
          storage: newItem.specs.storage, 
          cooler: newItem.specs.cooler 
        };
      } else if (newItem.category_type === "ACCESSORY") {
        payload.tags = newItem.tags.split(',').map(t => t.trim()).filter(Boolean);
      }

      await api.createProduct(payload);
      setShowAddModal(false);
      
      // Reset form
      setNewItem({
        name: "", brand: "", price: 0, stock: 0, category: "", category_type: "COMPONENT", image: "",
        tags: "", tagline: "", description: "", socket: "", wattage: 0,
        specs: { cores: "", clock: "", cpu: "", gpu: "", ram: "", storage: "", cooler: "" }
      });
      
      await loadProducts();
      onRefresh?.();
    } catch (err) {
      console.error("Add item failed:", err);
      alert("Failed to create new item in database.");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Nuclear deletion. Are you sure?")) return;
    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
      onRefresh?.();
    } catch (err) {
      alert("Deletion error.");
    }
  };

  const handleManualSave = async (id) => {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    try {
      setSavingId(id);
      await api.updateProduct(id, { 
        price: product.price, 
        stock: product.stock,
        name: product.name 
      });
      onRefresh?.();
      // Visual feedback
      setTimeout(() => setSavingId(null), 1000);
    } catch (err) {
      alert("Database persistence error.");
      setSavingId(null);
    }
  };

  const updateLocalProduct = (id, updates) => {
    setProducts(products.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (p.id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (p.brand || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTab = activeTab === "all" || p.category_type === activeTab.toUpperCase();
      
      let matchesStock = true;
      const stock = p.stock || 0;
      if (stockFilter === "out") matchesStock = stock === 0;
      else if (stockFilter === "low") matchesStock = stock > 0 && stock < 5;

      return matchesSearch && matchesTab && matchesStock;
    });
  }, [products, searchTerm, activeTab, stockFilter]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      lowStock: products.filter(p => p.stock > 0 && p.stock < 5).length,
      outOfStock: products.filter(p => (p.stock || 0) === 0).length,
      totalValue: products.reduce((acc, p) => acc + (p.price || 0) * (p.stock || 0), 0)
    };
  }, [products]);

  return (
    <div className="pt-24 min-h-screen bg-[#f8f9fa] dark:bg-[#0a0a0c] px-6 pb-20 transition-colors duration-500">
      <div className="max-w-[1440px] mx-auto">
        
        {/* Top Header Section */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8 mb-12">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              Neural Command v4.0 (No-Local)
            </div>
            <h1 className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter uppercase leading-none flex items-center gap-6">
              {viewMode === 'inventory' ? (
                <>Inventory <span className="text-primary">Matrix</span></>
              ) : (
                <>Order <span className="text-primary">Command</span></>
              )}
            </h1>
            <p className="text-gray-500 font-medium font-display uppercase tracking-widest text-[10px] opacity-60">Global Cluster Authorization Required.</p>
            
            <div className="flex gap-2 p-1.5 mt-4 bg-gray-50 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5 w-fit">
              <button
                onClick={() => setViewMode("inventory")}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === "inventory" 
                    ? "bg-white dark:bg-surface-dark text-primary shadow-sm" 
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
              >
                Inventory
              </button>
              <button
                onClick={() => setViewMode("orders")}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  viewMode === "orders" 
                    ? "bg-white dark:bg-surface-dark text-primary shadow-sm" 
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                }`}
              >
                Orders Directory
              </button>
            </div>
          </div>

          {viewMode === 'inventory' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full xl:w-auto">
              <StatCard label="Managed Units" value={stats.total} icon="database" />
              <StatCard label="Critical Low" value={stats.lowStock} icon="warning" color="text-amber-500" />
              <StatCard label="Depleted" value={stats.outOfStock} icon="block" color="text-red-500" />
              <StatCard label="Valuation" value={`₹${(stats.totalValue / 100000).toFixed(1)}L`} icon="payments" color="text-green-500" />
            </div>
          )}
        </div>

        {viewMode === 'inventory' ? (
          <>
            {/* Controls & Search */}
            <div className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-3xl p-6 mb-8 shadow-xl backdrop-blur-xl transition-colors">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
              <input 
                type="text" 
                placeholder="Find via Neural ID, Name, or Brand..."
                className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/5 rounded-2xl py-4 pl-12 pr-6 text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:border-primary/50 transition-all font-mono"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex gap-2 p-1.5 bg-gray-50 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5">
              {["all", "component", "prebuilt", "accessory"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 lg:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    activeTab === tab 
                      ? "bg-white dark:bg-surface-dark text-primary shadow-sm" 
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="flex gap-2 p-1.5 bg-gray-50 dark:bg-black/20 rounded-2xl border border-black/5 dark:border-white/5">
              <button
                onClick={() => setStockFilter("all")}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  stockFilter === "all" ? "bg-white dark:bg-surface-dark text-primary shadow-sm" : "text-gray-400"
                }`}
              >
                All Stock
              </button>
              <button
                onClick={() => setStockFilter("low")}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  stockFilter === "low" ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 shadow-sm" : "text-gray-400"
                }`}
              >
                Low
              </button>
              <button
                onClick={() => setStockFilter("out")}
                className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  stockFilter === "out" ? "bg-red-50 dark:bg-red-500/10 text-red-600 shadow-sm" : "text-gray-400"
                }`}
              >
                Depleted
              </button>
            </div>

            <div className="flex gap-3">
              <button 
                onClick={() => setShowAddModal(true)}
                className="px-6 py-4 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-glow hover:-translate-y-1 transition-all flex items-center gap-3"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Add New Item
              </button>
            </div>
          </div>
        </div>

        {/* Grid View */}
        {isLoading ? (
          <div className="py-24 flex flex-col items-center gap-6">
            <div className="relative size-16">
              <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
              <div className="absolute inset-4 border-t-2 border-primary/30 rounded-full animate-spin [animation-duration:2s]"></div>
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Synching with Cluster Hardware...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {filteredProducts.map((p) => (
              <ProductCard 
                key={p.id} 
                product={p} 
                saving={savingId === p.id}
                onDelete={handleDelete} 
                onSave={handleManualSave}
                updateLocalProduct={updateLocalProduct}
              />
            ))}
          </div>
            )}
          </>
        ) : (
          <OrdersView orders={orders} isLoading={isLoadingOrders} />
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setShowAddModal(false)}></div>
          <div className="relative bg-white dark:bg-surface-dark w-full max-w-2xl rounded-[40px] p-8 sm:p-12 border border-black/5 dark:border-white/10 shadow-3xl overflow-y-auto max-h-[90vh] transition-colors">
            <div className="flex items-center gap-4 mb-8">
              <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <span className="material-symbols-outlined text-2xl">add_box</span>
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tighter transition-colors">Register Asset</h2>
                <p className="text-gray-500 text-xs font-medium uppercase tracking-widest">Inject new blueprint to cluster</p>
              </div>
            </div>
            
            <form onSubmit={handleAddItem} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nomenclature (Name) *</label>
                  <input 
                    type="text" 
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold"
                    placeholder="e.g. NVIDIA RTX 5090"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Classification (Type) *</label>
                  <select 
                    value={newItem.category_type}
                    onChange={(e) => setNewItem({...newItem, category_type: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold appearance-none cursor-pointer"
                  >
                    <option value="COMPONENT">Component</option>
                    <option value="PREBUILT">Pre-Built Rig</option>
                    <option value="ACCESSORY">Accessory</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Manufacturer/Brand</label>
                  <input 
                    type="text" 
                    value={newItem.brand}
                    onChange={(e) => setNewItem({...newItem, brand: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold"
                    placeholder="e.g. ASUS"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category Tag</label>
                  <input 
                    type="text" 
                    value={newItem.category}
                    onChange={(e) => setNewItem({...newItem, category: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold"
                    placeholder="e.g. GPU, Keyboard"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Base Valuation (₹)</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newItem.price}
                    onChange={(e) => setNewItem({...newItem, price: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Initial Stock</label>
                  <input 
                    type="number" 
                    min="0"
                    value={newItem.stock}
                    onChange={(e) => setNewItem({...newItem, stock: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Visual Data URL (Image)</label>
                  <input 
                    type="url" 
                    value={newItem.image}
                    onChange={(e) => setNewItem({...newItem, image: e.target.value})}
                    className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold"
                    placeholder="https://..."
                  />
                </div>
              </div>

              {/* DYNAMIC FIELDS BASED ON CATEGORY TYPE */}
              <div className="pt-6 border-t border-black/5 dark:border-white/10 animate-in fade-in transition-all">
                <h3 className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-4">Specific Configurations</h3>
                
                {newItem.category_type === 'COMPONENT' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Socket Type</label>
                      <input type="text" value={newItem.socket} onChange={(e) => setNewItem({...newItem, socket: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold" placeholder="e.g. LGA1700, AM5" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">TDP / Wattage (W)</label>
                      <input type="number" value={newItem.wattage} onChange={(e) => setNewItem({...newItem, wattage: parseInt(e.target.value) || 0})} className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Core Count (CPU)</label>
                      <input type="text" value={newItem.specs.cores} onChange={(e) => setNewItem({...newItem, specs: {...newItem.specs, cores: e.target.value}})} className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold" placeholder="e.g. 24C/32T" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Boost Clock</label>
                      <input type="text" value={newItem.specs.clock} onChange={(e) => setNewItem({...newItem, specs: {...newItem.specs, clock: e.target.value}})} className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold" placeholder="e.g. 6.0GHz" />
                    </div>
                  </div>
                )}

                {newItem.category_type === 'PREBUILT' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Marketing Tagline</label>
                      <input type="text" value={newItem.tagline} onChange={(e) => setNewItem({...newItem, tagline: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold" placeholder="e.g. ULTRA LOW LATENCY" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Description</label>
                      <input type="text" value={newItem.description} onChange={(e) => setNewItem({...newItem, description: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {['cpu', 'gpu', 'ram', 'storage', 'cooler'].map(spec => (
                        <div key={spec} className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">{spec}</label>
                          <input type="text" value={newItem.specs[spec]} onChange={(e) => setNewItem({...newItem, specs: {...newItem.specs, [spec]: e.target.value}})} className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold" />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {newItem.category_type === 'ACCESSORY' && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Tags (Comma Separated)</label>
                    <input type="text" value={newItem.tags} onChange={(e) => setNewItem({...newItem, tags: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 text-gray-900 dark:text-white transition-colors font-bold" placeholder="e.g. Wireless, Ergonomic, RGB" />
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-6 border-t border-black/5 dark:border-white/5">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-gray-50 dark:bg-white/5 rounded-xl text-[10px] font-black uppercase text-gray-400 hover:text-gray-600 dark:hover:text-white transition-all">Cancel</button>
                <button type="submit" disabled={isAdding} className="flex-1 py-4 bg-primary text-white rounded-xl text-[10px] font-black uppercase shadow-glow hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2">
                  {isAdding ? (
                    <><span className="material-symbols-outlined text-sm animate-spin">sync</span> INJECTING...</>
                  ) : (
                    <><span className="material-symbols-outlined text-sm">cloud_upload</span> SUBMIT TO CLUSTER</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ label, value, icon, color = "text-primary" }) => (
  <div className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 p-6 rounded-3xl shadow-lg flex-1 min-w-[140px] transition-colors">
    <div className="flex justify-between items-start mb-4">
      <span className={`material-symbols-outlined ${color} opacity-40`}>{icon}</span>
    </div>
    <p className="text-2xl font-black text-gray-900 dark:text-white mb-1 uppercase tracking-tight transition-colors">{value}</p>
    <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest">{label}</p>
  </div>
);

const ProductCard = ({ product, saving, onDelete, onSave, updateLocalProduct }) => {
  const isOutOfStock = (product.stock || 0) === 0;
  const isLowStock = !isOutOfStock && (product.stock || 0) < 5;

  return (
    <div className={`group relative bg-white dark:bg-surface-dark border ${isOutOfStock ? 'border-red-500/30' : 'border-black/5 dark:border-white/5'} rounded-[32px] overflow-hidden transition-all duration-300 hover:shadow-2xl hover:border-primary/40 flex flex-col animate-in fade-in`}>
      {/* Badge/Tags */}
      <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
        {isOutOfStock && (
          <span className="px-3 py-1 bg-red-500 text-white text-[9px] font-black uppercase rounded-lg shadow-lg">DEPLETED</span>
        )}
        {isLowStock && (
          <span className="px-3 py-1 bg-amber-500 text-white text-[9px] font-black uppercase rounded-lg shadow-lg">LOW STOCK</span>
        )}
        <span className="px-3 py-1 bg-black/80 dark:bg-white/10 backdrop-blur-md text-white text-[9px] font-black uppercase rounded-lg border border-white/5">{product.category_type}</span>
      </div>

      {/* Image Section */}
      <div className="h-48 relative overflow-hidden bg-gray-100 dark:bg-black/20 transition-colors">
        <img 
          src={product.image} 
          alt={product.name} 
          className={`size-full object-cover transition-transform duration-700 group-hover:scale-110 ${isOutOfStock ? 'grayscale opacity-40' : 'grayscale group-hover:grayscale-0'}`}
        />
        <div className="absolute inset-x-0 bottom-0 px-4 py-2 bg-gradient-to-t from-black/60 to-transparent flex items-end justify-between transition-colors">
           <span className="text-[9px] font-black text-white/70 uppercase">ID: {product.id}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col transition-colors">
        <div className="mb-6 flex-1 space-y-4">
          <div>
            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{product.brand || product.category}</span>
            <input 
              className="w-full bg-transparent text-base font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-tight focus:outline-none focus:text-primary transition-colors border-b border-transparent focus:border-primary/30"
              value={product.name}
              onChange={(e) => updateLocalProduct(product.id, { name: e.target.value })}
            />
          </div>

          <div className="space-y-4 pt-4 border-t border-black/5 dark:border-white/5 transition-colors">
            {/* Price Edit */}
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Base Value (₹)</span>
              <input 
                 type="number"
                 className="w-24 bg-gray-50 dark:bg-black/30 text-right font-black text-sm p-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-white transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                 value={product.price || 0}
                 onChange={(e) => updateLocalProduct(product.id, { price: parseInt(e.target.value) || 0 })}
              />
            </div>

            {/* Stock Edit */}
            <div className="flex justify-between items-center">
              <span className="text-[8px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest">Units Available</span>
              <div className="flex items-center gap-3 bg-gray-50 dark:bg-black/30 p-1 rounded-xl transition-colors">
                <button 
                  onClick={() => updateLocalProduct(product.id, { stock: Math.max(0, (product.stock || 0) - 1) })}
                  className="size-7 rounded-lg bg-white dark:bg-surface-dark flex items-center justify-center text-xs hover:bg-primary hover:text-white transition-all shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">remove</span>
                </button>
                <input 
                  type="number"
                  className={`bg-transparent text-[11px] font-black w-12 text-center focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${isOutOfStock ? 'text-red-500' : 'text-gray-900 dark:text-white transition-colors'}`}
                  value={product.stock || 0}
                  onChange={(e) => updateLocalProduct(product.id, { stock: parseInt(e.target.value) || 0 })}
                />
                <button 
                  onClick={() => updateLocalProduct(product.id, { stock: (product.stock || 0) + 1 })}
                  className="size-7 rounded-lg bg-white dark:bg-surface-dark flex items-center justify-center text-xs hover:bg-primary hover:text-white transition-all shadow-sm transition-colors"
                >
                  <span className="material-symbols-outlined text-xs">add</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-4 flex items-center justify-between border-t border-black/5 dark:border-white/5 mt-4 transition-colors">
          <button 
            onClick={() => onDelete(product.id)}
            className="size-10 rounded-xl bg-red-500/5 text-red-500/30 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all border border-red-500/10"
          >
            <span className="material-symbols-outlined text-base">delete</span>
          </button>

          <button 
            onClick={() => onSave(product.id)}
            disabled={saving}
            className={`px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${saving ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20'}`}
          >
            {saving ? (
              <>
                <span className="material-symbols-outlined text-sm animate-bounce">check_circle</span>
                Saved
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">save</span>
                Commit
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const OrdersView = ({ orders, isLoading }) => {
  if (isLoading) {
    return (
      <div className="py-24 flex flex-col items-center gap-6">
        <div className="relative size-16">
          <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
          <div className="absolute inset-4 border-t-2 border-primary/30 rounded-full animate-spin [animation-duration:2s]"></div>
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Extracting Database Records...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-24 flex flex-col items-center gap-4 text-center">
        <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-700">receipt_long</span>
        <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">No Command Orders Found</h3>
        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Awaiting customer transmissions</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {orders.map((order) => (
        <div key={order._id || order.orderId} className="bg-white dark:bg-surface-dark border border-black/5 dark:border-white/5 rounded-[32px] p-6 shadow-xl transition-colors">
          <div className="flex flex-col lg:flex-row justify-between gap-6 border-b border-black/5 dark:border-white/5 pb-6">
            <div className="space-y-1">
              <span className="text-[9px] font-black text-primary uppercase tracking-widest">Order Reference</span>
              <p className="font-mono text-sm text-gray-900 dark:text-white">{order.orderId || order._id}</p>
            </div>
            <div className="space-y-1 lg:text-right">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Timestamp</span>
              <p className="font-mono text-sm text-gray-900 dark:text-white">{new Date(order.date).toLocaleString()}</p>
            </div>
            <div className="space-y-1 lg:text-right">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Status</span>
              <div>
                <span className={`px-3 py-1 text-[10px] font-black uppercase rounded-full shadow-sm ${order.status === 'Completed' ? 'bg-green-50 text-green-600 dark:bg-green-500/10' : order.status === 'Pending' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/10' : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'}`}>
                  {order.status || 'Pending'}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
            <div className="lg:col-span-4 space-y-6">
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">person</span> Customer Identity
                </h4>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">{order.customerName || 'N/A'}</p>
                  <p className="text-sm text-gray-500">{order.email || 'N/A'}</p>
                  {order.contact && <p className="text-sm text-gray-500">{order.contact}</p>}
                </div>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">location_on</span> Customer Address
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{order.address || 'N/A'}</p>
              </div>
              <div>
                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[14px]">payments</span> Financial Transference
                </h4>
                <p className="text-sm font-bold text-gray-900 dark:text-white">{order.payment || 'Credit Card'}</p>
              </div>
            </div>

            <div className="lg:col-span-8 bg-gray-50 dark:bg-black/20 rounded-2xl p-6 border border-black/5 dark:border-white/5">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">inventory_2</span> Manifest Units
              </h4>
              <div className="space-y-4">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white dark:bg-surface-dark p-3 rounded-xl border border-black/5 dark:border-white/5">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="size-12 rounded-lg object-cover" />
                    ) : (
                      <div className="size-12 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                        <span className="material-symbols-outlined text-gray-400">image</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{item.name || 'Unknown Unit'}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Qty: {item.quantity || 1} × ₹{item.price || 0}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-primary">₹{(item.price || 0) * (item.quantity || 1)}</p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10 flex justify-between items-center text-xl font-black">
                <span className="uppercase text-gray-900 dark:text-white tracking-tighter">Total Valuation</span>
                <span className="text-primary tracking-tighter">₹{order.total || 0}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminPage;
