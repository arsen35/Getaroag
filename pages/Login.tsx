import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, Eye, EyeOff } from 'lucide-react';
import Navbar from '../components/Navbar';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo login simulation
    if (email && password) {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userEmail', email);
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 font-sans">
      <Navbar />
      
      <div className="flex flex-col justify-center items-center p-4 py-12">
        <Link to="/" className="flex items-center space-x-2 mb-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-primary-600 text-white p-2 rounded-lg">
            <Car size={32} />
          </div>
          <span className="text-3xl font-bold text-gray-900 dark:text-white">Getaroag</span>
        </Link>
        
        <div className="bg-white dark:bg-gray-800 w-full max-w-md p-8 rounded-3xl shadow-xl dark:shadow-none border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">Hoş Geldiniz</h2>
          
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">E-posta</label>
              <input 
                type="email" 
                required
                className="w-full p-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-gray-900 placeholder-gray-400 shadow-sm"
                placeholder="isim@ornek.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Şifre</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  className="w-full p-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-gray-900 placeholder-gray-400 shadow-sm pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <button className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-none border border-white/30">
              Giriş Yap
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            Hesabınız yok mu? <Link to="/signup" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline ml-1">Hemen Üye Ol</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;