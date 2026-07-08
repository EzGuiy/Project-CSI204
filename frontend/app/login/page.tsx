'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  // 🗄️ จำลองฐานข้อมูลผู้ใช้งาน (Mock Database) 3 ระดับ
  const mockUsers = [
    { 
      id: 'USR-CUST-01', 
      name: 'สมชาย พลังงานดี', 
      email: 'customer@solartech.com', 
      password: '1234', 
      role: 'customer' 
    },
    { 
      id: 'USR-EMP-02', 
      name: 'วิศวกร สมศักดิ์', 
      email: 'employee@solartech.com', 
      password: '1234', 
      role: 'employee' 
    },
    { 
      id: 'USR-ADM-03', 
      name: 'แอดมิน สมปอง', 
      email: 'admin@solartech.com', 
      password: '1234', 
      role: 'admin' 
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // จำลองเวลาดีเลย์ของเซิร์ฟเวอร์ 0.8 วินาที
    setTimeout(() => {
      // 1. ดึงข้อมูลบัญชีที่ลูกค้าสมัครเข้ามาใหม่จาก Local Storage
      const registeredUsers = JSON.parse(localStorage.getItem('solar_users') || '[]');
      
      // 2. นำข้อมูลทดสอบ (mockUsers) มารวมกับบัญชีที่สมัครใหม่
      const allValidUsers = [...mockUsers, ...registeredUsers];
      
      // 3. ค้นหาว่ามีอีเมลและรหัสผ่านตรงกับในระบบหรือไม่
      const user = allValidUsers.find((u: any) => u.email === email && u.password === password);
  
      if (user) {
        // 🔐 ลบ Password ออกก่อนเก็บเป็น JSON Session ลง Local Storage
        const sessionData = {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
        
        localStorage.setItem('solar_session', JSON.stringify(sessionData));
        
        alert(`✅ เข้าสู่ระบบสำเร็จ!\nยินดีต้อนรับ: ${user.name}\nสิทธิ์การใช้งาน: ${user.role.toUpperCase()}`);
        
        // เข้าสู่ระบบสำเร็จแล้วให้เด้งกลับไปหน้าแรก
        router.push('/');
        router.refresh(); // รีเฟรชเพื่อให้ Navbar ดึงข้อมูลใหม่
      } else {
        setError('❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง');
      }
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-slate-200">
        
        {/* ส่วนหัวของฟอร์ม (Header) */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4 group cursor-pointer">
            <span className="text-4xl grayscale group-hover:grayscale-0 transition-all">☀️</span>
            <h1 className="text-3xl font-bold text-slate-900 tracking-wide">
              Solar<span className="text-blue-700">Tech</span>
            </h1>
          </div>
          <h2 className="text-xl font-bold text-slate-800">เข้าสู่ระบบ (Sign In)</h2>
          <p className="mt-2 text-sm text-slate-500">กรุณากรอกข้อมูลบัญชีเพื่อเข้าใช้งานแพลตฟอร์ม</p>
        </div>

        {/* ฟอร์มเข้าสู่ระบบ */}
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          
          {/* ข้อความแจ้งเตือน Error */}
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="email">
                อีเมล (Email)
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                placeholder="name@company.com"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="password">
                รหัสผ่าน (Password)
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none relative block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-700 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? 'กำลังตรวจสอบข้อมูล...' : 'เข้าสู่ระบบ'}
            </button>
          </div>
        </form>

        {/* 🔗 ส่วนลิงก์ไปหน้าสมัครสมาชิกที่เพิ่มเข้ามาใหม่ */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            ยังไม่มีบัญชีผู้ใช้งาน?{' '}
            <Link href="/register" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
              สมัครสมาชิกที่นี่
            </Link>
          </p>
        </div>

        {/* คู่มือสำหรับอาจารย์ทดสอบ (Mock Login Details) */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <p className="text-xs font-semibold text-slate-500 mb-3 text-center uppercase tracking-wider">
            ข้อมูลบัญชีสำหรับทดสอบ (Test Accounts)
          </p>
          <div className="text-xs text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-2 font-mono">
            <p>Customer: <span className="text-blue-600 font-bold">customer@solartech.com</span></p>
            <p>Employee: <span className="text-blue-600 font-bold">employee@solartech.com</span></p>
            <p>Admin: <span className="text-blue-600 font-bold">admin@solartech.com</span></p>
            <p className="mt-2 text-slate-400 border-t border-slate-200 pt-2">Password ทุกบัญชี: <span className="font-bold text-slate-700">1234</span></p>
          </div>
        </div>

      </div>
    </div>
  );
}