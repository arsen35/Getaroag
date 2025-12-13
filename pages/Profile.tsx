import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import Navbar from '../components/Navbar';
import { User, CreditCard, Car, Settings, PlusCircle, Edit, Trash2, LogOut, AlertTriangle, ArrowRightCircle, X, Save, Camera, Upload, Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../services/firebase';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('cars');
  
  // State for Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);
  
  // Custom Delete Confirmation Modal State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{isOpen: boolean, carId: number | string | null}>({
    isOpen: false,
    carId: null
  });
  
  const [editingCar, setEditingCar] = useState<any>(null);
  
  // Refs for file inputs
  const editCarFileRef = useRef<HTMLInputElement>(null);
  const profileImageFileRef = useRef<HTMLInputElement>(null);

  // Initial Mock Data
  const INITIAL_CARS = [
    { id: 101, name: 'Renault Clio (2021)', price: 900, pricePerDay: 900, earnings: 4500, status: 'Active', image: 'https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' },
    { id: 102, name: 'Fiat Egea (2022)', price: 1100, pricePerDay: 1100, earnings: 2200, status: 'Pending', image: 'https://images.unsplash.com/photo-1503376763036-066120622c74?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }
  ];

  // State for listed cars
  const [myCars, setMyCars] = useState<any[]>(() => {
    try {
      const savedCars = localStorage.getItem('myCars');
      return savedCars ? JSON.parse(savedCars) : INITIAL_CARS;
    } catch (e) {
      console.error("Error parsing cars", e);
      return INITIAL_CARS;
    }
  });

  // State for Wallet Balance
  const [balance, setBalance] = useState(5695.00);

  useEffect(() => {
    if (!checkAuthStatus()) {
      navigate('/login');
      return;
    }
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      try {
        setUserData(JSON.parse(profile));
      } catch (e) {
        setUserData(null);
      }
    } else {
      setUserData({
        name: 'Misafir',
        surname: 'Kullanıcı',
        phone: '0555 555 55 55',
        email: 'misafir@getaroag.com',
        iban: 'TR00 0000 0000 0000 0000 0000 00',
        profileImage: null
      });
    }
  }, [navigate]);

  // --- CAR ACTIONS ---
  const openEditCarModal = (car: any) => {
    const currentPrice = car.pricePerDay || car.price || 0;
    setEditingCar({ 
        ...car, 
        price: currentPrice, 
        imagePreview: car.image 
    }); 
    setIsEditCarOpen(true);
  };

  const handleEditCarImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      setEditingCar((prev: any) => ({ ...prev, imagePreview: previewUrl, imageFile: file }));
    }
  };

  const handleSaveCar = () => {
    if (!editingCar) return;
    
    const safePrice = Number(editingCar.price) || 0;
    const updatedCarData = {
          ...editingCar,
          price: safePrice,
          pricePerDay: safePrice, 
          pricePerHour: Math.round(safePrice / 24),
          image: editingCar.imagePreview || editingCar.image, 
          imagePreview: undefined,
          imageFile: undefined
    };

    const currentLS = localStorage.getItem('myCars');
    let currentList = currentLS ? JSON.parse(currentLS) : myCars;
    
    // Use String comparison for IDs to be safe
    const updatedList = currentList.map((c: any) => String(c.id) === String(editingCar.id) ? updatedCarData : c);
    
    localStorage.setItem('myCars', JSON.stringify(updatedList));
    setMyCars(updatedList);
    window.dispatchEvent(new Event('storage'));
    
    setIsEditCarOpen(false);
    setEditingCar(null);
  };

  // 1. Trigger the Delete Confirmation Modal
  const confirmDeleteCar = (e: React.MouseEvent | null, id: number | string) => {
    if (e) e.stopPropagation();
    setDeleteConfirmation({ isOpen: true, carId: id });
  };

  // 2. Actually execute the delete
  const executeDeleteCar = () => {
    const targetId = String(deleteConfirmation.carId);
    
    // Read fresh data
    const currentLS = localStorage.getItem('myCars');
    // If local storage is empty, fallback to initial cars (which might be in state)
    let currentList = currentLS ? JSON.parse(currentLS) : myCars;
    
    // Filter
    const newCars = currentList.filter((c: any) => String(c.id) !== targetId);

    // Write back
    localStorage.setItem('myCars', JSON.stringify(newCars));
    
    // Update State
    setMyCars(newCars);
    
    // Notify
    window.dispatchEvent(new Event('storage'));

    // Close Modals
    setDeleteConfirmation({ isOpen: false, carId: null });
    setIsEditCarOpen(false);
    setEditingCar(null);
  };

  // --- PROFILE ACTIONS ---
  const handleProfileImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const previewUrl = URL.createObjectURL(file);
      const updatedUser = { ...userData, profileImage: previewUrl };
      setUserData(updatedUser);
      localStorage.setItem('userProfile', JSON.stringify(updatedUser));
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(userData));
    setIsEditProfileOpen(false);
    alert("Profil bilgileri güncellendi.");
  };

  // --- WALLET & ACCOUNT ACTIONS ---
  const handleWithdraw = () => {
    if (balance <= 0) return alert("Çekilecek bakiye bulunmamaktadır.");
    const confirm = window.confirm(`₺${balance.toFixed(2)} tutarındaki bakiyeniz ${userData.iban} hesabına aktarılacaktır. Onaylıyor musunuz?`);
    if (confirm) {
        setTimeout(() => {
            setBalance(0);
            alert("Para çekme talebi alındı. 1-3 iş günü içinde hesabınıza geçecektir.");
        }, 500);
    }
  };

  const handleDeleteAccount = () => {
    if (balance > 0) {
        alert(`Hesabınızı silebilmek için önce cüzdanınızdaki ₺${balance.toFixed(2)} tutarını çekmelisiniz.`);
        setActiveTab('wallet');
        return;
    }
    if (myCars.length > 0) {
         alert(`Hesabınızı silebilmek için önce ${myCars.length} adet kayıtlı aracınızı silmelisiniz.`);
         setActiveTab('cars');
         return;
    }
    if (window.confirm("DİKKAT: Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?")) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('myCars');
        alert("Hesabınız başarıyla silindi.");
        navigate('/');
    }
  };

  if (!userData) return null;

  const modernInputGroup = "relative group";
  const modernLabel = "absolute -top-2.5 left-3 bg-white dark:bg-gray-800 px-1.5 text-xs font-semibold text-primary-600 transition-all group-focus-within:text-primary-700";
  const modernInput = "w-full px-4 py-3.5 bg-transparent border border-gray-300 dark:border-gray-600 rounded-xl outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-gray-900 dark:text-white transition-all font-medium placeholder-gray-400";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans pb-32 md:pb-0 relative">
      <Navbar />
      
      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmation.isOpen && createPortal(
        <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
           <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4 mx-auto text-red-600 dark:text-red-400">
                  <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">Aracı Sil?</h3>
              <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                 Bu aracı ilanlardan kaldırmak istediğinize emin misiniz? Bu işlem geri alınamaz.
              </p>
              <div className="flex gap-3">
                 <button 
                   onClick={() => setDeleteConfirmation({ isOpen: false, carId: null })}
                   className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                 >
                   Vazgeç
                 </button>
                 <button 
                   onClick={executeDeleteCar}
                   className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20"
                 >
                   Evet, Sil
                 </button>
              </div>
           </div>
        </div>,
        document.body
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditProfileOpen && createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profili Düzenle</h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="text-gray-500" size={20} /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
              <div className="flex justify-center">
                 <div className="relative group cursor-pointer" onClick={() => profileImageFileRef.current?.click()}>
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-lg">
                        {userData.profileImage ? (
                            <img src={userData.profileImage} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-400">
                                <User size={48} />
                            </div>
                        )}
                    </div>
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                    </div>
                 </div>
                 <input type="file" ref={profileImageFileRef} onChange={handleProfileImageUpload} className="hidden" accept="image/*" />
              </div>
              <div className="grid grid-cols-2 gap-5">
                <div className={modernInputGroup}>
                  <label className={modernLabel}>Ad</label>
                  <input value={userData.name} onChange={e => setUserData({...userData, name: e.target.value})} className={modernInput} />
                </div>
                <div className={modernInputGroup}>
                  <label className={modernLabel}>Soyad</label>
                  <input value={userData.surname} onChange={e => setUserData({...userData, surname: e.target.value})} className={modernInput} />
                </div>
              </div>
              <div className={modernInputGroup}>
                  <label className={modernLabel}>Telefon</label>
                  <input value={userData.phone} onChange={e => setUserData({...userData, phone: e.target.value})} className={modernInput} />
              </div>
               <div className={modernInputGroup}>
                  <label className={modernLabel}>E-posta</label>
                  <input value={userData.email} onChange={e => setUserData({...userData, email: e.target.value})} className={modernInput} />
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                <Save size={18} /> Kaydet
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* EDIT CAR MODAL */}
      {isEditCarOpen && editingCar && createPortal(
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto custom-scrollbar">
             <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center sticky top-0 bg-white dark:bg-gray-800 z-10">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Aracı Düzenle</h3>
              <button onClick={() => setIsEditCarOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"><X className="text-gray-500" size={20} /></button>
            </div>
            
            <div className="p-6 space-y-6">
               <div className="relative group cursor-pointer" onClick={() => editCarFileRef.current?.click()}>
                  <div className="aspect-video w-full rounded-2xl overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 group-hover:border-primary-500 transition-colors relative bg-gray-50 dark:bg-gray-700/50">
                      {editingCar.imagePreview ? (
                          <img src={editingCar.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400">
                              <Camera size={32} />
                              <span className="text-sm mt-2 font-medium">Fotoğraf Yok</span>
                          </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Upload className="text-white mb-2" size={24} />
                      </div>
                  </div>
                  <input type="file" ref={editCarFileRef} onChange={handleEditCarImageUpload} className="hidden" accept="image/*" />
               </div>

               <div className={modernInputGroup}>
                  <label className={modernLabel}>Araç Adı</label>
                  <input value={editingCar.name} onChange={e => setEditingCar({...editingCar, name: e.target.value})} className={modernInput} />
               </div>
               
               <div className={modernInputGroup}>
                  <label className={modernLabel}>Günlük Fiyat (₺)</label>
                  <input type="number" value={editingCar.price} onChange={e => setEditingCar({...editingCar, price: parseInt(e.target.value) || 0})} className={modernInput} />
               </div>

               <div>
                  <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider ml-1">İlan Durumu</label>
                  <div className="flex bg-gray-100 dark:bg-gray-700 p-1.5 rounded-xl">
                      <button type="button" onClick={() => setEditingCar({...editingCar, status: 'Active'})} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${editingCar.status === 'Active' ? 'bg-white dark:bg-gray-600 text-green-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Yayında {editingCar.status === 'Active' && <Check size={14} />}</button>
                      <button type="button" onClick={() => setEditingCar({...editingCar, status: 'Pending'})} className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${editingCar.status === 'Pending' ? 'bg-white dark:bg-gray-600 text-yellow-600 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}>Pasif / Beklemede {editingCar.status === 'Pending' && <Check size={14} />}</button>
                  </div>
               </div>

               <div className="flex gap-3 mt-4">
                  <button type="button" onClick={() => confirmDeleteCar(null, editingCar.id)} className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 py-3.5 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center gap-2 border border-red-200 dark:border-red-800">
                    <Trash2 size={18} /> Sil
                  </button>
                  <button type="button" onClick={handleSaveCar} className="flex-[2] bg-primary-600 text-white py-3.5 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                    <Save size={18} /> Kaydet
                  </button>
               </div>
            </div>
          </div>
        </div>,
        document.body
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700 border border-gray-100 text-center sticky top-24">
              <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-primary-50 dark:border-primary-900/30 relative group cursor-pointer" onClick={() => setIsEditProfileOpen(true)}>
                 {userData.profileImage ? (
                    <img src={userData.profileImage} alt={userData.name} className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400">
                        <User size={40} />
                    </div>
                 )}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Edit className="text-white" size={24} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{userData.name} {userData.surname}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Onaylı Üye</p>
              
              <div className="flex flex-col gap-2 text-left mt-6">
                <button onClick={() => setActiveTab('cars')} className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'cars' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}><Car size={20} /> Araçlarım</button>
                <button onClick={() => setActiveTab('wallet')} className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'wallet' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}><CreditCard size={20} /> Cüzdanım</button>
                <button onClick={() => setActiveTab('settings')} className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}><Settings size={20} /> Ayarlar</button>
              </div>
            </div>
          </div>

          <div className="md:w-3/4">
            {activeTab === 'cars' && (
              <div className="space-y-6 animate-in fade-in">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Araçlarım</h2>
                  <Link to="/list-car" className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors">
                    <PlusCircle size={18} /> Yeni Ekle
                  </Link>
                </div>

                {myCars.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <Car size={48} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500">Henüz listelenmiş bir aracınız yok.</p>
                    </div>
                ) : (
                    myCars.map(car => (
                    <div key={car.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700 border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex-1 flex gap-4">
                            <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0">
                                <img src={car.image} alt={car.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{car.name}</h3>
                                <div className="flex flex-wrap gap-3 text-sm mt-1 mb-2">
                                    <span className="text-gray-500 dark:text-gray-400">Günlük: ₺{car.price}</span>
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${car.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                    {car.status === 'Active' ? 'Yayında' : 'Onay Bekliyor'}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400">Toplam Kazanç: ₺{car.earnings || 0}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <button type="button" onClick={() => openEditCarModal(car)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium text-sm">
                            <Edit size={16} /> Düzenle
                        </button>
                        <button 
                            type="button" 
                            onClick={(e) => confirmDeleteCar(e, car.id)} 
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium text-sm"
                        >
                            <Trash2 size={16} /> Sil
                        </button>
                        </div>
                    </div>
                    ))
                )}
              </div>
            )}
            
             {activeTab === 'wallet' && (
              <div className="space-y-6 animate-in fade-in">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cüzdanım</h2>
                 <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                    <div className="relative z-10">
                        <p className="opacity-80 mb-1">Toplam Bakiye</p>
                        <h3 className="text-4xl font-bold">₺{balance.toFixed(2)}</h3>
                        <div className="mt-8 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                            <div>
                                <p className="text-xs opacity-70 mb-1">Kayıtlı IBAN</p>
                                <span className="font-mono text-sm sm:text-base opacity-95 block">{userData.iban}</span>
                            </div>
                            {balance > 0 ? (
                                <button onClick={handleWithdraw} className="bg-white text-primary-700 px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2">Parayı Hesaba Aktar <ArrowRightCircle size={18} /></button>
                            ) : ( <div className="text-sm bg-white/20 px-3 py-1 rounded">Bakiye boş</div> )}
                        </div>
                    </div>
                </div>
              </div>
            )}
            {activeTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Ayarlar</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => setIsEditProfileOpen(true)}>
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><User size={20} /></div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white">Profil Bilgileri</h4>
                                    <p className="text-sm text-gray-500">İsim, soyisim ve iletişim bilgilerinizi güncelleyin.</p>
                                </div>
                                <div className="text-primary-600 text-sm font-semibold">Düzenle</div>
                             </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 overflow-hidden mt-8">
                         <div className="p-6">
                            <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2"><AlertTriangle size={20} /> Tehlikeli Bölge</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Hesabınızı silmek geri alınamaz bir işlemdir. <br/><br/><span className="font-semibold text-gray-800 dark:text-gray-200">Not:</span> Bakiye 0 ve araç listesi boş olmalıdır.</p>
                            <button onClick={handleDeleteAccount} className="w-full sm:w-auto px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-900/30 flex items-center justify-center gap-2"><LogOut size={18} /> Hesabımı Kalıcı Olarak Sil</button>
                         </div>
                    </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;