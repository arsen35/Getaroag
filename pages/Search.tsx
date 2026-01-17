import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChevronDown, SlidersHorizontal, Map as MapIcon, List, Heart, X, Search as SearchIcon, Calendar, Star, Filter } from 'lucide-react';
import { Car } from '../types';
import { MOCK_CARS } from '../data/mockData';

declare const L: any;

// Helper for Turkish Case-Insensitive comparison
const trNormalize = (str: string) => {
  return (str || "").toLocaleLowerCase('tr-TR').trim();
};

const SearchPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);

  // Filter States
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState(state?.location || "");
  const [transmission, setTransmission] = useState(state?.transmission || "");
  const [fuelType, setFuelType] = useState(state?.fuelType || "");
  const [ageGroup, setAgeGroup] = useState(state?.ageGroup || "");

  useEffect(() => {
    const savedFavs = localStorage.getItem('favorites');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) { setFavorites([]); }
    }

    const loadCars = () => {
      let localCars: Car[] = [];
      try {
        const stored = localStorage.getItem('myCars');
        if (stored) {
          const parsed = JSON.parse(stored);
          localCars = Array.isArray(parsed) ? parsed.filter(c => c && typeof c === 'object') : [];
        }
      } catch (e) { console.error(e); }
      const combined = [...MOCK_CARS, ...localCars].filter(car => car && car.id);
      setAllCars(combined);
    };
    loadCars();
  }, []);

  const toggleFavorite = (e: React.MouseEvent, carId: number | string) => {
    e.stopPropagation();
    const id = Number(carId);
    let newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  // CORE FIX: Türkçe Karakter Duyarlı Filtreleme
  const filteredCars = useMemo(() => {
    const q = trNormalize(searchQuery);
    
    return allCars.filter(car => {
      const cityName = trNormalize(car?.location?.city);
      const districtName = trNormalize(car?.location?.district);
      const brandName = trNormalize(car?.brand);
      const modelName = trNormalize(car?.model);
      
      const matchesSearch = !q || 
        cityName.includes(q) || 
        districtName.includes(q) || 
        brandName.includes(q) || 
        modelName.includes(q);
      
      const matchesTransmission = !transmission || car.transmission === transmission;
      const matchesFuelType = !fuelType || car.fuelType === fuelType;
      
      let matchesAge = true;
      if (ageGroup === 'new') matchesAge = car.year >= 2021;
      else if (ageGroup === 'mid') matchesAge = car.year >= 2017 && car.year <= 2020;
      else if (ageGroup === 'old') matchesAge = car.year < 2017;

      return matchesSearch && matchesTransmission && matchesFuelType && matchesAge;
    });
  }, [allCars, searchQuery, transmission, fuelType, ageGroup]);

  // Harita Senkronizasyonu ve Tasarımı
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current && typeof L !== 'undefined') {
      try {
        // Getaround tarzı daha temiz ve net bir harita için CartoDB Positron
        const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([41.0082, 28.9784], 12);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
          attribution: '&copy; CartoDB'
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);
        markerLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      } catch (e) { console.error("Map Error:", e); }
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current && markerLayerRef.current) {
        mapInstanceRef.current.invalidateSize();
        markerLayerRef.current.clearLayers();
        const bounds = L.latLngBounds([]);
        let hasMarkers = false;
        
        filteredCars.forEach(car => {
          if (!car?.location?.lat || !car?.location?.lng) return;

          // Daha Belirgin ve Net Marker (Fiyat Etiketi)
          const icon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div class="bg-[#A322DA] text-white px-3 py-1.5 rounded-full text-sm font-black shadow-[0_4px_15px_rgba(163,34,218,0.4)] border-2 border-white hover:scale-110 active:scale-95 transition-all transform-gpu">₺${car.pricePerDay}</div>`,
            iconSize: [65, 36],
            iconAnchor: [32, 18]
          });

          const marker = L.marker([car.location.lat, car.location.lng], { icon }).addTo(markerLayerRef.current);
          
          const popupDiv = document.createElement('div');
          popupDiv.className = 'car-popup-card cursor-pointer group w-[240px] rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-2xl';
          popupDiv.innerHTML = `
            <div class="h-32 overflow-hidden relative">
                <img src="${car.image}" class="w-full h-full object-cover transition-transform group-hover:scale-105" />
                <div class="absolute top-2 left-2 bg-primary-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow">GETAROAG CONNECT</div>
            </div>
            <div class="p-4">
                <h4 class="font-black text-sm text-gray-900 dark:text-white uppercase leading-tight mb-2">${car.brand} ${car.model}</h4>
                <div class="flex justify-between items-center">
                    <div class="flex items-center gap-1 text-[11px] font-bold text-gray-500">
                        <span class="text-yellow-400">★</span> ${car.rating} • ${car.transmission}
                    </div>
                    <span class="font-black text-sm text-gray-900 dark:text-white">₺${car.pricePerDay}<span class="text-[9px] font-bold text-gray-400">/gün</span></span>
                </div>
            </div>
          `;
          popupDiv.onclick = () => navigate('/payment', { state: { car } });

          marker.bindPopup(popupDiv, { 
            closeButton: false, 
            offset: [0, -12], 
            className: 'getaround-custom-popup',
            maxWidth: 240
          });
          
          bounds.extend([car.location.lat, car.location.lng]);
          hasMarkers = true;
        });

        if (hasMarkers && bounds.isValid() && filteredCars.length > 0) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [filteredCars, navigate]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors">
      <Navbar />

      {/* Modern Search & Filters Area */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-4 z-40 shadow-sm transition-colors">
        <div className="container mx-auto flex flex-col lg:flex-row gap-3">
          {/* Enhanced Search Input */}
          <div className="flex-1 flex items-center border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 bg-gray-50 dark:bg-gray-800 focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-primary-500 transition-all group">
            <SearchIcon size={20} className="text-gray-400 mr-3 group-focus-within:text-primary-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Nereye gideceksiniz? (Örn: İzміr, İstanbul...)" 
              className="w-full py-3.5 bg-transparent outline-none text-sm font-bold text-gray-900 dark:text-white placeholder:text-gray-400 placeholder:font-medium" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors">
                <X size={16} className="text-gray-400" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 lg:w-48 flex items-center gap-3 border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 py-3.5 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-500 hover:border-gray-200 transition-all cursor-pointer">
              <Calendar size={18} className="text-gray-400" /> Tarih Seç
            </div>
            
            <button 
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`flex items-center gap-2 border-2 px-6 py-3.5 rounded-2xl text-sm font-black transition-all transform active:scale-95 ${showMoreFilters || transmission || fuelType ? 'border-primary-600 text-primary-600 bg-primary-50' : 'border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <Filter size={18} /> 
              <span className="hidden sm:inline">Filtreler</span>
              {(transmission || fuelType) && <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>}
            </button>
          </div>
        </div>

        {/* Improved Dropdown Filters */}
        {showMoreFilters && (
          <div className="container mx-auto mt-4 p-8 bg-white dark:bg-gray-800 border-2 border-primary-50 dark:border-gray-700 rounded-[2.5rem] shadow-2xl animate-in slide-in-from-top-4 duration-300 flex flex-wrap gap-10">
            <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Şanzıman</label>
                <div className="flex gap-3">
                    {['Otomatik', 'Manuel'].map(v => (
                        <button key={v} onClick={() => setTransmission(transmission === v ? "" : v)} className={`px-6 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${transmission === v ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-gray-50 dark:bg-gray-700 border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-200'}`}>{v}</button>
                    ))}
                </div>
            </div>
            <div className="space-y-4">
                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Yakıt</label>
                <div className="flex flex-wrap gap-3">
                    {['Benzin', 'Dizel', 'Elektrik', 'Hibrit'].map(y => (
                        <button key={y} onClick={() => setFuelType(fuelType === y ? "" : y)} className={`px-6 py-2.5 rounded-xl text-xs font-black border-2 transition-all ${fuelType === y ? 'bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-gray-50 dark:bg-gray-700 border-transparent text-gray-600 dark:text-gray-400 hover:border-gray-200'}`}>{y}</button>
                    ))}
                </div>
            </div>
            <div className="flex items-end pb-1">
                <button onClick={() => { setTransmission(""); setFuelType(""); setAgeGroup(""); }} className="text-xs font-black text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-2 group">
                   <X size={14} className="group-hover:rotate-90 transition-transform"/> Filtreleri Sıfırla
                </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Results List View */}
        <div className={`w-full md:w-[480px] lg:w-[540px] h-full overflow-y-auto bg-white dark:bg-gray-950 border-r dark:border-gray-800 shrink-0 transition-all ${viewMode === 'map' ? 'hidden md:block' : 'block'}`}>
          <div className="p-6 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md z-10 border-b dark:border-gray-800">
            <h2 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.3em]">{filteredCars.length} ARAÇ BULUNDU</h2>
          </div>

          <div className="divide-y dark:divide-gray-800">
            {filteredCars.map(car => (
              <div key={car.id} onClick={() => navigate('/payment', { state: { car } })} className="group p-6 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 cursor-pointer transition-all flex gap-5">
                <div className="w-44 h-32 rounded-2xl overflow-hidden shadow-md border-2 border-white dark:border-gray-800 group-hover:shadow-xl transition-all flex-shrink-0">
                  <img src={car.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                </div>
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-black text-base text-gray-900 dark:text-white uppercase truncate pr-4">{car.brand} {car.model}</h3>
                    <button onClick={(e) => toggleFavorite(e, car.id)} className="text-gray-300 hover:text-red-500 transition-colors shrink-0">
                      <Heart size={22} className={favorites.includes(Number(car.id)) ? "fill-red-500 text-red-500" : "hover:scale-110 active:scale-90 transition-transform"} />
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                       <span className="text-[8px] font-black tracking-[0.2em] text-primary-600 border-2 border-primary-100 px-2 py-0.5 rounded-full bg-primary-50 uppercase">Connect</span>
                  </div>
                  <div className="mt-auto flex items-end justify-between">
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500">
                      <div className="flex items-center gap-1 text-yellow-500"><Star size={14} className="fill-current" /> {car.rating}</div>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span>{car.transmission}</span>
                    </div>
                    <div className="text-right">
                       <p className="text-lg font-black text-gray-900 dark:text-white leading-none">₺{car.pricePerDay}</p>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">/ GÜN</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredCars.length === 0 && (
              <div className="py-32 px-10 text-center animate-in fade-in duration-500">
                <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                  <SearchIcon size={32} />
                </div>
                <h3 className="font-black text-gray-900 dark:text-white text-lg mb-2 uppercase">Sonuç Bulunamadı</h3>
                <p className="text-gray-500 text-sm font-medium leading-relaxed">Aradığınız kriterlere uygun araç şu an bulunmuyor. Farklı bir konum veya filtre deneyebilirsiniz.</p>
                <button onClick={() => { setSearchQuery(""); setTransmission(""); setFuelType(""); }} className="mt-8 text-primary-600 font-black text-xs uppercase tracking-widest border-b-2 border-primary-100 hover:border-primary-600 transition-all pb-1">Tüm Araçları Listele</button>
              </div>
            )}
          </div>
        </div>

        {/* High Contrast Map View */}
        <div className={`flex-1 relative bg-gray-100 dark:bg-gray-900 ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 md:hidden">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="bg-gray-900 dark:bg-primary-600 text-white px-10 py-4 rounded-full font-black shadow-[0_10px_30px_rgba(0,0,0,0.3)] flex items-center gap-3 text-sm border-2 border-white/20 active:scale-95 transition-all"
            >
              {viewMode === 'list' ? <><MapIcon size={20}/> Haritaya Geç</> : <><List size={20}/> Listeyi Gör</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;