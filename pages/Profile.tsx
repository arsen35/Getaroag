import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { User, CreditCard, Car, Settings, PlusCircle, Edit, Trash2, LogOut, AlertTriangle, ArrowRightCircle, X, Save, Phone, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../services/firebase';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('cars');
  
  // State for Edit Modals
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isEditCarOpen, setIsEditCarOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<any>(null);

  // State for listed cars
  const [myCars, setMyCars] = useState([
    { id: 101, name: 'Renault Clio (2021)', price: 900, earnings: 4500, status: 'Active' },
    { id: 102, name: 'Fiat Egea (2022)', price: 1100, earnings: 2200, status: 'Pending' }
  ]);

  // State for Wallet Balance
  const [balance, setBalance] = useState(5695.00);

  useEffect(() => {
    if (!checkAuthStatus()) {
      navigate('/login');
      return;
    }
    const profile = localStorage.getItem('userProfile');
    if (profile) {
      setUserData(JSON.parse(profile));
    } else {
      setUserData({
        name: 'Misafir',
        surname: 'Kullanıcı',
        phone: '0555 555 55 55',
        email: 'misafir@getaroag.com',
        iban: 'TR00 0000 0000 0000 0000 0000 00'
      });
    }
  }, [navigate]);

  // --- CAR ACTIONS ---
  const openEditCarModal = (car: any) => {
    setEditingCar({ ...car }); // Create a copy to edit
    setIsEditCarOpen(true);
  };

  const handleSaveCar = () => {
    if (!editingCar) return;
    
    setMyCars(prevCars => 
      prevCars.map(c => c.id === editingCar.id ? editingCar : c)
    );
    setIsEditCarOpen(false);
    setEditingCar(null);
    // In real app: API call here
  };

  const handleDeleteCar = (id: number) => {
    if(window.confirm("Bu aracı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      setMyCars(prevCars => prevCars.filter(c => c.id !== id));
      // In real app: API call here
    }
  };

  // --- PROFILE ACTIONS ---
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userProfile', JSON.stringify(userData));
    setIsEditProfileOpen(false);
    alert("Profil bilgileriniz güncellendi.");
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
    // Condition 1: Check Balance
    if (balance > 0) {
        alert(`Hesabınızı silebilmek için önce cüzdanınızdaki ₺${balance.toFixed(2)} tutarını çekmelisiniz.\n\nLütfen "Cüzdanım" sekmesinden paranızı banka hesabınıza aktarın.`);
        setActiveTab('wallet');
        return;
    }

    // Condition 2: Check Active Cars
    if (myCars.length > 0) {
         alert(`Hesabınızı silebilmek için önce ${myCars.length} adet kayıtlı aracınızı silmelisiniz.\n\nLütfen "Araçlarım" sekmesinden araçlarınızı kaldırın.`);
         setActiveTab('cars');
         return;
    }

    if (window.confirm("DİKKAT: Hesabınızı kalıcı olarak silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userProfile');
        alert("Hesabınız başarıyla silindi. Anasayfaya yönlendiriliyorsunuz.");
        navigate('/');
    }
  };

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans pb-24 md:pb-0 relative">
      <Navbar />
      
      {/* --- EDIT PROFILE MODAL --- */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Profili Düzenle</h3>
              <button onClick={() => setIsEditProfileOpen(false)}><X className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad</label>
                  <input 
                    value={userData.name} 
                    onChange={e => setUserData({...userData, name: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Soyad</label>
                  <input 
                    value={userData.surname} 
                    onChange={e => setUserData({...userData, surname: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
                </div>
              </div>
              <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon</label>
                  <input 
                    value={userData.phone} 
                    onChange={e => setUserData({...userData, phone: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
              </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-posta</label>
                  <input 
                    value={userData.email} 
                    onChange={e => setUserData({...userData, email: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
              </div>
              <button type="submit" className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 mt-4">
                <Save size={18} /> Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT CAR MODAL --- */}
      {isEditCarOpen && editingCar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl">
             <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Aracı Düzenle</h3>
              <button onClick={() => setIsEditCarOpen(false)}><X className="text-gray-500" /></button>
            </div>
            <div className="p-6 space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Araç Adı</label>
                  <input 
                    value={editingCar.name} 
                    onChange={e => setEditingCar({...editingCar, name: e.target.value})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Günlük Fiyat (₺)</label>
                  <input 
                    type="number"
                    value={editingCar.price} 
                    onChange={e => setEditingCar({...editingCar, price: parseInt(e.target.value)})}
                    className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Durum</label>
                  <select
                     value={editingCar.status}
                     onChange={e => setEditingCar({...editingCar, status: e.target.value})}
                     className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 outline-none focus:ring-2 focus:ring-primary-500 dark:text-white"
                  >
                    <option value="Active">Yayında</option>
                    <option value="Pending">Onay Bekliyor / Pasif</option>
                  </select>
               </div>
               <button onClick={handleSaveCar} className="w-full bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 mt-4">
                <Save size={18} /> Değişiklikleri Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700 border border-gray-100 text-center sticky top-24">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 dark:text-primary-400 relative group cursor-pointer" onClick={() => setIsEditProfileOpen(true)}>
                <User size={40} />
                <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Edit className="text-white" size={24} />
                </div>
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{userData.name} {userData.surname}</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Onaylı Üye</p>
              
              <div className="flex flex-col gap-2 text-left mt-6">
                <button 
                  onClick={() => setActiveTab('cars')}
                  className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'cars' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                  <Car size={20} /> Araçlarım
                </button>
                <button 
                  onClick={() => setActiveTab('wallet')}
                  className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'wallet' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                  <CreditCard size={20} /> Cüzdanım
                </button>
                <button 
                  onClick={() => setActiveTab('settings')}
                  className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 font-medium' : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300'}`}
                >
                  <Settings size={20} /> Ayarlar
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
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
                        <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{car.name}</h3>
                        <div className="flex flex-wrap gap-3 text-sm mt-1 mb-2">
                            <span className="text-gray-500 dark:text-gray-400">Günlük: ₺{car.price}</span>
                            <span className={`px-2 py-0.5 rounded text-xs font-bold ${car.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                            {car.status === 'Active' ? 'Yayında' : 'Onay Bekliyor'}
                            </span>
                        </div>
                        <p className="text-xs text-gray-400">Toplam Kazanç: ₺{car.earnings}</p>
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                        <button onClick={() => openEditCarModal(car)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium text-sm">
                            <Edit size={16} /> Düzenle
                        </button>
                        <button onClick={() => handleDeleteCar(car.id)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium text-sm">
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
                                <button 
                                    onClick={handleWithdraw}
                                    className="bg-white text-primary-700 px-6 py-2.5 rounded-xl font-bold shadow-md hover:bg-gray-50 active:scale-95 transition-all flex items-center gap-2"
                                >
                                    Parayı Hesaba Aktar <ArrowRightCircle size={18} />
                                </button>
                            ) : (
                                <div className="text-sm bg-white/20 px-3 py-1 rounded">Bakiye boş</div>
                            )}
                        </div>
                    </div>
                    {/* Decor */}
                    <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                 </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700 border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Son Hareketler</h3>
                    <div className="space-y-4">
                      {balance > 0 ? (
                          <div className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
                             <div>
                               <div className="font-medium text-gray-900 dark:text-white">Renault Clio Kiralama #8823</div>
                               <div className="text-xs text-gray-400">10 Eki 2024</div>
                             </div>
                             <div className="text-right">
                               <div className="font-bold text-green-600 dark:text-green-400">+₺765.00</div>
                               <div className="text-xs text-gray-400">₺900 - %15 Komisyon</div>
                             </div>
                          </div>
                      ) : (
                        <div className="text-center py-4 text-gray-400 text-sm">Son işlem bulunamadı.</div>
                      )}
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
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg">
                                    <User size={20} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white">Profil Bilgileri</h4>
                                    <p className="text-sm text-gray-500">İsim, soyisim ve iletişim bilgilerinizi güncelleyin.</p>
                                </div>
                                <div className="text-primary-600 text-sm font-semibold">Düzenle</div>
                             </div>
                        </div>
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer" onClick={() => setActiveTab('wallet')}>
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 rounded-lg">
                                    <CreditCard size={20} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Ödeme Yöntemleri</h4>
                                    <p className="text-sm text-gray-500">IBAN ve kredi kartı bilgilerinizi yönetin.</p>
                                </div>
                             </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-red-100 dark:border-red-900/30 overflow-hidden mt-8">
                         <div className="p-6">
                            <h4 className="font-bold text-red-600 mb-2 flex items-center gap-2">
                                <AlertTriangle size={20} /> Tehlikeli Bölge
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                                Hesabınızı silmek geri alınamaz bir işlemdir. Tüm verileriniz ve listelenen araçlarınız kalıcı olarak silinecektir.
                                <br/><br/>
                                <span className="font-semibold text-gray-800 dark:text-gray-200">Not:</span> Hesabınızı silebilmek için aktif bakiyenizin bulunmaması ve listeli aracınızın olmaması gerekmektedir.
                            </p>
                            
                            <button 
                                onClick={handleDeleteAccount}
                                className="w-full sm:w-auto px-6 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-bold rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors border border-red-200 dark:border-red-900/30 flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} /> Hesabımı Kalıcı Olarak Sil
                            </button>
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