import Link from 'next/link';

export default function Home() {
  return (
    <div className="w-full">
      
      {/* 1. Hero Section (ภาพโฆษณาหลัก) */}
      <section className="relative py-32 md:py-48 overflow-hidden">
        {/* ภาพพื้นหลัง (อ้างอิงจากรูป hero-bg.jpg ในโฟลเดอร์ public) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/bg.png')" }}
        ></div>
        {/* ฟิลเตอร์สีเข้ม (Overlay) */}
        <div className="absolute inset-0 z-0 bg-slate-900/70 backdrop-blur-[2px]"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block bg-white/10 backdrop-blur-md text-white font-medium px-5 py-2 rounded-full text-sm mb-4 border border-white/20 shadow-lg">
              🌱 แพลตฟอร์มจัดจำหน่ายโซล่าเซลล์ B2B & B2C
            </div>
            <h1 className="text-5xl md:text-6xl md:leading-[1.2] font-bold text-white">
              ยกระดับธุรกิจด้วย <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">พลังงานสะอาดที่ยั่งยืน</span>
            </h1>
            <p className="text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto">
              ศูนย์รวมแผงโซล่าเซลล์ อินเวอร์เตอร์ และอุปกรณ์ติดตั้งคุณภาพระดับโลก
              พร้อมระบบจัดการคำสั่งซื้อและขอใบเสนอราคาสำหรับผู้รับเหมาและลูกค้าทั่วไป
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
              <Link href="/products" className="inline-block text-center bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 px-10 rounded-xl shadow-lg shadow-blue-600/40 transition-all hover:-translate-y-1">
                ดูรายการสินค้า
              </Link>
              <Link href="/calculator" className="inline-block text-center bg-white/10 border border-white/30 hover:bg-white hover:text-slate-900 text-white font-medium py-4 px-10 rounded-xl transition-all shadow-sm hover:-translate-y-1">
                ประเมินความคุ้มค่า
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2. สถิติความสำเร็จ (Trust Numbers) */}
      <section className="bg-blue-600 py-12">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-blue-500/50">
            <div>
              <p className="text-4xl font-bold text-white mb-2">1,000+</p>
              <p className="text-blue-200 text-sm">รายการสินค้าพร้อมส่ง</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">25 <span className="text-2xl">ปี</span></p>
              <p className="text-blue-200 text-sm">รับประกันประสิทธิภาพแผง</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">10M+</p>
              <p className="text-blue-200 text-sm">ช่วยลูกค้าประหยัดค่าไฟ (บาท/ปี)</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-white mb-2">24/7</p>
              <p className="text-blue-200 text-sm">ระบบขอใบเสนอราคาออนไลน์</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. แบรนด์พาร์ทเนอร์ (Global Partners) */}
      <section className="py-16 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-8">พันธมิตรระดับโลกของเรา</p>
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            {/* จำลองโลโก้ด้วย Text ไปก่อน (ถ้ามีไฟล์รูปโลโก้ค่อยมาเปลี่ยนเป็นแท็ก img ทีหลังได้ครับ) */}
            <div className="text-2xl font-black font-sans">HUAWEI</div>
            <div className="text-2xl font-black font-serif italic">JinkoSolar</div>
            <div className="text-2xl font-black font-sans tracking-tighter">LONGi</div>
            <div className="text-2xl font-bold font-mono">GROWATT</div>
            <div className="text-2xl font-bold font-sans text-red-600">SMA</div>
          </div>
        </div>
      </section>

      {/* 4. ขอบเขตการทำงานของระบบ (System Scope) สำหรับโชว์อาจารย์ */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              ขอบเขตการทำงานของระบบ <span className="text-blue-600">SolarTech</span>
            </h2>
            <p className="text-slate-600 text-lg">
              แพลตฟอร์มของเราถูกพัฒนาขึ้นเพื่อรองรับการทำงานแบบครบวงจร ตั้งแต่การเลือกซื้อไปจนถึงการจัดการหลังบ้าน
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            
            {/* Frontend Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl">🖥️</div>
                <h3 className="text-xl font-bold text-slate-800">ระบบหน้าบ้าน (Frontend)</h3>
              </div>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3"><span className="text-blue-500">✓</span><span>ระบบเข้าชมและค้นหาแผงโซล่าเซลล์ตามหมวดหมู่</span></li>
                <li className="flex items-start gap-3"><span className="text-blue-500">✓</span><span>ระบบคำนวณขนาดแผงเบื้องต้น สำหรับผู้ใช้งาน (Solar Calculator)</span></li>
                <li className="flex items-start gap-3"><span className="text-blue-500">✓</span><span>ระบบจัดการตะกร้าสินค้า (Shopping Cart)</span></li>
              </ul>
            </div>

            {/* Payment Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl">💳</div>
                <h3 className="text-xl font-bold text-slate-800">ระบบชำระเงิน (Payment)</h3>
              </div>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3"><span className="text-emerald-500">✓</span><span>รองรับการชำระเงินผ่านการตัดบัตรเครดิต</span></li>
                <li className="flex items-start gap-3"><span className="text-emerald-500">✓</span><span>รองรับการสแกน QR Code (PromptPay)</span></li>
                <li className="flex items-start gap-3"><span className="text-emerald-500">✓</span><span>ระบบแนบหลักฐานและตรวจสอบสลิปการโอนเงิน</span></li>
              </ul>
            </div>

            {/* Tracking Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-2xl">🚚</div>
                <h3 className="text-xl font-bold text-slate-800">ระบบติดตามผล (Order Tracking)</h3>
              </div>
              <p className="text-slate-600 mb-5">อัปเดตและแจ้งเตือนสถานะการสั่งซื้อแบบเรียลไทม์:</p>
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
                <div className="flex flex-col items-center text-slate-400"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mb-2">1</div><span>รอชำระ</span></div>
                <div className="h-0.5 w-full bg-slate-200 mx-2"></div>
                <div className="flex flex-col items-center text-amber-600 font-medium"><div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center mb-2 shadow-sm shadow-amber-200">2</div><span>ตรวจสอบ</span></div>
                <div className="h-0.5 w-full bg-slate-200 mx-2"></div>
                <div className="flex flex-col items-center text-slate-400"><div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center mb-2">3</div><span>จัดส่ง</span></div>
              </div>
            </div>

            {/* Backend Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl">⚙️</div>
                <h3 className="text-xl font-bold text-slate-800">ระบบหลังบ้าน (Backend)</h3>
              </div>
              <ul className="space-y-3 text-slate-600">
                <li className="flex items-start gap-3"><span className="text-purple-500">✓</span><span>ระบบจัดการสต็อกสินค้า (Stock Management)</span></li>
                <li className="flex items-start gap-3"><span className="text-purple-500">✓</span><span>ระบบจัดเก็บประวัติการสั่งซื้อของลูกค้า</span></li>
                <li className="flex items-start gap-3"><span className="text-purple-500">✓</span><span>แดชบอร์ดสรุปยอดขายและการจัดการสำหรับ Admin</span></li>
              </ul>
            </div>

          </div>
        </div>
      </section>
      
    </div>
  )
}