import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { MOCK_CARS } from '../data/mockData';
import { Car } from '../types';
import { Heart, Search, ArrowRight, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<number[]>([]);
  const [favoriteCars, setFavoriteCars] = useState<Car[]>([]);

  useEffect(() => {
    // 1. Get user listed cars from LocalStorage
    let localCars: Car[] = [];
    try {
        const stored = localStorage.getItem('myCars');
        if (stored) {
            localCars = JSON.parse(stored);
        }
    } catch (e) {
        console.error("Error loading local cars", e);
    }

    // 2. Combine with Mock Data
    const allCars = [...MOCK_CARS, ...localCars];

    // 3. Filter Favorites
    const savedFavs = localStorage.getItem('favorites');
    if (savedFavs) {
      try {
          const parsedFavs = JSON.parse(savedFavs);
          setFavorites(parsedFavs);
          
          // Find cars that match IDs in favorites
          const foundCars = allCars.filter(car => parsedFavs.includes(Number(car.id)));
          setFavoriteCars(foundCars);
      } catch (e) {
          console.error("Error parsing favorites", e);
      }
    }
  }, []);

  const removeFavorite = (e: React.MouseEvent, id: number | string) => {
    e.stopPropagation();
    const newFavs = favorites.filter(fId => fId !== Number(id));
    setFavorites(newFavs);
    
    // Re-filter favoriteCars from current list to remove the item immediately from UI
    setFavoriteCars(prev => prev.filter(car => Number(car.id) !== Number(id)));
    
    localStorage.setItem('favorites', JSON.stringify(newFavs));
  };

  const handleBookNow = (car: Car) => {
    navigate('/payment', { state: { car } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans pb-20 md:pb-0">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Favorilerim ({favorites.length})</h1>

        {favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <Heart size={40} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Henüz favori aracınız yok.</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-sm">Beğendiğiniz araçları kalp butonuna tıklayarak listenize ekleyebilir ve daha sonra kolayca ulaşabilirsiniz.</p>
            <Link to="/search" className="bg-primary-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center gap-2">
                <Search size={20} /> Araçları İncele
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favoriteCars.map(car => (
               <div key={car.id} onClick={() => handleBookNow(car)} className="group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md dark:shadow-none transition-all cursor-pointer overflow-hidden relative">
                 
                 <button 
                  onClick={(e) => removeFavorite(e, car.id)}
                  className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all active:scale-95"
                  title="Favorilerden Kaldır"
                >
                    <Heart size={20} className="fill-red-500 text-red-500" />
                </button>

                 <div className="h-48 overflow-hidden relative">
                    <img src={car.image} alt={car.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-2 py-1 rounded">
                       {car.location.city}
                    </div>
                 </div>

                 <div className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">{car.brand} {car.model}</h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{car.year} • {car.transmission} • {car.fuelType}</p>
                        </div>
                        <div className="flex items-center gap-1 text-sm font-bold text-gray-800 dark:text-gray-200">
                           <Star size={14} className="text-yellow-400 fill-yellow-400" /> {car.rating || 5.0}
                        </div>
                    </div>

                    <div className="flex justify-between items-end mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <div>
                             <p className="text-xs text-gray-400 mb-0.5">Günlük</p>
                             <p className="text-xl font-bold text-primary-600 dark:text-primary-400">₺{car.pricePerDay}</p>
                        </div>
                        <button className="bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-100 dark:hover:bg-primary-900/40 transition-colors flex items-center gap-1">
                            Kirala <ArrowRight size={16} />
                        </button>
                    </div>
                 </div>
               </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;