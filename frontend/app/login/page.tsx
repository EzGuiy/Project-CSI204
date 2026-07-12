'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      // 1. ดึงข้อมูล User ทั้งหมดจาก API
      const response = await fetch('/api/users');
      const users = await response.json();

      // 2. ค้นหาว่ามี Username/Email และ Password ตรงกันไหม
      const user = users.find((u: any) => 
        (u.username === username || u.email === username) && u.password === password
      );

     if (user) {
        const userData = {
          id: user.id,
          username: user.username,
          role: user.role,
          name: user.name
        };
        
        // 🌟 แก้ไข: เปลี่ยนจาก 'user' เป็น 'solar_session'
        localStorage.setItem('solar_session', JSON.stringify(userData));
        
        if (user.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (user.role === 'employee') {
          router.push('/dashboard');
        } else {
          router.push('/');
        }
      } else {
        setErrorMsg('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } catch (error) {
      setErrorMsg('ระบบเกิดข้อผิดพลาด กรุณาลองใหม่');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white p-8 rounded-sm shadow-sm border border-zinc-200 w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-6 text-zinc-900">เข้าสู่ระบบ</h1>
        
        {errorMsg && (
          <div className="bg-red-100 text-red-600 p-3 rounded-sm text-sm mb-4 font-medium text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            {/* เปลี่ยน Label ให้สื่อความหมายชัดเจนขึ้น */}
            <label className="block text-sm font-medium text-zinc-700 mb-1">ชื่อผู้ใช้งาน หรือ อีเมล</label>
            <input 
              type="text" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-sm focus:outline-none focus:border-zinc-500" 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1">รหัสผ่าน</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-zinc-300 rounded-sm focus:outline-none focus:border-zinc-500" 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-zinc-900 text-white font-bold py-2 rounded-sm hover:bg-zinc-800 transition-colors">
            เข้าสู่ระบบ
          </button>
        </form>
      </div>
    </div>
  );
}