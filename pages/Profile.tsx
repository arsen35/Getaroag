
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { 
  PlusCircle, 
  LogOut, 
  Calendar, 
  MapPin, 
  Mail, 
  ChevronRight, 
  Star,
  History,
  ShieldCheck,
  X,
  Search,
  MessageSquare,
  Car,
  Camera,
  CheckCircle,
  CreditCard,
  User,
  Bell,
  Gift,
  Phone,
  Globe,
  Upload,
  ArrowLeft,
  Info,
  Check,
  Settings,
  Loader2,
  Trash2,
  Plus,
  Lock,
  Share2
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkAuthStatus } from '../services/firebase';
import { UserProfile } from '../types';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState<UserProfile | any>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'edit');
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [myCars, setMyCars] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [isSubmittingKYC, setIsSubmittingKYC] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAuthStatus()) { navigate('/login'); return; }
    
    const loadProfile = () => {
      const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      setUserData({
        ...profile,
        isVerified: profile.isVerified || false,
        isEmailVerified: profile.isEmailVerified || false,
        driverRating: 5.0,
        language: profile.language || 'Türkçe',
        avatar: profile.avatar || null,
        email: profile.email || localStorage.getItem('userEmail') || ''
      });
    };

    const loadData = () => {
      setMyTrips(JSON.parse(localStorage.getItem('myTrips') || '[]'));
      setMyCars(JSON.parse(localStorage.getItem('myCars') || '[]'));
      // Fix: Argument of type 'string | { id: number; ... }[]' is not assignable to parameter of type 'string'.
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        setNotifications(JSON.parse(storedNotifications));
      } else {
        setNotifications([
          { id: 1, title: 'Hoş Geldiniz!', message: 'Getaroag ailesine katıldığınız için mutluyuz. Profilinizi tamamlayarak araç kiralamaya başlayabilirsiniz.', time: '1 gün önce', read: true, type: 'info' },
          { id: 2, title: 'Güvenlik İpucu', message: 'Hesap güvenliğiniz için şifrenizi kimseyle paylaşmayın.', time: '2 saat önce', read: false, type: 'warning' }
        ]);
      }
    };

    loadProfile();
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('storage', loadProfile);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('storage', loadProfile);
    };
  }, [navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(userData));
    window.dispatchEvent(new Event('storage'));
    alert("Profil bilgileriniz başarıyla güncellendi!");
  };

  const handleVerifyEmail = () => {
    if (!userData.email) return alert("Lütfen önce bir e-posta adresi girin.");
    setIsVerifyingEmail(true);
    setTimeout(() => {
      const updated = { ...userData, isEmailVerified: true };
      setUserData(updated);
      localStorage.setItem('userProfile', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      setIsVerifyingEmail(false);
      addNotification('E-posta Doğrulandı', 'E-posta adresiniz başarıyla doğrulandı.', 'success');
    }, 1500);
  };

  const verifyAccount = () => {
    if (!licensePhoto) return alert("Lütfen ehliyet fotoğrafını yükleyin.");
    setIsSubmittingKYC(true);
    setTimeout(() => {
      const updated = { ...userData, isVerified: true };
      setUserData(updated);
      localStorage.setItem('userProfile', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
      setIsSubmittingKYC(false);
      addNotification('Hesap Doğrulandı', 'Kimlik ve ehliyet bilgileriniz onaylandı.', 'success');
    }, 2000);
  };

  const addNotification = (title: string, message: string, type: string) => {
    const newNotif = { id: Date.now(), title, message, time: 'Az önce', read: false, type };
    const updatedNotifs = [newNotif, ...notifications];
    setNotifications(updatedNotifs);
    localStorage.setItem('notifications', JSON.stringify(updatedNotifs));
  };

  const markAsRead = (id: number) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const deleteCar = (id: any) => {
    if (window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
      const updated = myCars.filter(c => c.id !== id);
      setMyCars(updated);
      localStorage.setItem('myCars', JSON.stringify(updated));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const sidebarLinks = [
    { id: 'edit', label: 'Profilimi Düzenle', icon: User },
    { id: 'verify', label: 'Profilimi Doğrula', icon: ShieldCheck },
    { id: 'rentals', label: 'Kiralamalarım', icon: History },
    { id: 'cars', label: 'Araçlarım', icon: Car },
    { id: 'notifications', label: 'Bildirimler', icon: Bell, badge: notifications.filter(n => !n.read).length },
    { id: 'payments', label: 'Ödeme Yöntemleri', icon: CreditCard },
    { id: 'credit', label: '₺500 Kredi Kazan', icon: Gift },
  ];

  const inputClass = "w-full p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-bold transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300 pb-24">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border dark:border-gray-800 p-4 sticky top-24 shadow-sm">
              <nav className="space-y-1">
                {sidebarLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-bold text-sm ${
                      activeTab === link.id 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <link.icon size={20} />
                      {link.label}
                    </div>
                    {link.badge > 0 && (
                      <span className="bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded-full">{link.badge}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border dark:border-gray-800 p-8 md:p-12 shadow-sm min-h-[600px]">
              
              {/* --- EDİT TAB --- */}
              {activeTab === 'edit' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Profilimi Düzenle</h2>
                  <p className="text-gray-500 text-sm font-bold mb-10">Kişisel ve iletişim bilgilerinizi güncelleyin.</p>
                  
                  <div className="mb-12 flex items-center gap-8">
                     <div className="relative group">
                        <div className="w-24 h-24 rounded-[2rem] bg-primary-600 flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden">
                           {userData?.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : userData?.name?.[0]}
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-2.5 rounded-2xl shadow-xl border border-gray-100 text-primary-600"><Camera size={18} /></button>
                        <input type="file" ref={fileInputRef} onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const updated = { ...userData, avatar: reader.result as string };
                              setUserData(updated);
                              localStorage.setItem('userProfile', JSON.stringify(updated));
                              window.dispatchEvent(new Event('storage'));
                            };
                            reader.readAsDataURL(file);
                          }
                        }} className="hidden" />
                     </div>
                     <p className="text-xs text-gray-400 font-medium max-w-xs leading-relaxed">İyi bir fotoğraf güven oluşturur.</p>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adınız</label>
                        <input type="text" value={userData?.name || ''} onChange={e => setUserData({...userData, name: e.target.value})} className={inputClass} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Soyadınız</label>
                        <input type="text" value={userData?.surname || ''} onChange={e => setUserData({...userData, surname: e.target.value})} className={inputClass} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-posta</label>
                      <div className="relative">
                        <input type="email" value={userData?.email || ''} onChange={e => setUserData({...userData, email: e.target.value})} className={inputClass} />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          {userData?.isEmailVerified ? (
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-green-600 bg-green-50 px-3 py-2 rounded-xl border border-green-100 uppercase"><CheckCircle size={12}/> Doğrulandı</div>
                          ) : (
                            <button type="button" onClick={handleVerifyEmail} className="text-[9px] font-black text-white bg-primary-600 px-4 py-2.5 rounded-xl uppercase shadow-md">{isVerifyingEmail ? <Loader2 size={12} className="animate-spin" /> : "Doğrula"}</button>
                          )}
                        </div>
                      </div>
                    </div>
                    <button type="submit" className="bg-primary-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary-600/20 active:scale-95">Değişiklikleri Kaydet</button>
                  </form>
                </div>
              )}

              {/* --- VERIFY TAB --- */}
              {activeTab === 'verify' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Profilini Doğrula</h2>
                  <p className="text-gray-500 text-sm font-bold mb-12">Güvenli kiralama için ehliyetinizi onaylamanız gerekir.</p>
                  
                  <div className="flex flex-col md:flex-row gap-10">
                     <div className={`flex-1 p-8 rounded-[2rem] border-2 transition-all ${userData?.isVerified ? 'bg-green-50 border-green-100 text-green-700' : 'bg-primary-50 dark:bg-primary-900/10 border-primary-100 dark:border-primary-800 text-primary-700'}`}>
                        <h3 className="text-lg font-black mb-4 uppercase">{userData?.name} {userData?.surname}</h3>
                        <p className="text-xs font-bold leading-relaxed">{userData?.isVerified ? "Profiliniz doğrulandı. Tüm araçları kiralayabilirsiniz." : "Profiliniz henüz doğrulanmadı. Ehliyet fotoğrafınızı yükleyin."}</p>
                     </div>
                     <div className="flex-1">
                        <div className={`aspect-[3/2] rounded-[2rem] border-4 border-dashed flex flex-col items-center justify-center p-6 relative overflow-hidden ${licensePhoto ? 'border-green-500' : 'border-gray-200'}`}>
                           {licensePhoto ? (
                             <>
                               <img src={licensePhoto} className="absolute inset-0 w-full h-full object-cover" />
                               {userData?.isVerified && <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center text-white"><Check size={48} strokeWidth={4} /></div>}
                             </>
                           ) : (
                             <button onClick={() => licenseInputRef.current?.click()} className="flex flex-col items-center gap-3 text-gray-400">
                               <Camera size={32} />
                               <span className="text-[10px] font-black uppercase">Ehliyet Fotoğrafı Yükle</span>
                             </button>
                           )}
                           <input type="file" ref={licenseInputRef} onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               const reader = new FileReader();
                               reader.onloadend = () => setLicensePhoto(reader.result as string);
                               reader.readAsDataURL(file);
                             }
                           }} className="hidden" />
                        </div>
                        {licensePhoto && !userData?.isVerified && (
                          <button onClick={verifyAccount} className="w-full mt-6 bg-green-600 text-white py-4 rounded-2xl font-black text-xs uppercase shadow-xl">{isSubmittingKYC ? <Loader2 size={20} className="animate-spin mx-auto"/> : "Doğrulamayı Başlat"}</button>
                        )}
                     </div>
                  </div>
                </div>
              )}

              {/* --- NOTIFICATIONS TAB --- */}
              {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Bildirimler</h2>
                    <button onClick={() => {
                      const updated = notifications.map(n => ({...n, read: true}));
                      setNotifications(updated);
                      localStorage.setItem('notifications', JSON.stringify(updated));
                    }} className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">Tümünü Okundu İşaretle</button>
                  </div>

                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                         <Bell size={48} className="text-gray-300 mx-auto mb-4" />
                         <p className="text-sm font-bold text-gray-400">Henüz bildiriminiz bulunmuyor.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} onClick={() => markAsRead(n.id)} className={`p-6 rounded-[2rem] border flex gap-6 cursor-pointer transition-all ${n.read ? 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700' : 'bg-primary-50/30 border-primary-100 dark:bg-primary-900/10 dark:border-primary-800'}`}>
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-primary-100 text-primary-600'}`}>
                              {n.type === 'success' ? <Check size={24} /> : <Bell size={24} />}
                           </div>
                           <div className="flex-1">
                              <div className="flex justify-between items-start mb-1">
                                 <h4 className={`text-sm font-black uppercase ${n.read ? 'text-gray-900 dark:text-white' : 'text-primary-600'}`}>{n.title}</h4>
                                 <span className="text-[10px] font-bold text-gray-400">{n.time}</span>
                              </div>
                              <p className="text-xs text-gray-500 font-medium leading-relaxed">{n.message}</p>
                           </div>
                           {!n.read && <div className="w-2 h-2 bg-primary-600 rounded-full self-center"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* --- PAYMENTS TAB --- */}
              {activeTab === 'payments' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Ödeme Yöntemleri</h2>
                    <button className="flex items-center gap-2 bg-gray-900 dark:bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                       <Plus size={18} /> Kart Ekle
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="bg-gradient-to-br from-primary-600 to-purple-700 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        <div className="flex justify-between items-start mb-12 relative z-10">
                           <CreditCard size={32} />
                           <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-xl">Varsayılan</span>
                        </div>
                        <div className="relative z-10">
                           <p className="text-lg font-mono tracking-widest mb-6">**** **** **** 4242</p>
                           <div className="flex justify-between items-end">
                              <div>
                                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Kart Sahibi</p>
                                 <p className="font-bold uppercase">{userData?.name} {userData?.surname}</p>
                              </div>
                              <div className="text-right">
                                 <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Son Kullanma</p>
                                 <p className="font-bold">12/28</p>
                              </div>
                           </div>
                        </div>
                     </div>

                     <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary-400 transition-all">
                        <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform">
                           <Plus size={32} />
                        </div>
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">Yeni Kart Tanımla</h4>
                        <p className="text-xs text-gray-500 font-bold max-w-[180px]">Güvenli ödeme için kartınızı kaydedin.</p>
                     </div>
                  </div>

                  <div className="mt-12 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-[2rem] border border-blue-100 dark:border-blue-800 flex items-center gap-4">
                     <Lock size={20} className="text-blue-600" />
                     <p className="text-[10px] text-blue-800 dark:text-blue-300 font-bold uppercase tracking-widest leading-relaxed">Kart bilgileriniz Getaroag sunucularında tutulmaz, 256-bit SSL ile banka altyapısında şifrelenir.</p>
                  </div>
                </div>
              )}

              {/* --- CARS TAB --- */}
              {activeTab === 'cars' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Araçlarım</h2>
                    <button onClick={() => navigate('/list-car')} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-xl active:scale-95 transition-all">
                       <PlusCircle size={18} /> Yeni İlan Yayınla
                    </button>
                  </div>

                  {myCars.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                       <Car size={48} className="text-gray-300 mx-auto mb-4" />
                       <h3 className="text-lg font-bold text-gray-400 mb-6">Henüz yayınlanmış bir aracınız yok.</h3>
                       <button onClick={() => navigate('/list-car')} className="text-primary-600 font-black uppercase text-xs tracking-widest hover:underline">Hemen aracını listele ve kazanmaya başla</button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                      {myCars.map(car => (
                        <div key={car.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all group relative">
                           <div className="h-48 relative overflow-hidden">
                              <img src={car.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black text-green-600 uppercase tracking-widest border border-green-100 shadow-sm">AKTİF</div>
                              <button onClick={() => deleteCar(car.id)} className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16} /></button>
                           </div>
                           <div className="p-8">
                              <div className="flex justify-between items-start mb-4">
                                 <div>
                                    <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase leading-none">{car.brand} {car.model}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">{car.location.city}, {car.location.district}</p>
                                 </div>
                                 <div className="text-right">
                                    <p className="text-2xl font-black text-primary-600">₺{car.pricePerDay}</p>
                                    <p className="text-[8px] text-gray-400 font-black uppercase tracking-tighter">GÜNLÜK KAZANÇ</p>
                                 </div>
                              </div>
                              <div className="flex gap-2 pt-6 border-t dark:border-gray-700">
                                 <button onClick={() => navigate('/dashboard')} className="flex-1 bg-primary-600 text-white py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-700 transition-all">Panel Gör</button>
                                 <button className="px-4 bg-gray-50 dark:bg-gray-700 text-gray-400 rounded-xl hover:text-primary-600 transition-all"><Settings size={18}/></button>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- CREDIT TAB --- */}
              {activeTab === 'credit' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 text-center py-10">
                   <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
                      <Gift size={48} />
                   </div>
                   <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Arkadaşlarını Davet Et</h2>
                   <p className="text-gray-500 font-bold max-w-sm mx-auto mb-10 leading-relaxed uppercase tracking-widest text-[10px]">Her başarılı referans kiralama işlemi için <br/><span className="text-primary-600 text-xl font-black">₺500 KREDİ</span> kazanın!</p>
                   
                   <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-800 p-6 rounded-[2.5rem] border dark:border-gray-700">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Senin Referans Kodun</p>
                      <div className="flex gap-3">
                         <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-2xl border-2 border-primary-100 dark:border-primary-700 font-black text-primary-600 text-lg uppercase tracking-widest">GET500-{userData?.name?.[0]}{userData?.surname?.[0]}</div>
                         <button className="bg-primary-600 text-white p-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all"><Share2 size={24} /></button>
                      </div>
                   </div>
                </div>
              )}

              {/* --- RENTALS TAB --- */}
              {activeTab === 'rentals' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-10 uppercase tracking-tighter">Kiralamalarım</h2>
                  {myTrips.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                       <History size={48} className="text-gray-300 mx-auto mb-4" />
                       <h3 className="text-lg font-bold text-gray-400">Henüz hiç araç kiralamadınız.</h3>
                       <button onClick={() => navigate('/search')} className="mt-6 text-primary-600 font-black uppercase tracking-widest text-xs hover:underline">Şimdi araç ara</button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {myTrips.map(trip => (
                        <div key={trip.id} className="bg-white dark:bg-gray-800 rounded-[2rem] border dark:border-gray-700 p-6 flex gap-4 hover:shadow-lg transition-shadow">
                           <img src={trip.carImage} className="w-24 h-24 rounded-2xl object-cover" />
                           <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-black text-xs text-gray-900 dark:text-white uppercase truncate max-w-[120px]">{trip.carName}</h4>
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${trip.status === 'Tamamlandı' ? 'bg-green-50 text-green-600' : 'bg-primary-50 text-primary-600'}`}>{trip.status}</span>
                              </div>
                              <p className="text-[10px] text-gray-500 font-bold mt-1 flex items-center gap-1"><Calendar size={12}/> {new Date(trip.pickupDate).toLocaleDateString('tr-TR')}</p>
                              <div className="mt-4 flex justify-between items-center">
                                 <p className="text-xs font-black text-primary-600">₺{trip.totalPrice}</p>
                                 <button className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-primary-600">Detaylar <ChevronRight size={12}/></button>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
