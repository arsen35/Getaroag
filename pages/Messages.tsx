
import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
// Added MessageSquare to the lucide-react imports to fix the missing name error
import { Send, MoreVertical, Search, CheckCheck, UserCircle, Car, MessageSquare } from 'lucide-react';
import { checkAuthStatus } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

const MessagesPage = () => {
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [chats, setChats] = useState<any[]>([
    { id: 1, name: 'Murat Aras', car: 'Tesla Model Y', lastMsg: 'Anahtarı nerede bulabilirim?', time: '14:22', unread: 2, avatar: 'MA' },
    { id: 2, name: 'Zeynep Koç', car: 'Fiat Egea', lastMsg: 'Aracı çok temiz teslim ettim.', time: 'Dün', unread: 0, avatar: 'ZK' },
    { id: 3, name: 'Demir Çelik', car: 'BMW 320i', lastMsg: 'Konuma yaklaştım, geliyorum.', time: 'Pzt', unread: 0, avatar: 'DÇ' }
  ]);
  const [messages, setMessages] = useState<any[]>([
    { id: 1, text: 'Merhaba, aracı yarın sabah 10:00 gibi teslim alabilir miyim?', sender: 'them', time: '14:15' },
    { id: 2, text: 'Tabii ki, araç Beşiktaş meydanda hazır olacak.', sender: 'me', time: '14:18' },
    { id: 3, text: 'Anahtarı nerede bulabilirim?', sender: 'them', time: '14:22' }
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!checkAuthStatus()) navigate('/login');
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, navigate]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    const newMsg = { id: Date.now(), text: message, sender: 'me', time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) };
    setMessages([...messages, newMsg]);
    setMessage('');
  };

  return (
    <div className="h-screen flex flex-col bg-white dark:bg-gray-950 overflow-hidden">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        {/* Chat List */}
        <div className={`w-full md:w-80 lg:w-96 bg-white dark:bg-gray-900 border-r dark:border-gray-800 flex flex-col ${activeChat ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-6 border-b dark:border-gray-800">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-4 uppercase tracking-tighter">Mesajlar</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                    <input type="text" placeholder="Sohbetlerde ara..." className="w-full bg-gray-50 dark:bg-gray-800 pl-10 pr-4 py-3 rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary-500/20" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {chats.map(chat => (
                    <div 
                      key={chat.id} 
                      onClick={() => setActiveChat(chat)}
                      className={`p-4 flex gap-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border-l-4 ${activeChat?.id === chat.id ? 'bg-primary-50/50 dark:bg-primary-900/10 border-primary-600' : 'border-transparent'}`}
                    >
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center font-black text-gray-500 shrink-0">{chat.avatar}</div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                                <h4 className="font-black text-xs text-gray-900 dark:text-white uppercase truncate">{chat.name}</h4>
                                <span className="text-[9px] font-bold text-gray-400">{chat.time}</span>
                            </div>
                            <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1 truncate">{chat.car}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{chat.lastMsg}</p>
                        </div>
                        {chat.unread > 0 && <div className="w-5 h-5 bg-primary-600 text-white rounded-full flex items-center justify-center text-[9px] font-black self-center">{chat.unread}</div>}
                    </div>
                ))}
            </div>
        </div>

        {/* Chat Window */}
        <div className={`flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 ${!activeChat ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
            {!activeChat ? (
                <div className="text-center p-12">
                    <div className="w-24 h-24 bg-white dark:bg-gray-900 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6 text-gray-200 shadow-xl border dark:border-gray-800">
                        <MessageSquare size={44} />
                    </div>
                    <h2 className="text-xl font-black text-gray-400 uppercase tracking-widest">Sohbet Seçin</h2>
                    <p className="text-xs text-gray-400 mt-2 font-bold uppercase tracking-widest leading-loose">KİRALAMA SÜRECİNİ YÖNETMEK İÇİN<br/>ARAÇ SAHİBİ VEYA KİRACI İLE KONUŞUN</p>
                </div>
            ) : (
                <>
                    {/* Chat Header */}
                    <div className="p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => setActiveChat(null)} className="md:hidden text-gray-400"><Send size={20} className="rotate-180"/></button>
                            <div className="w-10 h-10 bg-primary-100 text-primary-600 rounded-xl flex items-center justify-center font-black">{activeChat.avatar}</div>
                            <div>
                                <h3 className="font-black text-xs text-gray-900 dark:text-white uppercase">{activeChat.name}</h3>
                                <div className="flex items-center gap-1 text-[9px] font-black text-primary-600 uppercase tracking-widest">
                                    <Car size={10}/> {activeChat.car}
                                </div>
                            </div>
                        </div>
                        <button className="p-2 text-gray-400 hover:text-gray-600"><MoreVertical size={20}/></button>
                    </div>

                    {/* Messages Area */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                        <div className="flex justify-center my-8">
                            <span className="bg-gray-200 dark:bg-gray-800 text-[9px] font-black text-gray-500 px-3 py-1 rounded-full uppercase tracking-widest">GÜVENLİ SOHBET BAŞLATILDI</span>
                        </div>
                        {messages.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[75%] p-4 rounded-3xl ${msg.sender === 'me' ? 'bg-primary-600 text-white rounded-br-none' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-bl-none shadow-sm'}`}>
                                    <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                                    <div className={`flex items-center justify-end gap-1 mt-2 text-[9px] ${msg.sender === 'me' ? 'text-white/60' : 'text-gray-400'}`}>
                                        {msg.time} {msg.sender === 'me' && <CheckCheck size={12}/>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 bg-white dark:bg-gray-900 border-t dark:border-gray-800">
                        <form onSubmit={handleSend} className="flex gap-4">
                            <input 
                              type="text" 
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder="Mesajınızı yazın..." 
                              className="flex-1 bg-gray-50 dark:bg-gray-800 border-none px-6 py-4 rounded-2xl font-bold text-sm outline-none focus:ring-2 focus:ring-primary-500/10" 
                            />
                            <button type="submit" className="w-14 h-14 bg-primary-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-95 transition-all">
                                <Send size={24} className="ml-1" />
                            </button>
                        </form>
                    </div>
                </>
            )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
