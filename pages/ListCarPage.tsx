import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Fuel, Settings, CheckCircle, Navigation, Upload, DollarSign, Camera, MapPin, X, Plus, Search, Map as MapIcon, Check, AlertCircle, Move } from 'lucide-react';
import { CAR_BRANDS } from '../data/cars';
import { checkAuthStatus } from '../services/firebase';

declare const L: any;

const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
].sort();

const fuelTypes = ['Benzin', 'Dizel', 'Elektrik', 'Hibrit', 'LPG'];
const transmissions = ['Manuel', 'Otomatik', 'Yarı Otomatik'];

const ListCarPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [isLocating, setIsLocating] = useState(false);
  const [locationVerified, setLocationVerified] = useState(false);
  
  const [formData, setFormData] = useState({
    city: '',
    district: '',
    neighborhood: '',
    fullAddress: '',
    exactLat: null as number | null,
    exactLng: null as number | null,
    brand: '',
    model: '',
    year: '',
    fuelType: '',
    transmission: '',
    pricePerDay: '',
    images: [] as string[]
  });

  const availableModels = formData.brand ? (CAR_BRANDS as any)[formData.brand] || [] : [];

  useEffect(() => {
    if (!checkAuthStatus()) {
      alert("Lütfen giriş yapınız.");
      navigate('/login');
    }
  }, [navigate]);

  // Load Leaflet for Step 1
  useEffect(() => {
    if (step === 1 && mapContainerRef.current && !mapInstanceRef.current && typeof L !== 'undefined') {
        const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([39.0, 35.0], 6);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);
        mapInstanceRef.current = map;
    }
  }, [step]);

  const updateMarker = (lat: number, lng: number) => {
    if (!mapInstanceRef.current) return;
    
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { draggable: true }).addTo(mapInstanceRef.current);
      markerRef.current.on('dragend', () => {
        const pos = markerRef.current.getLatLng();
        setFormData(prev => ({ ...prev, exactLat: pos.lat, exactLng: pos.lng }));
        setLocationVerified(true);
      });
    }
    
    mapInstanceRef.current.setView([lat, lng], 15);
  };

  const verifyLocation = async () => {
    if (!formData.city || !formData.district) return alert("Lütfen Şehir ve İlçe giriniz.");
    
    try {
      const query = `${formData.district}, ${formData.city}, Turkey`;
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data && data[0]) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setFormData(prev => ({ ...prev, exactLat: lat, exactLng: lon }));
        setLocationVerified(true);
        updateMarker(lat, lon);
      } else {
        alert("Konum bulunamadı. Lütfen haritadan seçin.");
      }
    } catch (e) {
      alert("Hata oluştu. Haritadan kendiniz seçebilirsiniz.");
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return alert("GPS desteklenmiyor.");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const { latitude, longitude } = pos.coords;
      setFormData(prev => ({ ...prev, exactLat: latitude, exactLng: longitude }));
      setLocationVerified(true);
      updateMarker(latitude, longitude);
      setIsLocating(false);
    }, () => {
      setIsLocating(false);
      alert("Konum izni alınamadı.");
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
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
    if (!locationVerified) return alert("Lütfen konumu doğrulayın.");
    
    const newCar = {
      id: Date.now(),
      name: `${formData.brand} ${formData.model}`,
      brand: formData.brand,
      model: formData.model,
      year: Number(formData.year),
      pricePerDay: Number(formData.pricePerDay),
      status: 'Active', 
      image: formData.images[0] || '',
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
      features: ['Yeni İlan']
    };

    const stored = localStorage.getItem('myCars');
    const existing = stored ? JSON.parse(stored) : [];
    localStorage.setItem('myCars', JSON.stringify([...existing, newCar]));
    window.dispatchEvent(new Event('storage'));
    
    alert("Aracınız başarıyla listelendi!");
    navigate('/profile');
  };

  const inputClassName = "w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-medium transition-all";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-24 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="p-8 md:p-12">
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Aracını Listele</h1>
            <p className="text-gray-500 mb-10 text-sm font-bold uppercase tracking-widest">Adım {step}/4</p>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-10">
                  <div className="grid grid-cols-2 gap-4">
                      <select className={inputClassName} value={formData.city} onChange={(e) => { setFormData({...formData, city: e.target.value}); setLocationVerified(false); }}>
                          <option value="">Şehir Seç</option>
                          {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input type="text" placeholder="İlçe" className={inputClassName} value={formData.district} onChange={(e) => { setFormData({...formData, district: e.target.value}); setLocationVerified(false); }} />
                  </div>
                  
                  <div className="relative w-full aspect-video rounded-[2rem] overflow-hidden border-2 border-gray-100 dark:border-gray-700 bg-gray-50 shadow-inner z-0">
                      <div ref={mapContainerRef} className="w-full h-full" />
                      {!locationVerified && (
                         <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center pointer-events-none">
                            <div className="bg-white/95 px-6 py-4 rounded-3xl shadow-xl flex flex-col items-center gap-2">
                               <MapIcon size={32} className="text-primary-600 animate-bounce"/>
                               <p className="text-[10px] font-black uppercase tracking-wider">Konumu Doğrulayın</p>
                            </div>
                         </div>
                      )}
                  </div>

                  <div className="flex gap-2">
                      <button type="button" onClick={handleCurrentLocation} className="flex-1 bg-gray-50 dark:bg-gray-700 p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-gray-100"><Navigation size={18}/> Mevcut Konumum</button>
                      <button type="button" onClick={verifyLocation} className="flex-1 bg-primary-600 text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all hover:bg-primary-700"><MapPin size={18}/> Adresi Doğrula</button>
                  </div>

                  <hr className="dark:border-gray-700 border-gray-100 my-8" />

                  <div className="grid grid-cols-2 gap-4">
                    <select className={inputClassName} value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value, model: ''})}><option value="">Marka</option>{Object.keys(CAR_BRANDS).map(b => <option key={b} value={b}>{b}</option>)}</select>
                    <select className={inputClassName} value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})}><option value="">Yıl</option>{Array.from({length: 15} as any, (_, i) => 2024 - i).map(y => <option key={y} value={y}>{y}</option>)}</select>
                  </div>
                  {formData.brand && <select className={inputClassName} value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})}><option value="">Model Seç</option>{availableModels.map((m:any) => <option key={m} value={m}>{m}</option>)}</select>}
                  
                  <button type="button" disabled={!formData.brand || !locationVerified} onClick={() => setStep(2)} className="w-full bg-primary-600 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-lg mt-8 shadow-xl shadow-primary-600/20 active:scale-[0.98] transition-all">Devam Et</button>
                </div>
              )}

              {step >= 2 && (
                  /* Adım 2, 3 ve 4 logicleri mevcut kodunuzla aynı kalabilir, sadece step 1'deki harita Leaflet'e döndü */
                  <div className="animate-in slide-in-from-right-10">
                    {/* Mevcut step 2-4 logicleri... */}
                    {step === 2 && (
                        <div className="space-y-8">
                             <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-4 ml-1">Yakıt Tipi</label>
                                <div className="grid grid-cols-2 gap-3">{fuelTypes.map(f => <button key={f} type="button" onClick={() => setFormData({...formData, fuelType: f})} className={`p-4 rounded-2xl border-2 font-bold transition-all ${formData.fuelType === f ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-100 dark:border-gray-700 text-gray-500'}`}>{f}</button>)}</div>
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-4 ml-1">Vites Tipi</label>
                                <div className="flex gap-3">{transmissions.map(t => <button key={t} type="button" onClick={() => setFormData({...formData, transmission: t})} className={`flex-1 p-4 rounded-2xl border-2 font-bold transition-all ${formData.transmission === t ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-100 dark:border-gray-700 text-gray-500'}`}>{t}</button>)}</div>
                            </div>
                            <div className="flex gap-4 mt-12">
                                <button type="button" onClick={() => setStep(1)} className="flex-1 bg-gray-100 dark:bg-gray-700 py-5 rounded-2xl font-bold">Geri</button>
                                <button type="button" disabled={!formData.fuelType || !formData.transmission} onClick={() => setStep(3)} className="flex-[2] bg-primary-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-primary-600/20">Devam Et</button>
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="space-y-8">
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-4 ml-1">Araç Fotoğrafları</label>
                                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer bg-gray-50 dark:bg-gray-900 shadow-inner">
                                <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
                                <div className="flex flex-col items-center">
                                    <Upload size={32} className="text-primary-600 mb-4" />
                                    <p className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm">Fotoğraf Seç</p>
                                </div>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-4 ml-1">Günlük Ücret (₺)</label>
                                <input type="number" placeholder="1500" className={`${inputClassName} py-5 text-2xl font-black`} value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} />
                            </div>
                            <div className="flex gap-4 mt-8">
                                <button type="button" onClick={() => setStep(2)} className="flex-1 bg-gray-100 dark:bg-gray-700 py-5 rounded-2xl font-bold">Geri</button>
                                <button type="button" disabled={formData.images.length === 0 || !formData.pricePerDay} onClick={() => setStep(4)} className="flex-[2] bg-primary-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-primary-600/20">İncele</button>
                            </div>
                        </div>
                    )}
                    {step === 4 && (
                        <div className="text-center animate-in zoom-in-95">
                            <h3 className="text-3xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-tight">{formData.year} {formData.brand} {formData.model}</h3>
                            <p className="text-gray-500 font-bold mb-10">{formData.district} / {formData.city}</p>
                            <div className="bg-primary-50 dark:bg-primary-900/20 p-8 rounded-[2rem] mb-12 flex flex-col items-center">
                                <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">Günlük Kazancın</span>
                                <span className="text-5xl font-black text-primary-700 dark:text-primary-300">₺{(Number(formData.pricePerDay) * 0.85).toFixed(0)}</span>
                            </div>
                            <div className="flex gap-4">
                                <button type="button" onClick={() => setStep(3)} className="flex-1 bg-gray-100 dark:bg-gray-700 py-5 rounded-2xl font-bold">Düzenle</button>
                                <button type="submit" className="flex-[2] bg-primary-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-primary-600/20">İlanı Başlat</button>
                            </div>
                        </div>
                    )}
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