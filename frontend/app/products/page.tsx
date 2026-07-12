'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 1. เพิ่ม State สำหรับจัดการการค้นหาและกรอง
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ทั้งหมด');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) throw new Error('Failed to fetch');
        
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // 2. ฟังก์ชันกรองสินค้าตามการค้นหาและหมวดหมู่
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 3. ดึงรายชื่อหมวดหมู่ทั้งหมดออกมาทำ Dropdown
  const categories = ['ทั้งหมด', ...Array.from(new Set(products.map(p => p.category)))];

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">แคตตาล็อกสินค้า</h1>
            <p className="text-zinc-500">อุปกรณ์โซล่าเซลล์คุณภาพสูง พร้อมรับประกัน</p>
          </div>
        </div>

        {/* 🌟 ส่วนระบบค้นหาและกรองสินค้า */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-zinc-200 mb-8 flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="🔍 ค้นหาสินค้า..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:border-blue-500"
          />
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-zinc-300 rounded-md focus:outline-none focus:border-blue-500 bg-white"
          >
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* ส่วนแสดงรายการสินค้า */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-zinc-500">
            กำลังโหลดข้อมูล...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-zinc-500 bg-white rounded-lg border border-zinc-200">
            <span className="text-4xl block mb-2">🔍</span>
            ไม่พบสินค้าที่คุณค้นหา
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-sm border border-zinc-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
                <div className="aspect-square bg-zinc-100 p-6 flex items-center justify-center relative">
                  <img 
                    src={product.image || '/file.svg'} 
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/file.svg';
                    }}
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm">
                      ใกล้หมด ({product.stock})
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-zinc-800 text-white text-xs font-bold px-2 py-1 rounded-sm">
                      สินค้าหมด
                    </span>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-xs font-medium text-zinc-400 mb-2 block">{product.category}</span>
                  <h3 className="font-bold text-zinc-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="mt-auto pt-4 flex justify-between items-center">
                    <span className="font-bold text-lg text-zinc-900">
                      ฿{(product.price || 0).toLocaleString()}
                    </span>
                    
                    {/* 🌟 เช็คสต๊อก: ถ้าเหลือ 0 ให้ปุ่มเป็นสีเทาและกดไม่ได้ */}
                    {product.stock > 0 ? (
                      <Link 
                        href={`/products/${product.id}`}
                        className="text-sm font-bold text-white bg-slate-900 px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                      >
                        สั่งซื้อ
                      </Link>
                    ) : (
                      <button 
                        disabled
                        className="text-sm font-bold text-slate-400 bg-slate-200 px-4 py-2 rounded-md cursor-not-allowed"
                      >
                        สินค้าหมด
                      </button>
                    )}

                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}