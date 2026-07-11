// frontend/app/admin/dashboard/page.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
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

interface ChatProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  capacity: string;
  imageUrl: string;
}

interface Message {
  id: string;
  chatId: string;
  senderName: string;
  sender: 'user' | 'agent';
  text?: string;
  image?: string;
  product?: ChatProduct;
  timestamp: string;
  isRead: boolean;
}

interface ChatSession {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  messages: Message[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminName, setAdminName] = useState('');
  
  // States สำหรับเก็บข้อมูล
  const [users, setUsers] = useState<User[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [replyText, setReplyText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // State สำหรับจัดการ Tab เมนู
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'products' | 'chats' | 'settings'>('overview');

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
    fetch('/api/users')
      .then(async (res) => {
        if (res.ok) {
          const dbUsers = await res.json();
          setUsers(dbUsers);
        } else {
          const storedUsers = localStorage.getItem('solar_users');
          if (storedUsers) setUsers(JSON.parse(storedUsers));
        }
      })
      .catch(() => {
        const storedUsers = localStorage.getItem('solar_users');
        if (storedUsers) setUsers(JSON.parse(storedUsers));
      });
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
      fetch(`/api/users?id=${userId}`, {
        method: 'DELETE',
      })
        .then(async (res) => {
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'ลบผู้ใช้ไม่สำเร็จ');
          }
          
          // ลบใน Local Storage ด้วย
          const storedUsers = localStorage.getItem('solar_users');
          if (storedUsers) {
            const localUsers = JSON.parse(storedUsers);
            const updatedUsers = localUsers.filter((user: any) => user.id !== userId);
            localStorage.setItem('solar_users', JSON.stringify(updatedUsers));
          }
          
          alert('🗑️ ลบบัญชีผู้ใช้งานสำเร็จ');
          loadUsers();
        })
        .catch((err) => {
          alert(`❌ ไม่สามารถลบผู้ใช้งานได้: ${err.message || ''}`);
        });
    }
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`🗑️ ยืนยันการลบสินค้า "${productName}" ออกจากระบบ?`)) {
      const updatedProducts = products.filter((product) => product.id !== productId);
      localStorage.setItem('solar_products', JSON.stringify(updatedProducts));
      setProducts(updatedProducts);
    }
  };

  // ดึงข้อความแชทจาก API และจัดกลุ่ม
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

    // จัดกลุ่มตาม chatId
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

  // ทำเครื่องหมายว่าอ่านแล้ว
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

  // อัปโหลด/โหลดข้อมูลและ polling
  useEffect(() => {
    const refreshChats = async () => {
      if (selectedChatId) {
        await markAsRead(selectedChatId);
      }
      const loaded = await fetchChatsFromAPI();
      setChats(loaded);
    };

    refreshChats();

    const interval = setInterval(() => {
      refreshChats();
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedChatId]);

  // ตั้งค่า default chat ตัวแรกเมื่อเริ่ม
  useEffect(() => {
    if (chats.length > 0 && !selectedChatId) {
      setSelectedChatId(chats[0].id);
    }
  }, [chats, selectedChatId]);

  // เลื่อนลงไปข้างล่างสุดเมื่อเปิดหน้าแชทใหม่หรือมีข้อความเพิ่ม
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats, selectedChatId, activeTab]);

  // จัดการตอบแชท
  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedChatId) return;

    const employeeSession = localStorage.getItem('solar_session');
    let empName = 'วิศวกร สมศักดิ์';
    if (employeeSession) {
      try {
        const empData = JSON.parse(employeeSession);
        if (empData.name) empName = empData.name;
      } catch (e) {}
    }

    const newReplyMsg: Message = {
      id: `msg-${Date.now()}-agent`,
      chatId: selectedChatId,
      senderName: empName,
      sender: 'agent',
      text: replyText.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isRead: true,
    };

    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReplyMsg),
      });
    } catch (e) {
      console.error(e);
    }

    setReplyText('');

    // โหลดใหม่ทันที
    const loaded = await fetchChatsFromAPI();
    setChats(loaded);
  };

  const selectedChat = chats.find(c => c.id === selectedChatId) || null;
  const totalUnreadCount = chats.reduce((acc, c) => acc + c.unread, 0);

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

          <button 
            onClick={() => setActiveTab('chats')}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition ${
              activeTab === 'chats' ? 'bg-blue-700 text-white font-semibold shadow-sm' : 'text-slate-400 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <span className="flex items-center gap-3">
              <span>💬</span> ตอบแชทลูกค้า
            </span>
            {totalUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {totalUnreadCount}
              </span>
            )}
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
              {activeTab === 'chats' && 'ระบบตอบแชทลูกค้า (Customer Support)'}
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

        {/* === แท็บแชทกับลูกค้า === */}
        {activeTab === 'chats' && (
          <div className="max-w-6xl mx-auto h-[65vh] flex bg-white border border-slate-200 rounded-2xl shadow-md overflow-hidden animate-in fade-in duration-300">
            
            {/* รายชื่อลูกค้าฝั่งซ้าย */}
            <div className="w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
              <div className="p-4 border-b border-slate-200 bg-white">
                <h2 className="font-bold text-slate-900 text-sm">ข้อความเข้า (Inbox)</h2>
              </div>
              <div className="overflow-y-auto flex-grow divide-y divide-slate-100">
                {chats.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 text-sm">
                    📭 ยังไม่มีห้องแชทจากลูกค้า
                  </div>
                ) : (
                  chats.map(chat => (
                    <div 
                      key={chat.id} 
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`p-4 cursor-pointer transition-all flex flex-col gap-1 border-l-4 ${
                        selectedChatId === chat.id 
                          ? 'bg-blue-50 border-l-blue-600' 
                          : 'hover:bg-white border-l-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-slate-900 text-sm truncate pr-2 flex-1">{chat.name}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{chat.time}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-slate-500 text-xs truncate flex-1">{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
                            {chat.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* หน้าต่างแชทฝั่งขวา */}
            {selectedChat ? (
              <div className="w-2/3 flex flex-col bg-white">
                {/* Header แชท */}
                <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      👤
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{selectedChat.name}</h3>
                      <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span> ออนไลน์
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={async () => {
                      if (confirm(`🧹 คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการสนทนากับ "${selectedChat.name}"?`)) {
                        try {
                          await fetch(`/api/chats?chatId=${selectedChat.id}`, { method: 'DELETE' });
                          setSelectedChatId('');
                        } catch (e) {
                          console.error(e);
                        }
                      }
                    }}
                    className="text-xs text-red-500 hover:text-red-700 transition-colors font-bold flex items-center gap-1 hover:bg-red-50 px-2.5 py-1.5 rounded-lg border border-transparent hover:border-red-100"
                  >
                    🗑️ ลบแชท
                  </button>
                </div>

                {/* พื้นที่แสดงข้อความ */}
                <div className="flex-grow p-6 bg-slate-50 overflow-y-auto space-y-4">
                  {selectedChat.messages.map((msg) => {
                    const isAgent = msg.sender === 'agent';
                    return (
                      <div 
                        key={msg.id} 
                        className={`flex gap-3 max-w-[85%] ${
                          isAgent ? 'ml-auto flex-row-reverse' : 'mr-auto'
                        }`}
                      >
                        {!isAgent && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs shrink-0 select-none">
                            👤
                          </div>
                        )}
                        
                        <div className="space-y-1">
                          <div
                            className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                              isAgent
                                ? 'bg-slate-900 text-white rounded-tr-none'
                                : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none'
                            }`}
                          >
                            {/* แสดงรายละเอียดสินค้าที่แนบมา */}
                            {msg.product && (
                              <div className="mb-2 p-2.5 bg-slate-900/5 rounded-xl border border-dashed border-slate-300/60 text-slate-900 flex items-center gap-3">
                                <img
                                  src={msg.product.imageUrl}
                                  alt={msg.product.name}
                                  className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200 shrink-0"
                                />
                                <div className="min-w-0">
                                  <p className="font-bold text-xs truncate">{msg.product.name}</p>
                                  <p className="text-[10px] text-slate-500 truncate">{msg.product.category}</p>
                                  <p className="text-xs font-extrabold text-blue-600 mt-0.5">
                                    ฿{msg.product.price.toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* แสดงภาพที่แนบมา */}
                            {msg.image && (
                              <div className="mb-2 max-w-full rounded-lg overflow-hidden border border-slate-200 bg-white p-1">
                                <img src={msg.image} alt="อัปโหลดโดยลูกค้า" className="max-h-48 object-cover rounded mx-auto" />
                              </div>
                            )}

                            {/* แสดงข้อความข้อเขียน */}
                            {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}
                          </div>
                          
                          <p className={`text-[10px] text-slate-400 ${isAgent ? 'text-right' : 'text-left'}`}>
                            {msg.senderName} • {msg.timestamp}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* ช่องพิมพ์ข้อความ */}
                <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-slate-200">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="พิมพ์ข้อความตอบกลับ..." 
                      className="flex-grow border border-slate-300 rounded-full px-4 py-2.5 text-sm outline-none focus:border-slate-900 transition-all focus:bg-white"
                    />
                    <button 
                      type="submit"
                      disabled={!replyText.trim()}
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all shrink-0"
                    >
                      ส่งข้อความ
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="w-2/3 flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-8">
                <div className="text-6xl mb-4 grayscale opacity-60">💬</div>
                <h3 className="text-lg font-bold text-zinc-700">ไม่มีห้องแชทที่เลือก</h3>
                <p className="text-sm mt-1">กรุณาเลือกรายชื่อลูกค้าจากเมนูด้านซ้ายเพื่อเริ่มสนทนา</p>
              </div>
            )}
            
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