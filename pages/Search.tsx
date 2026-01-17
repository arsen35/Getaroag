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
          // Sadece geçerli nesne olan verileri alıyoruz
          localCars = Array.isArray(parsed) ? parsed.filter(c => c && typeof c === 'object') : [];
        }
      } catch (e) { 
        console.error("Local cars loading error:", e); 
      }
      
      // MOCK_CARS ve localCars'ı birleştirirken null kontrolü yapıyoruz
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

  // GÜVENLİ FİLTRELEME: car.location veya city undefined olsa bile uygulama çökmez
  const filteredCars = allCars.filter(car => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    
    const cityName = car?.location?.city?.toLowerCase() || "";
    const brandName = car?.brand?.toLowerCase() || "";
    const modelName = car?.model?.toLowerCase() || "";
    
    return cityName.includes(q) || brandName.includes(q) || modelName.includes(q);
  });

  // GPS Harita Sistemi - Dokunulmadı, sadece varlık kontrolleri eklendi
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
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
        if (markerLayerRef.current) {
          markerLayerRef.current.clearLayers();
          const bounds = L.latLngBounds([]);
          let hasMarkers = false;
          
          filteredCars.forEach(car => {
            if (!car?.location?.lat || !car?.location?.lng) return;

            const icon = L.divIcon({
              className: 'custom-map-marker',
              html: `<div class="flex items-center bg-primary-600 text-white px-2.5 py-1 rounded-full text-xs font-black shadow-xl border border-white hover:scale-110 transition-transform cursor-pointer">
                      ₺${car.pricePerDay}
                    </div>`,
              iconSize: [60, 28],
              iconAnchor: [30, 14]
            });

            const marker = L.marker([car.location.lat, car.location.lng], { icon }).addTo(markerLayerRef.current);

            const popupDiv = document.createElement('div');
            popupDiv.className = 'car-popup-card cursor-pointer group';
            popupDiv.innerHTML = `
              <div class="relative w-full h-32 overflow-hidden">
                <img src="${car.image || ''}" class="w-full h-full object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-105" />
                <div class="absolute top-2 right-2 bg-white/95 px-1.5 py-0.5 rounded text-[8px] font-black tracking-widest text-primary-600 border border-primary-100 shadow-sm">
                  GETAROAG CONNECT
                </div>
              </div>
              <div class="p-3 bg-white dark:bg-gray-800 rounded-b-lg">
                <h4 class="font-bold text-sm text-gray-900 dark:text-white">${car.brand || ''} ${car.model || ''}</h4>
                <div class="flex items-center gap-2 mt-1">
                   <span class="flex items-center gap-0.5 text-[10px] text-primary-600 font-bold"><svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> ${car.rating || 5.0}</span>
                </div>
                <div class="mt-2 text-[10px] text-gray-500 font-bold">
                   ₺${car.pricePerDay} / gün
                </div>
              </div>
            `;
            popupDiv.onclick = () => navigate('/payment', { state: { car } });

            marker.bindPopup(popupDiv, { closeButton: false, offset: [0, -10], className: 'getaround-popup' });
            bounds.extend([car.location.lat, car.location.lng]);
            hasMarkers = true;
          });

          if (hasMarkers && mapInstanceRef.current && bounds.isValid()) {
            mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
          }
        }
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [filteredCars, viewMode, navigate]);

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors">
      <Navbar />

      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 z-20">
        <div className="container mx-auto flex flex-col md:flex-row gap-2">
          <div className="flex-1 relative flex items-center border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary-500/20">
            <div className="pl-3 text-primary-600"><SearchIcon size={18} /></div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Konum seçin..." 
              className="w-full p-2.5 outline-none bg-transparent text-sm font-medium" 
            />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="pr-3 text-gray-400"><X size={16}/></button>}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium bg-white dark:bg-gray-800">
              <Calendar size={16} className="mr-2 text-gray-400" /> Alış
            </div>
            <div className="flex-1 flex items-center border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm font-medium bg-white dark:bg-gray-800">
              <Calendar size={16} className="mr-2 text-gray-400" /> İade
            </div>
          </div>
        </div>
        
        <div className="container mx-auto mt-3 flex flex-wrap gap-2 overflow-x-auto no-scrollbar pb-1">
          <button className="flex items-center gap-1 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0">
            Araç Tipi <ChevronDown size={14}/>
          </button>
          <button className="flex items-center gap-1 border border-gray-300 dark:border-gray-700 rounded-full px-4 py-1.5 text-xs font-bold text-gray-700 dark:text-gray-300 shrink-0">
            Alış Yöntemi <ChevronDown size={14}/>
          </button>
          <button className="flex items-center gap-1 bg-primary-50 dark:bg-primary-900/30 border border-primary-200 dark:border-primary-800 rounded-full px-4 py-1.5 text-xs font-bold text-primary-700 dark:text-primary-300 shrink-0">
            <SlidersHorizontal size={14}/> Daha Fazla Filtre <span className="ml-1 bg-primary-600 text-white w-4 h-4 rounded-full flex items-center justify-center text-[10px]">1</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className={`w-full md:w-[450px] lg:w-[500px] h-full overflow-y-auto bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 flex-shrink-0 transition-transform ${viewMode === 'map' ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-bold text-gray-500">{filteredCars.length} sonuç bulundu</p>
          </div>

          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {filteredCars.map(car => (
              <div 
                key={car.id} 
                onClick={() => navigate('/payment', { state: { car } })}
                className="group flex flex-row p-4 gap-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer transition-colors relative"
              >
                <div className="w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                        {car.brand} {car.model} ({car.year})
                      </h3>
                      <button 
                        onClick={(e) => toggleFavorite(e, car.id)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Heart size={18} className={favorites.includes(Number(car.id)) ? "fill-red-500 text-red-500" : ""} />
                      </button>
                    </div>
                    
                    <div className="mt-1 flex items-center gap-1.5">
                       <span className="text-[9px] font-black tracking-widest text-primary-600 border border-primary-200 px-1.5 py-0.5 rounded bg-primary-50">GETAROAG CONNECT</span>
                    </div>

                    <div className="mt-2 flex items-center gap-3 text-xs font-medium text-gray-500">
                      <div className="flex items-center gap-0.5"><Star size={12} className="fill-primary-600 text-primary-600"/> {car.rating || 5.0} ({car.reviews || 0})</div>
                      <div>• {car.distance || '400m'}</div>
                    </div>
                  </div>

                  <div className="mt-auto flex justify-end">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">
                      ₺{car.pricePerDay} / gün
                    </p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="p-4 bg-green-50/30 dark:bg-green-900/5 flex items-center gap-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full text-green-600"><Info size={20}/></div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">Ücretsiz İptal</h4>
                  <p className="text-[10px] text-gray-500">Kiralama başlamadan 48 saat öncesine kadar ücretsiz iptal hakkı.</p>
                </div>
            </div>
          </div>
        </div>

        <div className={`flex-1 relative bg-gray-100 dark:bg-gray-900 ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <div ref={mapContainerRef} className="w-full h-full z-10" />
        </div>

        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[30] md:hidden">
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
              className="bg-gray-900 dark:bg-primary-600 text-white px-6 py-3 rounded-full font-black shadow-2xl flex items-center gap-2 text-sm active:scale-90 transition-all border-2 border-white dark:border-gray-800"
            >
              {viewMode === 'list' ? <><MapIcon size={18}/> Haritayı Göster</> : <><List size={18}/> Listeyi Göster</>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;