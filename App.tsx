
import React, { ReactNode, Component } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home';
import SearchPage from './pages/Search';
import ListCarPage from './pages/ListCarPage';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import ProfilePage from './pages/Profile';
import PaymentPage from './pages/Payment';
import FavoritesPage from './pages/Favorites';
import { ThemeProvider } from './context/ThemeContext';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Fixed: Inheriting from Component instead of React.Component to ensure types are correctly resolved in this environment.
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Fixed: Initializing state property directly within the class.
  public state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(_: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Crash:", error, errorInfo);
  }

  render() {
    // Fixed: State and props are now correctly recognized as inherited from the Component class.
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50 dark:bg-gray-900">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">Bir şeyler ters gitti.</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">Uygulama yüklenirken bir hata oluştu.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold"
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <HashRouter>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/list-car" element={<ListCarPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/favorites" element={<FavoritesPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
