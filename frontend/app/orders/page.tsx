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
  carrier?: string | null;
  trackingNumber?: string | null;
  statusHistory?: { status: string; label: string; date: string; note: string }[];
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  confirmed: { label: 'ยืนยันสั่งซื้อแล้ว', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200' },
  processing: { label: 'กำลังเตรียมสินค้า', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200' },
  shipped: { label: 'จัดส่งแล้ว', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
  delivered: { label: 'จัดส่งสำเร็จ', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200' },
};

const steps = [
  { status: 'confirmed', label: 'ยืนยันสั่งซื้อ', icon: '📝', desc: 'ชำระเงินสำเร็จ ระบบยืนยันคำสั่งซื้อ' },
  { status: 'processing', label: 'กำลังเตรียมสินค้า', icon: '📦', desc: 'คลังสินค้ากำลังแพ็คและจัดเตรียมสินค้า' },
  { status: 'shipped', label: 'จัดส่งแล้ว', icon: '🚚', desc: 'มอบพัสดุให้บริษัทจัดส่งสำเร็จ' },
  { status: 'delivered', label: 'จัดส่งสำเร็จ', icon: '🏠', desc: 'สินค้าจัดส่งถึงที่หมายเรียบร้อยแล้ว' },
];

export default function OrdersPage() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [user, setUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // States for Admin edit fields
  const [editStatus, setEditStatus] = useState<Record<string, string>>({});
  const [editCarrier, setEditCarrier] = useState<Record<string, string>>({});
  const [editTracking, setEditTracking] = useState<Record<string, string>>({});

  // 1. ดึงข้อมูลสั่งซื้อและโหลดเซสชันเริ่มต้น
  useEffect(() => {
    const session = localStorage.getItem('solar_session');
    if (!session) {
      window.location.href = '/login';
      return;
    }
    const currentUser = JSON.parse(session);
    setUser(currentUser);

    const savedOrders = JSON.parse(localStorage.getItem('solar_orders') || '[]');
    setAllOrders(savedOrders);

    // กรองคำสั่งซื้อตามสิทธิ์ (Role)
    if (currentUser.role === 'admin' || currentUser.role === 'employee') {
      setOrders(savedOrders);
    } else {
      // ลูกค้าทั่วไป: เห็นออเดอร์ตัวเอง หรือออเดอร์ที่ไม่มี userId เพื่อรองรับข้อมูลเก่า
      const filtered = savedOrders.filter((o: Order) => o.userId === currentUser.id || !o.userId);
      setOrders(filtered);
    }
    setIsLoaded(true);
  }, []);

  const isAdmin = user?.role === 'admin' || user?.role === 'employee';

  // 2. จำลองการเปลี่ยนสถานะโดยอัตโนมัติ (Automated State Simulation) ในหน้ารายการสั่งซื้อ (สำหรับลูกค้า)
  useEffect(() => {
    if (isAdmin || !user || orders.length === 0) return;
    
    // ค้นหาคำสั่งซื้อล่าสุดที่ยังจัดส่งไม่สำเร็จ
    const incompleteOrder = orders.find(o => o.status !== 'delivered');
    if (!incompleteOrder) return;

    const timer = setTimeout(() => {
      const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
      const currentIdx = statusOrder.indexOf(incompleteOrder.status);
      if (currentIdx === -1 || currentIdx === statusOrder.length - 1) return;

      const nextStatus = statusOrder[currentIdx + 1];
      const updatedHistory = [...(incompleteOrder.statusHistory || [])];
      
      let label = '';
      let note = '';
      let carrier = incompleteOrder.carrier;
      let trackingNumber = incompleteOrder.trackingNumber;

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

      // สร้างบันทึกความคืบหน้าสเต็ปใหม่ด้วยเวลาปัจจุบัน (new Date().toISOString())
      const historyItem = {
        status: nextStatus,
        label,
        date: new Date().toISOString(),
        note,
      };

      const existingIdx = updatedHistory.findIndex(h => h.status === nextStatus);
      if (existingIdx > -1) {
        updatedHistory[existingIdx] = historyItem;
      } else {
        updatedHistory.push(historyItem);
      }

      // เติมเต็มสเต็ปที่ขาดหายไปในประวัติ
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

      updatedHistory.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

      const updatedOrder = {
        ...incompleteOrder,
        status: nextStatus,
        carrier,
        trackingNumber,
        statusHistory: updatedHistory,
      };

      // บันทึกคำสั่งซื้ออัปเดตลง LocalStorage
      const savedOrders = JSON.parse(localStorage.getItem('solar_orders') || '[]');
      const idx = savedOrders.findIndex((o: any) => o.id === incompleteOrder.id);
      if (idx > -1) {
        savedOrders[idx] = updatedOrder;
        localStorage.setItem('solar_orders', JSON.stringify(savedOrders));
        
        // อัปเดต state เพื่อรีเรนเดอร์ UI
        setAllOrders(savedOrders);
        const filtered = savedOrders.filter((o: Order) => o.userId === user.id || !o.userId);
        setOrders(filtered);
      }
    }, 5000);

    return () => clearTimeout(timer);
  }, [orders, isAdmin, user]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleUpdateStatus = (orderId: string, nextStatus: string, carrier: string, trackingNumber: string) => {
    const savedOrders = JSON.parse(localStorage.getItem('solar_orders') || '[]');
    const idx = savedOrders.findIndex((o: any) => o.id === orderId);
    
    if (idx > -1) {
      const order = savedOrders[idx];
      const updatedHistory = [...(order.statusHistory || [])];
      
      let label = '';
      let note = '';
      if (nextStatus === 'confirmed') {
        label = 'ยืนยันสั่งซื้อแล้ว';
        note = 'ชำระเงินสำเร็จ ระบบกำลังจัดเตรียมสินค้าสำหรับจัดส่ง';
      } else if (nextStatus === 'processing') {
        label = 'กำลังเตรียมสินค้า';
        note = 'คลังสินค้ากำลังจัดแยกและแพ็คบรรจุกล่องพัสดุ';
      } else if (nextStatus === 'shipped') {
        label = 'จัดส่งแล้ว';
        note = `สินค้าจัดส่งออกจากคลังผ่าน ${carrier || 'Flash Express'}`;
      } else if (nextStatus === 'delivered') {
        label = 'จัดส่งสำเร็จ';
        note = 'สินค้าส่งถึงจุดหมายปลายทางและลงชื่อรับเรียบร้อยแล้ว';
      }

      // เพิ่มลงในประวัติ
      const existingHistoryIdx = updatedHistory.findIndex(h => h.status === nextStatus);
      const historyItem = {
        status: nextStatus,
        label,
        date: new Date().toISOString(),
        note,
      };

      if (existingHistoryIdx > -1) {
        updatedHistory[existingHistoryIdx] = historyItem;
      } else {
        updatedHistory.push(historyItem);
      }

      // เติมขั้นตอนในอดีตหากขาดหายไป
      const statusOrder = ['confirmed', 'processing', 'shipped', 'delivered'];
      const targetIdx = statusOrder.indexOf(nextStatus);
      for (let i = 0; i <= targetIdx; i++) {
        const checkStatus = statusOrder[i];
        if (!updatedHistory.some(h => h.status === checkStatus)) {
          let prevLabel = '';
          let prevNote = '';
          if (checkStatus === 'processing') {
            prevLabel = 'กำลังเตรียมสินค้า';
            prevNote = 'คลังสินค้ากำลังจัดแยกและแพ็คบรรจุกล่องพัสดุ';
          } else if (checkStatus === 'shipped') {
            prevLabel = 'จัดส่งแล้ว';
            prevNote = `สินค้าจัดส่งออกจากคลังผ่าน ${carrier || 'Flash Express'}`;
          }
          updatedHistory.push({
            status: checkStatus,
            label: prevLabel,
            date: new Date(new Date(order.date).getTime() + i * 60000).toISOString(),
            note: prevNote
          });
        }
      }

      updatedHistory.sort((a, b) => statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status));

      const updatedOrder = {
        ...order,
        status: nextStatus,
        carrier: ['shipped', 'delivered'].includes(nextStatus) ? carrier : null,
        trackingNumber: ['shipped', 'delivered'].includes(nextStatus) ? trackingNumber : null,
        statusHistory: updatedHistory,
      };

      savedOrders[idx] = updatedOrder;
      localStorage.setItem('solar_orders', JSON.stringify(savedOrders));
      
      // อัปเดต state
      setAllOrders(savedOrders);
      if (user?.role === 'admin' || user?.role === 'employee') {
        setOrders(savedOrders);
      } else {
        const filtered = savedOrders.filter((o: Order) => o.userId === user?.id || !o.userId);
        setOrders(filtered);
      }
      
      alert(`✅ อัปเดตสถานะออเดอร์ ${orderId} เรียบร้อยแล้ว!`);
    }
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">กำลังโหลดข้อมูลคำสั่งซื้อ...</p>
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
                {isAdmin ? (
                  <span className="flex items-center gap-2">
                    🛠️ <span className="text-blue-700">แผงจัดการคำสั่งซื้อ</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    📋 <span>ประวัติคำสั่งซื้อ</span>
                  </span>
                )}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                {isAdmin 
                  ? `ระบบควบคุมสำหรับ: ${user?.name} (สิทธิ์: ${user?.role.toUpperCase()})` 
                  : 'รายการสั่งซื้อโซล่าเซลล์และอุปกรณ์ของคุณทั้งหมด'}
              </p>
            </div>
            {!isAdmin && (
              <Link href="/products" className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1">
                เลือกซื้อสินค้าเพิ่มเติม <span className="text-lg">›</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        
        {/* KPI Dashboard for Admin */}
        {isAdmin && orders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">จำนวนออเดอร์ทั้งหมด</p>
              <p className="text-2xl font-extrabold text-slate-800">{orders.length} รายการ</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">รอดำเนินการส่งมอบ</p>
              <p className="text-2xl font-extrabold text-amber-600">
                {orders.filter(o => ['confirmed', 'processing'].includes(o.status)).length} รายการ
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <p className="text-[11px] text-slate-400 uppercase font-bold tracking-wider mb-1">ยอดขายรวมของระบบ</p>
              <p className="text-2xl font-extrabold text-emerald-600">
                ฿{orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-16 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {isAdmin ? 'ยังไม่มีคำสั่งซื้อเข้ามาในระบบ' : 'ยังไม่มีประวัติคำสั่งซื้อ'}
            </h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">
              {isAdmin 
                ? 'ระบบกำลังรอการชำระเงินและสั่งซื้อสินค้าจากลูกค้า' 
                : 'คุณยังไม่เคยสั่งซื้อสินค้ากลับไปเลือกชมอุปกรณ์โซล่าเซลล์ได้เลย'}
            </p>
            {!isAdmin && (
              <Link
                href="/products"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20"
              >
                🛒 ไปที่หน้าสินค้า
              </Link>
            )}
          </div>
        ) : (
          /* Orders List */
          <div className="space-y-4">
            {orders.map((order, index) => {
              const statusInfo = statusConfig[order.status] || statusConfig.confirmed;
              const isExpanded = expandedId === order.id;

              // Initial form values per order
              const currentStatus = editStatus[order.id] ?? order.status;
              const currentCarrier = editCarrier[order.id] ?? (order.carrier || 'Flash Express');
              const currentTracking = editTracking[order.id] ?? (order.trackingNumber || '');

              const currentStepIdx = steps.findIndex(s => s.status === order.status);

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
                      {/* Order Icon */}
                      <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center shrink-0">
                        {order.paymentMethod === 'credit_card' ? (
                          <span className="text-xl">💳</span>
                        ) : (
                          <span className="text-xl">🏦</span>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-slate-900 text-sm font-mono tracking-wide">{order.id}</p>
                          {isAdmin && (
                            <span className="bg-slate-100 text-slate-600 text-[10px] px-2 py-0.5 rounded font-bold">
                              ผู้สั่ง: {order.shipping.fullName}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          {new Date(order.date).toLocaleDateString('th-TH', {
                            year: 'numeric', month: 'short', day: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
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
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                      </svg>
                    </div>
                  </button>

                  {/* Mobile price */}
                  <div className="sm:hidden px-6 pb-4 -mt-2 flex items-center justify-between">
                    <p className="font-bold text-slate-900">฿{order.total.toLocaleString()}</p>
                    <span className={`inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </div>

                  {/* Expandable Content */}
                  {isExpanded && (
                    <div className="px-6 pb-6 border-t border-slate-100 pt-6 animate-accordionOpen">
                      
                      {/* =========================================
                          Admin / Employee Status Control Panel
                      ========================================= */}
                      {isAdmin && (
                        <div className="mb-6 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-inner">
                          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                            <span>🛠️</span> จัดการสถานะจัดส่ง (สิทธิ์แอดมิน/พนักงาน)
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">ปรับเปลี่ยนสถานะ</label>
                              <select
                                value={currentStatus}
                                onChange={(e) => setEditStatus(prev => ({ ...prev, [order.id]: e.target.value }))}
                                className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                              >
                                <option value="confirmed">ยืนยันการชำระเงิน</option>
                                <option value="processing">กำลังเตรียมสินค้า</option>
                                <option value="shipped">จัดส่งสินค้าแล้ว</option>
                                <option value="delivered">จัดส่งสำเร็จ</option>
                              </select>
                            </div>

                            {/* Dropdowns for Courier and Tracking */}
                            {['shipped', 'delivered'].includes(currentStatus) && (
                              <>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">ค่ายจัดส่ง</label>
                                  <select
                                    value={currentCarrier}
                                    onChange={(e) => setEditCarrier(prev => ({ ...prev, [order.id]: e.target.value }))}
                                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
                                  >
                                    <option value="Flash Express">Flash Express</option>
                                    <option value="Kerry Express">Kerry Express</option>
                                    <option value="Thailand Post">Thailand Post</option>
                                    <option value="DHL">DHL</option>
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[11px] font-bold text-slate-500 mb-1.5">เลขพัสดุ (Tracking ID)</label>
                                  <input
                                    type="text"
                                    placeholder="กรอกเลขพัสดุ"
                                    value={currentTracking}
                                    onChange={(e) => setEditTracking(prev => ({ ...prev, [order.id]: e.target.value }))}
                                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all font-mono tracking-wider shadow-sm"
                                  />
                                </div>
                              </>
                            )}
                          </div>

                          <button
                            onClick={() => handleUpdateStatus(order.id, currentStatus, currentCarrier, currentTracking)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition-all shadow-md shadow-blue-600/10 active:scale-95"
                          >
                            💾 บันทึกและปรับปรุงข้อมูล
                          </button>
                        </div>
                      )}

                      {/* =========================================
                          Order Tracking Stepper for Customers
                      ========================================= */}
                      <div className="mb-6 bg-slate-50/50 rounded-2xl p-5 border border-slate-100">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5 flex items-center gap-1.5">
                          <span>🚚</span> ประวัติการจัดส่งและติดตาม
                        </h4>
                        
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
                                    <div className="mt-2.5 bg-white p-3 rounded-xl border border-slate-100 flex items-center justify-between text-xs shadow-sm max-w-sm animate-fadeIn">
                                      <div>
                                        <p className="text-slate-500 font-medium">บริษัทขนส่ง: <span className="text-slate-800 font-bold">{order.carrier}</span></p>
                                        <p className="text-slate-500 mt-0.5">เลขพัสดุ: <span className="text-slate-900 font-mono font-bold tracking-wider">{order.trackingNumber}</span></p>
                                      </div>
                                      <button 
                                        onClick={(e) => {
                                          e.stopPropagation();
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

                      {/* General Order Details Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        {/* Shipping Info */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-bold">📦 ข้อมูลที่อยู่จัดส่ง</p>
                          <p className="text-sm font-semibold text-slate-800">{order.shipping.fullName}</p>
                          <p className="text-xs text-slate-500 mt-1">โทร: {order.shipping.phone}</p>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {order.shipping.address}, {order.shipping.subDistrict}, {order.shipping.district}, {order.shipping.province} {order.shipping.postalCode}
                          </p>
                        </div>

                        {/* Payment Info */}
                        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                          <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-2 font-bold">💰 สรุปการชำระเงิน</p>
                          {order.paymentMethod === 'credit_card' ? (
                            <>
                              <p className="text-sm font-semibold text-slate-800">
                                {order.cardNetwork === 'visa' ? 'Visa' : order.cardNetwork === 'mastercard' ? 'Mastercard' : order.cardNetwork === 'jcb' ? 'JCB' : 'บัตรเครดิต'} •••• {order.cardLast4}
                              </p>
                              <p className="text-xs text-slate-500 mt-1">บัตรเครดิต / เดบิต</p>
                            </>
                          ) : (
                            <>
                              <p className="text-sm font-semibold text-slate-800">QR PromptPay</p>
                              <p className="text-xs text-slate-500 mt-1">สแกนชำระผ่านธนาคารสำเร็จ</p>
                            </>
                          )}
                          
                          <div className="mt-3 pt-3 border-t border-slate-200 space-y-1">
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>ยอดสินค้า</span>
                              <span>฿{order.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                              <span>ค่าจัดส่ง</span>
                              <span>{order.shippingFee === 0 ? 'ฟรี' : `฿${order.shippingFee.toLocaleString()}`}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-slate-800 pt-1.5 border-t border-dashed border-slate-200">
                              <span>ยอดชำระสุทธิ</span>
                              <span className="text-blue-600">฿{order.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Items Details */}
                      <div>
                        <p className="text-[11px] text-slate-400 uppercase tracking-wider mb-3 font-bold">🛒 รายการสินค้า ({order.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น)</p>
                        <div className="space-y-2">
                          {order.items.map(item => (
                            <div key={item.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                              <div className="w-11 h-11 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0">
                                <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-855 truncate">{item.name}</p>
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
            max-height: 1500px;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
