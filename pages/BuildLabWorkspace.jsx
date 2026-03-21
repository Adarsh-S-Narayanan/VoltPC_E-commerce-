import React, { useState, useMemo, useEffect } from "react";

const BuildLabWorkspace = ({ initialParts, onCheckout, components = [] }) => {
  const [currentStep, setCurrentStep] = useState("CPU");
  const [selectedParts, setSelectedParts] = useState(() => initialParts || {});
  const [filterBrand, setFilterBrand] = useState(null);
  const [toast, setToast] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManifestOpen, setIsManifestOpen] = useState(window.innerWidth > 1024);

  // Sync manifest state with window size for responsive default
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 1024) setIsManifestOpen(true);
      else setIsManifestOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (initialParts) {
      setSelectedParts(initialParts);
      setCurrentStep("CPU");
    }
  }, [initialParts]);

  const steps = [
    { cat: "CPU", icon: "memory", label: "Processor" },
    { cat: "COOLER", icon: "ac_unit", label: "CPU Cooling" },
    { cat: "MOBO", icon: "developer_board", label: "Motherboard" },
    { cat: "RAM", icon: "memory_alt", label: "Memory" },
    { cat: "STORAGE", icon: "hard_drive", label: "Storage" },
    { cat: "GPU", icon: "videocam", label: "Graphics" },
    { cat: "CASE", icon: "check", label: "Case" },
    { cat: "FANS", icon: "cyclone", label: "Airflow" },
    { cat: "PSU", icon: "power", label: "Power" },
    { cat: "OS", icon: "window", label: "System" },
  ];

  const subtotal = useMemo(
    () =>
      Object.values(selectedParts).reduce(
        (acc, part) => acc + (part?.price || 0),
        0,
      ),
    [selectedParts],
  );
  const currentWattage = useMemo(
    () =>
      Object.values(selectedParts).reduce(
        (acc, part) => acc + (part?.wattage || 0),
        0,
      ),
    [selectedParts],
  );

  const buildFee = 7999.0;

  const validationReport = useMemo(() => {
    const issues = [];
    const { CPU, MOBO, CASE, PSU } = selectedParts;

    if (CPU && MOBO && CPU.socket !== MOBO.socket) {
      issues.push({
        type: "CRITICAL",
        category: "MOBO",
        message: `Socket mismatch: ${CPU.name} requires ${CPU.socket}, but ${MOBO.name} is ${MOBO.socket}.`,
      });
    }

    if (MOBO && CASE) {
      const moboForm = MOBO.specs.form;
      const caseType = CASE.specs.type;
      if (caseType === "SFF" && moboForm !== "Mini-ITX") {
        issues.push({
          type: "CRITICAL",
          category: "CASE",
          message: `Physical conflict: ${CASE.name} only supports Mini-ITX, but you selected ${moboForm}.`,
        });
      }
    }

    if (PSU) {
      const psuCapacity = parseInt(PSU.specs.wattage) || PSU.wattage || 0;
      const safetyMargin = currentWattage * 1.2;
      if (psuCapacity < currentWattage) {
        issues.push({
          type: "CRITICAL",
          category: "PSU",
          message: `Insufficient Power: Total system draw is ${currentWattage}W, but PSU only provides ${psuCapacity}W.`,
        });
      } else if (psuCapacity < safetyMargin) {
        issues.push({
          type: "WARNING",
          category: "PSU",
          message: `Low Power Margin: Current overhead is less than 20%. Consider a higher wattage PSU for stability.`,
        });
      }
    }

    return issues;
  }, [selectedParts, currentWattage]);

  const isCritical = validationReport.some((i) => i.type === "CRITICAL");

  const checkPartCompatibility = (part) => {
    const tempParts = { ...selectedParts, [part.category]: part };
    const { CPU, MOBO, CASE } = tempParts;
    if (part.category === "MOBO" && CPU && part.socket !== CPU.socket) {
      return {
        type: "CRITICAL",
        category: "MOBO",
        message: `Incompatible with ${CPU.socket} socket`,
      };
    }
    if (part.category === "CPU" && MOBO && part.socket !== MOBO.socket) {
      return {
        type: "CRITICAL",
        category: "CPU",
        message: `Requires ${part.socket} motherboard`,
      };
    }
    if (
      part.category === "CASE" &&
      MOBO &&
      part.specs.type === "SFF" &&
      MOBO.specs.form !== "Mini-ITX"
    ) {
      return {
        type: "CRITICAL",
        category: "CASE",
        message: `SFF Case requires Mini-ITX motherboard`,
      };
    }
    return null;
  };

  const currentInventory = useMemo(() => {
    return components.filter(
      (p) => {
        if (p.category !== currentStep) return false;
        if (filterBrand && p.brand !== filterBrand) return false;
        if (searchQuery.trim()) {
           const q = searchQuery.toLowerCase();
           if (!(p.name || "").toLowerCase().includes(q) && !(p.brand || "").toLowerCase().includes(q)) {
             return false;
           }
        }
        return true;
      }
    );
  }, [currentStep, filterBrand, components, searchQuery]);

  const togglePart = (part) => {
    if (part.stock === 0) return;
    
    const isAlreadySelected = selectedParts[part.category]?.id === part.id;
    
    if (isAlreadySelected) {
      removePart(part.category);
    } else {
      setSelectedParts((prev) => ({ ...prev, [part.category]: part }));
      // Auto-open manifest when a part is added if it's closed
      if (!isManifestOpen) setIsManifestOpen(true);
    }
  };

  const removePart = (category) => {
    setSelectedParts((prev) => {
      const next = { ...prev };
      delete next[category];
      return next;
    });
  };

  const handleCheckout = () => {
    const missingSteps = steps.filter((s) => !selectedParts[s.cat]);
    if (missingSteps.length > 0) {
      setToast(
        `Incomplete: Missing ${missingSteps.map((s) => s.label).join(", ")}`,
      );
      return;
    }
    if (isCritical) {
      setToast("Cannot proceed with critical system conflicts.");
      return;
    }
    onCheckout?.(selectedParts);
  };

  return (
    <div className="flex-1 flex flex-col bg-background-light dark:bg-background-dark pt-16 md:pt-20 relative transition-colors duration-300">
      <div className="flex-1 flex flex-col md:flex-row">
        <section className="flex-1 flex flex-col relative min-w-0 bg-background-light dark:bg-background-dark">
          {/* Top Navigation Tabs - Sticky */}
          <div className="sticky top-[72px] md:top-[80px] z-40 w-full bg-gray-50/90 dark:bg-[#0d0d0d]/90 backdrop-blur-md border-b border-black/5 dark:border-white/5 py-4 flex flex-row items-center justify-start md:justify-center gap-4 md:gap-8 overflow-x-auto scrollbar-hide transition-colors px-6">
            {steps.map((step) => {
              const hasPart = !!selectedParts[step.cat];
              const hasIssue = validationReport.some(
                (i) => i.category === step.cat,
              );
              return (
                <button
                  key={step.cat}
                  onClick={() => {
                    setCurrentStep(step.cat);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`flex flex-col items-center gap-1 transition-all group shrink-0 ${
                    currentStep === step.cat
                      ? "opacity-100 scale-105"
                      : "opacity-40 hover:opacity-70"
                  }`}
                >
                  <div
                    className={`size-8 md:size-10 rounded-lg md:rounded-xl flex items-center justify-center border transition-all ${
                      currentStep === step.cat
                        ? "bg-primary border-primary shadow-glow text-white"
                        : hasPart
                          ? hasIssue
                            ? "bg-red-500/20 border-red-500 text-red-500"
                            : "bg-green-500/20 border-green-500 text-green-500"
                          : "bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-gray-400 dark:text-gray-600"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px] md:text-[20px]">
                      {hasIssue && currentStep !== step.cat
                        ? "warning"
                        : hasPart && currentStep !== step.cat
                          ? "check"
                          : step.icon}
                    </span>
                  </div>
                  <span
                    className={`text-[8px] md:text-[9px] font-black uppercase tracking-widest ${
                      currentStep === step.cat
                        ? "text-primary"
                        : "text-gray-500 dark:text-white"
                    }`}
                  >
                    {step.cat}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-6 md:p-10 relative">
            {/* Proceed Toggle Button - Mobile Only - Liquidmorphic */}
            <div className="fixed right-4 bottom-4 z-[45] lg:hidden">
              <button
                onClick={() => setIsManifestOpen(!isManifestOpen)}
                className={`group flex items-center gap-2 px-5 py-3 rounded-full shadow-2xl transition-all duration-500 hover:scale-105 active:scale-95 border border-white/20 backdrop-blur-2xl ${
                  isManifestOpen 
                    ? "opacity-0 pointer-events-none" 
                    : "opacity-100 bg-gradient-to-r from-primary/80 to-purple-600/80 text-white shadow-glow"
                }`}
              >
                <div className="size-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <span className="material-symbols-outlined text-[18px]">
                    shopping_basket
                  </span>
                </div>
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">
                  Proceed
                </span>
                <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                  chevron_right
                </span>
              </button>
            </div>

            <div className="max-w-6xl mx-auto">
            <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-primary font-black uppercase tracking-[0.3em] text-[10px]">
                    Phase {steps.findIndex((s) => s.cat === currentStep) + 1}
                  </span>
                  <div className="h-px w-10 bg-primary/30"></div>
                </div>
                <h2 className="text-gray-900 dark:text-white text-3xl md:text-5xl font-black font-display tracking-tighter uppercase transition-colors">
                  Select {currentStep}
                </h2>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="relative w-full md:w-64">
                  <input
                    type="text"
                    placeholder={`Search ${currentStep}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white dark:bg-black/20 border border-black/10 dark:border-white/10 rounded-xl px-4 py-2.5 pl-10 text-xs text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                  />
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg pointer-events-none">
                    search
                  </span>
                </div>

                <div className="flex items-center gap-4 bg-black/5 dark:bg-white/5 p-1 rounded-xl border border-black/5 dark:border-white/10 transition-colors">
                  <TagFilter
                    label="All"
                    active={!filterBrand}
                    onClick={() => setFilterBrand(null)}
                  />
                  <TagFilter
                    label="Intel"
                    active={filterBrand === "INTEL"}
                    onClick={() => setFilterBrand("INTEL")}
                  />
                  <TagFilter
                    label="AMD"
                    active={filterBrand === "AMD"}
                    onClick={() => setFilterBrand("AMD")}
                  />
                </div>
              </div>
            </header>

            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3 md:gap-8 pb-32">
              {currentInventory.map((part, idx) => {
                const compatibilityError = checkPartCompatibility(part);
                return (
                  <ComponentCard
                    key={part.id}
                    part={part}
                    active={selectedParts[part.category]?.id === part.id}
                    error={compatibilityError?.message}
                    onAdd={() => togglePart(part)}
                    style={{ animationDelay: `${idx * 100}ms` }}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {validationReport.length > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-48px)] max-w-2xl z-50 animate-in slide-in-from-bottom-4 fade-in">
            <div
              className={`backdrop-blur-xl rounded-2xl border p-5 shadow-2xl flex flex-col gap-3 transition-all duration-500 ${
                isCritical
                  ? "bg-red-50/90 dark:bg-[#1a0a0d]/90 border-red-500/40 text-red-900 dark:text-red-100"
                  : "bg-yellow-50/90 dark:bg-[#1a170a]/90 border-yellow-500/40 text-yellow-900 dark:text-yellow-100"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-3">
                  <span
                    className={`material-symbols-outlined ${isCritical ? "text-red-500 animate-pulse" : "text-yellow-600 dark:text-yellow-500"}`}
                  >
                    {isCritical ? "error" : "warning"}
                  </span>
                  <p className="text-sm font-black uppercase tracking-widest">
                    System Diagnostics: {validationReport.length} Issue
                    {validationReport.length > 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() =>
                    validationReport
                      .filter((i) => i.type === "CRITICAL")
                      .forEach((i) => removePart(i.category))
                  }
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70 transition-colors"
                >
                  Auto-Resolve Critical
                </button>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
                {validationReport.map((issue, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span
                      className={`font-black uppercase min-w-[50px] ${issue.type === "CRITICAL" ? "text-red-500" : "text-yellow-600 dark:text-yellow-500"}`}
                    >
                      [{issue.category}]
                    </span>
                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                      {issue.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>


      {/* Manifest Backdrop for mobile */}
      {isManifestOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[55] lg:hidden animate-in fade-in duration-300"
          onClick={() => setIsManifestOpen(false)}
        />
      )}

      {/* Live Manifest Drawer (Togglable on Mobile) */}
      <aside
        className={`fixed lg:sticky lg:top-20 right-0 top-0 h-full lg:h-[calc(100vh-80px)] w-[65%] sm:w-[50%] lg:w-[420px] bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl lg:backdrop-blur-0 border-l border-black/5 dark:border-white/5 z-[60] shadow-[0_0_50px_rgba(0,0,0,0.3)] lg:shadow-none transition-all duration-700 cubic-bezier(0.4, 0, 0.2, 1) transform flex flex-col ${
          isManifestOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="p-8 border-b border-black/5 dark:border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/5 dark:from-white/[0.02] to-transparent transition-colors">
          <div>
            <h1 className="text-gray-900 dark:text-white text-xl font-black font-display uppercase tracking-[0.2em]">
              Live Manifest
            </h1>
            <p className="text-primary text-[10px] font-black tracking-widest uppercase mt-1">
              Real-time Telemetry
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div
              className={`size-3 rounded-full ${isCritical ? "bg-red-500" : "bg-primary"} animate-ping`}
            ></div>
            <button
              onClick={() => setIsManifestOpen(false)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <button
              onClick={() => setIsManifestOpen(false)}
              className="hidden p-2 text-gray-400 hover:text-primary transition-colors hover:rotate-180 duration-500"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 custom-scrollbar">
          <div className="space-y-4">
            {steps.map((step) =>
              selectedParts[step.cat] ? (
                <ManifestItem
                  key={step.cat}
                  part={selectedParts[step.cat]}
                  hasError={validationReport.some(
                    (i) => i.category === step.cat && i.type === "CRITICAL",
                  )}
                  onRemove={() => removePart(step.cat)}
                />
              ) : (
                <EmptySlot
                  key={step.cat}
                  icon={step.icon}
                  label={step.cat}
                  active={currentStep === step.cat}
                  onClick={() => setCurrentStep(step.cat)}
                />
              ),
            )}
          </div>

          <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 space-y-8 pb-10 transition-colors">
            <div className="space-y-6">
              <div>
                <div className="flex justify-between text-[10px] font-black mb-3 uppercase tracking-widest">
                  <span className="text-gray-400 dark:text-gray-500">
                    Power Draw
                  </span>
                  <span
                    className={`${isCritical && validationReport.some((i) => i.category === "PSU") ? "text-red-500" : "text-gray-900 dark:text-white"}`}
                  >
                    {currentWattage}W Load
                  </span>
                </div>
                <div className="h-1 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${currentWattage > 1000 ? "bg-red-500 shadow-[0_0_10px_#ef4444]" : "bg-primary shadow-glow"}`}
                    style={{
                      width: `${Math.min(100, (currentWattage / 1200) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <SummaryLine
                  label="Subtotal"
                  value={`₹${subtotal.toLocaleString()}`}
                />
                <SummaryLine
                  label="Expert Assembly"
                  value={`₹${buildFee.toLocaleString()}`}
                />
                <div className="h-px w-full bg-black/5 dark:bg-white/5 my-2"></div>
                <div className="flex justify-between items-end">
                  <span className="text-gray-400 dark:text-gray-500 text-xs font-black uppercase tracking-widest">
                    Grand Total
                  </span>
                  <span className="text-3xl font-black text-gray-900 dark:text-white font-mono leading-none transition-colors">
                    ₹{(subtotal + buildFee).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button
                disabled={
                  Object.keys(selectedParts).length < steps.length || isCritical
                }
                onClick={handleCheckout}
                className={`w-full py-5 font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 transition-all transform active:scale-95 ${
                  Object.keys(selectedParts).length >= steps.length &&
                  !isCritical
                    ? "bg-primary text-white shadow-glow hover:shadow-glow-hover hover:scale-[1.02]"
                    : "bg-gray-100 dark:bg-white/5 text-gray-300 dark:text-white/20 border border-black/5 dark:border-white/5 cursor-not-allowed grayscale"
                }`}
              >
                <span>{isCritical ? "System Locked" : "Proceed"}</span>
                <span className="material-symbols-outlined text-[18px]">
                  {isCritical ? "lock" : "bolt"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {toast && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-primary text-white px-8 py-4 rounded-full shadow-glow font-black uppercase tracking-widest text-[10px] animate-in slide-in-from-top-4 fade-in">
          {toast}
        </div>
      )}
      </div>
    </div>
  );
};

const TagFilter = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
      active
        ? "bg-primary text-white shadow-glow"
        : "bg-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white"
    }`}
  >
    {label}
  </button>
);

const ComponentCard = ({ part, active, error, onAdd, style }) => (
  <div
    style={style}
    className={`group relative flex flex-col bg-white dark:bg-surface-dark rounded-2xl md:rounded-3xl overflow-hidden border transition-all duration-500 animate-in fade-in zoom-in ${
      active
        ? "border-primary shadow-glow ring-2 ring-primary/20 scale-[1.02]"
        : error
          ? "border-red-500/20 grayscale-[0.5] opacity-60"
          : "border-black/5 dark:border-white/5 hover:border-primary/50 shadow-light-card dark:shadow-none"
    } ${part.stock === 0 ? "opacity-50 pointer-events-none" : ""}`}
  >
    <div className="aspect-[16/10] relative overflow-hidden bg-gray-100 dark:bg-black/40 transition-colors">
      <img
        src={part.image}
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        alt={part.name}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-surface-dark via-transparent to-transparent opacity-60"></div>

      <div className="absolute top-2 left-2 md:top-4 md:left-4 flex flex-col md:flex-row gap-1 md:gap-2">
        <span
          className={`text-[7px] md:text-[9px] font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg backdrop-blur-md border border-white/10 uppercase tracking-widest ${part.brand === "INTEL" ? "bg-blue-600/80 text-white" : "bg-orange-600/80 text-white"}`}
        >
          {part.brand}
        </span>
        {error ? (
          <span className="bg-red-600 text-white text-[7px] md:text-[9px] font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg border border-red-500/20 uppercase tracking-widest">
            Conflict
          </span>
        ) : (
          part.badge && (
            <span className="bg-primary text-white text-[7px] md:text-[9px] font-black px-1.5 md:px-3 py-0.5 md:py-1 rounded-full shadow-lg border border-primary/20 animate-pulse uppercase tracking-widest">
              {part.badge}
            </span>
          )
        )}
      </div>
    </div>

    <div className="p-3 md:p-6 flex flex-col flex-1">
      <div className="mb-3 md:mb-6">
        <p className="text-primary text-[7px] md:text-[9px] font-black uppercase tracking-[0.2em] mb-0.5 md:mb-1">
          {part.socket || "Universal"}
        </p>
        <h3 className="text-gray-900 dark:text-white text-sm md:text-xl font-black font-display leading-tight group-hover:text-primary transition-colors h-10 md:h-14 line-clamp-2 transition-colors">
          {part.name}
        </h3>
      </div>

      <div className="hidden md:grid grid-cols-2 gap-4 mb-8">
        {(part.specs ? Object.entries(part.specs) : []).map(([key, val]) => (
          <div
            key={key}
            className="bg-gray-50 dark:bg-black/20 p-2.5 rounded-xl border border-black/5 dark:border-white/5 transition-colors"
          >
            <p className="text-gray-400 dark:text-gray-500 text-[8px] font-black uppercase tracking-widest mb-0.5">
              {key}
            </p>
            <p className="text-gray-900 dark:text-white text-[10px] font-mono font-bold truncate transition-colors">
              {val}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto flex flex-col md:flex-row md:items-center justify-between pt-3 md:pt-6 border-t border-black/5 dark:border-white/5 transition-colors gap-3 md:gap-0">
        <p className="text-lg md:text-2xl font-black font-mono text-gray-900 dark:text-white leading-none transition-colors">
          ₹{(part.price || 0).toLocaleString()}
        </p>
        <button
          onClick={onAdd}
          className={`flex items-center justify-center gap-1 md:gap-2 py-2 md:py-3 px-3 md:px-6 rounded-lg md:rounded-xl font-black uppercase tracking-widest text-[7px] md:text-[10px] transition-all w-full md:w-auto ${
            active
              ? "bg-primary text-white shadow-glow"
              : error
                ? "bg-red-500/10 text-red-500 hover:bg-red-500/20"
                : "bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10"
          }`}
        >
          <span className="material-symbols-outlined text-[12px] md:text-[16px]">
            {active ? "check" : "add"}
          </span>
          {active ? "Active" : "Add to rig"}
        </button>
      </div>
    </div>
  </div>
);

const ManifestItem = ({ part, hasError, onRemove }) => (
  <div
    className={`flex gap-4 p-4 bg-gray-50 dark:bg-surface-dark border rounded-2xl group relative transition-all shadow-lg animate-in slide-in-from-right-2 ${
      hasError
        ? "border-red-500/50 bg-red-50 dark:bg-red-500/5"
        : "border-black/5 dark:border-white/5 hover:border-primary/40"
    }`}
  >
    <button
      onClick={onRemove}
      className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all shadow-lg z-10"
    >
      <span className="material-symbols-outlined text-[14px] block">close</span>
    </button>
    <div className="size-14 rounded-xl bg-white dark:bg-black/40 overflow-hidden flex-none border border-black/5 dark:border-white/10 transition-colors">
      <img
        src={part.image}
        className="w-full h-full object-cover"
        alt={part.name}
      />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between">
        <p className="text-primary text-[9px] font-black uppercase tracking-widest mb-0.5">
          {part.category}
        </p>
        {hasError && (
          <span className="material-symbols-outlined text-red-500 text-xs">
            report
          </span>
        )}
      </div>
      <p className="text-gray-900 dark:text-white text-xs font-bold truncate transition-colors">
        {part.name}
      </p>
      <p className="text-gray-400 dark:text-white/40 font-mono text-[10px] mt-1 transition-colors">
        ₹{(part.price || 0).toLocaleString()}
      </p>
    </div>
  </div>
);

const EmptySlot = ({ icon, label, active, onClick }) => (
  <button
    onClick={() => {
      onClick();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }}
    className={`flex items-center gap-4 p-4 rounded-2xl border border-dashed transition-all text-left ${
      active
        ? "bg-primary/5 border-primary/50 text-primary"
        : "bg-black/[0.02] border-black/10 dark:border-white/10 text-gray-300 dark:text-white/20 hover:border-primary/30 hover:text-primary transition-colors"
    }`}
  >
    <div
      className={`size-10 rounded-xl flex items-center justify-center border transition-colors ${active ? "border-primary/50 bg-primary/10" : "border-black/5 dark:border-white/5"}`}
    >
      <span className="material-symbols-outlined text-[18px]">{icon}</span>
    </div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-widest">
        {label} Slot
      </span>
      <span className="text-[9px] opacity-60 font-mono">Unassigned</span>
    </div>
  </button>
);

const SummaryLine = ({ label, value }) => (
  <div className="flex justify-between text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-gray-500 transition-colors">
    <span>{label}</span>
    <span className="text-gray-900 dark:text-white font-mono transition-colors">
      {value}
    </span>
  </div>
);

export default BuildLabWorkspace;
