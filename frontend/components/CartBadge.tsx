'use client'; // ต้องเป็น Client Component เพื่อให้อ่าน LocalStorage ได้

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CartBadge() {
  const [itemCount, setItemCount] = useState(0);

  // ฟังก์ชันคำนวณจำนวนของในตะกร้า
  const updateCount = () => {
    const cart = JSON.parse(localStorage.getItem('solar_cart') || '[]');
    // นับจำนวนชิ้นทั้งหมดรวมกัน
    const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    setItemCount(total);
  };

  useEffect(() => {
    updateCount(); // ดึงข้อมูลครั้งแรกตอนโหลดหน้าเว็บ

    // คอยดักฟังว่ามีใครส่งสัญญาณ 'cartUpdated' มาไหม (ถ้ามีให้อัปเดตตัวเลข)
    window.addEventListener('cartUpdated', updateCount);
    
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  return (
    <Link href="/cart" className="relative flex items-center gap-2 bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 px-4 py-2 rounded-lg transition-all border border-slate-200 hover:border-blue-200">
      <span className="text-xl">🛒</span>
      <span className="font-medium hidden sm:block">ตะกร้าสินค้า</span>
      
      {/* ถ้ามีของในตะกร้า ให้โชว์ตัวเลขสีแดง (สไตล์ Steam) */}
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}