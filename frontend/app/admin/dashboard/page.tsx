'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface User { id: string; name: string; email: string; role: string; }
interface Product { id: string; name: string; category: string; price: number; stock: number; }
interface ChatProduct { id: string; name: string; category: string; price: number; capacity: string; imageUrl: string; }
interface Message { id: string; chatId: string; senderName: string; sender: 'user' | 'agent'; text?: string; image?: string; product?: ChatProduct; timestamp: string; isRead: boolean; }
interface ChatSession { id: string; name: string; lastMessage: string; time: string; unread: number; messages: Message[]; }

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [replyText, setReplyText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'chats' | 'settings'>('overview');

  useEffect(() => {
    // 🔐 เปลี่ยนมาใช้คีย์ 'user' ที่เราตั้งไว้ในระบบ Login ใหม่
    const session = localStorage.getItem('user');
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
    fetch('/api/users')
      .then(async (res) => {
        if (res.ok) {
          const dbUsers = await res.json();
          setUsers(dbUsers);
        }
      })
      .catch((e) => console.error(e));
  };

  // 📦 ดึงข้อมูลสินค้าจาก API แทน LocalStorage
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

  const handleDeleteUser = (userId: string, userName: string) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบบัญชีของ "${userName}"?`)) {
      fetch(`/api/users?id=${userId}`, { method: 'DELETE' })
        .then(async (res) => {
          if (!res.ok) throw new Error('ลบผู้ใช้ไม่สำเร็จ');
          alert('🗑️ ลบบัญชีผู้ใช้งานสำเร็จ');
          loadUsers();
        })
        .catch((err) => alert(`❌ ไม่สามารถลบผู้ใช้งานได้: ${err.message || ''}`));
    }
  };

  // 🗑️ ลบสินค้าโดยยิง API ไปบอกให้ลบใน db.json
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (window.confirm(`🗑️ ยืนยันการลบสินค้า "${productName}" ออกจากระบบ?`)) {
      try {
        const res = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
        if (res.ok) {
          // ถ้า API ลบสำเร็จ ให้โหลดข้อมูลสินค้ามาวาดบนหน้าจอใหม่
          loadProducts(); 
        }
      } catch (error) {
        console.error('Failed to delete product', error);
      }
    }
  };

  // (ฟังก์ชัน Chat และ UI ด้านล่างคงเดิมตามที่คุณเขียนไว้)
  const fetchChatsFromAPI = async (): Promise<ChatSession[]> => {
    let allChats: Message[] = [];
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        allChats = await res.json();
      }
    } catch (e) {
      console.error(e);
    }

    const sessionsMap: { [chatId: string]: Message[] } = {};
    allChats.forEach(msg => {
      if (!sessionsMap[msg.chatId]) {
        sessionsMap[msg.chatId] = [];
      }
      sessionsMap[msg.chatId].push(msg);
    });

    const chatSessions: ChatSession[] = Object.keys(sessionsMap).map(cId => {
      const msgs = sessionsMap[cId];
      const userMsg = [...msgs].reverse().find(m => m.sender === 'user');
      const senderName = userMsg ? userMsg.senderName : (msgs[0]?.senderName || `ลูกค้า (${cId})`);
      
      const lastMsgObj = msgs[msgs.length - 1];
      let lastMsgText = '';
      if (lastMsgObj.text) {
        lastMsgText = lastMsgObj.text;
      } else if (lastMsgObj.image) {
        lastMsgText = '[ส่งรูปถ่าย]';
      } else if (lastMsgObj.product) {
        lastMsgText = `[แนบสินค้า: ${lastMsgObj.product.name}]`;
      }

      const unreadCount = msgs.filter(m => m.sender === 'user' && !m.isRead).length;

      return {
        id: cId,
        name: senderName,
        lastMessage: lastMsgText,
        time: lastMsgObj.timestamp,
        unread: unreadCount,
        messages: msgs
      };
    });

    return chatSessions;
  };

  const markAsRead = async (cId: string) => {
    try {
      await fetch('/api/chats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ chatId: cId }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    const refreshChats = async () => {
      if (selectedChatId) {
        await markAsRead(selectedChatId);
      }
      const loaded = await fetchChatsFromAPI();
      setChats(loaded);
    };

    refreshChats();
    const interval = setInterval(() => { refreshChats(); }, 3000);
    return () => clearInterval(interval);
  }, [selectedChatId]);

  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, selectedChatId, activeTab]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatId) return;

    const newReplyMsg: Message = {
      id: `msg-${Date.now()}-agent`,
      chatId: selectedChatId,
      senderName: adminName,
      sender: 'agent',
      text: replyText.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
    };

    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReplyMsg),
      });
    } catch (e) {
      console.error(e);
    }

    setReplyText('');
    const loaded = await fetchChatsFromAPI();
    setChats(loaded);
  };

  const selectedChat = chats.find(c => c.id === selectedChatId) || null;
  const totalUnreadCount = chats.reduce((acc, c) => acc + c.unread, 0);

  if (!isAdmin) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-600 font-medium">กำลังตรวจสอบสิทธิ์แอดมิน...</div>;
  }

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-800">
      <aside className="w-64 bg-slate-950 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <span className="text-2xl">🛡️</span>
          <h1 className="text-xl font-bold tracking-wide">Admin Control</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'overview' ? 'bg-blue-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><span>📊</span> ภาพรวมระบบ</button>
          <button onClick={() => setActiveTab('users')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'users' ? 'bg-blue-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><span>👥</span> จัดการผู้ใช้งาน</button>
          <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'products' ? 'bg-blue-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><span>📦</span> จัดการสินค้า</button>
          <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition ${activeTab === 'settings' ? 'bg-blue-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><span>⚙️</span> ตั้งค่าระบบ Solar</button>
          <button onClick={() => setActiveTab('chats')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${activeTab === 'chats' ? 'bg-blue-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}>
            <span className="flex items-center gap-3"><span>💬</span> ตอบแชทลูกค้า</span>
            {totalUnreadCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">{totalUnreadCount}</span>}
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8 md:p-12 overflow-y-auto">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-3xl font-black text-slate-900">
              {activeTab === 'overview' && 'แผงควบคุมระบบ SolarTech (Overview)'}
              {activeTab === 'users' && 'จัดการผู้ใช้งานในระบบ'}
              {activeTab === 'products' && 'จัดการคลังสินค้า (Inventory)'}
              {activeTab === 'chats' && 'ระบบตอบแชทลูกค้า (Customer Support)'}
              {activeTab === 'settings' && 'ตั้งค่าระบบ (Settings)'}
            </h2>
            <p className="text-slate-500 mt-1">ผู้ดูแลระบบ: <span className="text-blue-700 font-bold">{adminName}</span></p>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
                <div className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-1">ผู้ใช้สมัครใหม่</div>
                <div className="text-4xl font-black text-slate-900 tracking-tight">{users.length} <span className="text-sm font-normal text-slate-400">คน</span></div>
              </div>
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
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>ออนไลน์
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-sm">
                     <th className="p-4 pl-6">รหัสผู้ใช้</th><th className="p-4">ชื่อ-นามสกุล</th>
                     <th className="p-4">อีเมล</th><th className="p-4">สิทธิ์ (Role)</th><th className="p-4 pr-6 text-center">จัดการ</th>
                   </tr>
                 </thead>
                 <tbody>
                   {users.map((user) => (
                     <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50/80 text-sm">
                       <td className="p-4 pl-6 font-mono text-xs text-slate-500">{user.id}</td>
                       <td className="p-4 font-semibold text-slate-800">{user.name}</td>
                       <td className="p-4 text-slate-600">{user.email}</td>
                       <td className="p-4"><span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-xs uppercase">{user.role}</span></td>
                       <td className="p-4 pr-6 text-center"><button onClick={() => handleDeleteUser(user.id, user.name)} className="bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-red-200">ลบ</button></td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
        )}

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
                      <th className="p-4 pl-6">รหัสสินค้า</th><th className="p-4">ชื่อสินค้า</th><th className="p-4">หมวดหมู่</th>
                      <th className="p-4 text-right">ราคา (บาท)</th><th className="p-4 text-center">สต๊อกคงเหลือ</th><th className="p-4 pr-6 text-center">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors text-sm">
                        <td className="p-4 pl-6 font-mono text-xs text-slate-500">SKU-{product.id.padStart(3, '0')}</td>
                        <td className="p-4 font-semibold text-slate-800">{product.name}</td>
                        <td className="p-4 text-slate-500 text-xs">{product.category}</td>
                        <td className="p-4 text-right font-bold text-blue-700">{product.price.toLocaleString()}</td>
                        <td className="p-4 text-center"><span className={`px-2.5 py-1 rounded-md text-xs font-bold ${product.stock > 20 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{product.stock} ชิ้น</span></td>
                        <td className="p-4 pr-6 text-center"><button onClick={() => handleDeleteProduct(product.id, product.name)} className="text-red-500 hover:text-red-700 font-bold text-sm px-2 py-1 transition-colors">ลบออก</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ส่วน Chat UI เหมือนเดิม */}
      </main>
    </div>
  );
}