
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, UserCircle, LogOut, Sun, Moon, LogIn, Search, Plus, Heart, Home, Bell, X, Info, CheckCircle, Clock, LayoutDashboard, MessageSquare, ChevronDown, CreditCard, ShieldCheck, Gift } from 'lucide-react';
import { checkAuthStatus } from '../services/firebase';
import { useTheme } from '../context/ThemeContext';

const MobileBottomNav = () => {
  const location = useLocation();
  const isLoggedIn = checkAuthStatus();
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white dark:bg-gray-900 z-[9000] pb-safe transition-colors duration-300 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-5px_20px_rgba(0,0,0,0.4)] border-t dark:border-gray-800">
      <div className="relative flex justify-between items-center px-2 h-16">
        <Link to="/" className={`flex-1 flex flex-col items-center justify-center space-y-1 ${isActive('/') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <Home size={22} strokeWidth={isActive('/') ? 2.5 : 2} />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Akış</span>
        </Link>
        <Link to="/messages" className={`flex-1 flex flex-col items-center justify-center space-y-1 ${isActive('/messages') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <MessageSquare size={22} strokeWidth={isActive('/messages') ? 2.5 : 2} />
          <span className="text-[9px] font-bold uppercase tracking-tighter">Mesajlar</span>
        </Link>
        <div className="relative -top-6">
            <Link to="/list-car" className="flex items-center justify-center w-14 h-14 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg shadow-primary-600/40 border-4 border-gray-50 dark:border-gray-900 transition-all transform active:scale-95">
              <Plus size={28} />
            </Link>
        </div>
        <Link to="/dashboard" className={`flex-1 flex flex-col items-center justify-center space-y-1 ${isActive('/dashboard') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
          <LayoutDashboard size={22} strokeWidth={isActive('/dashboard') ? 2.5 : 2}/>
          <span className="text-[9px] font-bold uppercase tracking-tighter">Panel</span>
        </Link>
        {isLoggedIn ? (
          <Link to="/profile" className={`flex-1 flex flex-col items-center justify-center space-y-1 ${isActive('/profile') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
            <UserCircle size={22} strokeWidth={isActive('/profile') ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Profil</span>
          </Link>
        ) : (
          <Link to="/login" className={`flex-1 flex flex-col items-center justify-center space-y-1 ${isActive('/login') ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`}>
            <LogIn size={22} strokeWidth={isActive('/login') ? 2.5 : 2} />
            <span className="text-[9px] font-bold uppercase tracking-tighter">Giriş</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = checkAuthStatus();
  const { theme, toggleTheme } = useTheme();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (profile.name) setUser(profile);

    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav className="hidden md:block bg-white/95 dark:bg-gray-900/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-primary-600 text-white p-2 rounded-lg group-hover:bg-primary-700 transition-colors">
                <Car size={24} />
              </div>
              <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 block uppercase tracking-tighter">
                Getaroag
              </span>
            </Link>

            <div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors">
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link to="/messages" className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-full transition-colors relative">
                    <MessageSquare size={20} />
                  </Link>
                  
                  <div className="relative" ref={notificationRef}>
                    <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 rounded-full relative">
                      <Bell size={20} />
                    </button>
                  </div>

                  <Link to="/dashboard" className={`text-gray-600 dark:text-gray-300 hover:text-primary-600 font-black text-[10px] uppercase tracking-widest px-3 py-2 flex items-center gap-2 border-2 border-transparent hover:border-primary-100 rounded-2xl transition-all ${isActive('/dashboard') ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                    <LayoutDashboard size={18} /> Panel
                  </Link>

                  <div className="relative" ref={profileMenuRef}>
                    <button 
                      onClick={() => setShowProfileMenu(!showProfileMenu)}
                      className="flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 px-4 py-2 rounded-full border-2 border-primary-100 dark:border-primary-800 hover:border-primary-300 transition-all"
                    >
                      {user?.avatar ? (
                        <img src={user.avatar} className="w-6 h-6 rounded-full object-cover" />
                      ) : (
                        <UserCircle size={20} className="text-primary-600" />
                      )}
                      <span className="text-sm font-bold text-primary-700 dark:text-primary-300">{user?.name || 'Hesabım'}</span>
                      <ChevronDown size={14} className={`text-primary-600 transition-transform ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </button>

                    {showProfileMenu && (
                      <div className="absolute right-0 mt-3 w-72 bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-black text-xl">
                            {user?.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" /> : user?.name?.[0]}
                          </div>
                          <div>
                            <h4 className="font-black text-sm uppercase text-gray-900 dark:text-white leading-none">{user?.name} {user?.surname}</h4>
                            <button onClick={() => { navigate('/profile'); setShowProfileMenu(false); }} className="text-[10px] font-bold text-primary-600 uppercase hover:underline mt-1">Hesabını Düzenle</button>
                          </div>
                        </div>
                        <div className="p-2">
                           <button onClick={() => { navigate('/profile?tab=verify'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <ShieldCheck size={18} className="text-gray-400" />
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Profilini Doğrula</span>
                           </button>
                           <button onClick={() => { navigate('/profile?tab=rentals'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <Clock size={18} className="text-gray-400" />
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Kiralamalarım</span>
                           </button>
                           <button onClick={() => { navigate('/messages'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                              <MessageSquare size={18} className="text-gray-400" />
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Mesajlar</span>
                           </button>
                           <button onClick={() => { navigate('/profile?tab=payments'); setShowProfileMenu(false); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b dark:border-gray-700 pb-4 mb-2">
                              <CreditCard size={18} className="text-gray-400" />
                              <span className="text-sm font-bold text-gray-700 dark:text-gray-200">Ödemeler</span>
                           </button>
                           <div className="bg-gray-50 dark:bg-gray-900/50 m-2 p-4 rounded-2xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Gift size={18} className="text-primary-600" />
                                <span className="text-xs font-bold text-gray-700 dark:text-gray-200">₺500 kredi kazan</span>
                              </div>
                              <Gift size={14} className="text-gray-400" />
                           </div>
                           <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-red-50 text-red-600 transition-colors mt-2">
                              <LogOut size={18} />
                              <span className="text-sm font-bold">Çıkış Yap</span>
                           </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-gray-700 dark:text-gray-200 hover:text-primary-600 font-bold px-3 py-2 text-sm">Giriş Yap</Link>
                  <Link to="/signup" className="bg-primary-600 text-white px-5 py-2.5 rounded-full font-black text-sm hover:bg-primary-700 transition-colors shadow-md flex items-center gap-2">Üye Ol</Link>
                </div>
              )}
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2"></div>
              <Link to="/list-car" className="bg-white dark:bg-gray-800 border-2 border-primary-600 text-primary-600 dark:text-primary-400 px-5 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-primary-50 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm">
                Aracını Listele
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="md:hidden sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md px-4 py-3 flex justify-between items-center shadow-sm transition-colors duration-300">
         <Link to="/" className="flex items-center space-x-2">
            <div className="bg-primary-600 text-white p-1.5 rounded-lg">
              <Car size={20} />
            </div>
            <span className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 uppercase tracking-tighter">
              Getaroag
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300">{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
          </div>
      </div>
      {createPortal(<MobileBottomNav />, document.body)}
    </>
  );
};

export default Navbar;
