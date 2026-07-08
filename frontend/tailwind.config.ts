import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        solar: {
          dark: '#0B192C',     // สีน้ำเงินกรมท่าเข้มจัด (ใช้กับ Footer / Header อารมณ์บริษัทใหญ่)
          primary: '#1E3E62',  // สีน้ำเงินหลักของแบรนด์ (ความน่าเชื่อถือ)
          accent: '#00A859',   // สีเขียวพลังงาน (ปุ่มสั่งซื้อ / สถานะสำเร็จ)
          light: '#F8FAFC',    // สีพื้นหลังเว็บ (เทาอมฟ้าสว่างๆ ให้ดูสะอาดตา)
        }
      }
    },
  },
  plugins: [],
}
export default config