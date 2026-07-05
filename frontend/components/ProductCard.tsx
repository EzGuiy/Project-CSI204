import React from 'react';

interface ProductProps {
  id: string;
  name: string;
  category: string;
  price: number;
  capacity: string;
  imageUrl: string;
}

export default function ProductCard({ name, category, price, capacity, imageUrl }: ProductProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* รูปสินค้าจำลอง */}
      <div className="h-48 bg-slate-100 relative overflow-hidden flex items-center justify-center">
        <div className="text-6xl group-hover:scale-110 transition-transform duration-300">
          {imageUrl}
        </div>
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur text-blue-600 text-xs font-bold px-2 py-1 rounded-md shadow-sm">
          {category}
        </div>
      </div>

      {/* รายละเอียดสินค้า */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800 mb-1 line-clamp-2">{name}</h3>
        <p className="text-sm text-slate-500 mb-4">กำลังการผลิต: <span className="text-slate-700 font-medium">{capacity}</span></p>
        
        <div className="flex justify-between items-end mt-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-xs text-slate-400 mb-1">ราคาเริ่มต้น</p>
            <p className="text-xl font-bold text-blue-600">฿{price.toLocaleString()}</p>
          </div>
          <button className="bg-slate-900 hover:bg-blue-600 text-white p-2 rounded-lg transition-colors">
            <span className="text-sm px-2 font-medium">ดูรายละเอียด</span>
          </button>
        </div>
      </div>
    </div>
  );
}