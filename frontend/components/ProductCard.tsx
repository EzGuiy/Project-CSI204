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

  const inquireAboutProduct = (e: React.MouseEvent) => {
    e.stopPropagation();
    // ตรวจสอบว่าล็อกอินหรือยังก่อนเปิดแชตสอบถามสินค้า
    const session = localStorage.getItem('solar_session');
    if (!session) {
      alert('❌ กรุณาล็อกอินก่อนใช้งานระบบแชตติดต่อสอบถามค่ะ');
      router.push('/login');
      return;
    }
    const event = new CustomEvent('openChatWithProduct', {
      detail: { id, name, category, price, capacity, imageUrl }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="group cursor-pointer flex flex-col h-full border border-zinc-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      
      {/* ⬜ ส่วนรูปภาพ (พื้นหลังสีเทาอ่อนแบบ Huawei) */}
      <div className="bg-[#f7f7f7] aspect-square w-full relative flex items-center justify-center p-6 overflow-hidden rounded-lg">
        <img 
          src={imageUrl} 
          alt={name}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 mix-blend-multiply"
        />
      </div>

      {/* 📝 ส่วนรายละเอียด (พื้นหลังขาว ไม่มีเส้นขอบ) */}
      <div className="pt-4 flex flex-col flex-grow">
        {/* ชื่อสินค้า */}
        <h3 className="text-[16px] font-bold text-zinc-900 leading-snug mb-1 group-hover:text-red-600 transition-colors line-clamp-2">
          {name}
        </h3>
        
        {/* หมวดหมู่ และ สเปค */}
        <p className="text-[12px] text-zinc-500 mb-3">
          {category}
          {capacity !== '-' && <span className="ml-2 pl-2 border-l border-zinc-300">กำลังไฟ: {capacity}</span>}
        </p>
        
        {/* ส่วนราคาและปุ่มสั่งซื้อ */}
        <div className="mt-auto flex flex-col gap-3 pt-2">
          <div className="flex justify-between items-center">
            <p className="text-lg font-extrabold text-zinc-900">
              ฿{price.toLocaleString()}
            </p>
          </div>
          
          <div className="flex gap-2 w-full pt-1 border-t border-zinc-100">
            {/* ปุ่มสอบถามแอดมิน */}
            <button 
              onClick={inquireAboutProduct}
              className="flex-1 text-[13px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 py-2 rounded-lg transition-colors border border-blue-100 flex items-center justify-center gap-1.5"
            >
              <span>💬</span> สอบถาม
            </button>
            
            {/* ปุ่มสั่งซื้อแบบดั้งเดิม */}
            <button 
              onClick={addToCart}
              className="flex-1 text-[13px] font-semibold text-white bg-slate-900 hover:bg-red-600 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              สั่งซื้อ <span className="text-lg leading-none mt-[-2px]">›</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}