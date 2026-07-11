'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const router = useRouter();

  // โหลดข้อมูลตะกร้าจาก LocalStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('solar_cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoaded(true);
  }, []);

  // ฟังก์ชันลบสินค้า
  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('solar_cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated')); // อัปเดตตัวเลขบนไอคอนตะกร้า
  };

  // ฟังก์ชันคำนวณยอดรวม
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // ไปยังหน้า Checkout
  const handleCheckout = () => {
    if (cartItems.length === 0) {
        alert('กรุณาเลือกสินค้าก่อนทำการสั่งซื้อครับ');
        return;
    }
    router.push('/checkout');
  };

  if (!isLoaded) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-3xl font-bold text-zinc-900 mb-8">ตะกร้าสินค้า</h1>

        {cartItems.length === 0 ? (
          // กรณีตะกร้าว่าง
          <div className="bg-white p-12 text-center rounded-sm border border-zinc-200 shadow-sm">
            <div className="text-6xl mb-4 text-zinc-300">🛒</div>
            <p className="text-zinc-500 mb-6">ไม่มีสินค้าในตะกร้าของคุณ</p>
            <Link href="/products" className="inline-block bg-zinc-900 text-white px-6 py-3 rounded-sm font-medium hover:bg-zinc-800 transition-colors">
              กลับไปเลือกซื้อสินค้า
            </Link>
          </div>
        ) : (
          // กรณีมีสินค้า
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* รายการสินค้า (ฝั่งซ้าย) */}
            <div className="md:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white p-6 rounded-sm border border-zinc-200 shadow-sm flex items-center gap-6">
                  {/* รูปสินค้า */}
                  <div className="w-24 h-24 bg-zinc-100 flex-shrink-0 flex items-center justify-center rounded-sm overflow-hidden p-2">
                    <img 
                      src={item.icon} // ใช้ item.icon เพราะเราเซฟ imageUrl ไว้ในคีย์ชื่อ icon ตอน Add to Cart
                      alt={item.name}
                      className="w-full h-full object-contain mix-blend-multiply"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/file.svg'; // รูปสำรองเผื่อหารูปไม่เจอ
                      }}
                    />
                  </div>

                  {/* ข้อมูลสินค้า */}
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-zinc-900 mb-1">{item.name}</h3>
                    <p className="text-zinc-500 mb-2">ราคา: ฿{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-medium text-zinc-700 bg-zinc-100 px-3 py-1 rounded-sm">
                        จำนวน: {item.quantity}
                      </span>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 text-sm hover:underline"
                      >
                        ลบออก
                      </button>
                    </div>
                  </div>
                  
                  {/* ราคารวมของสินค้านั้น */}
                  <div className="text-right">
                    <p className="font-bold text-lg text-zinc-900">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* สรุปยอดและปุ่มจ่ายเงิน (ฝั่งขวา) */}
            <div className="md:col-span-1">
              <div className="bg-white p-6 rounded-sm border border-zinc-200 shadow-sm sticky top-24">
                <h2 className="text-xl font-bold text-zinc-900 mb-6 pb-4 border-b border-zinc-100">สรุปคำสั่งซื้อ</h2>
                
                <div className="flex justify-between mb-4 text-zinc-600">
                  <span>ยอดรวม ({cartItems.length} รายการ)</span>
                  <span>฿{calculateTotal().toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between font-bold text-xl text-zinc-900 mt-6 pt-6 border-t border-zinc-100">
                  <span>ยอดสุทธิ</span>
                  <span>฿{calculateTotal().toLocaleString()}</span>
                </div>

                <button 
                  onClick={handleCheckout}
                  className="w-full mt-8 bg-red-600 text-white py-4 rounded-sm font-bold text-lg hover:bg-red-700 transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  ดำเนินการสั่งซื้อ <span>›</span>
                </button>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}