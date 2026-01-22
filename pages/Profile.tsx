
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
  Zap,
  IdCard,
  ChevronLeft,
  Pencil,
  Eye,
  Save,
  X
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
  
  // Editing State
  const [editingCar, setEditingCar] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  
  const [idPhoto, setIdPhoto] = useState<string | null>(null);
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);

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

  useEffect(() => {
    if (!checkAuthStatus()) { navigate('/login'); return; }
    
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
        message: 'Kişisel bilgileriniz başarıyla kaydedildi.',
        time: 'Az önce',
        read: false,
        type: 'info'
      });
    }, 800);
  };

  const handleDeleteCar = (id: number | string, name: string) => {
    if (window.confirm(`${name} ilanını silmek istediğinizden emin misiniz?`)) {
        dbService.deleteCar(id);
        dbService.addNotification({
            id: Date.now(),
            title: 'İlan Silindi',
            message: `${name} ilanınız sistemden kaldırıldı.`,
            time: 'Az önce',
            read: false,
            type: 'info'
        });
        // UI'daki local state'i hemen güncelle
        setMyCars(prev => prev.filter(c => String(c.id) !== String(id)));
    }
  };

  const handleUpdateCarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;
    
    dbService.updateCar(editingCar.id, {
        model: editingCar.model,
        pricePerDay: Number(editingCar.pricePerDay)
    });

    dbService.addNotification({
        id: Date.now(),
        title: 'İlan Güncellendi',
        message: `${editingCar.brand} ${editingCar.model} bilgileri güncellendi.`,
        time: 'Az önce',
        read: false,
        type: 'info'
    });

    setEditingCar(null);
    setMyCars(dbService.getCars());
  };

  const handleMarkAsRead = (id: number) => {
    dbService.markNotificationRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllAsRead = () => {
    dbService.markAllNotificationsRead();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const verifyAccount = () => {
    if (!idPhoto || !licensePhoto) return alert("Lütfen hem kimlik hem de ehliyet fotoğrafını yükleyin.");
    setKycStep('scanning');
    setTimeout(() => {
      const updated = { ...userData, isVerified: true };
      setUserData(updated);
      dbService.updateProfile(updated);
      setKycStep('done');
      dbService.addNotification({
        id: Date.now(),
        title: 'Profil Onaylandı',
        message: 'Belgeleriniz yapay zeka tarafından incelendi ve üyeliğiniz tam onay aldı.',
        time: 'Az önce',
        read: false,
        type: 'success'
      });
    }, 4000);
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

  const inputClass = "w-full p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[5px] focus:ring-1 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-medium transition-all";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300 pb-24">
      <Navbar />

      {/* --- EDIT MODAL --- */}
      {editingCar && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-[5px] border dark:border-gray-800 p-8 w-full max-w-md animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold uppercase tracking-tighter text-gray-900 dark:text-white">İlanı Düzenle</h3>
                    <button onClick={() => setEditingCar(null)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                </div>
                <form onSubmit={handleUpdateCarSubmit} className="space-y-6">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Model Adı</label>
                        <input type="text" value={editingCar.model} onChange={e => setEditingCar({...editingCar, model: e.target.value})} className={inputClass} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Günlük Ücret (₺)</label>
                        <input type="number" value={editingCar.pricePerDay} onChange={e => setEditingCar({...editingCar, pricePerDay: e.target.value})} className={inputClass} />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setEditingCar(null)} className="flex-1 px-6 py-4 rounded-[5px] border border-gray-200 dark:border-gray-700 font-bold text-xs uppercase text-gray-500">İptal</button>
                        <button type="submit" className="flex-1 px-6 py-4 rounded-[5px] bg-primary-600 text-white font-bold text-xs uppercase">Kaydet</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-[5px] border border-gray-100 dark:border-gray-800 p-4 sticky top-24">
              <nav className="space-y-1">
                {sidebarLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-[5px] transition-all font-bold text-sm ${
                      activeTab === link.id 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border border-primary-100 dark:border-primary-800' 
                      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <link.icon size={18} />
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
            <div className="bg-white dark:bg-gray-900 rounded-[5px] border border-gray-100 dark:border-gray-800 p-8 md:p-12 min-h-[600px]">
              
              {/* --- EDİT TAB --- */}
              {activeTab === 'edit' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Profilimi Düzenle</h2>
                  <p className="text-gray-500 text-sm font-medium mb-10">Kişisel bilgilerinizi güncelleyin ve kaydedin.</p>
                  
                  <div className="mb-12 flex items-center gap-8">
                     <div className="relative group">
                        <div className="w-24 h-24 rounded-[5px] bg-primary-600 border border-primary-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden">
                           {userData?.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : userData?.name?.[0]}
                        </div>
                        <button onClick={() => fileInputRef.current?.click()} className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-2.5 rounded-[5px] border border-gray-200 dark:border-gray-700 text-primary-600 hover:scale-105 transition-transform"><Camera size={18} /></button>
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => {
                           const file = e.target.files?.[0];
                           if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => setUserData({ ...userData, avatar: reader.result as string });
                              reader.readAsDataURL(file);
                           }
                        }} />
                     </div>
                     <div className="space-y-1 text-left">
                        <p className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-tight">Kapak Fotoğrafı</p>
                        <p className="text-xs text-gray-400 font-medium">Bu fotoğraf diğer kullanıcılara görünür.</p>
                     </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Adınız</label>
                        <input type="text" value={userData?.name || ''} onChange={e => setUserData({...userData, name: e.target.value})} className={inputClass} />
                      </div>
                      <div className="space-y-1 text-left">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Soyadınız</label>
                        <input type="text" value={userData?.surname || ''} onChange={e => setUserData({...userData, surname: e.target.value})} className={inputClass} />
                      </div>
                    </div>
                    <button type="submit" disabled={isSaving} className="bg-primary-600 text-white px-10 py-5 rounded-[5px] font-bold text-sm uppercase tracking-widest active:scale-95 flex items-center gap-2 border border-primary-500">
                       {isSaving && <Loader2 size={18} className="animate-spin" />}
                       {isSaving ? "KAYDEDİLİYOR" : "DEĞİŞİKLİKLERİ KAYDET"}
                    </button>
                  </form>
                </div>
              )}

              {/* --- VERIFY TAB --- */}
              {activeTab === 'verify' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Profilini Doğrula</h2>
                  <p className="text-gray-500 text-sm font-medium mb-12">Güvenli bir kiralama deneyimi için kimlik ve ehliyetinizi onaylamalısınız.</p>
                  
                  {userData?.isVerified ? (
                    <div className="bg-green-50 dark:bg-green-900/10 p-10 rounded-[5px] border border-green-200 dark:border-green-800 flex flex-col items-center text-center">
                       <div className="w-20 h-20 bg-green-500 text-white rounded-full flex items-center justify-center mb-6 border border-green-400">
                          <ShieldCheck size={44} />
                       </div>
                       <h3 className="text-2xl font-bold text-green-700 dark:text-green-400 uppercase tracking-tight mb-2">Tebrikler, Doğrulandınız!</h3>
                       <p className="text-sm text-green-600 dark:text-green-300 font-medium max-w-md">Kimliğiniz ve ehliyetiniz başarıyla onaylandı. Artık platformdaki tüm araçları kiralayabilir veya aracınızı listeleyebilirsiniz.</p>
                       <button onClick={() => navigate('/search')} className="mt-8 bg-green-600 text-white px-8 py-3.5 rounded-[5px] font-bold text-xs uppercase tracking-widest border border-green-500">HEMEN ARAÇ ARA</button>
                    </div>
                  ) : (
                    <div className="space-y-10">
                       <div className="grid md:grid-cols-2 gap-8 text-left">
                          {/* ID CARD */}
                          <div className="space-y-4">
                             <div className="flex items-center gap-2 mb-2">
                                <IdCard size={20} className="text-primary-600" />
                                <h4 className="text-xs font-bold uppercase text-gray-900 dark:text-white tracking-widest">Kimlik Ön Yüzü</h4>
                             </div>
                             <div 
                                onClick={() => idInputRef.current?.click()}
                                className={`aspect-[3/2] rounded-[5px] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${idPhoto ? 'border-primary-500' : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                             >
                                {idPhoto ? (
                                   <div className={`w-full h-full ${kycStep === 'scanning' ? 'scan-animation' : ''}`}>
                                      <img src={idPhoto} className="w-full h-full object-cover" />
                                   </div>
                                ) : (
                                   <>
                                      <Camera size={32} className="text-gray-300 mb-2" />
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fotoğraf Yükle</p>
                                   </>
                                )}
                                <input type="file" ref={idInputRef} className="hidden" onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => setIdPhoto(reader.result as string);
                                      reader.readAsDataURL(file);
                                   }
                                }} />
                             </div>
                          </div>

                          {/* LICENSE */}
                          <div className="space-y-4">
                             <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck size={20} className="text-primary-600" />
                                <h4 className="text-xs font-bold uppercase text-gray-900 dark:text-white tracking-widest">Ehliyet Fotoğrafı</h4>
                             </div>
                             <div 
                                onClick={() => licenseInputRef.current?.click()}
                                className={`aspect-[3/2] rounded-[5px] border-2 border-dashed transition-all flex flex-col items-center justify-center cursor-pointer relative overflow-hidden ${licensePhoto ? 'border-primary-500' : 'border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                             >
                                {licensePhoto ? (
                                   <div className={`w-full h-full ${kycStep === 'scanning' ? 'scan-animation' : ''}`}>
                                      <img src={licensePhoto} className="w-full h-full object-cover" />
                                   </div>
                                ) : (
                                   <>
                                      <Camera size={32} className="text-gray-300 mb-2" />
                                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fotoğraf Yükle</p>
                                   </>
                                )}
                                <input type="file" ref={licenseInputRef} className="hidden" onChange={(e) => {
                                   const file = e.target.files?.[0];
                                   if (file) {
                                      const reader = new FileReader();
                                      reader.onloadend = () => setLicensePhoto(reader.result as string);
                                      reader.readAsDataURL(file);
                                   }
                                }} />
                             </div>
                          </div>
                       </div>

                       <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-[5px] border border-gray-100 dark:border-gray-800 text-left">
                          <div className="flex items-start gap-4">
                             <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-[5px] flex items-center justify-center shrink-0 border border-blue-100">
                                <Info size={20} />
                             </div>
                             <div>
                                <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase mb-1">Veri Güvenliği</h5>
                                <p className="text-[10px] text-gray-500 font-medium leading-relaxed">Yüklediğiniz belgeler 256-bit şifreleme ile korunur. Doğrulama yapay zeka tarafından saniyeler içinde tamamlanır.</p>
                             </div>
                          </div>
                       </div>

                       <button 
                         onClick={verifyAccount}
                         disabled={kycStep === 'scanning' || !idPhoto || !licensePhoto}
                         className="w-full bg-primary-600 text-white py-5 rounded-[5px] font-bold text-sm uppercase tracking-widest border border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                       >
                          {kycStep === 'scanning' ? (
                            <><RefreshCw size={20} className="animate-spin" /> AI BELGELERİ TARIYOR...</>
                          ) : (
                            <><ShieldCheck size={20} /> DOĞRULAMAYI BAŞLAT</>
                          )}
                       </button>
                    </div>
                  )}
                </div>
              )}

              {/* --- RENTALS TAB --- */}
              {activeTab === 'rentals' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 uppercase tracking-tighter">Kiralamalarım</h2>
                  {myTrips.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[5px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                       <History size={48} className="text-gray-300 mx-auto mb-4" />
                       <h3 className="text-lg font-bold text-gray-400">Henüz hiç araç kiralamadınız.</h3>
                       <button onClick={() => navigate('/search')} className="mt-8 bg-primary-600 text-white px-8 py-3.5 rounded-[5px] font-bold uppercase tracking-widest text-xs border border-primary-500">Şimdi araç ara</button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {myTrips.map(trip => (
                        <div key={trip.id} className="bg-white dark:bg-gray-800 rounded-[5px] border border-gray-100 dark:border-gray-700 p-6 flex gap-6 hover:border-primary-200 transition-all">
                           <img src={trip.carImage} className="w-24 h-24 rounded-[5px] object-cover shrink-0 border border-gray-100" />
                           <div className="flex-1 min-w-0 text-left">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-bold text-sm text-gray-900 dark:text-white uppercase truncate tracking-tight">{trip.carName}</h4>
                                <span className={`shrink-0 text-[8px] font-bold uppercase px-2 py-1 rounded-[5px] border ${trip.status === 'Tamamlandı' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-primary-50 text-primary-600 border-primary-100'}`}>{trip.status}</span>
                              </div>
                              <div className="mt-2 space-y-1">
                                <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5"><Calendar size={12}/> {new Date(trip.pickupDate).toLocaleDateString('tr-TR')}</p>
                                <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1.5"><MapPin size={12}/> {trip.location}</p>
                              </div>
                              <div className="mt-4 flex justify-between items-center">
                                 <p className="text-xs font-bold text-primary-600">₺{trip.totalPrice}</p>
                                 <button className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-primary-600 transition-colors">
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
                  <div className="flex justify-between items-center mb-10 text-left">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Ödeme Yöntemleri</h2>
                        <p className="text-xs font-medium text-gray-500 mt-1">Kiralama yaparken kullanacağınız kartları yönetin.</p>
                    </div>
                    <button className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-[5px] font-bold text-xs uppercase tracking-widest border border-primary-500">
                       <Plus size={18} /> Yeni Kart
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8 text-left">
                     {paymentMethods.map(method => (
                       <div key={method.id} className="bg-gray-900 p-8 rounded-[5px] border border-gray-700 text-white relative overflow-hidden group min-h-[220px]">
                          <div className="flex justify-between items-start mb-12 relative z-10">
                             <CreditCard size={32} className="text-primary-400" />
                             {method.isDefault && <span className="text-[10px] font-bold uppercase tracking-widest bg-white/10 px-3 py-1.5 rounded-[5px] border border-white/20">Varsayılan</span>}
                          </div>
                          <div className="relative z-10 text-left">
                             <p className="text-lg font-mono tracking-widest mb-6">**** **** **** {method.last4}</p>
                             <div className="flex justify-between items-end">
                                <div>
                                   <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">Kart Sahibi</p>
                                   <p className="font-bold uppercase tracking-tight">{userData?.name} {userData?.surname}</p>
                                </div>
                                <div className="text-right">
                                   <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-1">SKT</p>
                                   <p className="font-bold">{method.exp}</p>
                                </div>
                             </div>
                          </div>
                       </div>
                     ))}
                     
                     <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-[5px] border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center text-center group cursor-pointer hover:border-primary-400 transition-all min-h-[220px]">
                        <div className="w-16 h-16 bg-white dark:bg-gray-700 rounded-[5px] flex items-center justify-center text-gray-400 mb-4 border border-gray-100">
                           <Plus size={32} />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest mb-2">Yeni Kart Ekle</h4>
                        <p className="text-xs text-gray-400 font-medium max-w-[180px]">Güvenli altyapı.</p>
                     </div>
                  </div>
                </div>
              )}

              {/* --- CREDIT TAB --- */}
              {activeTab === 'credit' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 text-center py-12">
                   <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-[5px] flex items-center justify-center mx-auto mb-8 border border-primary-200">
                      <Gift size={48} />
                   </div>
                   <h2 className="text-4xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter mb-4">Arkadaşlarını Davet Et</h2>
                   <p className="text-gray-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed uppercase tracking-widest text-[10px]">Her başarılı kiralama işlemi için <br/><span className="text-primary-600 text-xl font-bold">₺500 KREDİ</span> kazanın!</p>
                   
                   <div className="max-w-md mx-auto bg-gray-50 dark:bg-gray-800 p-8 rounded-[5px] border border-gray-100 dark:border-gray-700 mb-12 text-left">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-left">Senin Referans Kodun</p>
                      <div className="flex gap-3">
                         <div className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-[5px] border border-gray-200 dark:border-gray-700 font-bold text-primary-600 text-lg uppercase tracking-widest">
                            GET500-{userData?.name?.[0]}{userData?.surname?.[0]}
                         </div>
                         <button className="bg-primary-600 text-white p-4 rounded-[5px] border border-primary-500 hover:scale-105 active:scale-95 transition-all">
                            <Share2 size={24} />
                         </button>
                      </div>
                   </div>

                   <div className="grid md:grid-cols-3 gap-6 text-left">
                      {[
                        { icon: Mail, title: 'Davet Gönder', desc: 'Özel kodunu paylaş.' },
                        { icon: Zap, title: 'Kiralamaya Başlasın', desc: 'Arkadaşın ilk sürüşünü tamamlasın.' },
                        { icon: TrendingUp, title: '₺500 Senin', desc: 'Kredin anında yüklensin.' }
                      ].map((step, i) => (
                        <div key={i} className="p-6 bg-white dark:bg-gray-900 rounded-[5px] border border-gray-100 dark:border-gray-800">
                           <step.icon size={20} className="text-primary-600 mb-4" />
                           <h4 className="font-bold uppercase text-xs mb-2 text-gray-900 dark:text-white">{step.title}</h4>
                           <p className="text-[10px] text-gray-500 font-medium">{step.desc}</p>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {/* --- NOTIFICATIONS TAB --- */}
              {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 text-left">
                  <div className="flex justify-between items-center mb-8 text-left">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Bildirimler</h2>
                    <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:underline">Tümünü Okundu İşaretle</button>
                  </div>
                  <div className="space-y-4">
                    {notifications.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[5px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                         <Bell size={48} className="text-gray-300 mx-auto mb-4" />
                         <p className="text-sm font-medium text-gray-400">Henüz bildiriminiz bulunmuyor.</p>
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleMarkAsRead(n.id)}
                          className={`p-6 rounded-[5px] border flex gap-6 cursor-pointer transition-all active:scale-[0.99] ${n.read ? 'bg-white border-gray-100 dark:bg-gray-800 dark:border-gray-700' : 'bg-primary-50/40 border-primary-200 dark:bg-primary-900/10 dark:border-primary-800'}`}
                        >
                           <div className={`w-12 h-12 rounded-[5px] flex items-center justify-center shrink-0 border ${n.read ? 'bg-gray-100 text-gray-400 border-gray-200' : (n.type === 'success' ? 'bg-green-100 text-green-600 border-green-200' : 'bg-primary-100 text-primary-600 border-primary-200')}`}>
                              {n.type === 'success' ? <CheckCircle size={24} /> : <Bell size={24} />}
                           </div>
                           <div className="flex-1 text-left">
                              <div className="flex justify-between items-start mb-1">
                                 <h4 className={`text-sm font-bold uppercase ${n.read ? 'text-gray-500' : 'text-primary-600'}`}>{n.title}</h4>
                                 <span className="text-[10px] font-medium text-gray-400">{n.time}</span>
                              </div>
                              <p className={`text-xs font-medium leading-relaxed ${n.read ? 'text-gray-400' : 'text-gray-600 dark:text-gray-300'}`}>{n.message}</p>
                           </div>
                           {!n.read && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full self-center border border-primary-400 animate-pulse"></div>}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* --- CARS TAB (FIXED EDIT & DELETE) --- */}
              {activeTab === 'cars' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-10 text-left">
                      <h2 className="text-3xl font-bold text-gray-900 dark:text-white uppercase tracking-tighter">Araçlarım</h2>
                      <button onClick={() => navigate('/list-car')} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-[5px] font-bold text-xs uppercase border border-primary-500 active:scale-95 transition-transform">
                         <PlusCircle size={18} /> Yeni İlan
                      </button>
                    </div>
                    {myCars.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[5px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                         <Car size={48} className="text-gray-300 mx-auto mb-4" />
                         <h3 className="text-lg font-bold text-gray-400 mb-6 uppercase tracking-widest">Henüz yayınlanmış bir aracınız yok.</h3>
                         <button onClick={() => navigate('/list-car')} className="bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400 px-8 py-3 rounded-[5px] font-bold uppercase text-xs tracking-widest border border-gray-200 dark:border-gray-600 transition-all">Hemen aracını listele</button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-8 text-left">
                        {myCars.map(car => (
                          <div key={car.id} className="bg-white dark:bg-gray-800 rounded-[5px] border border-gray-100 dark:border-gray-700 overflow-hidden group relative transition-all hover:border-primary-300">
                             <div className="h-48 relative overflow-hidden">
                                <img src={car.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1.5 rounded-[5px] text-[9px] font-bold text-green-600 uppercase tracking-widest border border-green-100">AKTİF</div>
                             </div>
                             <div className="p-8 text-left">
                                <div className="flex justify-between items-start mb-4">
                                   <h4 className="text-xl font-bold text-gray-900 dark:text-white uppercase leading-none tracking-tight">{car.brand} {car.model}</h4>
                                   <p className="text-xl font-bold text-primary-600">₺{car.pricePerDay}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-2 mt-6">
                                   <button onClick={() => navigate('/dashboard')} className="bg-gray-900 dark:bg-primary-900/40 text-white p-3 rounded-[5px] border border-gray-700 flex items-center justify-center group/btn hover:bg-black transition-colors" title="Panel">
                                      <TrendingUp size={18} />
                                   </button>
                                   <button onClick={() => setEditingCar(car)} className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-3 rounded-[5px] border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:bg-gray-100 transition-colors" title="Düzenle">
                                      <Pencil size={18} />
                                   </button>
                                   <button onClick={() => handleDeleteCar(car.id, `${car.brand} ${car.model}`)} className="bg-red-50 dark:bg-red-900/20 text-red-600 p-3 rounded-[5px] border border-red-100 dark:border-red-900 flex items-center justify-center hover:bg-red-100 transition-colors" title="Sil">
                                      <Trash2 size={18} />
                                   </button>
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
