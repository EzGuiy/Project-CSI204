'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

// สร้าง Type มารับข้อมูล
interface User {
  id: string;
  username: string;
  role: string;
  name: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  // ดึงข้อมูลผู้ใช้จากเบราว์เซอร์ตอนโหลดหน้าเว็บ
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.removeItem('user'); // ฉีกบัตรทิ้ง
    setUser(null);
    router.push('/login'); // กลับไปหน้า Login
  };

  if (pathname === '/login' || pathname === '/register') return null;

  return (
    <nav className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          
          {/* 🌟 1. ส่วนโลโก้และเมนูหลัก (แคตตาล็อก, ประเมินแผง) */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white hover:text-slate-300">SolarTech</Link>
            
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              <Link href="/" className={`hover:text-white transition-colors ${pathname === '/' ? 'text-white' : ''}`}>
                หน้าแรก
              </Link>
              <Link href="/products" className={`hover:text-white transition-colors ${pathname.includes('/products') ? 'text-white' : ''}`}>
                แคตตาล็อกสินค้า
              </Link>
              <Link href="/calculator" className={`hover:text-white transition-colors ${pathname === '/calculator' ? 'text-white' : ''}`}>
                ประเมินขนาดติดตั้ง
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            
            {/* 🌟 2. เมนูเฉพาะสำหรับผู้ใช้งานทั่วไป (ตะกร้า และ คำสั่งซื้อ) */}
            {(!user || user.role === 'customer') && (
              <div className="hidden sm:flex items-center gap-4 mr-2 border-r border-slate-700 pr-4">
                <Link href="/cart" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors text-sm font-medium text-slate-300">
                  <span className="text-lg">🛒</span> ตะกร้าสินค้า
                </Link>
                {user && (
                  <Link href="/orders" className="flex items-center gap-1.5 hover:text-blue-400 transition-colors text-sm font-medium text-slate-300">
                    <span className="text-lg">📦</span> ติดตามคำสั่งซื้อ
                  </Link>
                )}
              </div>
            )}

            {/* 🌟 3. ตรวจสอบสถานะการ Login */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400 mb-1">สวัสดี, {user.role === 'customer' ? 'คุณลูกค้า' : 'ทีมงาน'}</p>
                  <p className="text-sm font-bold">{user.name}</p>
                </div>
                
                {/* ปุ่มแอดมิน โชว์เฉพาะ Role admin หรือ employee เท่านั้น */}
                {(user.role === 'admin' || user.role === 'employee') && (
                  <Link 
                    href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
                    className="bg-slate-800 text-white border border-slate-600 px-4 py-2 rounded-sm text-sm font-bold hover:bg-slate-700 transition-colors"
                  >
                    จัดการระบบ
                  </Link>
                )}

                <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded-sm text-sm font-bold hover:bg-red-700 transition-colors">
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              // กรณีคนที่ยังไม่ Login
              <div className="flex gap-2">
                <Link href="/login" className="bg-slate-800 text-white border border-slate-600 px-4 py-2 rounded-sm text-sm font-bold hover:bg-slate-700 transition-colors">
                  เข้าสู่ระบบ
                </Link>
                <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-sm text-sm font-bold hover:bg-blue-700 transition-colors">
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}