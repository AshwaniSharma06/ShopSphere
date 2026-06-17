import { Link } from 'react-router-dom';
import { Github, Twitter, Instagram, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Shop: [
      { label: 'All Products', to: '/shop' },
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
      { label: 'Contact Us', to: '#' },
      { label: 'FAQs', to: '#' },
      { label: 'Shipping Info', to: '#' },
      { label: 'Returns', to: '#' },
    ],
  };

  return (
    <footer className="bg-surface-900 dark:bg-surface-950 text-surface-300 border-t border-surface-800">
      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="text-xl font-bold text-white">
                Shop<span className="text-primary-400">Sphere</span>
              </span>
            </Link>
            <p className="text-sm text-surface-400 leading-relaxed max-w-xs">
              Elevate your shopping experience with premium products, smart recommendations, and seamless checkout.
            </p>
            <div className="flex gap-3">
              {[Github, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="p-2 rounded-lg bg-surface-800 hover:bg-primary-600 text-surface-400 hover:text-white transition-all duration-200"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-surface-400 hover:text-primary-400 transition-colors"
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

      {/* Bottom Bar */}
      <div className="border-t border-surface-800">
        <div className="container-custom py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-surface-500">
          <p>&copy; {currentYear} ShopSphere. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-surface-300 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-surface-300 transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
