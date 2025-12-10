import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { User, CreditCard, Car, Settings, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAuthStatus } from '../services/firebase';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('cars');

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
        iban: 'TR00 0000 0000 0000 0000 0000 00'
      });
    }
  }, [navigate]);

  const handleEdit = (id: number) => {
    alert(`Araç düzenleme modu açılıyor... (ID: ${id})`);
    // In real app, navigate to /edit-car/${id}
  };

  const handleDelete = (id: number) => {
    if(window.confirm("Bu aracı silmek istediğinize emin misiniz?")) {
      alert("Araç silindi.");
      // In real app, API call to delete
    }
  };

  const handleSettings = () => {
    const newName = prompt("İsim güncelleyin:", userData.name);
    if(newName) {
       setUserData({...userData, name: newName});
       // In real app, update DB
    }
  };

  // Mock listed cars
  const myCars = [
    { id: 101, name: 'Renault Clio (2021)', price: 900, earnings: 4500, status: 'Active' },
    { id: 102, name: 'Fiat Egea (2022)', price: 1100, earnings: 2200, status: 'Pending' }
  ];

  if (!userData) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700 border border-gray-100 text-center">
              <div className="w-24 h-24 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600 dark:text-primary-400">
                <User size={40} />
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
                  <CreditCard size={20} /> Cüzdanım & Ödemeler
                </button>
                <button 
                  onClick={handleSettings}
                  className={`p-3 rounded-xl flex items-center gap-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300`}
                >
                  <Settings size={20} /> Ayarlar
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:w-3/4">
            {activeTab === 'cars' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Araçlarım</h2>
                  <Link to="/list-car" className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl hover:bg-primary-700 transition-colors">
                    <PlusCircle size={18} /> Yeni Araç Ekle
                  </Link>
                </div>

                {myCars.map(car => (
                  <div key={car.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700 border border-gray-100 flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{car.name}</h3>
                      <div className="flex gap-3 text-sm mt-1">
                        <span className="text-gray-500 dark:text-gray-400">Günlük: ₺{car.price}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${car.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                          {car.status === 'Active' ? 'Yayında' : 'Onay Bekliyor'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => handleEdit(car.id)} className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors" title="Düzenle">
                         <Edit size={20} />
                       </button>
                       <button onClick={() => handleDelete(car.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Sil">
                         <Trash2 size={20} />
                       </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="space-y-6">
                 <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Cüzdanım</h2>
                 
                 <div className="bg-gradient-to-r from-primary-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                    <p className="opacity-80 mb-1">Toplam Kazanç (Komisyon Sonrası)</p>
                    <h3 className="text-4xl font-bold">₺5,695.00</h3>
                    <div className="mt-6 pt-6 border-t border-white/20 flex justify-between items-center">
                       <span className="font-mono opacity-90">{userData.iban}</span>
                       <span className="bg-white/20 px-3 py-1 rounded text-sm">Doğrulandı</span>
                    </div>
                 </div>

                 <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-gray-700 border border-gray-100">
                    <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Son Hareketler</h3>
                    <div className="space-y-4">
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
                      {/* More items... */}
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