'use client'; // ต้องใส่เพื่อให้ใช้ฟังก์ชัน alert และ localStorage ได้

import React from 'react';

interface ProductProps {
  id: string;
  name: string;
  category: string;
  price: number;
  capacity: string;
  imageUrl: string;
}

export default function ProductCard({ id, name, category, price, capacity, imageUrl }: ProductProps) {
  
  // ฟังก์ชันจำลองการหยิบใส่ตะกร้า (บันทึกลง LocalStorage ของเบราว์เซอร์)
  const addToCart = () => {
    // 1. ดึงข้อมูลตะกร้าเก่าออกมาก่อน
    const existingCart = JSON.parse(localStorage.getItem('solar_cart') || '[]');
    
    // 2. เช็คว่ามีสินค้านี้ในตะกร้าหรือยัง
    const existingItem = existingCart.find((item: any) => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += 1; // ถ้ามีแล้วให้บวกจำนวนเพิ่ม
    } else {
      // ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่
      existingCart.push({ id, name, price, quantity: 1, icon: imageUrl });
    }
    
    // 3. เซฟกลับลงไปในตะกร้า
    localStorage.setItem('solar_cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cartUpdated'));
    // 4. แจ้งเตือนผู้ใช้
    alert(`🛒 เพิ่ม "${name}" ลงตะกร้าเรียบร้อยแล้ว!`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
      {/* รูปสินค้า */}
      <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center shrink-0">
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {imageUrl}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-blue-600 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          {category}
        </div>
      </div>

      {/* รายละเอียดสินค้า */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-2">{name}</h3>
        <p className="text-sm text-slate-500 mb-4">กำลังการผลิต: <span className="text-slate-700 font-medium">{capacity}</span></p>
        
        {/* ส่วนปุ่มกด (ดันให้อยู่ล่างสุดเสมอ) */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end gap-2">
          <div>
            <p className="text-xs text-slate-400 mb-1">ราคา</p>
            <p className="text-xl font-bold text-blue-600">฿{price.toLocaleString()}</p>
          </div>
          <button 
            onClick={addToCart}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <span>หยิบใส่ตะกร้า</span>
          </button>
        </div>
      </div>
    </div>
  );
}