'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface User { id: string; username: string; role: string; name: string; }

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
   const userData = localStorage.getItem('solar_session');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);

      // 🌟 ล็อกสิทธิ์: ถ้าเป็นแอดมิน ให้บังคับไปที่หน้า Dashboard ของแอดมินเท่านั้น
      if (parsedUser.role === 'admin' && !pathname.startsWith('/admin')) {
        router.push('/admin/dashboard');
      }
      // 🌟 ล็อกสิทธิ์: ถ้าเป็นพนักงาน ให้บังคับไปที่หน้า Dashboard ของพนักงานเท่านั้น
      else if (parsedUser.role === 'employee' && !pathname.startsWith('/dashboard')) {
        router.push('/dashboard');
      }
    } else {
      setUser(null);
    }
  }, [pathname, router]);

 const handleLogout = () => {
  if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
    localStorage.removeItem('solar_session');
    
    // 🌟 เปลี่ยนให้กลับไปหน้าหลัก
    window.location.href = '/'; 
  }
};

  // 🌟 ซ่อน Navbar ในหน้าล็อกอิน, สมัครสมาชิก, และหน้าแดชบอร์ด (แอดมิน/พนักงาน)
  if (
    pathname === '/login' || 
    pathname === '/register' || 
    pathname.startsWith('/admin') || 
    pathname.startsWith('/dashboard')
  ) {
    return null;
  }

  return (
    <nav className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20 gap-6">
          
          {/* ส่วนที่ 1: โลโก้ และ เมนูหลัก (ให้ทุกคนเห็น) */}
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white">SolarTech</Link>
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-blue-400">หน้าแรก</Link>
              <Link href="/products" className="hover:text-blue-400">แคตตาล็อกสินค้า</Link>
              <Link href="/calculator" className="hover:text-blue-400">ประเมินขนาดติดตั้ง</Link>
            </div>
          </div>

          <div className="flex items-center gap-4 ml-auto">
            {/* ส่วนที่ 2: ตะกร้าและคำสั่งซื้อ (เฉพาะคนที่ยังไม่ล็อกอิน หรือเป็นลูกค้าเท่านั้น) */}
            {(!user || user.role === 'customer') && (
              <div className="flex items-center gap-4 mr-4 border-r border-slate-700 pr-4">
                <Link href="/cart" className="hover:text-blue-400 text-sm">🛒 ตะกร้าสินค้า</Link>
                {user && (
                  <Link href="/orders" className="hover:text-blue-400 text-sm">📦 ติดตามคำสั่งซื้อ</Link>
                )}
              </div>
            )}

            {/* ส่วนที่ 3: จัดการ User Session */}
            {user ? (
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-slate-400">สวัสดี, {user.role === 'customer' ? 'คุณลูกค้า' : 'ทีมงาน'}</p>
                  <p className="text-sm font-bold">{user.name}</p>
                </div>
                
                {(user.role === 'admin' || user.role === 'employee') && (
                  <Link href={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="bg-slate-800 px-4 py-2 rounded-sm text-sm hover:bg-slate-700">
                    จัดการระบบ
                  </Link>
                )}
                <button onClick={handleLogout} className="bg-red-600 px-4 py-2 rounded-sm text-sm hover:bg-red-700">
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="bg-slate-800 px-4 py-2 rounded-sm text-sm">เข้าสู่ระบบ</Link>
                <Link href="/register" className="bg-blue-600 px-4 py-2 rounded-sm text-sm">สมัครสมาชิก</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}