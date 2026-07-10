'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface OrderData {
  id: string;
  date: string;
  total: number;
  paymentMethod: 'credit_card' | 'qr';
  cardLast4: string | null;
  cardNetwork: string | null;
  items: { id: string; name: string; price: number; quantity: number; icon: string }[];
}

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const orderId = sessionStorage.getItem('last_order_id');
    if (orderId) {
      const orders = JSON.parse(localStorage.getItem('solar_orders') || '[]');
      const found = orders.find((o: OrderData) => o.id === orderId);
      if (found) setOrder(found);
      sessionStorage.removeItem('last_order_id');
    }
    // หยุด confetti หลัง 4 วินาที
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 flex items-center justify-center py-12 px-4 relative overflow-hidden">

      {/* Confetti Animation */}
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50">
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2.5 h-2.5 rounded-sm"
              style={{
                left: `${Math.random() * 100}%`,
                top: '-10px',
                backgroundColor: ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'][i % 6],
                animation: `confettiFall ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 1}s forwards`,
                transform: `rotate(${Math.random() * 360}deg)`,
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-lg w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">

          {/* Green Header */}
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-10 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                <circle cx="350" cy="20" r="80" fill="white"/>
                <circle cx="50" cy="180" r="60" fill="white"/>
              </svg>
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-5 backdrop-blur-sm" style={{ animation: 'successPop 0.5s ease-out' }}>
                <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" style={{ animation: 'checkDraw 0.6s ease-out 0.3s both' }} />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">สั่งซื้อสำเร็จ!</h1>
              <p className="text-emerald-100 text-sm">ขอบคุณที่ไว้วางใจ SolarTech</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="px-8 py-8">
            {order ? (
              <>
                {/* Order ID */}
                <div className="text-center mb-6 pb-6 border-b border-slate-100">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">หมายเลขคำสั่งซื้อ</p>
                  <p className="text-lg font-bold text-slate-900 font-mono tracking-wider">{order.id}</p>
                </div>

                {/* Summary Grid */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">ยอดชำระ</p>
                    <p className="text-lg font-bold text-blue-600">฿{order.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">ชำระผ่าน</p>
                    <p className="text-sm font-bold text-slate-800">
                      {order.paymentMethod === 'credit_card' ? (
                        <span className="flex items-center justify-center gap-1">
                          💳 •••• {order.cardLast4}
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-1">
                          🏦 QR PromptPay
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-3">รายการสินค้า</p>
                  <div className="space-y-2.5">
                    {order.items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <div className="w-10 h-10 bg-white rounded-md border border-slate-200 flex items-center justify-center p-1 shrink-0">
                          <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                          <p className="text-xs text-slate-400">x{item.quantity}</p>
                        </div>
                        <p className="text-sm font-bold text-slate-700 shrink-0">฿{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date */}
                <div className="text-center text-xs text-slate-400 mb-6">
                  วันที่สั่งซื้อ: {new Date(order.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-500 mb-2">🎉 คำสั่งซื้อของคุณถูกบันทึกเรียบร้อยแล้ว</p>
                <p className="text-sm text-slate-400">คุณสามารถตรวจสอบรายละเอียดได้ที่หน้าประวัติคำสั่งซื้อ</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link
                href="/orders"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
              >
                📋 ดูประวัติคำสั่งซื้อ
              </Link>
              <Link
                href="/"
                className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-center font-bold py-3.5 rounded-xl transition-all"
              >
                กลับหน้าหลัก
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes confettiFall {
          0% {
            transform: translateY(-10px) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes checkDraw {
          0% { stroke-dasharray: 0 100; opacity: 0; }
          100% { stroke-dasharray: 100 0; opacity: 1; }
        }
      `}</style>
    </div>
  );
}
