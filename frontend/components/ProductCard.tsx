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
    const session = localStorage.getItem('solar_session');
    
    if (!session) {
      alert('❌ กรุณาล็อกอินหรือสมัครสมาชิกก่อนทำการเลือกซื้อสินค้าค่ะ');
      router.push('/login'); 
      return; 
    }

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
    <div className="group cursor-pointer flex flex-col h-full">
      
      {/* ⬜ ส่วนรูปภาพ (พื้นหลังสีเทาอ่อนแบบ Huawei) */}
      <div className="bg-[#f7f7f7] aspect-square w-full relative flex items-center justify-center p-8 overflow-hidden rounded-sm">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
        />
      </div>

      {/* 📝 ส่วนรายละเอียด (พื้นหลังขาว ไม่มีเส้นขอบ) */}
      <div className="pt-5 flex flex-col flex-grow">
        {/* ชื่อสินค้า */}
        <h3 className="text-[17px] font-bold text-zinc-900 leading-snug mb-1 group-hover:text-red-600 transition-colors line-clamp-2">
          {name}
        </h3>
        
        {/* หมวดหมู่ และ สเปค */}
        <p className="text-[13px] text-zinc-500 mb-4">
          {category}
          {capacity !== '-' && <span className="ml-2 pl-2 border-l border-zinc-300">กำลังไฟ: {capacity}</span>}
        </p>
        
        {/* ส่วนราคาและปุ่มสั่งซื้อ */}
        <div className="mt-auto flex justify-between items-center pt-2">
          <p className="text-xl font-bold text-zinc-900">
            ฿{price.toLocaleString()}
          </p>
          
          {/* ปุ่มสั่งซื้อแบบ Text Link คลีนๆ */}
          <button 
            onClick={addToCart}
            className="text-[14px] font-semibold text-zinc-600 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            สั่งซื้อ <span className="text-lg leading-none mt-[-2px]">›</span>
          </button>
        </div>
      </div>
    </div>
  );
}