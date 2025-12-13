import React, { ReactNode } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './pages/Home';
import SearchPage from './pages/Search';
import ListCarPage from './pages/ListCar';
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

// Simple Error Boundary Component to prevent white screen crashes
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center bg-gray-50">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Bir şeyler ters gitti.</h1>
          <p className="text-gray-600 mb-4">Uygulama yüklenirken bir hata oluştu.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg font-bold"
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
              {/* Default catch-all redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </HashRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;