
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { 
  User, 
  CreditCard, 
  Car, 
  Settings, 
  PlusCircle, 
  Edit, 
  Trash2, 
  LogOut, 
  CheckCircle, 
  Calendar, 
  MapPin, 
  Phone, 
  Mail, 
  ChevronRight, 
  Star,
  TrendingUp,
  History,
  ShieldCheck,
  X,
  Save,
  Search,
  MessageSquare
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../services/firebase';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('guest');
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const [editingCar, setEditingCar] = useState<any>(null);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [myCars, setMyCars] = useState<any[]>([]);

  useEffect(() => {
    if (!checkAuthStatus()) {
      navigate('/login');
      return;
    }
    
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      try { setUserData(JSON.parse(profile)); } catch (e) { setUserData(null); }
    } else {
      setUserData({
        name: 'Misafir', surname: 'Kullanıcı', email: 'user@example.com', phone: '05XX XXX XX XX'
      });
    }

    const loadData = () => {
      const trips = JSON.parse(localStorage.getItem('myTrips') || '[]');
      const cars = JSON.parse(localStorage.getItem('myCars') || '[]');
      setMyTrips(trips);
      setMyCars(cars);
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/');
  };

  const deleteCar = (id: number | string) => {
    if (window.confirm("Bu ilanı silmek istediğinize emin misiniz?")) {
      const updated = myCars.filter(c => c.id !== id);
      localStorage.setItem('myCars', JSON.stringify(updated));
      setMyCars(updated);
    }
  };

  const openCarEdit = (car: any) => {
      setEditingCar({...car});
      setIsEditCarOpen(true);
  };

  const handleUpdateCar = () => {
      const updated = myCars.map(c => c.id === editingCar.id ? editingCar : c);
      localStorage.setItem('myCars', JSON.stringify(updated));
      setMyCars(updated);
      setIsEditCarOpen(false);
      
      // Bildirim Ekle
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.unshift({ id: Date.now(), title: 'İlan Güncellendi', message: `${editingCar.brand} ${editingCar.model} aracınızın bilgileri güncellendi.`, time: 'Az önce', read: false });
      localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 10)));
      
      alert("İlan başarıyla güncellendi.");
  };

  const handleReviewSubmit = () => {
    if (!reviewData.comment) return alert("Lütfen bir yorum yazın.");
    
    // Yolculuğu güncelle (yorum yapıldı olarak işaretle)
    const updatedTrips = myTrips.map(t => t.id === selectedTrip.id ? { ...t, reviewed: true, rating: reviewData.rating, comment: reviewData.comment } : t);
    localStorage.setItem('myTrips', JSON.stringify(updatedTrips));
    setMyTrips(updatedTrips);
    setIsReviewModalOpen(false);
    
    // Simüle edilmiş bildirim
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift({ id: Date.now(), title: 'Değerlendirme Başarılı', message: `${selectedTrip.carName} için yorumunuz paylaşıldı.`, time: 'Az önce', read: false });
    localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 10)));
    
    alert("Yorumunuz için teşekkürler!");
  };

  const EditCarModal = () => (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">İlanı Düzenle</h3>
          <button onClick={() => setIsEditCarOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>
        <div className="space-y-5">
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Marka</label>
                <input type="text" value={editingCar?.brand} onChange={e => setEditingCar({...editingCar, brand: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none outline-none font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Model</label>
                <input type="text" value={editingCar?.model} onChange={e => setEditingCar({...editingCar, model: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none outline-none font-bold" />
              </div>
           </div>
           <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Günlük Fiyat (₺)</label>
                <input type="number" value={editingCar?.pricePerDay} onChange={e => setEditingCar({...editingCar, pricePerDay: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none outline-none font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">Yıl</label>
                <input type="number" value={editingCar?.year} onChange={e => setEditingCar({...editingCar, year: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none outline-none font-bold" />
              </div>
           </div>
           <button onClick={handleUpdateCar} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black mt-4 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
             <Save size={20} /> Bilgileri Güncelle
           </button>
        </div>
      </div>
    </div>
  );

  const ReviewModal = () => (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">Yorum Yap</h3>
          <button onClick={() => setIsReviewModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X /></button>
        </div>
        <div className="space-y-6">
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setReviewData({...reviewData, rating: star})} className={`p-1 transition-transform active:scale-90 ${reviewData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>
                <Star size={32} fill={reviewData.rating >= star ? 'currentColor' : 'none'} />
              </button>
            ))}
          </div>
          <div>
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block">Deneyiminiz</label>
            <textarea 
              rows={4} 
              value={reviewData.comment} 
              onChange={e => setReviewData({...reviewData, comment: e.target.value})} 
              className="w-full p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl border-none outline-none font-medium resize-none" 
              placeholder="Araç nasıldı? Araç sahibi yardımcı oldu mu?"
            />
          </div>
          <button onClick={handleReviewSubmit} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
            <MessageSquare size={20} /> Gönder
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300 pb-24">
      <Navbar />
      
      {isEditCarOpen && <EditCarModal />}
      {isReviewModalOpen && <ReviewModal />}

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
           <div className="relative group">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-xl">
                 {userData?.name?.[0]}{userData?.surname?.[0]}
              </div>
           </div>
           
           <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase leading-none">{userData?.name} {userData?.surname}</h1>
                <div className="flex flex-wrap gap-4 mt-2">
                   <div className="flex items-center gap-2 text-sm text-gray-500 font-bold bg-white dark:bg-gray-900 px-4 py-2 rounded-full border dark:border-gray-800">
                      <Mail size={16} className="text-primary-500" /> {userData?.email}
                   </div>
                   <div className="flex items-center gap-2 text-sm text-green-600 font-bold bg-green-50 dark:bg-green-900/10 px-4 py-2 rounded-full border border-green-100 dark:border-green-900/20">
                      <ShieldCheck size={16} /> Doğrulanmış Profil
                   </div>
                </div>
              </div>
           </div>
        </div>

        <div className="flex bg-gray-200/50 dark:bg-gray-900 p-2 rounded-[2rem] mb-10 max-w-md">
           <button onClick={() => setActiveTab('guest')} className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'guest' ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-xl' : 'text-gray-400'}`}>
             <History size={16} /> Yolculuklarım
           </button>
           <button onClick={() => setActiveTab('host')} className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'host' ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-xl' : 'text-gray-400'}`}>
             <Car size={16} /> Araçlarım
           </button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {activeTab === 'guest' ? (
            <div className="space-y-6">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Kiraladığım Araçlar</h2>
                  <Link to="/search" className="group bg-primary-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary-700 transition-all flex items-center gap-2 shadow-lg shadow-primary-600/20 active:scale-95">
                    <Search size={14} strokeWidth={3} /> Yeni Araç Kirala
                  </Link>
               </div>
               
               {myTrips.length === 0 ? (
                 <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-12 text-center border dark:border-gray-800">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                       <Calendar size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Henüz hiç yolculuk yapmadınız.</h3>
                    <Link to="/search" className="bg-primary-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg inline-flex items-center gap-2">Araçları Keşfet <ChevronRight size={20}/></Link>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myTrips.map(trip => (
                      <div key={trip.id} className="bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border dark:border-gray-800 flex flex-col sm:flex-row shadow-sm hover:shadow-md transition-all">
                         <div className="w-full sm:w-40 h-40">
                            <img src={trip.carImage} className="w-full h-full object-cover" />
                         </div>
                         <div className="p-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start mb-2">
                               <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tight">{trip.carName}</h4>
                               <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${trip.status === 'Yaklaşan' ? 'bg-primary-50 text-primary-600' : 'bg-green-50 text-green-600'}`}>
                                  {trip.status}
                               </span>
                            </div>
                            <div className="space-y-1 mb-4">
                               <p className="text-xs text-gray-500 font-bold flex items-center gap-1"><Calendar size={12}/> {new Date(trip.pickupDate).toLocaleDateString('tr-TR')}</p>
                               <p className="text-xs text-gray-500 font-bold flex items-center gap-1"><MapPin size={12}/> {trip.location}</p>
                            </div>
                            <div className="mt-auto flex justify-between items-center">
                               <p className="text-xl font-black text-gray-900 dark:text-white">₺{trip.totalPrice}</p>
                               {!trip.reviewed ? (
                                  <button 
                                    onClick={() => { setSelectedTrip(trip); setIsReviewModalOpen(true); }}
                                    className="p-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 rounded-xl hover:bg-primary-100 transition-colors"
                                    title="Yorum Yap"
                                  >
                                    <MessageSquare size={18} />
                                  </button>
                               ) : (
                                  <div className="flex items-center gap-1 text-yellow-400 font-black text-sm">
                                    <Star size={14} fill="currentColor" /> {trip.rating}
                                  </div>
                               )}
                            </div>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
            </div>
          ) : (
            <div className="space-y-6">
               <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-[0.2em]">Listelediğim Araçlar</h2>
                  <Link to="/list-car" className="bg-gray-900 dark:bg-primary-600 text-white px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg active:scale-95">
                     <PlusCircle size={14} /> Yeni İlan Ekle
                  </Link>
               </div>

               {myCars.length === 0 ? (
                 <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-12 text-center border dark:border-gray-800">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                       <TrendingUp size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Henüz bir araç eklemediniz.</h3>
                    <Link to="/list-car" className="bg-gray-900 dark:bg-primary-600 text-white px-8 py-4 rounded-2xl font-black shadow-lg inline-flex items-center gap-2">Aracını Hemen Listele <PlusCircle size={20}/></Link>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {myCars.map(car => (
                      <div key={car.id} className="bg-white dark:bg-gray-900 rounded-[2rem] overflow-hidden border dark:border-gray-800 shadow-sm">
                         <div className="h-48 relative">
                            <img src={car.image} className="w-full h-full object-cover" />
                            <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md px-4 py-2 rounded-xl text-xs font-black text-green-600 shadow-lg uppercase">AKTİF</div>
                         </div>
                         <div className="p-8">
                            <div className="flex justify-between items-start mb-6">
                               <div>
                                  <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase leading-none">{car.brand} {car.model}</h4>
                                  <p className="text-xs text-gray-400 font-bold mt-2 uppercase tracking-widest">{car.location.city}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-2xl font-black text-primary-600">₺{car.pricePerDay}</p>
                               </div>
                            </div>
                            <div className="flex gap-3 pt-6 border-t dark:border-gray-800">
                               <button onClick={() => openCarEdit(car)} className="flex-1 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                                  <Edit size={14} /> Düzenle
                               </button>
                               <button onClick={() => deleteCar(car.id)} className="p-4 bg-red-50 dark:bg-red-900/10 text-red-500 rounded-2xl hover:bg-red-100 transition-colors">
                                  <Trash2 size={20} />
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
      </div>
    </div>
  );
};

export default ProfilePage;
