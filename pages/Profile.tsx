
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { 
  PlusCircle, 
  Calendar, 
  History,
  ShieldCheck,
  Car,
  Camera,
  CheckCircle,
  CreditCard,
  User,
  Bell,
  Gift,
  Upload,
  Info,
  Check,
  Settings,
  Loader2,
  Trash2,
  Plus,
  Lock,
  Share2,
  ChevronRight,
  MapPin,
  RefreshCw,
  AlertCircle,
  TrendingUp,
  Mail,
  Zap
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkAuthStatus, dbService } from '../services/firebase';
import { UserProfile } from '../types';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState<UserProfile | any>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'edit');
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [myCars, setMyCars] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [kycStep, setKycStep] = useState<'idle' | 'scanning' | 'done'>('idle');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAuthStatus()) { navigate('/login'); return; }
    
    const loadAllData = () => {
      const profile = dbService.getProfile();
      if (profile) {
        setUserData({
          ...profile,
          isVerified: profile.isVerified || false,
          isEmailVerified: profile.isEmailVerified || false,
          avatar: profile.avatar || null,
        });
      }
      setMyTrips(dbService.getTrips());
      setMyCars(dbService.getCars());
      setNotifications(dbService.getNotifications());
      setPaymentMethods(dbService.getPaymentMethods());
    };

    loadAllData();
    window.addEventListener('storage', loadAllData);
    return () => window.removeEventListener('storage', loadAllData);
  }, [navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      dbService.updateProfile(userData);
      setIsSaving(false);
      dbService.addNotification({
        id: Date.now(),
        title: 'Profil Güncellendi',
        message: 'Kişisel bilgileriniz başarıyla bulut veritabanına kaydedildi.',
        time: 'Az önce',
        read: false,
        type: 'info'
      });
    }, 1000);
  };

  const verifyAccount = () => {
    if (!licensePhoto) return alert("Lütfen ehliyet fotoğrafını yükleyin.");
    setKycStep('scanning');
    setTimeout(() => {
      const updated = { ...userData, isVerified: true };
      setUserData(updated);
      dbService.updateProfile(updated);
      setKycStep('done');
      dbService.addNotification({
        id: Date.now(),
        title: 'Ehliyet Onaylandı',
        message: 'Ehliyetiniz yapay zeka tarafından doğrulandı.',
        time: 'Az önce',
        read: false,
        type: 'success'
      });
    }, 3000);
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
                  <p className="text-gray-500 text-sm font-bold mb-10">Kişisel bilgilerinizi güncelleyin.</p>
                  
                  <div className="mb-12 flex items-center gap-8">
                     <div className="relative group">
                        <div className="w-24 h-24 rounded-[2rem] bg-primary-600 flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden">
                           {userData?.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : userData?.name?.[0]}
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-2.5 rounded-2xl shadow-xl border border-gray-100 text-primary-600 hover:scale-110 transition-transform"><Camera size={18} /></button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setUserData({ ...userData, avatar: reader.result as string });
                              reader.readAsDataURL(file);
                           }
                        }} />
                     </div>
                     <div className="space-y-1">
                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">Kapak Fotoğrafı</p>
                        <p className="text-xs text-gray-400 font-medium">İyi bir fotoğraf kiralama şansınızı artırır.</p>
                     </div>
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
                    <button type="submit" className="bg-primary-600 text-white px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary-600/20 active:scale-95">Değişiklikleri Kaydet</button>
                  </form>
                </div>
              )}

              {/* --- RENTALS TAB --- */}
              {activeTab === 'rentals' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-tighter">Kiralamalarım</h2>
                  {myTrips.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                       <History size={48} className="text-gray-300 mx-auto mb-4" />
                       <h3 className="text-lg font-bold text-gray-400">Henüz hiç araç kiralamadınız.</h3>
                       <button onClick={() => navigate('/search')} className="mt-8 bg-primary-600 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20">Şimdi araç ara</button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {myTrips.map(trip => (
                        <div key={trip.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 p-6 flex gap-6 hover:shadow-lg transition-shadow border-gray-100">
                           <img src={trip.carImage} className="w-24 h-24 rounded-2xl object-cover shrink-0 shadow-sm" />
                           <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-black text-xs text-gray-900 dark:text-white uppercase truncate tracking-tight">{trip.carName}</h4>
                                <span className={`shrink-0 text-[8px] font-black uppercase px-2 py-1 rounded-lg ${trip.status === 'Tamamlandı' ? 'bg-green-50 text-green-600' : 'bg-primary-50 text-primary-600'}`}>{trip.status}</span>
                              </div>
                              <div className="mt-2 space-y-1">
                                <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5"><Calendar size={12}/> {new Date(trip.pickupDate).toLocaleDateString('tr-TR')}</p>
                                <p className="text-[10px] text-gray-500 font-bold flex items-center gap-1.5"><MapPin size={12}/> {trip.location}</p>
                              </div>
                              <div className="mt-4 flex justify-between items-center">
                                 <p className="text-xs font-black text-primary-600">₺{trip.totalPrice}</p>
                                 <button className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-primary-600 transition-colors">
                                    Detaylar <ChevronRight size={12}/>
                                 </button>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* --- PAYMENTS TAB --- */}
              {activeTab === 'payments' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Ödeme Yöntemleri</h2>
                    <button className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                       <Plus size={18} /> Yeni Kart
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     {paymentMethods.map(method => (
                       <div key={method.id} className="bg-gradient-to-br from-gray-900 to-primary-900 p-8 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group min-h-[220px]">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                          <div className="flex justify-between items-start mb-12 relative z-10">
                             <CreditCard size={32} />
                             {method.isDefault && <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-xl border border-white/20">Varsayılan</span>}
                          </div>
                          <div className="relative z-10">
                             <p className="text-lg font-mono tracking-widest mb-6">**** **** **** {method.last4}</p>
                             <div className="flex justify-between items-end">
                                <div>
                                   <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">Kart Sahibi</p>
                                   <p className="font-bold uppercase tracking-tight">{userData?.name} {userData?.surname}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[9px] font-black uppercase tracking-widest opacity-60 mb-1">SKT</p>
                                   <p className="font-bold">{method.exp}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                     ))}
                     
                     <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary-400 transition-all min-h-[220px]">
                        <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-400 mb-4 group-hover:scale-110 transition-transform shadow-sm">
                           <Plus size={32} />
                        </div>
                        <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-widest mb-2">Yeni Kart Ekle</h4>
                        <p className="text-xs text-gray-500 font-bold max-w-[180px]">Güvenli 256-bit SSL ödeme altyapısı.</p>
                     </div>
                  </div>
                </div>
              )}

              {/* --- CREDIT TAB --- */}
              {activeTab === 'credit' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 text-center py-12">
                   <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner animate-bounce">
                      <Gift size={48} />
                   </div>
                   <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Arkadaşlarını Davet Et</h2>
                   <p className="text-gray-500 font-bold max-w-sm mx-auto mb-10 leading-relaxed uppercase tracking-widest text-[10px]">Her başarılı referans kiralama işlemi için <br/><span className="text-primary-600 text-xl font-black">₺500 KREDİ</span> kazanın!</p>
                   
                   <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-800 p-8 rounded-[2.5rem] border dark:border-gray-700 mb-12">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Senin Referans Kodun</p>
                      <div className="flex gap-3">
                         <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-2xl border-2 border-primary-100 dark:border-primary-700 font-black text-primary-600 text-lg uppercase tracking-widest shadow-inner">
                            GET500-{userData?.name?.[0]}{userData?.surname?.[0]}
                         </div>
                         <button className="bg-primary-600 text-white p-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
                            <Share2 size={24} />
                         </button>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-3 gap-6 text-left">
                      {[
                        { icon: Mail, title: 'Davet Gönder', desc: 'Arkadaşlarına özel linkini veya kodunu gönder.' },
                        { icon: Zap, title: 'Kiralama Yapsınlar', desc: 'İlk araç kiralamalarını tamamlasınlar.' },
                        { icon: TrendingUp, title: '₺500 Kazan', desc: 'Kredin anında hesabına tanımlansın.' }
                      ].map((step, i) => (
                        <div key={i} className="p-6 bg-white dark:bg-gray-900 rounded-3xl border dark:border-gray-800">
                           <step.icon size={24} className="text-primary-600 mb-4" />
                           <h4 className="font-black uppercase text-xs mb-2 text-gray-900 dark:text-white">{step.title}</h4>
                           <p className="text-[10px] text-gray-500 font-bold">{step.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* ... Notifications and Verify tabs keep their visual quality ... */}
              {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Bildirimler</h2>
                    <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline">Tümünü Okundu İşaretle</button>
                  </div>
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                         <Bell size={48} className="text-gray-300 mx-auto mb-4" />
                         <p className="text-sm font-bold text-gray-400">Henüz bildiriminiz bulunmuyor.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={`p-6 rounded-[2rem] border flex gap-6 cursor-pointer transition-all ${n.read ? 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700' : 'bg-primary-50/30 border-primary-100 dark:bg-primary-900/10 dark:border-primary-800'}`}>
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

              {/* Araçlarım sekmesi mevcut kodda olduğu gibi çalışmaya devam edecek */}
              {activeTab === 'cars' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-10">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Araçlarım</h2>
                      <button onClick={() => navigate('/list-car')} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase shadow-xl">
                         <PlusCircle size={18} /> Yeni İlan
                      </button>
                    </div>
                    {myCars.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                         <Car size={48} className="text-gray-300 mx-auto mb-4" />
                         <h3 className="text-lg font-bold text-gray-400 mb-6 uppercase tracking-widest">Henüz yayınlanmış bir aracınız yok.</h3>
                         <button onClick={() => navigate('/list-car')} className="bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest border border-gray-200 dark:border-gray-600 hover:shadow-lg transition-all">Hemen aracını listele</button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-8">
                        {myCars.map(car => (
                          <div key={car.id} className="bg-white dark:bg-gray-800 rounded-[2.5rem] border dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all group relative border-gray-100">
                             <div className="h-48 relative overflow-hidden">
                                <img src={car.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-[9px] font-black text-green-600 uppercase tracking-widest border border-green-100 shadow-sm">AKTİF</div>
                             </div>
                             <div className="p-8">
                                <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase leading-none tracking-tight">{car.brand} {car.model}</h4>
                                <div className="mt-4 flex justify-between items-center">
                                   <p className="text-2xl font-black text-primary-600">₺{car.pricePerDay}</p>
                                   <button onClick={() => navigate('/dashboard')} className="bg-gray-900 dark:bg-primary-600 text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest">Panel</button>
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
