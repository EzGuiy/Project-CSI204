'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// กำหนดโครงสร้างข้อมูลสินค้า (Type)
interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

export default function ProductsPage() {
  // สร้าง State สำหรับเก็บข้อมูลสินค้า และสถานะการโหลด
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ดึงข้อมูลจาก API ทันทีที่เปิดหน้านี้
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

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-zinc-200 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-zinc-900 mb-2">แคตตาล็อกสินค้า</h1>
            <p className="text-zinc-500">อุปกรณ์โซล่าเซลล์คุณภาพสูง พร้อมรับประกัน</p>
          </div>
        </div>

        {/* ตรวจสอบสถานะการโหลด */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64 text-zinc-500">
            กำลังโหลดข้อมูลสินค้า...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-sm border border-zinc-200 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
                {/* รูปภาพสินค้า */}
                <div className="aspect-square bg-zinc-100 p-6 flex items-center justify-center relative">
                  <img 
                    src={product.image} 
                    alt={product.name}
                    className="w-full h-full object-contain mix-blend-multiply"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/file.svg'; // รูปสำรอง
                    }}
                  />
                  {product.stock <= 5 && product.stock > 0 && (
                    <span className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-sm">
                      ใกล้หมด
                    </span>
                  )}
                  {product.stock === 0 && (
                    <span className="absolute top-2 right-2 bg-zinc-800 text-white text-xs font-bold px-2 py-1 rounded-sm">
                      สินค้าหมด
                    </span>
                  )}
                </div>

                {/* รายละเอียดสินค้า */}
                <div className="p-5">
                  <span className="text-xs font-medium text-zinc-400 mb-2 block">{product.category}</span>
                  <h3 className="font-bold text-zinc-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                    {product.name}
                  </h3>
                  <div className="flex justify-between items-center mt-4">
                    <span className="font-bold text-lg text-zinc-900">
                      ฿{product.price.toLocaleString()}
                    </span>
                    <Link 
                      href={`/products/${product.id}`}
                      className="text-sm font-medium text-zinc-500 hover:text-red-600 transition-colors"
                    >
                      ดูรายละเอียด ›
                    </Link>
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