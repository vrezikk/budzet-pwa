import { useEffect, useState, useRef } from 'react';
import { getDB, generateUUID } from './db';
import { Bell, Settings, AlertCircle, ChevronRight, Home, Users, Plus, Wallet, User, TrendingUp, Camera, PenTool, X, Check, ShoppingBag, Car, Coffee } from 'lucide-react';

// Zamockowani użytkownicy do testów
const MOCK_USERS = [
  { id: 'me', name: 'Ja' },
  { id: 'kamil', name: 'Kamil' },
  { id: 'ania', name: 'Ania' }
];

const CATEGORIES = [
  { id: 'Zakupy', icon: ShoppingBag },
  { id: 'Paliwo', icon: Car },
  { id: 'Jedzenie', icon: Coffee },
];

function App() {
  const [dbReady, setDbReady] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Stany formularza
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Zakupy');
  const [paidBy, setPaidBy] = useState('me');
  const [participants, setParticipants] = useState<string[]>(['me', 'kamil']); // Domyślnie dzielimy na dwoje
  
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getDB().then(() => setDbReady(true)).catch(console.error);
  }, []);

  const handleCaptureReceipt = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImage(reader.result as string);
        setIsMenuOpen(false);
        setIsFormOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualEntry = () => {
    setReceiptImage(null);
    setIsMenuOpen(false);
    setIsFormOpen(true);
  };

  const toggleParticipant = (userId: string) => {
    if (participants.includes(userId)) {
      if (participants.length > 1) setParticipants(participants.filter(id => id !== userId));
    } else {
      setParticipants([...participants, userId]);
    }
  };

  const saveTransaction = async () => {
    if (!amount || !title) return alert('Wpisz tytuł i kwotę!');
    
    const parsedAmount = parseFloat(amount);
    const splitAmount = parsedAmount / participants.length;

    const db = await getDB();
    await db.transactions.insert({
      id: generateUUID(),
      type: 'EXPENSE',
      title: title,
      amount: parsedAmount,
      category: category,
      date: Date.now(),
      version: 1,
      receipt_image: receiptImage || undefined,
      splits: participants.map(userId => ({
        userId,
        amount: splitAmount
      }))
    });

    // Reset formularza
    setTitle('');
    setAmount('');
    setCategory('Zakupy');
    setPaidBy('me');
    setParticipants(['me', 'kamil']);
    setReceiptImage(null);
    setIsFormOpen(false);
    alert('Zapisano szczegółowy wydatek offline!');
  };

  return (
    <div className="min-h-screen bg-dark text-white font-sans pb-24 relative overflow-hidden">
      {/* --- GŁÓWNY PULPIT --- */}
      <div className="max-w-md mx-auto p-6 relative z-10">
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pulpit</h1>
          <div className="flex gap-4 text-gray-400">
            <Bell className="w-6 h-6 hover:text-white cursor-pointer transition" />
            <Settings className="w-6 h-6 hover:text-white cursor-pointer transition" />
          </div>
        </header>

        <div className="bg-panel rounded-3xl p-6 mb-6 shadow-lg border border-gray-800/50">
          <p className="text-gray-400 text-sm mb-1">Całkowite saldo</p>
          <p className="text-4xl font-bold mb-2">14 520,30 <span className="text-xl text-gray-500 font-normal">PLN</span></p>
          <p className="text-neon font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> + 2 450,00 PLN
          </p>
        </div>
      </div>

      {/* --- EKRAN PEŁNEGO FORMULARZA WYDATKU --- */}
      <div className={`fixed inset-0 bg-dark z-50 transition-transform duration-300 flex flex-col ${isFormOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-6 flex justify-between items-center border-b border-gray-800 bg-panel">
          <h2 className="text-xl font-bold">Nowy wydatek</h2>
          <button onClick={() => setIsFormOpen(false)} className="p-2 bg-dark rounded-full text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {receiptImage && (
            <div className="relative rounded-2xl overflow-hidden border border-gray-800 bg-black h-32 flex justify-center">
              <img src={receiptImage} alt="Paragon" className="h-full object-contain opacity-80" />
              <div className="absolute top-2 right-2 bg-dark/80 px-2 py-1 rounded text-xs text-neon border border-neon/30">
                Zapisano offline
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">Za co to?</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-panel border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-neon transition"
                placeholder="Np. Biedronka"
              />
            </div>
            <div className="w-1/3">
              <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">Kwota</label>
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-panel border border-gray-800 rounded-xl p-4 text-white outline-none focus:border-neon transition font-bold"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">Kategoria</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border whitespace-nowrap transition ${category === cat.id ? 'bg-neon/10 border-neon text-neon' : 'bg-panel border-gray-800 text-gray-400'}`}
                >
                  <cat.icon className="w-4 h-4" /> {cat.id}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">Kto zapłacił?</label>
            <div className="flex gap-2 bg-panel p-1 rounded-xl border border-gray-800">
              {MOCK_USERS.map(user => (
                <button
                  key={user.id}
                  onClick={() => setPaidBy(user.id)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${paidBy === user.id ? 'bg-dark text-white shadow' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {user.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-gray-400 text-xs mb-2 uppercase tracking-wider">Z kim dzielisz?</label>
            <div className="space-y-2">
              {MOCK_USERS.map(user => (
                <div 
                  key={user.id} 
                  onClick={() => toggleParticipant(user.id)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition ${participants.includes(user.id) ? 'bg-neon/5 border-neon/50' : 'bg-panel border-gray-800'}`}
                >
                  <span className={participants.includes(user.id) ? 'text-white font-medium' : 'text-gray-400'}>{user.name}</span>
                  {participants.includes(user.id) && (
                    <span className="text-neon font-bold">
                      {amount ? (parseFloat(amount) / participants.length).toFixed(2) : '0.00'} PLN
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 bg-panel border-t border-gray-800">
          <button 
            onClick={saveTransaction}
            className="w-full bg-neon text-dark font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-lg hover:opacity-90 transition shadow-[0_0_15px_rgba(69,243,255,0.3)]"
          >
            <Check className="w-6 h-6" /> Zapisz 
          </button>
        </div>
      </div>

      {/* --- MENU BOTTOM SHEET --- */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsMenuOpen(false)}></div>}
      <div className={`fixed bottom-0 left-0 w-full bg-panel rounded-t-3xl p-6 z-50 transition-transform duration-300 border-t border-gray-800 ${isMenuOpen ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-white">Wybierz akcję</h3>
          <button onClick={() => setIsMenuOpen(false)} className="p-2 bg-dark rounded-full text-gray-400">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="space-y-3">
          <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleCaptureReceipt} />
          <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center gap-4 p-4 bg-dark rounded-2xl border border-gray-800 hover:border-neon transition group">
            <div className="w-12 h-12 bg-panel rounded-xl flex items-center justify-center group-hover:bg-neon/10 text-neon">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-white group-hover:text-neon">Zeskanuj paragon</p>
              <p className="text-xs text-gray-400">Automat OCR (lub kopia zapasowa offline)</p>
            </div>
          </button>
          <button onClick={handleManualEntry} className="w-full flex items-center gap-4 p-4 bg-dark rounded-2xl border border-gray-800 hover:border-white transition group">
            <div className="w-12 h-12 bg-panel rounded-xl flex items-center justify-center text-gray-400 group-hover:text-white">
              <PenTool className="w-6 h-6" />
            </div>
            <div className="text-left">
              <p className="font-bold text-white">Wpisz ręcznie</p>
              <p className="text-xs text-gray-400">Pełny formularz z podziałem</p>
            </div>
          </button>
        </div>
      </div>

      {/* --- DOLNY PASEK NAWIGACJI --- */}
      <nav className="fixed bottom-0 w-full bg-dark/90 backdrop-blur-md border-t border-gray-800 px-6 py-4 flex justify-between items-center z-30">
        <div className="w-full max-w-md mx-auto flex justify-between items-center">
          <Home className="text-neon w-7 h-7 cursor-pointer" />
          <Users className="text-gray-500 w-7 h-7 cursor-pointer" />
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} disabled={!dbReady} className={`bg-neon w-14 h-14 rounded-full flex items-center justify-center -mt-10 shadow-[0_0_15px_#45F3FF] z-50 relative ${!dbReady ? 'opacity-50 grayscale' : ''}`}>
            <Plus className={`text-dark w-8 h-8 font-black transition-transform duration-300 ${isMenuOpen ? 'rotate-45' : ''}`} />
          </button>
          <Wallet className="text-gray-500 w-7 h-7 cursor-pointer" />
          <User className="text-gray-500 w-7 h-7 cursor-pointer" />
        </div>
      </nav>
    </div>
  );
}

export default App;