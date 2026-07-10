'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon: string;
}

interface Order {
  id: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shipping: {
    fullName: string;
    phone: string;
    address: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: 'credit_card' | 'qr';
  cardLast4: string | null;
  cardNetwork: string | null;
  status: string;
}

// สถานะคำสั่งซื้อ
const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'ยืนยันแล้ว', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  processing: { label: 'กำลังเตรียมสินค้า', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  shipped: { label: 'จัดส่งแล้ว', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  delivered: { label: 'ได้รับสินค้าแล้ว', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('solar_session');
    if (!session) {
      window.location.href = '/login';
      return;
    }
    const savedOrders = JSON.parse(localStorage.getItem('solar_orders') || '[]');
    setOrders(savedOrders);
    setIsLoaded(true);
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <span className="text-3xl">📋</span> ประวัติคำสั่งซื้อ
              </h1>
              <p className="text-sm text-slate-500 mt-1">รายการคำสั่งซื้อทั้งหมดของคุณ</p>
            </div>
            <Link href="/products" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
              เลือกซื้อสินค้า <span className="text-lg">›</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">ยังไม่มีคำสั่งซื้อ</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">คุณยังไม่เคยสั่งซื้อสินค้ากับ SolarTech กลับไปเลือกชมสินค้าและอุปกรณ์โซล่าเซลล์ได้เลย</p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20"
            >
              🛒 ไปที่รายการสินค้า
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusInfo = statusConfig[order.status] || statusConfig.confirmed;
              const isExpanded = expandedId === order.id;

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300"
                  style={{ animation: `fadeSlideUp 0.4s ease-out ${index * 0.08}s both` }}
                >
                  {/* Order Header (Clickable) */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      {/* Order Icon */}
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        {order.paymentMethod === 'credit_card' ? (
                          <span className="text-xl">💳</span>
                        ) : (
                          <span className="text-xl">🏦</span>
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-slate-900 text-sm font-mono">{order.id}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(order.date).toLocaleDateString('th-TH', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-slate-900">฿{order.total.toLocaleString()}</p>
                        <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color} mt-1`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </button>

                  {/* Mobile price (visible on small screens only) */}
                  <div className="sm:hidden px-6 pb-3 -mt-2 flex items-center justify-between">
                    <p className="font-bold text-slate-900">฿{order.total.toLocaleString()}</p>
                    <span className={`inline-block text-xs font-medium px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-100 pt-5" style={{ animation: 'accordionOpen 0.3s ease-out' }}>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                        {/* Shipping Info */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">📦 ข้อมูลจัดส่ง</p>
                          <p className="text-sm font-medium text-slate-800">{order.shipping.fullName}</p>
                          <p className="text-xs text-slate-500 mt-1">{order.shipping.phone}</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {order.shipping.address}, {order.shipping.subDistrict}, {order.shipping.district}, {order.shipping.province} {order.shipping.postalCode}
                          </p>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-xs text-slate-400 uppercase tracking-wider mb-2 font-medium">💰 การชำระเงิน</p>
                          {order.paymentMethod === 'credit_card' ? (
                            <>
                              <p className="text-sm font-medium text-slate-800">
                                {order.cardNetwork === 'visa' ? 'Visa' : order.cardNetwork === 'mastercard' ? 'Mastercard' : order.cardNetwork === 'jcb' ? 'JCB' : 'บัตรเครดิต'} •••• {order.cardLast4}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">บัตรเครดิต / เดบิต</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-medium text-slate-800">QR PromptPay</p>
                              <p className="text-xs text-slate-500 mt-1">โอนผ่านธนาคาร</p>
                            </>
                          )}
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>ยอดรวมสินค้า</span>
                              <span>฿{order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>ค่าจัดส่ง</span>
                              <span>{order.shippingFee === 0 ? 'ฟรี' : `฿${order.shippingFee.toLocaleString()}`}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-slate-800 pt-1">
                              <span>ยอดชำระทั้งหมด</span>
                              <span className="text-blue-600">฿{order.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <p className="text-xs text-slate-400 uppercase tracking-wider mb-3 font-medium">🛒 รายการสินค้า ({order.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)</p>
                        <div className="space-y-2">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div className="w-11 h-11 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0">
                                <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                                <p className="text-xs text-slate-400">฿{item.price.toLocaleString()} × {item.quantity}</p>
                              </div>
                              <p className="text-sm font-bold text-slate-700 shrink-0">
                                ฿{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes accordionOpen {
          from {
            opacity: 0;
            max-height: 0;
          }
          to {
            opacity: 1;
            max-height: 1000px;
          }
        }
      `}</style>
    </div>
  );
}
