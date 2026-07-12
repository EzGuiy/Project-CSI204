'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ==============================
// Types
// ==============================
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  icon: string;
}

interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  subDistrict: string;
  district: string;
  province: string;
  postalCode: string;
}

interface CardInfo {
  number: string;
  name: string;
  expiry: string;
  cvv: string;
}

// ==============================
// Helpers
// ==============================

// ตรวจจับเครือข่ายบัตร
function detectCardNetwork(num: string): 'visa' | 'mastercard' | 'jcb' | 'unknown' {
  const clean = num.replace(/\s/g, '');
  if (/^4/.test(clean)) return 'visa';
  if (/^5[1-5]/.test(clean) || /^2[2-7]/.test(clean)) return 'mastercard';
  if (/^35(2[89]|[3-8])/.test(clean)) return 'jcb';
  return 'unknown';
}

// Format เลขบัตรเป็น XXXX XXXX XXXX XXXX
function formatCardNumber(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 16);
  return clean.replace(/(.{4})/g, '$1 ').trim();
}

// Format วันหมดอายุเป็น MM/YY
function formatExpiry(value: string): string {
  const clean = value.replace(/\D/g, '').slice(0, 4);
  if (clean.length >= 3) return clean.slice(0, 2) + '/' + clean.slice(2);
  return clean;
}

// Validate เลขบัตร (Luhn Algorithm)
function isValidCardNumber(num: string): boolean {
  const clean = num.replace(/\s/g, '');
  if (clean.length !== 16 || !/^\d+$/.test(clean)) return false;
  let sum = 0;
  let isEven = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean[i], 10);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  return sum % 10 === 0;
}

// Validate วันหมดอายุ
function isValidExpiry(exp: string): boolean {
  if (!/^\d{2}\/\d{2}$/.test(exp)) return false;
  const [mm, yy] = exp.split('/').map(Number);
  if (mm < 1 || mm > 12) return false;
  const now = new Date();
  const expDate = new Date(2000 + yy, mm);
  return expDate > now;
}

