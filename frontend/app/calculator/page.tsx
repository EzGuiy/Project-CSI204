'use client';

import { useState } from 'react';

export default function CalculatorPage() {
  // สร้าง State สำหรับเก็บค่าไฟที่ลูกค้ากรอก (เริ่มต้นที่ 3,000 บาท)
  const [monthlyBill, setMonthlyBill] = useState<number>(3000);

  // --- 🧠 Logic การคำนวณโซล่าเซลล์ (อ้างอิงมาตรฐานแดดประเทศไทย) ---
  // 1. ระบบ 1kW ช่วยประหยัดไฟได้ประมาณ 600 บาท/เดือน
  const recommendedKw = monthlyBill / 600;
  
  // 2. ปัดเศษขนาด kW ให้เป็นตัวเลขที่ดูง่าย (เช่น 5.2 kW)
  const displayKw = Math.max(1, Math.round(recommendedKw * 10) / 10);
  
  // 3. คำนวณจำนวนแผง (สมมติใช้แผงขนาด 550W)
  const panelsNeeded = Math.ceil((displayKw * 1000) / 550);
  
  // 4. คำนวณราคาประเมินเบื้องต้น (สมมติราคาติดตั้งเฉลี่ย 35,000 บาท ต่อ 1kW)
  const estimatedCost = displayKw * 35000;
  
  // 5. คำนวณระยะเวลาคืนทุน (ROI) = เงินลงทุน / เงินที่ประหยัดได้ต่อปี
  const yearlySavings = monthlyBill * 12;
  const roiYears = (estimatedCost / yearlySavings).toFixed(1);

  return (
    <div className="container mx-auto px-6 py-12">
      <div className="max-w-4xl mx-auto">
        
        {/* ส่วนหัว */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            ประเมินขนาดติดตั้ง <span className="text-blue-600">SolarTech</span>
          </h1>
          <p className="text-slate-600">
            กรอกค่าไฟเฉลี่ยรายเดือนของคุณ เพื่อให้ระบบคำนวณขนาดระบบที่เหมาะสมและจุดคุ้มทุน
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden">
          
          {/* ส่วนรับข้อมูล (Input) */}
          <div className="bg-slate-50 p-8 md:p-12 border-b border-slate-100">
            <label className="block text-center text-lg font-medium text-slate-700 mb-6">
              ค่าไฟเฉลี่ยต่อเดือนของคุณ (บาท)
            </label>
            <div className="flex flex-col items-center gap-6">
              <input 
                type="number" 
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                className="text-4xl font-bold text-center text-blue-600 bg-white border-2 border-blue-200 rounded-2xl py-4 px-6 w-full max-w-xs focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                min="500"
                step="100"
              />
              <input 
                type="range" 
                min="500" 
                max="50000" 
                step="500"
                value={monthlyBill}
                onChange={(e) => setMonthlyBill(Number(e.target.value))}
                className="w-full max-w-lg h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
            </div>
          </div>

          {/* ส่วนแสดงผลลัพธ์ (Output) */}
          <div className="p-8 md:p-12">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">ผลการประเมินเบื้องต้น</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
              {/* Card 1: ขนาดที่แนะนำ */}
              <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 text-center">
                <div className="text-blue-500 mb-2 text-2xl">⚡</div>
                <p className="text-slate-600 text-sm mb-1">ขนาดระบบที่แนะนำ</p>
                <p className="text-3xl font-bold text-blue-700">{displayKw} <span className="text-xl">kW</span></p>
              </div>

              {/* Card 2: จำนวนแผง */}
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center">
                <div className="text-slate-500 mb-2 text-2xl">☀️</div>
                <p className="text-slate-600 text-sm mb-1">จำนวนแผงโซล่าเซลล์ (550W)</p>
                <p className="text-3xl font-bold text-slate-800">{panelsNeeded} <span className="text-xl">แผง</span></p>
              </div>

              {/* Card 3: ประหยัดเงิน */}
              <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
                <div className="text-emerald-500 mb-2 text-2xl">💰</div>
                <p className="text-slate-600 text-sm mb-1">ประหยัดค่าไฟได้ประมาณ</p>
                <p className="text-3xl font-bold text-emerald-600">{(monthlyBill).toLocaleString()} <span className="text-xl">บาท/เดือน</span></p>
              </div>

              {/* Card 4: คืนทุน */}
              <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-center">
                <div className="text-amber-500 mb-2 text-2xl">⏳</div>
                <p className="text-slate-600 text-sm mb-1">ระยะเวลาคืนทุนโดยประมาณ</p>
                <p className="text-3xl font-bold text-amber-600">{roiYears} <span className="text-xl">ปี</span></p>
              </div>
            </div>

            <div className="text-center">
              <p className="text-sm text-slate-400 mb-6">
                * นี่เป็นการประเมินเบื้องต้นเท่านั้น ราคาและขนาดติดตั้งจริงอาจเปลี่ยนแปลงตามพื้นที่หน้างาน
              </p>
              <a href="/quotation" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg shadow-blue-600/30 hover:-translate-y-1">
                ขอใบเสนอราคาสำหรับระบบ {displayKw} kW
              </a>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}