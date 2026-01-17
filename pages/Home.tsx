import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Shield, Users, Clock, Star, ArrowRight, Navigation, Calendar as CalendarIcon, Tag, Settings, Fuel, ChevronDown, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';
import CustomCalendar from '../components/CustomCalendar';
import PullToRefresh from '../components/PullToRefresh';

const TURKEY_CITIES = [
  "Adana", "Adıyaman", "Afyonkarahisar", "Ağrı", "Amasya", "Artvin", "Aydın", "Balıkesir", "Bilecik", "Bingöl", "Bitlis", "Bolu", "Burdur", "Bursa", "Çanakkale", "Çankırı", "Çorum", "Denizli", "Diyarbakır", "Edirne", "Elazığ", "Erzincan", "Erzurum", "Eskişehir", "Gaziantep", "Giresun", "Gümüşhane", "Hakkari", "Hatay", "Isparta", "Mersin", "Kars", "Kastamonu", "Kayseri", "Kırklareli", "Kırşehir", "Kocaeli", "Konya", "Kütahya", "Malatya", "Manisa", "Kahramanmaraş", "Mardin", "Muğla", "Muş", "Nevşehir", "Niğde", "Ordu", "Rize", "Sakarya", "Samsun", "Siirt", "Sinop", "Sivas", "Tekirdağ", "Tokat", "Trabzon", "Tunceli", "Şanlıurfa", "Uşak", "Van", "Yozgat", "Zonguldak", "Aksaray", "Bayburt", "Karaman", "Kırıkkale", "Batman", "Şırnak", "Bartın", "Ardahan", "Iğdır", "Yalova", "Karabük", "Kilis", "Osmaniye", "Düzce"
].sort();

const PRIORITY_CITIES = ["İstanbul", "Ankara", "İzmir", "Antalya"];

