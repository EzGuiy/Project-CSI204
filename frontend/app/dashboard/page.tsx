'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface Product { id: string; name: string; category: string; price: number; stock: number; }
interface ChatProduct { id: string; name: string; category: string; price: number; capacity: string; imageUrl: string; }
interface Message { id: string; chatId: string; senderName: string; sender: 'user' | 'agent'; text?: string; image?: string; product?: ChatProduct; timestamp: string; isRead: boolean; }
interface ChatSession { id: string; name: string; lastMessage: string; time: string; unread: number; messages: Message[]; }

export default function EmployeeDashboard() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [employeeName, setEmployeeName] = useState('');

  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState<Product[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [replyText, setReplyText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 🔐 ดักจับสิทธิ์การเข้าใช้งาน
  useEffect(() => {
    const session = localStorage.getItem('user');
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
    }
  }, [router]);

  // 📦 โหลดสินค้าจาก API
  const loadProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  // ⚙️ อัปเดตสต๊อกผ่าน API ไปยัง db.json
  const updateStock = async (id: string, amount: number) => {
    // 1. อัปเดตหน้าจอให้ไวเพื่อ UX ที่ดี
    const updated = products.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p
    );
    setProducts(updated);

    // 2. ส่งข้อมูลไปอัปเดตไฟล์ JSON หลังบ้าน
    try {
      await fetch('/api/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, amount })
      });
    } catch (error) {
      console.error('Failed to update stock in database', error);
    }
  };

  // (ฟังก์ชันแชทเหมือนเดิม)
  const fetchChatsFromAPI = async (): Promise<ChatSession[]> => {
    let allChats: Message[] = [];
    try {
      const res = await fetch('/api/chats');
      if (res.ok) allChats = await res.json();
    } catch (e) { console.error(e); }

    const sessionsMap: { [chatId: string]: Message[] } = {};
    allChats.forEach(msg => {
      if (!sessionsMap[msg.chatId]) sessionsMap[msg.chatId] = [];
      sessionsMap[msg.chatId].push(msg);
    });

    return Object.keys(sessionsMap).map(cId => {
      const msgs = sessionsMap[cId];
      const userMsg = [...msgs].reverse().find(m => m.sender === 'user');
      const senderName = userMsg ? userMsg.senderName : (msgs[0]?.senderName || `ลูกค้า (${cId})`);
      const lastMsgObj = msgs[msgs.length - 1];
      let lastMsgText = lastMsgObj.text ? lastMsgObj.text : (lastMsgObj.image ? '[ส่งรูปถ่าย]' : '[แนบสินค้า]');
      const unreadCount = msgs.filter(m => m.sender === 'user' && !m.isRead).length;

      return { id: cId, name: senderName, lastMessage: lastMsgText, time: lastMsgObj.timestamp, unread: unreadCount, messages: msgs };
    });
  };

  const markAsRead = async (cId: string) => {
    try { await fetch('/api/chats', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chatId: cId }) }); } catch (e) {}
  };

  useEffect(() => {
    if(!isAuthorized) return;
    const refreshChats = async () => {
      if (selectedChatId) await markAsRead(selectedChatId);
      const loaded = await fetchChatsFromAPI();
      setChats(loaded);
    };
    refreshChats();
    const interval = setInterval(() => { refreshChats(); }, 3000);
    return () => clearInterval(interval);
  }, [selectedChatId, isAuthorized]);

  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) setSelectedChatId(chats[0].id);
  }, [chats, selectedChatId]);

  useEffect(() => {
    if (messagesEndRef.current) messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [chats, selectedChatId, activeTab]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatId) return;

    const newReplyMsg: Message = {
      id: `msg-${Date.now()}-agent`,
      chatId: selectedChatId,
      senderName: employeeName || 'พนักงาน',
      sender: 'agent',
      text: replyText.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
    };

    try {
      await fetch('/api/chats', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newReplyMsg) });
    } catch (e) { console.error(e); }

    setReplyText('');
    const loaded = await fetchChatsFromAPI();
    setChats(loaded);
  };

  const selectedChat = chats.find(c => c.id === selectedChatId) || null;
  const totalUnreadCount = chats.reduce((acc, c) => acc + c.unread, 0);

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row font-sans">
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold tracking-wide">Employee Panel</h2>
          <p className="text-zinc-400 text-sm mt-1">SolarTech Solutions</p>
        </div>
        <nav className="p-4 space-y-2 flex-grow">
          <button onClick={() => setActiveTab('inventory')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${activeTab === 'inventory' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}><span className="text-lg">📦</span> คลังสินค้า</button>
          <button onClick={() => setActiveTab('chat')} className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${activeTab === 'chat' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}>
            <div className="flex items-center gap-3"><span className="text-lg">💬</span> ตอบแชทลูกค้า</div>
            {totalUnreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{totalUnreadCount}</span>}
          </button>
        </nav>
      </aside>

      <main className="flex-grow p-8 overflow-y-auto">
        {activeTab === 'inventory' && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-zinc-900">จัดการสต๊อกสินค้า</h1>
            </div>
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-sm">
                    <th className="p-4 font-medium pl-6">รหัส</th><th className="p-4 font-medium">ชื่อสินค้า</th><th className="p-4 font-medium">หมวดหมู่</th><th className="p-4 font-medium">ราคา</th><th className="p-4 font-medium text-center">จำนวนในคลัง</th>
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
                          <button onClick={() => updateStock(product.id, -1)} className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-lg text-zinc-600 hover:bg-zinc-100">-</button>
                          <span className={`w-8 text-center font-bold ${product.stock < 5 ? 'text-red-600' : 'text-zinc-900'}`}>{product.stock}</span>
                          <button onClick={() => updateStock(product.id, 1)} className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-lg text-zinc-600 hover:bg-zinc-100">+</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* ส่วน Chat UI เหมือนเดิม */}
      </main>
    </div>
  );
}