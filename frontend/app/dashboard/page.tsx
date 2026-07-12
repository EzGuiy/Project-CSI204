'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Product { id: string; name: string; category: string; price: number; stock: number; image?: string; }
interface Order { id: string; date: string; total: number; status: string; shipping: { fullName: string; }; }
interface Message { id: string; chatId: string; senderName: string; sender: 'user' | 'agent'; text?: string; isRead: boolean; timestamp: string; }
interface ChatSession { id: string; name: string; lastMessage: string; time: string; unread: number; messages: Message[]; }

export default function EmployeeDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [employeeName, setEmployeeName] = useState('');

  // States
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  
  // State สำหรับฟอร์มเพิ่มสินค้า
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', category: 'บ้านพักอาศัย (Residential)', price: 0, stock: 0, image: '/file.svg' });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔐 ดักจับสิทธิ์การเข้าใช้งาน
  useEffect(() => {
    const session = localStorage.getItem('solar_session');
    if (!session) {
      router.push('/login');
      return;
    }
    const userData = JSON.parse(session);
    if (userData.role !== 'employee' && userData.role !== 'admin') {
      router.push('/');
    } else {
      setIsAuthorized(true);
      setEmployeeName(userData.name);
      loadProducts();
      loadOrders();
    }
  }, [router]);

  // 📦 โหลดสินค้าจาก API
  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) setProducts(await res.json());
    } catch (error) { console.error('Error loading products', error); }
  };

  // 📦 โหลดออเดอร์จาก API
  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        // เรียงออเดอร์ใหม่ล่าสุดไว้ข้างบน
        const sorted = data.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(sorted);
      }
    } catch (error) { console.error('Error loading orders', error); }
  };

  // ⚙️ อัปเดตสต๊อก
  const updateStock = async (id: string, amount: number) => {
    const updated = products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p);
    setProducts(updated);
    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, amount })
      });
    } catch (error) { console.error('Error updating stock', error); }
  };

  // 🗑️ ลบสินค้า
  const handleDeleteProduct = async (id: string, name: string) => {
    if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบสินค้า "${name}"?`)) {
      try {
        const res = await fetch(`/api/products?id=${id}`, { method: 'DELETE' });
        if (res.ok) loadProducts();
      } catch (error) { console.error('Error deleting product', error); }
    }
  };

  // ➕ เพิ่มสินค้าใหม่
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        alert('เพิ่มสินค้าสำเร็จ');
        setShowAddModal(false);
        setNewProduct({ name: '', category: 'บ้านพักอาศัย (Residential)', price: 0, stock: 0, image: '/file.svg' });
        loadProducts();
      }
    } catch (error) { console.error('Error adding product', error); }
  };

  // 🚚 อัปเดตสถานะคำสั่งซื้อ (เปลี่ยนเป็นแบบเลือกสถานะเอง)
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (confirm(`ยืนยันการเปลี่ยนสถานะเป็น "${newStatus}" ใช่หรือไม่?`)) {
      try {
        const res = await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: newStatus })
        });
        if (res.ok) {
          loadOrders(); // รีโหลดข้อมูลเพื่อแสดงสถานะใหม่
        }
      } catch (error) { console.error('Error updating order', error); }
    } else {
      // ถ้ากดยกเลิก ให้โหลดข้อมูลเดิมกลับมาเพื่อรีเซ็ต dropdown
      loadOrders(); 
    }
  };

  // (ฟังก์ชันดึงแชทและส่งแชท)
  const fetchChatsFromAPI = async (): Promise<ChatSession[]> => {
    let allChats: Message[] = [];
    try {
      const res = await fetch('/api/chats');
      if (res.ok) allChats = await res.json();
    } catch (e) {}
    const sessionsMap: { [chatId: string]: Message[] } = {};
    allChats.forEach(msg => {
      if (!sessionsMap[msg.chatId]) sessionsMap[msg.chatId] = [];
      sessionsMap[msg.chatId].push(msg);
    });
    return Object.keys(sessionsMap).map(cId => {
      const msgs = sessionsMap[cId];
      const userMsg = [...msgs].reverse().find(m => m.sender === 'user');
      const senderName = userMsg ? userMsg.senderName : `ลูกค้า (${cId})`;
      const lastMsgObj = msgs[msgs.length - 1];
      let lastMsgText = lastMsgObj.text || '[ส่งรูปถ่าย/สินค้า]';
      const unreadCount = msgs.filter(m => m.sender === 'user' && !m.isRead).length;
      return { id: cId, name: senderName, lastMessage: lastMsgText, time: lastMsgObj.timestamp, unread: unreadCount, messages: msgs };
    });
  };

  useEffect(() => {
    if(!isAuthorized) return;
    const refreshChats = async () => {
      const loaded = await fetchChatsFromAPI();
      setChats(loaded);
    };
    refreshChats();
    const interval = setInterval(refreshChats, 3000);
    return () => clearInterval(interval);
  }, [isAuthorized]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatId) return;
    const newReplyMsg: Message = {
      id: `msg-${Date.now()}-agent`, chatId: selectedChatId, senderName: employeeName, sender: 'agent',
      text: replyText.trim(), timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }), isRead: true,
    };
    await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReplyMsg) });
    setReplyText('');
    setChats(await fetchChatsFromAPI());
  };

  if (!isAuthorized) return null;

  // ข้อมูลสำหรับ Overview
  const totalSales = orders.filter(o => o.status === 'จัดส่งสำเร็จ' || o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'รอชำระเงิน' || o.status === 'ตรวจสอบ' || o.status === 'processing').length;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row font-sans relative">
      
      {/* ⬅️ Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold tracking-wide">Employee Panel</h2>
          <p className="text-zinc-400 text-sm mt-1">เจ้าหน้าที่: {employeeName}</p>
        </div>
        <nav className="p-4 space-y-2 flex-grow">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}>📊 สรุปยอดขาย (Overview)</button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}>📦 จัดการสินค้าคงคลัง</button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTab === 'orders' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}>🚚 ตรวจสอบคำสั่งซื้อ</button>
          <button onClick={() => setActiveTab('chat')} className={`w-full text-left px-4 py-3 rounded-xl transition-all ${activeTab === 'chat' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800'}`}>💬 ตอบแชทลูกค้า</button>
        </nav>
      </aside>

      {/* ➡️ Main Content */}
      <main className="flex-grow p-8 overflow-y-auto">
        
        {/* === แท็บ 1: ภาพรวมยอดขาย === */}
        {activeTab === 'overview' && (
          <div className="max-w-5xl mx-auto animate-in fade-in">
            <h1 className="text-2xl font-bold text-zinc-900 mb-6">สรุปข้อมูลสำหรับพนักงาน</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm text-center">
                <p className="text-zinc-500 text-sm font-bold mb-2">ยอดขายที่สำเร็จแล้ว (บาท)</p>
                <p className="text-4xl font-black text-emerald-600">฿{totalSales.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm text-center">
                <p className="text-zinc-500 text-sm font-bold mb-2">ออเดอร์รอตรวจสอบ/จัดส่ง</p>
                <p className="text-4xl font-black text-amber-500">{pendingOrders} <span className="text-lg">รายการ</span></p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm text-center">
                <p className="text-zinc-500 text-sm font-bold mb-2">สินค้าใกล้หมดสต๊อก (น้อยกว่า 5)</p>
                <p className="text-4xl font-black text-red-600">{products.filter(p => p.stock < 5 && p.stock > 0).length} <span className="text-lg">รายการ</span></p>
              </div>
            </div>
          </div>
        )}

        {/* === แท็บ 2: จัดการสต๊อก === */}
        {activeTab === 'inventory' && (
          <div className="max-w-5xl mx-auto animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-zinc-900">จัดการสต๊อกสินค้า</h1>
              <button onClick={() => setShowAddModal(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-medium">
                + เพิ่มสินค้าใหม่
              </button>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-sm">
                    <th className="p-4 pl-6">รหัส</th><th className="p-4">ชื่อสินค้า</th>
                    <th className="p-4">หมวดหมู่</th><th className="p-4">ราคา</th>
                    <th className="p-4 text-center">จำนวนในคลัง</th><th className="p-4 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-zinc-50 text-sm">
                      <td className="p-4 text-zinc-500 pl-6">#{product.id}</td>
                      <td className="p-4 font-semibold text-zinc-900">{product.name}</td>
                      <td className="p-4 text-zinc-500">{product.category}</td>
                      <td className="p-4 text-zinc-950 font-bold">฿{product.price.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button onClick={() => updateStock(product.id, -1)} className="w-8 h-8 border border-zinc-300 rounded-lg hover:bg-zinc-100">-</button>
                          <span className={`w-8 text-center font-bold ${product.stock < 5 ? 'text-red-600' : 'text-zinc-900'}`}>{product.stock}</span>
                          <button onClick={() => updateStock(product.id, 1)} className="w-8 h-8 border border-zinc-300 rounded-lg hover:bg-zinc-100">+</button>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <button onClick={() => handleDeleteProduct(product.id, product.name)} className="text-red-500 hover:text-red-700 font-bold text-xs">ลบออก</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === แท็บ 3: คำสั่งซื้อ (Orders) === */}
        {activeTab === 'orders' && (
          <div className="max-w-5xl mx-auto animate-in fade-in">
            <h1 className="text-2xl font-bold text-zinc-900 mb-6">ตรวจสอบคำสั่งซื้อ</h1>
            {orders.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 bg-white rounded-2xl border border-zinc-200">ยังไม่มีคำสั่งซื้อในระบบ</div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <p className="font-bold text-slate-900">รหัสออเดอร์: {order.id}</p>
                      <p className="text-sm text-slate-500">ลูกค้า: {order.shipping?.fullName || 'ไม่ระบุ'} ({new Date(order.date).toLocaleDateString('th-TH')})</p>
                      <p className="text-sm font-bold text-blue-600 mt-1">ยอดรวม: ฿{order.total.toLocaleString()}</p>
                    </div>
                    
                    {/* ส่วนจัดการสถานะ (Dropdown) */}
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-slate-600">ปรับสถานะ:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`text-sm font-bold px-4 py-2 rounded-lg border outline-none cursor-pointer transition-colors ${
                          order.status === 'จัดส่งสำเร็จ' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          order.status === 'กำลังจัดส่ง' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        <option value="รอชำระเงิน">รอชำระเงิน</option>
                        <option value="ตรวจสอบ">ตรวจสอบ</option>
                        <option value="กำลังจัดส่ง">กำลังจัดส่ง</option>
                        <option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* === แท็บ 4: ตอบแชทลูกค้า === */}
        {activeTab === 'chat' && (
          <div className="max-w-6xl mx-auto h-[80vh] flex bg-white border border-zinc-200 rounded-2xl shadow-md overflow-hidden">
             {/* รายชื่อลูกค้าฝั่งซ้าย */}
             <div className="w-1/3 border-r border-zinc-200 bg-zinc-50 flex flex-col">
              <div className="p-4 border-b border-zinc-200 bg-white"><h2 className="font-bold text-zinc-950 text-sm">ข้อความเข้า (Inbox)</h2></div>
              <div className="overflow-y-auto flex-grow">
                {chats.map(chat => (
                  <div key={chat.id} onClick={() => setSelectedChatId(chat.id)} className={`p-4 cursor-pointer border-b border-zinc-100 ${selectedChatId === chat.id ? 'bg-red-50' : 'hover:bg-white'}`}>
                    <p className="font-bold text-sm truncate">{chat.name}</p>
                    <p className="text-xs text-zinc-500 truncate">{chat.lastMessage}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* หน้าต่างแชทฝั่งขวา */}
            {selectedChatId ? (
              <div className="w-2/3 flex flex-col bg-white">
                <div className="flex-grow p-6 bg-zinc-50 overflow-y-auto space-y-4">
                  {(chats.find(c => c.id === selectedChatId)?.messages || []).map((msg) => (
                    <div key={msg.id} className={`flex max-w-[80%] ${msg.sender === 'agent' ? 'ml-auto' : 'mr-auto'}`}>
                      <div className={`p-3 rounded-2xl text-sm ${msg.sender === 'agent' ? 'bg-slate-900 text-white' : 'bg-white border border-zinc-200'}`}>
                        {msg.text && <p>{msg.text}</p>}
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendReply} className="p-4 border-t border-zinc-200 flex gap-2">
                  <input type="text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="พิมพ์ข้อความ..." className="flex-grow border rounded-full px-4 text-sm" />
                  <button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded-full text-sm font-bold">ส่ง</button>
                </form>
              </div>
            ) : (<div className="w-2/3 flex items-center justify-center text-zinc-400">เลือกห้องแชทเพื่อสนทนา</div>)}
          </div>
        )}

      </main>

      {/* 🔴 Modal สำหรับเพิ่มสินค้าใหม่ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">เพิ่มสินค้าใหม่</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div><label className="text-sm font-bold">ชื่อสินค้า</label><input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border rounded-lg p-2" /></div>
              <div><label className="text-sm font-bold">หมวดหมู่</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full border rounded-lg p-2">
                  <option value="บ้านพักอาศัย (Residential)">บ้านพักอาศัย (Residential)</option>
                  <option value="อินเวอร์เตอร์">อินเวอร์เตอร์</option>
                  <option value="อุปกรณ์ติดตั้ง">อุปกรณ์ติดตั้ง</option>
                  <option value="ระบบกักเก็บพลังงาน">ระบบกักเก็บพลังงาน</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-bold">ราคา (บาท)</label><input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full border rounded-lg p-2" /></div>
                <div><label className="text-sm font-bold">สต๊อกเริ่มต้น</label><input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full border rounded-lg p-2" /></div>
              </div>
              <div className="flex gap-2 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-200 text-slate-800 py-2 rounded-lg font-bold">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-red-600 text-white py-2 rounded-lg font-bold">บันทึกสินค้า</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}