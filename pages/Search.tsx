import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChevronDown, SlidersHorizontal, Map as MapIcon, List, Heart, X, Search as SearchIcon, Calendar, Star, Info } from 'lucide-react';
import { Car } from '../types';
import { MOCK_CARS } from '../data/mockData';

declare const L: any;

const SearchPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [favorites, setFavorites] = useState<number[]>([]);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null);

  const [allCars, setAllCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState(state?.location || "");
  
  // Ana sayfadan gelen ek filtreler
  const initialTransmission = state?.transmission || "";
  const initialFuelType = state?.fuelType || "";
  const initialAgeGroup = state?.ageGroup || "";

  useEffect(() => {
    const savedFavs = localStorage.getItem('favorites');
    if (savedFavs) {
      try {
        setFavorites(JSON.parse(savedFavs));
      } catch (e) {
        setFavorites([]);
      }
    }

    const loadCars = () => {
      let localCars: Car[] = [];
      try {
        const stored = localStorage.getItem('myCars');
        if (stored) {
          const parsed = JSON.parse(stored);
          localCars = Array.isArray(parsed) ? parsed.filter(c => c && typeof c === 'object') : [];
        }
      } catch (e) { 
        console.error("Local cars loading error:", e); 
      }
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

  const filteredCars = allCars.filter(car => {
    const q = searchQuery.toLowerCase();
    const cityName = car?.location?.city?.toLowerCase() || "";
    const brandName = car?.brand?.toLowerCase() || "";
    const modelName = car?.model?.toLowerCase() || "";
    
    const matchesSearch = !searchQuery || cityName.includes(q) || brandName.includes(q) || modelName.includes(q);
    
    const matchesTransmission = !initialTransmission || car.transmission === initialTransmission;
    const matchesFuelType = !initialFuelType || car.fuelType === initialFuelType;
    
    let matchesAge = true;
    if (initialAgeGroup === 'new') matchesAge = car.year >= 2021;
    else if (initialAgeGroup === 'mid') matchesAge = car.year >= 2017 && car.year <= 2020;
    else if (initialAgeGroup === 'old') matchesAge = car.year < 2017;

    return matchesSearch && matchesTransmission && matchesFuelType && matchesAge;
  });

  useEffect(() => {
    if ((viewMode === 'map' || window.innerWidth >= 768) && !mapInstanceRef.current && mapContainerRef.current && typeof L !== 'undefined') {
      try {
        const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([41.0082, 28.9784], 12);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png').addTo(map);
        L.control.zoom({ position: 'topright' }).addTo(map);
        markerLayerRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
      } catch (e) {
        console.error("Map init error:", e);
      }
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current && markerLayerRef.current) {
        mapInstanceRef.current.invalidateSize();
        markerLayerRef.current.clearLayers();
        const bounds = L.latLngBounds([]);
        let hasMarkers = false;
        
        filteredCars.forEach(car => {
          if (!car?.location?.lat || !car?.location?.lng) return;

          const icon = L.divIcon({
            className: 'custom-map-marker',
            html: `<div class="bg-primary-600 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-xl border-2 border-white transition-transform hover:scale-110">₺${car.pricePerDay}</div>`,
            iconSize: [60, 32],
            iconAnchor: [30, 16]
          });

          const marker = L.marker([car.location.lat, car.location.lng], { icon }).addTo(markerLayerRef.current);
          
          // Create rich popup element
          const popupContent = document.createElement('div');
          popupContent.className = 'car-popup-card cursor-pointer group w-[220px] overflow-hidden rounded-xl';
          popupContent.innerHTML = `
            <div class="relative h-28 overflow-hidden">
                <img src="${car.image}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                <div class="absolute top-2 left-2 bg-primary-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest">Connect</div>
            </div>
            <div class="p-3 bg-white dark:bg-gray-800">
                <div class="flex justify-between items-start mb-1">
                    <h4 class="font-black text-sm text-gray-900 dark:text-white uppercase leading-tight">${car.brand} ${car.model}</h4>
                </div>
                <div class="flex items-center gap-3 text-[10px] font-bold text-gray-500">
                    <div class="flex items-center gap-0.5 text-primary-600"><svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>${car.rating || 5.0}</div>
                    <div>${car.transmission}</div>
                    <div class="ml-auto text-gray-900 dark:text-white">₺${car.pricePerDay}/gün</div>
                </div>
            </div>
          `;

          // Handle popup click navigation
          popupContent.addEventListener('click', () => {
            navigate('/payment', { state: { car } });
          });

          marker.bindPopup(popupContent, { 
            closeButton: false, 
            offset: [0, -10],
            className: 'getaround-custom-popup'
          });

          bounds.extend([car.location.lat, car.location.lng]);
          hasMarkers = true;
        });

        if (hasMarkers && bounds.isValid()) {
          mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [filteredCars, viewMode, navigate]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors">
      <Navbar />

      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-20">
        <div className="container mx-auto flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20 transition-all">
            <div className="pl-3 text-primary-600"><SearchIcon size={18} /></div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Konum, marka veya model..." 
              className="w-full p-2.5 outline-none bg-transparent text-sm font-medium" 
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-xs font-bold bg-white dark:bg-gray-800">
              <Calendar size={14} className="mr-2 text-gray-400" /> Tarih Seçili
            </div>
          </div>
        </div>
        
        <div className="container mx-auto mt-3 flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
          {initialTransmission && <div className="bg-primary-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">{initialTransmission} <X size={14} className="cursor-pointer" onClick={() => navigate('.', { state: {...state, transmission: ''}})}/></div>}
          {initialFuelType && <div className="bg-primary-600 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2">{initialFuelType} <X size={14} className="cursor-pointer" onClick={() => navigate('.', { state: {...state, fuelType: ''}})}/></div>}
          <button className="flex items-center gap-1 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0">
            Daha Fazla Filtre <ChevronDown size={14}/>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`w-full md:w-[450px] lg:w-[500px] h-full overflow-y-auto bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 transition-transform ${viewMode === 'map' ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center sticky top-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm z-10">
            <p className="text-sm font-black text-gray-500 uppercase tracking-widest">{filteredCars.length} ARAÇ BULUNDU</p>
            {(initialTransmission || initialFuelType || initialAgeGroup) && <p className="text-[10px] font-black text-primary-600 animate-pulse">KRİTERLER UYGULANDI</p>}
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredCars.map(car => (
              <div key={car.id} onClick={() => navigate('/payment', { state: { car } })} className="group flex flex-row p-4 gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors">
                <div className="w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase">{car.brand} {car.model}</h3>
                      <button onClick={(e) => toggleFavorite(e, car.id)} className="text-gray-300 hover:text-red-500"><Heart size={18} className={favorites.includes(Number(car.id)) ? "fill-red-500 text-red-500" : ""} /></button>
                    </div>
                    <div className="mt-1 flex items-center gap-1.5">
                       <span className="text-[9px] font-black tracking-widest text-primary-600 border border-primary-200 px-1.5 py-0.5 rounded bg-primary-50 uppercase">Connect</span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-[10px] font-bold text-gray-500">
                      <div className="flex items-center gap-0.5 text-primary-600"><Star size={10} className="fill-current"/> {car.rating || 5.0}</div>
                      <div>{car.transmission}</div>
                      <div>{car.fuelType}</div>
                    </div>
                  </div>
                  <div className="mt-auto flex justify-end">
                    <p className="text-xs font-black text-gray-900 dark:text-white">₺{car.pricePerDay} <span className="text-gray-400 font-bold text-[10px]">/ gün</span></p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={`flex-1 relative bg-gray-100 dark:bg-gray-900 ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <div ref={mapContainerRef} className="w-full h-full z-10" />
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 md:hidden">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="bg-gray-900 dark:bg-primary-600 text-white px-6 py-3 rounded-full font-black shadow-2xl flex items-center gap-2 text-sm border-2 border-white dark:border-gray-800"
            >
              {viewMode === 'list' ? <><MapIcon size={18}/> Harita</> : <><List size={18}/> Liste</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;