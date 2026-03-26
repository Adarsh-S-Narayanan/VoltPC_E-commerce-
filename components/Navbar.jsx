import React from "react";

const Navbar = ({
  onNavigateHome,
  onNavigateLab,
  onNavigatePrebuilds,
  onNavigateAccessories,
  onNavigateSupport,
  onNavigateReviews,
  onNavigateAbout,
  onNavigateCart,
  onNavigateAccount,
  cartCount = 0,
  user = null,
  theme = "dark",
  onToggleTheme,
  onNavigateAdmin,
}) => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const isAdmin = user?.email === "vaultpcgo@gmail.com";
  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="relative z-50 border-b border-black/5 dark:border-[#312938] glass-nav h-20">
        <div className="max-w-[1440px] mx-auto px-6 h-full flex items-center justify-between">
        <div
          className="flex items-center gap-2 group cursor-pointer shrink-0"
          onClick={onNavigateHome}
        >
          <img 
            src="/logofinal.svg" 
            alt="VoltPC Logo" 
            className="h-14 w-auto scale-125 group-hover:drop-shadow-[0_0_8px_rgba(123,29,205,0.8)] transition-all duration-300"
          />
          <h2 className="text-gray-900 dark:text-white text-2xl font-bold tracking-widest uppercase transition-all duration-300 group-hover:text-primary">
            VoltPC
          </h2>
        </div>

        <nav className="hidden lg:flex items-center gap-6 xl:gap-8">
          <NavButton onClick={onNavigateLab} label="Build Lab" />
          <NavButton onClick={onNavigatePrebuilds} label="Pre-builds" />
          <NavButton onClick={onNavigateAccessories} label="Accessories" />
          <NavButton onClick={onNavigateSupport} label="Support" />
          <NavButton onClick={onNavigateReviews} label="Reviews" />
          <NavButton onClick={onNavigateAbout} label="About" />
          {isAdmin && <NavButton onClick={onNavigateAdmin} label="Admin" />}
        </nav>

        <div className="flex items-center gap-2">
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

          {/* Mobile Account Avatar - visible on small screens when signed in */}
          {user && (
            <button
              onClick={onNavigateAccount}
              className="lg:hidden relative flex items-center justify-center w-9 h-9 rounded-full ring-2 ring-primary/40 hover:ring-primary transition-all duration-300 overflow-hidden bg-primary/10 shrink-0"
              title={user.username}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.username}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="text-primary font-black text-sm uppercase">
                  {user.username?.charAt(0)}
                </span>
              )}
            </button>
          )}

          <button
            onClick={onNavigateAccount}
            className={`hidden lg:flex items-center gap-2 border border-black/10 dark:border-[#312938] hover:border-primary text-gray-900 dark:text-white px-4 py-2 rounded-lg transition-all duration-300 shrink-0 ${
              user ? "bg-gray-100 dark:bg-surface-dark" : "bg-primary text-white shadow-glow"
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">
              {user ? "person" : "login"}
            </span>
            <span className="text-sm font-bold uppercase tracking-wide">
              {user ? "Account" : "Sign In"}
            </span>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden relative w-10 h-10 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors flex items-center justify-center z-[60] shrink-0"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between items-center">
              <span className={`block w-6 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out transform ${isMenuOpen ? 'rotate-45 translate-y-[9px]' : ''}`}></span>
              <span className={`block w-6 h-0.5 bg-current rounded-full transition-all duration-200 ease-in-out ${isMenuOpen ? 'opacity-0 scale-x-0' : 'opacity-100'}`}></span>
              <span className={`block w-6 h-0.5 bg-current rounded-full transition-all duration-300 ease-in-out transform ${isMenuOpen ? '-rotate-45 -translate-y-[9px]' : ''}`}></span>
            </div>
          </button>
        </div>
      </div>
    </div>

      <div
        className={`fixed inset-0 bg-background-light/98 dark:bg-background-dark/98 backdrop-blur-2xl z-[55] transition-all duration-500 ease-[cubic-bezier(0.16, 1, 0.3, 1)] lg:hidden ${
          isMenuOpen ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
        <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 pointer-events-none"></div>
        

        <nav className="relative flex flex-col items-center justify-center h-full gap-6 p-6 text-center">
          <div className="w-full max-w-xs space-y-6">
            <MobileNavButton
              isOpen={isMenuOpen}
              index={0}
              onClick={() => {
                onNavigateHome();
                setIsMenuOpen(false);
              }}
              label="Home"
            />
            <MobileNavButton
              isOpen={isMenuOpen}
              index={1}
              onClick={() => {
                onNavigateLab();
                setIsMenuOpen(false);
              }}
              label="Build Lab"
            />
            <MobileNavButton
              isOpen={isMenuOpen}
              index={2}
              onClick={() => {
                onNavigatePrebuilds();
                setIsMenuOpen(false);
              }}
              label="Pre-builds"
            />
            <MobileNavButton
              isOpen={isMenuOpen}
              index={3}
              onClick={() => {
                onNavigateAccessories();
                setIsMenuOpen(false);
              }}
              label="Accessories"
            />
            <MobileNavButton
              isOpen={isMenuOpen}
              index={4}
              onClick={() => {
                onNavigateSupport();
                setIsMenuOpen(false);
              }}
              label="Support"
            />
            <MobileNavButton
              isOpen={isMenuOpen}
              index={5}
              onClick={() => {
                onNavigateReviews();
                setIsMenuOpen(false);
              }}
              label="Reviews"
            />
            <MobileNavButton
              isOpen={isMenuOpen}
              index={6}
              onClick={() => {
                onNavigateAbout();
                setIsMenuOpen(false);
              }}
              label="About"
            />
            {isAdmin && (
              <MobileNavButton
                isOpen={isMenuOpen}
                index={7}
                onClick={() => {
                  onNavigateAdmin();
                  setIsMenuOpen(false);
                }}
                label="Admin"
              />
            )}
            
            {!user && (
              <div 
                className={`pt-6 transition-all duration-500 delay-500 ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              >
                <button
                  onClick={() => {
                    onNavigateAccount();
                    setIsMenuOpen(false);
                  }}
                  className="w-full py-4 bg-primary text-white rounded-xl font-black uppercase tracking-widest shadow-glow hover:shadow-glow-hover transition-all duration-300"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Top-level Back button */}
        <button
          onClick={() => setIsMenuOpen(false)}
          className={`absolute top-8 left-8 text-gray-500 hover:text-primary transition-all duration-500 delay-300 lg:hidden flex items-center gap-2 group z-[70] ${isMenuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
        >
          <span className="material-symbols-outlined text-xl group-hover:-translate-x-1 transition-transform">
            arrow_back
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em]">Back</span>
        </button>
      </div>
    </div>
  );
};

const MobileNavButton = ({ onClick, label, index, isOpen }) => (
  <button
    onClick={onClick}
    className={`w-full text-gray-900 dark:text-white text-4xl font-black uppercase tracking-tighter hover:text-primary transition-all duration-300 text-center ${
      isOpen ? "animate-menu-item opacity-100" : "opacity-0"
    }`}
    style={{ 
      animationDelay: `${index * 100}ms`,
      animationFillMode: 'forwards'
    }}
  >
    {label}
  </button>
);

const NavButton = ({ onClick, label }) => (
  <button
    onClick={onClick}
    className="text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white text-sm font-medium uppercase tracking-wider transition-colors whitespace-nowrap"
  >
    {label}
  </button>
);

export default Navbar;
