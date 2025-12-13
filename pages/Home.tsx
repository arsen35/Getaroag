import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Search, Shield, Users, Clock, Star, ArrowRight, Navigation, Calendar as CalendarIcon, Tag } from 'lucide-react';
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
  
  // Date States
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
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
    navigate('/search', { state: { location, pickup, dropoff } });
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Tarayıcınız konum özelliğini desteklemiyor.");
      return;
    }

    setIsLoadingLocation(true);
    setLocation("Konum alınıyor (GPS)...");

    const successCallback = async (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=tr`);
          const data = await response.json();
          
          if (data && data.address) {
            const addr = data.address;
            const city = addr.province || addr.city || addr.state || addr.region;
            
            // Detailed District Logic
            let parts = [];
            if (addr.suburb) parts.push(addr.suburb);
            if (addr.neighbourhood && addr.neighbourhood !== addr.suburb) parts.push(addr.neighbourhood);
            if (addr.district && !parts.includes(addr.district)) parts.push(addr.district);
            if (addr.town && !parts.includes(addr.town)) parts.push(addr.town);

            const district = parts.length > 0 ? parts[0] : "";
            
            const fullLocation = district ? `${district}, ${city}` : city;
            setLocation(fullLocation || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          } else {
            setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          }
        } catch (error) {
          console.error("Adres çözümlenemedi:", error);
          setLocation("Konum işaretlendi");
        } finally {
          setIsLoadingLocation(false);
          setShowCityDropdown(false);
        }
    };

    const errorCallback = (error: GeolocationPositionError) => {
        console.warn("High accuracy GPS failed, trying low accuracy...", error.message);
        navigator.geolocation.getCurrentPosition(
            successCallback,
            (finalError) => {
                setIsLoadingLocation(false);
                let msg = "Konum alınamadı.";
                if(finalError.code === finalError.PERMISSION_DENIED) msg = "Konum izni reddedildi.";
                else if(finalError.code === finalError.TIMEOUT) msg = "Zaman aşımı.";
                
                alert(msg + " Lütfen şehri manuel seçiniz.");
                setLocation("");
            },
            { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 }
        );
    };

    // Try High Accuracy First
    navigator.geolocation.getCurrentPosition(
      successCallback,
      errorCallback,
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const priorityCitiesImages = [
    { name: 'İstanbul', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'İzmir', image: 'https://images.unsplash.com/photo-1566375638495-236752763321?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Ankara', image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
    { name: 'Antalya', image: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80' },
  ];

  // Thinner, cleaner input style
  const inputClass = "w-full pl-10 pr-4 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-primary-500 rounded-xl focus:outline-none transition-all font-medium text-gray-900 dark:text-white placeholder-gray-500 shadow-sm text-sm";

  return (
    <PullToRefresh>
    <div className="min-h-screen bg-white dark:bg-gray-900 font-sans transition-colors duration-300 pb-20 md:pb-0">
      <Navbar />
      
      {/* Desktop Banner (Hidden on Mobile) */}
      <div className="hidden md:flex bg-gradient-to-r from-primary-700 to-purple-700 text-white py-2.5 justify-center items-center text-sm font-medium shadow-sm relative overflow-hidden">
         <div className="absolute top-0 left-0 w-full h-full bg-white/5 skew-x-12 transform -translate-x-1/2"></div>
         <div className="flex items-center gap-2 relative z-10 animate-in fade-in slide-in-from-top-2">
            <span className="bg-white/20 backdrop-blur-sm px-2 py-0.5 rounded text-xs font-bold border border-white/20">YENİ</span>
            <span>Yaz sezonuna özel tüm araçlarda <strong>%15 indirim</strong> fırsatını kaçırma!</span>
            <span className="flex items-center gap-1 bg-white text-primary-700 px-2 py-0.5 rounded font-mono font-bold text-xs ml-2 cursor-pointer hover:scale-105 transition-transform" title="Kopyala">
               <Tag size={12} /> YAZ15
            </span>
         </div>
      </div>
      
      {/* Custom Calendar Component */}
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
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-white via-primary-50 to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="md:w-1/2 space-y-8 relative z-10">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
                Dakikalar içinde <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-purple-600">
                  araç kirala.
                </span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium max-w-lg">
                Telefonunla 7/24 araçların kilidini aç ve yola çık. Aracını paylaşarak gelir elde et.
              </p>

              {/* Search Form Card */}
              <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-xl dark:shadow-none dark:border dark:border-gray-700 space-y-4 transition-transform hover:scale-[1.01]">
                {/* Location Input */}
                <div className="relative group" ref={dropdownRef}>
                  <MapPin className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" size={18} />
                  <input
                    type="text"
                    placeholder="Şehir, ilçe veya semt (örn: Kadıköy)"
                    value={location}
                    onChange={(e) => {
                      setLocation(e.target.value);
                      setShowCityDropdown(true);
                    }}
                    onFocus={() => setShowCityDropdown(true)}
                    className={inputClass}
                    autoComplete="off"
                  />
                  
                  {showCityDropdown && (
                    <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl dark:shadow-none dark:border dark:border-gray-700 max-h-80 overflow-y-auto z-50 text-gray-800 dark:text-gray-200">
                      <button 
                        type="button"
                        onClick={handleCurrentLocation}
                        disabled={isLoadingLocation}
                        className="w-full flex items-center gap-3 p-4 hover:bg-primary-50 dark:hover:bg-gray-700 cursor-pointer text-primary-700 dark:text-primary-400 font-semibold border-b border-gray-100 dark:border-gray-700 text-left"
                      >
                        {isLoadingLocation ? <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-600 border-t-transparent"></div> : <Navigation size={18} />}
                        {isLoadingLocation ? "Konum Alınıyor..." : "Mevcut Konum (GPS)"}
                      </button>
                      <div className="p-2">
                         <div className="text-xs font-bold text-gray-400 uppercase px-2 py-1">Popüler Şehirler</div>
                         {PRIORITY_CITIES.filter(c => c.toLowerCase().includes(location.toLowerCase())).map(city => (
                           <div key={city} onClick={() => { setLocation(city); setShowCityDropdown(false); }} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer font-medium">
                             {city}
                           </div>
                         ))}
                      </div>
                      <div className="p-2 border-t border-gray-100 dark:border-gray-700">
                         <div className="text-xs font-bold text-gray-400 uppercase px-2 py-1">Tüm Şehirler</div>
                         {TURKEY_CITIES.filter(c => c.toLowerCase().includes(location.toLowerCase())).map(city => (
                           <div key={city} onClick={() => { setLocation(city); setShowCityDropdown(false); }} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer text-gray-600 dark:text-gray-300">
                             {city}
                           </div>
                         ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Single Date Trigger Input */}
                <div 
                  className="relative group h-14 cursor-pointer"
                  onClick={() => setIsCalendarOpen(true)}
                >
                    <div className="absolute inset-0 w-full h-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 group-hover:border-primary-500 rounded-xl flex items-center pl-3 pr-3 transition-colors">
                        <div className="flex items-center gap-3 w-full">
                            <div className="p-1.5 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 group-hover:text-primary-600 transition-colors">
                                <CalendarIcon size={18} />
                            </div>
                            <div className="flex flex-col flex-1">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide leading-none mb-0.5">Kiralama Tarihleri</span>
                                <span className={`text-sm font-semibold truncate ${pickup && dropoff ? 'text-gray-900 dark:text-white' : 'text-gray-400 font-normal'}`}>
                                    {pickup && dropoff ? (
                                        <div className="flex items-center gap-2">
                                            <span>{new Date(pickup).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                                            <span className="text-gray-300 dark:text-gray-600">→</span>
                                            <span>{new Date(dropoff).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}</span>
                                        </div>
                                    ) : 'Tarih Aralığı Seç'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold text-lg hover:bg-primary-700 transition-colors shadow-none border border-white/30 flex items-center justify-center gap-2"
                >
                  <Search size={22} />
                  Araç Bul
                </button>
              </form>
              
              <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                <Star className="text-yellow-400 fill-yellow-400" size={16} />
                <span>50.000+ Türk kullanıcısından 4.8/5 puan</span>
              </div>
               <div className="flex gap-4 pt-4">
                  <button className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/3/3c/Download_on_the_App_Store_Badge.svg" className="h-8" alt="App Store" />
                  </button>
                  <button className="bg-black dark:bg-white dark:text-black text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" className="h-8" alt="Google Play" />
                  </button>
               </div>
            </div>
            
            <div className="md:w-1/2 relative hidden md:block">
              <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary-200 dark:bg-primary-900 rounded-full blur-3xl opacity-30"></div>
              <img 
                src="https://images.unsplash.com/photo-1552519507-da8b1227ad4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                alt="Getaroag Uygulama Deneyimi" 
                className="relative z-10 rounded-3xl shadow-2xl dark:shadow-none dark:border dark:border-gray-700 border-8 border-white dark:border-gray-800 transform rotate-[-2deg] hover:rotate-0 transition-all duration-500 object-cover h-[600px] w-full"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
             <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Popüler Rotalar</h2>
             <p className="text-gray-500 dark:text-gray-400 mt-2">Türkiye'nin en popüler şehirlerinde araç bul</p>
          </div>
          <button onClick={() => navigate('/search')} className="text-primary-600 dark:text-primary-400 font-semibold flex items-center hover:underline">
            Tümünü gör <ArrowRight size={18} className="ml-1" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {priorityCitiesImages.map((city) => (
            <div 
              key={city.name} 
              onClick={() => {
                setLocation(city.name);
                navigate('/search', { state: { location: city.name } });
              }}
              className="group cursor-pointer relative rounded-2xl overflow-hidden aspect-[4/5] shadow-md hover:shadow-xl dark:shadow-none dark:border dark:border-gray-700 transition-all"
            >
              <img src={city.image} alt={city.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <h3 className="text-white text-xl font-bold">{city.name}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800 py-20 transition-colors duration-300">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Neden Getaroag?</h2>
            <p className="text-gray-600 dark:text-gray-400">Güvenlik, sigorta ve 7/24 destek sağlamak için %15 hizmet bedeli alıyoruz.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              { icon: Shield, title: "Tam Sigorta", description: "Her yolculuk iş ortaklarımız tarafından sigortalanır. Siz sürün, riskleri biz üstlenelim." },
              { icon: Users, title: "Onaylı Topluluk", description: "Hem sürücüler hem de araç sahipleri kimlik ve ehliyet kontrollerinden geçer." },
              { icon: Clock, title: "Anında Rezervasyon", description: "'Anında Rezervasyon' özellikli araçları filtreleyerek onay beklemeden yola çıkın." }
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md dark:shadow-none transition-shadow">
                <div className="w-14 h-14 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center text-primary-600 dark:text-primary-400 mb-6">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </PullToRefresh>
  );
};

export default HomePage;