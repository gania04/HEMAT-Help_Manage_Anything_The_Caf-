'use client';

import { useState, useEffect } from 'react';
import { PosLayout } from "@/components/layout/PosLayout";
import { processOrder, getPosMenusWithStock } from '@/lib/pos-actions';

type MenuItem = {
  id: string;
  name: string;
  prices: Record<string, number>;
  icon: string;
  maxPortions?: number;
};

type CartItem = MenuItem & {
  quantity: number;
};

const CHANNELS = [
  { id: 'dine_in', label: 'Dine-in (Kasir)' },
  { id: 'takeaway', label: 'Takeaway' },
  { id: 'gofood', label: 'GoFood' },
  { id: 'grabfood', label: 'GrabFood' },
  { id: 'shopeefood', label: 'ShopeeFood' }
];

export default function PosPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [activeChannel, setActiveChannel] = useState('dine_in');

  const fetchMenus = async () => {
    const data = await getPosMenusWithStock();
    setMenus(data);
  };

  useEffect(() => {
    fetchMenus();
    
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getPrice = (item: MenuItem) => {
    return item.prices[activeChannel] || item.prices['dine_in'] || 0;
  };

  const addToCart = (item: MenuItem) => {
    setNotification(null);
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id);
      
      const currentQty = existingItem ? existingItem.quantity : 0;
      if (item.maxPortions !== undefined && currentQty >= item.maxPortions) {
        setNotification({ type: 'error', message: `Stok ${item.name} tidak mencukupi!` });
        return prevCart;
      }

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setNotification(null);
    setCart((prevCart) => {
      return prevCart.map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          if (delta > 0 && item.maxPortions !== undefined && newQuantity > item.maxPortions) {
             setNotification({ type: 'error', message: `Stok ${item.name} hanya tersisa ${item.maxPortions} porsi!` });
             return item;
          }
          return { ...item, quantity: newQuantity > 0 ? newQuantity : 0 };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const totalHarga = cart.reduce((total, item) => total + (getPrice(item) * item.quantity), 0);

  const handleCheckout = async (method: string) => {
    if (cart.length === 0) return;
    
    setIsProcessing(true);
    setNotification(null);

    // Siapkan cart dengan format price statis saat checkout
    const checkoutCart = cart.map(c => ({
      ...c,
      price: getPrice(c)
    }));

    try {
      if (!navigator.onLine) {
        const { saveOfflineTransaction } = await import('@/lib/idb-store');
        await saveOfflineTransaction(checkoutCart, method, totalHarga);
        
        setCart([]);
        setNotification({
          type: 'success',
          message: `Mode Offline: Pembayaran ${method} tersimpan sementara.`
        });
      } else {
        const result = await processOrder(checkoutCart, method, totalHarga, activeChannel);
        
        if (result.success) {
          setCart([]);
          setNotification({
            type: 'success',
            message: `${result.message} (Order ID: ${result.orderId})`
          });
          fetchMenus();
        } else {
          setNotification({
            type: 'error',
            message: result.error || 'Terjadi kesalahan'
          });
        }
      }
    } catch (error) {
      console.error(error);
      setNotification({
        type: 'error',
        message: 'Gagal memproses pembayaran'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const cartPanel = (
    <div className="flex flex-col h-full p-4 relative">
      <h2 className="text-xl font-bold mb-4 text-[#00875A]">Keranjang ({CHANNELS.find(c => c.id === activeChannel)?.label})</h2>
      
      {notification && (
        <div className={`mb-4 p-3 rounded-lg text-sm font-bold shadow-sm flex items-center justify-between ${
          notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="text-lg leading-none opacity-50 hover:opacity-100">&times;</button>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="flex-1 border-2 border-dashed border-gray-200 rounded-lg p-4 flex flex-col items-center justify-center text-gray-400">
          <span className="text-4xl mb-2">🛒</span>
          <span>Keranjang masih kosong</span>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex-1 pr-2">
                <p className="font-bold text-sm leading-tight mb-1">{item.name}</p>
                <p className="text-xs text-[#00875A] font-bold">{formatRupiah(getPrice(item))}</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                <button 
                  onClick={() => updateQuantity(item.id, -1)}
                  disabled={isProcessing}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-gray-600 shadow-sm hover:bg-gray-100 font-bold active:scale-95 transition-transform border border-gray-200 disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, 1)}
                  disabled={isProcessing}
                  className="w-8 h-8 flex items-center justify-center bg-[#00875A] rounded-md text-white shadow-sm hover:bg-green-700 font-bold active:scale-95 transition-transform disabled:opacity-50"
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <span className="text-gray-500 font-medium">Total Harga</span>
          <span className="text-2xl font-bold text-[#00875A]">{formatRupiah(totalHarga)}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => handleCheckout('Tunai')}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-[#00875A] text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-100 active:scale-95 flex items-center justify-center gap-2 relative"
          >
            {isProcessing ? '...' : <><span className="text-xl">💵</span> Tunai</>}
          </button>
          <button 
            onClick={() => handleCheckout('Debit')}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-[#1E88E5] text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-100 active:scale-95 flex items-center justify-center gap-2 relative"
          >
            {isProcessing ? '...' : <><span className="text-xl">💳</span> Debit</>}
          </button>
          <button 
            onClick={() => handleCheckout('QRIS')}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-[#D32F2F] text-white py-3 rounded-lg font-bold hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-100 active:scale-95 flex items-center justify-center gap-2 relative"
          >
            {isProcessing ? '...' : <><span className="text-xl">📱</span> QRIS</>}
          </button>
          <button 
            onClick={() => handleCheckout('Akad Murabahah')}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-[#8E24AA] text-white py-3 rounded-lg font-bold hover:bg-purple-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-purple-100 active:scale-95 flex items-center justify-center gap-2 relative"
          >
            {isProcessing ? '...' : <><span className="text-xl">🤝</span> Murabahah</>}
          </button>
        </div>
      </div>
      
      {isProcessing && (
        <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 rounded-lg flex items-center justify-center">
          <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center gap-3">
             <div className="w-5 h-5 border-2 border-[#00875A] border-t-transparent rounded-full animate-spin"></div>
             <span className="font-bold text-[#00875A]">Memproses...</span>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <PosLayout cartPanel={cartPanel}>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#00875A]">Pilih Menu</h2>
        <div className="flex items-center gap-4">
          <select
            value={activeChannel}
            onChange={(e) => setActiveChannel(e.target.value)}
            className="px-4 py-2 bg-white border border-[#00875A] text-[#00875A] font-bold rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
          >
            {CHANNELS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
          <span className={`text-sm font-bold px-3 py-2 rounded-lg shadow-sm border ${
            isOffline ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 'bg-[#E6F4EA] text-[#00875A] border-[#00875A]/20'
          }`}>
            {isOffline ? 'Offline Mode 🔴' : 'Online 🟢'}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 overflow-y-auto pb-10">
        {menus.length === 0 ? (
           <p className="text-gray-400 font-bold col-span-4 text-center mt-10">Memuat menu dan stok...</p>
        ) : menus.map((item) => {
          const isOutOfStock = item.maxPortions === 0;
          const currentPrice = getPrice(item);

          return (
            <div 
              key={item.id}
              onClick={() => {
                if (!isProcessing && !isOutOfStock) addToCart(item);
              }}
              className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition relative ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : 
                isOutOfStock ? 'opacity-50 cursor-not-allowed grayscale' : 
                'hover:shadow-md hover:border-[#00875A] hover:bg-green-50/30 cursor-pointer active:scale-95'
              }`}
            >
              <div className="absolute top-2 right-2 bg-gray-100 text-xs font-bold px-2 py-1 rounded border border-gray-200">
                {item.maxPortions === 99 ? '∞' : `Sisa: ${item.maxPortions}`}
              </div>

              <div className="w-full aspect-square bg-gray-50 rounded-lg mb-3 flex items-center justify-center text-gray-400 group-hover:bg-white transition-colors">
                <span className="text-5xl">{item.icon}</span>
              </div>
              <span className="font-bold text-center text-sm leading-tight mb-1">{item.name}</span>
              <span className="text-sm font-bold text-[#00875A]">{formatRupiah(currentPrice)}</span>
              
              {isOutOfStock && (
                <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                  <span className="bg-red-500 text-white font-bold px-3 py-1 rounded-lg shadow-sm border border-red-600 rotate-[-10deg]">
                    HABIS
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </PosLayout>
  );
}
