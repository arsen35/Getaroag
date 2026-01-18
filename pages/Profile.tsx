
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
  Car,
  Camera,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../services/firebase';

const ReviewModal = ({ isOpen, onClose, onSubmit, title = "YORUM YAP" }: any) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 relative">
        <button onClick={onClose} className="absolute top-8 right-8 text-gray-400 hover:text-gray-600"><X size={28}/></button>
        <h3 className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-wider mb-8">{title}</h3>
        <div className="space-y-8">
          <div className="flex justify-center gap-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setRating(star)} className={`p-1 transition-transform active:scale-90 ${rating >= star ? 'text-yellow-400' : 'text-gray-200 dark:text-gray-700'}`}>
                <Star size={44} fill={rating >= star ? 'currentColor' : 'none'} strokeWidth={1.5} />
              </button>
            ))}
          </div>
          <div>
            <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-3 block">DENEYİMİNİZ</label>
            <textarea rows={5} value={comment} onChange={e => setComment(e.target.value)} className="w-full p-6 bg-gray-50 dark:bg-gray-900/50 rounded-[2rem] border-none outline-none font-bold text-gray-700 dark:text-gray-200 placeholder-gray-300 resize-none transition-all focus:ring-2 focus:ring-primary-500/10" placeholder="..." />
          </div>
          <button onClick={() => onSubmit({ rating, comment })} className="w-full bg-primary-600 text-white py-5 rounded-[1.5rem] font-black flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all text-lg">
            <MessageSquare size={24} fill="white" /> Gönder
          </button>
        </div>
      </div>
    </div>
  );
};

