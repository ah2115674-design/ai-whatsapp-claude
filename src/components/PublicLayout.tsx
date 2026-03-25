import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageSquare, Menu, X, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Features', path: '/features' },
    { name: 'Pricing', path: '/pricing' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar */}
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
        isScrolled ? "bg-white/80 backdrop-blur-xl border-b border-zinc-100 shadow-sm py-3" : "bg-transparent"
      )}>
        <div className="container mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
              <MessageSquare className="text-white" size={20} />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900">WhatsApp<span className="text-emerald-600">CRM</span></span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-bold transition-colors",
                  location.pathname === link.path ? "text-emerald-600" : "text-zinc-600 hover:text-zinc-900"
                )}
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-4 ml-4">
              <Link to="/auth" className="text-sm font-bold text-zinc-600 hover:text-zinc-900 transition-colors">
                Login
              </Link>
              <Link
                to="/auth"
                className="px-6 py-2.5 text-sm font-bold text-white bg-zinc-900 rounded-xl hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-zinc-600 hover:bg-zinc-100 rounded-xl transition-colors"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={cn(
        "fixed inset-0 z-40 bg-white md:hidden transition-all duration-500 pt-24 px-6",
        isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="flex flex-col gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className="text-2xl font-bold text-zinc-900 hover:text-emerald-600 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          <hr className="border-zinc-100" />
          <Link to="/auth" className="text-xl font-bold text-zinc-600">Login</Link>
          <Link
            to="/auth"
            className="w-full py-4 text-center text-xl font-bold text-white bg-emerald-600 rounded-2xl shadow-xl shadow-emerald-500/20"
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-zinc-900 text-white py-20">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <Link to="/" className="flex items-center gap-2 mb-6">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                  <MessageSquare className="text-white" size={16} />
                </div>
                <span className="text-lg font-bold tracking-tight">WhatsApp<span className="text-emerald-400">CRM</span></span>
              </Link>
              <p className="text-zinc-500 text-sm leading-relaxed">
                The most powerful AI-driven WhatsApp CRM for modern sales teams. Automate conversations and grow faster.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-zinc-100">Product</h4>
              <ul className="space-y-4 text-sm text-zinc-500">
                <li><Link to="/features" className="hover:text-emerald-400 transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-emerald-400 transition-colors">Pricing</Link></li>
                <li><button className="hover:text-emerald-400 transition-colors">API Documentation</button></li>
                <li><button className="hover:text-emerald-400 transition-colors">Integrations</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-zinc-100">Company</h4>
              <ul className="space-y-4 text-sm text-zinc-500">
                <li><button className="hover:text-emerald-400 transition-colors">About Us</button></li>
                <li><button className="hover:text-emerald-400 transition-colors">Careers</button></li>
                <li><button className="hover:text-emerald-400 transition-colors">Blog</button></li>
                <li><Link to="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-6 text-zinc-100">Legal</h4>
              <ul className="space-y-4 text-sm text-zinc-500">
                <li><button className="hover:text-emerald-400 transition-colors">Privacy Policy</button></li>
                <li><button className="hover:text-emerald-400 transition-colors">Terms of Service</button></li>
                <li><button className="hover:text-emerald-400 transition-colors">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-600 text-xs">© 2026 WhatsAppCRM AI. All rights reserved.</p>
            <div className="flex gap-6">
              {['Twitter', 'LinkedIn', 'GitHub'].map(s => (
                <button key={s} className="text-zinc-600 hover:text-emerald-400 transition-colors text-xs font-bold uppercase tracking-widest">{s}</button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
