import { Package, Grid, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export function Header({ currentView, onNavigate }: HeaderProps) {
  const { isAdmin, logout } = useAuth();

  return (
    <header className="bg-slate-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="bg-slate-700 p-2 rounded-lg">
              <Package className="w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-xl font-bold">Rolex Enterprises</h1>
              <p className="text-sm text-slate-300">Product Price Checker</p>
            </div>
          </button>

          {isAdmin ? (
            <nav className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('home')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  currentView === 'home'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Grid className="w-4 h-4" />
                Categories
              </button>
              <button
                onClick={() => onNavigate('manage-products')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  currentView === 'manage-products'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Package className="w-4 h-4" />
                Manage Products
              </button>
              <button
                onClick={() => onNavigate('manage-categories')}
                className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  currentView === 'manage-categories'
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-300 hover:bg-slate-700/50'
                }`}
              >
                <Grid className="w-4 h-4" />
                Manage Categories
              </button>
              <button
                onClick={() => {
                  logout();
                  onNavigate('home');
                }}
                className="px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </nav>
          ) : (
            <button
              onClick={() => onNavigate('admin-login')}
              className="px-4 py-2 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors flex items-center gap-2"
            >
              <Lock className="w-4 h-4" />
              Admin Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
