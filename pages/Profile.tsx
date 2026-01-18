
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
  // Added missing icons Info, Check, and Settings
  Info,
  Check,
  Settings
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const [licensePhoto, setLicensePhoto] = useState<string | null>(null);

  useEffect(() => {
    if (!checkAuthStatus()) { navigate('/login'); return; }
    
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    setUserData({
      ...profile,
      isVerified: profile.isVerified || false,
      isEmailVerified: profile.isEmailVerified || false,
      driverRating: 5.0,
      language: profile.language || 'Türkçe',
      avatar: profile.avatar || null
    });

    const loadData = () => {
      setMyTrips(JSON.parse(localStorage.getItem('myTrips') || '[]'));
      setMyCars(JSON.parse(localStorage.getItem('myCars') || '[]'));
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [navigate]);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(userData));
    alert("Profil bilgileriniz başarıyla güncellendi!");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        const updated = { ...userData, avatar: base64 };
        setUserData(updated);
        localStorage.setItem('userProfile', JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLicenseUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLicensePhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const verifyAccount = () => {
    if (!licensePhoto) return alert("Lütfen ehliyet fotoğrafını yükleyin.");
    const updated = { ...userData, isVerified: true };
    localStorage.setItem('userProfile', JSON.stringify(updated));
    setUserData(updated);
    alert("Ehliyet bilgileriniz kontrol ediliyor, profiliniz kısa sürede doğrulanacaktır!");
  };

  const sidebarLinks = [
    { id: 'edit', label: 'Profilimi Düzenle', icon: User },
    { id: 'verify', label: 'Profilimi Doğrula', icon: ShieldCheck },
    { id: 'rentals', label: 'Kiralamalarım', icon: History },
    { id: 'cars', label: 'Araçlarım', icon: Car },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'payments', label: 'Ödeme Yöntemleri', icon: CreditCard },
    { id: 'credit', label: '₺500 Kredi Kazan', icon: Gift },
  ];

  const inputClass = "w-full p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-bold transition-all shadow-sm placeholder:text-gray-300";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300 pb-24">
      <Navbar />

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* Sidebar Navigation */}
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border dark:border-gray-800 p-4 sticky top-24">
              <nav className="space-y-1">
                {sidebarLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all font-bold text-sm ${
                      activeTab === link.id 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 shadow-sm' 
                      : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <link.icon size={20} />
                    {link.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1">
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border dark:border-gray-800 p-8 md:p-12 shadow-sm min-h-[600px]">
              
              {activeTab === 'edit' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Profilimi Düzenle</h2>
                  <p className="text-gray-500 text-sm font-bold mb-10">Bu bilgilerin bir kısmı, rezervasyon yaptığınızda araç sahiplerine gösterilir.</p>

                  <div className="mb-12">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Profil Fotoğrafı</h3>
                    <div className="flex items-center gap-8">
                       <div className="relative group">
                          <div className="w-24 h-24 rounded-[2rem] bg-primary-600 flex items-center justify-center text-white text-3xl font-black shadow-xl overflow-hidden">
                             {userData?.avatar ? <img src={userData.avatar} className="w-full h-full object-cover" /> : userData?.name?.[0]}
                          </div>
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="absolute -bottom-2 -right-2 bg-white dark:bg-gray-800 p-2.5 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 text-primary-600 hover:scale-110 transition-transform"
                          >
                             <Camera size={18} />
                          </button>
                          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                       </div>
                       <p className="text-xs text-gray-400 font-medium leading-relaxed max-w-xs">İyi bir profil fotoğrafı güven oluşturur. Lütfen yüzünüzün net göründüğü bir fotoğraf yükleyin.</p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-10">
                    <section className="space-y-6">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Kişisel Bilgiler</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Soyadınız</label>
                           <input type="text" value={userData?.surname || ''} onChange={e => setUserData({...userData, surname: e.target.value})} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Adınız</label>
                           <input type="text" value={userData?.name || ''} onChange={e => setUserData({...userData, name: e.target.value})} className={inputClass} />
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Doğum Tarihi</label>
                           <input type="date" value={userData?.birthDate || ''} onChange={e => setUserData({...userData, birthDate: e.target.value})} className={inputClass} />
                        </div>
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Doğum Yeri</label>
                           <input type="text" placeholder="Şehir girin" value={userData?.birthPlace || ''} onChange={e => setUserData({...userData, birthPlace: e.target.value})} className={inputClass} />
                        </div>
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">Ehliyet Bilgileri</h3>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ehliyet Numarası</label>
                         <input type="text" placeholder="Örn: 12107501..." value={userData?.licenseNumber || ''} onChange={e => setUserData({...userData, licenseNumber: e.target.value})} className={inputClass} />
                      </div>
                    </section>

                    <section className="space-y-6">
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em]">İletişim</h3>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">E-posta</label>
                         <div className="relative">
                            <input disabled type="email" value={userData?.email || ''} className={`${inputClass} bg-gray-50 opacity-60`} />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                               {userData?.isEmailVerified ? (
                                 <span className="text-[10px] font-black text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase">Doğrulandı</span>
                               ) : (
                                 <button type="button" className="text-[10px] font-black text-primary-600 bg-primary-50 px-3 py-1.5 rounded-full uppercase hover:bg-primary-100">Doğrula</button>
                               )}
                            </div>
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Telefon</label>
                         <input type="tel" value={userData?.phone || ''} onChange={e => setUserData({...userData, phone: e.target.value})} className={inputClass} />
                      </div>
                    </section>

                    <button type="submit" className="bg-primary-600 text-white px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 active:scale-95">Profili Güncelle</button>
                  </form>
                </div>
              )}

              {activeTab === 'verify' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 max-w-3xl">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Profilini Doğrula</h2>
                  <p className="text-gray-500 text-sm font-bold mb-12">Güvenli bir topluluk için ehliyetinizi doğrulamanız gerekmektedir.</p>

                  <div className="flex flex-col md:flex-row gap-10 items-start">
                     <div className="flex-1 space-y-8">
                        <div className="bg-primary-50 dark:bg-primary-900/10 p-8 rounded-[2rem] border-2 border-primary-100 dark:border-primary-800">
                           <h3 className="text-lg font-black text-primary-700 dark:text-primary-400 mb-4 uppercase">Arsen Altun</h3>
                           <div className="flex items-center gap-3 text-sm font-bold text-primary-600">
                              <Info size={18} />
                              Profiliniz henüz doğrulanmadı.
                           </div>
                        </div>

                        <div className="space-y-4">
                           <h4 className="font-black text-sm uppercase text-gray-900 dark:text-white">Henüz uygulamanız yok mu?</h4>
                           <button className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-primary-700 transition-all">Uygulamayı İndir</button>
                        </div>
                     </div>

                     <div className="flex-1">
                        <div className="relative aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-[2.5rem] border-4 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center p-8 overflow-hidden group">
                           {licensePhoto ? (
                             <>
                               <img src={licensePhoto} className="absolute inset-0 w-full h-full object-cover" />
                               <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button onClick={() => licenseInputRef.current?.click()} className="bg-white text-primary-600 p-4 rounded-full shadow-2xl">
                                     <Upload size={24} />
                                  </button>
                               </div>
                               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl animate-in zoom-in duration-500">
                                  <Check size={40} strokeWidth={4} />
                               </div>
                             </>
                           ) : (
                             <>
                               <Camera size={48} className="text-gray-300 mb-4" />
                               <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest leading-relaxed">Ehliyetinizin ön yüzünü <br/> çerçeveye hizalayın</p>
                               <button onClick={() => licenseInputRef.current?.click()} className="mt-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-xl font-bold text-xs uppercase shadow-lg">Fotoğraf Çek / Yükle</button>
                             </>
                           )}
                           <input type="file" ref={licenseInputRef} onChange={handleLicenseUpload} className="hidden" accept="image/*" />
                        </div>
                        {licensePhoto && (
                           <button onClick={verifyAccount} className="w-full mt-6 bg-green-600 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-green-700 transition-all shadow-xl shadow-green-600/20">Doğrulamayı Gönder</button>
                        )}
                     </div>
                  </div>
                </div>
              )}

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
                                <h4 className="font-black text-gray-900 dark:text-white uppercase">{trip.carName}</h4>
                                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${trip.status === 'Tamamlandı' ? 'bg-green-50 text-green-600' : 'bg-primary-50 text-primary-600'}`}>{trip.status}</span>
                              </div>
                              <p className="text-xs text-gray-500 font-bold mt-1 flex items-center gap-1"><Calendar size={12}/> {new Date(trip.pickupDate).toLocaleDateString('tr-TR')}</p>
                              <div className="mt-4 flex justify-between items-center">
                                 <p className="text-sm font-black text-primary-600">₺{trip.totalPrice}</p>
                                 <button className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1 hover:text-primary-600">Detaylar <ChevronRight size={12}/></button>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'cars' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex justify-between items-center mb-10">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Araçlarım</h2>
                    <button onClick={() => navigate('/list-car')} className="flex items-center gap-2 bg-gray-900 dark:bg-primary-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
                       <PlusCircle size={18} /> Yeni İlan
                    </button>
                  </div>

                  {myCars.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[2.5rem] border-2 border-dashed border-gray-200 dark:border-gray-700">
                       <Car size={48} className="text-gray-300 mx-auto mb-4" />
                       <h3 className="text-lg font-bold text-gray-400">Henüz yayınlanmış bir aracınız yok.</h3>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                      {myCars.map(car => (
                        <div key={car.id} className="bg-white dark:bg-gray-800 rounded-[2rem] border dark:border-gray-700 overflow-hidden group">
                           <div className="h-40 relative">
                              <img src={car.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-3 py-1 rounded-xl text-[9px] font-black text-green-600 uppercase tracking-widest">AKTİF</div>
                           </div>
                           <div className="p-6">
                              <h4 className="text-lg font-black text-gray-900 dark:text-white uppercase">{car.brand} {car.model}</h4>
                              <div className="flex justify-between items-end mt-4">
                                 <p className="text-xl font-black text-primary-600">₺{car.pricePerDay}</p>
                                 <button onClick={() => navigate('/dashboard')} className="text-[10px] font-black text-gray-400 uppercase tracking-widest border-b-2 border-transparent hover:border-primary-600 hover:text-primary-600 transition-all">Panel Gör</button>
                              </div>
                           </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Other tabs can be empty placeholders or similarly designed */}
              {['notifications', 'payments', 'credit'].includes(activeTab) && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                   <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-300 mb-6">
                      <Settings size={32} />
                   </div>
                   <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Çok Yakında</h3>
                   <p className="text-sm text-gray-400 font-bold mt-2">Bu bölüm geliştirme aşamasındadır.</p>
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
