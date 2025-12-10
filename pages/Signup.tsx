import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Car, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { validateTC, formatIBAN } from '../utils/validation';
import Navbar from '../components/Navbar';

const SignupPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    tcNo: '',
    email: '',
    password: '',
    iban: 'TR'
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'iban') {
      setFormData(prev => ({ ...prev, [name]: formatIBAN(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateTC(formData.tcNo)) {
      setError('Geçersiz TC Kimlik Numarası. Lütfen kontrol ediniz.');
      return;
    }

    if (formData.iban.replace(/\s/g, '').length !== 26) {
      setError('IBAN eksik veya hatalı görünüyor. TR ile başlayan 26 hane olmalıdır.');
      return;
    }

    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userProfile', JSON.stringify(formData));
    alert('Kayıt başarılı! Profilinize yönlendiriliyorsunuz.');
    navigate('/profile');
  };

  // Standardized input style: Always white bg, dark text, readable border
  const inputClass = "w-full p-3.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none text-gray-900 placeholder-gray-400 shadow-sm";

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
        
        <div className="bg-white dark:bg-gray-800 w-full max-w-2xl p-8 rounded-3xl shadow-xl dark:shadow-none border border-gray-100 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">Aramıza Katılın</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-8">Araç kiralamak veya kiraya vermek için hesap oluşturun.</p>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 mb-6 text-sm font-medium">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ad</label>
                <input name="name" type="text" required onChange={handleInputChange} className={inputClass} placeholder="Adınız" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Soyad</label>
                <input name="surname" type="text" required onChange={handleInputChange} className={inputClass} placeholder="Soyadınız" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Telefon Numarası</label>
                 <input name="phone" type="tel" placeholder="05XX XXX XX XX" required onChange={handleInputChange} className={inputClass} />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">TC Kimlik No</label>
                 <input name="tcNo" type="text" maxLength={11} placeholder="11 haneli TC Kimlik No" required onChange={handleInputChange} className={inputClass} />
              </div>
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">IBAN (Ödemeler için)</label>
               <input name="iban" type="text" value={formData.iban} onChange={handleInputChange} className={`${inputClass} font-mono uppercase`} placeholder="TR00 0000 ..." />
               <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Araç kiraladığınızda ödemeler bu hesaba %15 komisyon kesilerek yatırılacaktır.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-posta</label>
              <input name="email" type="email" required onChange={handleInputChange} className={inputClass} placeholder="ornek@email.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Şifre</label>
              <div className="relative">
                <input 
                  name="password" 
                  type={showPassword ? "text" : "password"} 
                  required 
                  onChange={handleInputChange} 
                  className={inputClass} 
                  placeholder="En az 6 karakter"
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
            
            <button className="w-full bg-primary-600 text-white py-4 rounded-xl font-bold hover:bg-primary-700 transition-colors shadow-none border border-white/30 mt-4">
              Hesap Oluştur
            </button>
          </form>
          
          <p className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
            Zaten hesabınız var mı? <Link to="/login" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline ml-1">Giriş Yap</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;