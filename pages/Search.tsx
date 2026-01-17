import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChevronDown, SlidersHorizontal, Map as MapIcon, List, Heart, X, Search as SearchIcon, Calendar, Star, Info, Filter } from 'lucide-react';
import { Car } from '../types';
import { MOCK_CARS } from '../data/mockData';

declare const L: any;

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

  // Memoized Filter Logic - Core Fix
  const filteredCars = useMemo(() => {
    return allCars.filter(car => {
      const q = searchQuery.toLowerCase();
      const cityName = car?.location?.city?.toLowerCase() || "";
      const districtName = car?.location?.district?.toLowerCase() || "";
      const brandName = car?.brand?.toLowerCase() || "";
      const modelName = car?.model?.toLowerCase() || "";
      
      const matchesSearch = !searchQuery || 
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

  // Map Synchronization
  useEffect(() => {
    if (!mapInstanceRef.current && mapContainerRef.current && typeof L !== 'undefined') {
      try {
        const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([41.0082, 28.9784], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
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

          // Getaround Style Marker (Magenta Price Tag)
          const icon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div class="bg-[#A322DA] text-white px-3 py-1 rounded-full text-xs font-black shadow-lg border-2 border-white hover:scale-110 transition-transform">₺${car.pricePerDay}</div>`,
            iconSize: [60, 32],
            iconAnchor: [30, 16]
          });

          const marker = L.marker([car.location.lat, car.location.lng], { icon }).addTo(markerLayerRef.current);
          
          const popupDiv = document.createElement('div');
          popupDiv.className = 'car-popup-card cursor-pointer group w-[220px] rounded-xl overflow-hidden';
          popupDiv.innerHTML = `
            <div class="h-28 overflow-hidden"><img src="${car.image}" class="w-full h-full object-cover" /></div>
            <div class="p-3 bg-white dark:bg-gray-800">
                <h4 class="font-bold text-sm mb-1">${car.brand} ${car.model}</h4>
                <div class="flex justify-between items-center text-[10px] font-bold">
                    <span class="text-primary-600">★ ${car.rating}</span>
                    <span class="text-gray-900 dark:text-white">₺${car.pricePerDay}/gün</span>
                </div>
            </div>
          `;
          popupDiv.onclick = () => navigate('/payment', { state: { car } });

          marker.bindPopup(popupDiv, { closeButton: false, offset: [0, -10], className: 'getaround-custom-popup' });
          bounds.extend([car.location.lat, car.location.lng]);
          hasMarkers = true;
        });

        if (hasMarkers && bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [filteredCars, navigate]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950">
      <Navbar />

      {/* Getaround Style Sub-Header / Search Inputs */}
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-4 z-30 shadow-sm">
        <div className="container mx-auto flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center border dark:border-gray-700 rounded-xl px-4 bg-gray-50 dark:bg-gray-800 focus-within:ring-2 focus-within:ring-primary-500/20">
            <SearchIcon size={18} className="text-gray-400 mr-3" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Şehir, ilçe veya araç modeli..." 
              className="w-full py-3 bg-transparent outline-none text-sm font-semibold" 
            />
            {searchQuery && <X size={16} className="text-gray-400 cursor-pointer" onClick={() => setSearchQuery("")} />}
          </div>
          
          <div className="flex gap-2">
            <div className="flex-1 md:w-48 flex items-center gap-2 border dark:border-gray-700 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 text-xs font-bold text-gray-500">
              <Calendar size={16} /> Tarih Aralığı
            </div>
            <button 
              onClick={() => setShowMoreFilters(!showMoreFilters)}
              className={`flex items-center gap-2 border-2 px-6 py-3 rounded-xl text-xs font-black transition-all ${showMoreFilters || transmission || fuelType ? 'border-primary-600 text-primary-600 bg-primary-50' : 'border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <Filter size={16} /> Filtreler {(transmission || fuelType) && <span className="w-2 h-2 bg-primary-600 rounded-full animate-ping"></span>}
            </button>
          </div>
        </div>

        {/* More Filters Dropdown */}
        {showMoreFilters && (
          <div className="container mx-auto mt-4 p-6 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-[2rem] shadow-2xl animate-in slide-in-from-top-4 flex flex-wrap gap-8">
            <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Vites Tipi</label>
                <div className="flex gap-2">
                    {['Otomatik', 'Manuel'].map(v => (
                        <button key={v} onClick={() => setTransmission(transmission === v ? "" : v)} className={`px-4 py-2 rounded-full text-xs font-bold border ${transmission === v ? 'bg-primary-600 border-primary-600 text-white' : 'bg-gray-50 dark:bg-gray-700 border-transparent text-gray-600 dark:text-gray-400'}`}>{v}</button>
                    ))}
                </div>
            </div>
            <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Yakıt Tipi</label>
                <div className="flex gap-2">
                    {['Benzin', 'Dizel', 'Elektrik', 'Hibrit'].map(y => (
                        <button key={y} onClick={() => setFuelType(fuelType === y ? "" : y)} className={`px-4 py-2 rounded-full text-xs font-bold border ${fuelType === y ? 'bg-primary-600 border-primary-600 text-white' : 'bg-gray-50 dark:bg-gray-700 border-transparent text-gray-600 dark:text-gray-400'}`}>{y}</button>
                    ))}
                </div>
            </div>
            <div className="flex items-end">
                <button onClick={() => { setTransmission(""); setFuelType(""); setAgeGroup(""); }} className="text-xs font-bold text-gray-400 hover:text-red-500 underline">Filtreleri Temizle</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Results List */}
        <div className={`w-full md:w-[450px] lg:w-[500px] h-full overflow-y-auto bg-white dark:bg-gray-950 border-r dark:border-gray-800 shrink-0 transition-all ${viewMode === 'map' ? 'hidden md:block' : 'block'}`}>
          <div className="p-5 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-950 z-10 border-b dark:border-gray-800">
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{filteredCars.length} SONUÇ</p>
          </div>

          <div className="divide-y dark:divide-gray-800">
            {filteredCars.map(car => (
              <div key={car.id} onClick={() => navigate('/payment', { state: { car } })} className="group p-5 hover:bg-gray-50 dark:hover:bg-gray-900/40 cursor-pointer transition-all flex gap-4">
                <div className="w-40 h-28 rounded-2xl overflow-hidden shadow-sm border dark:border-gray-800">
                  <img src={car.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 flex flex-col">
                  <div className="flex justify-between">
                    <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase leading-tight">{car.brand} {car.model}</h3>
                    <button onClick={(e) => toggleFavorite(e, car.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                      <Heart size={20} className={favorites.includes(Number(car.id)) ? "fill-red-500 text-red-500" : ""} />
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-1.5">
                       <span className="text-[8px] font-black tracking-widest text-primary-600 border border-primary-100 px-1.5 py-0.5 rounded bg-primary-50 uppercase">Getaroag Connect</span>
                  </div>
                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-500">
                      <Star size={12} className="text-yellow-400 fill-current" /> {car.rating} 
                      <span className="mx-1">•</span>
                      {car.transmission}
                    </div>
                    <div className="text-right">
                       <p className="text-xs font-black text-gray-900 dark:text-white">₺{car.pricePerDay} <span className="text-gray-400 font-bold text-[9px]">/ GÜN</span></p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredCars.length === 0 && (
              <div className="p-20 text-center">
                <SearchIcon size={48} className="mx-auto text-gray-200 mb-4" />
                <p className="font-bold text-gray-500">Aradığınız kriterlere uygun araç bulunamadı.</p>
                <button onClick={() => { setSearchQuery(""); setTransmission(""); setFuelType(""); }} className="mt-4 text-primary-600 font-bold underline">Tüm Araçları Gör</button>
              </div>
            )}
          </div>
        </div>

        {/* Real Map View */}
        <div className={`flex-1 relative bg-gray-100 dark:bg-gray-900 ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 md:hidden">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="bg-gray-900 text-white px-8 py-4 rounded-full font-black shadow-2xl flex items-center gap-2 border-2 border-white"
            >
              {viewMode === 'list' ? <><MapIcon size={20}/> Harita</> : <><List size={20}/> Liste</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;