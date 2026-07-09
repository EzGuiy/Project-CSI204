import type { Metadata } from 'next'
import { Mitr } from 'next/font/google'
import './globals.css'
import Navbar from '../components/Navbar' // 👈 นำเข้า Navbar ที่เราสร้างใหม่

const mitr = Mitr({ subsets: ['thai', 'latin'], weight: ['300', '400', '500', '600'] })

export const metadata: Metadata = {
  title: 'SolarTech | แพลตฟอร์มจัดจำหน่ายโซล่าเซลล์ครบวงจร',
  description: 'แพลตฟอร์มพาณิชย์อิเล็กทรอนิกส์ B2B และ B2C สำหรับแผงโซล่าเซลล์',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="th">
      <body className={`${mitr.className} bg-slate-50 text-slate-800 antialiased flex flex-col min-h-screen`}>
        
        {/* 🌟 เรียกใช้ Navbar ตรงนี้แค่บรรทัดเดียว! */}
        <Navbar />

        <main className="flex-grow">
          {children}
        </main>

        <footer className="bg-slate-900 text-slate-400 py-12 text-center mt-auto border-t border-slate-800">
           <div className="container mx-auto px-6">
             <p className="text-lg font-bold text-white mb-2">☀️ SolarTech Platform</p>
             <p>© 2026 SolarTech. All rights reserved.</p>
           </div>
        </footer>
      </body>
    </html>
  )
}