const HomePage = () => {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [showExtraFilters, setShowExtraFilters] = useState(false);
  
  // New Filter States
  const [transmission, setTransmission] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [ageGroup, setAgeGroup] = useState('');

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCityDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pickup || !dropoff) {
      alert("Lütfen geçerli bir tarih aralığı seçiniz.");
      setIsCalendarOpen(true);
      return;
    }
    navigate('/search', { 
      state: { 
        location, 
        pickup, 
        dropoff,
        transmission,
        fuelType,
        ageGroup
      } 
    });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }
    setIsLoadingLocation(true);
    setLocation("Konum alınıyor...");

    navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=tr`);
          const data = await response.json();
          if (data && data.address) {
            const addr = data.address;
            const city = addr.province || addr.city || addr.state;
            const district = addr.suburb || addr.district || addr.town;
            setLocation(district ? `${district}, ${city}` : city);
          }
        } catch (error) {
          setLocation("Konum işaretlendi");
        } finally {
          setIsLoadingLocation(false);
          setShowCityDropdown(false);
        }
    }, () => {
      setIsLoadingLocation(false);
      setLocation("");
      alert("Konum izni alınamadı.");
    });
  };

  const inputClass = "w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-500 rounded-xl focus:outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-500 shadow-sm text-sm";
  const filterBtnClass = (active: boolean) => `px-4 py-2 rounded-xl text-xs font-bold transition-all border ${active ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-primary-400'}`;

  return (
    <PullToRefresh>
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans transition-colors duration-300 pb-20 md:pb-0">
      <Navbar />
      
      <div className="hidden md:flex bg-gradient-to-r from-primary-700 to-purple-700 text-white py-2.5 justify-center items-center text-sm font-medium shadow-sm relative overflow-hidden">
         <div className="flex items-center gap-2 relative z-10">
            <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold border border-white/20">YENİ</span>
            <span>Yaz sezonuna özel tüm araçlarda <strong>%15 indirim</strong> fırsatını kaçırma!</span>
            <span className="flex items-center gap-1 bg-white text-primary-700 px-2 py-0.5 rounded font-mono font-bold text-xs ml-2 cursor-pointer">
               <Tag size={12} /> YAZ15
            </span>
         </div>
      </div>
      
      <CustomCalendar 
        isOpen={isCalendarOpen} 
        onClose={() => setIsCalendarOpen(false)}
        startDate={pickup}
        endDate={dropoff}
        onChange={(start, end) => {
          setPickup(start);
          setDropoff(end);
        }}
      />
      
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-primary-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 space-y-8 relative z-10">
              <h1 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                Dakikalar içinde <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                  araç kirala.
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium max-w-lg">
                Telefonunla 7/24 araçların kilidini aç ve yola çık. Aracını paylaşarak gelir elde et.
              </p>

              <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-5 rounded-[2rem] shadow-2xl dark:shadow-none dark:border dark:border-gray-700 space-y-4">
                <div className="relative group" ref={dropdownRef}>
                  <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
                  <input
                    type="text"
                    placeholder="Nereden kiralayacaksınız?"
                    value={location}
                    onChange={(e) => { setLocation(e.target.value); setShowCityDropdown(true); }}
                    onFocus={() => setShowCityDropdown(true)}
                    className={inputClass}
                    autoComplete="off"
                  />
                  {showCityDropdown && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                      <button type="button" onClick={handleCurrentLocation} className="w-full flex items-center gap-3 p-4 hover:bg-primary-50 dark:hover:bg-gray-700 text-primary-700 font-bold border-b border-gray-100 dark:border-gray-700">
                        {isLoadingLocation ? "..." : <Navigation size={18} />} Mevcut Konum
                      </button>
                      <div className="max-h-60 overflow-y-auto">
                        {PRIORITY_CITIES.map(city => (
                           <div key={city} onClick={() => { setLocation(city); setShowCityDropdown(false); }} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer font-medium text-gray-700 dark:text-gray-200">
                             {city}
                           </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="relative group h-14 cursor-pointer" onClick={() => setIsCalendarOpen(true)}>
                    <div className="absolute inset-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center px-4">
                        <CalendarIcon size={18} className="text-gray-400 mr-3" />
                        <span className={`text-sm font-semibold ${pickup && dropoff ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                            {pickup && dropoff ? `${new Date(pickup).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} → ${new Date(dropoff).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}` : 'Tarih Aralığı Seç'}
                        </span>
                    </div>
                </div>

                {/* Extra Filters Section */}
                <div className="pt-2">
                    <button 
                      type="button" 
                      onClick={() => setShowExtraFilters(!showExtraFilters)}
                      className="flex items-center gap-2 text-xs font-black text-primary-600 uppercase tracking-widest hover:text-primary-700 transition-all mb-2 ml-1"
                    >
                        {showExtraFilters ? <ChevronDown className="rotate-180 transition-transform" size={14}/> : <ChevronDown className="transition-transform" size={14}/>}
                        {transmission || fuelType || ageGroup ? "Kriterlerin Seçildi" : "Kriter Ekle (Opsiyonel)"}
                        {(transmission || fuelType || ageGroup) && <Sparkles size={12} className="animate-pulse text-yellow-500" />}
                    </button>

                    {showExtraFilters && (
                        <div className="space-y-4 py-4 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><Settings size={12}/> Vites Tipi</label>
                                <div className="flex gap-2">
                                    {['Otomatik', 'Manuel'].map(v => (
                                        <button key={v} type="button" onClick={() => setTransmission(transmission === v ? '' : v)} className={filterBtnClass(transmission === v)}>{v}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><Fuel size={12}/> Yakıt Tipi</label>
                                <div className="flex flex-wrap gap-2">
                                    {['Benzin', 'Dizel', 'Hibrit', 'Elektrik'].map(y => (
                                        <button key={y} type="button" onClick={() => setFuelType(fuelType === y ? '' : y)} className={filterBtnClass(fuelType === y)}>{y}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest"><CalendarIcon size={12}/> Araç Yaşı</label>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                      {label: 'Yeni (0-3)', value: 'new'},
                                      {label: 'Genç (4-7)', value: 'mid'},
                                      {label: 'Klasik (8+)', value: 'old'}
                                    ].map(age => (
                                        <button key={age.value} type="button" onClick={() => setAgeGroup(ageGroup === age.value ? '' : age.value)} className={filterBtnClass(ageGroup === age.value)}>{age.label}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                
                <button type="submit" className="w-full bg-primary-600 text-white py-4 rounded-xl font-black text-lg hover:bg-primary-700 transition-all shadow-xl shadow-primary-600/20 flex items-center justify-center gap-2 active:scale-95">
                  <Search size={22} /> Araç Bul
                </button>
              </form>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500 font-bold">
                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                <span>50.000+ Türk kullanıcısından 4.8/5 puan</span>
              </div>
            </div>
            
            <div className="md:w-1/2 relative hidden md:block">
              <div className="absolute -top-10 -right-10 w-96 h-96 bg-primary-200 dark:bg-primary-900 rounded-full blur-3xl opacity-30"></div>
              <img 
                src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Getaroag Deneyimi" 
                className="relative z-10 rounded-[3rem] shadow-2xl border-8 border-white dark:border-gray-800 transform rotate-[-1deg] hover:rotate-0 transition-all duration-700 object-cover h-[550px] w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Popüler Rotalar</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { name: 'İstanbul', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
            { name: 'İzmir', image: 'https://images.unsplash.com/photo-1566375638495-236752763321?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
            { name: 'Ankara', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
            { name: 'Antalya', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
          ].map((city) => (
            <div key={city.name} onClick={() => navigate('/search', { state: { location: city.name } })} className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-[4/5] shadow-lg">
              <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                <h3 className="text-white text-xl font-black">{city.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
};

export default HomePage;