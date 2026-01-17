import { Car } from '../types';

export const MOCK_CARS: Car[] = [
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
    images: [
      'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&w=800&q=100'
    ],
    location: { city: 'İstanbul', district: 'Beşiktaş', neighborhood: 'Ortaköy', lat: 41.0473, lng: 29.0254 }
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
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80'
    ],
    location: { city: 'İstanbul', district: 'Kadıköy', neighborhood: 'Moda', lat: 40.9856, lng: 29.0234 }
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
    images: [
      'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=800&q=80'
    ],
    location: { city: 'İzmir', district: 'Konak', neighborhood: 'Alsancak', lat: 38.4371, lng: 27.1423 }
  },
  {
    id: 4,
    name: 'Audi A4',
    brand: 'Audi',
    model: 'A4',
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
    images: [
      'https://images.unsplash.com/photo-1555215695-3004980adade?auto=format&fit=crop&w=800&q=80'
    ],
    location: { city: 'Ankara', district: 'Çankaya', neighborhood: 'Kavaklıdere', lat: 39.9056, lng: 32.8612 }
  }
];