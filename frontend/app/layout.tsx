import type { Metadata } from 'next'
import { Mitr } from 'next/font/google'
import './globals.css'
import Link from 'next/link' // 👈 สำคัญมาก! ต้องใช้ Link เพื่อความเร็ว
import CartBadge from '../components/CartBadge'
const mitr = Mitr({ subsets: ['thai', 'latin'], weight: ['300', '400', '500', '600'] })

export const metadata: Metadata = {
  title: 'SolarTech | แพลตฟอร์มจัดจำหน่ายโซล่าเซลล์ครบวงจร',
  description: 'แพลตฟอร์มพาณิชย์อิเล็กทรอนิกส์ B2B และ B2C สำหรับแผงโซล่าเซลล์และอุปกรณ์พลังงานแสงอาทิตย์',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={`${mitr.className} bg-slate-50 text-slate-800 antialiased flex flex-col min-h-screen`}>
        
        {/* Navbar */}
       <nav className="w-full bg-slate-900 shadow-md sticky top-0 z-50 border-b border-slate-800">
   <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      
      {/* โลโก้แบรนด์ */}
      <Link href="/" className="flex items-center gap-3 group">
        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all">☀️</span>
        <h1 className="text-2xl font-bold text-white tracking-wide">
          Solar<span className="text-blue-500">Tech</span>
          <span className="block text-[10px] font-medium text-slate-400 tracking-widest uppercase mt-0.5">Energy Solutions</span>
        </h1>
      </Link>
      
      {/* เมนู */}
      <div className="hidden md:flex space-x-8 items-center font-medium text-slate-300 text-sm tracking-wide">
         <Link href="/" className="hover:text-white transition-colors">หน้าแรก</Link>
         <Link href="/products" className="hover:text-blue-400 transition-colors">รายการสินค้า</Link>
         <Link href="/calculator" className="hover:text-blue-400 transition-colors">ประเมินขนาดติดตั้ง</Link>
         <Link href="/about" className="hover:text-blue-400 transition-colors">เกี่ยวกับบริษัท</Link>
      </div>

      <div className="flex items-center gap-4">
         <CartBadge />
      </div>

   </div>
</nav>
        {/* เนื้อหาหลัก */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Footer */}
        <footer className="bg-slate-900 text-slate-400 py-12 text-center mt-auto">
           <div className="container mx-auto px-6">
             <p className="text-lg font-semibold text-white mb-2">☀️ SolarTech Platform</p>
             <p>© 2026 SolarTech. All rights reserved.</p>
           </div>
        </footer>
      </body>
    </html>
  )
}