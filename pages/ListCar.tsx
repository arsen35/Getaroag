import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Car, Fuel, Settings, CheckCircle, Navigation, Upload, DollarSign, Camera } from 'lucide-react';
import { CAR_BRANDS } from '../data/cars';
import { checkAuthStatus } from '../services/firebase';

const PRIORITY_CITIES = ["İstanbul", "Ankara", "İzmir", "Antalya"];
const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
].sort();

// Mock coordinates for demo purposes
const CITY_COORDINATES: Record<string, {lat: number, lng: number}> = {
  "İstanbul": { lat: 41.0082, lng: 28.9784 },
  "Ankara": { lat: 39.9334, lng: 32.8597 },
  "İzmir": { lat: 38.4192, lng: 27.1287 },
  "Antalya": { lat: 36.8969, lng: 30.7133 },
  "Bursa": { lat: 40.1885, lng: 29.0610 },
  "Adana": { lat: 37.0000, lng: 35.3213 },
};

const ListCarPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    city: '',
    brand: '',
    model: '',
    year: '',
    fuelType: '',
    transmission: '',
    mileage: '',
    pricePerDay: '',
    image: null as File | null,
    imagePreview: ''
  });

  // Auth Check
  useEffect(() => {
    if (!checkAuthStatus()) {
      alert("Araç listelemek için lütfen önce giriş yapınız veya üye olunuz.");
      navigate('/login');
    }
  }, [navigate]);

  const fuelTypes = ['Benzin', 'Dizel', 'Elektrik', 'Hibrit', 'LPG'];
  const transmissions = ['Manuel', 'Otomatik', 'Yarı Otomatik'];

  const availableModels = formData.brand ? (CAR_BRANDS as any)[formData.brand] || [] : [];

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=tr`);
          const data = await response.json();
          
          if (data && data.address) {
            const city = data.address.province || data.address.city || data.address.town || data.address.state;
            if (city) {
              setFormData(prev => ({ ...prev, city: city }));
            } else {
               setFormData(prev => ({ ...prev, city: 'Mevcut Konum (GPS)' }));
            }
          }
        } catch (error) {
          console.error("Adres çözümlenemedi:", error);
          setFormData(prev => ({ ...prev, city: 'Mevcut Konum (GPS)' }));
        }
      },
      (error) => {
        console.error("GPS Hatası:", error);
        if (error.code === error.PERMISSION_DENIED) {
           alert("Konum izni reddedildi. Şehri manuel seçmelisiniz.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData({
        ...formData,
        image: file,
        imagePreview: URL.createObjectURL(file)
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Determine coordinates based on city or default to Turkey center
    const coords = CITY_COORDINATES[formData.city] || { 
        lat: 39.0 + (Math.random() * 2), 
        lng: 35.0 + (Math.random() * 2) 
    };

    // Add random jitter so multiple cars don't overlap exactly
    const finalLocation = {
        city: formData.city,
        lat: coords.lat + (Math.random() * 0.05 - 0.025),
        lng: coords.lng + (Math.random() * 0.05 - 0.025)
    };

    // Parse Price Safely
    const rawPrice = parseInt(formData.pricePerDay);
    const safePrice = isNaN(rawPrice) ? 0 : rawPrice;

    // Create new car object conforming to BOTH Profile (simplified) and Search (detailed) requirements
    const newCar = {
      id: Date.now(), // Unique numeric ID
      name: `${formData.brand} ${formData.model}`,
      brand: formData.brand,
      model: formData.model,
      year: parseInt(formData.year),
      price: safePrice, // Used by Profile
      pricePerDay: safePrice, // Used by Search and Payment
      pricePerHour: Math.round(safePrice / 24), // Approx
      earnings: 0,
      status: 'Active', // Auto-activate for demo
      image: formData.imagePreview || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      location: finalLocation,
      transmission: formData.transmission,
      fuelType: formData.fuelType,
      type: 'Sedan', // Default
      rating: 5.0,
      reviews: 0,
      distance: '0km',
      features: ['Yeni İlan']
    };

    // Get existing cars
    const existingCarsJson = localStorage.getItem('myCars');
    let existingCars = [];
    try {
        existingCars = existingCarsJson ? JSON.parse(existingCarsJson) : [];
    } catch(err) {
        existingCars = [];
    }

    const updatedCars = [...existingCars, newCar];
    localStorage.setItem('myCars', JSON.stringify(updatedCars));

    // Force an event to notify other components
    window.dispatchEvent(new Event('storage'));

    alert("Aracınız başarıyla listelendi! Profilinizde ve arama sonuçlarında görebilirsiniz.");
    navigate('/profile');
  };

  const inputClassName = "w-full p-4 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 placeholder-gray-500 shadow-sm";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300 pb-24 md:pb-0">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-xl dark:shadow-none dark:border dark:border-gray-700 overflow-hidden border border-gray-100">
          <div className="bg-gray-100 dark:bg-gray-700 h-2 w-full">
            <div 
              className="bg-primary-600 h-full transition-all duration-500"
              style={{ width: `${(step / 4) * 100}%` }}
            ></div>
          </div>

          <div className="p-8 md:p-12">
            <div className="mb-8">
               <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Getaroag'da Aracını Listele</h1>
               <p className="text-gray-500 dark:text-gray-400">Aracını paylaşarak gelir elde et. Adım {step}/4</p>
            </div>

            <form onSubmit={handleSubmit}>
              {/* Step 1: Location & Brand */}
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-10 fade-in">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Şehir</label>
                       <button type="button" onClick={handleCurrentLocation} className="text-primary-600 dark:text-primary-400 text-sm flex items-center hover:underline">
                          <Navigation size={14} className="mr-1" /> Konumumu Bul (GPS)
                       </button>
                    </div>
                    <select 
                      className={inputClassName}
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    >
                      <option value="">Şehir Seçiniz</option>
                      {formData.city && !TURKEY_CITIES.includes(formData.city) && !PRIORITY_CITIES.includes(formData.city) && (
                        <option value={formData.city}>{formData.city}</option>
                      )}
                      <optgroup label="Popüler Şehirler">
                        {PRIORITY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                      <optgroup label="Tüm Şehirler">
                        {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </optgroup>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Marka</label>
                      <select 
                        className={inputClassName}
                        value={formData.brand}
                        onChange={(e) => setFormData({...formData, brand: e.target.value, model: ''})}
                      >
                        <option value="">Marka Seçiniz</option>
                        {Object.keys(CAR_BRANDS).sort().map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Yıl</label>
                      <select 
                        className={inputClassName}
                        value={formData.year}
                        onChange={(e) => setFormData({...formData, year: e.target.value})}
                      >
                        <option value="">Yıl</option>
                        {Array.from({length: 20}, (_, i) => 2024 - i).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {formData.brand && (
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Model</label>
                      {availableModels.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-1 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
                          {availableModels.map((m: string) => (
                             <label key={m} className={`
                                cursor-pointer px-4 py-3 rounded-lg border text-center text-sm font-medium transition-all m-1
                                ${formData.model === m 
                                  ? 'border-primary-600 bg-white text-primary-700 ring-2 ring-primary-500' 
                                  : 'border-transparent bg-white/50 hover:bg-white text-gray-600'}
                             `}>
                               <input 
                                 type="radio" 
                                 name="model" 
                                 value={m} 
                                 checked={formData.model === m}
                                 className="hidden" 
                                 onChange={(e) => setFormData({...formData, model: e.target.value})}
                               />
                               {m}
                             </label>
                          ))}
                        </div>
                      ) : (
                        <input 
                          type="text" 
                          placeholder="Model giriniz"
                          className={inputClassName}
                          value={formData.model}
                          onChange={(e) => setFormData({...formData, model: e.target.value})}
                        />
                      )}
                    </div>
                  )}

                  <button 
                    type="button" 
                    disabled={!formData.brand || !formData.model || !formData.city}
                    onClick={() => setStep(2)}
                    className="w-full bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold mt-6 hover:bg-primary-700 transition-colors shadow-none border border-white/30"
                  >
                    Devam Et
                  </button>
                </div>
              )}

              {/* Step 2: Specs (Fuel/Gear) */}
              {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-10 fade-in">
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                      <Fuel size={18} className="mr-2 text-primary-600"/> Yakıt Tipi
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {fuelTypes.map((fuel) => (
                        <label key={fuel} className={`
                          cursor-pointer relative p-4 rounded-xl border-2 text-center transition-all bg-white
                          ${formData.fuelType === fuel 
                            ? 'border-primary-600 text-primary-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'}
                        `}>
                          <input 
                            type="radio" 
                            name="fuel" 
                            value={fuel} 
                            checked={formData.fuelType === fuel}
                            className="hidden"
                            onChange={(e) => setFormData({...formData, fuelType: e.target.value})} 
                          />
                          <span className="font-medium">{fuel}</span>
                          {formData.fuelType === fuel && (
                            <CheckCircle size={16} className="absolute top-2 right-2 text-primary-600" />
                          )}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                      <Settings size={18} className="mr-2 text-primary-600"/> Vites Tipi
                    </label>
                    <div className="flex gap-4">
                      {transmissions.map((type) => (
                        <label key={type} className={`
                          flex-1 cursor-pointer relative p-4 rounded-xl border-2 text-center transition-all bg-white
                          ${formData.transmission === type
                            ? 'border-primary-600 text-primary-700' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'}
                        `}>
                          <input 
                            type="radio" 
                            name="transmission" 
                            value={type} 
                            checked={formData.transmission === type}
                            className="hidden"
                            onChange={(e) => setFormData({...formData, transmission: e.target.value})} 
                          />
                          <span className="font-medium">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                   <div className="flex gap-4 mt-8">
                    <button 
                      type="button" 
                      onClick={() => setStep(1)} 
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Geri
                    </button>
                    <button 
                      type="button" 
                      disabled={!formData.fuelType || !formData.transmission} 
                      onClick={() => setStep(3)} 
                      className="flex-[2] bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-none border border-white/30"
                    >
                      Devam Et
                    </button>
                  </div>
                </div>
              )}

               {/* Step 3: Photo & Price */}
               {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-10 fade-in">
                  
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                      <Camera size={18} className="mr-2 text-primary-600"/> Araç Fotoğrafı
                    </label>
                    
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`
                        border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all bg-white
                        ${formData.imagePreview ? 'border-primary-500' : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'}
                      `}
                    >
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      
                      {formData.imagePreview ? (
                        <div className="relative">
                          <img src={formData.imagePreview} alt="Preview" className="w-full h-64 object-cover rounded-lg" />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <span className="text-white font-medium flex items-center"><Upload size={16} className="mr-2"/> Değiştir</span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6">
                           <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-4 text-primary-600">
                             <Upload size={32} />
                           </div>
                           <p className="text-gray-900 font-medium">Fotoğraf Yüklemek için Tıkla</p>
                           <p className="text-gray-500 text-sm mt-1">veya sürükleyip bırak</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Price Input */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                      <DollarSign size={18} className="mr-2 text-primary-600"/> Günlük Kiralama Ücreti
                    </label>
                    <div className="relative">
                       <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-lg">₺</span>
                       <input 
                        type="number" 
                        placeholder="Örn: 1500"
                        className={`${inputClassName} pl-10 text-lg font-bold`}
                        value={formData.pricePerDay}
                        onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})}
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">/ gün</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 ml-1">Önerilen fiyat: ₺1200 - ₺2000 arası</p>
                  </div>

                   <div className="flex gap-4 mt-8">
                    <button 
                      type="button" 
                      onClick={() => setStep(2)}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Geri
                    </button>
                    <button 
                      type="button" 
                      disabled={!formData.pricePerDay || !formData.imagePreview}
                      onClick={() => setStep(4)}
                      className="flex-[2] bg-primary-600 disabled:bg-gray-300 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-none border border-white/30"
                    >
                      Devam Et
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Confirmation */}
              {step === 4 && (
                <div className="text-center animate-in slide-in-from-right-10 fade-in">
                  <div className="bg-green-100 dark:bg-green-900/30 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Car size={40} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Harika Seçim!</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-8">
                    <strong>{formData.year} {formData.brand} {formData.model}</strong> ({formData.transmission}) aracınızı {formData.city} konumunda listelemek üzeresiniz.
                  </p>
                  
                  {formData.imagePreview && (
                    <img src={formData.imagePreview} alt="Car" className="w-full h-48 object-cover rounded-xl mb-6 shadow-md" />
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-8 text-left border border-blue-100 dark:border-blue-900">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm text-blue-800 dark:text-blue-300 font-medium">💰 Tahmini Haftalık Kazanç</p>
                      <span className="text-xs bg-blue-200 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">%15 komisyon düşülür</span>
                    </div>
                    {/* Calculate estimated earnings based on input price */}
                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                      ₺{(parseInt(formData.pricePerDay || '0') * 3 * 0.85).toFixed(0)} - ₺{(parseInt(formData.pricePerDay || '0') * 5 * 0.85).toFixed(0)}
                    </p>
                  </div>

                  <div className="flex gap-4">
                     <button 
                      type="button" 
                      onClick={() => setStep(3)}
                      className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    >
                      Geri
                    </button>
                    <button 
                      type="submit" 
                      className="flex-[2] bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-none border border-white/30"
                    >
                      İlanı Yayınla
                    </button>
                  </div>
                </div>
              )}

            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListCarPage;