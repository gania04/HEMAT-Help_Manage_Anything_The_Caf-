 
'use client';

import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';

import { PosLayout } from "@/components/layout/PosLayout";
import { processOrder, getPosMenusWithStock } from '@/lib/pos-actions';
import { formatRupiah } from '@/lib/utils';

  const getProductClass = (isProc: boolean, isOutOfSt: boolean) => {
    if (isProc) return 'opacity-50 cursor-not-allowed';
    if (isOutOfSt) return 'opacity-50 cursor-not-allowed grayscale';
    return 'hover:shadow-md hover:border-[#00875A] hover:bg-green-50/30 cursor-pointer active:scale-95';
  };

type MenuItem = {
  id: string;
  name: string;
  prices: Record<string, number>;
  icon: string;
  maxPortions?: number;
  options?: Record<string, string[]>;
};

type CartItem = MenuItem & {
  cartItemId: string;
  quantity: number;
  selectedOptions?: Record<string, string>;
};

const CHANNELS = [
  { id: 'dine_in', label: 'Dine-in (Kasir)' },
  { id: 'takeaway', label: 'Takeaway' },
  { id: 'gofood', label: 'GoFood' },
  { id: 'grabfood', label: 'GrabFood' },
  { id: 'shopeefood', label: 'ShopeeFood' }
];

function calculateTotalQty(cart: CartItem[], menuId: string) {
  let sum = 0;
  for (const c of cart) {
    if (c.id === menuId) sum += c.quantity;
  }
  return sum;
}

function getOptionsString(opts?: Record<string, string>) {
  if (!opts) return '';
  const entries = Object.entries(opts);
  entries.sort((a, b) => a[0].localeCompare(b[0]));
  const result: string[] = [];
  for (const [k, v] of entries) {
    result.push(`${k}:${v}`);
  }
  return result.join('|');
}


export default function PosPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [activeChannel, setActiveChannel] = useState('dine_in');
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [cashGiven, setCashGiven] = useState<number | ''>('');
  const [debitRef, setDebitRef] = useState<string>('');
  const [receiptData, setReceiptData] = useState<Parameters<typeof JSON.stringify>[0]>(null);
  const [customerName, setCustomerName] = useState('');
  const [customerWA, setCustomerWA] = useState('');
  const [showQRMenu, setShowQRMenu] = useState(false);
  const [selectedMenuForOptions, setSelectedMenuForOptions] = useState<MenuItem | null>(null);
  const [tempOptions, setTempOptions] = useState<Record<string, string>>({});
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleShareImage = async () => {
    if (!receiptRef.current) return;
    setIsCapturing(true);
    try {
      const canvas = await html2canvas(receiptRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      const file = new File([blob], `Struk-${receiptData.orderId}.png`, { type: 'image/png' });
      
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Struk Pembelian HEMAT',
          text: 'Terima kasih telah berbelanja di HEMAT!'
        });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Struk-${receiptData.orderId}.png`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.warn('Failed to capture image:', err);
      alert('Gagal membuat gambar struk.');
    } finally {
      setIsCapturing(false);
    }
  };

  const fetchMenus = async () => {
    const data = await getPosMenusWithStock();
    setMenus(data);
  };

  useEffect(() => {
        fetchMenus();
    
     
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    
    globalThis.addEventListener('online', handleOnline);
    globalThis.addEventListener('offline', handleOffline);
    
    return () => {
      globalThis.removeEventListener('online', handleOnline);
      globalThis.removeEventListener('offline', handleOffline);
    };
  }, []);

  const getPrice = (item: MenuItem) => {
    return item.prices[activeChannel] || item.prices['dine_in'] || 0;
  };

  const handleMenuClick = (item: MenuItem) => {
    if (isProcessing) return;
    if (item.maxPortions === 0) return;
    
    // Check if item has options
    if (item.options && Object.keys(item.options).length > 0) {
      setSelectedMenuForOptions(item);
      // Set default options (first choice of each)
      const defaultOpts: Record<string, string> = {};
      Object.keys(item.options).forEach(key => {
        defaultOpts[key] = item.options![key][0];
      });
      setTempOptions(defaultOpts);
    } else {
      addToCart(item);
    }
  };

  const addToCart = (item: MenuItem, selectedOpts?: Record<string, string>) => {
    setNotification(null);
    setCart((prevCart) => {
      const optsString = getOptionsString(selectedOpts);
      const cartItemId = item.id + (optsString ? `-${optsString}` : '');
      const exists = prevCart.some((cartItem) => cartItem.cartItemId === cartItemId);
      
      const totalQtyOfThisMenu = calculateTotalQty(prevCart, item.id);
      
      if (item.maxPortions !== undefined && totalQtyOfThisMenu >= item.maxPortions) {
        setNotification({ type: 'error', message: `Stok ${item.name} tidak mencukupi!` });
        return prevCart;
      }

      if (exists) {
        return prevCart.map((cartItem) =>
          cartItem.cartItemId === cartItemId
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prevCart, { ...item, cartItemId, quantity: 1, selectedOptions: selectedOpts }];
    });
    setSelectedMenuForOptions(null);
  };

  const updateQuantity = (cartItemId: string, delta: number) => {
    setNotification(null);
    setCart((prevCart) => {
      const targetItem = prevCart.find(i => i.cartItemId === cartItemId);
      if (!targetItem) return prevCart;

      if (delta > 0 && targetItem.maxPortions !== undefined) {
         const totalQtyOfThisMenu = calculateTotalQty(prevCart, targetItem.id);
         if (totalQtyOfThisMenu >= targetItem.maxPortions) {
           setNotification({ type: 'error', message: `Stok ${targetItem.name} hanya tersisa ${targetItem.maxPortions} porsi!` });
           return prevCart;
         }
      }

      return prevCart
        .map(item => item.cartItemId === cartItemId 
          ? { ...item, quantity: Math.max(0, item.quantity + delta) } 
          : item)
        .filter(item => item.quantity > 0);
    });
  };

const totalHarga = cart.reduce((total, item) => total + (getPrice(item) * item.quantity), 0);

  const initiatePayment = (method: string) => {
    if (cart.length === 0) return;
    setPaymentMethod(method);
    setCashGiven('');
    setDebitRef('');
  };

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
      if (navigator.onLine) {
        const result = await processOrder(checkoutCart, method, totalHarga, activeChannel);
        
        if (result.success) {
          setReceiptData({
            orderId: result.orderId,
            items: [...checkoutCart],
            total: totalHarga,
            method: paymentMethod,
            cashGiven: cashGiven || 0,
            change: (cashGiven && paymentMethod === 'Tunai') ? Number(cashGiven) - totalHarga : 0,
            date: new Date().toLocaleString('id-ID'),
            customerName,
            customerWA
          });
          setCart([]);
          setPaymentMethod(null);
          setCustomerName('');
          setCustomerWA('');
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
      } else {
        const { saveOfflineTransaction } = await import('@/lib/idb-store');
        await saveOfflineTransaction(checkoutCart, method, totalHarga);
        
        /* eslint-disable-next-line react-hooks/purity */
        const timestamp = Date.now();
        const dateString = new Date().toLocaleString('id-ID');
        setReceiptData({
          orderId: 'OFFLINE-' + timestamp.toString().slice(-6),
          items: [...checkoutCart],
          total: totalHarga,
          method: paymentMethod,
          cashGiven: cashGiven || 0,
          change: (cashGiven && paymentMethod === 'Tunai') ? Number(cashGiven) - totalHarga : 0,
          date: dateString,
          customerName,
          customerWA
        });
        setCart([]);
        setPaymentMethod(null);
        setCustomerName('');
        setCustomerWA('');
        setNotification({
          type: 'success',
          message: `Mode Offline: Pembayaran ${method} tersimpan sementara.`
        });
      }
    } catch (_error: Parameters<typeof JSON.stringify>[0]) {
      console.warn('POS Checkout Error:', _error);
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
            <div key={item.cartItemId} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex-1 pr-2">
                <p className="font-bold text-sm leading-tight mb-1">{item.name}</p>
                {item.selectedOptions && (
                  <p className="text-[10px] text-gray-500 mb-1 leading-tight">
                    {Object.entries(item.selectedOptions).map(([,v]) => `${v}`).join(', ')}
                  </p>
                )}
                <p className="text-xs text-[#00875A] font-bold">{formatRupiah(getPrice(item))}</p>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1 border border-gray-100">
                <button 
                  onClick={() => updateQuantity(item.cartItemId, -1)}
                  disabled={isProcessing}
                  className="w-8 h-8 flex items-center justify-center bg-white rounded-md text-gray-600 shadow-sm hover:bg-gray-100 font-bold active:scale-95 transition-transform border border-gray-200 disabled:opacity-50"
                >
                  -
                </button>
                <span className="w-5 text-center font-bold text-sm">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.cartItemId, 1)}
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

      <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-gray-200 shrink-0">
        <div className="mb-4 space-y-2">
          <input 
            type="text" 
            placeholder="Nama Pelanggan (Opsional)" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#00875A] focus:outline-none"
          />
          <input 
            type="tel" 
            placeholder="Nomor WA Pelanggan (Opsional)" 
            value={customerWA}
            onChange={(e) => setCustomerWA(e.target.value)}
            className="w-full border border-gray-200 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-[#00875A] focus:outline-none"
          />
        </div>
        <div className="flex justify-between items-center mb-2 md:mb-4">
          <span className="text-gray-500 font-medium">Total Harga</span>
          <span className="text-xl md:text-2xl font-bold text-[#00875A]">{formatRupiah(totalHarga)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-3">
          <button 
            onClick={() => initiatePayment('Tunai')}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-[#00875A] text-white py-2 md:py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-green-100 active:scale-95 flex items-center justify-center gap-2 relative text-sm md:text-base"
          >
            {isProcessing ? '...' : <><span className="text-lg md:text-xl">💵</span> Tunai</>}
          </button>
          <button 
            onClick={() => initiatePayment('Debit')}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-[#1E88E5] text-white py-2 md:py-3 rounded-lg font-bold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-100 active:scale-95 flex items-center justify-center gap-2 relative text-sm md:text-base"
          >
            {isProcessing ? '...' : <><span className="text-lg md:text-xl">💳</span> Debit</>}
          </button>
          <button 
            onClick={() => initiatePayment('QRIS')}
            disabled={cart.length === 0 || isProcessing}
            className="w-full bg-[#D32F2F] text-white py-2 md:py-3 rounded-lg font-bold hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-red-100 active:scale-95 flex items-center justify-center gap-2 relative text-sm md:text-base"
          >
            {isProcessing ? '...' : <><span className="text-lg md:text-xl">📱</span> QRIS</>}
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
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-[#00875A]">Pilih Menu</h2>
          <button 
            onClick={() => setShowQRMenu(true)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 border border-gray-200 transition"
          >
            📱 Tampilkan QR Menu
          </button>
        </div>
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
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 pb-10">
        {menus.length === 0 ? (
           <p className="text-gray-400 font-bold col-span-4 text-center mt-10">Memuat menu dan stok...</p>
        ) : menus.map((item) => {
          const isOutOfStock = item.maxPortions === 0;
          const currentPrice = getPrice(item);

          return (
            <button 
              type="button"
              key={item.id}
              onClick={() => {
                if (!isProcessing && !isOutOfStock) handleMenuClick(item);
              }}
              className={`bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center transition relative ${getProductClass(isProcessing, isOutOfStock)}`}
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
            </button>
          );
        })}
      </div>

      {/* MODAL PILIHAN VARIAN/OPSI MENU */}
      {selectedMenuForOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
              Pilihan: {selectedMenuForOptions.name}
            </h2>
            
            <div className="space-y-4 mb-6">
              {Object.keys(selectedMenuForOptions.options!).map((optKey) => {
                let labelText = optKey;
                if (optKey === 'ice') labelText = 'Suhu / Es';
                else if (optKey === 'sugar') labelText = 'Tingkat Gula';

                return (
                  <div key={optKey}>
                    <p className="block text-sm font-bold mb-2 text-gray-700 capitalize">
                      {labelText}
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedMenuForOptions.options![optKey].map((val: string) => (
                        <button
                          key={val}
                          onClick={() => setTempOptions({ ...tempOptions, [optKey]: val })}
                          className={`py-2 px-1 text-xs font-bold rounded-lg border transition ${
                            tempOptions[optKey] === val 
                              ? 'bg-[#E6F4EA] border-[#00875A] text-[#00875A]' 
                              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setSelectedMenuForOptions(null)} 
                className="px-4 py-3 text-sm font-bold border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition flex-1"
              >
                Batal
              </button>
              <button 
                onClick={() => addToCart(selectedMenuForOptions, tempOptions)}
                className="px-4 py-3 text-sm bg-[#00875A] text-white rounded-lg hover:bg-green-700 font-bold transition shadow-md shadow-green-100 flex-1 flex items-center justify-center gap-2"
              >
                ➕ Tambah
              </button>
            </div>
          </div>
        </div>
      )}
      {paymentMethod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm p-6 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-800">
              {(() => {
                if (paymentMethod === 'Tunai') return '💵 Pembayaran Tunai';
                if (paymentMethod === 'QRIS') return '📱 Pembayaran QRIS';
                return '💳 Pembayaran Debit';
              })()}
            </h2>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4 text-center">
              <p className="text-gray-500 text-sm">Total Tagihan</p>
              <p className="text-3xl font-black text-[#00875A]">{formatRupiah(totalHarga)}</p>
            </div>

            {paymentMethod === 'Tunai' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="cashGiven" className="block text-sm font-bold mb-1 text-gray-700">Uang Diterima (Rp)</label>
                  <input 
                    id="cashGiven"
                    type="number" 
                    value={cashGiven}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00875A] focus:outline-none font-bold text-lg" 
                    placeholder="Masukkan jumlah" 
                    autoFocus
                  />
                </div>
                {Number(cashGiven) >= totalHarga && (
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-700 mb-1">Kembalian</p>
                    <p className="text-xl font-bold text-[#00875A]">{formatRupiah(Number(cashGiven) - totalHarga)}</p>
                  </div>
                )}
                {Number(cashGiven) > 0 && Number(cashGiven) < totalHarga && (
                  <p className="text-sm text-red-500 font-bold">Uang kurang {formatRupiah(totalHarga - Number(cashGiven))}!</p>
                )}
              </div>
            )}

            {paymentMethod === 'QRIS' && (
              <div className="flex flex-col items-center mb-6">
                <div className="w-48 h-48 bg-gray-100 rounded-xl mb-4 border-4 border-[#00875A] flex flex-col items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-6xl mb-2">📷</span>
                     <span className="text-xs font-bold text-gray-700 bg-white px-2 py-1 rounded shadow">Scan QRIS</span>
                   </div>
                </div>
                <p className="text-sm text-center text-gray-500">Minta pelanggan memindai kode QRIS ini dengan aplikasi E-Wallet atau M-Banking.</p>
              </div>
            )}

            {paymentMethod === 'Debit' && (
              <div className="space-y-4 mb-6">
                <div>
                  <label htmlFor="debitRef" className="block text-sm font-bold mb-1 text-gray-700">Nomor Referensi EDC / Approval Code</label>
                  <input 
                    id="debitRef"
                    type="text" 
                    value={debitRef}
                    onChange={(e) => setDebitRef(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold" 
                    placeholder="Contoh: 123456" 
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500">Gesek kartu pada mesin EDC dan masukkan kode approval yang muncul pada struk mesin EDC.</p>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setPaymentMethod(null)} 
                className="px-4 py-3 text-sm font-bold border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition flex-1"
              >
                Batal
              </button>
              <button 
                onClick={() => {
                  if (paymentMethod === 'Tunai' && Number(cashGiven) < totalHarga) return;
                  if (paymentMethod === 'Debit' && !debitRef) {
                    alert("Masukkan Nomor Referensi EDC!");
                    return;
                  }
                  handleCheckout(paymentMethod);
                }}
                disabled={paymentMethod === 'Tunai' && (Number(cashGiven) < totalHarga || !cashGiven)}
                className="px-4 py-3 text-sm bg-[#00875A] text-white rounded-lg hover:bg-green-700 font-bold transition shadow-md shadow-green-100 flex-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isProcessing ? '⏳ Memproses...' : '✅ Selesaikan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm flex flex-col animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
            
            <div ref={receiptRef} className="bg-white">
              <div className="p-6 pb-2 text-center border-b border-gray-100 border-dashed">
                <h2 className="text-2xl font-black text-gray-800 tracking-tight">HEMAT</h2>
                <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">Struk Pembelian</p>
              </div>
              
              <div className="p-6">
                <div className="flex justify-between text-xs text-gray-500 mb-4 pb-4 border-b border-gray-100">
                <div>
                  <p>Order ID: <b>{receiptData.orderId}</b></p>
                  <p>Kasir: Gania K.</p>
                  {receiptData.customerName && <p className="mt-1 text-gray-800">Pelanggan: <b>{receiptData.customerName}</b></p>}
                </div>
                <div className="text-right">
                  <p>{receiptData.date.split(',')[0]}</p>
                  <p>{receiptData.date.split(',')[1]}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                {receiptData.items.map((item: Parameters<typeof JSON.stringify>[0], idx: number) => (
                  <div key={item.cartItemId || idx} className="text-sm">
                    <p className="font-bold text-gray-800">{item.name}</p>
                    {item.selectedOptions && (
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {Object.entries(item.selectedOptions).map(([,v]) => `${v}`).join(', ')}
                      </p>
                    )}
                    <div className="flex justify-between text-gray-600 mt-1">
                      <span>{item.quantity} x {formatRupiah(item.price)}</span>
                      <span className="font-medium text-gray-900">{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-gray-200 pt-4 space-y-2 text-sm">
                <div className="flex justify-between font-black text-lg">
                  <span>TOTAL</span>
                  <span>{formatRupiah(receiptData.total)}</span>
                </div>
                <div className="flex justify-between text-gray-600 pt-2">
                  <span>Metode ({receiptData.method})</span>
                  <span>{receiptData.method === 'Tunai' ? formatRupiah(receiptData.cashGiven) : formatRupiah(receiptData.total)}</span>
                </div>
                {receiptData.method === 'Tunai' && (
                  <div className="flex justify-between text-gray-600">
                    <span>Kembalian</span>
                    <span>{formatRupiah(receiptData.change)}</span>
                  </div>
                )}
              </div>
              
                <p className="text-center text-xs text-gray-400 mt-8">Terima kasih atas kunjungan Anda!</p>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 flex flex-wrap gap-2 border-t border-gray-200">
              <button 
                onClick={handleShareImage}
                disabled={isCapturing}
                className="w-full py-2 text-sm bg-[#1E88E5] text-white rounded-lg hover:bg-blue-600 font-bold transition shadow-sm flex items-center justify-center gap-2 mb-1"
              >
                {isCapturing ? '⏳ Memproses IMG...' : '📸 Bagikan / Unduh IMG'}
              </button>
              
              <button 
                onClick={() => setReceiptData(null)} 
                className="py-2 px-3 text-sm font-bold border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition flex-1"
              >
                Selesai
              </button>
              <button 
                onClick={() => {
                  const itemsText = receiptData.items.map((i: Parameters<typeof JSON.stringify>[0]) => {
                    let text = `${i.quantity}x ${i.name}`;
                    if (i.selectedOptions) {
                      text += ` (${Object.entries(i.selectedOptions).map(([,v]) => v).join(', ')})`;
                    }
                    text += ` - ${formatRupiah(i.price * i.quantity)}`;
                    return text;
                  }).join('%0A');
                  const textParts = [
                    '*Struk Pembelian HEMAT*',
                    `Order ID: ${receiptData.orderId}`,
                    `Tanggal: ${receiptData.date}`
                  ];
                  if (receiptData.customerName) textParts.push(`Pelanggan: ${receiptData.customerName}`);
                  textParts.push('', '*Pesanan:*', itemsText, '', `*Total: ${formatRupiah(receiptData.total)}*`, `Metode: ${receiptData.method}`);
                  if (receiptData.method === 'Tunai') {
                    textParts.push(`Tunai: ${formatRupiah(receiptData.cashGiven)}`, `Kembali: ${formatRupiah(receiptData.change)}`);
                  }
                  textParts.push('', 'Terima kasih telah berbelanja!');
                  
                  const text = textParts.join('%0A');
                  
                  let waUrl = `https://wa.me/?text=${text}`;
                  if (receiptData.customerWA) {
                    let phone = receiptData.customerWA.replace(/[^0-9]/g, '');
                    if (phone.startsWith('0')) phone = '62' + phone.slice(1);
                    waUrl = `https://wa.me/${phone}?text=${text}`;
                  }
                  
                  window.open(waUrl, '_blank');
                }}
                className="py-2 px-3 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 font-bold transition shadow-sm flex items-center justify-center gap-2 flex-1"
              >
                <span className="text-lg">💬</span> WA Teks
              </button>
            </div>
          </div>
        </div>
      )}

      {showQRMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-black text-[#00875A] mb-2">Self-Order Menu</h2>
            <p className="text-sm text-gray-500 mb-6">Minta pelanggan scan barcode ini menggunakan kamera HP mereka untuk melihat menu dan memesan.</p>
            
            <div className="bg-white p-4 rounded-xl border-4 border-[#00875A] inline-block mb-6 shadow-md">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://hemat.cafe/menu" alt="QR Code Menu" className="w-48 h-48" />
            </div>
            
            <button 
              onClick={() => setShowQRMenu(false)}
              className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </PosLayout>
  );
}
