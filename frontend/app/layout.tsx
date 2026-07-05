import type { Metadata } from 'next'
import { Mitr } from 'next/font/google'
import './globals.css'

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
        {/* Navbar - สไตล์ Corporate Clean */}
        <nav className="w-full bg-white shadow-sm sticky top-0 z-50 border-b border-slate-200">
           <div className="container mx-auto px-6 py-4 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="text-3xl">☀️</span>
                <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Solar<span className="text-blue-600">Tech</span></h1>
              </div>
              <div className="hidden md:flex space-x-8 items-center font-medium text-slate-600">
                 <a href="/" className="hover:text-blue-600 transition-colors">หน้าแรก</a>
                 <a href="/products" className="hover:text-blue-600 transition-colors">แคตตาล็อกสินค้า</a>
                 <a href="/calculator" className="hover:text-blue-600 transition-colors">ประเมินขนาดติดตั้ง</a>
                 <a href="/quotation" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg">ขอใบเสนอราคา</a>
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