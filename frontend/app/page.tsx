import Link from 'next/link';
import ProductCard from '../components/ProductCard';

// ข้อมูลจำลองสำหรับสินค้าแนะนำ (ดึงมาจากไฟล์รูปภาพในโฟลเดอร์ public)
const featuredProducts = [
  { id: '1', name: 'Jinko Solar Tiger Pro 550W', category: 'บ้านพักอาศัย', price: 4500, capacity: '550W', imageUrl: '/Jiinko_550w.jpg' },
  { id: '3', name: 'Huawei SUN2000-5KTL', category: 'อินเวอร์เตอร์', price: 28500, capacity: '5kW', imageUrl: '/OIP(1).jpg' },
  { id: '6', name: 'แบตเตอรี่ลิเธียม Huawei LUNA2000', category: 'ระบบกักเก็บพลังงาน', price: 95000, capacity: '5kWh', imageUrl: '/OIP(3).jpg' },
];

export default function HomePage() {
  return (
    <div className="bg-white min-h-screen flex flex-col">
      
      {/* =========================================
          1. Hero Banner (ส่วนดึงดูดสายตาแรก)
      ========================================= */}
      {/* 🖼️ แก้ไข 1: ใส่ bg-cover, bg-center และ style backgroundImage */}
      <section 
        className="relative pt-24 pb-32 overflow-hidden border-b border-zinc-200 bg-cover bg-center"
        style={{ backgroundImage: "url('/bg.png')" }} // 👈 ใส่ชื่อไฟล์รูปของคุณตรงนี้ (เช่น /bg.png หรือ /hero.jpg)
      >
        {/* 🪄 แก้ไข 2: เพิ่มเลเยอร์สีขาวไล่ระดับ (Gradient) จากซ้ายไปขวา เพื่อให้ตัวหนังสืออ่านง่าย */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent z-0"></div>

        {/* เนื้อหาด้านในเหมือนเดิม (เพิ่ม relative z-10 ให้อยู่เหนือรูป) */}
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-3xl">
            <h2 className="text-red-600 font-semibold tracking-widest uppercase mb-4 text-sm">
              Future of Energy
            </h2>
            <h1 className="text-5xl md:text-6xl font-extrabold text-zinc-900 leading-tight mb-6 tracking-tight">
              พลังงานอัจฉริยะ <br />
              เพื่อชีวิตที่ยั่งยืน
            </h1>
            <p className="text-lg text-zinc-600 mb-10 max-w-xl leading-relaxed">
              สัมผัสประสบการณ์เทคโนโลยีโซล่าเซลล์ระดับโลก ที่ออกแบบมาเพื่อเพิ่มประสิทธิภาพ ลดต้นทุน และยกระดับการใช้ชีวิตของคุณ
            </p>
            
            <div className="flex flex-wrap gap-4">
              <Link 
                href="/products" 
                className="bg-red-600 hover:bg-red-700 text-white px-8 py-3.5 rounded-sm font-semibold transition-colors flex items-center gap-2"
              >
                ดูแคตตาล็อกสินค้า <span className="text-lg leading-none mt-[-2px]">›</span>
              </Link>
              <Link 
                href="/calculator" 
                className="bg-white/80 backdrop-blur-sm border border-zinc-300 hover:border-zinc-400 hover:bg-white text-zinc-800 px-8 py-3.5 rounded-sm font-semibold transition-all"
              >
                ประเมินความคุ้มค่า
              </Link>
            </div>
          </div>
        </div>
        {/* รูปแบบตกแต่งพื้นหลังคลีนๆ (แทนรูปภาพ) */}
        <div className="absolute right-0 top-0 w-1/2 h-full opacity-5 pointer-events-none">
           <svg viewBox="0 0 100 100" className="w-full h-full text-zinc-900 fill-current" preserveAspectRatio="none">
              <polygon points="0,100 100,0 100,100" />
           </svg>
        </div>
      </section>

      {/* =========================================
          2. Value Proposition (จุดเด่นของแบรนด์)
      ========================================= */}
      <section className="py-16 bg-white border-b border-zinc-100">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 divide-y md:divide-y-0 md:divide-x divide-zinc-100">
            <div className="md:pr-10 pt-6 md:pt-0">
              <h3 className="text-zinc-900 font-bold text-lg mb-2">เทคโนโลยีล้ำสมัย</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">อินเวอร์เตอร์และระบบกักเก็บพลังงานที่มาพร้อม AI อัจฉริยะ เพื่อประสิทธิภาพสูงสุด</p>
            </div>
            <div className="md:px-10 pt-6 md:pt-0">
              <h3 className="text-zinc-900 font-bold text-lg mb-2">รับประกันคุณภาพ</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">สินค้าทุกชิ้นผ่านการทดสอบมาตรฐานระดับสากล พร้อมการรับประกันยาวนานสูงสุด 25 ปี</p>
            </div>
            <div className="md:pl-10 pt-6 md:pt-0">
              <h3 className="text-zinc-900 font-bold text-lg mb-2">บริการครบวงจร</h3>
              <p className="text-zinc-500 text-sm leading-relaxed">ตั้งแต่การให้คำปรึกษา จัดจำหน่าย ไปจนถึงแนะนำทีมวิศวกรผู้เชี่ยวชาญระดับประเทศ</p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================
          3. Featured Products (สินค้าแนะนำ)
      ========================================= */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-end mb-12 border-b border-zinc-200 pb-4">
            <h2 className="text-3xl font-bold text-zinc-900 tracking-tight">ผลิตภัณฑ์ยอดนิยม</h2>
            <Link href="/products" className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 transition-colors text-sm">
              ดูสินค้าทั้งหมด <span className="text-lg leading-none mt-[-2px]">›</span>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
            {featuredProducts.map(product => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================================
          4. Solutions (โซลูชันแบ่งตามประเภท)
      ========================================= */}
      <section className="py-20 bg-zinc-50">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-bold text-zinc-900 mb-10 text-center tracking-tight">โซลูชันที่ตอบโจทย์ทุกระดับ</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* โซลูชันบ้านพักอาศัย */}
            <div className="group relative bg-white p-10 h-80 flex flex-col justify-end overflow-hidden border border-zinc-200 cursor-pointer">
              <div className="absolute inset-0 bg-zinc-900/5 group-hover:bg-zinc-900/0 transition-colors duration-500 z-10"></div>
              <div className="relative z-20">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2 group-hover:text-red-600 transition-colors">
                  บ้านพักอาศัย (Residential)
                </h3>
                <p className="text-zinc-500 mb-4">ระบบโซล่าเซลล์สำหรับบ้านที่ชาญฉลาดและปลอดภัย</p>
                <span className="text-sm font-bold text-zinc-900 group-hover:text-red-600 flex items-center gap-1">
                  เรียนรู้เพิ่มเติม <span className="text-lg leading-none mt-[-2px]">›</span>
                </span>
              </div>
            </div>

            {/* โซลูชันอุตสาหกรรม */}
            <div className="group relative bg-white p-10 h-80 flex flex-col justify-end overflow-hidden border border-zinc-200 cursor-pointer">
              <div className="absolute inset-0 bg-zinc-900/5 group-hover:bg-zinc-900/0 transition-colors duration-500 z-10"></div>
              <div className="relative z-20">
                <h3 className="text-2xl font-bold text-zinc-900 mb-2 group-hover:text-red-600 transition-colors">
                  ธุรกิจและอุตสาหกรรม (C&I)
                </h3>
                <p className="text-zinc-500 mb-4">ปลดล็อกศักยภาพทางธุรกิจด้วยพลังงานสะอาดที่ยั่งยืน</p>
                <span className="text-sm font-bold text-zinc-900 group-hover:text-red-600 flex items-center gap-1">
                  เรียนรู้เพิ่มเติม <span className="text-lg leading-none mt-[-2px]">›</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}