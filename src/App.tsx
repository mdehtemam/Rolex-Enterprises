import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { CategoryProducts } from './pages/CategoryProducts';
import { AdminLogin } from './pages/AdminLogin';
import { ManageProducts } from './pages/ManageProducts';
import { ManageCategories } from './pages/ManageCategories';

type View = 'home' | 'category' | 'admin-login' | 'manage-products' | 'manage-categories';

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const { isAdmin } = useAuth();

  function handleNavigate(view: string) {
    if (view === 'admin' && !isAdmin) {
      setCurrentView('admin-login');
    } else {
      setCurrentView(view as View);
    }
  }

  function handleCategoryClick(categoryId: string) {
    setSelectedCategoryId(categoryId);
    setCurrentView('category');
  }

  function handleAdminLoginSuccess() {
    setCurrentView('manage-products');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header currentView={currentView} onNavigate={handleNavigate} />

      {currentView === 'home' && <Home onCategoryClick={handleCategoryClick} />}

      {currentView === 'category' && (
        <CategoryProducts categoryId={selectedCategoryId} onBack={() => setCurrentView('home')} />
      )}

      {currentView === 'admin-login' && <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />}

      {currentView === 'manage-products' && isAdmin && <ManageProducts />}

      {currentView === 'manage-categories' && isAdmin && <ManageCategories />}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
