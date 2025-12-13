import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Shield, CheckCircle, CreditCard, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { Car } from '../types';
import CustomCalendar from '../components/CustomCalendar';

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const car = state?.car as Car;
  
  // Use local state to allow editing
  const [pickupDate, setPickupDate] = useState(state?.pickupDate || new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(state?.returnDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]);
  
  // Custom Calendar State
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  // Payment Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  if (!car) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300">
        Araç bilgisi bulunamadı. Lütfen tekrar arama yapınız.
        <button onClick={() => navigate('/search')} className="ml-4 text-primary-600 hover:underline">Aramaya Dön</button>
      </div>
    );
  }

  // Calculate days and total dynamically based on local state
  const start = new Date(pickupDate);
  const end = new Date(returnDate);
  // Ensure at least 1 day, handle invalid dates gracefully
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
  const days = diffDays > 0 ? diffDays : 1;
  
  // Robust Price Check
  const pricePerDay = Number(car.pricePerDay) || Number((car as any).price) || 0;

  const total = days * pricePerDay;
  const insurance = days * 150; // 150 TL per day insurance
  const grandTotal = total + insurance;

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate API call
    setTimeout(() => {
        setIsProcessing(false);
        setShowSuccessModal(true);
        
        // Redirect after showing success message
        setTimeout(() => {
            navigate('/profile');
        }, 2500);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300 pb-40 md:pb-0 relative">
      <Navbar />
      
      {/* Success Modal Overlay */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center animate-in zoom-in-95">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400">
                    <CheckCircle size={48} strokeWidth={3} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Ödeme Başarılı!</h2>
                <p className="text-gray-500 dark:text-gray-400 mb-6">Rezervasyonunuz oluşturuldu. Araç sahibinin onayı bekleniyor.</p>
                <div className="w-full bg-gray-100 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-green-500 h-full animate-[progress_2s_ease-in-out_forwards]" style={{width: '0%'}}></div>
                </div>
                <p className="text-xs text-gray-400 mt-2">Profilinize yönlendiriliyorsunuz...</p>
            </div>
            <style>{`
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
            `}</style>
        </div>
      )}
      
      {/* Integrated Custom Calendar */}
      <CustomCalendar 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)}
        startDate={pickupDate}
        endDate={returnDate}
        onChange={(start, end) => {
          setPickupDate(start);
          setReturnDate(end);
        }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Rezervasyon ve Ödeme</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Car Summary */}
          <div className="lg:w-1/3">
             <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700 border border-gray-100 overflow-hidden sticky top-24">
                <img src={car.image} alt={car.name} className="w-full h-48 object-cover" />
                <div className="p-6">
                   <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{car.brand} {car.model}</h2>
                   <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{car.year} • {car.transmission} • {car.fuelType}</p>
                   
                   <div className="space-y-4 border-t dark:border-gray-700 pt-4">
                      {/* Unified Date Trigger */}
                      <div 
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 p-2 rounded-lg transition-colors"
                        onClick={() => setIsCalendarOpen(true)}
                      >
                          <div className="flex items-start gap-3">
                             <CalendarIcon className="text-primary-600 mt-1" size={20} />
                             <div className="w-full">
                                <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Kiralama Tarihleri</label>
                                <div className="font-medium text-gray-900 dark:text-white">
                                   {new Date(pickupDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                   {' - '}
                                   {new Date(returnDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                                </div>
                             </div>
                          </div>
                          <div className="mt-2 text-xs text-primary-600 text-center font-medium">Değiştirmek için tıklayın</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* Payment Details */}
          <div className="lg:w-2/3 space-y-6">
             {/* Price Breakdown */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700 border border-gray-100">
                <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Ödeme Detayı</h3>
                <div className="space-y-3">
                   <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>{days} gün x ₺{pricePerDay}</span>
                      <span>₺{total}</span>
                   </div>
                   <div className="flex justify-between text-gray-600 dark:text-gray-300">
                      <span>Tam Koruma Sigortası ({days} gün)</span>
                      <span>₺{insurance}</span>
                   </div>
                   <div className="flex justify-between items-center pt-4 border-t dark:border-gray-700 font-bold text-xl text-gray-900 dark:text-white">
                      <span>Toplam</span>
                      <span>₺{grandTotal}</span>
                   </div>
                </div>
             </div>

             {/* Mock Card Form */}
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700 border border-gray-100">
                <h3 className="font-bold text-lg mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                   <CreditCard className="text-primary-600" /> Kredi Kartı Bilgileri
                </h3>
                
                <form onSubmit={handlePayment} className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kart Üzerindeki İsim</label>
                      <input required type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white" placeholder="Ad Soyad" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kart Numarası</label>
                      <input required type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white" placeholder="0000 0000 0000 0000" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Son Kullanma Tarihi</label>
                         <input required type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white" placeholder="AA/YY" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                         <input required type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white" placeholder="123" />
                      </div>
                   </div>

                   <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-sm">
                      <Shield size={18} />
                      <span>Ödemeniz 256-bit SSL sertifikası ile korunmaktadır.</span>
                   </div>

                   <button 
                     type="submit"
                     disabled={isProcessing}
                     className="w-full bg-primary-600 disabled:bg-primary-400 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-none border border-white/30 mt-6 flex items-center justify-center gap-2"
                   >
                     {isProcessing ? (
                         <>
                            <Loader2 className="animate-spin" /> İşleniyor...
                         </>
                     ) : `Ödemeyi Tamamla (₺${grandTotal})`}
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