export interface Car {
  id: number | string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  fuelType: string;
  transmission: string;
  pricePerHour: number;
  pricePerDay: number;
  rating: number;
  reviews: number;
  distance: string;
  features: string[];
  image: string;
  images: string[];
  location: {
    city: string;
    district: string;
    neighborhood?: string;
    fullAddress?: string;
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