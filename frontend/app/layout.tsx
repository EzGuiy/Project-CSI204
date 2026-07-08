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
        <nav className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
           <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              
              {/* โลโก้ */}
              <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                <span className="text-3xl">☀️</span>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Solar<span className="text-blue-600">Tech</span></h1>
              </Link>
              
              {/* เมนูตรงกลาง */}
              <div className="hidden md:flex space-x-8 items-center font-medium text-slate-600">
                 <Link href="/" className="hover:text-blue-600 transition-colors">หน้าแรก</Link>
                 <Link href="/products" className="hover:text-blue-600 transition-colors">แคตตาล็อกสินค้า</Link>
                 <Link href="/calculator" className="hover:text-blue-600 transition-colors">ประเมินขนาดติดตั้ง</Link>
              </div>

              {/* ปุ่มตะกร้าสินค้าด้านขวา (เรียกใช้ Component ใหม่) */}
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