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
  shipping: { fullName: string; address: string; subDistrict: string; district: string; province: string; postalCode: string; phone: string; };
  shippingFee: number;
  statusHistory?: { status: string; label: string; date: string; note: string }[];
}

const steps = [
  { status: 'confirmed', label: 'รับคำสั่งซื้อ', icon: '📝', desc: 'ระบบได้รับคำสั่งซื้อและกำลังตรวจสอบ' },
  { status: 'processing', label: 'กำลังดำเนินการ', icon: '⚙️', desc: 'กำลังจัดเตรียมสินค้าเพื่อจัดส่ง' },
  { status: 'shipped', label: 'กำลังจัดส่ง', icon: '🚚', desc: 'สินค้าถูกมอบให้บริษัทขนส่งแล้ว' },
  { status: 'delivered', label: 'จัดส่งสำเร็จ', icon: '✅', desc: 'พัสดุจัดส่งถึงมือผู้รับเรียบร้อยแล้ว' },
];

export default function CheckoutSuccessPage() {
  const [order, setOrder] = useState<OrderData | null>(null);
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const orderId = sessionStorage.getItem('last_order_id');
    if (orderId) {
      const orders = JSON.parse(localStorage.getItem('solar_orders') || '[]');
      const found = orders.find((o: OrderData) => o.id === orderId);
      if (found) setOrder(found);
    }
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  // 🖨️ ฟังก์ชันสำหรับพิมพ์ใบเสร็จ / ใบสั่งซื้อ
  const handlePrintReceipt = () => {
    if (!order) return;
    
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
            <p><strong>สถานะ:</strong> ชำระเงินเรียบร้อย</p>
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
              <h1 className="text-2xl font-bold text-white mb-2">ชำระเงินสำเร็จ!</h1>
              <p className="text-emerald-100 text-sm">ระบบได้รับคำสั่งซื้อของคุณแล้ว ขอขอบคุณที่ไว้วางใจ SolarTech</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="px-8 py-8">
            {order ? (
              <>
                <div className="text-center mb-6 pb-6 border-b border-slate-100">
                  <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">หมายเลขคำสั่งซื้อ</p>
                  <p className="text-lg font-bold text-slate-900 font-mono tracking-wider">{order.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">ยอดชำระสุทธิ</p>
                    <p className="text-lg font-bold text-blue-600">฿{order.total.toLocaleString()}</p>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 text-center border border-slate-100">
                    <p className="text-xs text-slate-400 mb-1">ช่องทางชำระเงิน</p>
                    <p className="text-sm font-bold text-slate-800">
                      {order.paymentMethod === 'credit_card' ? `บัตรเครดิต (*${order.cardLast4})` : 'QR PromptPay'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3 mt-8">
                  {/* 🖨️ เพิ่มปุ่มพิมพ์ใบสั่งซื้อตรงนี้ */}
                  <button
                    onClick={handlePrintReceipt}
                    className="block w-full bg-slate-900 hover:bg-slate-800 text-white text-center font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                    พิมพ์ใบเสร็จ / ใบสั่งซื้อ
                  </button>
                  
                  <Link
                    href="/orders"
                    className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20"
                  >
                    ติดตามสถานะคำสั่งซื้อ
                  </Link>
                  <Link
                    href="/"
                    className="block w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-center font-bold py-3.5 rounded-xl transition-all"
                  >
                    กลับสู่หน้าแรก
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-slate-500">กำลังประมวลผลข้อมูล...</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes confettiFall { 0% { transform: translateY(-10px) rotate(0deg); opacity: 1; } 100% { transform: translateY(100vh) rotate(720deg); opacity: 0; } }
        @keyframes successPop { 0% { transform: scale(0); opacity: 0; } 50% { transform: scale(1.2); } 100% { transform: scale(1); opacity: 1; } }
        @keyframes checkDraw { 0% { stroke-dasharray: 0 100; opacity: 0; } 100% { stroke-dasharray: 100 0; opacity: 1; } }
      `}</style>
    </div>
  );
}