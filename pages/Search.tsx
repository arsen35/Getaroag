import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { ChevronDown, SlidersHorizontal, Map as MapIcon, List, X, Star } from 'lucide-react';
import { Car } from '../types';

// Declare Leaflet global
declare const L: any;

// Updated Mock Data
const MOCK_CARS: Car[] = [
  {
    id: 1,
    name: 'Renault Clio',
    brand: 'Renault',
    model: 'Clio',
    year: 2021,
    type: 'Economy',
    fuelType: 'Petrol',
    transmission: 'Manual',
    pricePerHour: 150,
    pricePerDay: 900,
    rating: 4.8,
    reviews: 124,
    distance: '300m',
    features: ['Bluetooth', 'GPS'],
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: { city: 'Istanbul', lat: 41.0082, lng: 28.9784 }
  },
  {
    id: 2,
    name: 'Peugeot 3008',
    brand: 'Peugeot',
    model: '3008',
    year: 2023,
    type: 'SUV',
    fuelType: 'Diesel',
    transmission: 'Automatic',
    pricePerHour: 250,
    pricePerDay: 1800,
    rating: 4.9,
    reviews: 45,
    distance: '1.2km',
    features: ['Sunroof', 'Leather Seats'],
    image: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: { city: 'Istanbul', lat: 41.0150, lng: 28.9850 }
  },
  {
    id: 3,
    name: 'Fiat Egea',
    brand: 'Fiat',
    model: 'Egea',
    year: 2022,
    type: 'Compact',
    fuelType: 'Hybrid',
    transmission: 'Automatic',
    pricePerHour: 180,
    pricePerDay: 1100,
    rating: 4.6,
    reviews: 89,
    distance: '500m',
    features: ['Apple CarPlay'],
    image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: { city: 'Istanbul', lat: 41.0200, lng: 28.9600 }
  },
  {
    id: 4,
    name: 'BMW 3 Serisi',
    brand: 'BMW',
    model: '320i',
    year: 2023,
    type: 'Premium',
    fuelType: 'Petrol',
    transmission: 'Automatic',
    pricePerHour: 400,
    pricePerDay: 3200,
    rating: 5.0,
    reviews: 12,
    distance: '2km',
    features: ['Autopilot', 'Heated Seats'],
    image: 'https://images.unsplash.com/photo-1555215695-3004980adade?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
    location: { city: 'Istanbul', lat: 41.0300, lng: 28.9900 }
  }
];

const SearchPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Map Refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerLayerRef = useRef<any>(null); 
  
  // Filter States
  const [priceSort, setPriceSort] = useState<'asc' | 'desc' | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  // Filter Logic - Ensure this runs on every render
  const filteredCars = MOCK_CARS
    .filter(car => selectedType ? car.type === selectedType : true)
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

      filteredCars.forEach(car => {
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
        
        const popupContent = `
          <div class="font-sans">
             <div class="relative h-32 w-full mb-2 overflow-hidden rounded-t-xl">
               <img src="${car.image}" class="w-full h-full object-cover" />
             </div>
             <div class="px-3 pb-3">
               <h3 class="font-bold text-lg text-gray-900 dark:text-white">${car.brand} ${car.model}</h3>
               <div class="flex items-center text-sm text-gray-500 mb-2">
                 <span class="text-yellow-500 mr-1">★</span>${car.rating} • ${car.distance}
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
    }
  }, [viewMode, filteredCars]); 

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-900 overflow-hidden font-sans transition-colors duration-300">
      <Navbar />
      
      {/* Filter Bar */}
      <div className="border-b dark:border-gray-800 bg-white dark:bg-gray-900 py-3 px-4 flex items-center gap-3 overflow-x-auto whitespace-nowrap scrollbar-hide z-40">
        <div className="font-semibold text-gray-800 dark:text-gray-200 pr-4 border-r dark:border-gray-700 mr-2">
          {state?.location || "İstanbul"}
        </div>
        
        {/* Price Filter */}
        <div className="relative">
          <button 
            onClick={() => setActiveFilter(activeFilter === 'price' ? null : 'price')}
            className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-1 transition-colors 
              ${activeFilter === 'price' || priceSort 
                ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            {priceSort ? (priceSort === 'asc' ? 'Fiyat: Artan' : 'Fiyat: Azalan') : 'Fiyat'}
            <ChevronDown size={14}/>
          </button>
          {activeFilter === 'price' && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 shadow-xl dark:shadow-none dark:border dark:border-gray-700 rounded-xl border border-gray-100 p-2 min-w-[200px] z-50 animate-in slide-in-from-top-2">
              <button onClick={() => { setPriceSort('asc'); setActiveFilter(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg">En Düşük Fiyat</button>
              <button onClick={() => { setPriceSort('desc'); setActiveFilter(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg">En Yüksek Fiyat</button>
              {priceSort && <button onClick={() => { setPriceSort(null); setActiveFilter(null); }} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border-t dark:border-gray-700 mt-1">Sıfırla</button>}
            </div>
          )}
        </div>

        {/* Type Filter */}
        <div className="relative">
          <button 
             onClick={() => setActiveFilter(activeFilter === 'type' ? null : 'type')}
             className={`px-4 py-2 rounded-full border text-sm font-medium flex items-center gap-1 transition-colors 
               ${activeFilter === 'type' || selectedType 
                 ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                 : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'}`}
          >
            {selectedType || 'Araç Tipi'} <ChevronDown size={14}/>
          </button>
          {activeFilter === 'type' && (
            <div className="absolute top-full mt-2 left-0 bg-white dark:bg-gray-800 shadow-xl dark:shadow-none dark:border dark:border-gray-700 rounded-xl border border-gray-100 p-2 min-w-[200px] z-50 animate-in slide-in-from-top-2">
              {['Economy', 'SUV', 'Compact', 'Premium'].map(type => (
                <button 
                  key={type}
                  onClick={() => { setSelectedType(type); setActiveFilter(null); }} 
                  className={`w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-200 rounded-lg ${selectedType === type ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-bold' : ''}`}
                >
                  {type}
                </button>
              ))}
              {selectedType && <button onClick={() => { setSelectedType(null); setActiveFilter(null); }} className="w-full text-left px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border-t dark:border-gray-700 mt-1">Sıfırla</button>}
            </div>
          )}
        </div>

        <button className="px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center gap-2 ml-auto">
          <SlidersHorizontal size={16}/> Filtrele
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Results List - ADDED pb-32 to fix mobile view issue */}
        <div className={`w-full md:w-[50%] lg:w-[45%] h-full overflow-y-auto p-4 space-y-4 pb-32 ${viewMode === 'map' ? 'hidden md:block' : 'block'} dark:bg-gray-900`}>
           <div className="flex justify-between items-center md:hidden mb-4">
              <span className="font-bold text-gray-900 dark:text-white">{filteredCars.length} araç bulundu</span>
              <button 
                onClick={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
                className="flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium"
              >
                {viewMode === 'list' ? <><MapIcon size={18}/> Harita</> : <><List size={18}/> Liste</>}
              </button>
           </div>
           
           {filteredCars.length === 0 && (
             <div className="text-center py-20 text-gray-500 dark:text-gray-400">
               Bu kriterlere uygun araç bulunamadı.
             </div>
           )}

           {filteredCars.map(car => (
             <div key={car.id} onClick={() => handleBookNow(car)} className="group flex flex-col sm:flex-row bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow-none transition-all cursor-pointer overflow-hidden">
                <div className="sm:w-48 h-48 sm:h-auto relative">
                  <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2 bg-white/90 backdrop-blur text-xs font-bold px-2 py-1 rounded-md text-gray-800">
                    {car.distance} uzakta
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
                        ★ {car.rating}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-end border-t dark:border-gray-700 pt-3">
                     <div className="text-sm text-gray-500 dark:text-gray-400">
                        {car.type}
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