
export const checkAuthStatus = (): boolean => {
  return localStorage.getItem('isLoggedIn') === 'true';
};

export const dbService = {
  getProfile: () => {
    const data = localStorage.getItem('userProfile');
    return data ? JSON.parse(data) : { name: "Kullanıcı", surname: "", isVerified: false, phone: "", email: "user@example.com" };
  },
  
  updateProfile: (data: any) => {
    localStorage.setItem('userProfile', JSON.stringify(data));
    window.dispatchEvent(new Event('storage')); 
  },

  getCars: () => {
    try {
      const cars = localStorage.getItem('myCars');
      const parsed = cars ? JSON.parse(cars) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) { return []; }
  },
  
  // KESİN SİLME FONKSİYONU
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
    return data ? JSON.parse(data) : [];
  },

  getPaymentMethods: () => {
    const data = localStorage.getItem('paymentMethods');
    return data ? JSON.parse(data) : [
      { id: 1, last4: "4242", brand: "VISA", exp: "12/28", isDefault: true }
    ];
  },

  addPaymentMethod: (card: any) => {
    const methods = dbService.getPaymentMethods();
    const updated = [...methods, { ...card, id: Date.now() }];
    localStorage.setItem('paymentMethods', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  getNotifications: () => {
    const data = localStorage.getItem('notifications');
    return data ? JSON.parse(data) : [
      { id: 1, title: "Hoş Geldiniz!", message: "Getaroag dünyasına ilk adımınızı attınız.", time: "Şimdi", read: false, type: "info" }
    ];
  },

  markNotificationRead: (id: number) => {
    const list = dbService.getNotifications();
    const updated = list.map((n: any) => n.id === id ? { ...n, read: true } : n);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  },

  addNotification: (notif: any) => {
    const list = dbService.getNotifications();
    const updated = [{ ...notif, id: Date.now(), read: false }, ...list].slice(0, 15);
    localStorage.setItem('notifications', JSON.stringify(updated));
    window.dispatchEvent(new Event('storage'));
  }
};
