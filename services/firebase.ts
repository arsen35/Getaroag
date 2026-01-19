
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
    return JSON.parse(localStorage.getItem('myCars') || '[]');
  },
  
  saveCar: (car: any) => {
    const cars = dbService.getCars();
    const updated = [...cars, car];
    localStorage.setItem('myCars', JSON.stringify(updated));
    
    // Araç listelendiğinde bildirim ekle
    dbService.addNotification({
      id: Date.now(),
      title: 'İLAN YAYINLANDI!',
      message: `${car.brand} ${car.model} başarıyla listelendi. Artık kiracılar aracınızı görebilir.`,
      time: 'Az önce',
      read: false,
      type: 'success'
    });

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

  // BİLDİRİM SİSTEMİ ÇEKİRDEĞİ
  getNotifications: () => {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  },

  addNotification: (notif: any) => {
    const list = dbService.getNotifications();
    const updated = [notif, ...list].slice(0, 20); // Son 20 bildirimi tut
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage')); // UI'ları tetikle
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
