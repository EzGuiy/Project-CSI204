'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon: string;
  stock?: number; // 🌟 เพิ่มตัวแปรสำหรับเก็บจำนวนสต๊อกสูงสุด
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  // 📦 ดึงข้อมูลตะกร้า และเช็คสต๊อกล่าสุดจาก API
  useEffect(() => {
    const loadCartAndStock = async () => {
      const savedCart = localStorage.getItem('solar_cart');
      if (savedCart) {
        let parsedCart: CartItem[] = JSON.parse(savedCart);
        
        try {
          // ดึงข้อมูลสินค้าจาก API เพื่อมาเช็คสต๊อกจริง
          const res = await fetch('/api/products');
          if (res.ok) {
            const products = await res.json();
            parsedCart = parsedCart.map(item => {
              const product = products.find((p: any) => p.id === item.id);
              const currentStock = product ? product.stock : 0;
              
              // 🌟 ป้องกันกรณีตะกร้ามีจำนวนมากกว่าสต๊อกจริง ให้ปรับลดลงมาเท่าสต๊อก
              const validQuantity = Math.min(item.quantity, currentStock);
              return { ...item, stock: currentStock, quantity: validQuantity };
            });
            // อัปเดตตะกร้าใหม่ให้จำนวนถูกต้อง
            localStorage.setItem('solar_cart', JSON.stringify(parsedCart));
          }
        } catch (error) {
          console.error("Error fetching stock:", error);
        }
        
        setCartItems(parsedCart);
      }
      setIsLoaded(true);
    };

    loadCartAndStock();
  }, []);

  // ➕➖ ฟังก์ชันปรับจำนวนสินค้า
  const updateQuantity = (id: string, delta: number) => {
    setCartItems(prevItems => {
      const updatedCart = prevItems.map(item => {
        if (item.id === id) {
          const newQuantity = item.quantity + delta;
          const maxStock = item.stock ?? 99; 
          
          // ตรวจสอบไม่ให้จำนวนน้อยกว่า 1 และไม่เกินสต๊อกที่มี
          if (newQuantity >= 1 && newQuantity <= maxStock) {
            return { ...item, quantity: newQuantity };
          }
        }
        return item;
      });
      localStorage.setItem('solar_cart', JSON.stringify(updatedCart));
      window.dispatchEvent(new Event('cartUpdated'));
      return updatedCart;
    });
  };

  // 🗑️ ฟังก์ชันลบสินค้า
  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('solar_cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated')); 
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
        alert('ตะกร้าสินค้าของคุณว่างเปล่า');
        return;
    }
    router.push('/checkout');
  };

  if (!isLoaded) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">ตะกร้าสินค้า</h1>
        
        {cartItems.length === 0 ? (
          // 🛑 กรณีไม่มีสินค้าในตะกร้า
          <div className="bg-white p-16 text-center rounded-3xl border border-slate-200 shadow-sm">
            <div className="text-6xl mb-4 text-slate-300">🛒</div>
            <p className="text-slate-500 mb-6 font-medium">ยังไม่มีสินค้าในตะกร้าของคุณ</p>
            <Link href="/products" className="inline-block bg-blue-600 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-600/20">
              ไปเลือกซื้อสินค้า
            </Link>
          </div>
        ) : (
          // 🛍️ กรณีมีสินค้าในตะกร้า
          <div className="grid lg:grid-cols-3 gap-8">
            
            {/* รายการสินค้า (ซ้าย) */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                  
                  {/* รูปสินค้า */}
                  <div className="w-24 h-24 bg-slate-50 flex-shrink-0 flex items-center justify-center rounded-xl border border-slate-100 p-2">
                    <img 
                      src={item.icon} 
                      alt={item.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/file.svg'; }}
                    />
                  </div>
                  
                  {/* รายละเอียด */}
                  <div className="flex-grow w-full">
                    <h3 className="text-base font-bold text-slate-900 mb-1">{item.name}</h3>
                    <p className="text-sm font-bold text-blue-600 mb-3">฿{item.price.toLocaleString()}</p>
                    
                    <div className="flex items-center justify-between w-full">
                      {/* 🌟 ปุ่มปรับจำนวนสินค้า */}
                      <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg border border-slate-200 w-fit">
                        <button 
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-slate-100 font-bold text-slate-600 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-bold text-slate-900 text-sm">
                          {item.quantity}
                        </span>
                        <button 
                          onClick={() => updateQuantity(item.id, 1)}
                          disabled={item.stock !== undefined && item.quantity >= item.stock}
                          className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-slate-100 font-bold text-slate-600 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +
                        </button>
                      </div>
                      
                      {/* ปุ่มลบ */}
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 text-xs font-bold hover:text-red-700 bg-red-50 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        ลบออก
                      </button>
                    </div>
                    
                    {/* 🌟 แสดงข้อความแจ้งเตือนถ้าสินค้าจะหมดสต๊อก */}
                    {item.stock !== undefined && item.quantity >= item.stock && (
                      <p className="text-[10px] text-red-500 mt-2 font-medium">
                        * ขออภัย สินค้าชิ้นนี้มีในสต๊อกเพียง {item.stock} ชิ้น
                      </p>
                    )}
                  </div>
                  
                  {/* ราคารวมของชิ้นนั้น */}
                  <div className="text-right hidden sm:block min-w-[100px]">
                    <p className="text-[10px] text-slate-400 font-semibold mb-1">ราคารวม</p>
                    <p className="font-bold text-lg text-slate-900">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* สรุปคำสั่งซื้อ (ขวา) */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                <h2 className="text-lg font-bold text-slate-900 mb-6 pb-4 border-b border-slate-100">สรุปคำสั่งซื้อ</h2>
                
                <div className="flex justify-between mb-4 text-sm font-medium text-slate-600">
                  <span>ยอดรวม ({cartItems.reduce((s, i) => s + i.quantity, 0)} ชิ้น)</span>
                  <span>฿{calculateTotal().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between font-black text-xl text-slate-900 mt-6 pt-6 border-t border-dashed border-slate-200">
                  <span>ยอดสุทธิ</span>
                  <span className="text-blue-600">฿{calculateTotal().toLocaleString()}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                >
                  ดำเนินการสั่งซื้อ <span className="text-lg leading-none mt-[-2px]">›</span>
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}