
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { 
  PlusCircle, Car, Camera, ShieldCheck, History, Bell, CreditCard, User, X, Pencil, Trash2, Play, Pause, Loader2, MapPin, Fuel, Save, CheckCircle, ChevronRight, AlertCircle, Mail, Phone, Lock
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { checkAuthStatus, dbService } from '../services/firebase';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'edit');
  
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [myCars, setMyCars] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingCar, setEditingCar] = useState<any>(null);
  const editPhotoRef = useRef<HTMLInputElement>(null);
  
  const loadData = () => {
    setUserData(dbService.getProfile());
    setMyTrips(dbService.getTrips());
    setMyCars(dbService.getCars());
    setNotifications(dbService.getNotifications());
    setPayments(dbService.getPaymentMethods());
  };

  useEffect(() => {
    if (!checkAuthStatus()) { navigate('/login'); return; }
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [navigate]);

  // SİLME İŞLEMİ (KESİN ÇÖZÜM)
  const handleDeleteCar = (id: number | string, name: string) => {
    if (window.confirm(`${name} ilanını kalıcı olarak silmek istediğinizden emin misiniz?`)) {
        dbService.deleteCar(id);
        // State'i anında güncelle ve zorunlu refresh
        const updated = myCars.filter(c => String(c.id) !== String(id));
        setMyCars(updated);
        
        dbService.addNotification({
            id: Date.now(),
            title: 'İlan Kaldırıldı',
            message: `${name} başarıyla silindi.`,
            time: 'Az önce',
            read: false,
            type: 'info'
        });
        
        // Bazı durumlarda React state gecikebileceği için garantili yöntem
        setTimeout(() => { window.location.reload(); }, 100);
    }
  };

  const handleToggleStatus = (id: number | string, name: string) => {
    dbService.toggleCarStatus(id);
    loadData();
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      dbService.updateProfile(userData);
      setIsSaving(false);
      alert("Bilgiler güncellendi.");
    }, 500);
  };

  const handleUpdateCar = (e: React.FormEvent) => {
    e.preventDefault();
    dbService.updateCar(editingCar.id, editingCar);
    setEditingCar(null);
    loadData();
  };

  const inputClass = "w-full p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[10px] focus:ring-1 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans pb-24">
      <Navbar />

      {/* --- DETAYLI EDİT MODAL --- */}
      {editingCar && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border p-8 w-full max-w-2xl my-auto shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">İlan Detaylarını Düzenle</h3>
                    <button onClick={() => setEditingCar(null)} className="text-gray-400 p-2"><X size={24}/></button>
                </div>
                <form onSubmit={handleUpdateCar} className="space-y-6 text-left">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Görseli Güncelle</label>
                        <div className="relative group cursor-pointer h-40" onClick={() => editPhotoRef.current?.click()}>
                            <img src={editingCar.image} className="w-full h-full object-cover rounded-[10px]" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white font-bold text-xs rounded-[10px]">DEĞİŞTİR</div>
                            <input type="file" ref={editPhotoRef} className="hidden" onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    const reader = new FileReader();
                                    reader.onloadend = () => setEditingCar({ ...editingCar, image: reader.result as string });
                                    reader.readAsDataURL(e.target.files[0]);
                                }
                            }} />
                        </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Marka" value={editingCar.brand} onChange={e => setEditingCar({...editingCar, brand: e.target.value})} className={inputClass} />
                        <input type="text" placeholder="Model" value={editingCar.model} onChange={e => setEditingCar({...editingCar, model: e.target.value})} className={inputClass} />
                    </div>
                    <div className="grid md:grid-cols-3 gap-4">
                        <input type="number" placeholder="Yıl" value={editingCar.year} onChange={e => setEditingCar({...editingCar, year: e.target.value})} className={inputClass} />
                        <select value={editingCar.transmission} onChange={e => setEditingCar({...editingCar, transmission: e.target.value})} className={inputClass}>
                            <option value="Otomatik">Otomatik</option>
                            <option value="Manuel">Manuel</option>
                        </select>
                        <input type="number" placeholder="Fiyat" value={editingCar.pricePerDay} onChange={e => setEditingCar({...editingCar, pricePerDay: e.target.value})} className={`${inputClass} text-primary-600`} />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setEditingCar(null)} className="flex-1 px-6 py-4 rounded-[10px] border border-gray-200 font-bold text-xs uppercase">İPTAL</button>
                        <button type="submit" className="flex-[2] px-6 py-4 rounded-[10px] bg-primary-600 text-white font-bold text-xs uppercase shadow-lg shadow-primary-500/10">DEĞİŞİKLİKLERİ KAYDET</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border p-4 sticky top-24">
              <nav className="space-y-1 text-left">
                {[
                    { id: 'edit', label: 'Profilimi Düzenle', icon: User },
                    { id: 'verify', label: 'Profilimi Doğrula', icon: ShieldCheck },
                    { id: 'rentals', label: 'Kiralamalarım', icon: History },
                    { id: 'cars', label: 'Araçlarım', icon: Car, badge: myCars.length },
                    { id: 'notifications', label: 'Bildirimler', icon: Bell, badge: notifications.filter(n => !n.read).length },
                    { id: 'payments', label: 'Ödeme Yöntemleri', icon: CreditCard },
                ].map((link) => (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-[10px] transition-all font-bold text-sm ${
                      activeTab === link.id 
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 border border-primary-100' 
                      : 'text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <link.icon size={18} />
                      {link.label}
                    </div>
                    {link.badge && link.badge > 0 && (
                      <span className="bg-primary-600 text-white text-[10px] px-2 py-0.5 rounded-full">{link.badge}</span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex-1">
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border p-8 md:p-12 min-h-[600px] text-left">
              
              {/* --- ARAÇLARIM --- */}
              {activeTab === 'cars' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-10">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Araçlarım</h2>
                      <button onClick={() => navigate('/list-car')} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-[10px] font-bold text-xs uppercase shadow-lg shadow-primary-500/10">
                         <PlusCircle size={18} /> Yeni İlan
                      </button>
                    </div>

                    {myCars.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 rounded-[10px] border-2 border-dashed border-gray-200">
                         <Car size={48} className="text-gray-300 mx-auto mb-4" />
                         <p className="text-gray-400 font-bold text-sm uppercase">Henüz ilanınız yok.</p>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-8">
                        {myCars.map(car => (
                          <div key={car.id} className={`bg-white dark:bg-gray-800 rounded-[10px] border overflow-hidden relative ${car.status === 'Paused' ? 'opacity-60' : ''}`}>
                             <div className="h-44 relative">
                                <img src={car.image} className="w-full h-full object-cover" />
                                <div className={`absolute top-4 left-4 px-3 py-1.5 rounded-[10px] text-[10px] font-black border ${car.status === 'Paused' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>
                                  {car.status === 'Paused' ? 'DURAKLATILDI' : 'YAYINDA'}
                                </div>
                             </div>
                             <div className="p-6">
                                <h4 className="text-xl font-black uppercase text-gray-900 dark:text-white truncate">{car.brand} {car.model}</h4>
                                <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">{car.location?.city}</p>
                                <div className="mt-6 flex gap-2">
                                   <button onClick={() => setEditingCar(car)} className="flex-1 bg-gray-50 p-3 rounded-[10px] flex items-center justify-center hover:bg-gray-100"><Pencil size={18} /></button>
                                   <button onClick={() => handleToggleStatus(car.id, car.brand)} className="flex-1 bg-gray-50 p-3 rounded-[10px] flex items-center justify-center">{car.status === 'Paused' ? <Play size={18} /> : <Pause size={18} />}</button>
                                   <button onClick={() => handleDeleteCar(car.id, `${car.brand} ${car.model}`)} className="flex-1 bg-red-50 text-red-600 p-3 rounded-[10px] flex items-center justify-center"><Trash2 size={18} /></button>
                                </div>
                             </div>
                          </div>
                        ))}
                      </div>
                    )}
                 </div>
              )}

              {/* --- BİLDİRİMLER --- */}
              {activeTab === 'notifications' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-8">Bildirimler</h2>
                    <div className="space-y-4">
                        {notifications.map(n => (
                            <div key={n.id} className={`p-6 rounded-[10px] border flex gap-5 items-start ${!n.read ? 'bg-primary-50/30 border-primary-100' : 'bg-white'}`}>
                                <div className={`w-10 h-10 rounded-[10px] flex items-center justify-center shrink-0 ${n.type === 'success' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                    <Bell size={18} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-sm uppercase">{n.title}</h4>
                                    <p className="text-sm text-gray-500 mt-1">{n.message}</p>
                                    <span className="text-[10px] font-bold text-gray-400 mt-3 block">{n.time}</span>
                                </div>
                                {!n.read && <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>}
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {/* --- ÖDEME YÖNTEMLERİ --- */}
              {activeTab === 'payments' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-10">
                        <h2 className="text-3xl font-black uppercase tracking-tighter">Ödemeler</h2>
                        <button className="bg-gray-900 text-white px-6 py-3 rounded-[10px] font-bold text-xs uppercase">Kart Ekle</button>
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                        {payments.map(p => (
                            <div key={p.id} className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[10px] text-white relative overflow-hidden group">
                                <CreditCard size={40} className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-150 transition-transform" />
                                <div className="flex justify-between items-start mb-12">
                                    <div className="bg-white/20 px-3 py-1 rounded-[10px] text-[10px] font-black">{p.brand}</div>
                                    <CheckCircle size={20} className="text-primary-400" />
                                </div>
                                <p className="text-xl font-mono tracking-[4px] mb-4">•••• •••• •••• {p.last4}</p>
                                <div className="flex justify-between text-[10px] font-black uppercase text-gray-400">
                                    <span>VARSAYILAN KART</span>
                                    <span>EXP: {p.exp}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {/* --- PROFİL DÜZENLE --- */}
              {activeTab === 'edit' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-3xl font-black uppercase tracking-tighter mb-10">Kişisel Bilgiler</h2>
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Adınız</label>
                        <input type="text" value={userData?.name || ''} onChange={e => setUserData({...userData, name: e.target.value})} className={inputClass} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Soyadınız</label>
                        <input type="text" value={userData?.surname || ''} onChange={e => setUserData({...userData, surname: e.target.value})} className={inputClass} />
                      </div>
                    </div>
                    <button type="submit" disabled={isSaving} className="bg-primary-600 text-white px-10 py-5 rounded-[10px] font-black text-sm uppercase tracking-widest active:scale-95 border border-primary-500">
                       {isSaving ? "KAYDEDİLİYOR..." : "BİLGİLERİ GÜNCELLE"}
                    </button>
                  </form>
                </div>
              )}

              {/* --- KİRALAMALARIM --- */}
              {activeTab === 'rentals' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-10">Kiralamalarım</h2>
                    <div className="space-y-6">
                        {myTrips.map(trip => (
                            <div key={trip.id} className="flex gap-6 p-6 rounded-[10px] border items-center">
                                <img src={trip.carImage} className="w-32 h-24 object-cover rounded-[10px]" />
                                <div className="flex-1">
                                    <h4 className="text-lg font-black uppercase text-gray-900">{trip.carName}</h4>
                                    <p className="text-sm font-bold text-gray-400 mt-1">{trip.date}</p>
                                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-[5px] inline-block mt-3 ${trip.status === 'Tamamlandı' ? 'bg-gray-100 text-gray-500' : 'bg-primary-50 text-primary-600'}`}>{trip.status}</span>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-gray-900">₺{trip.price}</p>
                                    <button className="text-[10px] font-black text-primary-600 uppercase mt-2 flex items-center gap-1">Detay <ChevronRight size={14}/></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              )}

              {/* --- DOĞRULAMA --- */}
              {activeTab === 'verify' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Profil Doğrulama</h2>
                    <p className="text-gray-500 font-bold text-sm mb-12">Güvenli bir topluluk için belgelerinizi doğrulayın.</p>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-8 rounded-[10px] border border-green-100 bg-green-50/30 flex flex-col items-center text-center">
                            <Mail size={40} className="text-green-600 mb-6" />
                            <h4 className="font-black text-sm uppercase">E-posta Adresi</h4>
                            <p className="text-xs font-bold text-gray-400 mt-2 mb-6 uppercase">Doğrulandı</p>
                            <CheckCircle size={24} className="text-green-500" />
                        </div>
                        <div className="p-8 rounded-[10px] border border-gray-100 flex flex-col items-center text-center">
                            <Phone size={40} className="text-gray-400 mb-6" />
                            <h4 className="font-black text-sm uppercase">Telefon Numarası</h4>
                            <p className="text-xs font-bold text-gray-400 mt-2 mb-6 uppercase">Henüz Doğrulanmadı</p>
                            <button className="bg-primary-600 text-white px-6 py-2 rounded-[10px] font-black text-[10px] uppercase">ŞİMDİ DOĞRULA</button>
                        </div>
                        <div className="p-8 rounded-[10px] border border-gray-100 flex flex-col items-center text-center">
                            <Lock size={40} className="text-gray-400 mb-6" />
                            <h4 className="font-black text-sm uppercase">Ehliyet & Kimlik</h4>
                            <p className="text-xs font-bold text-gray-400 mt-2 mb-6 uppercase">Bekleniyor</p>
                            <button className="border border-gray-200 px-6 py-2 rounded-[10px] font-black text-[10px] uppercase">BELGE YÜKLE</button>
                        </div>
                    </div>
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
