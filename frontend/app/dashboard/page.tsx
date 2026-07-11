'use client';

import { useState } from 'react';

// ข้อมูลจำลองสำหรับสต๊อกสินค้า
const initialProducts = [
  { id: '1', name: 'Jinko Solar Tiger Pro 550W', category: 'บ้านพักอาศัย', price: 4500, stock: 15 },
  { id: '3', name: 'Huawei SUN2000-5KTL', category: 'อินเวอร์เตอร์', price: 28500, stock: 5 },
  { id: '6', name: 'แบตเตอรี่ลิเธียม Huawei LUNA2000', category: 'ระบบกักเก็บพลังงาน', price: 95000, stock: 2 },
];

// ข้อมูลจำลองสำหรับแชทลูกค้า
const mockChats = [
  { id: 'c1', name: 'คุณสมชาย', lastMessage: 'สนใจติดตั้งชุด 5kW ครับ', time: '10:30', unread: 1 },
  { id: 'c2', name: 'คุณวิภา', lastMessage: 'แบตเตอรี่รับประกันกี่ปีคะ?', time: '09:15', unread: 0 },
];

export default function EmployeeDashboard() {
  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState(initialProducts);
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);

  // ฟังก์ชันเพิ่ม/ลดสต๊อก
  const updateStock = (id: string, amount: number) => {
    setProducts(products.map(p => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p
    ));
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row">
      
      {/* ⬅️ Sidebar เมนูพนักงาน */}
      <aside className="w-full md:w-64 bg-zinc-900 text-white flex flex-col min-h-screen shrink-0">
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-bold tracking-wide">Employee Panel</h2>
          <p className="text-zinc-400 text-sm mt-1">SolarTech Solutions</p>
        </div>
        <nav className="p-4 space-y-2 flex-grow">
          <button 
            onClick={() => setActiveTab('inventory')}
            className={`w-full text-left px-4 py-3 rounded-sm transition-colors flex items-center gap-3 ${
              activeTab === 'inventory' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <span className="text-lg">📦</span> คลังสินค้า
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`w-full text-left px-4 py-3 rounded-sm transition-colors flex items-center justify-between ${
              activeTab === 'chat' ? 'bg-red-600 text-white' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3"><span className="text-lg">💬</span> ตอบแชทลูกค้า</div>
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">1</span>
          </button>
        </nav>
      </aside>

      {/* ➡️ Main Content พื้นที่การทำงาน */}
      <main className="flex-grow p-8 overflow-y-auto">
        
        {/* === แท็บจัดการสต๊อกสินค้า === */}
        {activeTab === 'inventory' && (
          <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-zinc-900">จัดการสต๊อกสินค้า</h1>
              <button className="bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 rounded-sm text-sm font-medium transition-colors">
                + เพิ่มสินค้าใหม่
              </button>
            </div>
            
            <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 text-sm">
                    <th className="p-4 font-medium">รหัส</th>
                    <th className="p-4 font-medium">ชื่อสินค้า</th>
                    <th className="p-4 font-medium">หมวดหมู่</th>
                    <th className="p-4 font-medium">ราคา</th>
                    <th className="p-4 font-medium text-center">จำนวนในคลัง</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {products.map(product => (
                    <tr key={product.id} className="hover:bg-zinc-50 transition-colors">
                      <td className="p-4 text-zinc-500 text-sm">#{product.id}</td>
                      <td className="p-4 font-medium text-zinc-900">{product.name}</td>
                      <td className="p-4 text-zinc-500 text-sm">{product.category}</td>
                      <td className="p-4 text-zinc-900">฿{product.price.toLocaleString()}</td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-3">
                          <button 
                            onClick={() => updateStock(product.id, -1)}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
                          >-</button>
                          <span className={`w-8 text-center font-bold ${product.stock < 5 ? 'text-red-600' : 'text-zinc-900'}`}>
                            {product.stock}
                          </span>
                          <button 
                            onClick={() => updateStock(product.id, 1)}
                            className="w-8 h-8 flex items-center justify-center border border-zinc-300 rounded-sm text-zinc-600 hover:bg-zinc-100 transition-colors"
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
          <div className="max-w-6xl mx-auto h-[80vh] flex bg-white border border-zinc-200 rounded-sm shadow-sm overflow-hidden">
            
            {/* รายชื่อลูกค้าฝั่งซ้าย */}
            <div className="w-1/3 border-r border-zinc-200 bg-zinc-50 flex flex-col">
              <div className="p-4 border-b border-zinc-200 bg-white">
                <h2 className="font-bold text-zinc-900">ข้อความ (Messages)</h2>
              </div>
              <div className="overflow-y-auto flex-grow">
                {mockChats.map(chat => (
                  <div 
                    key={chat.id} 
                    onClick={() => setSelectedChat(chat)}
                    className={`p-4 border-b border-zinc-100 cursor-pointer transition-colors ${
                      selectedChat.id === chat.id ? 'bg-red-50 border-l-4 border-l-red-600' : 'hover:bg-white border-l-4 border-l-transparent'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-bold text-zinc-900 text-sm">{chat.name}</span>
                      <span className="text-xs text-zinc-400">{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className="text-zinc-500 text-sm truncate pr-4">{chat.lastMessage}</p>
                      {chat.unread > 0 && (
                        <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full shrink-0">
                          {chat.unread}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* หน้าต่างแชทฝั่งขวา */}
            <div className="w-2/3 flex flex-col">
              {/* Header แชท */}
              <div className="p-4 border-b border-zinc-200 flex items-center gap-3">
                <div className="w-10 h-10 bg-zinc-200 rounded-full flex items-center justify-center text-xl">👤</div>
                <div>
                  <h3 className="font-bold text-zinc-900">{selectedChat.name}</h3>
                  <p className="text-xs text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span> ออนไลน์
                  </p>
                </div>
              </div>

              {/* พื้นที่แสดงข้อความ */}
              <div className="flex-grow p-6 bg-zinc-50 overflow-y-auto space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-zinc-200 rounded-full flex items-center justify-center shrink-0">👤</div>
                  <div className="bg-white border border-zinc-200 p-3 rounded-r-lg rounded-bl-lg text-sm text-zinc-700 shadow-sm">
                    {selectedChat.lastMessage}
                  </div>
                </div>
              </div>

              {/* ช่องพิมพ์ข้อความ */}
              <div className="p-4 bg-white border-t border-zinc-200">
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="พิมพ์ข้อความตอบกลับ..." 
                    className="flex-grow border border-zinc-300 rounded-sm px-4 py-2 text-sm outline-none focus:border-red-600 transition-colors"
                  />
                  <button className="bg-zinc-900 hover:bg-zinc-800 text-white px-6 py-2 rounded-sm text-sm font-medium transition-colors">
                    ส่ง
                  </button>
                </div>
              </div>
            </div>
            
          </div>
        )}

      </main>
    </div>
  );
}