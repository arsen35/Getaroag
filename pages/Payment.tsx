
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ImageCarousel from '../components/ImageCarousel';
import { Shield, CheckCircle, CreditCard, Calendar as CalendarIcon, Loader2, ArrowLeft } from 'lucide-react';
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

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="text-center">
            <p className="text-gray-500 mb-4">Araç bilgisi bulunamadı.</p>
            <button onClick={() => navigate('/search')} className="bg-primary-600 text-white px-6 py-2 rounded-xl font-bold">Aramaya Dön</button>
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
            location: car.location.city
        };

        // 1. Yolculuklarım'a ekle
        const existingTrips = JSON.parse(localStorage.getItem('myTrips') || '[]');
        localStorage.setItem('myTrips', JSON.stringify([newTrip, ...existingTrips]));

        // 2. Aracın meşguliyet takvimini güncelle
        const busyDates = JSON.parse(localStorage.getItem('busyDates') || '{}');
        if (!busyDates[car.id]) busyDates[car.id] = [];
        const prepareDate = new Date(returnDate);
        prepareDate.setDate(prepareDate.getDate() + 1);
        const prepareDateStr = prepareDate.toISOString().split('T')[0];

        busyDates[car.id].push({ start: pickupDate, end: returnDate, readyAfter: prepareDateStr });
        localStorage.setItem('busyDates', JSON.stringify(busyDates));

        // 3. BİLDİRİM EKLE (Yeni)
        const notifications = JSON.parse(localStorage.getItem('notifications') || '[]');
        notifications.unshift({
          id: Date.now(),
          title: 'Rezervasyon Onaylandı!',
          message: `${car.brand} ${car.model} aracın ${new Date(pickupDate).toLocaleDateString('tr-TR')} tarihinde seni bekliyor. Keyifli sürüşler!`,
          time: 'Az önce',
          read: false,
          type: 'success'
        });
        localStorage.setItem('notifications', JSON.stringify(notifications.slice(0, 15)));
        window.dispatchEvent(new Event('newNotification'));

        setIsProcessing(false);
        setShowSuccessModal(true);
        setTimeout(() => navigate('/profile'), 3000);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 pb-40 md:pb-12">
      <Navbar />
      
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 p-10 rounded-[2.5rem] shadow-2xl flex flex-col items-center max-w-sm text-center animate-in zoom-in-95">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-8 text-green-600">
                    <CheckCircle size={56} strokeWidth={3} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">İşlem Tamam!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">Ödemeniz başarıyla alındı. Rezervasyon detayları profilinize eklendi.</p>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden relative">
                    <div className="bg-green-500 h-full w-full absolute left-0 top-0 origin-left animate-[progress_3s_linear]"></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest font-bold">Profilinize Aktarılıyorsunuz</p>
            </div>
        </div>
      )}
      
      <CustomCalendar isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} startDate={pickupDate} endDate={returnDate} onChange={(s, e) => { setPickupDate(s); setReturnDate(e); }} />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <button onClick={() => navigate(-1)} className="mb-6 flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors font-medium">
            <ArrowLeft size={20} /> Geri Dön
        </button>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-10 tracking-tight">Rezervasyon Detayları</h1>
        
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="lg:w-2/5">
             <div className="bg-white dark:bg-gray-800 rounded-[2rem] shadow-xl dark:shadow-none dark:border dark:border-gray-700 overflow-hidden sticky top-24">
                <ImageCarousel images={car.images || [car.image]} aspectRatio="aspect-[4/5]" />
                <div className="p-8">
                   <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{car.brand} {car.model}</h2>
                   <div className="flex gap-2 text-gray-500 dark:text-gray-400 text-sm mb-6">
                      <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{car.year}</span>
                      <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{car.transmission}</span>
                      <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{car.fuelType}</span>
                   </div>
                   
                   <div className="space-y-4 border-t dark:border-gray-700 pt-6">
                      <div className="cursor-pointer hover:bg-primary-50 dark:hover:bg-gray-700/50 p-4 rounded-2xl transition-all border border-transparent hover:border-primary-100" onClick={() => setIsCalendarOpen(true)}>
                          <div className="flex items-start gap-4">
                             <div className="p-3 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-xl"><CalendarIcon size={24} /></div>
                             <div>
                                <label className="text-xs text-gray-400 font-bold uppercase tracking-wider block mb-1">Kiralama Tarihleri</label>
                                <div className="font-bold text-lg text-gray-900 dark:text-white">
                                   {new Date(pickupDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                   {' - '}
                                   {new Date(returnDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                </div>
                                <span className="text-xs text-primary-600 font-bold">Değiştirmek için dokun</span>
                             </div>
                          </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="lg:w-3/5 space-y-8">
             <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border dark:border-gray-700 border-gray-100">
                <h3 className="font-bold text-xl mb-6 text-gray-900 dark:text-white">Fiyat Dökümü</h3>
                <div className="space-y-4">
                   <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>{days} Günlük Kiralama</span>
                      <span className="font-bold text-gray-900 dark:text-white">₺{total}</span>
                   </div>
                   <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Güvence Paketi (Zorunlu)</span>
                      <span className="font-bold text-gray-900 dark:text-white">₺{insurance}</span>
                   </div>
                   <div className="flex justify-between items-center pt-6 border-t dark:border-gray-700 font-black text-3xl text-primary-600">
                      <span className="text-gray-900 dark:text-white text-xl">Toplam</span>
                      <span>₺{grandTotal}</span>
                   </div>
                </div>
             </div>

             <div className="bg-white dark:bg-gray-800 p-8 rounded-[2rem] shadow-sm border dark:border-gray-700 border-gray-100">
                <h3 className="font-bold text-xl mb-8 flex items-center gap-3 text-gray-900 dark:text-white">
                   <CreditCard className="text-primary-600" /> Kredi Kartı Bilgileri
                </h3>
                
                <form onSubmit={handlePayment} className="space-y-6">
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kart Üzerindeki İsim</label>
                      <input required type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-medium" placeholder="Ad Soyad" />
                   </div>
                   <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kart Numarası</label>
                      <input required type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-mono tracking-widest" placeholder="0000 0000 0000 0000" />
                   </div>
                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Son Kullanma</label>
                         <input required type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white" placeholder="AA/YY" />
                      </div>
                      <div className="space-y-2">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">CVV</label>
                         <input required type="text" className="w-full p-4 bg-gray-50 dark:bg-gray-700 border-none rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white" placeholder="123" />
                      </div>
                   </div>

                   <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl flex items-center gap-3 text-green-700 dark:text-green-400 text-sm font-medium border border-green-100 dark:border-green-900/20">
                      <Shield size={20} />
                      <span>Güvenli 256-bit SSL ödeme altyapısı aktiftir.</span>
                   </div>

                   <button 
                     type="submit"
                     disabled={isProcessing}
                     className="w-full bg-primary-600 disabled:bg-primary-400 text-white py-5 rounded-2xl font-black text-xl hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/30 flex items-center justify-center gap-3 active:scale-[0.98]"
                   >
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
