'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const router = useRouter();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // 1. ตรวจสอบว่ารหัสผ่านตรงกันหรือไม่
    if (password !== confirmPassword) {
      setError('❌ รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (password.length < 4) {
      setError('❌ รหัสผ่านต้องมีความยาวอย่างน้อย 4 ตัวอักษร');
      return;
    }

    setIsLoading(true);

    // จำลองเวลาดีเลย์ของเซิร์ฟเวอร์
    setTimeout(() => {
      // 2. ดึงข้อมูลผู้ใช้เก่าจาก Local Storage (ถ้ามี)
      const existingUsers = JSON.parse(localStorage.getItem('solar_users') || '[]');
      
      // 3. ตรวจสอบว่าอีเมลนี้ถูกใช้สมัครไปแล้วหรือยัง
      const isEmailTaken = existingUsers.some((u: any) => u.email === email);
      
      if (isEmailTaken) {
        setError('❌ อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
        setIsLoading(false);
        return;
      }

      // 4. สร้าง Object ผู้ใช้งานใหม่ (กำหนด Role ให้เป็น Customer เสมอสำหรับหน้าเว็บ)
      const newUser = {
        id: `USR-CUST-${Date.now().toString().slice(-6)}`, // สร้าง ID สุ่มแบบง่ายๆ
        name: name,
        email: email,
        password: password,
        role: 'customer'
      };

      // 5. บันทึกลง Local Storage (จำลองการ INSERT ลง Database)
      existingUsers.push(newUser);
      localStorage.setItem('solar_users', JSON.stringify(existingUsers));
      
      alert('✅ สมัครสมาชิกสำเร็จ! ระบบจะพาท่านไปยังหน้าเข้าสู่ระบบ');
      router.push('/login');
      
      setIsLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-lg border border-slate-200">
        
        {/* ส่วนหัวของฟอร์ม */}
        <div className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4 group">
            <span className="text-4xl grayscale group-hover:grayscale-0 transition-all cursor-pointer">☀️</span>
            <h1 className="text-3xl font-bold text-slate-900 tracking-wide">
              Solar<span className="text-blue-700">Tech</span>
            </h1>
          </div>
          <h2 className="text-xl font-bold text-slate-800">สมัครสมาชิก (Create Account)</h2>
          <p className="mt-2 text-sm text-slate-500">สร้างบัญชีเพื่อเริ่มต้นสั่งซื้อและประเมินระบบโซล่าเซลล์</p>
        </div>

        {/* ฟอร์มสมัครสมาชิก */}
        <form className="mt-8 space-y-5" onSubmit={handleRegister}>
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100 text-center font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="name">
                ชื่อ-นามสกุล (Full Name)
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                placeholder="ชื่อ นามสกุล"
              />
            </div>
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
                className="appearance-none block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
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
                className="appearance-none block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                placeholder="กำหนดรหัสผ่าน (อย่างน้อย 4 ตัว)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1" htmlFor="confirmPassword">
                ยืนยันรหัสผ่าน (Confirm Password)
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 border border-slate-300 placeholder-slate-400 text-slate-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors sm:text-sm"
                placeholder="กรอกรหัสผ่านอีกครั้ง"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-700 hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {isLoading ? 'กำลังสร้างบัญชี...' : 'สมัครสมาชิก'}
            </button>
          </div>
        </form>

        {/* ลิงก์กลับไปหน้า Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            มีบัญชีผู้ใช้งานอยู่แล้ว?{' '}
            <Link href="/login" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
              เข้าสู่ระบบที่นี่
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}