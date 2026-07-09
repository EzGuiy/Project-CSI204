'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartBadge from './CartBadge';

export default function Navbar() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // ตรวจสอบว่ามีการล็อกอินไว้หรือไม่ ตอนโหลดหน้าเว็บ
  useEffect(() => {
    const session = localStorage.getItem('solar_session');
    if (session) {
      setUser(JSON.parse(session));
    }
    setIsLoaded(true);
  }, []);

  // ฟังก์ชันสำหรับออกจากระบบ
  const handleLogout = () => {
    localStorage.removeItem('solar_session');
    setUser(null);
    window.location.reload(); // รีเฟรชหน้าเพื่อล้างข้อมูล
  };

  return (
    <nav className="w-full bg-slate-900 shadow-md sticky top-0 z-50 border-b border-slate-800">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        
        {/* โลโก้แบรนด์ */}
        <Link href="/" className="flex items-center gap-3 group">
          <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">☀️</span>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Solar<span className="text-blue-500">Tech</span>
            <span className="block text-[10px] font-medium text-slate-400 tracking-widest uppercase mt-0.5">Energy Solutions</span>
          </h1>
        </Link>
        
        {/* เมนูตรงกลาง */}
        <div className="hidden md:flex space-x-8 items-center font-medium text-slate-300 text-sm tracking-wide">
          <Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link>
          <Link href="/products" className="hover:text-blue-400 transition-colors">แคตตาล็อกสินค้า</Link>
          <Link href="/calculator" className="hover:text-blue-400 transition-colors">ประเมินขนาดติดตั้ง</Link>
        </div>

        {/* เมนูฝั่งขวา (ตะกร้า + ล็อกอิน) */}
        <div className="flex items-center gap-4">
          <CartBadge />
          
          {/* รอให้ระบบตรวจสอบ Session เสร็จก่อนค่อยแสดงปุ่ม */}
          {isLoaded && (
            user ? (
              // 🟢 ถ้าล็อกอินแล้ว: แสดงชื่อผู้ใช้ และปุ่มออกจากระบบ
              <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                <span className="text-slate-300 text-sm hidden lg:block">
                  สวัสดี, <span className="text-white font-bold">{user.name}</span>
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              // 🔴 ถ้ายังไม่ล็อกอิน: แสดงปุ่มเข้าสู่ระบบ
              <div className="pl-4 border-l border-slate-700">
                <Link 
                  href="/login" 
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm flex items-center gap-2"
                >
                  เข้าสู่ระบบ
                </Link>
              </div>
            )
          )}
        </div>

      </div>
    </nav>
  );
}