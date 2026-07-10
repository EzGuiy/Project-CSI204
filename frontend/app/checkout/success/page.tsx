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
  status: string;
  carrier: string | null;
  trackingNumber: string | null;
  statusHistory?: { status: string; label: string; date: string; note: string }[];
}

const steps = [
  { status: 'confirmed', label: 'ยืนยันสั่งซื้อ', icon: '📝', desc: 'ชำระเงินสำเร็จ ระบบยืนยันคำสั่งซื้อ' },
  { status: 'processing', label: 'กำลังเตรียมสินค้า', icon: '📦', desc: 'คลังสินค้ากำลังแพ็คและจัดเตรียมสินค้า' },
  { status: 'shipped', label: 'จัดส่งแล้ว', icon: '🚚', desc: 'ส่งมอบให้บริษัทจัดส่งสำเร็จ' },
  { status: 'delivered', label: 'จัดส่งสำเร็จ', icon: '🏠', desc: 'สินค้าจัดส่งถึงที่หมายเรียบร้อยแล้ว' },
];

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  // 1. ดึงข้อมูลสั่งซื้อเมื่อเปิดหน้าจอ
  useEffect(() => {
    const orderId = sessionStorage.getItem('last_order_id');
    if (orderId) {
      const orders = JSON.parse(localStorage.getItem('solar_orders') || '[]');
      const found = orders.find((o: OrderData) => o.id === orderId);
      if (found) setOrder(found);
    }
    // หยุด confetti หลัง 4 วินาที
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // 2. จำลองการเปลี่ยนสถานะโดยอัตโนมัติ (Automated State Simulation) ทุกๆ 5 วินาที
  useEffect(() => {
    if (!order) return;
    if (order.status === 'delivered') return;

    const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
    const currentIdx = statusOrder.indexOf(order.status);
    if (currentIdx === -1 || currentIdx === statusOrder.length - 1) return;

    const timer = setTimeout(() => {
      const nextStatus = statusOrder[currentIdx + 1];
      const updatedHistory = [...(order.statusHistory || [])];
      
      let label = '';
      let note = '';
      let carrier = order.carrier;
      let trackingNumber = order.trackingNumber;

      if (nextStatus === 'processing') {
        label = 'กำลังเตรียมสินค้า';
        note = 'คลังสินค้ากำลังจัดแยกและแพ็คบรรจุกล่องพัสดุ';
      } else if (nextStatus === 'shipped') {
        label = 'จัดส่งแล้ว';
        note = 'สินค้าจัดส่งออกจากคลังผ่าน Flash Express';
        carrier = 'Flash Express';
        trackingNumber = `FL-SOLAR-${Math.floor(100000000 + Math.random() * 900000000)}`;
      } else if (nextStatus === 'delivered') {
        label = 'จัดส่งสำเร็จ';
        note = 'สินค้าส่งถึงจุดหมายปลายทางและลงชื่อรับเรียบร้อยแล้ว';
      }

      // สร้างบันทึกความคืบหน้าของสถานะใหม่
      const historyItem = {
        status: nextStatus,
        label,
        date: new Date().toISOString(), // อัปเดตเวลาเป็นเวลาปัจจุบัน ณ ตอนที่ขยับสเต็ป
        note,
      };

      const existingIdx = updatedHistory.findIndex(h => h.status === nextStatus);
      if (existingIdx > -1) {
        updatedHistory[existingIdx] = historyItem;
      } else {
        updatedHistory.push(historyItem);
      }

      // เติมเต็มสเต็ปก่อนหน้านี้เพื่อป้องกันข้อมูลไม่สอดคล้อง
      for (let i = 0; i <= currentIdx + 1; i++) {
        const checkStatus = statusOrder[i];
        if (!updatedHistory.some(h => h.status === checkStatus)) {
          let prevLabel = '';
          let prevNote = '';
          if (checkStatus === 'processing') {
            prevLabel = 'กำลังเตรียมสินค้า';
            prevNote = 'คลังสินค้ากำลังจัดแยกและแพ็คบรรจุกล่องพัสดุ';
          } else if (checkStatus === 'shipped') {
            prevLabel = 'จัดส่งแล้ว';
            prevNote = 'สินค้าจัดส่งออกจากคลังผ่าน Flash Express';
            carrier = 'Flash Express';
            trackingNumber = `FL-SOLAR-${Math.floor(100000000 + Math.random() * 900000000)}`;
          }
          updatedHistory.push({
            status: checkStatus,
            label: prevLabel,
            date: new Date().toISOString(),
            note: prevNote
          });
        }
      }

      // เรียงลำดับประวัติตามสเต็ป
      updatedHistory.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

      const updatedOrder = {
        ...order,
        status: nextStatus,
        carrier,
        trackingNumber,
        statusHistory: updatedHistory,
      };

      // บันทึกคำสั่งซื้อใหม่ในฐานข้อมูล LocalStorage
      const savedOrders = JSON.parse(localStorage.getItem('solar_orders') || '[]');
      const idx = savedOrders.findIndex((o: any) => o.id === order.id);
      if (idx > -1) {
        savedOrders[idx] = updatedOrder;
        localStorage.setItem('solar_orders', JSON.stringify(savedOrders));
      }

      // เปลี่ยนค่า State เพื่อแสดงผลทันทีและกระตุ้นการทำงานในสเต็ปถัดไป
      setOrder(updatedOrder);
    }, 5000);

    return () => clearTimeout(timer);
  }, [order]);

  const currentStepIdx = order ? steps.findIndex(s => s.status === order.status) : 0;

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
                <div className="text-center text-xs text-slate-400 mb-6 pb-6 border-b border-slate-100">
                  วันที่สั่งซื้อ: {new Date(order.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>

                {/* =========================================
                    Order Tracking Stepper
                ========================================= */}
                <div className="mb-8 bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <span className="text-blue-500 text-lg">🚚</span> ติดตามสถานะการจัดส่ง
                  </h3>
                  <div className="space-y-6 relative">
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= currentStepIdx;
                      const isActive = idx === currentStepIdx;
                      const isLast = idx === steps.length - 1;
                      const history = order.statusHistory?.find(h => h.status === step.status);

                      return (
                        <div key={step.status} className="flex gap-4 relative">
                          {/* Connector line */}
                          {!isLast && (
                            <div className={`absolute left-5 top-10 bottom-[-16px] w-[2px] transition-colors duration-500 ${idx < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                          )}
                          
                          {/* Icon Circle */}
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 border-2 transition-all duration-500 ${
                            isActive 
                              ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 scale-110' 
                              : isCompleted 
                                ? 'bg-emerald-500 border-emerald-500 text-white' 
                                : 'bg-white border-slate-200 text-slate-400'
                          }`}>
                            {step.icon}
                          </div>

                          {/* Step Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className={`text-sm font-bold transition-colors ${isActive ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                              {history && (
                                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                  {new Date(history.date).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mt-0.5 transition-colors leading-relaxed ${isActive ? 'text-slate-600' : isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                              {history ? history.note : step.desc}
                            </p>

                            {/* Info Box inside Shipped Step */}
                            {step.status === 'shipped' && isCompleted && order.carrier && order.trackingNumber && (
                              <div className="mt-2.5 bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs shadow-sm animate-fadeIn">
                                <div>
                                  <p className="text-slate-500 font-medium">บริษัทขนส่ง: <span className="text-slate-800 font-bold">{order.carrier}</span></p>
                                  <p className="text-slate-500 mt-0.5">เลขพัสดุ: <span className="text-slate-900 font-mono font-bold tracking-wider">{order.trackingNumber}</span></p>
                                </div>
                                <button 
                                  onClick={() => {
                                    navigator.clipboard.writeText(order.trackingNumber || '');
                                    alert('📋 คัดลอกรหัสพัสดุเรียบร้อยแล้ว!');
                                  }}
                                  className="bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-800 border border-slate-200 px-2.5 py-1.5 rounded-lg font-bold shadow-sm transition-all"
                                >
                                  คัดลอก
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
