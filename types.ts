export interface Car {
  id: number | string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: 'Economy' | 'SUV' | 'Compact' | 'Premium';
  fuelType: 'Petrol' | 'Diesel' | 'Electric' | 'Hybrid';
  transmission: 'Manual' | 'Automatic';
  pricePerHour: number;
  pricePerDay: number;
  rating: number;
  reviews: number;
  distance: string;
  features: string[];
  image: string;
  location: {
    city: string;
    lat: number;
    lng: number;
  };
}

export interface SearchFilters {
  location: string;
  pickupDate: string;
  returnDate: string;
  priceRange?: string;
  carType?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
}