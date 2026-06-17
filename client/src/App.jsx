import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

const Home = () => (
  <div className="p-8 max-w-4xl mx-auto text-center">
    <h1 className="text-4xl font-extrabold tracking-tight text-primary-600 sm:text-5xl">Welcome to ShopSphere</h1>
    <p className="mt-4 text-lg text-slate-500">Elevate your shopping experience with our premium full-stack platform.</p>
    <div className="mt-8 flex justify-center gap-4">
      <Link to="/shop" className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition">Browse Products</Link>
      <Link to="/login" className="bg-white border border-slate-200 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition">Sign In</Link>
    </div>
  </div>
);

const Shop = () => (
  <div className="p-8 max-w-6xl mx-auto">
    <h1 className="text-3xl font-bold text-slate-900">Product Catalog</h1>
    <p className="text-slate-500 mt-2">Explore our list of high-quality products.</p>
    <div className="mt-6 p-12 bg-white border border-slate-100 rounded-2xl text-center text-slate-400">
      Product grid placeholder - Database connection pending.
    </div>
  </div>
);

const Cart = () => (
  <div className="p-8 max-w-4xl mx-auto">
    <h1 className="text-3xl font-bold text-slate-900">Your Shopping Cart</h1>
    <div className="mt-6 p-8 bg-white border border-slate-100 rounded-2xl text-center text-slate-400">
      Your cart is empty.
    </div>
  </div>
);

const Login = () => (
  <div className="p-8 max-w-md mx-auto bg-white border border-slate-100 rounded-2xl shadow-sm mt-12">
    <h2 className="text-2xl font-bold text-slate-900 text-center">Sign In</h2>
    <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className="block text-sm font-medium text-slate-700">Email Address</label>
        <input type="email" className="mt-1 w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="user@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input type="password" className="mt-1 w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="••••••••" />
      </div>
      <button className="w-full bg-primary-600 text-white p-3 rounded-lg font-medium hover:bg-primary-700 transition">Log In</button>
    </form>
  </div>
);

const Register = () => (
  <div className="p-8 max-w-md mx-auto bg-white border border-slate-100 rounded-2xl shadow-sm mt-12">
    <h2 className="text-2xl font-bold text-slate-900 text-center">Create Account</h2>
    <form className="mt-6 space-y-4" onSubmit={(e) => e.preventDefault()}>
      <div>
        <label className="block text-sm font-medium text-slate-700">Name</label>
        <input type="text" className="mt-1 w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="John Doe" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Email Address</label>
        <input type="email" className="mt-1 w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="user@example.com" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input type="password" className="mt-1 w-full p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500" placeholder="••••••••" />
      </div>
      <button className="w-full bg-primary-600 text-white p-3 rounded-lg font-medium hover:bg-primary-700 transition">Sign Up</button>
    </form>
  </div>
);

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col justify-between">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
          <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold tracking-tight text-slate-900">
              Shop<span className="text-primary-600">Sphere</span>
            </Link>
            <div className="flex gap-6 text-sm font-medium text-slate-600">
              <Link to="/shop" className="hover:text-primary-600 transition">Shop</Link>
              <Link to="/cart" className="hover:text-primary-600 transition">Cart</Link>
              <Link to="/login" className="hover:text-primary-600 transition">Sign In</Link>
              <Link to="/register" className="hover:text-primary-600 transition">Sign Up</Link>
            </div>
          </nav>
        </header>

        <main className="flex-grow py-12">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </main>

        <footer className="border-t border-slate-100 bg-white py-6 text-center text-sm text-slate-400">
          &copy; {new Date().getFullYear()} ShopSphere. All rights reserved.
        </footer>
      </div>
    </Router>
  );
}
