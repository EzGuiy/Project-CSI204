'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. ดึงข้อมูลจาก LocalStorage ตอนเปิดหน้านี้
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('solar_cart') || '[]');
    setCartItems(savedCart);
    setIsLoaded(true);
  }, []);

  // 2. ฟังก์ชันเซฟข้อมูลกลับลงเครื่อง (พร้อมอัปเดตตัวเลขสีแดง)
  const saveCart = (newCart: any[]) => {
    setCartItems(newCart);
    localStorage.setItem('solar_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated')); 
  };

  // 3. ฟังก์ชันเพิ่ม/ลดจำนวน
  const updateQuantity = (id: string, delta: number) => {
    const newCart = cartItems.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    saveCart(newCart);
  };

  // 4. ฟังก์ชันลบสินค้า
  const removeItem = (id: string) => {
    const newCart = cartItems.filter(item => item.id !== id);
    saveCart(newCart);
  };

  // 5. คำนวณยอดเงิน
  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = (subtotal > 50000 || subtotal === 0) ? 0 : 1500; // โปรส่งฟรีเมื่อซื้อเกิน 5 หมื่น
  const total = subtotal + shippingFee;

  // ป้องกันหน้าจอกระพริบตอนโหลด
  if (!isLoaded) return <div className="py-20 text-center text-slate-500">กำลังโหลดตะกร้าสินค้า...</div>;

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold text-slate-900 mb-8 flex items-center gap-3">
        <span className="text-4xl">🛒</span> ตะกร้าสินค้าของคุณ
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* ฝั่งซ้าย: รายการสินค้า */}
        <div className="lg:w-2/3 space-y-4">
          {cartItems.length > 0 ? (
            cartItems.map(item => (
              <div key={item.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-6 relative">
                
                <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center text-4xl border border-slate-100 shrink-0">
                  {item.icon}
                </div>

                <div className="flex-grow text-center sm:text-left">
                  <h3 className="font-bold text-slate-800 text-lg mb-1">{item.name}</h3>
                  <p className="text-blue-600 font-medium">฿{item.price.toLocaleString()} / ชิ้น</p>
                </div>

                <div className="flex items-center gap-3 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-slate-100 font-bold text-slate-600">-</button>
                  <span className="w-8 text-center font-bold text-slate-800">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-slate-100 font-bold text-slate-600">+</button>
                </div>

                <div className="w-24 text-right font-bold text-lg text-slate-800">
                  ฿{(item.price * item.quantity).toLocaleString()}
                </div>

                <button onClick={() => removeItem(item.id)} className="absolute -top-3 -right-3 bg-red-100 hover:bg-red-500 text-red-600 hover:text-white w-8 h-8 rounded-full flex items-center justify-center transition-colors shadow-sm">
                  ✕
                </button>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <p className="text-5xl mb-4">🪹</p>
              <h3 className="text-xl font-bold text-slate-800 mb-2">ไม่มีสินค้าในตะกร้า</h3>
              <p className="text-slate-500 mb-6">กลับไปเลือกซื้อแผงโซล่าเซลล์และอุปกรณ์กันเถอะ</p>
              <Link href="/products" className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                ไปที่แคตตาล็อกสินค้า
              </Link>
            </div>
          )}
        </div>

        {/* ฝั่งขวา: สรุปยอดสั่งซื้อ */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-slate-800 mb-6 pb-4 border-b border-slate-100">สรุปคำสั่งซื้อ</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-slate-600">
                <span>ยอดรวมสินค้า</span>
                <span className="font-medium text-slate-800">฿{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ค่าจัดส่ง</span>
                {shippingFee === 0 ? (
                  <span className="font-medium text-emerald-500">ฟรี (โปรโมชั่น)</span>
                ) : (
                  <span className="font-medium text-slate-800">฿{shippingFee.toLocaleString()}</span>
                )}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 mb-8">
              <div className="flex justify-between items-end">
                <span className="font-bold text-slate-800">ยอดชำระสุทธิ</span>
                <span className="text-3xl font-bold text-blue-600">฿{total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              disabled={cartItems.length === 0}
              className="w-full bg-slate-900 hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-colors shadow-md"
              onClick={() => alert('ฟีเจอร์ชำระเงินจะมาในเร็วๆ นี้!')}
            >
              ดำเนินการชำระเงิน
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}