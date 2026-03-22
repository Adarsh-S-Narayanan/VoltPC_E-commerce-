import React, { useState, useCallback, useMemo, useEffect, useRef } from "react";
import Navbar from "./components/Navbar";
import BuildLab from "./components/BuildLab";
import FeaturedPCs from "./components/FeaturedPCs";
import AssistantChat from "./components/AssistantChat";
import BuildLabWorkspace from "./pages/BuildLabWorkspace";
import PreBuildsPage from "./pages/PreBuildsPage";
import AccessoriesPage from "./pages/AccessoriesPage";
import SupportPage from "./pages/SupportPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import AccountPage from "./pages/AccountPage";
import AuthPage from "./pages/AuthPage";
import OrderDetailsPage from "./pages/OrderDetailsPage";
import CustomerReviews from "./pages/CustomerReviews";
import AdminPage from "./pages/AdminPage";
import AboutPage from "./pages/AboutPage";
import DriversPage from "./pages/DriversPage";
import TroubleshootGuide from "./pages/TroubleshootGuide";
// Remove direct data imports to rely on DB
// import { COMPONENT_DATA, PREBUILTS, ACCESSORIES } from "./data";
import StatItem from "./components/StatItem";
import { auth } from "./services/firebaseConfig";
import { onAuthStateChanged, signOut } from "firebase/auth";
import * as api from "./services/apiService";

const BUILDERS = [
  {
    name: "Xenon_E",
    specialty: "Thermal Dynamics",
    avatar:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Flux_Architect",
    specialty: "Cabling & Logic",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Circuit_Breaker",
    specialty: "Overclocking",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Neon_Pulse",
    specialty: "Aesthetic Design",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Binary_Ghost",
    specialty: "BIOS Optimization",
    avatar:
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=200",
  },
  {
    name: "Void_Main",
    specialty: "Silicon Validation",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200",
  },
];

