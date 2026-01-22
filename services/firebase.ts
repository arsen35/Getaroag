
export const checkAuthStatus = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const dbService = {
  getProfile: () => {
    const data = localStorage.getItem('userProfile');
    return data ? JSON.parse(data) : { name: "Kullanıcı", surname: "", isVerified: false };
  },
  
  updateProfile: (data: any) => {
    localStorage.setItem('userProfile', JSON.stringify(data));
    window.dispatchEvent(new Event('storage')); 
  },

  getCars: () => {
    try {
      const cars = localStorage.getItem('myCars');
      return cars ? JSON.parse(cars) : [];
    } catch (e) { return []; }
  },
  
  saveCar: (car: any) => {
    const cars = dbService.getCars();
    const updated = [...cars, { ...car, status: 'Active' }];
    localStorage.setItem('myCars', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  // KESİN SİLME: ID tipini eşitle ve listeyi temizle
  deleteCar: (id: number | string) => {
    const cars = dbService.getCars();
    const updated = cars.filter((c: any) => String(c.id) !== String(id));
    localStorage.setItem('myCars', JSON.stringify(updated));
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

  toggleCarStatus: (id: number | string) => {
    const cars = dbService.getCars();
    const updated = cars.map((c: any) => {
      if (String(c.id) === String(id)) {
        return { ...c, status: c.status === 'Paused' ? 'Active' : 'Paused' };
      }
      return c;
    });
    localStorage.setItem('myCars', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
    return updated;
  },

  getTrips: () => {
    const data = localStorage.getItem('myTrips');
    return data ? JSON.parse(data) : [
      { id: 1, carName: 'Tesla Model Y', carImage: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=400', status: 'Tamamlandı', date: '12 Haz 2024', price: 3200 },
      { id: 2, carName: 'Fiat Egea', carImage: 'https://images.unsplash.com/photo-1503376763036-066120622c74?auto=format&fit=crop&w=400', status: 'Yaklaşan', date: '25 Tem 2024', price: 1100 }
    ];
  },

  getPaymentMethods: () => {
    const data = localStorage.getItem('paymentMethods');
    return data ? JSON.parse(data) : [
      { id: 1, last4: "4242", brand: "VISA", exp: "12/28", isDefault: true }
    ];
  },

  getNotifications: () => {
    const data = localStorage.getItem('notifications');
    return data ? JSON.parse(data) : [
      { id: 1, title: "Hoş Geldiniz!", message: "Getaroag ailesine katıldığınız için teşekkürler.", time: "2 gün önce", read: true, type: "info" },
      { id: 2, title: "Yeni Mesaj", message: "Murat Aras kiralama için soru sordu.", time: "1 saat önce", read: false, type: "message" }
    ];
  },

  addNotification: (notif: any) => {
    const list = dbService.getNotifications();
    const updated = [notif, ...list].slice(0, 15);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
};
