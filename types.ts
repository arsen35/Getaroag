
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

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
  carId?: string | number;
}

export interface Trip {
  id: number;
  carId: number | string;
  carName: string;
  carImage: string;
  pickupDate: string;
  returnDate: string;
  totalPrice: number;
  status: 'Yaklaşan' | 'Devam Ediyor' | 'Tamamlandı' | 'İptal Edildi';
  location: string;
  reviewed: boolean;
  renterReviewed?: boolean;
  checkInPhotos?: string[];
  checkOutPhotos?: string[];
  ownerId?: string;
}

export interface UserProfile {
  name: string;
  surname: string;
  email: string;
  phone: string;
  tcNo?: string;
  iban?: string;
  isVerified: boolean;
  isEmailVerified: boolean;
  driverRating: number;
  totalRents: number;
  avatar?: string;
  birthDate?: string;
  birthPlace?: string;
  licenseNumber?: string;
  licenseIssueDate?: string;
  licenseCountry?: string;
  address?: string;
  addressLine2?: string;
  postalCode?: string;
  bio?: string;
  language?: string;
}
