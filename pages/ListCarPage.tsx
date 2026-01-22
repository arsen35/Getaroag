
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Fuel, Settings, CheckCircle, Navigation, Upload, DollarSign, Camera, MapPin, X, Plus, Search, Map as MapIcon, Check, AlertCircle, Move, ChevronRight } from 'lucide-react';
import { CAR_BRANDS } from '../data/cars';
// Added dbService to imports
import { checkAuthStatus, dbService } from '../services/firebase';

declare const L: any; // Leaflet Global

const PRIORITY_CITIES = ["İstanbul", "Ankara", "İzmir", "Antalya"];
const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Aksaray", "Amasya", "Ankara", "Antalya", "Ardahan", "Artvin", "Aydın", "Balıkesir", "Bartın", "Batman", "Bayburt", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Düzce", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Iğdır", "Isparta", "İstanbul", "İzmir", "Kahramanmaraş", "Karabük", "Karaman", "Kars", "Kastamonu", "Kayseri", "Kilis", "Kırıkkale", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Mardin", "Mersin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Osmaniye", "Rize", "Sakarya", "Samsun", "Şanlıurfa", "Siirt", "Sinop", "Şırnak", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Uşak", "Van", "Yalova", "Yozgat", "Zonguldak"
].sort();

const ListCarPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [isLocating, setIsLocating] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    city: '',
    district: '',
    exactLat: 39.9334 as number | null,
    exactLng: 32.8597 as number | null,
    brand: '',
    model: '',
    year: '',
    fuelType: '',
    transmission: '',
    pricePerDay: '',
    images: [] as string[]
  });

  useEffect(() => {
    if (!checkAuthStatus()) {
      alert("Lütfen giriş yapınız.");
      navigate('/login');
    }
  }, [navigate]);

  // Leaflet Map Initialization
  useEffect(() => {
    if (step === 1 && mapContainerRef.current && !mapRef.current) {
        mapRef.current = L.map(mapContainerRef.current, {
            zoomControl: false,
            attributionControl: false
        }).setView([39.0, 35.0], 6);

        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            maxZoom: 19
        }).addTo(mapRef.current);

        // Click on map to set location
        mapRef.current.on('click', (e: any) => {
            const { lat, lng } = e.latlng;
            updateMarker(lat, lng);
            setLocationVerified(true);
        });
    }
  }, [step]);

  const updateMarker = (lat: number, lng: number) => {
    if (!mapRef.current) return;
    
    setFormData(prev => ({ ...prev, exactLat: lat, exactLng: lng }));

    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      const customIcon = L.divIcon({
          className: 'custom-div-icon',
          html: `<div class="w-8 h-8 bg-primary-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center text-white"><div class="w-2 h-2 bg-white rounded-full"></div></div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16]
      });
      markerRef.current = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(mapRef.current);
      
      markerRef.current.on('dragend', (e: any) => {
          const pos = e.target.getLatLng();
          setFormData(prev => ({ ...prev, exactLat: pos.lat, exactLng: pos.lng }));
          setLocationVerified(true);
      });
    }
    
    mapRef.current.flyTo([lat, lng], 16);
  };

  const verifyLocation = async () => {
    if (!formData.city) return alert("Lütfen en azından bir Şehir seçiniz.");
    setIsLocating(true);
    
    const query = formData.district ? `${formData.district}, ${formData.city}, Turkey` : `${formData.city}, Turkey`;
    
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const data = await response.json();
        
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            updateMarker(parseFloat(lat), parseFloat(lon));
            setLocationVerified(true);
        } else {
            alert("Girdiğiniz adres bulunamadı. Lütfen haritadan manuel seçin.");
        }
    } catch (e) {
        alert("Konum servisine şu an ulaşılamıyor.");
    } finally {
        setIsLocating(false);
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return alert("GPS desteklenmiyor.");
    setIsLocating(true);
    
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      
      try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=tr`);
          const data = await response.json();
          if (data && data.address) {
              const city = data.address.province || data.address.city || data.address.state || '';
              const district = data.address.suburb || data.address.district || data.address.town || '';
              
              setFormData(prev => ({ 
                  ...prev, 
                  city: city,
                  district: district,
                  exactLat: latitude, 
                  exactLng: longitude 
              }));
          }
      } catch (e) {
          console.error("Reverse geocoding error", e);
      }

      setLocationVerified(true);
      updateMarker(latitude, longitude);
      setIsLocating(false);
    }, (err) => {
      setIsLocating(false);
      alert("GPS çekmiyor. Lütfen şehri manuel seçin.");
    }, { enableHighAccuracy: true });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData(prev => ({ ...prev, images: [...prev.images, reader.result as string].slice(0, 5) }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationVerified) return alert("Lütfen haritadan konumu kesinleştirin.");
    
    const newCar = {
      id: Date.now(),
      name: `${formData.brand} ${formData.model}`,
      brand: formData.brand,
      model: formData.model,
      year: Number(formData.year),
      pricePerDay: Number(formData.pricePerDay),
      status: 'Active', 
      image: formData.images[0] || 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      images: formData.images,
      location: { 
        city: formData.city, 
        district: formData.district, 
        lat: formData.exactLat, 
        lng: formData.exactLng 
      },
      transmission: formData.transmission,
      fuelType: formData.fuelType,
      rating: 5.0,
      reviews: 0,
      features: ['Yeni İlan']
    };
    
    const stored = localStorage.getItem('myCars');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('myCars', JSON.stringify([...existing, newCar]));
    
    // Using dbService from imports
    dbService.addNotification({
        id: Date.now(),
        title: 'İlan Başarıyla Yayınlandı',
        message: `${newCar.brand} ${newCar.model} aracınız artık kiraya hazır.`,
        time: 'Az önce',
        read: false,
        type: 'success'
    });

    window.dispatchEvent(new Event('storage'));
    alert("Tebrikler! Aracınız başarıyla listelendi.");
    navigate('/profile?tab=cars');
  };

  const inputClassName = "w-full p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-[5px] focus:ring-1 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-bold transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 font-sans pb-24 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-[5px] border border-gray-100 dark:border-gray-800 overflow-hidden text-left">
          <div className="p-8 md:p-12 text-left">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Aracını Listele</h1>
                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-1">ADIM {step}/4</p>
                </div>
                {step > 1 && (
                    <button onClick={() => setStep(step - 1)} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-[5px] text-gray-400 hover:text-primary-600 transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="text-left">
              {/* STEP 1: LOCATION */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Şehir Seçin</label>
                          <select 
                            className={inputClassName} 
                            value={formData.city} 
                            onChange={(e) => { setFormData({...formData, city: e.target.value}); setLocationVerified(false); }}
                          >
                              <option value="">Şehir Seç</option>
                              <optgroup label="Büyük Şehirler">
                                  {PRIORITY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </optgroup>
                              <optgroup label="Tüm Şehirler">
                                  {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </optgroup>
                          </select>
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">İlçe / Bölge</label>
                          <input 
                            type="text" 
                            placeholder="Örn: Beşiktaş" 
                            className={inputClassName} 
                            value={formData.district} 
                            onChange={(e) => { setFormData({...formData, district: e.target.value}); setLocationVerified(false); }} 
                          />
                      </div>
                  </div>

                  <div className="relative w-full aspect-video md:aspect-[21/9] rounded-[5px] overflow-hidden border border-gray-100 dark:border-gray-800 bg-gray-100 z-0 group">
                      <div ref={mapContainerRef} className="w-full h-full" />
                      {!locationVerified && (
                         <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center pointer-events-none transition-all">
                            <div className="bg-white/95 dark:bg-gray-800/95 px-8 py-5 rounded-[5px] border border-gray-100 dark:border-gray-700 flex flex-col items-center gap-3">
                               <MapIcon size={24} className="text-primary-600 animate-bounce"/>
                               <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">KONUMU DOĞRULAYIN</p>
                            </div>
                         </div>
                      )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <button 
                        type="button" 
                        onClick={handleCurrentLocation} 
                        disabled={isLocating}
                        className="bg-gray-50 dark:bg-gray-800 p-4 rounded-[5px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 border border-gray-100 dark:border-gray-700"
                      >
                        <Navigation size={18} className={isLocating ? "animate-spin" : ""}/> 
                        Mevcut Konum
                      </button>
                      <button 
                        type="button" 
                        onClick={verifyLocation} 
                        className="bg-primary-600 text-white p-4 rounded-[5px] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:bg-primary-700 active:scale-95"
                      >
                        <MapPin size={18}/> Doğrula
                      </button>
                  </div>

                  <button 
                    type="button" 
                    disabled={!locationVerified || !formData.city} 
                    onClick={() => setStep(2)} 
                    className="w-full bg-gray-900 dark:bg-primary-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 disabled:text-gray-400 text-white py-5 rounded-[5px] font-black text-sm uppercase tracking-widest mt-8 flex items-center justify-center gap-3 transition-all active:scale-95 border border-transparent"
                  >
                    Devam Et <ChevronRight size={18} />
                  </button>
                </div>
              )}

              {/* STEP 2: CAR DETAILS */}
              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Marka</label>
                            <select className={inputClassName} value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value, model: ''})}>
                                <option value="">Marka Seç</option>
                                {Object.keys(CAR_BRANDS).sort().map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yıl</label>
                            <select className={inputClassName} value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})}>
                                <option value="">Yıl</option>
                                {[2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015].map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Model</label>
                        <input type="text" placeholder="Örn: Clio, 320i, Egea" className={inputClassName} value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1 text-left">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Vites</label>
                            <select className={inputClassName} value={formData.transmission} onChange={(e) => setFormData({...formData, transmission: e.target.value})}>
                                <option value="">Seçiniz</option>
                                <option value="Otomatik">Otomatik</option>
                                <option value="Manuel">Manuel</option>
                            </select>
                        </div>
                        <div className="space-y-1 text-left">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Yakıt</label>
                            <select className={inputClassName} value={formData.fuelType} onChange={(e) => setFormData({...formData, fuelType: e.target.value})}>
                                <option value="">Seçiniz</option>
                                <option value="Benzin">Benzin</option>
                                <option value="Dizel">Dizel</option>
                                <option value="Hibrit">Hibrit</option>
                                <option value="Elektrik">Elektrik</option>
                            </select>
                        </div>
                    </div>

                    <button 
                      type="button" 
                      disabled={!formData.brand || !formData.model || !formData.year} 
                      onClick={() => setStep(3)} 
                      className="w-full bg-gray-900 dark:bg-primary-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white py-5 rounded-[5px] font-black text-sm uppercase mt-8 flex items-center justify-center gap-3 transition-all active:scale-95"
                    >
                      Sonraki Adım <ChevronRight size={18} />
                    </button>
                </div>
              )}

              {/* STEP 3: PHOTOS & PRICE */}
              {step === 3 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Araç Fotoğrafları</label>
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full h-48 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-[5px] flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-all group"
                        >
                            <input type="file" multiple ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
                            <Camera size={28} className="text-primary-600 mb-2"/>
                            <span className="text-[10px] font-black text-gray-900 dark:text-white uppercase tracking-widest">Fotoğraf Ekle</span>
                        </div>

                        <div className="grid grid-cols-5 gap-2 mt-4">
                            {formData.images.map((img, i) => (
                                <div key={i} className="relative aspect-square rounded-[5px] overflow-hidden border border-gray-100 dark:border-gray-700">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button 
                                      type="button" 
                                      onClick={() => setFormData(prev => ({ ...prev, images: prev.images.filter((_, idx) => idx !== i) }))}
                                      className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-[3px]"
                                    >
                                        <X size={8} />
                                    </button>
                                </div>
                            ))}
                        </div>
                      </div>

                      <div className="space-y-2 text-left">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Günlük Kiralama Bedeli</label>
                        <div className="relative">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-primary-600">₺</div>
                            <input 
                              type="number" 
                              placeholder="0" 
                              className={`${inputClassName} pl-12 text-2xl font-black`} 
                              value={formData.pricePerDay} 
                              onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} 
                            />
                        </div>
                        <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-[5px] border border-primary-100 dark:border-primary-900/30 flex items-start gap-3 mt-2">
                            <AlertCircle size={16} className="text-primary-600 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-primary-800 dark:text-primary-300 font-bold uppercase tracking-widest text-left">
                                Önerilen fiyat aralığı: ₺800 - ₺2.500 arasındadır.
                            </p>
                        </div>
                      </div>

                      <button 
                        type="button" 
                        disabled={!formData.pricePerDay || formData.images.length === 0} 
                        onClick={() => setStep(4)} 
                        className="w-full bg-gray-900 dark:bg-primary-600 disabled:bg-gray-200 dark:disabled:bg-gray-800 text-white py-5 rounded-[5px] font-black text-sm uppercase mt-8 flex items-center justify-center gap-3 active:scale-95"
                      >
                        Önizleme <ChevronRight size={18} />
                      </button>
                  </div>
              )}

              {/* STEP 4: REVIEW & PUBLISH */}
              {step === 4 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-left">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-[5px] overflow-hidden border border-gray-100 dark:border-gray-700">
                          <img src={formData.images[0]} className="w-full h-56 object-cover" />
                          <div className="p-6">
                              <div className="flex justify-between items-start">
                                  <div>
                                      <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">{formData.brand} {formData.model}</h3>
                                      <p className="text-xs font-bold text-gray-500 mt-1 uppercase">{formData.district}, {formData.city}</p>
                                  </div>
                                  <div className="text-right">
                                      <p className="text-2xl font-black text-primary-600 leading-none">₺{formData.pricePerDay}</p>
                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">GÜNLÜK</p>
                                  </div>
                              </div>
                              <div className="flex gap-4 mt-6 pt-6 border-t dark:border-gray-700">
                                  <div className="flex-1">
                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">VİTES</p>
                                      <p className="font-bold text-xs uppercase text-gray-900 dark:text-white">{formData.transmission}</p>
                                  </div>
                                  <div className="flex-1">
                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">YAKIT</p>
                                      <p className="font-bold text-xs uppercase text-gray-900 dark:text-white">{formData.fuelType}</p>
                                  </div>
                                  <div className="flex-1">
                                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">YIL</p>
                                      <p className="font-bold text-xs text-gray-900 dark:text-white">{formData.year}</p>
                                  </div>
                              </div>
                          </div>
                      </div>

                      <button 
                        type="submit" 
                        className="w-full bg-primary-600 text-white py-5 rounded-[5px] font-black text-xl uppercase tracking-widest active:scale-95 transition-all"
                      >
                        İlanı Yayınla
                      </button>
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
