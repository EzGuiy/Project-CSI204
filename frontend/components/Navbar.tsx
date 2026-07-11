'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [session, setSession] = useState<SessionUser | null>(null);

  // ดึงข้อมูล session เมื่อหน้าเว็บโหลดขึ้นมา (ฝั่ง Client-side เท่านั้น เพื่อเลี่ยง Hydration Error)
  useEffect(() => {
    const getSession = () => {
      const stored = localStorage.getItem('solar_session');
      if (stored) {
        try {
          setSession(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        setSession(null);
      }
    };

    getSession();

    // ดักจับ storage event หากมีการล็อกอิน/ล็อกเอาต์ข้ามแท็บ
    window.addEventListener('storage', getSession);
    return () => window.removeEventListener('storage', getSession);
  }, [pathname]); // ตรวจสอบใหม่ทุกครั้งที่มีการเปลี่ยนหน้าด้วย เพื่ออัปเดต Navbar ทันที

  // ไม่แสดง Navbar ในหน้า Login และ Register
  if (pathname === '/login' || pathname === '/register') return null;

  const handleLogout = () => {
    localStorage.removeItem('solar_session');
    setSession(null);
    alert('ออกจากระบบเรียบร้อยแล้ว');
    router.push('/login');
  };

  return (
    <nav className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-50 shadow-sm font-sans">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20 gap-6">

          {/* 1. โลโก้ (ด้านซ้าย) */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 pr-4">
            <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
              <span className="text-xl">⚙️</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-white leading-none">SolarTech</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-widest mt-1">ENERGY SOLUTIONS</span>
            </div>
          </Link>

          {/* 2. เมนูหลัก (ตรงกลาง) */}
          <div className="hidden lg:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">หน้าแรก</Link>
            <Link href="/products" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">แคตตาล็อกสินค้า</Link>
            <Link href="/calculator" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">ประเมินขนาดติดตั้ง</Link>
          </div>

          {/* 3. เมนูผู้ใช้ & ระบบ (ด้านขวา) */}
          <div className="flex items-center gap-4 ml-auto">
            
            {/* กลุ่มที่ 1: ตะกร้า และ คำสั่งซื้อ */}
            <div className="flex items-center gap-4 pr-6 border-r border-slate-700">
              <Link href="/cart" className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-sm text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm animate-in fade-in">
                <span>🛒</span>
                <span className="hidden xl:inline">ตะกร้าสินค้า</span>
              </Link>

              <Link href="/orders" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <span>📋</span>
                <span className="hidden xl:inline">คำสั่งซื้อ</span>
              </Link>
            </div>

            {/* กลุ่มที่ 2: โปรไฟล์ผู้ใช้และปุ่มนำทาง (แสดงผลตามสถานะล็อกอินจริง) */}
            {session ? (
              <div className="flex items-center gap-4 animate-in fade-in">
                <div className="hidden xl:block text-right">
                  <p className="text-[10px] text-slate-400 leading-none mb-1">
                    {session.role === 'admin' ? 'ผู้ดูแลระบบ' : session.role === 'employee' ? 'พนักงาน' : 'สวัสดี'}
                  </p>
                  <p className="text-sm font-bold text-white leading-none">{session.name}</p>
                </div>
                
                {(session.role === 'admin' || session.role === 'employee') && (
                  <Link 
                    href={session.role === 'admin' ? '/admin/dashboard' : '/dashboard'} 
                    className="bg-slate-800 text-white border border-slate-600 px-4 py-2 rounded-sm text-sm font-bold hover:bg-slate-700 transition-colors"
                  >
                    แดชบอร์ด
                  </Link>
                )}
                
                <button 
                  onClick={handleLogout}
                  className="bg-red-600 text-white px-4 py-2 rounded-sm text-sm font-bold hover:bg-red-700 transition-colors"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 animate-in fade-in">
                <Link 
                  href="/login" 
                  className="bg-slate-800 text-white border border-slate-600 px-4 py-2 rounded-sm text-sm font-bold hover:bg-slate-700 transition-colors"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link 
                  href="/register" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-sm text-sm font-bold hover:bg-blue-700 transition-colors"
                >
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