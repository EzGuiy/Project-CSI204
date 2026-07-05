import type { Config } from "tailwindcss";

export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // บรรทัดนี้สำคัญมาก! เป็นการสั่งให้ Tailwind อ่านโค้ดในการ์ดสินค้าของเรา
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} satisfies Config;