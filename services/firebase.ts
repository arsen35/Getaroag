
// Bu dosya ileride gerçek Firebase API anahtarlarınla güncellenmek üzere hazırlandı.
// Şimdilik uygulamanın "Canlı" gibi davranması için bir Veri Servisi (MockDB) görevi görüyor.

export const checkAuthStatus = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

// Veri Yönetimi için Merkezi Servis
export const dbService = {
  // Profil Getir
  getProfile: () => {
    const data = localStorage.getItem('userProfile');
    return data ? JSON.parse(data) : null;
  },
  
  // Profil Güncelle
  updateProfile: (data: any) => {
    localStorage.setItem('userProfile', JSON.stringify(data));
    window.dispatchEvent(new Event('storage')); // Diğer bileşenlere (Navbar gibi) haber ver
  },

  // Araçları Yönet
  getCars: () => {
    return JSON.parse(localStorage.getItem('myCars') || '[]');
  },
  
  saveCar: (car: any) => {
    const cars = dbService.getCars();
    const updated = [...cars, car];
    localStorage.setItem('myCars', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  // Kiralamaları (Yolculukları) Yönet
  getTrips: () => {
    return JSON.parse(localStorage.getItem('myTrips') || '[]');
  },

  // Ödeme Yöntemlerini Yönet
  getPaymentMethods: () => {
    const methods = localStorage.getItem('paymentMethods');
    if (methods) return JSON.parse(methods);
    
    // Varsayılan bir kart (Demo için)
    const defaultCard = [{ id: 1, last4: '4242', brand: 'VISA', exp: '12/28', isDefault: true }];
    localStorage.setItem('paymentMethods', JSON.stringify(defaultCard));
    return defaultCard;
  },

  addPaymentMethod: (card: any) => {
    const methods = dbService.getPaymentMethods();
    localStorage.setItem('paymentMethods', JSON.stringify([...methods, card]));
    window.dispatchEvent(new Event('storage'));
  },

  // Bildirimleri Yönet
  getNotifications: () => {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  },

  addNotification: (notif: any) => {
    const list = dbService.getNotifications();
    localStorage.setItem('notifications', JSON.stringify([notif, ...list]));
    window.dispatchEvent(new Event('storage'));
  }
};
