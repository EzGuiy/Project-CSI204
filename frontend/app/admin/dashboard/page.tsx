// frontend/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  
  // States สำหรับเก็บข้อมูล
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  // State สำหรับจัดการ Tab เมนู
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'settings'>('overview');

  useEffect(() => {
    // 1. ตรวจสอบสิทธิ์
    const session = localStorage.getItem('solar_session');
    if (!session) {
      router.push('/login');
      return;
    }

    const userData = JSON.parse(session);
    if (userData.role !== 'admin') {
      alert('❌ Access Denied: บัญชีของคุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push('/');
    } else {
      setIsAdmin(true);
      setAdminName(userData.name || 'Admin');
      loadUsers();
      loadProducts();
    }
  }, [router]);

  const loadUsers = () => {
    const storedUsers = localStorage.getItem('solar_users');
    if (storedUsers) setUsers(JSON.parse(storedUsers));
  };

  const loadProducts = () => {
    const storedProducts = localStorage.getItem('solar_products');
    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      // 📦 ข้อมูลสินค้าจำลองเริ่มต้น (อ้างอิงจาก mockProductsDb ของคุณ)
      const initialProducts = [
        { id: '1', name: 'Jinko Solar Tiger Pro 550W', category: 'บ้านพักอาศัย (Residential)', price: 4500, stock: 45 },
        { id: '2', name: 'Longi Hi-MO 5 540W', category: 'บ้านพักอาศัย (Residential)', price: 4200, stock: 60 },
        { id: '3', name: 'Huawei SUN2000-5KTL', category: 'ภาคพาณิชย์และอุตสาหกรรม', price: 28500, stock: 15 },
        { id: '4', name: 'Growatt MIN 3000TL-X', category: 'บ้านพักอาศัย (Residential)', price: 15900, stock: 22 },
        { id: '5', name: 'รางอลูมิเนียม Mounting Rail 4.2m', category: 'อุปกรณ์ติดตั้ง', price: 650, stock: 150 },
        { id: '6', name: 'แบตเตอรี่ลิเธียม Huawei LUNA2000', category: 'ระบบกักเก็บพลังงาน', price: 95000, stock: 8 },
      ];
      // บันทึกลง Local Storage เพื่อให้จัดการได้
      localStorage.setItem('solar_products', JSON.stringify(initialProducts));
      setProducts(initialProducts);
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของ "${userName}"?`)) {
      const updatedUsers = users.filter((user) => user.id !== userId);
      localStorage.setItem('solar_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    }
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`🗑️ ยืนยันการลบสินค้า "${productName}" ออกจากระบบ?`)) {
      const updatedProducts = products.filter((product) => product.id !== productId);
      localStorage.setItem('solar_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('solar_session');
    window.location.href = '/login';
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-medium">
        กำลังตรวจสอบสิทธิ์แอดมิน...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800">
      {/* 🧭 Sidebar */}
      <aside className="w-64 bg-slate-950 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <span className="text-2xl">🛡️</span>
          <h1 className="text-xl font-bold tracking-wide">Admin Control</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeTab === 'overview' ? 'bg-blue-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <span>📊</span> ภาพรวมระบบ
          </button>
          
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeTab === 'users' ? 'bg-blue-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <span>👥</span> จัดการผู้ใช้งาน
          </button>

          {/* 🆕 เพิ่มปุ่มจัดการสินค้า */}
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeTab === 'products' ? 'bg-blue-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <span>📦</span> จัดการสินค้า (Products)
          </button>

          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${
              activeTab === 'settings' ? 'bg-blue-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <span>⚙️</span> ตั้งค่าระบบ Solar
          </button>
        </nav>

      </aside>

      {/* 💻 Main Content */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              {activeTab === 'overview' && 'แผงควบคุมระบบ SolarTech (Overview)'}
              {activeTab === 'users' && 'จัดการผู้ใช้งานในระบบ'}
              {activeTab === 'products' && 'จัดการคลังสินค้า (Inventory)'}
              {activeTab === 'settings' && 'ตั้งค่าระบบ (Settings)'}
            </h2>
            <p className="text-slate-500 mt-1">ผู้ดูแลระบบ: <span className="text-blue-700 font-bold">{adminName}</span></p>
          </div>
          <span className="bg-blue-100 text-blue-800 font-bold px-3 py-1.5 rounded-full text-xs uppercase tracking-wider shadow-sm border border-blue-200">
            Admin Session Active
          </span>
        </header>

        {/* ----------------- 🖥️ ส่วนแสดงผล: ภาพรวมระบบ (Overview) ----------------- */}
        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* 🆕 ปรับ Grid เป็น 4 คอลัมน์ และเพิ่มการ์ดสินค้า */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">ผู้ใช้สมัครใหม่</div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{users.length} <span className="text-sm font-normal text-slate-400">คน</span></div>
              </div>
              
              {/* 📦 การ์ดแสดงจำนวนสินค้า */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-200/80 relative overflow-hidden">
                <div className="absolute -right-4 -bottom-4 text-6xl opacity-10 grayscale">📦</div>
                <div className="text-blue-600 text-sm font-bold uppercase tracking-wider mb-1">สินค้าที่วางขายอยู่</div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{products.length} <span className="text-sm font-normal text-slate-400">รายการ</span></div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">บัญชีทดสอบในโค้ด</div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">3 <span className="text-sm font-normal text-slate-400">บัญชี</span></div>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">สถานะระบบ</div>
                <div className="text-xl font-bold text-emerald-600 mt-2 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  ออนไลน์ (Online)
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- 👥 ส่วนแสดงผล: จัดการผู้ใช้งาน (Users) ----------------- */}
        {activeTab === 'users' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* โค้ดตาราง User เดิม (ย่อไว้เพื่อความกระชับ) */}
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-sm">
                     <th className="p-4 pl-6">รหัสผู้ใช้</th><th className="p-4">ชื่อ-นามสกุล</th>
                     <th className="p-4">อีเมล</th><th className="p-4">สิทธิ์ (Role)</th>
                     <th className="p-4 pr-6 text-center">จัดการ</th>
                   </tr>
                 </thead>
                 <tbody>
                   {users.length === 0 ? (
                     <tr><td colSpan={5} className="p-8 text-center text-slate-400">📭 ยังไม่มีผู้ใช้สมัครใหม่</td></tr>
                   ) : (
                     users.map((user) => (
                       <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/80 text-sm">
                         <td className="p-4 pl-6 font-mono text-xs text-slate-500">{user.id}</td>
                         <td className="p-4 font-semibold text-slate-800">{user.name}</td>
                         <td className="p-4 text-slate-600">{user.email}</td>
                         <td className="p-4"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs uppercase">{user.role}</span></td>
                         <td className="p-4 pr-6 text-center">
                           <button onClick={() => handleDeleteUser(user.id, user.name)} className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-200">ลบ</button>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
             </div>
           </div>
        )}

        {/* ----------------- 📦 ส่วนแสดงผล: จัดการสินค้า (Products) ----------------- */}
        {activeTab === 'products' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-4">
              <p className="text-slate-600">รายการสินค้าทั้งหมดที่แสดงบนหน้าเว็บไซต์</p>
              <button onClick={() => alert('ฟังก์ชัน "เพิ่มสินค้าใหม่" จะอัปเดตในเวอร์ชันถัดไป!')} className="bg-slate-900 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2">
                <span>➕</span> เพิ่มสินค้าใหม่
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-sm">
                      <th className="p-4 pl-6">รหัสสินค้า</th>
                      <th className="p-4">ชื่อสินค้า (Product Name)</th>
                      <th className="p-4">หมวดหมู่</th>
                      <th className="p-4 text-right">ราคา (บาท)</th>
                      <th className="p-4 text-center">สต๊อกคงเหลือ</th>
                      <th className="p-4 pr-6 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                          📭 คลังสินค้าว่างเปล่า (ไม่มีสินค้าในระบบ)
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-sm">
                          <td className="p-4 pl-6 font-mono text-xs text-slate-500">SKU-{product.id.padStart(3, '0')}</td>
                          <td className="p-4 font-semibold text-slate-800">{product.name}</td>
                          <td className="p-4 text-slate-500 text-xs">{product.category}</td>
                          <td className="p-4 text-right font-bold text-blue-700">{product.price.toLocaleString()}</td>
                          <td className="p-4 text-center">
                            <span className={`px-2.5 py-1 rounded-md text-xs font-bold ${
                              product.stock > 20 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                            }`}>
                              {product.stock} ชิ้น
                            </span>
                          </td>
                          <td className="p-4 pr-6 text-center">
                            <button
                              onClick={() => handleDeleteProduct(product.id, product.name)}
                              className="text-red-500 hover:text-red-700 font-bold text-sm px-2 py-1 transition-colors"
                            >
                              ลบออก
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ----------------- ⚙️ ส่วนแสดงผล: ตั้งค่าระบบ (Settings) ----------------- */}
        {activeTab === 'settings' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="text-6xl mb-4 grayscale opacity-50">⚙️</span>
            <h3 className="text-xl font-bold text-slate-600">กำลังพัฒนาระบบตั้งค่า</h3>
            <p className="mt-2 text-sm">หน้านี้เตรียมไว้สำหรับเพิ่มฟังก์ชันการตั้งค่าต่างๆ ในอนาคต</p>
          </div>
        )}

      </main>
    </div>
  );
}