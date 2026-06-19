import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  Heart,
  User,
  Sun,
  Moon,
  Search,
  Menu,
  X,
  LogOut,
  Package,
  LayoutDashboard,
  ChevronDown,
  Store,
  Command,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef(null);

  // Track scroll for navbar solidification
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ⌘K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setProfileOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-focus search input
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  // Close profile on outside click
  useEffect(() => {
    if (!profileOpen) return;
    const handleClick = () => setProfileOpen(false);
    setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => document.removeEventListener('click', handleClick);
  }, [profileOpen]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setSearchOpen(false);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate('/');
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'glass-3 shadow-glass border-b border-white/[0.06]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
        <nav className="container-custom h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center relative overflow-hidden"
                 style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}>
              <span className="text-obsidian font-black text-sm relative z-10">S</span>
            </div>
            <span className="text-xl font-bold tracking-tight hidden sm:block">
              <span className="text-frost dark:text-frost">Shop</span>
              <span className="text-gradient">Sphere</span>
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="px-3 py-2 text-sm font-medium text-mist hover:text-electric dark:hover:text-electric rounded-lg hover:bg-white/[0.04] transition-all duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Search Trigger (Desktop) */}
          <button
            onClick={() => setSearchOpen(true)}
            className="hidden md:flex items-center gap-3 flex-1 max-w-sm mx-4 px-4 py-2 rounded-xl text-sm text-smoke hover:text-mist transition-all duration-200 cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="flex-1 text-left">Search products...</span>
            <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-white/[0.06] text-smoke border border-white/[0.08]">
              <Command className="h-2.5 w-2.5" />K
            </kbd>
          </button>

          {/* Right Side Actions */}
          <div className="flex items-center gap-1">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-smoke hover:text-frost hover:bg-white/[0.05] transition-all duration-200"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </button>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl text-smoke hover:text-cyber transition-all duration-200"
              aria-label="Wishlist"
            >
              <Heart className="h-[18px] w-[18px]" />
              {wishlist.length > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full text-[9px] font-bold text-white flex items-center justify-center"
                  style={{ background: '#EC4899', boxShadow: '0 0 8px rgba(236,72,153,0.4)' }}
                >
                  {wishlist.length}
                </motion.span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2.5 rounded-xl text-smoke hover:text-electric transition-all duration-200"
              aria-label="Cart"
            >
              <ShoppingCart className="h-[18px] w-[18px]" />
              {cartCount > 0 && (
                <motion.span
                  key={cartCount}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 h-4 min-w-[16px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center"
                  style={{ background: '#00D4FF', color: '#0A0A0A', boxShadow: '0 0 8px rgba(0,212,255,0.4)' }}
                >
                  {cartCount}
                </motion.span>
              )}
            </Link>

            {/* Auth Section */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen); }}
                  className="flex items-center gap-2 p-1.5 pr-3 rounded-xl hover:bg-white/[0.05] transition-all duration-200"
                >
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center"
                       style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}>
                    <span className="text-obsidian text-xs font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <ChevronDown className={`h-3.5 w-3.5 text-smoke transition-transform duration-200 ${profileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {profileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute right-0 top-full mt-2 w-56 glass-3 rounded-xl shadow-glass-lg py-2 z-50"
                    >
                      <div className="px-4 py-2.5 border-b border-white/[0.06]">
                        <p className="text-sm font-semibold text-frost truncate">{user?.name}</p>
                        <p className="text-xs text-smoke truncate font-mono">{user?.email}</p>
                      </div>

                      <Link to="/profile" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:text-frost hover:bg-white/[0.04] transition-colors">
                        <User className="h-4 w-4" /> My Profile
                      </Link>
                      <Link to="/orders" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:text-frost hover:bg-white/[0.04] transition-colors">
                        <Package className="h-4 w-4" /> My Orders
                      </Link>

                      {isAdmin && (
                        <Link to="/admin/dashboard" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-electric hover:bg-white/[0.04] transition-colors">
                          <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                        </Link>
                      )}

                      {user?.role === 'customer' && (
                        <Link to="/vendor/register" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-mist hover:text-frost hover:bg-white/[0.04] transition-colors">
                          <Store className="h-4 w-4" /> Become a Seller
                        </Link>
                      )}

                      {user?.role === 'vendor' && !user?.vendorProfile?.isApproved && (
                        <div className="flex items-center gap-3 px-4 py-2.5 text-sm text-amber cursor-not-allowed select-none bg-amber/5 font-semibold">
                          <Store className="h-4 w-4 animate-pulse" /> Pending Approval
                        </div>
                      )}

                      {user?.role === 'vendor' && user?.vendorProfile?.isApproved && (
                        <Link to="/vendor/dashboard" onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-electric hover:bg-white/[0.04] transition-colors">
                          <Store className="h-4 w-4" /> Seller Portal
                        </Link>
                      )}

                      <div className="border-t border-white/[0.06] mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-crimson-bright hover:bg-crimson/10 w-full transition-colors">
                          <LogOut className="h-4 w-4" /> Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-sm px-5 py-2 ml-1">
                Sign In
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2.5 rounded-xl text-smoke hover:text-frost hover:bg-white/[0.05] transition-all"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-white/[0.06] overflow-hidden"
              style={{ background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(20px)' }}
            >
              <div className="container-custom py-4 space-y-3">
                {/* Mobile Search */}
                <form onSubmit={handleSearch}>
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-smoke" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products..."
                      className="input-field w-full pl-10 pr-4 py-2.5 text-sm"
                    />
                  </div>
                </form>

                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 text-sm font-medium text-mist hover:text-electric rounded-lg hover:bg-white/[0.04] transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ⌘K Command Search Modal */}
      <AnimatePresence>
        {searchOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full max-w-lg mx-4 glass-3 rounded-2xl shadow-glass-lg overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-3 px-5 py-4">
                <Search className="h-5 w-5 text-electric shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, categories..."
                  className="flex-1 bg-transparent border-0 text-frost placeholder:text-smoke text-base focus:outline-none"
                />
                <kbd className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-white/[0.06] text-smoke border border-white/[0.08]">
                  ESC
                </kbd>
              </form>
              <div className="border-t border-white/[0.06] px-5 py-3">
                <p className="text-xs text-smoke">
                  Press <span className="text-mist font-medium">Enter</span> to search or <span className="text-mist font-medium">ESC</span> to close
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
