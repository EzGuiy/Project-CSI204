'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Product {
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
  image?: string; // Base64 image
  product?: Product; // แนบสินค้า
  timestamp: string;
  isRead: boolean;
}

export default function ChatWidget() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [chatId, setChatId] = useState<string>('');
  const [chatName, setChatName] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [attachedProduct, setAttachedProduct] = useState<Product | null>(null);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // เลื่อนหน้าต่างแชตลงล่างสุดอัตโนมัติเมื่อมีข้อความใหม่
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  // กำหนด Chat ID & Name ของผู้ใช้ (ใช้ Session ถ้าล็อกอินอยู่ หรือสุ่ม Guest ID)
  useEffect(() => {
    const getOrInitChatSession = () => {
      const session = localStorage.getItem('solar_session');
      let currentId = '';
      let currentName = '';

      if (session) {
        try {
          const data = JSON.parse(session);
          if (data.id) currentId = data.id;
          if (data.name) currentName = data.name;
          if (data.role) setCurrentUserRole(data.role);
        } catch (e) {
          console.error(e);
        }
      } else {
        setCurrentUserRole('');
      }

      if (!currentId) {
        let guestId = localStorage.getItem('solar_chat_guest_id');
        if (!guestId) {
          guestId = 'GUEST-' + Math.random().toString(36).substring(2, 9).toUpperCase();
          localStorage.setItem('solar_chat_guest_id', guestId);
        }
        currentId = guestId;
      }

      if (!currentName) {
        let guestName = localStorage.getItem('solar_chat_guest_name');
        if (!guestName) {
          guestName = `ลูกค้า (${currentId})`;
          localStorage.setItem('solar_chat_guest_name', guestName);
        }
        currentName = guestName;
      }

      setChatId(currentId);
      setChatName(currentName);
    };

    getOrInitChatSession();

    // ดักจับเมื่อมีการเปลี่ยน session ในแท็บอื่น
    window.addEventListener('storage', getOrInitChatSession);
    return () => window.removeEventListener('storage', getOrInitChatSession);
    
  // 🌟🌟🌟 แก้ไขตรงนี้: เพิ่ม pathname เข้าไปในวงเล็บ เพื่อให้ระบบเช็คชื่อผู้ใช้ใหม่ทุกครั้งที่เปลี่ยนหน้า
  }, [pathname]);



  // โหลดประวัติการสนทนาของฉันจาก API
  const loadMyChatHistory = async (currentChatId: string) => {
    if (!currentChatId) return;
    try {
      const res = await fetch('/api/chats');
      if (res.ok) {
        const allChats: Message[] = await res.json();
        const filtered = allChats.filter((m) => m.chatId === currentChatId);
        if (filtered.length === 0) {
          // คืนค่าข้อความต้อนรับเริ่มต้น
          setMessages([
            {
              id: 'msg-init',
              chatId: currentChatId,
              senderName: 'SolarTech Support',
              sender: 'agent',
              text: 'สวัสดีครับ! ยินดีต้อนรับสู่ SolarTech แหล่งรวมอุปกรณ์โซล่าเซลล์ครบวงจร ☀️ มีข้อสงสัยเกี่ยวกับสินค้า คำนวณขนาดติดตั้ง หรือต้องการส่งรูปภาพหน้างานเพื่อให้เราประเมิน สอบถามเข้ามาได้เลยครับผม!',
              timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
              isRead: true,
            },
          ]);
        } else {
          setMessages(filtered);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  // โหลดครั้งแรกเมื่อได้ chatId
  useEffect(() => {
    if (chatId) {
      loadMyChatHistory(chatId);
    }
  }, [chatId]);

  // Polling ข้อความใหม่ทุกๆ 3 วินาที
  useEffect(() => {
    if (!chatId) return;
    const interval = setInterval(() => {
      loadMyChatHistory(chatId);
    }, 3000);
    return () => clearInterval(interval);
  }, [chatId]);

  // ดักจับ Event สำหรับเปิดแชตพร้อมแนบสินค้า
  useEffect(() => {
    const handleOpenChatWithProduct = (e: Event) => {
      const customEvent = e as CustomEvent<Product>;
      if (customEvent.detail) {
        setAttachedProduct(customEvent.detail);
        setIsOpen(true);
      }
    };

    window.addEventListener('openChatWithProduct', handleOpenChatWithProduct);
    return () => {
      window.removeEventListener('openChatWithProduct', handleOpenChatWithProduct);
    };
  }, []);

  // จัดการอัปโหลดไฟล์รูปภาพและแปลงเป็น Base64
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('❌ ขนาดไฟล์รูปภาพต้องไม่เกิน 2MB ครับ');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // ลบรูปภาพที่แนบอยู่
  const removeAttachedImage = () => {
    setAttachedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // ลบสินค้าที่แนบอยู่
  const removeAttachedProduct = () => {
    setAttachedProduct(null);
  };

  // ส่งข้อความ
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() && !attachedImage && !attachedProduct) return;
    if (!chatId) return;

    const newUserMsg: Message = {
      id: `msg-${Date.now()}-user`,
      chatId: chatId,
      senderName: chatName,
      sender: 'user',
      text: messageText.trim() || undefined,
      image: attachedImage || undefined,
      product: attachedProduct || undefined,
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
      isRead: false,
    };

    try {
      await fetch('/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUserMsg),
      });
      // โหลดข้อความเพื่อแสดงผลทันที
      loadMyChatHistory(chatId);
    } catch (e) {
      console.error(e);
    }

    // ล้างช่องป้อนและสิ่งที่แนบมา
    setMessageText('');
    setAttachedImage(null);
    setAttachedProduct(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // เคลียร์ประวัติการคุย
  const handleClearChat = async () => {
    if (confirm('คุณต้องการลบประวัติการสนทนาทั้งหมดหรือไม่?')) {
      try {
        await fetch(`/api/chats?chatId=${chatId}`, { method: 'DELETE' });
        // รีเซ็ต local state
        setMessages([
          {
            id: 'msg-init-reset',
            chatId: chatId,
            senderName: 'SolarTech Support',
            sender: 'agent',
            text: 'รีเซ็ตระบบแชตเรียบร้อยครับ มีข้อมูลส่วนไหนให้ผมช่วยเหลือเพิ่มเติมสอบถามได้เลยครับ!',
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
            isRead: true,
          },
        ]);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // ซ่อนปุ่มแชทหากไม่ใช่ลูกค้า (บังคับล็อกอินเป็น customer ถึงจะแชตได้)
  if (
    currentUserRole !== 'customer' ||
    pathname === '/login' ||
    pathname === '/register' ||
    pathname === '/dashboard' ||
    pathname?.startsWith('/admin')
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] font-sans">
      
      {/* 💻 Chat Panel */}
      {isOpen && (
        <div
          className="mb-4 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[520px]"
          style={{
            animation: 'chatSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {/* Header */}
          <div className="bg-slate-900 px-5 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-lg shadow-md">
                ☀️
              </div>
              <div>
                <h3 className="text-white font-bold text-sm leading-tight flex items-center gap-1.5 flex-row">
                  SolarTech Support
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full inline-block border border-slate-900 animate-pulse"></span>
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">ตอบกลับเร็วภายในไม่กี่นาที</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                type="button"
                title="ล้างประวัติแชต"
                className="text-slate-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-sm"
              >
                🗑️
              </button>
              <button
                onClick={() => setIsOpen(false)}
                type="button"
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition-colors text-lg font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 max-w-[85%] ${
                  msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {msg.sender === 'agent' && (
                  <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs shrink-0 select-none">
                    👨‍💼
                  </div>
                )}
                
                <div className="space-y-1">
                  <div
                    className={`rounded-2xl px-4 py-2.5 text-sm shadow-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
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
                        <img src={msg.image} alt="อัปโหลดโดยผู้ใช้" className="max-h-48 object-cover rounded mx-auto" />
                      </div>
                    )}

                    {/* แสดงข้อความข้อเขียน */}
                    {msg.text && <p className="whitespace-pre-line">{msg.text}</p>}
                  </div>
                  
                  <p className={`text-[10px] text-slate-400 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    {msg.timestamp} {msg.sender === 'user' && msg.isRead && <span className="text-blue-500 font-medium ml-1">✓ อ่านแล้ว</span>}
                  </p>
                </div>
              </div>
            ))}

            {/* ส่วนแสดงการตอบกลับ (Typing Indicator) */}
            {isTyping && (
              <div className="flex gap-2 max-w-[80%] mr-auto items-center">
                <div className="w-8 h-8 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-xs shrink-0">
                  👨‍💼
                </div>
                <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 shadow-sm">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* ส่วนพรีวิวไฟล์แนบและรูปถ่ายก่อนกดส่ง */}
          {(attachedImage || attachedProduct) && (
            <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex flex-col gap-2 shrink-0 animate-fade-in">
              {attachedProduct && (
                <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">📦</span>
                    <div className="truncate">
                      <p className="font-bold text-slate-800 truncate">{attachedProduct.name}</p>
                      <p className="text-[10px] text-slate-500 truncate">฿{attachedProduct.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <button
                    onClick={removeAttachedProduct}
                    type="button"
                    className="text-slate-400 hover:text-red-500 font-bold p-1 hover:bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              )}

              {attachedImage && (
                <div className="bg-white p-2 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <img src={attachedImage} className="w-8 h-8 object-cover rounded" alt="พรีวิวรูปภาพ" />
                    <span className="text-slate-600 truncate font-medium">รูปภาพที่เลือกไว้</span>
                  </div>
                  <button
                    onClick={removeAttachedImage}
                    type="button"
                    className="text-slate-400 hover:text-red-500 font-bold p-1 hover:bg-slate-100 rounded-full w-5 h-5 flex items-center justify-center"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer Input Bar */}
          <form onSubmit={handleSendMessage} className="px-4 py-3.5 bg-white border-t border-slate-200 shrink-0">
            <div className="flex items-center gap-2">
              
              {/* ปุ่มอัปโหลดรูปภาพ */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="แนบรูปถ่าย"
                className="w-10 h-10 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-colors shrink-0 border border-slate-200"
              >
                📷
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />

              {/* ช่องพิมพ์ข้อความ */}
              <input
                type="text"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder={attachedProduct || attachedImage ? "ใส่รายละเอียดเพิ่มเติม..." : "พิมพ์ข้อความสอบถาม..."}
                className="flex-1 bg-slate-100 text-slate-800 px-4 py-2.5 rounded-full text-sm outline-none border border-slate-100 focus:border-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
              />

              {/* ปุ่มส่ง */}
              <button
                type="submit"
                disabled={!messageText.trim() && !attachedImage && !attachedProduct}
                className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-full transition-all flex items-center justify-center shadow-md disabled:shadow-none shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>

            </div>
          </form>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center relative"
        style={{
          animation: 'chatPulse 3s infinite',
        }}
        title="แชทกับเรา"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-red-500 rounded-full border border-white" />
          </div>
        )}
      </button>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes chatSlideUp {
          from {
            opacity: 0;
            transform: translateY(24px) scale(0.92);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes chatPulse {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(37, 99, 235, 0.4);
          }
          50% {
            box-shadow: 0 4px 30px rgba(37, 99, 235, 0.7);
          }
        }
      `}</style>
    </div>
  );
}
