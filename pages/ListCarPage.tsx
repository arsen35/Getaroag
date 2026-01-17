import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ImageCarousel from '../components/ImageCarousel';
import { Fuel, Settings, CheckCircle, Navigation, Upload, DollarSign, Camera, MapPin, X, Plus, Search, Map as MapIcon, Check, AlertCircle, Move } from 'lucide-react';
import { CAR_BRANDS } from '../data/cars';
import { checkAuthStatus } from '../services/firebase';

declare const L: any;

const PRIORITY_CITIES = ["İstanbul", "Ankara", "İzmir", "Antalya"];
const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
].sort();

const fuelTypes = ['Benzin', 'Dizel', 'Elektrik', 'Hibrit', 'LPG'];
const transmissions = ['Manuel', 'Otomatik', 'Yarı Otomatik'];

const ListCarPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const miniMapContainerRef = useRef<HTMLDivElement>(null);
  const miniMapInstanceRef = useRef<any>(null);
  const miniMarkerRef = useRef<any>(null);
  
  const [isLocating, setIsLocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
      alert("Araç listelemek için lütfen giriş yapınız.");
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    if (step === 1 && miniMapContainerRef.current && !miniMapInstanceRef.current && typeof L !== 'undefined') {
      const map = L.map(miniMapContainerRef.current, { 
        zoomControl: true, 
        scrollWheelZoom: true 
      }).setView([39.0, 35.0], 6);
      
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
      miniMapInstanceRef.current = map;
    }
  }, [step]);

  const updateMiniMap = (lat: number, lng: number) => {
    if (!miniMapInstanceRef.current) return;
    
    if (miniMarkerRef.current) {
      miniMarkerRef.current.setLatLng([lat, lng]);
    } else {
      const markerIcon = L.divIcon({
        className: 'custom-map-marker',
        html: `<div class="bg-primary-600 w-8 h-8 rounded-full border-4 border-white shadow-xl flex items-center justify-center text-white"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-1.1 0-2 .9-2 2v7c0 1.1.9 2 2 2h10"></path><circle cx="7" cy="17" r="2"></circle><circle cx="15" cy="17" r="2"></circle></svg></div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([lat, lng], { draggable: true, icon: markerIcon }).addTo(miniMapInstanceRef.current);
      
      marker.on('dragend', function(event: any) {
        const position = event.target.getLatLng();
        setFormData(prev => ({ ...prev, exactLat: position.lat, exactLng: position.lng }));
        setLocationVerified(true);
      });
      
      miniMarkerRef.current = marker;
    }
    
    miniMapInstanceRef.current.setView([lat, lng], 16);
  };

  const verifyLocation = async () => {
    if (!formData.city || !formData.district) {
      alert("Lütfen en az Şehir ve İlçe bilgisini giriniz.");
      return;
    }

    setIsGeocoding(true);
    const queries = [
      `${formData.neighborhood} mah. ${formData.district}, ${formData.city}, Türkiye`,
      `${formData.district}, ${formData.city}, Türkiye`,
      `${formData.city}, Türkiye`
    ];
    
    let found = false;
    for (const q of queries) {
      if (found) break;
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`, {
          headers: { 'Accept-Language': 'tr' }
        });
        const data = await response.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lng = parseFloat(data[0].lon);
          setFormData(prev => ({ ...prev, exactLat: lat, exactLng: lng }));
          setLocationVerified(true);
          updateMiniMap(lat, lng);
          found = true;
        }
      } catch (error) { console.error(error); }
    }

    if (!found) alert("Adres tam olarak doğrulanamadı. Lütfen haritadan manuel işaretleyin.");
    setIsGeocoding(false);
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return alert("GPS desteklenmiyor.");
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=tr`);
        const data = await res.json();
        if (data?.address) {
          const addr = data.address;
          setFormData(prev => ({ 
            ...prev, 
            city: (addr.province || addr.city || "").replace(" İli", ""), 
            district: (addr.district || addr.town || "").replace(" İlçesi", ""), 
            neighborhood: addr.suburb || addr.neighbourhood || "",
            fullAddress: data.display_name || "",
            exactLat: latitude, 
            exactLng: longitude 
          }));
          setLocationVerified(true);
          updateMiniMap(latitude, longitude);
        }
      } catch (e) { 
          setFormData(prev => ({ ...prev, exactLat: latitude, exactLng: longitude }));
          setLocationVerified(true);
          updateMiniMap(latitude, longitude);
      } finally { setIsLocating(false); }
    }, () => {
      setIsLocating(false);
      alert("Konum izni reddedildi.");
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
      files.forEach((file: File) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          setFormData(prev => ({ ...prev, images: [...prev.images, base64].slice(0, 5) }));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationVerified) return alert("Lütfen konumu doğrulayın.");
    
    const price = Number(formData.pricePerDay);
    if (!price || price <= 0) return alert("Lütfen geçerli bir fiyat giriniz.");

    setIsSubmitting(true);
    
    try {
      const newCar = {
        id: Number(Date.now()),
        name: `${formData.brand} ${formData.model}`,
        brand: formData.brand,
        model: formData.model,
        year: Number(formData.year),
        pricePerDay: price,
        pricePerHour: Math.round(price / 10),
        status: 'Active', 
        image: formData.images[0] || '',
        images: formData.images,
        location: { 
          city: formData.city, 
          district: formData.district, 
          neighborhood: formData.neighborhood,
          fullAddress: formData.fullAddress,
          lat: formData.exactLat || 39.0, 
          lng: formData.exactLng || 35.0
        },
        transmission: formData.transmission,
        fuelType: formData.fuelType,
        type: 'Sedan',
        rating: 5.0, 
        reviews: 0, 
        distance: '0km',
        features: ['Yeni İlan']
      };

      const stored = localStorage.getItem('myCars');
      let existing = [];
      try {
        const parsed = stored ? JSON.parse(stored) : [];
        existing = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        existing = [];
      }

      const updatedList = [...existing, newCar];
      localStorage.setItem('myCars', JSON.stringify(updatedList));
      window.dispatchEvent(new Event('storage'));
      
      // Feedback and navigation
      alert("Aracınız başarıyla listelendi!");
      navigate('/profile');
    } catch (err) {
      console.error("Listeleme hatası:", err);
      alert("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClassName = "w-full p-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none text-gray-900 dark:text-white font-medium shadow-sm transition-all";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans pb-24 md:pb-0">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="bg-gray-100 dark:bg-gray-700 h-2 w-full">
            <div className="bg-primary-600 h-full transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
          </div>

          <div className="p-8 md:p-12">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">Aracını Listele</h1>
                    <p className="text-gray-500">Araç detaylarını ve konumunu girin. Adım {step}/4</p>
                </div>
                {step === 1 && (
                    <button type="button" onClick={handleCurrentLocation} disabled={isLocating} className="bg-primary-50 dark:bg-primary-900/30 text-primary-600 p-3 rounded-2xl hover:bg-primary-100 transition-all flex items-center gap-2 font-bold text-sm">
                        {isLocating ? "..." : <Navigation size={20}/>}
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-10">
                  <div className="grid grid-cols-2 gap-4">
                      <select className={inputClassName} value={formData.city} onChange={(e) => { setFormData({...formData, city: e.target.value}); setLocationVerified(false); }}>
                          <option value="">Şehir Seç</option>
                          {PRIORITY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                          {TURKEY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <input type="text" placeholder="İlçe" className={inputClassName} value={formData.district} onChange={(e) => { setFormData({...formData, district: e.target.value}); setLocationVerified(false); }} />
                  </div>

                  <input type="text" placeholder="Mahalle" className={inputClassName} value={formData.neighborhood} onChange={(e) => { setFormData({...formData, neighborhood: e.target.value}); setLocationVerified(false); }} />
                  <textarea placeholder="Sokak, Bina No, Kapı No" className={`${inputClassName} min-h-[80px]`} value={formData.fullAddress} onChange={(e) => { setFormData({...formData, fullAddress: e.target.value}); setLocationVerified(false); }} />

                  <div className="relative w-full aspect-square rounded-[2rem] overflow-hidden border-2 border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 shadow-inner group">
                      <div ref={miniMapContainerRef} className="w-full h-full z-10" />
                      {!locationVerified && (
                         <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] z-20 flex flex-col items-center justify-center p-8 text-center pointer-events-none">
                            <div className="bg-white/95 dark:bg-gray-800/95 px-6 py-4 rounded-3xl shadow-xl flex flex-col items-center gap-2">
                               <MapIcon size={32} className="text-primary-600 animate-bounce"/>
                               <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider">Haritayı Görmek İçin</p>
                               <p className="text-xs text-gray-500 font-medium">Lütfen bilgileri girip doğrulama yapın</p>
                            </div>
                         </div>
                      )}
                      {locationVerified && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-[80%] pointer-events-none">
                           <div className="bg-primary-600/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-lg flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                              <Move size={14}/> Pini Sürükleyerek Hassas Ayar Yapabilirsin
                           </div>
                        </div>
                      )}
                  </div>

                  <button 
                    type="button" 
                    onClick={verifyLocation}
                    disabled={isGeocoding || !formData.city || !formData.district}
                    className={`w-full flex items-center justify-center gap-3 p-5 rounded-2xl border-2 font-black transition-all ${locationVerified ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'border-primary-600 text-primary-600 hover:bg-primary-50'}`}
                  >
                    {isGeocoding ? "Doğrulanıyor..." : locationVerified ? <><Check size={20}/> Konum İşaretlendi</> : <><MapIcon size={20}/> Konumu Haritada Doğrula</>}
                  </button>

                  <hr className="dark:border-gray-700 border-gray-100 my-8" />

                  <div className="grid grid-cols-2 gap-4">
                    <select className={inputClassName} value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value, model: ''})}><option value="">Marka</option>{Object.keys(CAR_BRANDS).map(b => <option key={b} value={b}>{b}</option>)}</select>
                    <select className={inputClassName} value={formData.year} onChange={(e) => setFormData({...formData, year: e.target.value})}><option value="">Yıl</option>{Array.from({length: 15} as any, (_, i) => 2024 - i).map(y => <option key={y} value={y}>{y}</option>)}</select>
                  </div>
                  {formData.brand && <select className={inputClassName} value={formData.model} onChange={(e) => setFormData({...formData, model: e.target.value})}><option value="">Model Seç</option>{availableModels.map((m:any) => <option key={m} value={m}>{m}</option>)}</select>}
                  
                  <button type="button" disabled={!formData.brand || !formData.city || !locationVerified} onClick={() => setStep(2)} className="w-full bg-primary-600 disabled:opacity-50 text-white py-5 rounded-2xl font-black text-lg mt-8 shadow-xl shadow-primary-600/20 active:scale-95 transition-all">Devam Et</button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in slide-in-from-right-10">
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
                    <button type="button" disabled={!formData.fuelType || !formData.transmission} onClick={() => setStep(3)} className="flex-[2] bg-primary-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-primary-600/20 active:scale-95 transition-all">Devam Et</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in slide-in-from-right-10">
                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-4 ml-1">Araç Fotoğrafları</label>
                    <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all bg-gray-50 dark:bg-gray-900 shadow-inner hover:border-primary-500 ${formData.images.length > 0 ? 'border-primary-300' : 'border-gray-300 dark:border-gray-700'}`}>
                      <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageUpload} />
                      <div className="flex flex-col items-center">
                        <div className="w-20 h-20 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-primary-600 mb-6"><Upload size={32} /></div>
                        <p className="font-black text-gray-900 dark:text-white uppercase tracking-widest text-sm">Fotoğraf Seç</p>
                        <p className="text-xs text-gray-500 mt-2">Dikey 4:5 çekim önerilir</p>
                      </div>
                    </div>
                    {formData.images.length > 0 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto py-2">
                            {formData.images.map((img, i) => (
                                <div key={i} className="w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 border-primary-100 shadow-sm relative">
                                    <img src={img} className="w-full h-full object-cover" />
                                    <button type="button" onClick={(e) => { e.stopPropagation(); setFormData(p => ({...p, images: p.images.filter((_, idx) => idx !== i)})); }} className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full"><X size={10}/></button>
                                </div>
                            ))}
                        </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 block mb-4 ml-1">Günlük Ücret (₺)</label>
                    <div className="relative">
                       <span className="absolute left-5 top-1/2 -translate-y-1/2 font-black text-gray-400 text-xl">₺</span>
                       <input type="number" placeholder="1500" className={`${inputClassName} pl-12 py-5 text-2xl font-black`} value={formData.pricePerDay} onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} />
                    </div>
                  </div>
                   <div className="flex gap-4 mt-8">
                    <button type="button" onClick={() => setStep(2)} className="flex-1 bg-gray-100 dark:bg-gray-700 py-5 rounded-2xl font-bold">Geri</button>
                    <button type="button" disabled={formData.images.length === 0 || !formData.pricePerDay} onClick={() => setStep(4)} className="flex-[2] bg-primary-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-primary-600/20 active:scale-95 transition-all">İncele</button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="text-center animate-in zoom-in-95">
                  <div className="w-full max-w-xs mx-auto rounded-[3rem] overflow-hidden shadow-2xl mb-8 border-8 border-white dark:border-gray-700">
                      <ImageCarousel images={formData.images} />
                  </div>
                  <h3 className="text-3xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-tight">{formData.year} {formData.brand} {formData.model}</h3>
                  <p className="text-gray-500 font-bold mb-1">{formData.neighborhood} Mah. {formData.district} / {formData.city}</p>
                  <p className="text-xs text-gray-400 mb-10 italic max-w-sm mx-auto">{formData.fullAddress}</p>
                  
                  <div className="bg-primary-50 dark:bg-primary-900/20 p-8 rounded-[2rem] mb-12 flex flex-col items-center">
                      <span className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-2">Net Günlük Kazancın</span>
                      <span className="text-5xl font-black text-primary-700 dark:text-primary-300">₺{(parseInt(formData.pricePerDay) * 0.85).toFixed(0)}</span>
                  </div>

                  <div className="flex gap-4">
                    <button type="button" onClick={() => setStep(3)} className="flex-1 bg-gray-100 dark:bg-gray-700 py-5 rounded-2xl font-bold">Düzenle</button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting} 
                      className="flex-[2] bg-primary-600 text-white py-5 rounded-2xl font-black shadow-xl shadow-primary-600/20 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {isSubmitting ? 'Listeleniyor...' : 'İlanı Başlat'}
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