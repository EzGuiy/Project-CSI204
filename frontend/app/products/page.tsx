'use client'; 

import { useState } from 'react';
import ProductCard from '../../components/ProductCard';

const mockProducts = [
  { id: '1', name: 'Jinko Solar Tiger Pro 550W', category: 'บ้านพักอาศัย (Residential)', price: 4500, capacity: '550W', imageUrl: '/Jiinko_550w.jpg' },
  { id: '2', name: 'Longi Hi-MO 5 540W', category: 'บ้านพักอาศัย (Residential)', price: 4200, capacity: '540W', imageUrl: '/Jiinko_550w.jpg' },
  { id: '3', name: 'Huawei SUN2000-5KTL', category: 'ภาคพาณิชย์และอุตสาหกรรม', price: 28500, capacity: '5kW', imageUrl: '/OIP(1).jpg' },
  { id: '4', name: 'Growatt MIN 3000TL-X', category: 'บ้านพักอาศัย (Residential)', price: 15900, capacity: '3kW', imageUrl: '/OIP(1).jpg' },
  { id: '5', name: 'รางอลูมิเนียม Mounting Rail 4.2m', category: 'อุปกรณ์ติดตั้ง', price: 650, capacity: '-', imageUrl: '/OIP(2).jpg' },
  { id: '6', name: 'แบตเตอรี่ลิเธียม Huawei LUNA2000', category: 'ระบบกักเก็บพลังงาน', price: 95000, capacity: '5kWh', imageUrl: '/OIP(3).jpg' },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // เปลี่ยนชื่อหมวดหมู่ให้คล้าย Huawei
  const categories = [
    'ทั้งหมด', 
    'บ้านพักอาศัย (Residential)', 
    'ภาคพาณิชย์และอุตสาหกรรม', 
    'ระบบกักเก็บพลังงาน', 
    'อุปกรณ์ติดตั้ง'
  ];

  return (
    <div className="bg-white min-h-screen">
      {/* 🔴 แถบสีแดงตกแต่งด้านบนสุด (Optional) */}
      <div className="w-full h-1 bg-red-600"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row gap-12">
        
        {/* ⬅️ Sidebar ด้านซ้าย (หมวดหมู่) */}
        <aside className="w-full md:w-64 shrink-0">
          <h2 className="text-xl font-bold text-zinc-900 mb-6 border-b border-zinc-200 pb-4">
            หมวดหมู่สินค้า
          </h2>
          <ul className="space-y-3">
            {categories.map(category => (
              <li key={category}>
                <button
                  onClick={() => setSelectedCategory(category)}
                  className={`text-left w-full text-[15px] transition-colors py-1 ${
                    selectedCategory === category 
                      ? 'text-red-600 font-bold' 
                      : 'text-zinc-500 hover:text-red-600'
                  }`}
                >
                  {category}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* ➡️ Main Content ด้านขวา (ค้นหา + กริดสินค้า) */}
        <main className="flex-1">
          
          {/* แถบค้นหาแบบคลีนๆ (ขีดเส้นใต้เส้นเดียว) */}
          <div className="mb-10 relative">
            <input 
              type="text" 
              placeholder="ค้นหาสินค้า... (เช่น Huawei, Jinko)" 
              className="w-full md:w-1/2 px-0 py-3 border-b-2 border-zinc-200 focus:border-red-600 transition-all outline-none bg-transparent text-zinc-900 placeholder-zinc-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute right-auto left-[calc(50%-2rem)] md:left-auto md:right-[50%] top-3 text-zinc-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </div>
          </div>

          {/* กริดแสดงสินค้า */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-zinc-400 mb-2">ไม่พบสินค้าในหมวดหมู่นี้</p>
              <button 
                onClick={() => { setSearchTerm(''); setSelectedCategory('ทั้งหมด'); }}
                className="text-red-600 font-medium hover:underline"
              >
                ล้างการค้นหา
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}