const CheckInModal = ({ isOpen, type, onClose, onComplete }: any) => {
  const [photos, setPhotos] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  if (!isOpen) return null;

  const handleUpload = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhotos(prev => [...prev, reader.result as string].slice(0, 4));
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-[2.5rem] p-10 shadow-2xl">
        <h3 className="text-2xl font-black mb-6 uppercase tracking-widest">{type === 'check-in' ? 'TESLİM ALMA' : 'İADE ETME'} SÜRECİ</h3>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl mb-8 flex items-start gap-3 border border-blue-100">
           <Camera size={20} className="text-blue-600 shrink-0" />
           <p className="text-xs font-bold text-blue-800 dark:text-blue-300 uppercase leading-relaxed">Güvenliğiniz için aracın 4 bir yanından fotoğraf yükleyin. Bu fotoğraflar 14 gün sonra otomatik silinecektir.</p>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-8">
           {photos.map((p, i) => (
             <div key={i} className="aspect-video rounded-2xl overflow-hidden border-2 border-primary-500"><img src={p} className="w-full h-full object-cover" /></div>
           ))}
           {photos.length < 4 && (
             <button onClick={() => fileInput.current?.click()} className="aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
               <PlusCircle size={32} />
               <input type="file" className="hidden" ref={fileInput} onChange={handleUpload} />
             </button>
           )}
        </div>
        <button disabled={photos.length < 4} onClick={() => onComplete(photos)} className="w-full bg-primary-600 disabled:bg-gray-300 text-white py-5 rounded-[1.5rem] font-black shadow-xl active:scale-95 transition-all uppercase tracking-widest">Süreci Tamamla</button>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('guest');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCheckInOpen, setIsCheckInOpen] = useState(false);
  const [checkInType, setCheckInType] = useState('check-in');
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [myTrips, setMyTrips] = useState<any[]>([]);
  const [myCars, setMyCars] = useState<any[]>([]);

  useEffect(() => {
    if (!checkAuthStatus()) { navigate('/login'); return; }
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    setUserData({
      ...profile,
      driverRating: profile.driverRating || 5.0,
      totalRents: profile.totalRents || (Math.floor(Math.random() * 20)),
      isVerified: profile.isVerified || false
    });
    const loadData = () => {
      setMyTrips(JSON.parse(localStorage.getItem('myTrips') || '[]'));
      setMyCars(JSON.parse(localStorage.getItem('myCars') || '[]'));
    };
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [navigate]);

  const verifyAccount = () => {
    const updated = { ...userData, isVerified: true };
    localStorage.setItem('userProfile', JSON.stringify(updated));
    setUserData(updated);
    alert("Ehliyet ve Kimlik bilgileriniz başarıyla doğrulandı!");
  };

  const handleProcessComplete = (photos: string[]) => {
    const updated = myTrips.map(t => {
      if (t.id === selectedTrip.id) {
        if (checkInType === 'check-in') return { ...t, status: 'Devam Ediyor', checkInPhotos: photos };
        return { ...t, status: 'Tamamlandı', checkOutPhotos: photos };
      }
      return t;
    });
    localStorage.setItem('myTrips', JSON.stringify(updated));
    setMyTrips(updated);
    setIsCheckInOpen(false);
    
    const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
    notifications.unshift({ id: Date.now(), title: 'İşlem Başarılı', message: `Araç ${checkInType === 'check-in' ? 'teslim alındı' : 'iade edildi'}.`, time: 'Az önce', read: false, type: 'success' });
    localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 10)));
    window.dispatchEvent(new Event('newNotification'));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-sans transition-colors duration-300 pb-24">
      <Navbar />
      <ReviewModal isOpen={isReviewModalOpen} onClose={() => setIsReviewModalOpen(false)} onSubmit={(data: any) => {
        const updated = myTrips.map(t => t.id === selectedTrip.id ? { ...t, reviewed: true, rating: data.rating } : t);
        localStorage.setItem('myTrips', JSON.stringify(updated));
        setMyTrips(updated);
        setIsReviewModalOpen(false);
      }} />
      <CheckInModal isOpen={isCheckInOpen} type={checkInType} onClose={() => setIsCheckInOpen(false)} onComplete={handleProcessComplete} />

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8 items-start mb-12">
           <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-xl">
              {userData?.name?.[0]}{userData?.surname?.[0]}
           </div>
           <div className="flex-1">
              <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase leading-none">{userData?.name} {userData?.surname}</h1>
              <div className="flex flex-wrap gap-4 mt-4">
                 <div className="flex items-center gap-2 text-sm text-gray-500 font-bold bg-white dark:bg-gray-900 px-4 py-2 rounded-full border dark:border-gray-800"><Mail size={16} /> {userData?.email}</div>
                 <div className="flex items-center gap-2 text-sm text-yellow-500 font-bold bg-white dark:bg-gray-900 px-4 py-2 rounded-full border dark:border-gray-800"><Star size={16} fill="currentColor" /> {userData?.driverRating} Sürücü Puanı</div>
                 {userData?.isVerified ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 font-bold bg-green-50 px-4 py-2 rounded-full border border-green-100"><ShieldCheck size={16} /> Doğrulanmış Hesap</div>
                 ) : (
                    <button onClick={verifyAccount} className="flex items-center gap-2 text-sm text-red-600 font-black bg-red-50 px-4 py-2 rounded-full border border-red-100 uppercase tracking-widest animate-pulse">Hesabını Doğrula</button>
                 )}
              </div>
           </div>
        </div>

        <div className="flex bg-gray-200/50 dark:bg-gray-900 p-2 rounded-[2rem] mb-10 max-w-md">
           <button onClick={() => setActiveTab('guest')} className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'guest' ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-xl' : 'text-gray-400'}`}><History size={16} /> Yolculuklarım</button>
           <button onClick={() => setActiveTab('host')} className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === 'host' ? 'bg-white dark:bg-gray-800 text-primary-600 shadow-xl' : 'text-gray-400'}`}><Car size={16} /> Araçlarım</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {activeTab === 'guest' ? myTrips.map(trip => (
            <div key={trip.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden border dark:border-gray-800 p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex gap-4 mb-6">
                    <img src={trip.carImage} className="w-24 h-24 rounded-2xl object-cover" />
                    <div className="flex-1">
                        <div className="flex justify-between">
                            <h4 className="font-black uppercase text-gray-900 dark:text-white">{trip.carName}</h4>
                            <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg ${trip.status === 'Yaklaşan' ? 'bg-blue-50 text-blue-600' : trip.status === 'Devam Ediyor' ? 'bg-yellow-50 text-yellow-600' : 'bg-green-50 text-green-600'}`}>{trip.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 font-bold mt-1 flex items-center gap-1"><Calendar size={12}/> {new Date(trip.pickupDate).toLocaleDateString('tr-TR')}</p>
                        <p className="text-sm font-black text-primary-600 mt-2">₺{trip.totalPrice}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-4 border-t dark:border-gray-800">
                    {trip.status === 'Yaklaşan' && (
                       <button onClick={() => { setSelectedTrip(trip); setCheckInType('check-in'); setIsCheckInOpen(true); }} className="col-span-2 bg-primary-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest shadow-lg">Aracı Teslim Al</button>
                    )}
                    {trip.status === 'Devam Ediyor' && (
                       <button onClick={() => { setSelectedTrip(trip); setCheckInType('check-out'); setIsCheckInOpen(true); }} className="col-span-2 bg-gray-900 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest">İade Et</button>
                    )}
                    {trip.status === 'Tamamlandı' && !trip.reviewed && (
                       <button onClick={() => { setSelectedTrip(trip); setIsReviewModalOpen(true); }} className="col-span-2 border-2 border-primary-600 text-primary-600 py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"><Star size={14}/> Aracı Puanla</button>
                    )}
                </div>
            </div>
          )) : myCars.map(car => (
            <div key={car.id} className="bg-white dark:bg-gray-900 rounded-[2.5rem] border dark:border-gray-800 overflow-hidden p-6">
               <div className="h-40 rounded-2xl overflow-hidden mb-6"><img src={car.image} className="w-full h-full object-cover" /></div>
               <div className="flex justify-between items-end mb-6">
                  <div>
                    <h4 className="text-xl font-black text-gray-900 dark:text-white uppercase">{car.brand} {car.model}</h4>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{car.location.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-primary-600">₺{car.pricePerDay}</p>
                  </div>
               </div>
               <div className="flex gap-2">
                  <button className="flex-1 py-3 bg-gray-50 dark:bg-gray-800 rounded-xl font-black text-[10px] uppercase tracking-widest text-gray-500">Düzenle</button>
                  <Link to="/dashboard" className="flex-1 py-3 bg-primary-50 dark:bg-primary-900/20 text-primary-600 text-center rounded-xl font-black text-[10px] uppercase tracking-widest">Analiz Gör</Link>
               </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
