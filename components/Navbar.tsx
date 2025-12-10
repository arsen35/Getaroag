import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, UserCircle, LogOut, Sun, Moon, UserPlus, LogIn, Search, Plus, Heart, Home } from 'lucide-react';
import { checkAuthStatus } from '../services/firebase';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = checkAuthStatus();
  const { theme, toggleTheme } = useTheme();

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* DESKTOP TOP NAVIGATION (Hidden on Mobile) */}
      <nav className="hidden md:block bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-primary-600 text-white p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
                <Car size={24} />
              </div>
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 block">
                Getaroag
              </span>
            </Link>

            {/* Desktop Menu Items */}
            <div className="flex items-center space-x-4">
               {/* Theme Toggle */}
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mr-2"
                title={theme === 'light' ? "Karanlık Mod" : "Aydınlık Mod"}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              <Link to="/search" className="text-gray-600 dark:text-gray-300 hover:text-primary-600 font-medium transition-colors px-3 py-2">Araç Kirala</Link>
              
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link 
                    to="/profile"
                    className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 font-medium"
                  >
                    <UserCircle size={20} />
                    <span>Hesabım</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-500"
                    title="Çıkış Yap"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    to="/login" 
                    className="flex items-center gap-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 font-medium px-3 py-2"
                  >
                    <LogIn size={18} /> Giriş Yap
                  </Link>
                  <Link 
                    to="/signup" 
                    className="bg-primary-600 text-white px-5 py-2.5 rounded-full font-bold hover:bg-primary-700 transition-colors shadow-md shadow-primary-200 flex items-center gap-2"
                  >
                    <UserPlus size={18} /> Üye Ol
                  </Link>
                </div>
              )}

              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>

              <Link
                to="/list-car"
                className="bg-white dark:bg-gray-800 border-2 border-primary-600 text-primary-600 dark:text-primary-400 px-5 py-2.5 rounded-full font-bold hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Aracını Listele
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE APP-LIKE NAVIGATION */}
      
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-sm dark:border-b dark:border-gray-800 transition-colors duration-300">
         <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
              <Car size={20} />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
              Getaroag
            </span>
          </Link>

          <button 
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
      </div>

      {/* Mobile Bottom Navigation (Floating Button Style) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 z-50 pb-safe transition-colors duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.4)] border-t dark:border-gray-800">
        <div className="relative flex justify-between items-center px-2 h-16">
          
          {/* Left Items */}
          <Link to="/" className={`flex-1 flex flex-col items-center justify-center space-y-1 ${isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
            <Home size={24} strokeWidth={isActive('/') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Akış</span>
          </Link>
          
          <Link to="/search" className={`flex-1 flex flex-col items-center justify-center space-y-1 ${isActive('/search') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
            <Search size={24} strokeWidth={isActive('/search') ? 2.5 : 2} />
            <span className="text-[10px] font-medium">Ara</span>
          </Link>

          {/* Floating Center Button */}
          <div className="relative -top-6">
             <Link 
               to="/list-car" 
               className="flex items-center justify-center w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg shadow-primary-600/40 border-4 border-gray-50 dark:border-gray-900 transition-all transform active:scale-95"
             >
               <Plus size={32} />
             </Link>
          </div>

          {/* Right Items */}
          <Link to="/" className={`flex-1 flex flex-col items-center justify-center space-y-1 ${'text-gray-400 dark:text-gray-500'}`}>
            <Heart size={24} />
            <span className="text-[10px] font-medium">Favoriler</span>
          </Link>

          {isLoggedIn ? (
            <Link to="/profile" className={`flex-1 flex flex-col items-center justify-center space-y-1 ${isActive('/profile') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <UserCircle size={24} strokeWidth={isActive('/profile') ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Profil</span>
            </Link>
          ) : (
            <Link to="/login" className={`flex-1 flex flex-col items-center justify-center space-y-1 ${isActive('/login') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
              <LogIn size={24} strokeWidth={isActive('/login') ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Giriş</span>
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export default Navbar;