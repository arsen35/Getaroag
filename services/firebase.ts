
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

  // Araçları Yönet
  getCars: () => {
    try {
      const cars = localStorage.getItem('myCars');
      return cars ? JSON.parse(cars) : [];
    } catch (e) {
      return [];
    }
  },
  
  saveCar: (car: any) => {
    const cars = dbService.getCars();
    const updated = [...cars, car];
    localStorage.setItem('myCars', JSON.stringify(updated));
    
    dbService.addNotification({
      id: Date.now(),
      title: 'İLAN YAYINLANDI!',
      message: `${car.brand} ${car.model} başarıyla listelendi.`,
      time: 'Az önce',
      read: false,
      type: 'success'
    });

    window.dispatchEvent(new Event('storage'));
  },

  // KESİN SİLME MANTIĞI
  deleteCar: (id: number | string) => {
    const cars = dbService.getCars();
    // ID tipini garantiye almak için String kullanıyoruz
    const updated = cars.filter((c: any) => String(c.id) !== String(id));
    localStorage.setItem('myCars', JSON.stringify(updated));
    
    // Uygulamanın genelini uyar
    window.dispatchEvent(new Event('storage'));
    return true;
  },

  updateCar: (id: number | string, data: any) => {
    const cars = dbService.getCars();
    const updated = cars.map((c: any) => String(c.id) === String(id) ? { ...c, ...data } : c);
    localStorage.setItem('myCars', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  // İlan Durumunu Değiştir (Aktif/Dondurulmuş)
  toggleCarStatus: (id: number | string) => {
    const cars = dbService.getCars();
    const updated = cars.map((c: any) => {
      if (String(c.id) === String(id)) {
        // Active -> Paused, Paused -> Active
        const newStatus = c.status === 'Active' ? 'Paused' : 'Active';
        return { ...c, status: newStatus };
      }
      return c;
    });
    localStorage.setItem('myCars', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  // Kiralamaları (Yolculukları) Yönet
  getTrips: () => {
    return JSON.parse(localStorage.getItem('myTrips') || '[]');
  },

  // Ödeme Yöntemleri
  getPaymentMethods: () => {
    const methods = localStorage.getItem('paymentMethods');
    if (methods) return JSON.parse(methods);
    const defaultCard = [{ id: 1, last4: '4242', brand: 'VISA', exp: '12/28', isDefault: true }];
    localStorage.setItem('paymentMethods', JSON.stringify(defaultCard));
    return defaultCard;
  },

  // Bildirim Sistemi
  getNotifications: () => {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  },

  addNotification: (notif: any) => {
    const list = dbService.getNotifications();
    const updated = [notif, ...list].slice(0, 20);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  markNotificationRead: (id: number) => {
    const list = dbService.getNotifications();
    const updated = list.map((n: any) => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  markAllNotificationsRead: () => {
    const list = dbService.getNotifications();
    const updated = list.map((n: any) => ({ ...n, read: true }));
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
};
