'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface ProductProps {
  id: string;
  name: string;
  category: string;
  price: number;
  capacity: string;
  imageUrl: string;
}

export default function ProductCard({ id, name, category, price, capacity, imageUrl }: ProductProps) {
  const router = useRouter();

  const addToCart = () => {
    // 🔒 1. ตรวจสอบสถานะการล็อกอินก่อน
    const session = localStorage.getItem('solar_session');
    
    if (!session) {
      alert('❌ กรุณาล็อกอินหรือสมัครสมาชิกก่อนทำการเลือกซื้อสินค้าค่ะ');
      router.push('/login'); 
      return; // 🛑 จุดนี้สำคัญมาก! ต้องมี return เพื่อสั่งให้โปรแกรม "หยุดทำงานทันที" ไม่ให้รันไปเพิ่มของลงตะกร้า
    }

    // 🛒 2. ถ้ามี Session (ล็อกอินแล้ว) โค้ดถึงจะทำงานส่วนนี้ต่อได้
    const existingCart = JSON.parse(localStorage.getItem('solar_cart') || '[]');
    const existingItem = existingCart.find((item: any) => item.id === id);
    
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      existingCart.push({ id, name, price, quantity: 1, icon: imageUrl });
    }
    
    localStorage.setItem('solar_cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cartUpdated')); 
    alert(`🛒 เพิ่ม "${name}" ลงตะกร้าเรียบร้อยแล้ว!`);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all duration-300 flex flex-col h-full group">
      
      {/* ส่วนรูปภาพ */}
      <div className="h-48 bg-white relative flex items-center justify-center shrink-0 border-b border-slate-100 overflow-hidden p-4">
        
        {/* เปลี่ยนจาก div ธรรมดา เป็นแท็ก img */}
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm"
        />

        <div className="absolute top-3 left-3 bg-slate-800 text-white text-[10px] font-bold px-2 py-1 rounded tracking-wide uppercase shadow-sm">
          {category}
        </div>
      </div>

      {/* ส่วนรายละเอียด */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug line-clamp-2">{name}</h3>
        
        <p className="text-sm text-slate-600 mb-4">
          กำลังไฟ: <span className="font-semibold text-slate-900">{capacity}</span>
        </p>
        
        {/* ส่วนราคาและปุ่ม */}
        <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-end gap-2">
          <div>
            <p className="text-xs text-slate-500 font-medium mb-1">ราคา (บาท)</p>
            <p className="text-2xl font-black text-blue-700">
              {price.toLocaleString()}
            </p>
          </div>
          
          <button 
            onClick={addToCart}
            className="bg-blue-700 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg transition-colors font-semibold text-sm shadow-md active:scale-95"
          >
            สั่งซื้อ
          </button>
        </div>
      </div>
    </div>
  );
}