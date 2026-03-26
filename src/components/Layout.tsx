import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import {
  LayoutDashboard,
  Package,
  Users,
  MessageSquare,
  Bell,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Leads', href: '/leads', icon: Users },
  { name: 'WhatsApp', href: '/whatsapp', icon: MessageSquare },
  { name: 'Notifications', href: '/notifications', icon: Bell },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-zinc-200">
        <div className="p-6">
          <h1 className="text-xl font-bold text-zinc-900 flex items-center gap-2">
            <MessageSquare className="text-emerald-600" />
            WholesaleAI
          </h1>
        </div>

        <nav className="flex-1 px-4 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
                )}
              >
                <item.icon
                  className={cn('w-5 h-5', isActive ? 'text-emerald-600' : 'text-zinc-400')}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-zinc-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
              {user?.email?.[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-zinc-600 rounded-lg hover:bg-red-50 hover:text-red-700 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-zinc-200 px-4 flex items-center justify-between z-50">
        <h1 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
          <MessageSquare className="text-emerald-600 w-5 h-5" />
          WholesaleAI
        </h1>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-zinc-600 hover:bg-zinc-100 rounded-lg"
        >
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-40 pt-16">
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg',
                    isActive ? 'bg-emerald-50 text-emerald-700' : 'text-zinc-600'
                  )}
                >
                  <item.icon
                    className={cn('w-6 h-6', isActive ? 'text-emerald-600' : 'text-zinc-400')}
                  />
                  {item.name}
                </Link>
              );
            })}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 text-base font-medium text-red-600 rounded-lg"
            >
              <LogOut className="w-6 h-6" />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-0 overflow-auto">
        <div className="max-w-7xl mx-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
