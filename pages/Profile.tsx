
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { 
  PlusCircle, 
  Edit, 
  Trash2, 
  LogOut, 
  Calendar, 
  MapPin, 
  Mail, 
  ChevronRight, 
  Star,
  TrendingUp,
  History,
  ShieldCheck,
  X,
  Save,
  Search,
  MessageSquare,
  Car
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../services/firebase';

// Modal components defined outside to prevent re-mounting on every keystroke
const EditCarModal = ({ isOpen, car, onClose, onUpdate }: any) => {
  const [editingCar, setEditingCar] = useState<any>(car);
  
  useEffect(() => { setEditingCar(car); }, [car]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-widest">İlanı Düzenle</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X /></button>
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
           <button onClick={() => onUpdate(editingCar)} className="w-full bg-primary-600 text-white py-4 rounded-2xl font-black mt-4 flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
             <Save size={20} /> Bilgileri Güncelle
           </button>
        </div>
      </div>
    </div>
  );
};

const ReviewModal = ({ isOpen, onClose, onSubmit }: any) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 relative">
        <button 
          onClick={onClose} 
          className="absolute top-8 right-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <X size={28} strokeWidth={2.5} />
        </button>

        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider mb-8">YORUM YAP</h3>
        
        <div className="space-y-8">
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                type="button"
                onClick={() => setRating(star)} 
                className={`p-1 transition-transform active:scale-90 ${rating >= star ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}
              >
                <Star size={44} fill={rating >= star ? 'currentColor' : 'none'} strokeWidth={1.5} />
              </button>
            ))}
          </div>

          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-3 block">DENEYİMİNİZ</label>
            <textarea 
              rows={5} 
              value={comment} 
              onChange={e => setComment(e.target.value)} 
              className="w-full p-6 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border-none outline-none font-bold text-gray-700 dark:text-gray-200 placeholder-gray-300 resize-none transition-all focus:ring-2 focus:ring-primary-500/10" 
              placeholder="..."
            />
          </div>

          <button 
            onClick={() => onSubmit({ rating, comment })} 
            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-xl shadow-primary-600/20 active:scale-95 transition-all text-lg"
          >
            <MessageSquare size={24} fill="white" /> Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('guest');
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  
  const [editingCar, setEditingCar] = useState<any>(null);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  
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

  const handleUpdateCar = (updatedCar: any) => {
      const updated = myCars.map(c => c.id === updatedCar.id ? updatedCar : c);
      localStorage.setItem('myCars', JSON.stringify(updated));
      setMyCars(updated);
      setIsEditCarOpen(false);
      
      const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
      notifications.unshift({ id: Date.now(), title: 'İlan Güncellendi', message: `${updatedCar.brand} ${updatedCar.model} aracınız güncellendi.`, time: 'Az önce', read: false });
      localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 10)));
      window.dispatchEvent(new Event('newNotification'));
  };

  const handleReviewSubmit = ({ rating, comment }: { rating: number, comment: string }) => {
    if (!comment) return alert("Lütfen bir yorum yazın.");
    
    const updatedTrips = myTrips.map(t => t.id === selectedTrip.id ? { ...t, reviewed: true, rating, comment } : t);
    localStorage.setItem('myTrips', JSON.stringify(updatedTrips));
    setMyTrips(updatedTrips);
    setIsReviewModalOpen(false);
    
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift({ id: Date.now(), title: 'Teşekkürler!', message: `${selectedTrip.carName} için yorumunuz paylaşıldı.`, time: 'Az önce', read: false, type: 'success' });
    localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 10)));
    window.dispatchEvent(new Event('newNotification'));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300 pb-24">
      <Navbar />
      
      <EditCarModal 
        isOpen={isEditCarOpen} 
        car={editingCar} 
        onClose={() => setIsEditCarOpen(false)} 
        onUpdate={handleUpdateCar} 
      />
      
      <ReviewModal 
        isOpen={isReviewModalOpen} 
        onClose={() => setIsReviewModalOpen(false)} 
        onSubmit={handleReviewSubmit} 
      />

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

           <button onClick={handleLogout} className="p-4 bg-red-50 dark:bg-red-900/10 text-red-600 rounded-2xl hover:bg-red-100 transition-colors">
              <LogOut size={24} />
           </button>
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
                               <button onClick={() => { setEditingCar(car); setIsEditCarOpen(true); }} className="flex-1 py-4 bg-gray-50 dark:bg-gray-800 rounded-2xl font-black text-[10px] uppercase tracking-widest text-gray-600 dark:text-gray-300 hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
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
