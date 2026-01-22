
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
  X,
  Fuel,
  Play,
  Pause
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
  const [isSaving, setIsSaving] = useState(false);
  
  const [editingCar, setEditingCar] = useState<any>(null);
  const editPhotoRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Verileri merkezi servisten yükle
  const loadAllData = () => {
    const profile = dbService.getProfile();
    if (profile) {
      setUserData({
        ...profile,
        isVerified: profile.isVerified || false,
        avatar: profile.avatar || null,
      });
    }
    setMyTrips(dbService.getTrips());
    setMyCars(dbService.getCars());
    setNotifications(dbService.getNotifications());
  };

  useEffect(() => {
    if (!checkAuthStatus()) { navigate('/login'); return; }
    loadAllData();
    // Diğer sekmelerden veya sayfalardan gelen değişiklikleri dinle
    window.addEventListener('storage', loadAllData);
    return () => window.removeEventListener('storage', loadAllData);
  }, [navigate]);

  // --- KESİN SİLME FONKSİYONU ---
  const handleDeleteCar = (id: number | string, name: string) => {
    if (window.confirm(`${name} ilanını kalıcı olarak silmek istediğinizden emin misiniz?`)) {
        dbService.deleteCar(id);
        // UI'yı anında güncelle
        setMyCars(dbService.getCars());
        
        dbService.addNotification({
            id: Date.now(),
            title: 'İlan Silindi',
            message: `${name} ilanınız başarıyla kaldırıldı.`,
            time: 'Az önce',
            read: false,
            type: 'info'
        });
    }
  };

  // --- İLAN DURAKLATMA / DONDURMA FONKSİYONU ---
  const handleToggleStatus = (id: number | string, name: string, currentStatus: string) => {
    dbService.toggleCarStatus(id);
    const newStatus = (currentStatus === 'Active' || !currentStatus) ? 'Paused' : 'Active';
    
    // UI'yı anında güncelle
    setMyCars(dbService.getCars());
    
    dbService.addNotification({
        id: Date.now(),
        title: newStatus === 'Paused' ? 'İlan Duraklatıldı' : 'İlan Yayında',
        message: `${name} artık ${newStatus === 'Paused' ? 'arama sonuçlarında gizlendi' : 'tekrar kiralanabilir durumda'}.`,
        time: 'Az önce',
        read: false,
        type: 'info'
    });
  };

  const handleUpdateCarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCar) return;
    dbService.updateCar(editingCar.id, { ...editingCar });
    setEditingCar(null);
    loadAllData();
  };

  // Fix: Added missing handleUpdateProfile function to update user data
  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simüle edilmiş kayıt işlemi (800ms gecikme ile)
    setTimeout(() => {
      dbService.updateProfile(userData);
      setIsSaving(false);
      
      dbService.addNotification({
        id: Date.now(),
        title: 'Profil Güncellendi',
        message: 'Profil bilgileriniz başarıyla kaydedildi.',
        time: 'Az önce',
        read: false,
        type: 'success'
      });
      
      loadAllData();
      alert('Profiliniz başarıyla güncellendi.');
    }, 800);
  };

  const sidebarLinks = [
    { id: 'edit', label: 'Profilimi Düzenle', icon: User },
    { id: 'verify', label: 'Profilimi Doğrula', icon: ShieldCheck },
    { id: 'rentals', label: 'Kiralamalarım', icon: History },
    { id: 'cars', label: 'Araçlarım', icon: Car, badge: myCars.length },
    { id: 'notifications', label: 'Bildirimler', icon: Bell, badge: notifications.filter(n => !n.read).length },
    { id: 'payments', label: 'Ödeme Yöntemleri', icon: CreditCard },
  ];

  const inputClass = "w-full p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-[10px] focus:ring-1 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-bold transition-all text-sm";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300 pb-24">
      <Navbar />

      {/* --- EDİT MODAL --- */}
      {editingCar && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border dark:border-gray-800 p-8 w-full max-w-2xl animate-in zoom-in-95">
                <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">İlanı Düzenle</h3>
                    <button onClick={() => setEditingCar(null)} className="text-gray-400 hover:text-gray-600 p-2"><X size={24}/></button>
                </div>
                <form onSubmit={handleUpdateCarSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Marka" value={editingCar.brand} onChange={e => setEditingCar({...editingCar, brand: e.target.value})} className={inputClass} />
                        <input type="text" placeholder="Model" value={editingCar.model} onChange={e => setEditingCar({...editingCar, model: e.target.value})} className={inputClass} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                        <input type="number" placeholder="Günlük Fiyat (₺)" value={editingCar.pricePerDay} onChange={e => setEditingCar({...editingCar, pricePerDay: e.target.value})} className={`${inputClass} font-black text-primary-600`} />
                        <select value={editingCar.transmission} onChange={e => setEditingCar({...editingCar, transmission: e.target.value})} className={inputClass}>
                            <option value="Otomatik">Otomatik</option>
                            <option value="Manuel">Manuel</option>
                        </select>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setEditingCar(null)} className="flex-1 px-6 py-4 rounded-[10px] border border-gray-200 dark:border-gray-700 font-bold text-xs">İPTAL</button>
                        <button type="submit" className="flex-[2] px-6 py-4 rounded-[10px] bg-primary-600 text-white font-bold text-xs">KAYDET</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex flex-col lg:flex-row gap-10">
          
          <aside className="lg:w-72 shrink-0">
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border border-gray-100 dark:border-gray-800 p-4 sticky top-24">
              <nav className="space-y-1 text-left">
                {sidebarLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => setActiveTab(link.id)}
                    className={`w-full flex items-center justify-between px-5 py-4 rounded-[10px] transition-all font-bold text-sm ${
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
            <div className="bg-white dark:bg-gray-900 rounded-[10px] border border-gray-100 dark:border-gray-800 p-8 md:p-12 min-h-[600px] text-left">
              
              {/* --- ARAÇLARIM SEKMESİ --- */}
              {activeTab === 'cars' && (
                 <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex justify-between items-center mb-10">
                      <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Araçlarım</h2>
                      <button onClick={() => navigate('/list-car')} className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-[10px] font-bold text-xs uppercase border border-primary-500 shadow-lg shadow-primary-500/10">
                         <PlusCircle size={18} /> Yeni İlan
                      </button>
                    </div>

                    {myCars.length === 0 ? (
                      <div className="text-center py-20 bg-gray-50 dark:bg-gray-800/50 rounded-[10px] border-2 border-dashed border-gray-200 dark:border-gray-700">
                         <Car size={48} className="text-gray-300 mx-auto mb-4" />
                         <h3 className="text-lg font-bold text-gray-400 mb-6 uppercase tracking-widest">Henüz bir aracınız yok.</h3>
                         <button onClick={() => navigate('/list-car')} className="bg-white dark:bg-gray-700 text-primary-600 px-8 py-3 rounded-[10px] font-black text-xs uppercase border border-gray-200">Hemen Listele</button>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-8">
                        {myCars.map(car => (
                          <div key={car.id} className={`bg-white dark:bg-gray-800 rounded-[10px] border overflow-hidden relative transition-all duration-300 ${car.status === 'Paused' ? 'grayscale opacity-60 border-gray-200' : 'border-gray-100 hover:border-primary-200 shadow-sm'}`}>
                             <div className="h-48 relative">
                                <img src={car.image} className="w-full h-full object-cover" />
                                <div className={`absolute top-4 left-4 backdrop-blur-md px-3 py-1.5 rounded-[10px] text-[10px] font-black uppercase tracking-widest border ${car.status === 'Paused' ? 'bg-yellow-50/90 text-yellow-700 border-yellow-200' : 'bg-green-50/90 text-green-600 border-green-100'}`}>
                                  {car.status === 'Paused' ? 'DURAKLATILDI' : 'YAYINDA'}
                                </div>
                             </div>
                             <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                   <div>
                                      <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase leading-none tracking-tight">{car.brand} {car.model}</h4>
                                      <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">{car.location?.city}</p>
                                   </div>
                                   <div className="text-right">
                                      <p className="text-xl font-black text-primary-600">₺{car.pricePerDay}</p>
                                      <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">GÜNLÜK</p>
                                   </div>
                                </div>
                                
                                <div className="grid grid-cols-3 gap-2">
                                   <button onClick={() => setEditingCar(car)} className="bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-200 p-3.5 rounded-[10px] flex items-center justify-center hover:bg-gray-100 transition-colors" title="Düzenle">
                                      <Pencil size={18} />
                                   </button>
                                   
                                   {/* DURDUR / BAŞLAT BUTONU */}
                                   <button 
                                      onClick={() => handleToggleStatus(car.id, `${car.brand} ${car.model}`, car.status)} 
                                      className={`${car.status === 'Paused' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'} p-3.5 rounded-[10px] flex items-center justify-center hover:scale-105 transition-all`} 
                                      title={car.status === 'Paused' ? 'Yayınla' : 'Duraklat'}
                                   >
                                      {car.status === 'Paused' ? <Play size={18} /> : <Pause size={18} />}
                                   </button>
                                   
                                   {/* SİLME BUTONU */}
                                   <button 
                                      onClick={() => handleDeleteCar(car.id, `${car.brand} ${car.model}`)} 
                                      className="bg-red-50 text-red-600 p-3.5 rounded-[10px] flex items-center justify-center hover:bg-red-100 transition-colors" 
                                      title="Kalıcı Olarak Sil"
                                   >
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

              {/* DİĞER SEKMELER (DÜZENLEME) */}
              {activeTab === 'edit' && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">Profilimi Düzenle</h2>
                  <p className="text-gray-500 text-sm font-bold mb-10">Kişisel bilgilerinizi güncelleyin.</p>
                  
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
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
                    <button type="submit" disabled={isSaving} className="bg-primary-600 text-white px-10 py-5 rounded-[10px] font-black text-sm uppercase tracking-widest active:scale-95 flex items-center gap-2 border border-primary-500">
                       {isSaving ? "KAYDEDİLİYOR..." : "DEĞİŞİKLİKLERİ KAYDET"}
                    </button>
                  </form>
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
