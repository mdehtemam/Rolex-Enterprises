import { useState, createContext, useContext } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { CategoryProducts } from './pages/CategoryProducts';
import { AdminLogin } from './pages/AdminLogin';
import { ManageProducts } from './pages/ManageProducts';
import { ManageCategories } from './pages/ManageCategories';

type View = 'home' | 'category' | 'admin-login' | 'manage-products' | 'manage-categories';

interface RefreshContextType {
  refreshKey: number;
  triggerRefresh: () => void;
}

const RefreshContext = createContext<RefreshContextType>({ refreshKey: 0, triggerRefresh: () => {} });

export const useRefresh = () => useContext(RefreshContext);

function AppContent() {
  const [currentView, setCurrentView] = useState<View>('home');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [refreshKey, setRefreshKey] = useState(0);
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

  const triggerRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  return (
    <RefreshContext.Provider value={{ refreshKey, triggerRefresh }}>
      <div className="min-h-screen bg-slate-50">
        <Header currentView={currentView} onNavigate={handleNavigate} />

        {currentView === 'home' && <Home key={refreshKey} onCategoryClick={handleCategoryClick} />}

        {currentView === 'category' && (
          <CategoryProducts key={refreshKey + selectedCategoryId} categoryId={selectedCategoryId} onBack={() => setCurrentView('home')} />
        )}

        {currentView === 'admin-login' && <AdminLogin onLoginSuccess={handleAdminLoginSuccess} />}

        {currentView === 'manage-products' && isAdmin && <ManageProducts onProductsAdded={triggerRefresh} />}

        {currentView === 'manage-categories' && isAdmin && <ManageCategories onCategoriesChanged={triggerRefresh} />}
      </div>
    </RefreshContext.Provider>
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
