import React from "react";

const Navbar = ({
  onNavigateHome,
  onNavigateLab,
  onNavigatePrebuilds,
  onNavigateAccessories,
  onNavigateSupport,
  onNavigateReviews,
  onNavigateCart,
  onNavigateAccount,
  cartCount = 0,
  user = null,
  theme = "dark",
  onToggleTheme,
  onNavigateAdmin,
}) => {
  const isAdmin = user?.email === "admin@voltpc.com";
  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b border-black/5 dark:border-[#312938] glass-nav">
      <div className="max-w-[1440px] mx-auto px-6 h-20 flex items-center justify-between">
        <div
          className="flex items-center gap-2 group cursor-pointer"
          onClick={onNavigateHome}
        >
          <span className="material-symbols-outlined text-primary text-3xl group-hover:drop-shadow-[0_0_8px_rgba(123,29,205,0.8)] transition-all duration-300">
            bolt
          </span>
          <h2 className="text-gray-900 dark:text-white text-2xl font-bold tracking-widest uppercase transition-all duration-300 group-hover:text-primary">
            VoltPC
          </h2>
        </div>

        <nav className="hidden md:flex items-center gap-10">
          <NavButton onClick={onNavigateLab} label="Build Lab" />
          <NavButton onClick={onNavigatePrebuilds} label="Pre-builds" />
          <NavButton onClick={onNavigateAccessories} label="Accessories" />
          <NavButton onClick={onNavigateSupport} label="Support" />
          <NavButton onClick={onNavigateReviews} label="Reviews" />
          {isAdmin && <NavButton onClick={onNavigateAdmin} label="Admin" />}
        </nav>

        <div className="flex items-center gap-4">
          <button
            onClick={onToggleTheme}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors flex items-center justify-center"
            title="Toggle Neural Theme"
          >
            <span className="material-symbols-outlined">
              {theme === "dark" ? "light_mode" : "dark_mode"}
            </span>
          </button>

          <button
            onClick={onNavigateCart}
            className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined">shopping_cart</span>
            {cartCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-[10px] font-black items-center justify-center text-white">
                  {cartCount}
                </span>
              </span>
            )}
          </button>

          <button
            onClick={onNavigateAccount}
            className={`hidden sm:flex items-center gap-2 border border-black/10 dark:border-[#312938] hover:border-primary text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-all duration-300 ${
              user
                ? "bg-gray-100 dark:bg-surface-dark"
                : "bg-primary text-white shadow-glow"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {user ? "person" : "login"}
            </span>
            <span className="text-sm font-bold uppercase tracking-wide">
              {user ? "Account" : "Sign In"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

const NavButton = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white text-sm font-medium uppercase tracking-wider transition-colors"
  >
    {label}
  </button>
);

export default Navbar;
