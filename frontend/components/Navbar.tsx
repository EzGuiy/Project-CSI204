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
        <div className="flex items-center gap-4 ml-auto">
          <CartBadge />
          
          {/* รอให้ระบบตรวจสอบ Session เสร็จก่อนค่อยแสดงปุ่ม */}
          {isLoaded && (
            user ? (
              // 🟢 ถ้าล็อกอินแล้ว: แสดงชื่อผู้ใช้ และปุ่มออกจากระบบ
              <div className="flex items-center gap-4 pl-4 border-l border-slate-700">
                <Link href="/orders" className="text-slate-300 hover:text-blue-400 transition-colors text-sm font-medium hidden lg:flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z"/></svg>
                  คำสั่งซื้อ
                </Link>
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