const App = () => {
  const [currentView, setCurrentView] = useState("landing");
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [labInitialParts, setLabInitialParts] = useState(undefined);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("volt-pc-theme");
      return saved || "dark";
    }
    return "dark";
  });
  const [orders, setOrders] = useState([]);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [textMousePos, setTextMousePos] = useState({ x: 0, y: 0 });
  const textContainerRef = useRef(null);

  const handleMouseMove = useCallback((e) => {
    const { clientX, clientY, currentTarget } = e;
    const { left, top } = currentTarget.getBoundingClientRect();
    setMousePosition({ x: clientX - left, y: clientY - top });

    // Calculate position relative to text container
    if (textContainerRef.current) {
      const textRect = textContainerRef.current.getBoundingClientRect();
      setTextMousePos({
        x: clientX - textRect.left,
        y: clientY - textRect.top
      });
    }
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    if (theme === "dark") {
      html.classList.add("dark");
      html.classList.remove("light");
    } else {
      html.classList.remove("dark");
      html.classList.add("light");
    }
    localStorage.setItem("volt-pc-theme", theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, []);

  const navigateTo = useCallback(
    (view, isPopState = false) => {
      let finalView = view;
      if (
        (view === "account" ||
          view === "checkout" ||
          view === "order-details" ||
          view === "admin") &&
        !user
      ) {
        finalView = "auth";
      }

      if (view === "admin" && user?.email !== "vaultpcgo@gmail.com") {
        finalView = "account";
      }
      
      // Refresh orders when going to account or order-details
      if (user && (finalView === "account" || finalView === "order-details")) {
        api.fetchOrders(user.email).then(data => {
          if (data && data.length > 0) setOrders(data);
        }).catch(err => console.error("Nav refresh failed:", err));
      }
      
      setCurrentView(finalView);
      
      if (!isPopState) {
        window.history.pushState({ view: finalView }, "", "");
      }
      
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [user],
  );

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.view) {
        navigateTo(event.state.view, true);
      } else {
        navigateTo("landing", true);
      }
    };

    window.addEventListener("popstate", handlePopState);
    
    // Initialize history state on first load
    if (!window.history.state) {
      window.history.replaceState({ view: "landing" }, "", "");
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, [navigateTo]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const loggedInUser = {
          username: firebaseUser.displayName || firebaseUser.email.split("@")[0],
          email: firebaseUser.email,
          tier: "Elite Engineer",
          uid: firebaseUser.uid,
          photoURL: firebaseUser.photoURL || null
        };
        setUser(loggedInUser);
        
        // Fetch and load existing DB data, then sync basic detail
        try {
          const profile = await api.fetchUserProfile(loggedInUser.uid);
          if (profile && Object.keys(profile).length > 0) {
            if (profile.cart && profile.cart.length > 0) setCartItems(profile.cart);
          }
          
          // Fetch live orders (more accurate than embedded history)
          const liveOrders = await api.fetchOrders(loggedInUser.email);
          if (liveOrders && liveOrders.length > 0) {
            setOrders(liveOrders);
          } else if (profile.orderHistory && profile.orderHistory.length > 0) {
            setOrders(profile.orderHistory);
          }

          await api.updateUserProfile(loggedInUser.uid, {
            id: loggedInUser.uid,
            name: loggedInUser.username,
            username: loggedInUser.username,
            email: loggedInUser.email
          });
        } catch (err) {
          console.error("Failed to load/sync user data:", err);
        }
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsProductsLoading(true);
        const data = await api.fetchProducts();
        setProducts(data);
        console.log("Database initialized:", data.length, "units online.");
      } catch (err) {
        console.error("Critical: Database sync failed.", err);
      } finally {
        setIsProductsLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshProducts = async () => {
    try {
      const data = await api.fetchProducts();
      setProducts(data);
    } catch (err) {
      console.error("Manual sync failed");
    }
  };

  const COMPONENT_DATA_DB = useMemo(() => products.filter(p => p.category_type === "COMPONENT"), [products]);
  const PREBUILTS_DB = useMemo(() => products.filter(p => p.category_type === "PREBUILT"), [products]);
  const ACCESSORIES_DB = useMemo(() => products.filter(p => p.category_type === "ACCESSORY"), [products]);

  const addToCart = useCallback((item) => {
    const cartId = Math.random().toString(36).substring(7);
    setCartItems((prev) => {
      const newCart = [...prev, { ...item, cartId }];
      if (user?.uid) {
        api.updateUserProfile(user.uid, { cart: newCart }).catch(err => console.error("Failed to sync cart", err));
      }
      return newCart;
    });
  }, [user?.uid]);

  const removeFromCart = useCallback((cartId) => {
    setCartItems((prev) => {
      const newCart = prev.filter((item) => item.cartId !== cartId);
      if (user?.uid) {
        api.updateUserProfile(user.uid, { cart: newCart }).catch(err => console.error("Failed to sync cart", err));
      }
      return newCart;
    });
  }, [user?.uid]);

  const handleAuthComplete = useCallback((loggedInUser) => {
    setUser(loggedInUser);
    navigateTo("landing");
  }, [navigateTo]);

  const handleLogout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigateTo("landing");
    } catch (error) {
      console.error("Logout error:", error);
    }
  }, [navigateTo]);

  const handleConfigurePrebuild = useCallback(
    (pc) => {
      const mapped = {};
      const cpu = COMPONENT_DATA_DB.find((p) => p.name === pc.specs.cpu);
      const gpu = COMPONENT_DATA_DB.find((p) => p.name === pc.specs.gpu);
      const ram = COMPONENT_DATA_DB.find((p) => p.name === pc.specs.ram);
      const storage = COMPONENT_DATA_DB.find((p) => p.name === pc.specs.storage);
      const cooler = COMPONENT_DATA_DB.find((p) => p.name === pc.specs.cooler);
      if (cpu) mapped["CPU"] = cpu;
      if (gpu) mapped["GPU"] = gpu;
      if (ram) mapped["RAM"] = ram;
      if (storage) mapped["STORAGE"] = storage;
      if (cooler) mapped["COOLER"] = cooler;
      const defaultMobo = COMPONENT_DATA_DB.find(
        (p) => p.category === "MOBO" && (cpu ? p.socket === cpu.socket : true),
      );
      const defaultCase = COMPONENT_DATA_DB.find((p) => p.category === "CASE");
      const defaultPsu = COMPONENT_DATA_DB.find(
        (p) => p.category === "PSU" && p.wattage >= 850,
      );
      const defaultFans = COMPONENT_DATA_DB.find((p) => p.category === "FANS");
      const defaultOs = COMPONENT_DATA_DB.find(
        (p) => p.category === "OS" && p.name === "Windows 11 Home",
      );

      if (defaultMobo) mapped["MOBO"] = defaultMobo;
      if (defaultCase) mapped["CASE"] = defaultCase;
      if (defaultPsu) mapped["PSU"] = defaultPsu;
      if (defaultFans) mapped["FANS"] = defaultFans;
      if (defaultOs) mapped["OS"] = defaultOs;

      setLabInitialParts(mapped);
      navigateTo("lab");
    },
    [navigateTo],
  );

  const handleAddToCartPrebuild = useCallback((pc, redirect = false) => {
    addToCart({
      id: pc.id,
      name: pc.title || pc.name,
      price: pc.price || pc.startingPrice || 0,
      image: pc.image,
      category: pc.category || "PREBUILT",
    });
    if (redirect) {
      navigateTo("checkout");
    }
  }, [addToCart, navigateTo]);

  const handleCheckoutComplete = useCallback(async (customerData) => {
    const newOrderId = `VPC-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
    const items = [...cartItems];
    const total = items.reduce((acc, item) => acc + (item?.price || 0), 0);
    
    const localOrderData = {
      id: newOrderId,
      date: new Date()
        .toLocaleDateString("en-US", {
          month: "short",
          day: "2-digit",
          year: "numeric",
        })
        .toUpperCase(),
      status: "Validated",
      total,
      items,
      builder: BUILDERS[Math.floor(Math.random() * BUILDERS.length)],
      ...customerData
    };

    // Save to backend so Admin sees it
    try {
      await api.createOrder({
        orderId: newOrderId,
        customerName: customerData?.customerName || user?.username || "Guest",
        email: customerData?.email || user?.email || "guest@example.com",
        contact: customerData?.contact || "N/A",
        address: customerData?.address || "N/A",
        total: total,
        status: "Validated",
        items: items,
        uroPayOrderId: customerData?.uroPayOrderId || "N/A",
        referenceNumber: customerData?.referenceNumber || "N/A"
      });
    } catch(err) {
      console.error("Failed to commit order to DB:", err);
    }

    setOrders((prev) => {
      const newOrders = [localOrderData, ...prev];
      if (user?.uid) {
        api.updateUserProfile(user.uid, { orderHistory: newOrders, cart: [] }).catch(err => console.error("Failed to sync orders/cart", err));
      }
      return newOrders;
    });
    setCartItems([]);
    setSelectedOrderId(newOrderId);
    navigateTo("order-details");
  }, [cartItems, user, navigateTo]);

  const recommendedPcs = useMemo(() => {
    return PREBUILTS_DB.filter((pc) => pc.rating >= 4.8 || pc.isTrending).slice(
      0,
      6,
    );
  }, [PREBUILTS_DB]);

  const renderContent = () => {
    switch (currentView) {
      case "auth":
        return <AuthPage onAuthComplete={handleAuthComplete} onBack={() => navigateTo("landing")} />;
      case "lab":
        return (
          <BuildLabWorkspace
            initialParts={labInitialParts}
            components={COMPONENT_DATA_DB}
            onCheckout={(fullRig) => {
              Object.values(fullRig).forEach((part) => {
                if (part) {
                  addToCart({
                    id: part.id || `custom-part-${Math.random()}`,
                    name: part.name || "Custom Component",
                    price: part.price || 0,
                    image: part.image || "",
                    category: part.category || "COMPONENT",
                  });
                }
              });

              addToCart({
                id: `build-fee-${Date.now()}`,
                name: "Professional Configuration & Assembly",
                price: 7999,
                image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=200",
                category: "SERVICE",
              });

              navigateTo("cart");
            }}
          />
        );
      case "prebuilds":
        return <PreBuildsPage onConfigure={handleConfigurePrebuild} onAddToCart={handleAddToCartPrebuild} prebuilts={PREBUILTS_DB} />;
      case "accessories":
        return (
          <AccessoriesPage
            accessories={ACCESSORIES_DB}
            onAddToCart={(item, redirect = false) => {
              addToCart({
                id: item.id,
                name: item.name,
                price: item.price,
                image: item.image,
                category: item.category,
              });
              if (redirect) {
                navigateTo("checkout");
              }
            }}
          />
        );
      case "about":
        return <AboutPage />;
      case "support":
        return <SupportPage onNavigate={navigateTo} />;
      case "drivers":
        return <DriversPage onBack={() => navigateTo("support")} />;
      case "troubleshoot":
        return <TroubleshootGuide onBack={() => navigateTo("support")} />;
      case "reviews":
        return <CustomerReviews />;
      case "admin":
        return <AdminPage onRefresh={refreshProducts} />;
      case "cart":
        return (
          <CartPage
            items={cartItems}
            onRemove={removeFromCart}
            onCheckout={() => navigateTo("checkout")}
            onContinueShopping={() => navigateTo("prebuilds")}
          />
        );
      case "checkout":
        return (
          <CheckoutPage items={cartItems} user={user} onComplete={handleCheckoutComplete} />
        );
      case "account":
        return (
          <AccountPage
            user={user}
            orders={orders}
            onLogout={handleLogout}
            onViewOrder={(id) => {
              setSelectedOrderId(id);
              navigateTo("order-details");
            }}
            onNavigate={navigateTo}
          />
        );
      case "order-details":
        const selectedOrder = orders.find((o) => o.id === selectedOrderId);
        return selectedOrder ? (
          <OrderDetailsPage
            order={selectedOrder}
            onBack={() => navigateTo("account")}
          />
        ) : null;
      default:
        return (
          <main className="pt-20">
            <section 
              onMouseMove={handleMouseMove}
              className="relative flex flex-col items-center justify-center py-16 md:py-24 lg:py-36 px-4 md:px-6 overflow-hidden group"
            >
              {/* Dynamic Hover Background Effect */}
              <div
                className="pointer-events-none absolute inset-0 transition duration-300 opacity-0 group-hover:opacity-60 hidden [@media(hover:hover)]:block"
                style={{
                  background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(123, 29, 205, 0.1), transparent 40%)`
                }}
              />
              <div
                className="pointer-events-none absolute inset-0 transition duration-300 opacity-0 group-hover:opacity-100 hidden dark:[@media(hover:hover)]:block"
                style={{
                  background: `radial-gradient(800px circle at ${mousePosition.x}px ${mousePosition.y}px, rgba(123, 29, 205, 0.2), transparent 40%)`
                }}
              />

              <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,rgba(123,29,205,0.1)_0%,transparent_70%)] opacity-60"></div>
              </div>
              <div className="relative z-10 max-w-5xl text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black tracking-[0.2em] uppercase mb-4 animate-in fade-in slide-in-from-top-4 duration-1000">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                  System Online v4.0.2
                </div>
                <div ref={textContainerRef} className="relative">
                  <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-black text-gray-900 dark:text-white leading-[0.9] tracking-tighter drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
                    ENGINEER <br className="hidden md:block" />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-gray-400">
                      POWER
                    </span>
                  </h1>
                  {/* Overlay text that appears where shadow overlaps */}
                  <h1
                    aria-hidden="true"
                    className="absolute top-0 left-0 right-0 text-5xl sm:text-7xl md:text-8xl lg:text-[120px] font-black leading-[0.9] tracking-tighter pointer-events-none select-none"
                    style={{
                      color: 'rgba(123, 29, 205, 1)',
                      WebkitMaskImage: `radial-gradient(350px circle at ${textMousePos.x}px ${textMousePos.y}px, black 0%, black 35%, transparent 70%)`,
                      maskImage: `radial-gradient(350px circle at ${textMousePos.x}px ${textMousePos.y}px, black 0%, black 35%, transparent 70%)`
                    }}
                  >
                    ENGINEER <br className="hidden md:block" />
                    <span className="text-primary">POWER</span>
                  </h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-lg md:text-2xl max-w-2xl mx-auto font-light leading-relaxed animate-in fade-in duration-1000 delay-300 px-4 md:px-0">
                  Precision-tuned workstations and high-octane gaming rigs.{" "}
                  <br className="hidden md:block" />
                  Built for the relentless. Driven by data.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10 animate-in fade-in duration-1000 delay-500">
                  <button
                    onClick={() => {
                      setLabInitialParts(undefined);
                      navigateTo("lab");
                    }}
                    className="w-full sm:w-auto px-10 py-5 bg-primary hover:bg-[#6a19b0] text-white text-base font-black uppercase tracking-widest rounded-lg shadow-glow hover:shadow-glow-hover transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Launch Build Lab
                  </button>
                  <button
                    onClick={() => navigateTo("prebuilds")}
                    className="w-full sm:w-auto px-10 py-5 bg-transparent border border-black/10 dark:border-white/20 hover:border-primary dark:hover:border-white text-gray-900 dark:text-white text-base font-black uppercase tracking-widest rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-300"
                  >
                    Explore Models
                  </button>
                </div>
              </div>
              <div className="mt-32 w-full overflow-hidden border-y border-black/5 dark:border-white/5 bg-black/5 dark:bg-black/20 py-4">
                <div className="flex gap-20 animate-marquee whitespace-nowrap text-[10px] font-black tracking-[0.3em] uppercase text-gray-400 dark:text-gray-600">
                  <span>Hyper-Efficient Cooling</span>
                  <span>•</span>
                  <span>Zero Bloatware</span>
                  <span>•</span>
                  <span>Lifetime Technical Support</span>
                  <span>•</span>
                  <span>Hand-Built in India</span>
                  <span>•</span>
                  <span>Component Stress Tested</span>
                  <span>•</span>
                  <span>Custom Wiring Solutions</span>
                </div>
              </div>
            </section>
            <BuildLab />

            <div className="bg-background-light dark:bg-background-dark/50 px-6">
              <div className="max-w-[1440px] mx-auto pt-20 border-t border-black/5 dark:border-white/5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-primary dark:text-cyan-400 text-xs font-black uppercase tracking-[0.3em]">
                    Top Tier Recommends
                  </span>
                  <div className="h-px flex-1 bg-primary/10 dark:bg-cyan-400/20"></div>
                </div>
                <FeaturedPCs
                  onConfigure={handleConfigurePrebuild}
                  onAddToCart={handleAddToCartPrebuild}
                  pcs={recommendedPcs}
                  components={COMPONENT_DATA_DB}
                />
              </div>
            </div>

            <section className="py-20 bg-gray-50 dark:bg-surface-dark/50 border-y border-black/5 dark:border-[#312938]">
              <div className="max-w-[1440px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
                <StatItem value="150+" label="FPS in 4K" />
                <StatItem value="<0.1%" label="Failure Rate" />
                <StatItem value="24/7" label="Support" />
                <StatItem value="3YR" label="Warranty" />
              </div>
            </section>
          </main>
        );
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col ${currentView === "landing" ? "grid-bg" : "bg-background-light dark:bg-background-dark"}`}
    >
      <Navbar
        onNavigateHome={() => navigateTo("landing")}
        onNavigateLab={() => {
          setLabInitialParts(undefined);
          navigateTo("lab");
        }}
        onNavigatePrebuilds={() => navigateTo("prebuilds")}
        onNavigateAccessories={() => navigateTo("accessories")}
        onNavigateSupport={() => navigateTo("support")}
        onNavigateReviews={() => navigateTo("reviews")}
        onNavigateAbout={() => navigateTo("about")}
        onNavigateCart={() => navigateTo("cart")}
        onNavigateAccount={() => navigateTo("account")}
        onNavigateAdmin={() => navigateTo("admin")}
        cartCount={cartItems.length}
        user={user}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {isProductsLoading ? (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background-light dark:bg-background-dark">
          <div className="relative size-24 mb-8">
            <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-t-2 border-primary/30 rounded-full animate-spin [animation-duration:3s]"></div>
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-contain animate-pulse drop-shadow-[0_0_8px_rgba(123,29,205,0.8)]" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h2 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-[0.4em]">Initializing</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse transition-colors">Syncing Neural Database...</p>
          </div>
        </div>
      ) : (
        renderContent()
      )}
      {currentView !== "lab" && currentView !== "auth" && (
        <footer className="mt-auto border-t border-black/5 dark:border-[#312938] bg-white dark:bg-[#0a0a0a] pt-20 pb-10">
          <div className="max-w-[1440px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
              <div className="col-span-1">
                <div
                  className="flex items-center gap-2 mb-6 cursor-pointer"
                  onClick={() => navigateTo("landing")}
                >
                  <img src="/logo.png" alt="VoltPC Logo" className="h-14 w-auto scale-125" />
                  <span className="text-gray-900 dark:text-white text-2xl font-black tracking-widest uppercase">
                    VoltPC
                  </span>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed mb-8">
                  Engineering the apex of personal computing. Custom rigs built
                  for enthusiasts who demand perfection in every frame.
                </p>
              </div>
              <FooterColumn
                title="Shop"
                links={[
                  "Gaming PCs",
                  "Workstations",
                  "Accessories",
                  "Custom Parts",
                ]}
                onClickLink={(l) => {
                  if (l === "Accessories") navigateTo("accessories");
                  if (l === "Gaming PCs" || l === "Workstations")
                    navigateTo("prebuilds");
                  if (l === "Custom Parts") {
                    setLabInitialParts(undefined);
                    navigateTo("lab");
                  }
                }}
              />
              <FooterColumn
                title="Company"
                links={["About Us", "Customer Reviews", "Sustainability", "Newsroom"]}
                onClickLink={(l) => {
                  if (l === "Customer Reviews") navigateTo("reviews");
                  if (l === "About Us") navigateTo("about");
                }}
              />
              <FooterColumn
                title="Support"
                links={["Help Center", "Drivers", "Warranty", "Contact"]}
                onClickLink={() => navigateTo("support")}
              />
            </div>
            <div className="border-t border-black/5 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
              <p className="text-xs text-gray-500">
                © 2024 VoltPC Engineering Corp. All configurations subject to
                stress testing.
              </p>
            </div>
          </div>
        </footer>
      )}
      <AssistantChat />
      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

const FooterColumn = ({ title, links, onClickLink }) => (
  <div>
    <h4 className="text-gray-900 dark:text-white text-xs font-black uppercase tracking-[0.2em] mb-6">
      {title}
    </h4>
    <ul className="space-y-4">
      {links.map((l) => (
        <li key={l}>
          <button
            onClick={() => onClickLink?.(l)}
            className="text-gray-500 hover:text-primary dark:hover:text-white text-sm transition-colors text-left"
          >
            {l}
          </button>
        </li>
      ))}
    </ul>
  </div>
);

export default App;
