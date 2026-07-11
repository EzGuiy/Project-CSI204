'use client';

import { useState, useEffect, useRef } from 'react';

// ข้อมูลจำลองสำหรับสต๊อกสินค้าเริ่มต้น
const initialProducts = [
  { id: '1', name: 'Jinko Solar Tiger Pro 550W', category: 'บ้านพักอาศัย', price: 4500, stock: 15 },
  { id: '3', name: 'Huawei SUN2000-5KTL', category: 'อินเวอร์เตอร์', price: 28500, stock: 5 },
  { id: '6', name: 'แบตเตอรี่ลิเธียม Huawei LUNA2000', category: 'ระบบกักเก็บพลังงาน', price: 95000, stock: 2 },
];

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

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string>('');
  const [replyText, setReplyText] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // โหลดสินค้าจาก localStorage
  useEffect(() => {
    const stored = localStorage.getItem('solar_products');
    if (stored) {
      try {
        setProducts(JSON.parse(stored));
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem('solar_products', JSON.stringify(initialProducts));
    }
  }, []);

  // ฟังก์ชันเพิ่ม/ลดสต๊อก
  const updateStock = (id: string, amount: number) => {
    const updated = products.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p
    );
    setProducts(updated);
    localStorage.setItem('solar_products', JSON.stringify(updated));
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

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row font-sans">
      
      {/* ⬅️ Sidebar เมนูพนักงาน */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold tracking-wide">Employee Panel</h2>
          <p className="text-zinc-400 text-sm mt-1">SolarTech Solutions</p>
        </div>
        <nav className="p-4 space-y-2 flex-grow">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center gap-3 ${
              activeTab === 'inventory' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <span className="text-lg">📦</span> คลังสินค้า
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
              activeTab === 'chat' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3"><span className="text-lg">💬</span> ตอบแชทลูกค้า</div>
            {totalUnreadCount > 0 && (
              <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                {totalUnreadCount}
              </span>
            )}
          </button>
        </nav>
      </aside>

      {/* ➡️ Main Content พื้นที่การทำงาน */}
      <main className="flex-grow p-8 overflow-y-auto">
        
        {/* === แท็บจัดการสต๊อกสินค้า === */}
        {activeTab === 'inventory' && (
          <div className="max-w-5xl mx-auto animate-in fade-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-zinc-900">จัดการสต๊อกสินค้า</h1>
              <button 
                onClick={() => alert('ฟังก์ชัน "เพิ่มสินค้าใหม่" จะอัปเดตในเวอร์ชันถัดไป!')}
                className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm"
              >
                + เพิ่มสินค้าใหม่
              </button>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-sm">
                    <th className="p-4 font-medium pl-6">รหัส</th>
                    <th className="p-4 font-medium">ชื่อสินค้า</th>
                    <th className="p-4 font-medium">หมวดหมู่</th>
                    <th className="p-4 font-medium">ราคา</th>
                    <th className="p-4 font-medium text-center">จำนวนในคลัง</th>
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
                          <button 
                            onClick={() => updateStock(product.id, -1)}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
                          >-</button>
                          <span className={`w-8 text-center font-bold ${product.stock < 5 ? 'text-red-600' : 'text-zinc-900'}`}>
                            {product.stock}
                          </span>
                          <button 
                            onClick={() => updateStock(product.id, 1)}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors"
                          >+</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* === แท็บแชทกับลูกค้า === */}
        {activeTab === 'chat' && (
          <div className="max-w-6xl mx-auto h-[80vh] flex bg-white border border-zinc-200 rounded-2xl shadow-md overflow-hidden animate-in fade-in duration-300">
            
            {/* รายชื่อลูกค้าฝั่งซ้าย */}
            <div className="w-1/3 border-r border-zinc-200 bg-zinc-50 flex flex-col">
              <div className="p-4 border-b border-zinc-200 bg-white">
                <h2 className="font-bold text-zinc-950 text-sm">ข้อความเข้า (Inbox)</h2>
              </div>
              <div className="overflow-y-auto flex-grow divide-y divide-zinc-100">
                {chats.length === 0 ? (
                  <div className="p-8 text-center text-zinc-400 text-sm">
                    📭 ยังไม่มีห้องแชทจากลูกค้า
                  </div>
                ) : (
                  chats.map(chat => (
                    <div 
                      key={chat.id} 
                      onClick={() => setSelectedChatId(chat.id)}
                      className={`p-4 cursor-pointer transition-all flex flex-col gap-1 border-l-4 ${
                        selectedChatId === chat.id 
                          ? 'bg-red-50 border-l-red-600' 
                          : 'hover:bg-white border-l-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="font-bold text-zinc-900 text-sm truncate pr-2 flex-1">{chat.name}</span>
                        <span className="text-[10px] text-zinc-400 shrink-0">{chat.time}</span>
                      </div>
                      <div className="flex justify-between items-center gap-2">
                        <p className="text-zinc-500 text-xs truncate flex-1">{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0">
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
                <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white text-lg font-bold">
                      👤
                    </div>
                    <div>
                      <h3 className="font-bold text-zinc-950 text-sm">{selectedChat.name}</h3>
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
                <div className="flex-grow p-6 bg-zinc-50 overflow-y-auto space-y-4">
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
                                : 'bg-white text-zinc-900 border border-zinc-200 rounded-tl-none'
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
                <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-zinc-200">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="พิมพ์ข้อความตอบกลับ..." 
                      className="flex-grow border border-zinc-300 rounded-full px-4 py-2.5 text-sm outline-none focus:border-slate-900 transition-all focus:bg-white"
                    />
                    <button 
                      type="submit"
                      disabled={!replyText.trim()}
                      className="bg-slate-900 hover:bg-slate-800 disabled:bg-zinc-200 disabled:text-zinc-400 text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all shrink-0"
                    >
                      ส่งข้อความ
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="w-2/3 flex flex-col items-center justify-center bg-zinc-50 text-zinc-400 p-8">
                <div className="text-6xl mb-4 grayscale opacity-60">💬</div>
                <h3 className="text-lg font-bold text-zinc-700">ไม่มีห้องแชทที่เลือก</h3>
                <p className="text-sm mt-1">กรุณาเลือกรายชื่อลูกค้าจากเมนูด้านซ้ายเพื่อเริ่มสนทนา</p>
              </div>
            )}
            
          </div>
        )}

      </main>
    </div>
  );
}