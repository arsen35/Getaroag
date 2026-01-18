
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ImageCarousel from '../components/ImageCarousel';
import { Shield, CheckCircle, CreditCard, Calendar as CalendarIcon, Loader2, ArrowLeft, Clock, AlertTriangle } from 'lucide-react';
import { Car } from '../types';
import CustomCalendar from '../components/CustomCalendar';

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const car = state?.car as Car;
  
  const [pickupDate, setPickupDate] = useState(state?.pickupDate || new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(state?.returnDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [userVerified, setUserVerified] = useState(true);

  useEffect(() => {
    const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    if (profile && profile.isVerified === false) {
        setUserVerified(false);
    }
  }, []);

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
            <p className="text-gray-500 mb-4 font-bold">Araç bilgisi bulunamadı.</p>
            <button onClick={() => navigate('/search')} className="bg-primary-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs">Aramaya Dön</button>
        </div>
      </div>
    );
  }

  const start = new Date(pickupDate);
  const end = new Date(returnDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const days = diffDays > 0 ? diffDays : 1;
  const pricePerDay = Number(car.pricePerDay) || 0;
  const total = days * pricePerDay;
  const insurance = days * 150;
  const grandTotal = total + insurance;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userVerified) {
        alert("Lütfen önce profilinizden hesabınızı doğrulayın (Kimlik/Ehliyet).");
        navigate('/profile');
        return;
    }
    setIsProcessing(true);
    
    setTimeout(() => {
        const newTrip = {
            id: Date.now(),
            carId: car.id,
            carName: `${car.brand} ${car.model}`,
            carImage: car.image,
            pickupDate,
            returnDate,
            totalPrice: grandTotal,
            status: 'Yaklaşan',
            location: car.location.city,
            reviewed: false,
            ownerId: car.id.toString().substring(0, 5) // Mock owner ID
        };

        const existingTrips = JSON.parse(localStorage.getItem('myTrips') || '[]');
        localStorage.setItem('myTrips', JSON.stringify([newTrip, ...existingTrips]));

        const busyDates = JSON.parse(localStorage.getItem('busyDates') || '{}');
        if (!busyDates[car.id]) busyDates[car.id] = [];
        const prepareDate = new Date(returnDate);
        prepareDate.setDate(prepareDate.getDate() + 1);
        const prepareDateStr = prepareDate.toISOString().split('T')[0];
        busyDates[car.id].push({ start: pickupDate, end: returnDate, readyAfter: prepareDateStr });
        localStorage.setItem('busyDates', JSON.stringify(busyDates));

        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.unshift({ id: Date.now(), title: 'Onaylandı!', message: `${car.brand} ${car.model} rezerve edildi. Yolculuk öncesi 'Teslim Alma' sürecini başlatmayı unutmayın.`, time: 'Az önce', read: false, type: 'success' });
        localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 15)));
        window.dispatchEvent(new Event('newNotification'));

        setIsProcessing(false);
        setShowSuccessModal(true);
        setTimeout(() => navigate('/profile'), 3000);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-40 md:pb-12">
      <Navbar />
      
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center max-w-md text-center">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-8 text-green-600"><CheckCircle size={56} strokeWidth={3} /></div>
                <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-3 uppercase tracking-tighter">İşlem Tamam!</h2>
                <p className="text-gray-500 font-bold mb-8 leading-relaxed">Rezervasyon detayları profilinize eklendi. İyi yolculuklar!</p>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden relative"><div className="bg-green-500 h-full w-full absolute left-0 top-0 origin-left animate-[progress_3s_linear]"></div></div>
            </div>
        </div>
      )}
      
      <CustomCalendar isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} startDate={pickupDate} endDate={returnDate} onChange={(s, e) => { setPickupDate(s); setReturnDate(e); }} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <button onClick={() => navigate(-1)} className="mb-8 flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors font-black text-xs uppercase tracking-widest"><ArrowLeft size={16} /> Geri Dön</button>
        
        {!userVerified && (
           <div className="bg-red-50 dark:bg-red-900/20 p-6 rounded-[2rem] border border-red-100 dark:border-red-900/30 mb-8 flex items-center gap-4 animate-pulse">
              <AlertTriangle size={32} className="text-red-600 shrink-0" />
              <div>
                  <h4 className="font-black text-red-600 uppercase text-sm tracking-widest">HESAP DOĞRULANMADI</h4>
                  <p className="text-xs font-bold text-red-800 dark:text-red-300 mt-1 uppercase tracking-tight">KİRALAMA YAPABİLMEK İÇİN PROFİLİNİZDEN EHLİYET VE KİMLİK DOĞRULAMASINI TAMAMLAMALISINIZ.</p>
              </div>
              <button onClick={() => navigate('/profile')} className="ml-auto bg-red-600 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg">ŞİMDİ DOĞRULA</button>
           </div>
        )}

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-2/5">
             <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-xl border dark:border-gray-800 overflow-hidden sticky top-24">
                <ImageCarousel images={car.images || [car.image]} aspectRatio="aspect-[4/5]" />
                <div className="p-8">
                   <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">{car.brand} {car.model}</h2>
                   <div className="flex gap-2 text-gray-500 text-[10px] font-black uppercase mb-8">
                      <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl">{car.year}</span>
                      <span className="bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-xl">{car.transmission}</span>
                   </div>
                   <div className="space-y-4 border-t dark:border-gray-800 pt-8">
                      <div className="cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-800/50 p-5 rounded-[2rem] transition-all border-2 border-transparent hover:border-primary-100" onClick={() => setIsCalendarOpen(true)}>
                          <div className="flex items-center gap-5">
                             <div className="p-4 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-2xl shadow-sm"><CalendarIcon size={24} /></div>
                             <div>
                                <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest block mb-1">TARİHLER</label>
                                <div className="font-black text-lg text-gray-900 dark:text-white uppercase tracking-tight">
                                   {new Date(pickupDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                   {' - '}
                                   {new Date(returnDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                </div>
                             </div>
                          </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:w-3/5 space-y-8">
             <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-sm border dark:border-gray-800">
                <h3 className="font-black text-xl mb-8 uppercase tracking-widest text-gray-900 dark:text-white">ÖDEME DETAYLARI</h3>
                <div className="space-y-5">
                   <div className="flex justify-between text-gray-500 font-bold uppercase text-xs tracking-widest">
                      <span>{days} GÜNLÜK KİRALAMA</span>
                      <span className="font-black text-gray-900 dark:text-white">₺{total}</span>
                   </div>
                   <div className="flex justify-between text-gray-500 font-bold uppercase text-xs tracking-widest">
                      <span>GÜVENCE PAKETİ</span>
                      <span className="font-black text-gray-900 dark:text-white">₺{insurance}</span>
                   </div>
                   <div className="flex justify-between items-center pt-8 border-t dark:border-gray-800">
                      <span className="text-gray-900 dark:text-white font-black text-xl uppercase tracking-widest">TOPLAM</span>
                      <span className="text-4xl font-black text-primary-600">₺{grandTotal}</span>
                   </div>
                </div>
             </div>

             <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-sm border dark:border-gray-800">
                <h3 className="font-black text-xl mb-8 flex items-center gap-3 text-gray-900 dark:text-white uppercase tracking-widest"><CreditCard className="text-primary-600" /> KART BİLGİLERİ</h3>
                <form onSubmit={handlePayment} className="space-y-6">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">AD SOYAD</label>
                         <input required type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-black uppercase tracking-widest text-sm focus:ring-2 focus:ring-primary-500/10 outline-none" placeholder="KART ÜZERİNDEKİ İSİM" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">KART NUMARASI</label>
                         <input required type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-mono tracking-widest text-sm focus:ring-2 focus:ring-primary-500/10 outline-none" placeholder="0000 0000 0000 0000" />
                      </div>
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">SON KULLANMA</label>
                         <input required type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-black focus:ring-2 focus:ring-primary-500/10 outline-none" placeholder="AA/YY" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">CVV</label>
                         <input required type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-800 border-none rounded-2xl font-black focus:ring-2 focus:ring-primary-500/10 outline-none" placeholder="123" />
                      </div>
                   </div>
                   <div className="bg-green-50 dark:bg-green-900/10 p-5 rounded-2xl flex items-center gap-3 text-green-700 dark:text-green-400 text-[10px] font-black uppercase tracking-widest border border-green-100">
                      <Shield size={20} />
                      <span>Güvenli 256-bit SSL ödeme altyapısı aktiftir.</span>
                   </div>
                   <button type="submit" disabled={isProcessing} className="w-full bg-primary-600 disabled:bg-gray-300 text-white py-5 rounded-2xl font-black text-xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-3 active:scale-95 uppercase tracking-widest">
                     {isProcessing ? <><Loader2 className="animate-spin" /> İşleniyor...</> : `Ödemeyi Tamamla (₺${grandTotal})`}
                   </button>
                </form>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
