import Link from 'next/link';
export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 to-blue-50 py-32 overflow-hidden">
        {/* วงกลมตกแต่งฉากหลัง */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-100 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-100 opacity-50 blur-3xl"></div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-block bg-blue-100 text-blue-700 font-medium px-4 py-1.5 rounded-full text-sm mb-4 border border-blue-200">
              🌱 แพลตฟอร์มจัดจำหน่ายโซล่าเซลล์ B2B & B2C
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-900 leading-tight">
              ยกระดับธุรกิจด้วย <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">พลังงานสะอาดที่ยั่งยืน</span>
            </h1>
            <p className="text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto">
              ศูนย์รวมแผงโซล่าเซลล์ อินเวอร์เตอร์ และอุปกรณ์ติดตั้งคุณภาพระดับโลก
              พร้อมระบบจัดการคำสั่งซื้อและขอใบเสนอราคาสำหรับผู้รับเหมาและลูกค้าทั่วไป
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
  <Link href="/products" className="inline-block text-center bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 px-8 rounded-xl shadow-lg shadow-blue-600/30 transition-all">
    ดูแคตตาล็อกสินค้า
  </Link>
  <Link href="/calculator" className="inline-block text-center bg-white border border-slate-300 hover:border-blue-500 hover:text-blue-600 text-slate-700 font-medium py-3.5 px-8 rounded-xl transition-all shadow-sm">
    ประเมินความคุ้มค่า
  </Link>
</div>
          </div>
        </div>
      </section>

      {/* 3 จุดเด่นของแพลตฟอร์ม */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl mb-6">📦</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">สินค้าครบวงจร</h3>
              <p className="text-slate-600">แผงโซล่าเซลล์, อินเวอร์เตอร์ และอุปกรณ์ยึดจับจากแบรนด์ชั้นนำ พร้อมสต็อกพร้อมส่ง</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-2xl mb-6">🤝</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">รองรับ B2B & B2C</h3>
              <p className="text-slate-600">ระบบขอใบเสนอราคาออนไลน์ สะดวกสำหรับผู้รับเหมาและลูกค้าทั่วไปที่ต้องการราคาพิเศษ</p>
            </div>
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-2xl mb-6">⚡</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">ประเมินขนาดติดตั้ง</h3>
              <p className="text-slate-600">เครื่องมือช่วยประเมินขนาดระบบที่เหมาะสมกับค่าไฟของคุณ พร้อมคำนวณจุดคุ้มทุน</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}