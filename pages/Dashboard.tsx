
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { TrendingUp, Users, DollarSign, Calendar, ArrowUpRight, BarChart3, Star, Clock } from 'lucide-react';
import { checkAuthStatus } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    activeBookings: 0,
    rating: 4.9,
    occupancy: 78
  });

  useEffect(() => {
    if (!checkAuthStatus()) navigate('/login');
    const myCars = JSON.parse(localStorage.getItem('myCars') || '[]');
    const myTrips = JSON.parse(localStorage.getItem('myTrips') || '[]');
    
    // Mock simulation for stats based on local data
    setStats({
        totalEarnings: myCars.length * 12500,
        activeBookings: myTrips.filter((t:any) => t.status === 'Yaklaşan' || t.status === 'Devam Ediyor').length,
        rating: 4.8,
        occupancy: 65 + Math.floor(Math.random() * 20)
    });
  }, [navigate]);

  const StatCard = ({ icon: Icon, label, value, trend, color }: any) => (
    <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] border dark:border-gray-800 shadow-sm relative overflow-hidden group">
        <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-[0.03] rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700`}></div>
        <div className="flex justify-between items-start mb-6">
            <div className={`p-4 rounded-2xl ${color.replace('bg-', 'bg-').replace('-500', '-50')} dark:${color.replace('-500', '-900/20')} ${color.replace('bg-', 'text-')}`}>
                <Icon size={24} />
            </div>
            {trend && <div className="flex items-center gap-1 text-green-500 font-black text-xs bg-green-50 px-2 py-1 rounded-lg">+{trend}% <ArrowUpRight size={14}/></div>}
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{label}</p>
        <h3 className="text-3xl font-black text-gray-900 dark:text-white leading-none">{value}</h3>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pb-24">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex justify-between items-end mb-12">
            <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">İlan Paneli</h1>
                <p className="text-gray-500 font-bold mt-2">Araçlarınızın performansını anlık olarak izleyin.</p>
            </div>
            <div className="hidden md:flex gap-2">
                <button className="bg-white dark:bg-gray-800 border dark:border-gray-700 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500">7 GÜN</button>
                <button className="bg-primary-600 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">30 GÜN</button>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <StatCard icon={DollarSign} label="Toplam Kazanç" value={`₺${stats.totalEarnings.toLocaleString('tr-TR')}`} trend="12" color="bg-green-500" />
            <StatCard icon={Calendar} label="Aktif Kiralama" value={stats.activeBookings} trend="5" color="bg-blue-500" />
            <StatCard icon={Star} label="Ortalama Puan" value={stats.rating} color="bg-yellow-500" />
            <StatCard icon={TrendingUp} label="Doluluk Oranı" value={`%${stats.occupancy}`} trend="3" color="bg-purple-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-[2.5rem] border dark:border-gray-800 p-10">
                <div className="flex justify-between items-center mb-10">
                    <h3 className="font-black uppercase tracking-widest text-gray-900 dark:text-white flex items-center gap-2"><BarChart3 size={20} className="text-primary-600"/> Kazanç Grafiği</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase"><span className="w-2 h-2 bg-primary-600 rounded-full"></span> Bu Ay</div>
                        <div className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase"><span className="w-2 h-2 bg-gray-200 rounded-full"></span> Geçen Ay</div>
                    </div>
                </div>
                {/* Simulated Chart with SVG */}
                <div className="h-64 flex items-end justify-between gap-4 px-4">
                    {[40, 65, 45, 90, 65, 80, 50, 70, 85, 95, 60, 80].map((h, i) => (
                        <div key={i} className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-t-xl relative group">
                            <div className="absolute bottom-0 left-0 w-full bg-primary-500/20 rounded-t-xl transition-all group-hover:bg-primary-500/40" style={{ height: `${h}%` }}></div>
                            <div className="absolute bottom-0 left-0 w-full bg-primary-600 rounded-t-xl transition-all group-hover:scale-y-110 origin-bottom" style={{ height: `${h * 0.7}%` }}></div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-6 px-4">
                    {['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'].map(m => (
                        <span key={m} className="text-[9px] font-black text-gray-400 uppercase">{m}</span>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border dark:border-gray-800 p-10">
                <h3 className="font-black uppercase tracking-widest text-gray-900 dark:text-white mb-8 flex items-center gap-2"><Clock size={20} className="text-primary-600"/> Bekleyen Onaylar</h3>
                <div className="space-y-6">
                    {[
                        { user: 'Ahmet Y.', car: 'Tesla Model Y', date: 'Yarın, 10:00' },
                        { user: 'Buse T.', car: 'Fiat Egea', date: '22 Tem, 09:30' },
                        { user: 'Can M.', car: 'BMW 320i', date: '25 Tem, 14:00' }
                    ].map((book, i) => (
                        <div key={i} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-gray-100">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 text-primary-600 rounded-full flex items-center justify-center font-black">{book.user[0]}</div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-gray-900 dark:text-white uppercase">{book.user}</p>
                                <p className="text-[10px] text-gray-400 font-bold">{book.car}</p>
                            </div>
                            <p className="text-[9px] font-black text-primary-600 uppercase bg-primary-50 px-2 py-1 rounded-lg">{book.date}</p>
                        </div>
                    ))}
                </div>
                <button onClick={() => navigate('/profile')} className="w-full mt-8 py-4 bg-gray-900 dark:bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">Tümünü Yönet</button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
