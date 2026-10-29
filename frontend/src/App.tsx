import { useEffect, useState } from 'react';
import { getDB, generateUUID } from './db';
import { Bell, Settings, AlertCircle, ChevronRight, Home, Users, Plus, Wallet, User, TrendingUp } from 'lucide-react';

function App() {
  const [dbReady, setDbReady] = useState(false);

  useEffect(() => {
    getDB().then(() => setDbReady(true)).catch(console.error);
  }, []);

  const addTestTransaction = async () => {
    const db = await getDB();
    await db.transactions.insert({
      id: generateUUID(),
      type: 'EXPENSE',
      amount: 120.00,
      category: 'Jedzenie',
      date: Date.now(),
      version: 1
    });
    alert('Zapisano wydatek offline!');
  };

  return (
    <div className="min-h-screen bg-dark text-white font-sans pb-24">
      <div className="max-w-md mx-auto p-6 relative">
        
        {/* Nagłówek */}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Pulpit</h1>
          <div className="flex gap-4 text-gray-400">
            <Bell className="w-6 h-6 hover:text-white cursor-pointer transition" />
            <Settings className="w-6 h-6 hover:text-white cursor-pointer transition" />
          </div>
        </header>

        {/* Karta głównego salda */}
        <div className="bg-panel rounded-3xl p-6 mb-6 shadow-lg border border-gray-800/50">
          <p className="text-gray-400 text-sm mb-1">Całkowite saldo</p>
          <p className="text-4xl font-bold mb-2">14 520,30 <span className="text-xl text-gray-500 font-normal">PLN</span></p>
          <p className="text-neon font-medium flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> + 2 450,00 PLN
          </p>
        </div>

        {/* Pasek limitu wydatków */}
        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-300">Limitu wydatków</span>
            <span className="text-gray-400">Zostało: 1 800 PLN</span>
          </div>
          <div className="h-3 bg-panel rounded-full overflow-hidden">
            <div className="h-full bg-neon w-[55%] rounded-full shadow-[0_0_10px_#45F3FF]"></div>
          </div>
          <div className="text-neon text-xs mt-2 font-bold bg-panel inline-block px-2 py-1 rounded-md">55%</div>
        </div>

        {/* Alert o nieuregulowanym długu */}
        <div className="bg-alert/10 border border-alert/30 rounded-2xl p-4 mb-8 flex justify-between items-center cursor-pointer hover:bg-alert/20 transition">
          <div className="flex gap-3 items-center">
            <AlertCircle className="text-alert w-6 h-6" />
            <div>
              <p className="text-sm font-bold text-gray-200">Masz nieuregulowany dług!</p>
              <p className="text-xs text-alert font-medium mt-0.5">Oddaj: 45,00 PLN (dla: Kamil)</p>
            </div>
          </div>
          <ChevronRight className="text-alert w-5 h-5" />
        </div>

        {/* Sekcja ostatnich transakcji */}
        <div>
          <h2 className="text-lg font-semibold mb-5 text-gray-200">Ostatnich transakcji</h2>
          <div className="space-y-5">
            
            {/* Przykładowy zysk */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-md">
                  <span className="text-2xl">🐞</span>
                </div>
                <div>
                  <p className="font-bold text-white">Biedronka</p>
                  <p className="text-xs text-gray-400">3tb Kamil</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-neon">+ 14 520,30 PLN</p>
                <p className="text-xs text-neon/70">+ 37,00 PLN</p>
              </div>
            </div>

            {/* Przykładowy wydatek */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md">
                  O
                </div>
                <div>
                  <p className="font-bold text-white">Orlen</p>
                  <p className="text-xs text-gray-400">30. Kamil</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-alert">- 45,00 PLN</p>
                <p className="text-xs text-alert/70">- 18,00 PLN</p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Dolny pasek nawigacji */}
      <nav className="fixed bottom-0 w-full bg-panel/95 backdrop-blur-md border-t border-gray-800 px-6 py-4 flex justify-between items-center z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="w-full max-w-md mx-auto flex justify-between items-center">
          <Home className="text-neon w-7 h-7 cursor-pointer" />
          <Users className="text-gray-500 w-7 h-7 cursor-pointer hover:text-gray-300 transition" />
          
          {/* Główny przycisk akcji spięty z bazą RxDB */}
          <div 
            onClick={addTestTransaction}
            className={`bg-neon w-14 h-14 rounded-full flex items-center justify-center -mt-10 shadow-[0_0_15px_#45F3FF] cursor-pointer hover:scale-105 transition-transform ${!dbReady ? 'opacity-50 grayscale' : ''}`}
          >
            <Plus className="text-dark w-8 h-8 font-black" />
          </div>
          
          <Wallet className="text-gray-500 w-7 h-7 cursor-pointer hover:text-gray-300 transition" />
          <User className="text-gray-500 w-7 h-7 cursor-pointer hover:text-gray-300 transition" />
        </div>
      </nav>

    </div>
  );
}

export default App;