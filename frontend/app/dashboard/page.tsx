'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Product { id: string; name: string; category: string; price: number; stock: number; image?: string; description?: string; }
interface Order { id: string; date: string; total: number; status: string; shipping: { fullName: string; }; }
interface ChatProduct { id: string; name: string; category: string; price: number; capacity: string; imageUrl: string; }
interface Message { id: string; chatId: string; senderName: string; sender: 'user' | 'agent'; text?: string; image?: string; product?: ChatProduct; isRead: boolean; timestamp: string; }
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
  const [newProduct, setNewProduct] = useState({ name: '', category: 'บ้านพักอาศัย (Residential)', price: 0, stock: 0, image: '', description: '' });

  // 🌟 State สำหรับฟอร์มแก้ไขสินค้า
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

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

  // 📦 โหลดสินค้าและออเดอร์
  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) setProducts(await res.json());
    } catch (error) { console.error('Error loading products', error); }
  };

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setOrders(sorted);
      }
    } catch (error) { console.error('Error loading orders', error); }
  };

  // ⚙️ อัปเดตสต๊อก (ปุ่ม +/-)
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
        setNewProduct({ name: '', category: 'บ้านพักอาศัย (Residential)', price: 0, stock: 0, image: '', description: '' });
        loadProducts();
      }
    } catch (error) { console.error('Error adding product', error); }
  };

  // ✏️ บันทึกการแก้ไขสินค้า
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    try {
      const res = await fetch('/api/products', {
        method: 'PUT', // ส่งข้อมูลแบบแก้ไข
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProduct)
      });
      if (res.ok) {
        alert('บันทึกการแก้ไขสินค้าสำเร็จ');
        setShowEditModal(false);
        setEditingProduct(null);
        loadProducts(); // รีโหลดข้อมูลใหม่
      }
    } catch (error) { console.error('Error editing product', error); }
  };

  // 🚚 อัปเดตสถานะคำสั่งซื้อ
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (confirm(`ยืนยันการเปลี่ยนสถานะเป็น "${newStatus}" ใช่หรือไม่?`)) {
      try {
        const res = await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, status: newStatus })
        });
        if (res.ok) loadOrders();
      } catch (error) { console.error('Error updating order', error); }
    } else {
      loadOrders(); 
    }
  };

  // 💬 ================= ระบบแชทแบบ LINE OA =================
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
      
      let lastMsgText = '';
      if (lastMsgObj.text) lastMsgText = lastMsgObj.text;
      else if (lastMsgObj.image) lastMsgText = '[ส่งรูปภาพ]';
      else if (lastMsgObj.product) lastMsgText = `[สอบถามสินค้า: ${lastMsgObj.product.name}]`;

      const unreadCount = msgs.filter(m => m.sender === 'user' && !m.isRead).length;
      return { id: cId, name: senderName, lastMessage: lastMsgText, time: lastMsgObj.timestamp, unread: unreadCount, messages: msgs };
    }).sort((a, b) => {
      if (a.unread > 0 && b.unread === 0) return -1;
      if (a.unread === 0 && b.unread > 0) return 1;
      return 0;
    });
  };

  const markAsRead = async (cId: string) => {
    try {
      await fetch('/api/chats', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: cId }),
      });
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if(!isAuthorized) return;
    const refreshChats = async () => {
      if (selectedChatId) await markAsRead(selectedChatId);
      const loaded = await fetchChatsFromAPI();
      setChats(loaded);
    };
    refreshChats();
    const interval = setInterval(refreshChats, 3000);
    return () => clearInterval(interval);
  }, [isAuthorized, selectedChatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, selectedChatId, activeTab]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatId) return;
    const newReplyMsg: Message = {
      id: `msg-${Date.now()}-agent`, chatId: selectedChatId, senderName: employeeName, sender: 'agent',
      text: replyText.trim(), timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }), isRead: true,
    };
    try {
      await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReplyMsg) });
      setReplyText('');
      const loaded = await fetchChatsFromAPI();
      setChats(loaded);
    } catch (e) { console.error(e); }
  };

  if (!isAuthorized) return null;

  // ข้อมูลสำหรับ Overview
  const totalSales = orders.filter(o => o.status === 'จัดส่งสำเร็จ' || o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'รอชำระเงิน' || o.status === 'ตรวจสอบ' || o.status === 'processing').length;
  const totalUnreadChats = chats.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row font-sans relative">
      
      {/* ⬅️ Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex flex-col shrink-0 z-10">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold tracking-wide">Employee Panel</h2>
          <p className="text-zinc-400 text-sm mt-1">เจ้าหน้าที่: {employeeName}</p>
        </div>
        <nav className="p-4 space-y-2 flex-grow">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'overview' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800'}`}>
            <span>📊</span> สรุปยอดขาย
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'inventory' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800'}`}>
            <span>📦</span> จัดการสต๊อก
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'orders' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800'}`}>
            <span>🚚</span> ตรวจสอบคำสั่งซื้อ
          </button>
          <button onClick={() => setActiveTab('chat')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${activeTab === 'chat' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800'}`}>
            <span className="flex items-center gap-3"><span>💬</span> ตอบแชทลูกค้า</span>
            {totalUnreadChats > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{totalUnreadChats}</span>}
          </button>
        </nav>
      </aside>

      {/* ➡️ Main Content */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto">
        
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
              <button onClick={() => setShowAddModal(true)} className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm transition-colors">
                + เพิ่มสินค้าใหม่
              </button>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-sm">
                      <th className="p-4 pl-6">รหัส</th><th className="p-4">ชื่อสินค้า</th>
                      <th className="p-4">หมวดหมู่</th><th className="p-4">ราคา</th>
                      <th className="p-4 text-center">จำนวนในคลัง</th><th className="p-4 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-zinc-50 transition-colors text-sm">
                        <td className="p-4 text-zinc-500 pl-6">#{product.id}</td>
                        <td className="p-4 font-semibold text-zinc-900">{product.name}</td>
                        <td className="p-4 text-zinc-500">{product.category}</td>
                        <td className="p-4 text-zinc-950 font-bold">฿{product.price.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => updateStock(product.id, -1)} className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-lg hover:bg-zinc-100">-</button>
                            <span className={`w-8 text-center font-bold ${product.stock < 5 ? 'text-red-600' : 'text-zinc-900'}`}>{product.stock}</span>
                            <button onClick={() => updateStock(product.id, 1)} className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-lg hover:bg-zinc-100">+</button>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex justify-center gap-2">
                            {/* 🌟 ปุ่มแก้ไข */}
                            <button 
                              onClick={() => {
                                setEditingProduct(product);
                                setShowEditModal(true);
                              }} 
                              className="text-blue-500 hover:text-blue-700 font-bold text-xs px-2 py-1 transition-colors"
                            >
                              แก้ไข
                            </button>
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

        {/* === แท็บ 3: คำสั่งซื้อ (Orders) === */}
        {activeTab === 'orders' && (
          <div className="max-w-5xl mx-auto animate-in fade-in">
            <h1 className="text-2xl font-bold text-zinc-900 mb-6">ตรวจสอบคำสั่งซื้อ</h1>
            {orders.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 bg-white rounded-2xl border border-zinc-200">ยังไม่มีคำสั่งซื้อในระบบ</div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4 hover:shadow-md transition-shadow">
                    <div>
                      <p className="font-bold text-slate-900">รหัสออเดอร์: <span className="font-mono text-blue-600">{order.id}</span></p>
                      <p className="text-sm text-slate-500 mt-1">ลูกค้า: {order.shipping?.fullName || 'ไม่ระบุ'} <span className="text-xs text-slate-400">({new Date(order.date).toLocaleDateString('th-TH')})</span></p>
                      <p className="text-sm font-bold text-zinc-900 mt-1">ยอดรวม: ฿{order.total.toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <span className="text-sm font-bold text-slate-600 shrink-0">สถานะ:</span>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`text-sm font-bold px-4 py-2.5 rounded-xl border outline-none cursor-pointer transition-all w-full md:w-auto ${
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
          <div className="max-w-6xl mx-auto h-[75vh] min-h-[500px] flex bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden animate-in fade-in">
             <div className="w-1/3 min-w-[250px] border-r border-slate-200 bg-slate-50 flex flex-col">
              <div className="p-5 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
                <h2 className="font-bold text-slate-900">แชทลูกค้า</h2>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">{chats.length}</span>
              </div>
              <div className="overflow-y-auto flex-grow divide-y divide-slate-100">
                {chats.length === 0 && <div className="p-6 text-center text-slate-400 text-sm">ไม่มีประวัติการแชท</div>}
                {chats.map(chat => (
                  <div key={chat.id} onClick={() => setSelectedChatId(chat.id)} className={`p-4 cursor-pointer transition-all flex gap-3 items-center ${selectedChatId === chat.id ? 'bg-blue-50/50 border-l-4 border-blue-600' : 'hover:bg-slate-100 border-l-4 border-transparent'}`}>
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0 border border-slate-300">
                      {chat.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className={`text-sm truncate ${chat.unread > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{chat.name}</p>
                        <p className="text-[10px] text-slate-400 shrink-0">{chat.time}</p>
                      </div>
                      <p className={`text-xs truncate ${chat.unread > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>{chat.lastMessage}</p>
                    </div>
                    {chat.unread > 0 && <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">{chat.unread}</div>}
                  </div>
                ))}
              </div>
            </div>

            {selectedChatId ? (
              <div className="w-2/3 flex flex-col bg-[#f0f2f5] relative">
                <div className="h-16 px-6 bg-white border-b border-slate-200 flex items-center gap-3 shrink-0 shadow-sm z-10">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold border border-slate-300">
                    {chats.find(c => c.id === selectedChatId)?.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{chats.find(c => c.id === selectedChatId)?.name}</h3>
                    <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> ใช้งานอยู่</p>
                  </div>
                </div>

                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                  {(chats.find(c => c.id === selectedChatId)?.messages || []).map((msg) => (
                    <div key={msg.id} className={`flex max-w-[80%] ${msg.sender === 'agent' ? 'ml-auto flex-row-reverse' : 'mr-auto'} gap-2`}>
                      {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0 border border-slate-300">{msg.senderName.charAt(0).toUpperCase()}</div>}
                      <div className={`flex flex-col ${msg.sender === 'agent' ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${msg.sender === 'agent' ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                          {msg.image && <div className="mb-2 max-w-sm rounded-lg overflow-hidden border border-slate-200 bg-white p-1"><img src={msg.image} alt="uploaded" className="max-h-64 w-auto object-cover rounded mx-auto" /></div>}
                          {msg.product && (
                            <div className="mb-2 p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 text-slate-800 min-w-[250px]">
                              <img src={msg.product.imageUrl} alt={msg.product.name} className="w-14 h-14 object-contain bg-white rounded border border-slate-200 p-1 shrink-0" />
                              <div className="min-w-0">
                                <p className="font-bold text-xs truncate">{msg.product.name}</p>
                                <p className="text-[10px] text-slate-500 truncate">{msg.product.category}</p>
                                <p className="text-xs font-bold text-blue-600 mt-1">฿{msg.product.price.toLocaleString()}</p>
                              </div>
                            </div>
                          )}
                          {msg.text && <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 px-1">{msg.timestamp} {msg.sender === 'agent' && msg.isRead && <span className="text-blue-500 font-medium">อ่านแล้ว</span>}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className="p-4 bg-white border-t border-slate-200 shrink-0">
                  <form onSubmit={handleSendReply} className="flex gap-3 items-end">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(e); } }}
                      placeholder="พิมพ์ข้อความตอบกลับ... (กด Enter เพื่อส่ง)"
                      className="flex-grow border border-slate-300 bg-slate-50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100 resize-none max-h-32 transition-all"
                      rows={1}
                    />
                    <button type="submit" disabled={!replyText.trim()} className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:shadow-none text-white w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 shadow-md active:scale-95">
                      <svg className="w-5 h-5 transform rotate-90 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </form>
                </div>
              </div>
            ) : (
              <div className="w-2/3 flex flex-col items-center justify-center text-slate-400 bg-[#f0f2f5]">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-200">
                  <svg className="w-12 h-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                </div>
                <p className="font-bold text-lg text-slate-600">ยินดีต้อนรับสู่ระบบตอบกลับ</p>
                <p className="text-sm mt-2">โปรดเลือกรายการแชทจากแถบด้านซ้ายเพื่อเริ่มต้นสนทนา</p>
              </div>
            )}
          </div>
        )}

      </main>

      {/* 🔴 Modal สำหรับเพิ่มสินค้าใหม่ */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <span className="text-2xl">📦</span> เพิ่มสินค้าใหม่
            </h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div><label className="text-sm font-bold text-slate-700">ชื่อสินค้า</label><input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              <div>
                <label className="text-sm font-bold text-slate-700">หมวดหมู่</label>
                <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="บ้านพักอาศัย (Residential)">บ้านพักอาศัย (Residential)</option><option value="อินเวอร์เตอร์">อินเวอร์เตอร์</option><option value="อุปกรณ์ติดตั้ง">อุปกรณ์ติดตั้ง</option><option value="ระบบกักเก็บพลังงาน">ระบบกักเก็บพลังงาน</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-sm font-bold text-slate-700">ราคา (บาท)</label><input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
                <div><label className="text-sm font-bold text-slate-700">สต๊อกเริ่มต้น</label><input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" /></div>
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">อัปโหลดรูปภาพสินค้า</label>
                <input type="file" accept="image/*" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 2 * 1024 * 1024) { alert('❌ ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB ครับ'); e.target.value = ''; return; }
                    const reader = new FileReader(); reader.onloadend = () => { setNewProduct({...newProduct, image: reader.result as string}); }; reader.readAsDataURL(file);
                  }
                }} className="w-full border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer text-sm" />
                {newProduct.image && newProduct.image !== '/file.svg' && (
                  <div className="mt-3 p-3 border border-slate-200 rounded-xl inline-block bg-slate-50"><p className="text-xs text-slate-500 mb-2 font-semibold">รูปภาพตัวอย่าง:</p><img src={newProduct.image} alt="Preview" className="h-24 w-auto object-contain rounded mix-blend-multiply" /></div>
                )}
              </div>
              <div>
                <label className="text-sm font-bold text-slate-700">รายละเอียดสินค้า</label>
                <textarea required rows={3} placeholder="อธิบายคุณสมบัติเด่นของสินค้า..." value={newProduct.description || ''} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none resize-none" />
              </div>
              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md">บันทึกสินค้า</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🟢 Modal สำหรับแก้ไขสินค้า */}
      {showEditModal && editingProduct && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-5 flex items-center gap-2">
              <span className="text-2xl">✏️</span> แก้ไขสินค้า
            </h2>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="text-sm font-bold text-slate-700">ชื่อสินค้า</label>
                <input required type="text" value={editingProduct.name} onChange={e => setEditingProduct({...editingProduct, name: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
              </div>
              
              <div>
                <label className="text-sm font-bold text-slate-700">หมวดหมู่</label>
                <select value={editingProduct.category} onChange={e => setEditingProduct({...editingProduct, category: e.target.value})} className="w-full border border-slate-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                  <option value="บ้านพักอาศัย (Residential)">บ้านพักอาศัย (Residential)</option>
                  <option value="อินเวอร์เตอร์">อินเวอร์เตอร์</option>
                  <option value="อุปกรณ์ติดตั้ง">อุปกรณ์ติดตั้ง</option>
                  <option value="ระบบกักเก็บพลังงาน">ระบบกักเก็บพลังงาน</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-700">ราคา (บาท)</label>
                  <input required type="number" value={editingProduct.price} onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-700">จำนวนในคลัง</label>
                  <input required type="number" value={editingProduct.stock} onChange={e => setEditingProduct({...editingProduct, stock: Number(e.target.value)})} className="w-full border border-slate-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700 mb-1 block">เปลี่ยนรูปภาพสินค้า (อัปโหลดใหม่)</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        alert('❌ ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB ครับ');
                        e.target.value = '';
                        return;
                      }
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setEditingProduct({...editingProduct, image: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full border border-slate-300 rounded-xl p-2 focus:ring-2 focus:ring-blue-500 outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer text-sm" 
                />
                
                {editingProduct.image && editingProduct.image !== '/file.svg' && (
                  <div className="mt-3 p-3 border border-slate-200 rounded-xl inline-block bg-slate-50">
                    <p className="text-xs text-slate-500 mb-2 font-semibold">รูปภาพปัจจุบัน:</p>
                    <img src={editingProduct.image} alt="Preview" className="h-24 w-auto object-contain rounded mix-blend-multiply" />
                  </div>
                )}
              </div>

              <div>
                <label className="text-sm font-bold text-slate-700">รายละเอียดสินค้า</label>
                <textarea 
                  required 
                  rows={3}
                  value={editingProduct.description || ''} 
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})} 
                  className="w-full border border-slate-300 rounded-xl p-2.5 mt-1 focus:ring-2 focus:ring-blue-500 outline-none resize-none" 
                />
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingProduct(null); }} className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors">ยกเลิก</button>
                <button type="submit" className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-md">บันทึกการเปลี่ยนแปลง</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}