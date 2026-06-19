import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');

  const footerLinks = {
    Products: [
      { label: 'Shop All', to: '/shop' },
      { label: 'Featured', to: '/shop?featured=true' },
      { label: 'Trending', to: '/shop?trending=true' },
      { label: 'New Arrivals', to: '/shop?sort=newest' },
    ],
    Account: [
      { label: 'My Profile', to: '/profile' },
      { label: 'My Orders', to: '/orders' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Cart', to: '/cart' },
    ],
    Support: [
      { label: 'Help Center', to: '#' },
      { label: 'Contact Us', to: '#' },
      { label: 'Shipping Info', to: '#' },
      { label: 'Returns', to: '#' },
    ],
    Legal: [
      { label: 'Privacy Policy', to: '#' },
      { label: 'Terms of Service', to: '#' },
      { label: 'Cookie Policy', to: '#' },
      { label: 'GDPR', to: '#' },
    ],
  };

  return (
    <footer className="relative overflow-hidden" style={{ background: '#0A0A0A' }}>
      {/* Gradient Top Border */}
      <div className="h-[1px] w-full" style={{
        background: 'linear-gradient(90deg, transparent, #00D4FF, #A855F7, #EC4899, transparent)',
      }} />

      {/* Main Footer */}
      <div className="container-custom py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-4 space-y-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-lg flex items-center justify-center"
                   style={{ background: 'linear-gradient(135deg, #00D4FF, #A855F7)' }}>
                <span className="text-obsidian font-black text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-frost">
                Shop<span className="text-gradient">Sphere</span>
              </span>
            </Link>
            <p className="text-sm text-smoke leading-relaxed max-w-xs">
              The future of premium online shopping. AI-powered recommendations,
              immersive experiences, and seamless checkout.
            </p>

            {/* Newsletter */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-mist uppercase tracking-widest">Stay Updated</h4>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="input-field flex-1 py-2.5 text-sm"
                />
                <button className="btn-primary px-4 py-2.5 text-sm">
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex gap-3">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2.5 rounded-xl transition-all duration-200 text-smoke hover:text-electric"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h4 className="text-xs font-bold text-mist uppercase tracking-widest mb-5">
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-smoke hover:text-electric transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/[0.04]">
        <div className="container-custom py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-smoke">
            &copy; {currentYear} ShopSphere. Crafted with precision.
          </p>
          <div className="flex items-center gap-2 text-[10px] text-smoke/60">
            <span className="h-1.5 w-1.5 rounded-full bg-plasma animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at bottom right, rgba(168,85,247,0.04) 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-96 h-96 pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at bottom left, rgba(0,212,255,0.03) 0%, transparent 70%)' }} />
    </footer>
  );
}
