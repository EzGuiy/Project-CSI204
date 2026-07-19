'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Product { id: string; name: string; category: string; price: number; stock: number; image?: string; description?: string; }
interface OrderItem { id: string; name: string; price: number; quantity: number; icon: string; }
interface Order { id: string; date: string; total: number; subtotal: number; shippingFee: number; status: string; paymentMethod: string; items: OrderItem[]; shipping: { fullName: string; phone: string; address: string; subDistrict: string; district: string; province: string; postalCode: string; }; }
interface ChatProduct { id: string; name: string; category: string; price: number; capacity: string; imageUrl: string; }
interface Message { id: string; chatId: string; senderName: string; sender: string; text?: string; image?: string; product?: ChatProduct; isRead?: boolean; timestamp: string; }
interface ChatSession { id: string; name: string; lastMessage: string; time: string; unread: number; messages: Message[]; }

export default function EmployeeDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [employeeName, setEmployeeName] = useState('');
  
  // 🌟 เพิ่มแท็บ 'internal'
  const [activeTab, setActiveTab] = useState('overview');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});
  
  // States แชทลูกค้า
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [replyText, setReplyText] = useState('');
  
  // 🌟 States แชทภายในองค์กร
  const [internalChats, setInternalChats] = useState<Message[]>([]);
  const [internalInput, setInternalInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const internalEndRef = useRef<HTMLDivElement>(null);

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

  const updateStock = async (id: string, amount: number) => {
    const updated = products.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p);
    setProducts(updated);
    try {
      await fetch('/api/products', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, amount }) });
    } catch (error) { console.error('Error updating stock', error); }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (confirm(`ยืนยันการเปลี่ยนสถานะเป็น "${newStatus}" ใช่หรือไม่?`)) {
      try {
        const res = await fetch('/api/orders', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId, status: newStatus }) });
        if (res.ok) loadOrders();
      } catch (error) { console.error('Error updating order', error); }
    } else { loadOrders(); }
  };

  // แชทลูกค้า
  const fetchChatsFromAPI = async (): Promise<ChatSession[]> => {
    let allChats: Message[] = [];
    try {
      const res = await fetch('/api/chats');
      if (res.ok) allChats = await res.json();
    } catch (e) {}
    const sessionsMap: { [chatId: string]: Message[] } = {};
    allChats.forEach(msg => {
      // 🌟 ข้ามข้อความแชทภายใน
      if (msg.chatId === 'INTERNAL_ROOM') return;
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
      else if (lastMsgObj.image) lastMsgText = '[รูปภาพ]';
      else if (lastMsgObj.product) lastMsgText = `[สินค้า: ${lastMsgObj.product.name}]`;
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
      await fetch('/api/chats', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatId: cId }) });
    } catch (e) { console.error(e); }
  };

  // 🌟 ดึงข้อมูลแชทภายใน
  const loadInternalChats = async () => {
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const allChats: Message[] = await res.json();
        setInternalChats(allChats.filter(msg => msg.chatId === 'INTERNAL_ROOM'));
      }
    } catch (error) {}
  };

  // โหลดและ Polling
  useEffect(() => {
    if(!isAuthorized) return;
    const refreshData = async () => {
      if (activeTab === 'chat') {
        if (selectedChatId) await markAsRead(selectedChatId);
        const loaded = await fetchChatsFromAPI();
        setChats(loaded);
      } else if (activeTab === 'internal') {
        loadInternalChats();
      }
    };
    refreshData();
    const interval = setInterval(refreshData, 3000);
    return () => clearInterval(interval);
  }, [isAuthorized, selectedChatId, activeTab]);

  useEffect(() => {
    if (activeTab === 'chat' && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    } else if (activeTab === 'internal' && internalEndRef.current) {
      internalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, selectedChatId, internalChats, activeTab]);

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

  // 🌟 ส่งข้อความแชทภายใน (พนักงานส่งหาแอดมิน/กลุ่ม)
  const handleSendInternal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!internalInput.trim()) return;

    const newMsg: Message = {
      id: `msg-${Date.now()}-employee`,
      chatId: 'INTERNAL_ROOM',
      senderName: employeeName,
      sender: 'employee',
      text: internalInput.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isRead: true
    };

    setInternalChats(prev => [...prev, newMsg]); // แสดงผลทันที
    setInternalInput('');

    try {
      await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newMsg) });
    } catch (error) { console.error('Error sending internal chat:', error); }
  };

  const handleLogout = () => {
    if (confirm('คุณต้องการออกจากระบบใช่หรือไม่?')) {
      localStorage.removeItem('solar_session');
      window.location.href = '/login';
    }
  };

  const toggleOrderExpand = (orderId: string) => setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));

  if (!isAuthorized) return null;

  const pendingOrders = orders.filter(o => o.status === 'รอชำระเงิน' || o.status === 'ตรวจสอบ' || o.status === 'processing').length;
  const totalUnreadChats = chats.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row font-sans relative">
      
      {/* ⬅️ Sidebar */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex flex-col shrink-0 z-10 shadow-xl min-h-screen sticky top-0">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold tracking-wide">Employee Panel</h2>
          <p className="text-zinc-400 text-sm mt-1">เจ้าหน้าที่: {employeeName}</p>
        </div>
        <nav className="p-4 space-y-2 flex-grow overflow-y-auto">
          <button onClick={() => setActiveTab('overview')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'overview' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800'}`}>
            <span>📊</span> สรุปยอดขาย
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'inventory' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800'}`}>
            <span>📦</span> จัดการสต๊อก
          </button>
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${activeTab === 'orders' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800'}`}>
            <div className="flex items-center gap-3"><span>🚚</span> ตรวจสอบคำสั่งซื้อ</div>
            {pendingOrders > 0 && <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{pendingOrders}</span>}
          </button>
          <button onClick={() => setActiveTab('chat')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${activeTab === 'chat' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800'}`}>
            <div className="flex items-center gap-3"><span>💬</span> ตอบแชทลูกค้า</div>
            {totalUnreadChats > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">{totalUnreadChats}</span>}
          </button>

          <div className="pt-4 pb-2">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-4">ติดต่อสื่อสาร</p>
          </div>
          {/* 🌟 ปุ่มเข้าหน้าแชทภายในของพนักงาน */}
          <button onClick={() => setActiveTab('internal')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'internal' ? 'bg-indigo-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800'}`}>
            <span>💬</span> ติดต่อแอดมิน
          </button>

        </nav>
        <div className="p-4 border-t border-zinc-800 mt-auto">
          <button onClick={handleLogout} className="w-full bg-zinc-800 hover:bg-red-600 text-center block py-2.5 rounded-lg text-sm font-bold text-white transition-colors">
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* ➡️ Main Content */}
      <main className="flex-grow p-6 md:p-8 overflow-y-auto">
        
        {/* === แท็บ 1: ภาพรวม === */}
        {activeTab === 'overview' && (
          <div className="max-w-6xl mx-auto animate-in fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="text-3xl">📊</span> ภาพรวมของวันนี้
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">ออเดอร์ต้องตรวจสอบ</p>
                <p className="text-3xl font-black text-amber-500">{pendingOrders} <span className="text-sm text-slate-400 font-medium">รายการ</span></p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">แชทลูกค้าที่รอตอบ</p>
                <p className="text-3xl font-black text-blue-600">{totalUnreadChats} <span className="text-sm text-slate-400 font-medium">ข้อความ</span></p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">สินค้าใกล้หมด (น้อยกว่า 5)</p>
                <p className="text-3xl font-black text-red-600">{products.filter(p => p.stock < 5).length} <span className="text-sm text-slate-400 font-medium">รายการ</span></p>
              </div>
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center relative overflow-hidden">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">สินค้าทั้งหมดในสต๊อก</p>
                <p className="text-3xl font-black text-emerald-600">{products.reduce((sum, p) => sum + p.stock, 0)} <span className="text-sm text-slate-400 font-medium">ชิ้น</span></p>
              </div>
            </div>
          </div>
        )}

        {/* === แท็บ 2: จัดการสต๊อก === */}
        {activeTab === 'inventory' && (
          <div className="max-w-5xl mx-auto animate-in fade-in">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2"><span className="text-3xl">📦</span> จัดการสต๊อกสินค้า</h1>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-sm">
                      <th className="p-4 pl-6">รหัส</th><th className="p-4">ชื่อสินค้า</th><th className="p-4">หมวดหมู่</th><th className="p-4">ราคา</th><th className="p-4 text-center">ปรับสต๊อก</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {products.map(product => (
                      <tr key={product.id} className="hover:bg-zinc-50 transition-colors text-sm">
                        <td className="p-4 text-zinc-500 pl-6 font-mono">#{product.id}</td>
                        <td className="p-4 font-semibold text-zinc-900">{product.name}</td>
                        <td className="p-4 text-zinc-500">{product.category}</td>
                        <td className="p-4 text-zinc-950 font-bold">฿{product.price.toLocaleString()}</td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-3">
                            <button onClick={() => updateStock(product.id, -1)} className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-lg hover:bg-zinc-100 font-bold">-</button>
                            <span className={`w-8 text-center font-bold ${product.stock < 5 ? 'text-red-600' : 'text-zinc-900'}`}>{product.stock}</span>
                            <button onClick={() => updateStock(product.id, 1)} className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-lg hover:bg-zinc-100 font-bold">+</button>
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

        {/* === แท็บ 3: ตรวจสอบคำสั่งซื้อ === */}
        {activeTab === 'orders' && (
          <div className="max-w-5xl mx-auto animate-in fade-in">
            <h1 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><span className="text-3xl">🚚</span> ตรวจสอบคำสั่งซื้อลูกค้า</h1>
            {orders.length === 0 ? (
              <div className="text-center py-20 text-slate-500 bg-white rounded-2xl border border-slate-200">ยังไม่มีคำสั่งซื้อในระบบ</div>
            ) : (
              <div className="space-y-4">
                {orders.map(order => (
                  <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                      <div className="flex-grow cursor-pointer" onClick={() => toggleOrderExpand(order.id)}>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-900">รหัสออเดอร์: <span className="font-mono text-blue-600">{order.id}</span></p>
                          <span className="text-slate-400 text-xs">{expandedOrders[order.id] ? '(คลิกเพื่อย่อ)' : '(คลิกเพื่อดูรายละเอียด)'}</span>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">ลูกค้า: {order.shipping?.fullName || 'ไม่ระบุ'} <span className="text-xs text-slate-400">({new Date(order.date).toLocaleDateString('th-TH')})</span></p>
                        <p className="text-sm font-bold text-slate-900 mt-1">ยอดรวม: ฿{order.total?.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
                        <span className="text-sm font-bold text-slate-600 shrink-0">สถานะ:</span>
                        <select value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)} className={`text-sm font-bold px-4 py-2.5 rounded-xl border outline-none cursor-pointer transition-all w-full md:w-auto ${order.status === 'จัดส่งสำเร็จ' || order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : order.status === 'กำลังจัดส่ง' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          <option value="รอชำระเงิน">รอชำระเงิน</option><option value="ตรวจสอบ">ตรวจสอบ</option><option value="กำลังจัดส่ง">กำลังจัดส่ง</option><option value="จัดส่งสำเร็จ">จัดส่งสำเร็จ</option>
                        </select>
                      </div>
                    </div>
                    
                    {expandedOrders[order.id] && (
                      <div className="border-t border-slate-100 p-6 bg-slate-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">รายการสินค้า</h3>
                            <div className="space-y-3">
                              {order.items?.map((item, idx) => (
                                <div key={idx} className="flex gap-3 items-center bg-white p-3 rounded-xl border border-slate-200">
                                  <img src={item.icon || '/file.svg'} alt={item.name} className="w-12 h-12 object-contain bg-slate-50 rounded-lg p-1 border border-slate-100" />
                                  <div className="flex-grow min-w-0">
                                    <p className="font-bold text-xs text-slate-800 truncate">{item.name}</p>
                                    <p className="text-xs text-slate-500">฿{item.price.toLocaleString()} x {item.quantity} ชิ้น</p>
                                  </div>
                                  <div className="text-right shrink-0"><p className="font-bold text-sm text-blue-600">฿{(item.price * item.quantity).toLocaleString()}</p></div>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="space-y-6">
                            <div>
                              <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">ข้อมูลจัดส่ง</h3>
                              <div className="bg-white p-4 rounded-xl border border-slate-200 text-sm text-slate-600 space-y-2">
                                <p><span className="font-semibold text-slate-800">ชื่อ:</span> {order.shipping?.fullName || '-'}</p>
                                <p><span className="font-semibold text-slate-800">เบอร์โทร:</span> {order.shipping?.phone || '-'}</p>
                                <div className="flex items-start gap-1"><span className="font-semibold text-slate-800 shrink-0">ที่อยู่:</span><p className="leading-relaxed">{order.shipping?.address ? `${order.shipping.address} ${order.shipping.subDistrict || ''} ${order.shipping.district || ''} ${order.shipping.province || ''} ${order.shipping.postalCode || ''}` : '-'}</p></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
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
                {chats.length === 0 && <div className="p-6 text-center text-slate-400 text-sm">ยังไม่มีแชทเข้ามา</div>}
                {chats.map(chat => (
                  <div key={chat.id} onClick={() => setSelectedChatId(chat.id)} className={`p-4 cursor-pointer transition-all flex gap-3 items-center ${selectedChatId === chat.id ? 'bg-blue-50/50 border-l-4 border-blue-600' : 'hover:bg-slate-100 border-l-4 border-transparent'}`}>
                    <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-lg shrink-0 border border-slate-300">
                      {String(chat.name).charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-1">
                        <p className={`text-sm truncate ${chat.unread > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-700'}`}>{chat.name || 'ลูกค้าทั่วไป'}</p>
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
                    {String(chats.find(c => c.id === selectedChatId)?.name || 'ล').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{chats.find(c => c.id === selectedChatId)?.name || 'ลูกค้าทั่วไป'}</h3>
                    <p className="text-[11px] text-emerald-500 font-medium flex items-center gap-1"><span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span> ใช้งานอยู่</p>
                  </div>
                </div>
                <div className="flex-grow p-6 overflow-y-auto space-y-6">
                  {(chats.find(c => c.id === selectedChatId)?.messages || []).map((msg, index) => (
                    <div key={`msg-${msg.id || index}`} className={`flex max-w-[80%] ${msg.sender === 'agent' ? 'ml-auto flex-row-reverse' : 'mr-auto'} gap-2`}>
                      {msg.sender === 'user' && <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0 border border-slate-300">{String(msg.senderName).charAt(0).toUpperCase()}</div>}
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
                        <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 px-1">{msg.timestamp} {msg.sender === 'agent' && msg.isRead && <span className="text-blue-500 font-medium">✓ อ่านแล้ว</span>}</span>
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
                <p className="font-bold text-lg text-slate-600">เลือกห้องแชท</p>
                <p className="text-sm mt-2">กรุณาเลือกลูกค้าจากรายชื่อด้านซ้ายเพื่อเริ่มสนทนา</p>
              </div>
            )}
          </div>
        )}

        {/* 🌟 === แท็บ 5: แชทภายในองค์กร === */}
        {activeTab === 'internal' && (
          <div className="max-w-4xl mx-auto h-[80vh] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-lg overflow-hidden animate-in fade-in">
            <div className="h-16 px-6 bg-indigo-900 border-b border-indigo-800 flex items-center justify-between shrink-0 shadow-sm z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-indigo-900 font-bold text-xl">
                  C
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">ห้องสนับสนุนและสื่อสารภายใน</h3>
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span> ทีม Support & Admin
                  </p>
                </div>
              </div>
            </div>
            
            {/* พื้นที่ข้อความ */}
            <div className="flex-grow p-6 overflow-y-auto space-y-6 bg-slate-50">
              {internalChats.length === 0 && (
                <div className="text-center py-10 text-slate-400 text-sm">ยังไม่มีข้อความสนทนา แจ้งปัญหาหรือติดต่อแอดมินได้เลย</div>
              )}
              {internalChats.map((msg, index) => {
                // เช็คว่าข้อความนี้ส่งโดยตัวเรา (employeeName) หรือไม่
                const isMe = msg.senderName === employeeName;
                return (
                  <div key={`int-${msg.id || index}`} className={`flex max-w-[80%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'} gap-2`}>
                    {!isMe && (
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0 border border-indigo-200">
                        {msg.senderName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] text-slate-400 mb-1 px-1">
                        {msg.senderName} ({msg.sender === 'admin' ? 'แอดมิน' : 'พนักงาน'}) • {msg.timestamp}
                      </span>
                      <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-indigo-600 text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'}`}>
                        {msg.text && <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={internalEndRef} />
            </div>

            {/* ช่องส่งข้อความ */}
            <div className="p-4 bg-white border-t border-slate-200 shrink-0">
              <form onSubmit={handleSendInternal} className="flex gap-3 items-end">
                <textarea
                  value={internalInput}
                  onChange={(e) => setInternalInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendInternal(e); } }}
                  placeholder="พิมพ์ข้อความเพื่อติดต่อแอดมินหรือเพื่อนร่วมงาน... (กด Enter เพื่อส่ง)"
                  className="flex-grow border border-slate-300 bg-slate-50 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100 resize-none max-h-32 transition-all"
                  rows={1}
                />
                <button type="submit" disabled={!internalInput.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 disabled:shadow-none text-white w-12 h-12 rounded-full flex items-center justify-center transition-all shrink-0 shadow-md active:scale-95">
                  <svg className="w-5 h-5 transform rotate-90 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}