'use client';

import { useState } from 'react';

export default function CalculatorPage() {
  // 🌟 State จากแบบทดลองสำหรับการคำนวณ
  const [monthlyBill, setMonthlyBill] = useState<number>(3000);

  // 🌟 State สำหรับขอใบเสนอราคา
  const [roofType, setRoofType] = useState('กระเบื้องซีแพค (CPAC)');
  const [phase, setPhase] = useState('1');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // --- 🧠 Logic การคำนวณโซล่าเซลล์อ้างอิงเรทราคาและผลตอบแทนปัจจุบัน ---
  // ประเมินขนาด kW ที่เหมาะสมจากฐานค่าไฟ (ปรับให้อิงการประหยัดตามเรทที่คุณให้มา)
  const recommendedKw = monthlyBill / 550; 
  const displayKw = Math.max(1, Math.round(recommendedKw * 10) / 10);
  const panelsNeeded = Math.ceil((displayKw * 1000) / 550);

  // 💰 คำนวณราคาติดตั้งจริงตามกลไกการตลาดแบบขั้นบันได (Scale Pricing)
  let estimatedCost = 0;
  if (displayKw <= 3) {
    // ขนาดประมาณ 3 kW เรทเริ่มต้นเฉลี่ยประมาณ 28,000 บาท/kW
    estimatedCost = displayKw * 28000;
  } else if (displayKw <= 5) {
    // ขนาดประมาณ 5 kW เรทราคาจะถูกลงเฉลี่ยประมาณ 25,000 บาท/kW
    estimatedCost = displayKw * 25000;
  } else {
    // ขนาด 6 kW ขึ้นไป เรทอุตสาหกรรม/บ้านใหญ่เฉลี่ยประมาณ 23,000 บาท/kW
    estimatedCost = displayKw * 23000;
  }

  // ⏳ ประเมินจุดคุ้มทุน (ROI) 
  const yearlySavings = monthlyBill * 12;
  const roiYears = (estimatedCost / yearlySavings).toFixed(1);

  // 🖨️ ฟังก์ชันพิมพ์ใบเสนอราคา (ดึงค่าจากการคำนวณที่อัปเดตแล้วไปใช้)
  const handlePrintQuotation = () => {
    if (!customerName) {
      alert('กรุณากรอกชื่อ-นามสกุล หรือชื่อบริษัท ก่อนพิมพ์ใบเสนอราคาครับ');
      return;
    }

    const quoteNo = `QT-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('กรุณาอนุญาตให้ Pop-up ทำงานเพื่อพิมพ์ใบเสนอราคา');
      return;
    }

    const html = `
      <!DOCTYPE html>
      <html lang="th">
      <head>
        <meta charset="UTF-8">
        <title>ใบเสนอราคา - ${quoteNo}</title>
        <style>
          body { font-family: 'Sarabun', sans-serif; padding: 40px; color: #333; line-height: 1.6; max-width: 850px; margin: 0 auto; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1e3a8a; padding-bottom: 20px; margin-bottom: 30px; }
          .company-info h1 { color: #1e3a8a; margin: 0 0 5px 0; font-size: 28px; }
          .company-info p { margin: 2px 0; font-size: 13px; color: #555; }
          .quote-info { text-align: right; }
          .quote-info h2 { color: #1e3a8a; font-size: 24px; margin: 0 0 10px 0; }
          .quote-info p { margin: 2px 0; font-size: 13px; }
          
          .customer-box { background: #f8fafc; padding: 15px; border: 1px solid #e2e8f0; border-radius: 8px; margin-bottom: 30px; }
          .customer-box h3 { margin: 0 0 10px 0; font-size: 14px; color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
          
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 13px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px 12px; }
          th { background-color: #1e3a8a; color: white; text-align: center; }
          td.right { text-align: right; }
          td.center { text-align: center; }
          
          .summary-box { width: 40%; float: right; margin-bottom: 50px; }
          .summary-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }
          .summary-row.total { font-weight: bold; font-size: 18px; color: #1e3a8a; border-top: 2px solid #1e3a8a; border-bottom: 4px double #1e3a8a; padding: 10px 0; margin-top: 5px; }
          
          .terms { clear: both; font-size: 11px; color: #666; background: #f1f5f9; padding: 15px; border-radius: 8px; }
          .signatures { display: flex; justify-content: space-between; margin-top: 60px; text-align: center; }
          .sign-box { width: 40%; }
          .sign-line { border-bottom: 1px solid #333; margin-bottom: 10px; height: 40px; }
          
          @media print { body { padding: 0; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-info">
            <h1>SolarTech Energy Co., Ltd.</h1>
            <p>123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110</p>
            <p>โทร: 02-123-4567 | อีเมล: sales@solartech.com</p>
            <p>เลขประจำตัวผู้เสียภาษี: 01055xxxxxxxx</p>
          </div>
          <div class="quote-info">
            <h2>ใบเสนอราคา (Quotation)</h2>
            <p><strong>เลขที่:</strong> ${quoteNo}</p>
            <p><strong>วันที่:</strong> ${new Date().toLocaleDateString('th-TH')}</p>
            <p><strong>ยืนยันราคาถึง:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('th-TH')}</p>
          </div>
        </div>

        <div class="customer-box">
          <h3>เสนอต่อ (Customer Information)</h3>
          <p><strong>ชื่อลูกค้า / บริษัท:</strong> ${customerName}</p>
          <p><strong>เบอร์โทรศัพท์:</strong> ${customerPhone || '-'}</p>
          <p><strong>ที่อยู่ติดตั้ง:</strong> ${customerAddress || '-'}</p>
          <p><strong>ลักษณะหลังคา:</strong> ${roofType} | <strong>ระบบไฟฟ้า:</strong> ${phase === '1' ? '1 เฟส (220V)' : '3 เฟส (380V)'}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 5%">ลำดับ</th>
              <th style="width: 50%">รายการ (Description)</th>
              <th style="width: 10%">จำนวน</th>
              <th style="width: 15%">หน่วยละ (บาท)</th>
              <th style="width: 20%">จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="center">1</td>
              <td>
                <strong>ชุดอุปกรณ์ติดตั้งระบบโซล่าเซลล์ On-Grid ขนาด ${displayKw} kW</strong><br/>
                - แผงโซล่าเซลล์ประสิทธิภาพสูง 550W Tier 1 จำนวน ${panelsNeeded} แผง<br/>
                - อินเวอร์เตอร์ระบบ On-Grid ผ่านการรับรองการไฟฟ้า ขนาด ${displayKw} kW<br/>
                - โครงสร้างอลูมิเนียม Mounting Rail จับยึดหลังคาประเภท ${roofType}<br/>
                - ตู้ควบคุมระบบไฟฟ้า Combiner Box พร้อมอุปกรณ์ Surge Protector
              </td>
              <td class="center">1 ชุด</td>
              <td class="right">${(estimatedCost * 0.82).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
              <td class="right">${(estimatedCost * 0.82).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
              <td class="center">2</td>
              <td>ค่าออกแบบโครงสร้าง บริการติดตั้ง และเดินระบบสายไฟตามมาตรฐานวิศวกรรม</td>
              <td class="center">1 งาน</td>
              <td class="right">${(estimatedCost * 0.13).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
              <td class="right">${(estimatedCost * 0.13).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
            </tr>
            <tr>
              <td class="center">3</td>
              <td>บริการดำเนินงานเอกสารยื่นขออนุญาตขนานไฟกับการไฟฟ้า (MEA / PEA)</td>
              <td class="center">1 งาน</td>
              <td class="right">${(estimatedCost * 0.05).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
              <td class="right">${(estimatedCost * 0.05).toLocaleString('th-TH', {minimumFractionDigits: 2})}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-row">
            <span>รวมเป็นเงิน (Subtotal):</span>
            <span>${(estimatedCost * 0.933).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
          </div>
          <div class="summary-row">
            <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
            <span>${(estimatedCost * 0.067).toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
          </div>
          <div class="summary-row total">
            <span>ยอดรวมสุทธิ (Grand Total):</span>
            <span>${estimatedCost.toLocaleString('th-TH', {minimumFractionDigits: 2, maximumFractionDigits: 2})} บาท</span>
          </div>
        </div>

        <div class="terms">
          <strong>เงื่อนไขการชำระเงินและการรับประกัน:</strong><br/>
          1. แบ่งชำระ 3 งวด: มัดจำ 40% (สั่งซื้ออุปกรณ์), 50% (วันเข้าดำเนินงานติดตั้ง), 10% (ส่งมอบงานขนานไฟ)<br/>
          2. รับประกันอินเวอร์เตอร์มาตรฐาน 10 ปี / รับประกันประสิทธิภาพแผงโซล่าเซลล์ 25 ปี<br/>
          3. ฟรีบริการตรวจสอบระบบหลังการติดตั้งและล้างแผง 2 ปีแรก
        </div>

        <div class="signatures">
          <div class="sign-box">
            <div class="sign-line"></div>
            <p>ผู้เสนอราคา (Sales Representative)</p>
            <p>วันที่ ...../...../.....</p>
          </div>
          <div class="sign-box">
            <div class="sign-line"></div>
            <p>ผู้อนุมัติสั่งซื้อ (Authorized Signature)</p>
            <p>วันที่ ...../...../.....</p>
          </div>
        </div>

        <script>
          window.onload = function() { 
            setTimeout(() => { window.print(); window.close(); }, 500);
          }
        </style>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <div className="container mx-auto px-4 py-12 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* ส่วนหัว */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            ประเมินขนาดติดตั้ง <span className="text-blue-600">SolarTech</span>
          </h1>
          <p className="text-slate-600">
            กรอกค่าไฟเฉลี่ยรายเดือนของคุณ เพื่อให้ระบบคำนวณขนาดระบบที่เหมาะสมและจุดคุ้มทุน
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* 🎛️ ฝั่งซ้าย: เครื่องมือคำนวณ (ใช้โค้ดแบบทดลองของคุณ) */}
          <div className="lg:col-span-7 bg-white rounded-3xl shadow-lg border border-slate-100 overflow-hidden flex flex-col h-full">
            
            {/* ส่วนรับข้อมูล (Input) */}
            <div className="bg-slate-50 p-8 border-b border-slate-100 flex flex-col items-center justify-center shrink-0">
              <label className="block text-center text-lg font-medium text-slate-700 mb-6">
                ค่าไฟเฉลี่ยต่อเดือนของคุณ (บาท)
              </label>
              <div className="flex flex-col items-center gap-6 w-full">
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
                  className="w-full max-w-md h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>
            </div>

            {/* ส่วนแสดงผลลัพธ์ (Output) */}
            <div className="p-8 flex-grow flex flex-col justify-center">
              <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">ผลการประเมินเบื้องต้น</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 text-center">
                  <div className="text-blue-500 mb-1 text-2xl">⚡</div>
                  <p className="text-slate-600 text-xs mb-1 font-bold">ขนาดระบบที่แนะนำ</p>
                  <p className="text-2xl font-black text-blue-700">{displayKw} <span className="text-base font-medium">kW</span></p>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-center">
                  <div className="text-slate-500 mb-1 text-2xl">☀️</div>
                  <p className="text-slate-600 text-xs mb-1 font-bold">แผงโซล่าเซลล์ (550W)</p>
                  <p className="text-2xl font-black text-slate-800">{panelsNeeded} <span className="text-base font-medium">แผง</span></p>
                </div>

                <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100 text-center">
                  <div className="text-emerald-500 mb-1 text-2xl">💰</div>
                  <p className="text-slate-600 text-xs mb-1 font-bold">ประหยัดค่าไฟได้ประมาณ</p>
                  <p className="text-2xl font-black text-emerald-600">{(monthlyBill).toLocaleString()} <span className="text-base font-medium">บาท/ด.</span></p>
                </div>

                <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 text-center">
                  <div className="text-amber-500 mb-1 text-2xl">⏳</div>
                  <p className="text-slate-600 text-xs mb-1 font-bold">ระยะเวลาคืนทุน</p>
                  <p className="text-2xl font-black text-amber-600">{roiYears} <span className="text-base font-medium">ปี</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* 📝 ฝั่งขวา: ฟอร์มขอใบเสนอราคา */}
          <div className="lg:col-span-5 bg-white rounded-3xl shadow-lg border border-slate-100 p-8 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
                <span className="text-2xl">🖨️</span> ขอใบเสนอราคา
              </h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ชื่อลูกค้า / ชื่อบริษัท *</label>
                  <input type="text" required value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="คุณสมชาย พลังงานดี" />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">เบอร์โทรศัพท์ติดต่อ</label>
                  <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="08X-XXX-XXXX" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ลักษณะหลังคา</label>
                  <select value={roofType} onChange={e => setRoofType(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                    <option value="กระเบื้องซีแพค (CPAC)">กระเบื้องซีแพค (CPAC)</option>
                    <option value="เมทัลชีท (Metal Sheet)">เมทัลชีท (Metal Sheet)</option>
                    <option value="กระเบื้องลอนคู่">กระเบื้องลอนคู่</option>
                    <option value="หลังคาดาดฟ้า (พื้นปูน)">หลังคาดาดฟ้า (พื้นปูน)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">ระบบไฟฟ้าของบ้าน</label>
                  <div className="flex gap-4 p-3 border border-slate-300 rounded-xl bg-slate-50">
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="phase" value="1" checked={phase === '1'} onChange={e => setPhase(e.target.value)} className="w-4 h-4 text-blue-600" />
                      1 เฟส (220V)
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="radio" name="phase" value="3" checked={phase === '3'} onChange={e => setPhase(e.target.value)} className="w-4 h-4 text-blue-600" />
                      3 เฟส (380V)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1.5">สถานที่ติดตั้ง</label>
                  <textarea rows={2} value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full border border-slate-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none" placeholder="แขวง/เขต/จังหวัด สำหรับระบุในใบเสนอราคา" />
                </div>
              </div>
            </div>

            <button 
              onClick={handlePrintQuotation}
              className="w-full bg-slate-900 hover:bg-blue-600 text-white font-bold py-4 rounded-xl transition-all shadow-md flex justify-center items-center gap-2 text-base mt-4"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
              พิมพ์ใบเสนอราคาระบบ {displayKw} kW
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}