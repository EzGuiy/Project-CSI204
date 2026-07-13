'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product { id: string; name: string; category: string; price: number; stock: number; image?: string; description?: string; }
interface Order { id: string; date: string; total: number; status: string; shipping: { fullName: string; }; }
// 🌟 เปลี่ยนจาก 'user' เป็น 'customer' ให้ตรงกับ db.json
interface User { id: string; username: string; name: string; role: 'customer' | 'employee' | 'admin'; }

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'inventory' | 'orders'>('overview');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  // States สำหรับจัดการสินค้า
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'บ้านพักอาศัย (Residential)', price: 0, stock: 0, image: '', description: '' });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // 🔐 ตรวจสอบสิทธิ์การเข้าถึง (ต้องเป็น admin เท่านั้น)
  useEffect(() => {
    const session = localStorage.getItem('solar_session');
    if (!session) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(session);
    if (userData.role !== 'admin') {
      alert('❌ คุณไม่มีสิทธิ์เข้าถึงหน้านี้');
      router.push('/');
    } else {
      setIsAdmin(true);
      setAdminName(userData.name);
      loadDashboardData();
    }
  }, [router]);

  // 📦 ดึงข้อมูลทั้งหมด
  const loadDashboardData = async () => {
    try {
      const [resProducts, resOrders, resUsers] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/orders'),
        fetch('/api/users') // 🌟 ดึงข้อมูล Users จาก API
      ]);
      
      if (resProducts.ok) setProducts(await resProducts.json());
      if (resOrders.ok) {
        const data = await resOrders.json();
        const sorted = data.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(sorted);
      }
      
      // 🌟 นำข้อมูลจริงมาแสดง
      if (resUsers.ok) {
        setUsers(await resUsers.json());
      } else {
        // ข้อมูลจำลองกรณีที่ API ยังไม่พร้อม (เปลี่ยน role เป็น customer)
        setUsers([
          { id: 'u1', username: 'admin', name: 'วิศวกร สมศักดิ์', role: 'admin' },
          { id: 'u2', username: 'emp01', name: 'พนักงาน ประจำร้าน', role: 'employee' },
          { id: 'u3', username: 'customer1', name: 'คุณลูกค้า สมชาย', role: 'customer' },
          { id: 'u4', username: 'customer2', name: 'คุณลูกค้า สมหญิง', role: 'customer' },
        ]);
      }
    } catch (error) {
      console.error('Error loading data', error);
    }
  };

  // ==========================================
  // ฟังก์ชันจัดการ User, สินค้า และ ออเดอร์
  // ==========================================
  // 👥 เปลี่ยนสิทธิ์ผู้ใช้งาน (Role Management)
  const handleRoleChange = async (userId: string, newRole: string) => {
    if (confirm(`ยืนยันการปรับสิทธิ์ผู้ใช้งานนี้เป็น "${newRole.toUpperCase()}" ใช่หรือไม่?`)) {
      // อัปเดตหน้าจอทันทีเพื่อความรวดเร็ว
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
      
      try {
        // 🌟 ส่งข้อมูลไปเซฟลง db.json ผ่าน API
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: userId, role: newRole })
        });
        
        if (res.ok) {
          alert('อัปเดตสิทธิ์ผู้ใช้งานลงฐานข้อมูลสำเร็จ!');
        }
      } catch (error) {
        console.error('Error updating role:', error);
      }
    }
  }

  const updateStock = async (id: string, amount: number) => {
    const updated = products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p);
    setProducts(updated);
    try {
      await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, amount }) });
    } catch (error) { console.error('Error updating stock', error); }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${name}"?`)) {
      try {
        const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        if (res.ok) loadDashboardData();
      } catch (error) { console.error('Error deleting product', error); }
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newProduct) });
      if (res.ok) {
        alert('เพิ่มสินค้าสำเร็จ');
        setShowAddModal(false);
        setNewProduct({ name: '', category: 'บ้านพักอาศัย (Residential)', price: 0, stock: 0, image: '', description: '' });
        loadDashboardData();
      }
    } catch (error) { console.error('Error adding product', error); }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editingProduct) });
      if (res.ok) {
        alert('บันทึกการแก้ไขสินค้าสำเร็จ');
        setShowEditModal(false);
        setEditingProduct(null);
        loadDashboardData();
      }
    } catch (error) { console.error('Error editing product', error); }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (confirm(`ยืนยันการเปลี่ยนสถานะเป็น "${newStatus}" ใช่หรือไม่?`)) {
      try {
        const res = await fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, status: newStatus }) });
        if (res.ok) loadDashboardData();
      } catch (error) { console.error('Error updating order', error); }
    } else {
      loadDashboardData(); 
    }
  };

  if (!isAdmin) return null;

  // 📊 คำนวณสถิติยอดขาย
  const currentYear = new Date().getFullYear();
  const successfulOrders = orders.filter(o => o.status === 'จัดส่งสำเร็จ' || o.status === 'delivered');
  const totalRevenue = successfulOrders.reduce((sum, o) => sum + o.total, 0);
  const totalOrders = successfulOrders.length;
  const pendingOrders = orders.filter(o => o.status === 'รอชำระเงิน' || o.status === 'ตรวจสอบ' || o.status === 'processing').length;

  const monthlySales = Array(12).fill(0);
  successfulOrders.forEach(order => {
    const d = new Date(order.date);
    if (d.getFullYear() === currentYear) monthlySales[d.getMonth()] += order.total;
  });
  const maxMonthlySale = Math.max(...monthlySales) || 1;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row font-sans">
      
      {/* ⬅️ Sidebar */}
      <aside className="w-full md:w-64 bg-indigo-950 text-white flex flex-col shrink-0 z-10 shadow-xl">
        <div className="p-6 border-b border-indigo-900/50">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-widest">Admin</span>
          </div>
          <h2 className="text-xl font-bold tracking-wide">Management Center</h2>
          <p className="text-indigo-300 text-sm mt-1">ผู้ดูแลระบบ: {adminName}</p>
        </div>
        <nav className="p-4 space-y-2 flex-grow">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-300 hover:bg-indigo-900/50'}`}>
            <span>📈</span> สถิติและยอดขาย
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-indigo-300 hover:bg-indigo-900/50'}`}>
            <span>👥</span> จัดการสิทธิ์ผู้ใช้งาน
          </button>
          <div className="pt-4 pb-2">
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider px-4">ระบบปฏิบัติการ</p>
          </div>
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'inventory' ? 'bg-slate-800 text-white shadow-md' : 'text-indigo-300 hover:bg-indigo-900/50'}`}>
            <span>📦</span> จัดการสต๊อกสินค้า
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'orders' ? 'bg-slate-800 text-white shadow-md' : 'text-indigo-300 hover:bg-indigo-900/50'}`}>
            <span>🚚</span> จัดการคำสั่งซื้อ
          </button>
        </nav>
        <div className="p-4 border-t border-indigo-900/50">
          <Link href="/" className="w-full bg-indigo-900 hover:bg-indigo-800 text-center block py-2.5 rounded-lg text-sm font-bold text-white transition-colors">
            กลับหน้าร้านค้า
          </Link>
        </div>
      </aside>

      {/* ➡️ Main Content */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto">
        
        {/* === แท็บ 1: ภาพรวม === */}
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto animate-in fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">📊</span> รายงานสถิติภาพรวมธุรกิจ ประจำปี {currentYear}
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-50 rounded-full z-0"></div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2 relative z-10">รายได้สุทธิ (สะสม)</p>
                <p className="text-3xl font-black text-indigo-700 relative z-10">฿{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">คำสั่งซื้อสำเร็จ</p>
                <p className="text-3xl font-black text-emerald-600">{totalOrders} <span className="text-sm font-medium text-slate-400">ออเดอร์</span></p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">ออเดอร์รอตรวจสอบ</p>
                <p className="text-3xl font-black text-amber-500">{pendingOrders} <span className="text-sm font-medium text-slate-400">ออเดอร์</span></p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">ผู้ใช้งานในระบบ</p>
                <p className="text-3xl font-black text-blue-600">{users.length} <span className="text-sm font-medium text-slate-400">บัญชี</span></p>
              </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm mb-8">
              <h2 className="font-bold text-slate-800 mb-8 flex items-center gap-2">
                <span>📈</span> กราฟยอดขายรายเดือน (Monthly Sales Revenue)
              </h2>
              <div className="h-64 flex items-end gap-2 md:gap-4 mt-10">
                {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'].map((month, index) => {
                  const saleValue = monthlySales[index];
                  const heightPercent = (saleValue / maxMonthlySale) * 100;
                  return (
                    <div key={month} className="flex-1 flex flex-col items-center group">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] py-1 px-2 rounded mb-2 whitespace-nowrap pointer-events-none">
                        ฿{saleValue.toLocaleString()}
                      </div>
                      <div className="w-full max-w-[40px] bg-indigo-100 rounded-t-md relative flex justify-end flex-col overflow-hidden">
                        <div className="w-full bg-indigo-600 rounded-t-md transition-all duration-1000 ease-out" style={{ height: `${heightPercent}%`, minHeight: saleValue > 0 ? '4px' : '0' }}></div>
                      </div>
                      <p className="text-[10px] md:text-xs text-slate-500 mt-3 font-medium">{month}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* === แท็บ 2: จัดการ Users === */}
        {activeTab === 'users' && (
          <div className="max-w-6xl mx-auto animate-in fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><span className="text-3xl">👥</span> จัดการบัญชีและสิทธิ์ผู้ใช้งาน</h1>
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center"><p className="text-sm text-slate-600">พนักงานและลูกค้าทั้งหมดในระบบ</p></div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                    <tr><th className="px-6 py-4 font-bold">ชื่อ - นามสกุล</th><th className="px-6 py-4 font-bold">Username</th><th className="px-6 py-4 font-bold">สถานะ/สิทธิ์ปัจจุบัน</th><th className="px-6 py-4 font-bold text-center">จัดการสิทธิ์</th></tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-slate-900">{user.name}</td>
                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{user.username}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-3 py-1 rounded-full text-[11px] font-bold border ${user.role === 'admin' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' : user.role === 'employee' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>{user.role.toUpperCase()}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {/* 🌟 จุดที่ 3 ที่ได้แก้ไขและนำมาใส่ให้เรียบร้อยแล้ว */}
                          <select 
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            disabled={user.id === 'u1'} // ป้องกันไม่ให้แอดมินคนแรกปลดตัวเอง
                            className="text-xs font-bold border border-slate-300 rounded-lg px-3 py-2 bg-white outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <option value="customer">CUSTOMER (ลูกค้า)</option>
                            <option value="employee">EMPLOYEE (พนักงาน)</option>
                            <option value="admin">ADMIN (ผู้ดูแลระบบ)</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === แท็บ 3: จัดการสต๊อก (เหมือนพนักงาน) === */}
        {activeTab === 'inventory' && (
          <div className="max-w-5xl mx-auto animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><span className="text-3xl">📦</span> จัดการสต๊อกสินค้า</h1>
              <button onClick={() => setShowAddModal(true)} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors">+ เพิ่มสินค้าใหม่</button>
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm">
                      <th className="p-4 pl-6">รหัส</th><th className="p-4">ชื่อสินค้า</th><th className="p-4">หมวดหมู่</th><th className="p-4">ราคา</th><th className="p-4 text-center">จำนวนในคลัง</th><th className="p-4 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-slate-50 transition-colors text-sm">
                        <td className="p-4 text-slate-500 pl-6">#{product.id}</td>
                        <td className="p-4 font-semibold text-slate-900">{product.name}</td>
                        <td className="p-4 text-slate-500">{product.category}</td>
                        <td className="p-4 text-slate-900 font-bold">฿{product.price.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => updateStock(product.id, -1)} className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-100">-</button>
                            <span className={`w-8 text-center font-bold ${product.stock < 5 ? 'text-red-600' : 'text-slate-900'}`}>{product.stock}</span>
                            <button onClick={() => updateStock(product.id, 1)} className="w-8 h-8 flex items-center justify-center border border-slate-300 rounded-lg hover:bg-slate-100">+</button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            <button onClick={() => { setEditingProduct(product); setShowEditModal(true); }} className="text-blue-500 hover:text-blue-700 font-bold text-xs px-2 py-1 transition-colors">แก้ไข</button>
                            <button onClick={() => handleDeleteProduct(product.id, product.name)} className="text-red-500 hover:text-red-700 font-bold text-xs px-2 py-1 transition-colors">ลบออก</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* === แท็บ 4: จัดการคำสั่งซื้อ (เหมือนพนักงาน) === */}
        {activeTab === 'orders' && (
          <div className="max-w-5xl mx-auto animate-in fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><span className="text-3xl">🚚</span> ตรวจสอบคำสั่งซื้อ</h1>
            {orders.length === 0 ? (
              <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200">ยังไม่มีคำสั่งซื้อในระบบ</div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-bold text-slate-900">รหัสออเดอร์: <span className="font-mono text-blue-600">{order.id}</span></p>
                      <p className="text-sm text-slate-500 mt-1">ลูกค้า: {order.shipping?.fullName || 'ไม่ระบุ'} <span className="text-xs text-slate-400">({new Date(order.date).toLocaleDateString('th-TH')})</span></p>
                      <p className="text-sm font-bold text-slate-900 mt-1">ยอดรวม: ฿{order.total.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <span className="text-sm font-bold text-slate-600 shrink-0">สถานะ:</span>
                      <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)} className={`text-sm font-bold px-4 py-2.5 rounded-xl border outline-none cursor-pointer transition-all w-full md:w-auto ${order.status === 'จัดส่งสำเร็จ' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : order.status === 'กำลังจัดส่ง' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        <option value="รอชำระเงิน">รอชำระเงิน</option><option value="ตรวจสอบ">ตรวจสอบ</option><option value="กำลังจัดส่ง">กำลังจัดส่ง</option><option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </main>

      {/* 🔴 Modal เพิ่มสินค้า (เหมือนพนักงาน) */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-5">📦 เพิ่มสินค้าใหม่</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <input required type="text" placeholder="ชื่อสินค้า" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="บ้านพักอาศัย (Residential)">บ้านพักอาศัย (Residential)</option><option value="อินเวอร์เตอร์">อินเวอร์เตอร์</option><option value="อุปกรณ์ติดตั้ง">อุปกรณ์ติดตั้ง</option><option value="ระบบกักเก็บพลังงาน">ระบบกักเก็บพลังงาน</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="ราคา (บาท)" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                <input required type="number" placeholder="สต๊อก" value={newProduct.stock || ''} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setNewProduct({...newProduct, image: reader.result as string});
                  reader.readAsDataURL(file);
                }
              }} className="w-full border rounded-xl p-2 text-sm" />
              <textarea required rows={3} placeholder="รายละเอียดสินค้า..." value={newProduct.description || ''} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 Modal แก้ไขสินค้า (เหมือนพนักงาน) */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-5">✏️ แก้ไขสินค้า</h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 bg-white">
                <option value="บ้านพักอาศัย (Residential)">บ้านพักอาศัย (Residential)</option><option value="อินเวอร์เตอร์">อินเวอร์เตอร์</option><option value="อุปกรณ์ติดตั้ง">อุปกรณ์ติดตั้ง</option><option value="ระบบกักเก็บพลังงาน">ระบบกักเก็บพลังงาน</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
                <input required type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <input type="file" accept="image/*" onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => setEditingProduct({...editingProduct, image: reader.result as string});
                  reader.readAsDataURL(file);
                }
              }} className="w-full border rounded-xl p-2 text-sm" />
              <textarea required rows={3} value={editingProduct.description || ''} onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} className="w-full border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingProduct(null); }} className="flex-1 bg-slate-100 py-3 rounded-xl font-bold">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold">บันทึกการแก้ไข</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}