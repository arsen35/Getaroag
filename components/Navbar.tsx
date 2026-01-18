
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Car, UserCircle, LogOut, Sun, Moon, LogIn, Search, Plus, Heart, Home, Bell, X, Info, CheckCircle, Clock, LayoutDashboard, MessageSquare } from 'lucide-react';
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

const Toast = ({ title, message, onClose }: { title: string, message: string, onClose: () => void }) => (
  <div className="fixed top-20 md:top-6 right-4 z-[10000] w-full max-w-sm animate-in slide-in-from-right fade-in duration-300">
    <div className="bg-primary-600 text-white p-5 rounded-[2rem] shadow-2xl flex items-start gap-4 border border-white/20 backdrop-blur-md">
      <div className="bg-white/20 p-2 rounded-full mt-1">
        <Bell size={20} />
      </div>
      <div className="flex-1">
        <h4 className="font-black text-xs uppercase tracking-widest">{title}</h4>
        <p className="text-[11px] font-medium mt-1 leading-relaxed opacity-90">{message}</p>
      </div>
      <button onClick={onClose} className="text-white/60 hover:text-white transition-colors">
        <X size={18} />
      </button>
    </div>
  </div>
);

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isLoggedIn = checkAuthStatus();
  const { theme, toggleTheme } = useTheme();
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [activeToast, setActiveToast] = useState<{ title: string, message: string } | null>(null);

  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);

  useEffect(() => {
    const loadNotifications = () => {
      const saved = JSON.parse(localStorage.getItem('notifications') || '[]');
      setNotifications(saved);
    };

    loadNotifications();
    
    const handleNewNotify = () => {
      const saved = JSON.parse(localStorage.getItem('notifications') || '[]');
      setNotifications(saved);
      if (saved.length > 0 && !saved[0].read) {
        setActiveToast({ title: saved[0].title, message: saved[0].message });
        setTimeout(() => setActiveToast(null), 5000);
      }
    };

    window.addEventListener('storage', loadNotifications);
    window.addEventListener('newNotification', handleNewNotify);
    return () => {
      window.removeEventListener('storage', loadNotifications);
      window.removeEventListener('newNotification', handleNewNotify);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const isActive = (path: string) => location.pathname === path;
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      {activeToast && <Toast title={activeToast.title} message={activeToast.message} onClose={() => setActiveToast(null)} />}

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
              <button 
                onClick={toggleTheme} 
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {isLoggedIn && (
                <>
                  <Link to="/messages" className={`p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative ${isActive('/messages') ? 'text-primary-600' : ''}`}>
                    <MessageSquare size={20} />
                  </Link>
                  
                  <div className="relative" ref={notificationRef}>
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></span>
                      )}
                    </button>
                    {showNotifications && (
                      <div className="absolute right-0 mt-4 w-80 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center border-b dark:border-gray-700">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">Bildirimler</span>
                          <button onClick={markAllRead} className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700">Tümünü Oku</button>
                        </div>
                        <div className="max-h-[360px] overflow-y-auto custom-scrollbar">
                          {notifications.length === 0 ? (
                            <div className="p-12 text-center text-gray-400 text-xs font-bold uppercase tracking-widest">Henüz bildirim yok.</div>
                          ) : (
                            notifications.map(n => (
                              <div key={n.id} className={`p-5 border-b last:border-none dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors relative ${!n.read ? 'bg-primary-50/20 dark:bg-primary-900/5' : ''}`}>
                                 {!n.read && <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-primary-600 rounded-full"></div>}
                                 <div className="flex gap-3">
                                    <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'}`}>
                                       {n.type === 'success' ? <CheckCircle size={14}/> : <Info size={14}/>}
                                    </div>
                                    <div className="flex-1">
                                       <div className="font-black text-xs text-gray-900 dark:text-white mb-1 uppercase tracking-tight">{n.title}</div>
                                       <div className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed font-medium">{n.message}</div>
                                       <div className="text-[9px] text-gray-400 mt-2 font-black uppercase flex items-center gap-1"><Clock size={10}/> {n.time}</div>
                                    </div>
                                 </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              <Link to="/dashboard" className={`text-gray-600 dark:text-gray-300 hover:text-primary-600 font-black text-[10px] uppercase tracking-widest px-3 py-2 flex items-center gap-2 border-2 border-transparent hover:border-primary-100 rounded-2xl transition-all ${isActive('/dashboard') ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20' : ''}`}>
                 <LayoutDashboard size={18} /> Panel
              </Link>
              
              {isLoggedIn ? (
                <div className="flex items-center gap-4">
                  <Link to="/profile" className={`flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 font-bold ${isActive('/profile') ? 'text-primary-600' : ''}`}>
                    <UserCircle size={20} />
                    <span className="text-sm">Hesabım</span>
                  </Link>
                  <button onClick={handleLogout} className="text-gray-400 hover:text-red-500"><LogOut size={20} /></button>
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
            {isLoggedIn && (
               <div className="relative" ref={notificationRef}>
                  <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 text-gray-600 dark:text-gray-300 relative">
                     <Bell size={20} />
                     {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full"></span>}
                  </button>
                  {showNotifications && (
                    <div className="fixed top-14 left-4 right-4 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border dark:border-gray-700 overflow-hidden z-[10001] animate-in fade-in slide-in-from-top-2">
                       <div className="p-4 bg-gray-50 dark:bg-gray-700/50 flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase text-gray-500">Bildirimler</span>
                          <button onClick={() => setShowNotifications(false)} className="text-gray-400"><X size={18}/></button>
                       </div>
                       <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                          {notifications.map(n => (
                            <div key={n.id} className="p-4 border-b dark:border-gray-700">
                               <div className="font-black text-xs uppercase mb-1">{n.title}</div>
                               <div className="text-[11px] text-gray-500 dark:text-gray-400">{n.message}</div>
                            </div>
                          ))}
                       </div>
                    </div>
                  )}
               </div>
            )}
            <button onClick={toggleTheme} className="p-2 text-gray-600 dark:text-gray-300">{theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}</button>
          </div>
      </div>
      {createPortal(<MobileBottomNav />, document.body)}
    </>
  );
};

export default Navbar;
