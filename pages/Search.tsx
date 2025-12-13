import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChevronDown, SlidersHorizontal, Map as MapIcon, List, Heart, X, Check } from 'lucide-react';
import { Car } from '../types';
import { MOCK_CARS } from '../data/mockData';
import { CAR_BRANDS } from '../data/cars';

// Declare Leaflet global
declare const L: any;

const SearchPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Favorites State
  const [favorites, setFavorites] = useState<number[]>([]);

  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null); 
  const filterGroupRef = useRef<HTMLDivElement>(null);
  
  // Filter States
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  
  // Advanced Filter Modal State
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
      brands: [] as string[],
      transmissions: [] as string[],
      fuelTypes: [] as string[]
  });

  // Combined Cars State (Mock + Local Storage)
  const [allCars, setAllCars] = useState<Car[]>([]);

  // Load Cars and Favorites
  useEffect(() => {
    // 1. Load Favorites
    const savedFavs = localStorage.getItem('favorites');
    if (savedFavs) {
      setFavorites(JSON.parse(savedFavs));
    }

    // 2. Load and Merge Cars
    const loadCars = () => {
        let localCars: Car[] = [];
        try {
            const stored = localStorage.getItem('myCars');
            if (stored) {
                localCars = JSON.parse(stored);
            }
        } catch (e) {
            console.error("Error loading local cars", e);
        }
        // Combine static mock data with user listed cars
        setAllCars([...MOCK_CARS, ...localCars]);
    };

    loadCars();

    // Listen for storage events (in case user lists a car in another tab)
    window.addEventListener('storage', loadCars);
    return () => window.removeEventListener('storage', loadCars);
  }, []);

  // Toggle Favorite Handler
  const toggleFavorite = (e: React.MouseEvent, carId: number | string) => {
    e.stopPropagation(); // Prevent card click
    const id = Number(carId);
    let newFavs;
    if (favorites.includes(id)) {
      newFavs = favorites.filter(favId => favId !== id);
    } else {
      newFavs = [...favorites, id];
    }
    setFavorites(newFavs);
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  // Close filters when clicking outside (Now includes Advanced Filter Modal)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside simple dropdowns
      if (filterGroupRef.current && !filterGroupRef.current.contains(event.target as Node)) {
        setActiveFilter(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Helper function to normalize text for Turkish/English search compatibility
  // Converts "İstanbul" -> "istanbul" and "Istanbul" -> "istanbul" so they match
  const normalizeText = (text: string) => {
      if (!text) return "";
      return text
          .toLocaleLowerCase('tr-TR') // Handles İ -> i
          .replace(/ı/g, 'i')         // Handles I -> ı -> i (unifies undotted i)
          .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // Remove remaining accents
  };

  // Filter Logic - Use 'allCars' instead of MOCK_CARS
  const filteredCars = allCars
    .filter(car => {
        // Simple Type Filter
        if (selectedType && car.type !== selectedType) return false;
        
        // Advanced Filters
        if (advancedFilters.brands.length > 0 && !advancedFilters.brands.includes(car.brand)) return false;
        if (advancedFilters.transmissions.length > 0 && !advancedFilters.transmissions.includes(car.transmission)) return false;
        if (advancedFilters.fuelTypes.length > 0 && !advancedFilters.fuelTypes.includes(car.fuelType)) return false;

        // Location Filter (from Home page search)
        if (state?.location && car.location?.city) {
            const searchLoc = normalizeText(state.location);
            const carLoc = normalizeText(car.location.city);
            
            // Allow partial matches (e.g. searching "Kadıköy" might match "İstanbul" if logic was reversed, 
            // but here we check if the car's city contains the search term or vice versa for flexibility)
            if (!carLoc.includes(searchLoc) && !searchLoc.includes(carLoc)) {
                return false;
            }
        }

        return true;
    })
    .sort((a, b) => {
      if (priceSort === 'asc') return a.pricePerDay - b.pricePerDay;
      if (priceSort === 'desc') return b.pricePerDay - a.pricePerDay;
      return 0;
    });

  const handleBookNow = (car: Car) => {
    navigate('/payment', { 
      state: { 
        car, 
        pickupDate: state?.pickup, 
        returnDate: state?.dropoff 
      } 
    });
  };

  // Helper for Advanced Filters
  const toggleAdvancedOption = (category: 'brands' | 'transmissions' | 'fuelTypes', value: string) => {
      setAdvancedFilters(prev => {
          const list = prev[category];
          if (list.includes(value)) {
              return { ...prev, [category]: list.filter(item => item !== value) };
          } else {
              return { ...prev, [category]: [...list, value] };
          }
      });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    // Only initialize if we are in map mode or desktop view
    const isMobile = window.innerWidth < 768;
    if (viewMode === 'list' && isMobile) return;

    if (!mapInstanceRef.current && mapContainerRef.current && typeof L !== 'undefined') {
      const map = L.map(mapContainerRef.current).setView([41.0082, 28.9784], 12);
      
      // Use CartoDB Voyager for Navigation look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20
      }).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    // Ensure markers update whenever filteredCars changes
    if (markerLayerRef.current) {
      markerLayerRef.current.clearLayers();

      // Adjust map view to fit markers if there are results
      const bounds = L.latLngBounds([]);

      filteredCars.forEach(car => {
        if (!car.location || !car.location.lat || !car.location.lng) return;

        const priceHtml = `
          <div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-1 rounded-full shadow-lg font-bold text-sm border-2 border-primary-600 hover:scale-110 transition-transform whitespace-nowrap">
             ₺${car.pricePerDay}
          </div>
          <div class="w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-primary-600 border-r-[6px] border-r-transparent mx-auto"></div>
        `;

        const icon = L.divIcon({
          className: 'custom-div-icon',
          html: priceHtml,
          iconSize: [60, 40],
          iconAnchor: [30, 40],
          popupAnchor: [0, -40]
        });

        const marker = L.marker([car.location.lat, car.location.lng], { icon });
        bounds.extend([car.location.lat, car.location.lng]);
        
        const popupContent = `
          <div class="font-sans">
             <div class="relative h-32 w-full mb-2 overflow-hidden rounded-t-xl">
               <img src="${car.image}" class="w-full h-full object-cover" />
             </div>
             <div class="px-3 pb-3">
               <h3 class="font-bold text-lg text-gray-900 dark:text-white">${car.brand} ${car.model}</h3>
               <div class="flex items-center text-sm text-gray-500 mb-2">
                 <span class="text-yellow-500 mr-1">★</span>${car.rating || 5.0} • ${car.distance || '0km'}
               </div>
               <div class="flex justify-between items-end">
                 <div>
                   <div class="text-xs text-gray-400">Günlük</div>
                   <div class="font-bold text-lg text-primary-600">₺${car.pricePerDay}</div>
                 </div>
                 <button 
                    onclick="window.location.hash='#/payment?carId=${car.id}'" 
                    id="book-btn-${car.id}"
                    class="bg-primary-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-md"
                 >
                   Kirala
                 </button>
               </div>
             </div>
          </div>
        `;
        
        marker.bindPopup(popupContent);
        marker.on('popupopen', () => {
             const btn = document.getElementById(`book-btn-${car.id}`);
             if(btn) {
                 btn.onclick = (e) => {
                     e.preventDefault();
                     handleBookNow(car);
                 };
             }
        });

        markerLayerRef.current.addLayer(marker);
      });

      // Fit bounds if we have cars and map is ready
      if (filteredCars.length > 0 && mapInstanceRef.current && bounds.isValid()) {
         mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [viewMode, filteredCars]); 

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-300">
      <Navbar />
      
      {/* Filter Bar - Forced Z-Index 2000 to be above Leaflet, Flex Row to avoid stacking */}
      <div className="border-b dark:border-gray-800 bg-white dark:bg-gray-900 py-2 px-4 flex flex-row items-center justify-between gap-2 z-[2000] relative shadow-sm h-16">
        
        {/* Left Side: Filters - Single row, no wrapping issues */}
        <div className="flex items-center gap-2" ref={filterGroupRef}>
             
             {/* Price Filter Container */}
            <div className="relative">
              <button 
                onClick={() => setActiveFilter(activeFilter === 'price' ? null : 'price')}
                className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 transition-all shadow-sm whitespace-nowrap
                  ${activeFilter === 'price' || priceSort 
                    ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'}`}
              >
                {priceSort ? (priceSort === 'asc' ? 'Artan Fiyat' : 'Azalan Fiyat') : 'Fiyat'}
                <ChevronDown size={14} className={`transition-transform duration-200 ${activeFilter === 'price' ? 'rotate-180' : ''}`}/>
              </button>
              {activeFilter === 'price' && (
                <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 shadow-xl dark:shadow-black/40 dark:border dark:border-gray-700 rounded-2xl border border-gray-100 p-2 min-w-[200px] z-[2001] animate-in slide-in-from-top-2">
                  <button onClick={() => { setPriceSort('asc'); setActiveFilter(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 rounded-xl transition-colors">En Düşük Fiyat</button>
                  <button onClick={() => { setPriceSort('desc'); setActiveFilter(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 rounded-xl transition-colors">En Yüksek Fiyat</button>
                  {priceSort && <button onClick={() => { setPriceSort(null); setActiveFilter(null); }} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border-t dark:border-gray-700 mt-1">Sıfırla</button>}
                </div>
              )}
            </div>

            {/* Type Filter Container */}
            <div className="relative">
              <button 
                 onClick={() => setActiveFilter(activeFilter === 'type' ? null : 'type')}
                 className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-2 transition-all shadow-sm whitespace-nowrap
                   ${activeFilter === 'type' || selectedType 
                     ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                     : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'}`}
              >
                {selectedType || 'Araç Tipi'} <ChevronDown size={14} className={`transition-transform duration-200 ${activeFilter === 'type' ? 'rotate-180' : ''}`}/>
              </button>
              {activeFilter === 'type' && (
                <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 shadow-xl dark:shadow-black/40 dark:border dark:border-gray-700 rounded-2xl border border-gray-100 p-2 min-w-[200px] z-[2001] animate-in slide-in-from-top-2">
                  {['Economy', 'SUV', 'Compact', 'Premium', 'Sedan'].map(type => (
                    <button 
                      key={type}
                      onClick={() => { setSelectedType(type); setActiveFilter(null); }} 
                      className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 rounded-xl transition-colors ${selectedType === type ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-bold' : ''}`}
                    >
                      {type}
                    </button>
                  ))}
                  {selectedType && <button onClick={() => { setSelectedType(null); setActiveFilter(null); }} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl border-t dark:border-gray-700 mt-1">Sıfırla</button>}
                </div>
              )}
            </div>
        </div>

        {/* Right Side: View Toggle & Advanced Filter */}
        <div className="flex items-center gap-2">
             {/* Map/List Toggle Button */}
             <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-full border border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-full transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}
                  title="Liste Görünümü"
                >
                   <List size={18} strokeWidth={viewMode === 'list' ? 2.5 : 2} />
                </button>
                <button 
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-full transition-all flex items-center justify-center ${viewMode === 'map' ? 'bg-white dark:bg-gray-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 hover:bg-gray-200/50 dark:hover:bg-gray-700/50'}`}
                  title="Harita Görünümü"
                >
                   <MapIcon size={18} strokeWidth={viewMode === 'map' ? 2.5 : 2} />
                </button>
             </div>

             <button 
                onClick={() => setShowAdvancedFilter(true)}
                className="p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 transition-colors active:scale-95"
             >
                <SlidersHorizontal size={18}/> <span className="hidden md:inline text-sm font-medium">Filtrele</span>
             </button>
        </div>
      </div>

      {/* ADVANCED FILTER MODAL VIA PORTAL */}
      {showAdvancedFilter && createPortal(
        <div className="fixed inset-0 z-[3002] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in" onClick={() => setShowAdvancedFilter(false)}>
            <div className="bg-white dark:bg-gray-800 w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl p-6 h-[80vh] sm:h-auto overflow-y-auto animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Filtrele</h3>
                    <button onClick={() => setShowAdvancedFilter(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><X size={20} /></button>
                </div>

                {/* Brands */}
                <div className="mb-6">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Marka</h4>
                    <div className="flex flex-wrap gap-2">
                        {Object.keys(CAR_BRANDS).slice(0, 8).map(brand => (
                            <button 
                                key={brand}
                                onClick={() => toggleAdvancedOption('brands', brand)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                                    advancedFilters.brands.includes(brand)
                                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-400'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                                }`}
                            >
                                {brand}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Transmission */}
                <div className="mb-6">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Vites Tipi</h4>
                    <div className="flex gap-2">
                        {['Automatic', 'Manual', 'Yarı Otomatik'].map(trans => (
                             <button 
                                key={trans}
                                onClick={() => toggleAdvancedOption('transmissions', trans)}
                                className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                                    advancedFilters.transmissions.includes(trans)
                                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-400'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                                }`}
                            >
                                {trans}
                            </button>
                        ))}
                    </div>
                </div>

                 {/* Fuel */}
                <div className="mb-6">
                    <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3">Yakıt Tipi</h4>
                    <div className="flex flex-wrap gap-2">
                        {['Benzin', 'Dizel', 'Hibrit', 'Elektrik', 'Petrol', 'Diesel', 'Hybrid', 'Electric'].map(fuel => (
                             <button 
                                key={fuel}
                                onClick={() => toggleAdvancedOption('fuelTypes', fuel)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                                    advancedFilters.fuelTypes.includes(fuel)
                                    ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-500 text-primary-700 dark:text-primary-400'
                                    : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-gray-300'
                                }`}
                            >
                                {fuel}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 pt-4 border-t dark:border-gray-700">
                     <button onClick={() => setAdvancedFilters({ brands: [], transmissions: [], fuelTypes: [] })} className="flex-1 py-3 text-gray-600 dark:text-gray-400 font-bold hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors">Temizle</button>
                     <button onClick={() => setShowAdvancedFilter(false)} className="flex-[2] py-3 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors">Sonuçları Göster ({filteredCars.length})</button>
                </div>
            </div>
        </div>,
        document.body
      )}

      {/* Main Content Area - Z-0 ensures it stays behind the Z-2000 Filter Bar */}
      <div className="flex-1 flex overflow-hidden relative z-0">
        {/* Results List */}
        <div className={`w-full md:w-[50%] lg:w-[45%] h-full overflow-y-auto p-4 space-y-4 pb-32 ${viewMode === 'map' ? 'hidden md:block' : 'block'} dark:bg-gray-900 custom-scrollbar`}>
           <div className="flex justify-between items-center md:hidden mb-2">
              <span className="font-bold text-gray-900 dark:text-white">{filteredCars.length} araç bulundu</span>
           </div>
           
           {filteredCars.length === 0 && (
             <div className="text-center py-20 text-gray-500 dark:text-gray-400">
               Bu kriterlere uygun araç bulunamadı.
             </div>
           )}

           {filteredCars.map(car => (
             <div key={car.id} onClick={() => handleBookNow(car)} className="group flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow-none transition-all cursor-pointer overflow-hidden transform relative">
                
                {/* Favorite Button */}
                <button 
                  onClick={(e) => toggleFavorite(e, car.id)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all active:scale-95"
                >
                    <Heart size={20} className={favorites.includes(Number(car.id)) ? "fill-red-500 text-red-500" : "text-gray-500"} />
                </button>

                <div className="sm:w-48 h-48 sm:h-auto relative">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-gray-800">
                    {car.distance || '0km'} uzakta
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{car.brand} {car.model}</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{car.year} • {car.transmission} • {car.fuelType}</p>
                      </div>
                      <div className="flex items-center bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded text-sm font-bold text-gray-800 dark:text-gray-200">
                        ★ {car.rating || 5.0}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-end border-t dark:border-gray-700 pt-3">
                     <div className="text-sm text-gray-500 dark:text-gray-400">
                        {car.type || 'Sedan'}
                     </div>
                     <div className="text-right">
                        <span className="block text-2xl font-bold text-primary-700 dark:text-primary-400">₺{car.pricePerDay}</span>
                        <span className="text-xs text-gray-400">₺{car.pricePerHour}/saat</span>
                     </div>
                  </div>
                </div>
             </div>
           ))}
        </div>

        {/* Real Leaflet Map Container */}
        <div 
           id="map-container"
           className={`flex-1 bg-gray-100 dark:bg-gray-800 relative overflow-hidden ${viewMode === 'list' ? 'hidden md:block' : 'block'}`}
        >
           <div ref={mapContainerRef} className="w-full h-full z-10" />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;