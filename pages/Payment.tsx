import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Shield, CheckCircle, CreditCard, Calendar } from 'lucide-react';
import { Car } from '../types';

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const car = state?.car as Car;
  
  // Use local state to allow editing
  const [pickupDate, setPickupDate] = useState(state?.pickupDate || new Date().toISOString().split('T')[0]);
  const [returnDate, setReturnDate] = useState(state?.returnDate || new Date(Date.now() + 86400000).toISOString().split('T')[0]);

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
  
  const total = days * car.pricePerDay;
  const insurance = days * 150; // 150 TL per day insurance
  const grandTotal = total + insurance;

  const handlePayment = () => {
    alert("Ödeme başarıyla alındı! Rezervasyonunuz oluşturuldu.");
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">
      <Navbar />
      
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
                      <div className="flex items-start gap-3">
                         <Calendar className="text-primary-600 mt-1" size={20} />
                         <div className="w-full">
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">Alış Tarihi</label>
                            <input 
                              type="date"
                              value={pickupDate}
                              onChange={(e) => setPickupDate(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500"
                            />
                         </div>
                      </div>
                      <div className="flex items-start gap-3">
                         <Calendar className="text-primary-600 mt-1" size={20} />
                         <div className="w-full">
                            <label className="text-xs text-gray-500 dark:text-gray-400 block mb-1">İade Tarihi</label>
                            <input 
                              type="date"
                              value={returnDate}
                              min={pickupDate}
                              onChange={(e) => setReturnDate(e.target.value)}
                              className="w-full bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg px-2 py-1.5 text-sm font-medium text-gray-900 dark:text-white outline-none focus:ring-1 focus:ring-primary-500"
                            />
                         </div>
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
                      <span>{days} gün x ₺{car.pricePerDay}</span>
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
                
                <form className="space-y-4">
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kart Üzerindeki İsim</label>
                      <input type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white" placeholder="Ad Soyad" />
                   </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Kart Numarası</label>
                      <input type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white" placeholder="0000 0000 0000 0000" />
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Son Kullanma Tarihi</label>
                         <input type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white" placeholder="AA/YY" />
                      </div>
                      <div>
                         <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">CVV</label>
                         <input type="text" className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white" placeholder="123" />
                      </div>
                   </div>
                </form>

                <div className="mt-6 flex items-center gap-2 text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl text-sm">
                   <Shield size={18} />
                   <span>Ödemeniz 256-bit SSL sertifikası ile korunmaktadır.</span>
                </div>

                <button 
                  onClick={handlePayment}
                  className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-none border border-white/30 mt-6"
                >
                  Ödemeyi Tamamla (₺{grandTotal})
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;