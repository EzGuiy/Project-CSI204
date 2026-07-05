'use client'; // บังคับให้หน้านี้ทำงานฝั่ง Client เพื่อให้ระบบค้นหาพิมพ์ปุ๊บเปลี่ยนปั๊บได้

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';

// 1. จำลองฐานข้อมูลสินค้า (Mock Data)
const mockProducts = [
  { id: '1', name: 'Jinko Solar Tiger Pro 550W', category: 'แผงโซล่าเซลล์', price: 4500, capacity: '550W', imageUrl: '☀️' },
  { id: '2', name: 'Longi Hi-MO 5 540W', category: 'แผงโซล่าเซลล์', price: 4200, capacity: '540W', imageUrl: '☀️' },
  { id: '3', name: 'Huawei SUN2000-5KTL', category: 'อินเวอร์เตอร์', price: 28500, capacity: '5kW', imageUrl: '⚡' },
  { id: '4', name: 'Growatt MIN 3000TL-X', category: 'อินเวอร์เตอร์', price: 15900, capacity: '3kW', imageUrl: '⚡' },
  { id: '5', name: 'รางอลูมิเนียม Mounting Rail 4.2m', category: 'อุปกรณ์ติดตั้ง', price: 650, capacity: '-', imageUrl: '🔧' },
  { id: '6', name: 'แบตเตอรี่ลิเธียม Huawei LUNA2000', category: 'แบตเตอรี่', price: 95000, capacity: '5kWh', imageUrl: '🔋' },
];

export default function ProductsPage() {
  // 2. สร้างตัวแปรเก็บสถานะการค้นหาและการกรอง
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  // 3. ฟังก์ชันกรองสินค้าตามเงื่อนไข
  const filteredProducts = mockProducts.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ทั้งหมด', 'แผงโซล่าเซลล์', 'อินเวอร์เตอร์', 'แบตเตอรี่', 'อุปกรณ์ติดตั้ง'];

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">แคตตาล็อกสินค้า</h1>
          <p className="text-slate-600">ค้นหาและเลือกซื้ออุปกรณ์โซล่าเซลล์คุณภาพสูง</p>
        </div>
        
        {/* แถบค้นหา (Search Bar) */}
        <div className="w-full md:w-96 relative">
          <input 
            type="text" 
            placeholder="ค้นหาชื่อสินค้า... (เช่น Huawei, Jinko)" 
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div className="absolute left-3 top-3.5 text-slate-400">🔍</div>
        </div>
      </div>

      {/* แถบกรองหมวดหมู่ (Category Filter) */}
      <div className="flex overflow-x-auto gap-2 mb-8 pb-2 custom-scrollbar">
        {categories.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`whitespace-nowrap px-5 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === category 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-white border border-slate-200 text-slate-600 hover:border-blue-300 hover:text-blue-600'
            }`}
          >
            {category}
          </button>
        ))}
      </div>

      {/* กริดแสดงสินค้า (Product Grid) */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 border-dashed">
          <div className="text-4xl mb-4">🤷‍♂️</div>
          <h3 className="text-xl font-bold text-slate-800 mb-2">ไม่พบสินค้าที่คุณค้นหา</h3>
          <p className="text-slate-500">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่ใหม่ดูนะครับ</p>
          <button 
            onClick={() => { setSearchTerm(''); setSelectedCategory('ทั้งหมด'); }}
            className="mt-4 text-blue-600 font-medium hover:underline"
          >
            ล้างการค้นหาทั้งหมด
          </button>
        </div>
      )}
    </div>
  );
}