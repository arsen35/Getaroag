
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Map as MapIcon, List, Heart, Search as SearchIcon, Calendar, Star, Filter, ChevronRight, Bell, Clock } from 'lucide-react';
import { Car } from '../types';
import { MOCK_CARS } from '../data/mockData';
import CustomCalendar from '../components/CustomCalendar';

declare const L: any;

const trNormalize = (str: string) => {
  return (str || "").toLocaleLowerCase('tr-TR').trim();
};

const SearchPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);

  const [allCars, setAllCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState(state?.location || "");
  const [transmission, setTransmission] = useState(state?.transmission || "");
  const [fuelType, setFuelType] = useState(state?.fuelType || "");
  const [dates, setDates] = useState({
    start: state?.pickup || '',
    end: state?.dropoff || ''
  });

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
          localCars = Array.isArray(parsed) ? parsed : [];
        }
      } catch (e) { console.error(e); }
      const combined = [...MOCK_CARS, ...localCars].filter(car => car && car.id);
      setAllCars(combined);
    };
    loadCars();
    window.addEventListener('storage', loadCars);
    return () => window.removeEventListener('storage', loadCars);
  }, []);

  const filteredCars = useMemo(() => {
    const q = trNormalize(searchQuery);
    const busyData = JSON.parse(localStorage.getItem('busyDates') || '{}');

    return allCars.filter(car => {
      // ÖNEMLİ: Duraklatılmış araçları asla gösterme
      if ((car as any).status === 'Paused') return false;

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

      let isAvailable = true;
      if (dates.start && dates.end && busyData[car.id]) {
        const reqStart = new Date(dates.start);
        reqStart.setHours(0,0,0,0);
        const reqEnd = new Date(dates.end);
        reqEnd.setHours(0,0,0,0);

        isAvailable = !busyData[car.id].some((range: any) => {
            const rangeStart = new Date(range.start);
            rangeStart.setHours(0,0,0,0);
            const rangeEndWithBuffer = new Date(range.readyAfter);
            rangeEndWithBuffer.setHours(0,0,0,0);
            return (reqStart < rangeEndWithBuffer && reqEnd >= rangeStart);
        });
      }
      
      return matchesSearch && matchesTransmission && matchesFuelType && isAvailable;
    });
  }, [allCars, searchQuery, transmission, fuelType, dates]);

  useEffect(() => {
    if (viewMode === 'map' && mapInstance.current) {
        setTimeout(() => mapInstance.current.invalidateSize(), 200);
    }
  }, [viewMode]);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstance.current) {
      mapInstance.current = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([41.0082, 28.9784], 12);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(mapInstance.current);
      markersGroupRef.current = L.featureGroup().addTo(mapInstance.current);
    }

    markersGroupRef.current.clearLayers();
    const bounds = L.latLngBounds([]);

    filteredCars.forEach(car => {
      if (!car.location.lat || !car.location.lng) return;
      const priceIcon = L.divIcon({
        className: 'leaflet-marker-price-tag',
        html: `<div class="price-tag-content">₺${car.pricePerDay}</div>`,
        iconSize: [80, 40],
        iconAnchor: [40, 20]
      });
      const marker = L.marker([car.location.lat, car.location.lng], { icon: priceIcon });
      const popupId = `popup-btn-${car.id}`;
      const popupContent = `
        <div id="${popupId}" style="cursor: pointer; width: 100%; border-radius: 10px; overflow: hidden; background: white;">
          <img src="${car.image}" style="width: 100%; height: 130px; object-fit: cover; display: block;" />
          <div style="padding: 12px;">
            <div style="font-weight: 900; font-size: 14px; color: #0f172a; margin-bottom: 4px; text-transform: uppercase;">${car.brand} ${car.model}</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 11px; color: #f59e0b; font-weight: 900;">★ ${car.rating}</span>
              <span style="font-weight: 900; color: #A322DA; font-size: 16px;">₺${car.pricePerDay}</span>
            </div>
            <div style="margin-top: 10px; background: #8b5cf6; color: white; text-align: center; padding: 8px; border-radius: 10px; font-weight: 800; font-size: 12px; text-transform: uppercase;">Seç ve Kirala</div>
          </div>
        </div>
      `;
      marker.bindPopup(popupContent, { closeButton: false, offset: [0, -10], className: 'custom-car-popup', maxWidth: 260 });
      marker.on('popupopen', () => {
        const popupEl = document.getElementById(popupId);
        if (popupEl) {
          popupEl.onclick = (e) => {
            e.preventDefault();
            navigate('/payment', { state: { car, pickupDate: dates.start, returnDate: dates.end } });
          };
        }
      });
      markersGroupRef.current.addLayer(marker);
      bounds.extend([car.location.lat, car.location.lng]);
    });

    if (filteredCars.length > 0 && mapInstance.current && viewMode === 'map') {
        mapInstance.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [filteredCars, dates, navigate]);

  const toggleFavorite = (e: React.MouseEvent, carId: number | string) => {
    e.stopPropagation();
    const id = Number(carId);
    let newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
      <Navbar />
      <div className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-4 py-3 z-40 shrink-0">
        <div className="container mx-auto flex flex-col lg:flex-row gap-2">
          <div className="flex-1 flex items-center border border-gray-200 dark:border-gray-700 rounded-[10px] px-4 bg-gray-50 dark:bg-gray-800 transition-all">
            <SearchIcon size={18} className="text-gray-400 mr-2" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Konum, marka veya model ara..." className="w-full py-3 bg-transparent outline-none text-sm font-bold text-gray-900 dark:text-white" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setIsCalendarOpen(true)} className={`flex-1 lg:flex-none flex items-center justify-center gap-2 border px-4 py-3 rounded-[10px] text-sm font-bold transition-all ${dates.start ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}>
              <Calendar size={18}/> {dates.start ? `${new Date(dates.start).toLocaleDateString('tr-TR', {day:'numeric', month:'short'})}` : 'Tarih'}
            </button>
            <button onClick={() => setShowFilters(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 border px-4 py-3 rounded-[10px] text-sm font-bold border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
              <Filter size={18} /> Filtre
            </button>
          </div>
        </div>
      </div>
      <div className="flex-1 flex overflow-hidden relative">
        <div className={`w-full md:w-[400px] lg:w-[450px] h-full overflow-y-auto bg-white dark:bg-gray-950 border-r dark:border-gray-800 shrink-0 custom-scrollbar pb-32 transition-all duration-300 ${viewMode === 'map' ? 'hidden md:block' : 'block'}`}>
          <div className="p-4 sticky top-0 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md z-10 border-b dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{filteredCars.length} ARAÇ LİSTELENDİ</h2>
          </div>
          <div className="divide-y dark:divide-gray-800">
            {filteredCars.length === 0 ? (
              <div className="p-20 text-center">
                 <div className="w-16 h-16 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                    <SearchIcon size={32}/>
                 </div>
                 <h3 className="font-black text-xs text-gray-400 uppercase tracking-widest">Sonuç Bulunamadı</h3>
              </div>
            ) : (
              filteredCars.map(car => (
                <div key={car.id} onClick={() => navigate('/payment', { state: { car, pickupDate: dates.start, returnDate: dates.end } })} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 cursor-pointer flex gap-4 transition-all">
                  <div className="w-28 h-20 rounded-[10px] overflow-hidden shadow-sm flex-shrink-0">
                    <img src={car.image} className="w-full h-full object-cover" alt={car.brand} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-xs text-gray-900 dark:text-white uppercase truncate">{car.brand} {car.model}</h3>
                      <button onClick={(e) => toggleFavorite(e, car.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                        <Heart size={16} className={favorites.includes(Number(car.id)) ? "fill-red-500 text-red-500" : ""} />
                      </button>
                    </div>
                    <div className="mt-1 text-[9px] font-black text-primary-600 uppercase tracking-wider">{car.transmission} • {car.fuelType}</div>
                    <div className="mt-2 flex items-end justify-between">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-500"><Star size={10} className="text-yellow-400 fill-current" /> {car.rating}</div>
                      <div className="text-right">
                         <p className="text-sm font-black text-gray-900 dark:text-white leading-none">₺{car.pricePerDay}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        <div className={`flex-1 h-full relative bg-[#f5f5f5] ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}>
          <div ref={mapContainerRef} className="absolute inset-0 z-0" style={{ height: '100%', width: '100%' }} />
        </div>
        <div className="md:hidden fixed bottom-28 left-1/2 -translate-x-1/2 z-[5000]">
          <button onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')} className="bg-gray-900 dark:bg-primary-600 text-white px-8 py-3.5 rounded-full font-black shadow-2xl flex items-center gap-2 text-xs border-2 border-white/20">
            {viewMode === 'list' ? <><MapIcon size={16}/> Harita</> : <><List size={16}/> Liste</>}
          </button>
        </div>
      </div>
      {showFilters && (
        <div className="fixed inset-0 z-[10005]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
            <div className="absolute bottom-0 left-0 w-full bg-white dark:bg-gray-900 rounded-t-[10px] p-8 pb-12 animate-in slide-in-from-bottom duration-400">
                <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full mx-auto mb-6" />
                <h3 className="text-xl font-black text-gray-900 dark:text-white mb-6 uppercase tracking-widest">Filtreler</h3>
                <div className="space-y-6">
                  <div>
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-3 block">Vites</label>
                    <div className="flex gap-2">
                      {['Otomatik', 'Manuel'].map(v => (
                        <button key={v} onClick={() => setTransmission(transmission === v ? '' : v)} className={`flex-1 py-3.5 rounded-[10px] font-bold text-xs transition-all border-2 ${transmission === v ? 'border-primary-600 bg-primary-50 text-primary-700' : 'border-gray-50 dark:border-gray-800 text-gray-500'}`}>{v}</button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-10 flex gap-4">
                  <button onClick={() => { setTransmission(''); setFuelType(''); }} className="flex-1 py-4 text-gray-400 font-black text-xs uppercase tracking-widest">Temizle</button>
                  <button onClick={() => setShowFilters(false)} className="flex-[2] bg-primary-600 text-white py-4 rounded-[10px] font-black text-sm uppercase tracking-widest shadow-lg shadow-primary-600/20">Uygula</button>
                </div>
            </div>
        </div>
      )}
      <CustomCalendar isOpen={isCalendarOpen} onClose={() => setIsCalendarOpen(false)} startDate={dates.start} endDate={dates.end} onChange={(s, e) => setDates({start: s, end: e})} />
    </div>
  );
};

export default SearchPage;
