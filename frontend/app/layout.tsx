import type { Metadata } from "next";
import { Inter } from "next/font/google"; // สมมติว่าใช้ฟอนต์ Inter (หรือ Sarabun/Kanit ถ้าคุณตั้งไว้)
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "SolarTech | Energy Solutions",
  description: "พลังงานอัจฉริยะ เพื่อชีวิตที่ยั่งยืน",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      {/* เพิ่ม bg-zinc-50 และ text-zinc-900 ตรงนี้ เพื่อให้ทุกหน้าเป็นสีเดียวกันทั้งหมด */}
      <body className={`${inter.className} bg-zinc-50 text-zinc-900 min-h-screen flex flex-col`}>
        <Navbar />
        <main className="flex-grow">
          {children}
        </main>
      </body>
    </html>
  );
}