// Card network logos (SVG inline)
const CardNetworkLogo = ({ network }: { network: string }) => {
  if (network === 'visa') {
    return (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#1A1F71"/>
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial">VISA</text>
      </svg>
    );
  }
  if (network === 'mastercard') {
    return (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#252525"/>
        <circle cx="18" cy="16" r="9" fill="#EB001B" opacity="0.9"/>
        <circle cx="30" cy="16" r="9" fill="#F79E1B" opacity="0.9"/>
      </svg>
    );
  }
  if (network === 'jcb') {
    return (
      <svg viewBox="0 0 48 32" className="w-12 h-8">
        <rect width="48" height="32" rx="4" fill="#0E4C96"/>
        <text x="24" y="20" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold" fontFamily="Arial">JCB</text>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 32" className="w-12 h-8">
      <rect width="48" height="32" rx="4" fill="#CBD5E1" />
      <text x="24" y="20" textAnchor="middle" fill="#94A3B8" fontSize="8" fontFamily="Arial">CARD</text>
    </svg>
  );
};

// ==============================
// Component
// ==============================

export default function CheckoutPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'credit_card' | 'qr'>('credit_card');
  const [isCardFlipped, setIsCardFlipped] = useState(false);
  const [userId, setUserId] = useState<string>('');

  // Shipping form
  const [shipping, setShipping] = useState<ShippingInfo>({
    fullName: '', phone: '', address: '',
    subDistrict: '', district: '', province: '', postalCode: '',
  });

  // Card form
  const [card, setCard] = useState<CardInfo>({
    number: '', name: '', expiry: '', cvv: '',
  });

  // Errors
  const [shippingErrors, setShippingErrors] = useState<Partial<Record<keyof ShippingInfo, string>>>({});
  const [cardErrors, setCardErrors] = useState<Partial<Record<keyof CardInfo, string>>>({});

  // ดึงข้อมูลตะกร้าและ session
  useEffect(() => {
    const session = localStorage.getItem('solar_session');
    if (!session) {
      alert('❌ กรุณาล็อกอินก่อนทำการชำระเงิน');
      router.push('/login');
      return;
    }
    const savedCart = JSON.parse(localStorage.getItem('solar_cart') || '[]');
    if (savedCart.length === 0) {
      alert('❌ ไม่มีสินค้าในตะกร้า');
      router.push('/cart');
      return;
    }
    setCartItems(savedCart);

    // Pre-fill ชื่อจาก session
    const user = JSON.parse(session);
    setShipping(prev => ({ ...prev, fullName: user.name || '' }));
    setUserId(user.id || '');
    setIsLoaded(true);
  }, [router]);

  // คำนวณยอดเงิน
const subtotal = useMemo(() => cartItems.reduce((s, i) => s + i.price * i.quantity, 0), [cartItems]);

// 🌟 ต้องเป็นตัวเลข ไม่มีเครื่องหมายคำพูด
const shippingFee = 0; // หรือถ้าอยากให้มีค่าจัดส่งก็ใส่เป็นตัวเลข เช่น 500
// หรือถ้าเป็นแบบมีเงื่อนไขก็ต้องเป็นตัวเลขเช่นกัน:
// const shippingFee = subtotal === 0 ? 0 : 500;

const total = subtotal + shippingFee;
  // Card network
  const cardNetwork = useMemo(() => detectCardNetwork(card.number), [card.number]);

  // =====================
  // Validate Step 1
  // =====================
  const validateShipping = (): boolean => {
    const errors: Partial<Record<keyof ShippingInfo, string>> = {};
    if (!shipping.fullName.trim()) errors.fullName = 'กรุณากรอกชื่อ-นามสกุล';
    if (!shipping.phone.trim()) errors.phone = 'กรุณากรอกเบอร์โทร';
    else if (!/^0\d{8,9}$/.test(shipping.phone.replace(/-/g, ''))) errors.phone = 'รูปแบบเบอร์โทรไม่ถูกต้อง';
    if (!shipping.address.trim()) errors.address = 'กรุณากรอกที่อยู่';
    if (!shipping.subDistrict.trim()) errors.subDistrict = 'กรุณากรอกตำบล/แขวง';
    if (!shipping.district.trim()) errors.district = 'กรุณากรอกอำเภอ/เขต';
    if (!shipping.province.trim()) errors.province = 'กรุณากรอกจังหวัด';
    if (!shipping.postalCode.trim()) errors.postalCode = 'กรุณากรอกรหัสไปรษณีย์';
    else if (!/^\d{5}$/.test(shipping.postalCode)) errors.postalCode = 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // =====================
  // Validate Step 2 (Card)
  // =====================
  const validateCard = (): boolean => {
    if (paymentMethod === 'qr') return true;
    const errors: Partial<Record<keyof CardInfo, string>> = {};
    const cleanNum = card.number.replace(/\s/g, '');
    if (!cleanNum) errors.number = 'กรุณากรอกหมายเลขบัตร';
    else if (!isValidCardNumber(cleanNum)) errors.number = 'หมายเลขบัตรไม่ถูกต้อง';
    if (!card.name.trim()) errors.name = 'กรุณากรอกชื่อบนบัตร';
    if (!card.expiry) errors.expiry = 'กรุณากรอกวันหมดอายุ';
    else if (!isValidExpiry(card.expiry)) errors.expiry = 'วันหมดอายุไม่ถูกต้องหรือบัตรหมดอายุแล้ว';
    if (!card.cvv) errors.cvv = 'กรุณากรอก CVV';
    else if (!/^\d{3}$/.test(card.cvv)) errors.cvv = 'CVV ต้องเป็นตัวเลข 3 หลัก';
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // =====================
  // Submit — สร้าง Order
  // =====================
  const handleConfirmOrder = async () => {
    setIsProcessing(true);

    try {
      const orderPayload = {
        userId: userId,
        date: new Date().toISOString(),
        items: cartItems,
        subtotal,
        shippingFee,
        total,
        shipping,
        paymentMethod,
        cardLast4: paymentMethod === 'credit_card' ? card.number.replace(/\s/g, '').slice(-4) : null,
        cardNetwork: paymentMethod === 'credit_card' ? cardNetwork : null,
        statusHistory: [
          {
            status: paymentMethod === 'qr' ? 'รอชำระเงิน' : 'ตรวจสอบ',
            label: paymentMethod === 'qr' ? 'รอชำระเงิน' : 'ยืนยันคำสั่งซื้อ',
            date: new Date().toISOString(),
            note: 'ระบบได้รับคำสั่งซื้อของคุณแล้ว'
          }
        ]
      };

      // 1. ส่งข้อมูลไปบันทึกที่ API เพื่อให้ข้อมูลไปอยู่ใน db.json (พนักงานจะได้เห็น)
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) throw new Error('ไม่สามารถสร้างคำสั่งซื้อได้');

      const data = await response.json();
      const savedOrder = data.order; 

      // 2. บันทึกลง LocalStorage ด้วย (เพื่อให้หน้า Success และ Tracking ของลูกค้ายังทำงานได้ตามเดิมก่อน)
      const existingOrders = JSON.parse(localStorage.getItem('solar_orders') || '[]');
      existingOrders.unshift(savedOrder);
      localStorage.setItem('solar_orders', JSON.stringify(existingOrders));

      // 3. ล้างตะกร้า
      localStorage.removeItem('solar_cart');
      window.dispatchEvent(new Event('cartUpdated'));

      // 4. เก็บ orderId ใน sessionStorage สำหรับดึงไปโชว์ในหน้า success
      sessionStorage.setItem('last_order_id', savedOrder.id);

      setIsProcessing(false);
      router.push('/checkout/success');
    } catch (error) {
      console.error('Error confirming order:', error);
      alert('เกิดข้อผิดพลาดในการสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
      setIsProcessing(false);
    }
  };

  // =====================
  // Navigation
  // =====================
  const goNext = () => {
    if (step === 1 && validateShipping()) setStep(2);
    else if (step === 2 && validateCard()) setStep(3);
  };

  const goBack = () => {
    if (step > 1) setStep(step - 1);
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
        <div className="max-w-5xl mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <Link href="/cart" className="text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-2 text-sm font-medium">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
              กลับไปตะกร้า
            </Link>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">ชำระเงิน</h1>
            <div className="w-24"></div>
          </div>
        </div>
      </div>

      {/* Stepper */}
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center justify-center gap-0">
          {[
            { num: 1, label: 'ข้อมูลจัดส่ง' },
            { num: 2, label: 'ชำระเงิน' },
            { num: 3, label: 'ยืนยันคำสั่งซื้อ' },
          ].map((s, i) => (
            <div key={s.num} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  step >= s.num
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-200 text-slate-400'
                }`}>
                  {step > s.num ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                  ) : s.num}
                </div>
                <span className={`mt-2 text-xs font-medium ${step >= s.num ? 'text-blue-600' : 'text-slate-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < 2 && (
                <div className={`w-20 sm:w-32 h-0.5 mx-2 mb-5 transition-colors duration-300 ${
                  step > s.num ? 'bg-blue-600' : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 pb-16">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Left Side — Forms */}
          <div className="lg:w-3/5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">

              {/* ============================
                  STEP 1: ข้อมูลจัดส่ง
              ============================ */}
              {step === 1 && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">📦</span> ข้อมูลการจัดส่ง
                  </h2>
                  <p className="text-sm text-slate-500 mb-8">กรุณากรอกข้อมูลที่อยู่สำหรับจัดส่งสินค้า</p>

                  <div className="space-y-5">
                    {/* ชื่อ + เบอร์โทร */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อ-นามสกุลผู้รับ *</label>
                        <input
                          type="text"
                          value={shipping.fullName}
                          onChange={e => setShipping({ ...shipping, fullName: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${shippingErrors.fullName ? 'border-red-400 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm`}
                          placeholder="สมชาย พลังงานดี"
                        />
                        {shippingErrors.fullName && <p className="text-red-500 text-xs mt-1">{shippingErrors.fullName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">เบอร์โทรศัพท์ *</label>
                        <input
                          type="tel"
                          value={shipping.phone}
                          onChange={e => setShipping({ ...shipping, phone: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${shippingErrors.phone ? 'border-red-400 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm`}
                          placeholder="0812345678"
                        />
                        {shippingErrors.phone && <p className="text-red-500 text-xs mt-1">{shippingErrors.phone}</p>}
                      </div>
                    </div>

                    {/* ที่อยู่ */}
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">ที่อยู่ (บ้านเลขที่ ซอย ถนน) *</label>
                      <input
                        type="text"
                        value={shipping.address}
                        onChange={e => setShipping({ ...shipping, address: e.target.value })}
                        className={`w-full px-4 py-3 rounded-lg border ${shippingErrors.address ? 'border-red-400 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm`}
                        placeholder="123/45 ซอยสุขุมวิท 71 ถนนสุขุมวิท"
                      />
                      {shippingErrors.address && <p className="text-red-500 text-xs mt-1">{shippingErrors.address}</p>}
                    </div>

                    {/* ตำบล + อำเภอ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">ตำบล/แขวง *</label>
                        <input
                          type="text"
                          value={shipping.subDistrict}
                          onChange={e => setShipping({ ...shipping, subDistrict: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${shippingErrors.subDistrict ? 'border-red-400 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm`}
                          placeholder="พระโขนงเหนือ"
                        />
                        {shippingErrors.subDistrict && <p className="text-red-500 text-xs mt-1">{shippingErrors.subDistrict}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">อำเภอ/เขต *</label>
                        <input
                          type="text"
                          value={shipping.district}
                          onChange={e => setShipping({ ...shipping, district: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${shippingErrors.district ? 'border-red-400 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm`}
                          placeholder="วัฒนา"
                        />
                        {shippingErrors.district && <p className="text-red-500 text-xs mt-1">{shippingErrors.district}</p>}
                      </div>
                    </div>

                    {/* จังหวัด + รหัสไปรษณีย์ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">จังหวัด *</label>
                        <input
                          type="text"
                          value={shipping.province}
                          onChange={e => setShipping({ ...shipping, province: e.target.value })}
                          className={`w-full px-4 py-3 rounded-lg border ${shippingErrors.province ? 'border-red-400 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm`}
                          placeholder="กรุงเทพมหานคร"
                        />
                        {shippingErrors.province && <p className="text-red-500 text-xs mt-1">{shippingErrors.province}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">รหัสไปรษณีย์ *</label>
                        <input
                          type="text"
                          value={shipping.postalCode}
                          onChange={e => setShipping({ ...shipping, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                          className={`w-full px-4 py-3 rounded-lg border ${shippingErrors.postalCode ? 'border-red-400 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm`}
                          placeholder="10110"
                        />
                        {shippingErrors.postalCode && <p className="text-red-500 text-xs mt-1">{shippingErrors.postalCode}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Next Button */}
                  <button
                    onClick={goNext}
                    className="mt-8 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                  >
                    ถัดไป — เลือกวิธีชำระเงิน
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                  </button>
                </div>
              )}

              {/* ============================
                  STEP 2: ชำระเงิน
              ============================ */}
              {step === 2 && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">💳</span> วิธีชำระเงิน
                  </h2>
                  <p className="text-sm text-slate-500 mb-8">เลือกวิธีชำระเงินที่สะดวกสำหรับคุณ</p>

                  {/* Payment Method Tabs */}
                  <div className="grid grid-cols-2 gap-3 mb-8">
                    <button
                      onClick={() => setPaymentMethod('credit_card')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === 'credit_card'
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">💳</span>
                        <div>
                          <p className={`font-bold text-sm ${paymentMethod === 'credit_card' ? 'text-blue-700' : 'text-slate-700'}`}>บัตรเครดิต / เดบิต</p>
                          <p className="text-xs text-slate-400 mt-0.5">Visa, Mastercard, JCB</p>
                        </div>
                      </div>
                      {paymentMethod === 'credit_card' && (
                        <div className="mt-2 flex justify-end">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          </div>
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => setPaymentMethod('qr')}
                      className={`p-4 rounded-xl border-2 transition-all text-left ${
                        paymentMethod === 'qr'
                          ? 'border-blue-600 bg-blue-50 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🏦</span>
                        <div>
                          <p className={`font-bold text-sm ${paymentMethod === 'qr' ? 'text-blue-700' : 'text-slate-700'}`}>โอนผ่านธนาคาร</p>
                          <p className="text-xs text-slate-400 mt-0.5">QR PromptPay</p>
                        </div>
                      </div>
                      {paymentMethod === 'qr' && (
                        <div className="mt-2 flex justify-end">
                          <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>

                  {/* ============ Credit Card Form ============ */}
                  {paymentMethod === 'credit_card' && (
                    <div>
                      {/* 3D Card Preview */}
                      <div className="mb-8 flex justify-center" style={{ perspective: '1000px' }}>
                        <div
                          className="relative w-[340px] h-[200px] transition-transform duration-700"
                          style={{
                            transformStyle: 'preserve-3d',
                            transform: isCardFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
                          }}
                        >
                          {/* Front */}
                          <div
                            className="absolute inset-0 rounded-2xl p-6 flex flex-col justify-between shadow-2xl"
                            style={{
                              backfaceVisibility: 'hidden',
                              background: cardNetwork === 'visa'
                                ? 'linear-gradient(135deg, #1a1f71 0%, #2d3ab5 50%, #4f5bd5 100%)'
                                : cardNetwork === 'mastercard'
                                  ? 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)'
                                  : cardNetwork === 'jcb'
                                    ? 'linear-gradient(135deg, #0e4c96 0%, #1565c0 50%, #1e88e5 100%)'
                                    : 'linear-gradient(135deg, #334155 0%, #475569 50%, #64748b 100%)',
                            }}
                          >
                            <div className="flex justify-between items-start">
                              <div className="w-10 h-7 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-md shadow-inner" />
                              <CardNetworkLogo network={cardNetwork} />
                            </div>
                            <div>
                              <p className="text-white/90 text-lg tracking-[0.25em] font-mono mb-3">
                                {card.number || '•••• •••• •••• ••••'}
                              </p>
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-white/50 text-[10px] uppercase tracking-wider">Card Holder</p>
                                  <p className="text-white text-xs font-medium tracking-wide truncate max-w-[180px]">
                                    {card.name || 'YOUR NAME'}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-white/50 text-[10px] uppercase tracking-wider">Expires</p>
                                  <p className="text-white text-xs font-medium font-mono">
                                    {card.expiry || 'MM/YY'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Back */}
                          <div
                            className="absolute inset-0 rounded-2xl flex flex-col justify-center shadow-2xl"
                            style={{
                              backfaceVisibility: 'hidden',
                              transform: 'rotateY(180deg)',
                              background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                            }}
                          >
                            <div className="w-full h-10 bg-slate-900/80 mt-[-20px] mb-6" />
                            <div className="px-6">
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-9 bg-slate-300 rounded flex items-center justify-end pr-3">
                                  <span className="text-slate-700 font-mono text-sm font-bold tracking-widest">
                                    {card.cvv || '•••'}
                                  </span>
                                </div>
                                <span className="text-white/60 text-xs">CVV</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Form Fields */}
                      <div className="space-y-5">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">หมายเลขบัตร *</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={card.number}
                              onChange={e => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                              onFocus={() => setIsCardFlipped(false)}
                              className={`w-full px-4 py-3 pr-16 rounded-lg border ${cardErrors.number ? 'border-red-400 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-mono tracking-wider`}
                              placeholder="1234 5678 9012 3456"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <CardNetworkLogo network={cardNetwork} />
                            </div>
                          </div>
                          {cardErrors.number && <p className="text-red-500 text-xs mt-1">{cardErrors.number}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-slate-700 mb-1.5">ชื่อบนบัตร *</label>
                          <input
                            type="text"
                            value={card.name}
                            onChange={e => setCard({ ...card, name: e.target.value.toUpperCase() })}
                            onFocus={() => setIsCardFlipped(false)}
                            className={`w-full px-4 py-3 rounded-lg border ${cardErrors.name ? 'border-red-400 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm uppercase tracking-wide`}
                            placeholder="SOMCHAI PALANGANDEE"
                          />
                          {cardErrors.name && <p className="text-red-500 text-xs mt-1">{cardErrors.name}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">วันหมดอายุ *</label>
                            <input
                              type="text"
                              value={card.expiry}
                              onChange={e => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                              onFocus={() => setIsCardFlipped(false)}
                              className={`w-full px-4 py-3 rounded-lg border ${cardErrors.expiry ? 'border-red-400 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-mono`}
                              placeholder="MM/YY"
                            />
                            {cardErrors.expiry && <p className="text-red-500 text-xs mt-1">{cardErrors.expiry}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">CVV *</label>
                            <input
                              type="password"
                              value={card.cvv}
                              onChange={e => setCard({ ...card, cvv: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                              onFocus={() => setIsCardFlipped(true)}
                              onBlur={() => setIsCardFlipped(false)}
                              className={`w-full px-4 py-3 rounded-lg border ${cardErrors.cvv ? 'border-red-400 bg-red-50' : 'border-slate-300'} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm font-mono`}
                              placeholder="•••"
                            />
                            {cardErrors.cvv && <p className="text-red-500 text-xs mt-1">{cardErrors.cvv}</p>}
                          </div>
                        </div>
                      </div>

                      {/* Security Note */}
                      <div className="mt-6 flex items-center gap-2 text-slate-400 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
                        ข้อมูลการชำระเงินของคุณได้รับการเข้ารหัสด้วย SSL 256-bit เพื่อความปลอดภัยสูงสุด
                      </div>
                    </div>
                  )}

                  {/* ============ QR Payment ============ */}
                  {paymentMethod === 'qr' && (
                    <div className="text-center">
                      <div className="inline-block bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-lg mb-6">
                        {/* 🌟 QR Code ของจริง */}
                        <div className="w-48 h-48 bg-white relative mx-auto mb-4 p-2 flex items-center justify-center">
                          <img 
                            // 🔴 ให้เปลี่ยน 0812345678 เป็นเบอร์โทรศัพท์ หรือ เลขบัตรประชาชนที่ผูกพร้อมเพย์ของคุณ
                            src={`https://promptpay.io/0983813674/${total}.png`} 
                            alt="QR Code PromptPay" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <img src="data:image/svg+xml,%3Csvg viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='40' height='40' rx='8' fill='%231a4d8f'/%3E%3Ctext x='20' y='26' text-anchor='middle' fill='white' font-size='14' font-weight='bold'%3EPP%3C/text%3E%3C/svg%3E" className="w-6 h-6" alt="PromptPay" />
                          <span className="text-sm font-bold text-slate-700">PromptPay QR</span>
                        </div>
                        <p className="text-xs text-slate-400">สแกน QR เพื่อชำระเงิน</p>
                      </div>
                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 max-w-sm mx-auto">
                        <p className="text-blue-700 font-bold text-lg mb-1">฿{total.toLocaleString()}</p>
                        <p className="text-blue-500 text-xs">ยอดที่ต้องชำระ</p>
                      </div>
                      <p className="text-slate-400 text-xs">หลังจากโอนเงินแล้ว กรุณากด &quot;ถัดไป&quot; เพื่อยืนยันคำสั่งซื้อ</p>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={goBack}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                      ย้อนกลับ
                    </button>
                    <button
                      onClick={goNext}
                      className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2"
                    >
                      ถัดไป — ตรวจสอบคำสั่งซื้อ
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              )}

              {/* ============================
                  STEP 3: Review & Confirm
              ============================ */}
              {step === 3 && (
                <div className="p-8">
                  <h2 className="text-xl font-bold text-slate-900 mb-1 flex items-center gap-2">
                    <span className="text-2xl">✅</span> ตรวจสอบและยืนยันคำสั่งซื้อ
                  </h2>
                  <p className="text-sm text-slate-500 mb-8">กรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนยืนยัน</p>

                  {/* Shipping Summary */}
                  <div className="bg-slate-50 rounded-xl p-5 mb-5 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span>📦</span> ข้อมูลจัดส่ง
                      </h3>
                      <button onClick={() => setStep(1)} className="text-blue-600 hover:text-blue-700 text-xs font-medium">แก้ไข</button>
                    </div>
                    <div className="text-sm text-slate-600 space-y-1">
                      <p className="font-medium text-slate-800">{shipping.fullName} | {shipping.phone}</p>
                      <p>{shipping.address}</p>
                      <p>{shipping.subDistrict}, {shipping.district}, {shipping.province} {shipping.postalCode}</p>
                    </div>
                  </div>

                  {/* Payment Summary */}
                  <div className="bg-slate-50 rounded-xl p-5 mb-5 border border-slate-100">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span>💳</span> วิธีชำระเงิน
                      </h3>
                      <button onClick={() => setStep(2)} className="text-blue-600 hover:text-blue-700 text-xs font-medium">แก้ไข</button>
                    </div>
                    <div className="text-sm text-slate-600">
                      {paymentMethod === 'credit_card' ? (
                        <div className="flex items-center gap-3">
                          <CardNetworkLogo network={cardNetwork} />
                          <div>
                            <p className="font-medium text-slate-800">
                              {cardNetwork === 'visa' ? 'Visa' : cardNetwork === 'mastercard' ? 'Mastercard' : cardNetwork === 'jcb' ? 'JCB' : 'Credit Card'}
                              {' '}•••• {card.number.replace(/\s/g, '').slice(-4)}
                            </p>
                            <p className="text-xs text-slate-400">{card.name}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🏦</span>
                          <p className="font-medium text-slate-800">โอนผ่านธนาคาร (QR PromptPay)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items Summary */}
                  <div className="bg-slate-50 rounded-xl p-5 mb-5 border border-slate-100">
                    <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-4">
                      <span>🛒</span> รายการสินค้า ({cartItems.reduce((s, i) => s + i.quantity, 0)} ชิ้น)
                    </h3>
                    <div className="space-y-3">
                      {cartItems.map(item => (
                        <div key={item.id} className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white rounded-lg border border-slate-200 flex items-center justify-center p-1 shrink-0">
                            <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                            <p className="text-xs text-slate-400">x{item.quantity}</p>
                          </div>
                          <p className="text-sm font-bold text-slate-800 shrink-0">฿{(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Navigation */}
                  <div className="flex gap-3 mt-8">
                    <button
                      onClick={goBack}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                      ย้อนกลับ
                    </button>
                    <button
                      onClick={handleConfirmOrder}
                      disabled={isProcessing}
                      className="flex-[2] bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                    >
                      {isProcessing ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          กำลังประมวลผลการชำระเงิน...
                        </>
                      ) : (
                        <>
                          🔒 ยืนยันสั่งซื้อ — ฿{total.toLocaleString()}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Side — Order Summary (sticky) */}
          <div className="lg:w-2/5">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
              <h2 className="text-lg font-bold text-slate-800 mb-5 pb-4 border-b border-slate-100 flex items-center gap-2">
                🛒 สรุปคำสั่งซื้อ
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-1">
                {cartItems.map(item => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="w-14 h-14 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-center p-1.5 shrink-0">
                      <img src={item.icon} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 truncate">{item.name}</p>
                      <p className="text-xs text-slate-400">จำนวน: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-slate-800 shrink-0">
                      ฿{(item.price * item.quantity).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 py-4 border-t border-slate-100">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>ยอดรวมสินค้า</span>
                  <span className="font-medium text-slate-800">฿{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>ค่าจัดส่ง</span>
                  {shippingFee === 0 ? (
                    <span className="font-medium text-emerald-500">ฟรี</span>
                  ) : (
                    <span className="font-medium text-slate-800">฿{shippingFee.toLocaleString()}</span>
                  )}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <div className="flex justify-between items-end">
                  <span className="font-bold text-slate-800">ยอดชำระทั้งหมด</span>
                  <span className="text-2xl font-bold text-blue-600">฿{total.toLocaleString()}</span>
                </div>
              </div>

              {/* Trust badges */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-4 text-slate-300">
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/></svg>
                  <span className="text-[10px]">SSL Secure</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"/></svg>
                  <span className="text-[10px]">จัดส่งฟรี</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"/></svg>
                  <span className="text-[10px]">คืนสินค้า</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}