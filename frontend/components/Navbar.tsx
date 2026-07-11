'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation'; // 1. เพิ่ม useRouter เข้ามาเพื่อใช้เปลี่ยนหน้า

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter(); // 2. เรียกใช้งาน useRouter

  // ไม่แสดง Navbar ในหน้า Login และ Register
  if (pathname === '/login' || pathname === '/register') return null;

  // 3. สร้างฟังก์ชันสำหรับจัดการการออกจากระบบ
  const handleLogout = () => {
    localStorage.removeItem('solar_session'); // ลบข้อมูลการล็อกอินออก
    
    // (เพิ่มเติม) ถ้าต้องการให้ล้างตะกร้าสินค้าตอนลบเซสชันด้วย สามารถเปิดใช้งานบรรทัดล่างนี้ได้ครับ
    // localStorage.removeItem('solar_cart'); 
    
    alert('ออกจากระบบเรียบร้อยแล้ว');
    router.push('/login'); // พากลับไปยังหน้าล็อกอิน
  };

  return (
    <nav className="bg-[#0f172a] text-white border-b border-slate-800 sticky top-0 z-50 shadow-sm">
      {/* ขยาย max-w ให้กว้างขึ้นเป็น 1600px เพื่อรองรับเมนูจำนวนมาก */}
      <div className="max-w-[1600px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20 gap-6">

          {/* 1. โลโก้ (ด้านซ้าย) - ใส่ flex-shrink-0 ป้องกันโดนบีบ */}
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
              <Link href="/cart" className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-sm text-sm font-bold hover:bg-slate-100 transition-colors shadow-sm">
                <span>🛒</span>
                <span className="hidden xl:inline">ตะกร้าสินค้า</span>
              </Link>

              <Link href="/orders" className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors">
                <span>📋</span>
                <span className="hidden xl:inline">คำสั่งซื้อ</span>
              </Link>
            </div>

            {/* กลุ่มที่ 2: โปรไฟล์พนักงาน และ ปุ่มออก */}
            <div className="hidden md:flex items-center gap-4">
              <div className="hidden xl:block text-right">
                <p className="text-xs text-slate-400 leading-none mb-1">สวัสดี, วิศวกร</p>
                <p className="text-sm font-bold text-white leading-none">สมศักดิ์</p>
              </div>
              
              <Link href="/dashboard" className="bg-slate-800 text-white border border-slate-600 px-4 py-2 rounded-sm text-sm font-bold hover:bg-slate-700 transition-colors">
                แดชบอร์ด
              </Link>
              
              {/* 4. ใส่ onClick={handleLogout} ให้กับปุ่มออกระบบ */}
              <button 
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-sm text-sm font-bold hover:bg-red-700 transition-colors"
              >
                ออกจากระบบ
              </button>
            </div>

          </div>

        </div>
      </div>
    </nav>
  );
}