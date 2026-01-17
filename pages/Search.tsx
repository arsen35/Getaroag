import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChevronDown, Map as MapIcon, List, Heart, X, Search as SearchIcon, Calendar, Star, Filter } from 'lucide-react';
import { Car } from '../types';
import { MOCK_CARS } from '../data/mockData';

declare const google: any;

// Helper for Turkish Case-Insensitive comparison
const trNormalize = (str: string) => {
  return (str || "").toLocaleLowerCase('tr-TR').trim()
    .replace(/i/g, 'i')
    .replace(/ı/g, 'ı');
};

const SearchPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Filter States
  const [allCars, setAllCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState(state?.location || "");
  const [transmission, setTransmission] = useState(state?.transmission || "");
  const [fuelType, setFuelType] = useState(state?.fuelType || "");

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

  // Türkçe Karakter Duyarlı Akıllı Filtreleme
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
      
      return matchesSearch && matchesTransmission && matchesFuelType;
    });
  }, [allCars, searchQuery, transmission, fuelType]);

  // Google Maps Initialization & Marker Logic
  useEffect(() => {
    const initMap = async () => {
      if (!mapContainerRef.current) return;

      try {
        // Load libraries
        const { Map } = await google.maps.importLibrary("maps");
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

        if (!mapRef.current) {
          mapRef.current = new Map(mapContainerRef.current, {
            center: { lat: 41.0082, lng: 28.9784 },
            zoom: 12,
            mapId: 'GETAROAG_SEARCH_MAP', // Map ID for Advanced Markers
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: 'greedy',
            styles: [
              { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
            ]
          });
        }

        // Clear existing markers
        markersRef.current.forEach(m => m.setMap(null));
        markersRef.current = [];

        const bounds = new google.maps.LatLngBounds();
        let hasCars = false;

        filteredCars.forEach(car => {
          if (!car?.location?.lat || !car?.location?.lng) return;

          const priceTag = document.createElement('div');
          priceTag.className = 'price-marker';
          priceTag.textContent = `₺${car.pricePerDay}`;

          const marker = new AdvancedMarkerElement({
            map: mapRef.current,
            position: { lat: car.location.lat, lng: car.location.lng },
            content: priceTag,
            title: `${car.brand} ${car.model}`
          });

          // Custom InfoWindow
          const infoWindow = new google.maps.InfoWindow({
            content: `
              <div class="p-0 overflow-hidden w-[200px] bg-white dark:bg-gray-800 rounded-2xl">
                <img src="${car.image}" class="w-full h-24 object-cover" />
                <div class="p-3">
                  <h4 class="font-black text-xs uppercase text-gray-900 dark:text-white mb-1">${car.brand} ${car.model}</h4>
                  <div class="flex justify-between items-center text-[10px] font-bold">
                    <span class="text-primary-600">★ ${car.rating}</span>
                    <span class="text-gray-900 dark:text-white">₺${car.pricePerDay}/gün</span>
                  </div>
                </div>
              </div>
            `,
            disableAutoPan: false
          });

          marker.addListener('click', () => {
            infoWindow.open(mapRef.current, marker);
          });

          markersRef.current.push(marker);
          bounds.extend({ lat: car.location.lat, lng: car.location.lng });
          hasCars = true;
        });

        if (hasCars && filteredCars.length > 0) {
          mapRef.current.fitBounds(bounds, 80);
        }
      } catch (err) {
        console.error("Google Maps Load Error:", err);
      }
    };

    const timer = setTimeout(initMap, 200);
    return () => clearTimeout(timer);
  }, [filteredCars]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar />

      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-4 z-40 shadow-sm">
        <div className="container mx-auto flex flex-col lg:flex-row gap-3">
          <div className="flex-1 flex items-center border-2 border-gray-100 dark:border-gray-700 rounded-2xl px-5 bg-gray-50 dark:bg-gray-800 focus-within:ring-4 focus-within:ring-primary-500/10 focus-within:border-primary-500 transition-all group">
            <SearchIcon size={20} className="text-gray-400 mr-3 group-focus-within:text-primary-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Konum veya araç ara... (Örn: İzміr, İstanbul)" 
              className="w-full py-3.5 bg-transparent outline-none text-sm font-bold text-gray-900 dark:text-white" 
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full">
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
              className={`flex items-center gap-2 border-2 px-6 py-3.5 rounded-2xl text-sm font-black transition-all ${showMoreFilters || transmission || fuelType ? 'border-primary-600 text-primary-600 bg-primary-50' : 'border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <Filter size={18} /> 
              <span className="hidden sm:inline">Filtreler</span>
              {(transmission || fuelType) && <span className="flex h-2 w-2 rounded-full bg-primary-600"></span>}
            </button>
          </div>
        </div>

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
                <button onClick={() => { setTransmission(""); setFuelType(""); }} className="text-xs font-black text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-2">
                   <X size={14}/> Filtreleri Sıfırla
                </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
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
                      <Heart size={22} className={favorites.includes(Number(car.id)) ? "fill-red-500 text-red-500" : ""} />
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
          </div>
        </div>

        <div className={`flex-1 relative bg-gray-100 dark:bg-gray-900 ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 md:hidden">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="bg-gray-900 dark:bg-primary-600 text-white px-10 py-4 rounded-full font-black shadow-2xl flex items-center gap-3 text-sm border-2 border-white/20 active:scale-95 transition-all"
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