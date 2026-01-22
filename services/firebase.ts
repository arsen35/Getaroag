
// Bu dosya uygulamanın "Canlı" gibi davranması için bir Veri Servisi (MockDB) görevi görüyor.

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
    window.dispatchEvent(new Event('storage')); 
  },

  // Araçları Yönet (Local Storage'dan temiz okuma)
  getCars: () => {
    try {
      const cars = localStorage.getItem('myCars');
      const parsed = cars ? JSON.parse(cars) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  },
  
  saveCar: (car: any) => {
    const cars = dbService.getCars();
    // İlan varsayılan olarak 'Active' başlar
    const updated = [...cars, { ...car, status: car.status || 'Active' }];
    localStorage.setItem('myCars', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  // KESİN SİLME: ID tipini (String/Number) eşitleyerek hatayı önler
  deleteCar: (id: number | string) => {
    const cars = dbService.getCars();
    const updated = cars.filter((c: any) => String(c.id) !== String(id));
    localStorage.setItem('myCars', JSON.stringify(updated));
    
    // Uygulamanın geri kalanına (Navbar, Search vb.) verinin değiştiğini haber ver
    window.dispatchEvent(new Event('storage'));
    return updated;
  },

  updateCar: (id: number | string, data: any) => {
    const cars = dbService.getCars();
    const updated = cars.map((c: any) => String(c.id) === String(id) ? { ...c, ...data } : c);
    localStorage.setItem('myCars', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    return updated;
  },

  // İLAN DURAKLATMA / YAYINA ALMA (Toggle)
  toggleCarStatus: (id: number | string) => {
    const cars = dbService.getCars();
    const updated = cars.map((c: any) => {
      if (String(c.id) === String(id)) {
        const newStatus = (c.status === 'Active' || !c.status) ? 'Paused' : 'Active';
        return { ...c, status: newStatus };
      }
      return c;
    });
    localStorage.setItem('myCars', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    return updated;
  },

  // Diğer Servisler...
  getTrips: () => JSON.parse(localStorage.getItem('myTrips') || '[]'),
  getPaymentMethods: () => JSON.parse(localStorage.getItem('paymentMethods') || '[{"id":1,"last4":"4242","brand":"VISA","exp":"12/28","isDefault":true}]'),
  getNotifications: () => JSON.parse(localStorage.getItem('notifications') || '[]'),

  addNotification: (notif: any) => {
    const list = dbService.getNotifications();
    const updated = [notif, ...list].slice(0, 15);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  markNotificationRead: (id: number) => {
    const list = dbService.getNotifications();
    const updated = list.map((n: any) => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
};
