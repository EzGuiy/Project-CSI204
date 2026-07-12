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
  userId?: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shipping: { fullName: string; phone: string; address: string; subDistrict: string; district: string; province: string; postalCode: string; };
  paymentMethod: 'credit_card' | 'qr';
  cardLast4: string | null;
  cardNetwork: string | null;
  status: string;
  carrier?: string | null;
  trackingNumber?: string | null;
  statusHistory?: { status: string; label: string; date: string; note: string }[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  'รอชำระเงิน': { label: 'รอชำระเงิน', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'ตรวจสอบ': { label: 'กำลังตรวจสอบ', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'กำลังจัดส่ง': { label: 'กำลังจัดส่ง', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'จัดส่งสำเร็จ': { label: 'จัดส่งสำเร็จ', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
  'confirmed': { label: 'ยืนยันคำสั่งซื้อ', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  'processing': { label: 'กำลังดำเนินการ', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  'shipped': { label: 'อยู่ระหว่างจัดส่ง', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  'delivered': { label: 'จัดส่งสำเร็จ', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

const steps = [
  { status: 'ตรวจสอบ', fallback: 'confirmed', label: 'รับคำสั่งซื้อ', icon: '📝', desc: 'ระบบได้รับคำสั่งซื้อและกำลังตรวจสอบ' },
  { status: 'กำลังจัดส่ง', fallback: 'shipped', label: 'กำลังจัดส่ง', icon: '🚚', desc: 'สินค้าถูกแพ็คและมอบให้บริษัทขนส่งแล้ว' },
  { status: 'จัดส่งสำเร็จ', fallback: 'delivered', label: 'จัดส่งสำเร็จ', icon: '✅', desc: 'พัสดุจัดส่งถึงมือผู้รับเรียบร้อยแล้ว' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const session = localStorage.getItem('solar_session');
    if (!session) {
      window.location.href = '/login';
      return;
    }
    const currentUser = JSON.parse(session);
    setUser(currentUser);

    const fetchMyOrders = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${currentUser.id}`);
        if (res.ok) {
          const data = await res.json();
          const sorted = data.sort((a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime());
          setOrders(sorted);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    fetchMyOrders();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // 🖨️ ฟังก์ชันสำหรับพิมพ์ใบเสร็จสำหรับหน้านี้
  const handlePrintReceipt = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation(); // ป้องกันไม่ให้แผงรายละเอียดหุบ
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('กรุณาอนุญาตให้เบราว์เซอร์เปิด Pop-up เพื่อพิมพ์ใบเสร็จ');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>ใบสั่งซื้อ/ใบเสร็จรับเงิน - ${order.id}</title>
        <style>
          body { font-family: 'Sarabun', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; line-height: 1.5; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; }
          .header h1 { color: #1e3a8a; margin: 0 0 5px 0; font-size: 32px; }
          .header p { margin: 0; color: #666; }
          .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .info-box { width: 48%; }
          .info-box h3 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-bottom: 10px; color: #1e3a8a; font-size: 16px; }
          .info-box p { margin: 5px 0; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; font-size: 14px; }
          th { background-color: #f8fafc; color: #333; font-weight: bold; }
          td.right, th.right { text-align: right; }
          .summary { width: 50%; float: right; margin-bottom: 50px; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; font-size: 14px; }
          .summary-row.total { font-weight: bold; font-size: 18px; color: #1e3a8a; border-bottom: 2px solid #1e3a8a; border-top: 2px solid #1e3a8a; padding: 12px 0; }
          .footer { clear: both; text-align: center; color: #888; font-size: 12px; border-top: 1px solid #ddd; padding-top: 20px; }
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>SolarTech Energy</h1>
          <p>ใบสั่งซื้อ / ใบเสร็จรับเงิน (Purchase Order / Receipt)</p>
        </div>
        
        <div class="info-section">
          <div class="info-box">
            <h3>ข้อมูลลูกค้า (Customer Info)</h3>
            <p><strong>ชื่อ-นามสกุล:</strong> ${order.shipping.fullName}</p>
            <p><strong>เบอร์โทรศัพท์:</strong> ${order.shipping.phone}</p>
            <p><strong>ที่อยู่จัดส่ง:</strong> ${order.shipping.address}, ต.${order.shipping.subDistrict} อ.${order.shipping.district} จ.${order.shipping.province} ${order.shipping.postalCode}</p>
          </div>
          <div class="info-box">
            <h3>ข้อมูลคำสั่งซื้อ (Order Info)</h3>
            <p><strong>รหัสคำสั่งซื้อ:</strong> ${order.id}</p>
            <p><strong>วันที่สั่งซื้อ:</strong> ${new Date(order.date).toLocaleString('th-TH')}</p>
            <p><strong>วิธีชำระเงิน:</strong> ${order.paymentMethod === 'credit_card' ? 'บัตรเครดิต/เดบิต' : 'โอนผ่านธนาคาร (PromptPay)'}</p>
            <p><strong>สถานะ:</strong> ${order.status}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%;">ลำดับ</th>
              <th style="width: 50%;">รายการสินค้า (Description)</th>
              <th style="width: 15%; text-align: center;">จำนวน (Qty)</th>
              <th class="right" style="width: 15%;">ราคา/หน่วย (Unit Price)</th>
              <th class="right" style="width: 15%;">ยอดรวม (Amount)</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map((item, index) => `
              <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${item.name}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td class="right">฿${item.price.toLocaleString()}</td>
                <td class="right">฿${(item.price * item.quantity).toLocaleString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>มูลค่าสินค้ารวม (Subtotal):</span>
            <span>฿${(order.total - order.shippingFee).toLocaleString()}</span>
          </div>
          <div class="summary-row">
            <span>ค่าจัดส่ง (Shipping Fee):</span>
            <span>${order.shippingFee === 0 ? 'ฟรี' : '฿' + order.shippingFee.toLocaleString()}</span>
          </div>
          <div class="summary-row total">
            <span>ยอดชำระสุทธิ (Grand Total):</span>
            <span>฿${order.total.toLocaleString()}</span>
          </div>
        </div>

        <div class="footer">
          <p>เอกสารฉบับนี้ถูกสร้างขึ้นโดยระบบอัตโนมัติของ SolarTech | ขอบคุณที่ไว้วางใจใช้บริการของเรา</p>
          <p>หากมีข้อสงสัยเกี่ยวกับคำสั่งซื้อ โปรดติดต่อแผนกบริการลูกค้า</p>
        </div>

        <script>
          window.onload = function() { 
            setTimeout(() => {
              window.print(); 
              window.close();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">กำลังโหลดคำสั่งซื้อ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm sticky top-[72px] z-40">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                <span className="flex items-center gap-2">
                    <span>📦 ติดตามคำสั่งซื้อของฉัน</span>
                </span>
              </h1>
              <p className="text-xs text-slate-500 mt-1">คุณลูกค้า: {user?.name}</p>
            </div>
            <Link href="/products" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                <span className="text-lg">←</span> เลือกซื้อสินค้าเพิ่ม
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">คุณยังไม่มีคำสั่งซื้อในระบบ</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
               เริ่มค้นหาสินค้าและอุปกรณ์โซล่าเซลล์ที่เหมาะกับบ้านคุณได้เลย
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20"
            >
              ดูแคตตาล็อกสินค้า
            </Link>
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusInfo = statusConfig[order.status] || statusConfig['ตรวจสอบ'];
              const isExpanded = expandedId === order.id;
              const currentStepIdx = steps.findIndex(s => s.status === order.status || s.fallback === order.status);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                  style={{ animation: `fadeSlideUp 0.4s ease-out ${index * 0.05}s both` }}
                >
                  {/* Order Header (Clickable) */}
                  <button
                    onClick={() => toggleExpand(order.id)}
                    className="w-full px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        {order.paymentMethod === 'credit_card' ? <span className="text-xl">💳</span> : <span className="text-xl">🏦</span>}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm font-mono tracking-wide">{order.id}</p>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {new Date(order.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className="font-bold text-slate-900 text-base">฿{order.total.toLocaleString()}</p>
                        <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color} mt-1.5`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <svg className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </button>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-100 pt-6 animate-accordionOpen">
                      
                      {/* Order Tracking Stepper */}
                      <div className="mb-6 bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                          <span>📍 สถานะการจัดส่ง</span>
                        </h4>
                        
                        <div className="space-y-6 relative">
                          {steps.map((step, idx) => {
                            const isCompleted = idx <= currentStepIdx;
                            const isActive = idx === currentStepIdx;
                            const isLast = idx === steps.length - 1;

                            return (
                              <div key={step.status} className="flex gap-4 relative">
                                {!isLast && <div className={`absolute left-5 top-10 bottom-[-16px] w-[2px] transition-colors duration-500 ${idx < currentStepIdx ? 'bg-emerald-500' : 'bg-slate-200'}`} />}
                                
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 border-2 transition-all duration-500 ${
                                  isActive ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100 scale-110' : isCompleted ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-slate-200 text-slate-400'
                                }`}>
                                  {step.icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                  <p className={`text-sm font-bold transition-colors ${isActive ? 'text-blue-600' : isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>{step.label}</p>
                                  <p className={`text-xs mt-0.5 transition-colors leading-relaxed ${isActive ? 'text-slate-600' : isCompleted ? 'text-slate-500' : 'text-slate-400'}`}>
                                    {step.desc}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* General Order Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-bold">ที่อยู่จัดส่ง</p>
                          <p className="text-sm font-semibold text-slate-800">{order.shipping.fullName}</p>
                          <p className="text-xs text-slate-500 mt-1">เบอร์โทร: {order.shipping.phone}</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {order.shipping.address}, {order.shipping.subDistrict}, {order.shipping.district}, {order.shipping.province} {order.shipping.postalCode}
                          </p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-bold">การชำระเงิน</p>
                          <p className="text-sm font-semibold text-slate-800">
                            {order.paymentMethod === 'credit_card' ? `บัตรเครดิต (*${order.cardLast4})` : 'QR PromptPay'}
                          </p>
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                            <div className="flex justify-between text-xs text-slate-500"><span>ยอดรวมสินค้า</span><span>฿{order.subtotal.toLocaleString()}</span></div>
                            <div className="flex justify-between text-xs text-slate-500"><span>ค่าจัดส่ง</span><span>{order.shippingFee === 0 ? 'ฟรี' : `฿${order.shippingFee.toLocaleString()}`}</span></div>
                            <div className="flex justify-between text-sm font-bold text-slate-800 pt-1.5 border-t border-dashed border-slate-200"><span>ยอดชำระทั้งหมด</span><span className="text-blue-600">฿{order.total.toLocaleString()}</span></div>
                          </div>
                        </div>
                      </div>

                      {/* Items Details */}
                      <div className="mb-4">
                        <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-3 font-bold">รายการสินค้า ({order.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)</p>
                        <div className="space-y-2">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div className="w-11 h-11 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0">
                                <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                                <p className="text-xs text-slate-400">฿{item.price.toLocaleString()} x {item.quantity}</p>
                              </div>
                              <p className="text-sm font-bold text-slate-700 shrink-0">฿{(item.price * item.quantity).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 🖨️ ปุ่มพิมพ์ใบสั่งซื้อตรงนี้ */}
                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button 
                          onClick={(e) => handlePrintReceipt(order, e)}
                          className="bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                          พิมพ์ใบเสร็จ / ใบสั่งซื้อ
                        </button>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes accordionOpen { from { opacity: 0; max-height: 0; } to { opacity: 1; max-height: 1500px; } }
      `}</style>
    </div>
  );
}