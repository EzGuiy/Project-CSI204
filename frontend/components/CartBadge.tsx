'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CartBadge() {
  const [itemCount, setItemCount] = useState(0);

  const updateCount = () => {
    const cart = JSON.parse(localStorage.getItem('solar_cart') || '[]');
    const total = cart.reduce((sum: number, item: any) => sum + item.quantity, 0);
    setItemCount(total);
  };

  useEffect(() => {
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  return (
    <Link href="/cart" className="relative flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 px-4 py-2.5 rounded-lg transition-all font-bold shadow-sm">
      <span className="text-xl">🛒</span>
      <span className="hidden sm:block text-sm">ตะกร้าสินค้า</span>
      
      {itemCount > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold w-6 h-6 flex items-center justify-center rounded-full shadow-md border-2 border-white">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}