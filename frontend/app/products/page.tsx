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
  
  // State สำหรับจัดการการค้นหาและกรอง
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

  // ฟังก์ชันกรองสินค้าตามการค้นหาและหมวดหมู่
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // ดึงรายชื่อหมวดหมู่ทั้งหมดออกมาทำ Dropdown
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

        {/* ส่วนระบบค้นหาและกรองสินค้า */}
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
              <div key={product.id} className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow flex flex-col">
                
                {/* 🌟 1. ลิงก์ที่รูปภาพสินค้า */}
                <Link href={`/products/${product.id}`} className="aspect-square bg-[#f7f7f7] p-6 flex items-center justify-center relative block cursor-pointer">
                  <img 
                    src={product.image || '/file.svg'} 
                    alt={product.name}
                    className={`w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500 ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/file.svg';
                    }}
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-3 right-3 bg-amber-100 text-amber-800 text-xs font-bold px-2 py-1 rounded-md">
                      เหลือ {product.stock} ชิ้น
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-3 right-3 bg-zinc-800 text-white text-xs font-bold px-2 py-1 rounded-md">
                      สินค้าหมด
                    </span>
                  )}
                </Link>

                <div className="p-5 flex flex-col flex-grow">
                  <span className="text-xs font-medium text-zinc-400 mb-2 block">{product.category}</span>
                  
                  {/* 🌟 2. ลิงก์ที่ชื่อสินค้า */}
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-bold text-zinc-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-auto pt-4 flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-lg text-zinc-900">
                        ฿{(product.price || 0).toLocaleString()}
                      </span>
                      {/* 🌟 3. ปุ่มดูรายละเอียด */}
                      <Link 
                        href={`/products/${product.id}`}
                        className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                      >
                        ดูรายละเอียด <span>›</span>
                      </Link>
                    </div>

                    {/* ปุ่มสั่งซื้อ / สินค้าหมด */}
                    {product.stock > 0 ? (
                      <Link 
                        href={`/products/${product.id}`}
                        className="w-full text-center text-sm font-bold text-white bg-slate-900 px-4 py-2.5 rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        สั่งซื้อสินค้า
                      </Link>
                    ) : (
                      <button 
                        disabled
                        className="w-full text-center text-sm font-bold text-slate-400 bg-slate-100 px-4 py-2.5 rounded-lg cursor-not-allowed border border-slate-200"
                      >
                        สินค้าหมดชั่วคราว
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