'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ProductDetail {
  id: string;
  name: string;
  category: string;
  price: number;
  capacity: string;
  imageUrl: string;
  brand: string;
  stock: number;
  description: string[];
  specs: { label: string; value: string }[];
  dimensions: string;
  weight: string;
  certifications: string[];
  warranty: string;
  installationSteps: string[];
}

const mockProductsDb: Record<string, ProductDetail> = {
  '1': {
    id: '1',
    name: 'Jinko Solar Tiger Pro 550W',
    category: 'บ้านพักอาศัย (Residential)',
    price: 4500,
    capacity: '550W',
    imageUrl: '/Jiinko_550w.jpg',
    brand: 'Jinko Solar',
    stock: 45,
    description: [
      'แผงโซล่าเซลล์ชนิด Monocrystalline Half-cut cells ประสิทธิภาพสูงพิเศษ',
      'เทคโนโลยี Multi-Busbar (MBB) ช่วยเพิ่มประสิทธิภาพการรับกระแสไฟฟ้าและลดการสูญเสียพลังงาน',
      'ทนต่อแรงกดทับของหิมะได้สูงถึง 5,400 Pa และแรงลมพายุถึง 2,400 Pa',
      'ลดการเกิดเอฟเฟกต์จุดอับแสงหรือเงาบัง (Shading Effect) ได้อย่างยอดเยี่ยมด้วยโครงสร้างวงจรอัจฉริยะ'
    ],
    specs: [
      { label: 'กำลังไฟฟ้าสูงสุด (Pmax)', value: '550W' },
      { label: 'แรงดันไฟฟ้าที่กำลังสูงสุด (Vmp)', value: '40.90V' },
      { label: 'กระแสไฟฟ้าที่กำลังสูงสุด (Imp)', value: '13.45A' },
      { label: 'แรงดันไฟฟ้าวงจรเปิด (Voc)', value: '49.62V' },
      { label: 'กระแสไฟฟ้าลัดวงจร (Isc)', value: '14.03A' },
      { label: 'ประสิทธิภาพของแผง (Panel Efficiency)', value: '21.33%' },
      { label: 'ชนิดของเซลล์ (Cell Type)', value: 'Monocrystalline (Half-cut)' }
    ],
    dimensions: '2274 x 1134 x 35 มม.',
    weight: '28 กิโลกรัม',
    certifications: ['Bloomberg Tier 1 (BNEF)', 'TUV Rheinland', 'CE', 'ISO 9001'],
    warranty: 'รับประกันวัสดุและคุณภาพสินค้า 12 ปี, รับประกันประสิทธิภาพการผลิตไฟเชิงเส้น 25 ปี (Linear Power Output)',
    installationSteps: [
      'ทำความสะอาดพื้นผิวหลังคาและติดตั้งโครงสร้างขาจับยึด (L-feet / Metal sheet brackets) เข้ากับแปเหล็กอย่างแข็งแรง',
      'ยึดติดตั้งรางอลูมิเนียมขนานเข้ากับขาจับและใช้เครื่องมือวัดระดับความเอียง (ควรลาดเอียง 10-15 องศาหันไปทางทิศใต้)',
      'ยกแผงโซล่าเซลล์ขึ้นวางบนราง และยึดแผงด้วยตัวล็อกกลาง (Mid-clamp) และล็อกปลาย (End-clamp) พร้อมขันสกรูด้วยแรงบิดประมาณ 15 Nm',
      'เชื่อมต่อสายไฟขั้วบวกและลบของแต่ละแผงเข้าด้วยกันด้วยขั้วต่อ MC4 แบบกันน้ำให้แน่นสนิท',
      'ต่อสายกราวด์จากกรอบแผงทุกแผงลงสู่ระบบดินป้องกันอันตรายจากไฟฟ้าและฟ้าผ่า'
    ]
  },
  '2': {
    id: '2',
    name: 'Longi Hi-MO 5 540W',
    category: 'บ้านพักอาศัย (Residential)',
    price: 4200,
    capacity: '540W',
    imageUrl: '/Jiinko_550w.jpg',
    brand: 'Longi Solar',
    stock: 60,
    description: [
      'แผงโซล่าเซลล์ระดับโลกผลิตด้วยเทคโนโลยีอัจฉริยะ M10 Gallium-doped wafer ป้องกันการเสื่อมสภาพ',
      'การออกแบบ Smart Soldering ช่วยรีดกำลังไฟและปรับปรุงการเปลี่ยนถ่ายประจุไฟฟ้า',
      'โครงสร้างแข็งแรงทนทานผ่านการรับรองการต้านลมแรงจัดและสภาวะหิมะตกหนัก',
      'ลดแรงต้านไฟฟ้าภายในและการเกิดจุดร้อน (Hotspot) ทำให้จ่ายไฟได้เสถียรยาวนาน'
    ],
    specs: [
      { label: 'กำลังไฟฟ้าสูงสุด (Pmax)', value: '540W' },
      { label: 'แรงดันไฟฟ้าที่กำลังสูงสุด (Vmp)', value: '41.65V' },
      { label: 'กระแสไฟฟ้าที่กำลังสูงสุด (Imp)', value: '12.97A' },
      { label: 'แรงดันไฟฟ้าวงจรเปิด (Voc)', value: '49.50V' },
      { label: 'กระแสไฟฟ้าลัดวงจร (Isc)', value: '13.85A' },
      { label: 'ประสิทธิภาพของแผง (Panel Efficiency)', value: '20.90%' },
      { label: 'ชนิดของเซลล์ (Cell Type)', value: 'Monocrystalline (Half-cut)' }
    ],
    dimensions: '2256 x 1133 x 35 มม.',
    weight: '27.2 กิโลกรัม',
    certifications: ['Bloomberg Tier 1 (BNEF)', 'TUV Rheinland', 'CE', 'ISO 14001'],
    warranty: 'รับประกันตัวสินค้า 12 ปี, รับประกันประสิทธิภาพการผลิตไฟฟ้า 25 ปี',
    installationSteps: [
      'วางโครงสร้างขารองรับตามความเหมาะสมของหลังคาแต่ละประเภท ขันยึดพุกหรือน็อตทากาวซิลิโคนกันซึม',
      'ติดตั้งรางอลูมิเนียมวางพาดผ่านโครงหลังคา ตรวจวัดแนวขนานให้แม่นยำ',
      'นำแผงโซล่าเซลล์จัดวางบนรางทีละแถว ล็อกหัวท้ายด้วย End-clamp และล็อกระหว่างแผงด้วย Mid-clamp',
      'เดินสายไฟ PV Cable ขนาด 4 sq.mm. ผ่านท่อร้อยสายไฟทนแสงแดด ป้องกันสายฉีกขาดชำรุด',
      'ตรวจสอบสายแจ็กเชื่อมต่อขั้วสัมผัสให้ปราศจากความชื้นหรือคราบสกปรกก่อนเชื่อมสตรีมเข้าเครื่องอินเวอร์เตอร์'
    ]
  },
  '3': {
    id: '3',
    name: 'Huawei SUN2000-5KTL',
    category: 'ภาคพาณิชย์และอุตสาหกรรม',
    price: 28500,
    capacity: '5kW',
    imageUrl: '/OIP(1).jpg',
    brand: 'Huawei',
    stock: 15,
    description: [
      'อินเวอร์เตอร์ออนกริดระบบ 1 เฟส (Single Phase) มาตรฐานสูงสำหรับบ้านและพาณิชย์ขนาดเล็ก',
      'รองรับการทำงานร่วมกับระบบกักเก็บพลังงานแบตเตอรี่ (Huawei LUNA2000) ได้ทันทีแบบไฮบริดในตัว',
      'ระบบความปลอดภัยอัจฉริยะ AI-powered Active Arcing Protection (AFCI) คอยตัดวงจรทันทีเมื่อพบการอาร์กของไฟ DC',
      'ระบบระบายความร้อนธรรมชาติแบบปิด ไร้พัดลมหมุนเสียงดังรบกวน ทนแดดทนฝนทนการกัดกร่อน'
    ],
    specs: [
      { label: 'กำลังจ่าย AC สูงสุด (Rated AC Power)', value: '5,000W' },
      { label: 'แรงดันไฟฟ้า AC ด้านออก', value: '220V / 230V / 240V' },
      { label: 'ประสิทธิภาพการแปลงไฟฟ้าสูงสุด', value: '98.40%' },
      { label: 'ช่วงแรงดันใช้งาน MPPT (MPPT Operating Voltage)', value: '90V - 560V' },
      { label: 'แรงดันไฟเข้า DC สูงสุด (Max Input DC Voltage)', value: '600V' },
      { label: 'จำนวน MPPT ในตัว (Number of MPPTs)', value: '2 ช่อง' },
      { label: 'ระดับมาตรฐานการป้องกัน', value: 'IP65 (ใช้งานภายนอกอาคารได้)' }
    ],
    dimensions: '365 x 365 x 156 มม.',
    weight: '12 กิโลกรัม',
    certifications: ['ผ่านการรับรองและขึ้นทะเบียน PEA / MEA Grid-Tied Inverter List', 'CE', 'IEC 62109', 'TUV'],
    warranty: 'รับประกันคุณภาพผลิตภัณฑ์ 10 ปีเต็มโดยศูนย์บริการในเครือ Huawei ประเทศไทย',
    installationSteps: [
      'ค้นหาผนังปูนที่เรียบแข็งแรงและระบายความร้อนได้ดี (แนะนำใต้ชายคาพ้นแสงแดดจัดกระทบตรง)',
      'ยึดติดตั้งโครงฐานแขวนอินเวอร์เตอร์ (Wall Bracket) ด้วยพุกเหล็ก ขันสกรูกันคลายให้แน่นหนา',
      'แขวนตัวเครื่องอินเวอร์เตอร์เข้ากับโครงฐาน ตรวจสอบขาล็อกลงช่องพอดี และขันน็อตล็อกนิรภัยด้านข้างป้องกันเครื่องหลุด',
      'เข้าหัวสาย DC ขั้วบวกและลบด้วยหัว MC4 ที่มากับกล่อง เสียบเข้าช่อง DC Input 1 และ 2 ตามระบบสตรีม',
      'ต่อสายดินอินเวอร์เตอร์แยกเฉพาะ และเชื่อมสายไฟ AC Output ไปยังตู้อุปกรณ์เบรกเกอร์โซล่าเซลล์',
      'เสียบ SDongle (ตัวกระจายสัญญาณ) ด้านล่างตัวเครื่อง และใช้สมาร์ทโฟนเปิดแอป FusionSolar ทำการตั้งค่าการเชื่อมต่อ Grid การไฟฟ้า'
    ]
  },
  '4': {
    id: '4',
    name: 'Growatt MIN 3000TL-X',
    category: 'บ้านพักอาศัย (Residential)',
    price: 15900,
    capacity: '3kW',
    imageUrl: '/OIP(1).jpg',
    brand: 'Growatt',
    stock: 22,
    description: [
      'อินเวอร์เตอร์แปลงไฟระบบออนกริดเฟสเดียว ขนาดกะทัดรัด น้ำหนักเบาเป็นพิเศษ ติดตั้งง่าย',
      'มาพร้อมหน้าจอ Touch OLED แสดงผลข้อมูลสดใสและปุ่มสัมผัสภายในตัวเครื่อง',
      'ระบบติดตามประมวลผล Dual MPPT รองรับแผงกำลังไฟฟ้าวัตต์สูงได้ยอดเยี่ยม',
      'ระบบการสื่อสารอัจฉริยะรองรับการต่อโมดูล WiFi เพื่อดูข้อมูลกำลังผลิตไฟฟ้าผ่านสมาร์ทโฟน'
    ],
    specs: [
      { label: 'กำลังจ่าย AC สูงสุด (Rated AC Power)', value: '3,000W' },
      { label: 'แรงดันไฟฟ้า AC ด้านออก', value: '230V' },
      { label: 'ประสิทธิภาพการแปลงไฟฟ้าสูงสุด', value: '98.20%' },
      { label: 'ช่วงแรงดันใช้งาน MPPT', value: '80V - 550V' },
      { label: 'แรงดันไฟเข้า DC สูงสุด', value: '550V' },
      { label: 'จำนวน MPPT ในตัว', value: '2 ช่อง' },
      { label: 'ระดับมาตรฐานการป้องกัน', value: 'IP65' }
    ],
    dimensions: '375 x 350 x 160 มม.',
    weight: '10.8 กิโลกรัม',
    certifications: ['ผ่านการรับรองและขึ้นทะเบียน PEA / MEA', 'CE', 'IEC 62109', 'TUV'],
    warranty: 'รับประกันคุณภาพสินค้า 5 ปี',
    installationSteps: [
      'เลือกตำแหน่งผนังที่ร่ม อากาศถ่ายเทได้สะดวกและห่างจากสสารไวไฟ',
      'ยึดติดตั้งแผ่นรองรับเครื่องเข้ากับผนังและแขวนเครื่องอินเวอร์เตอร์ให้สลักลงล็อก',
      'ติดตั้งตู้ไฟคอนโทรล AC/DC Breaker ติดตั้งอุปกรณ์เสิร์จป้องกันไฟกระชาก (Surge Protector) ทั้งสองฝั่ง',
      'ต่อสายเคเบิลจากแผงเข้ากับช่องเสียบ DC และต่อสายจากช่อง AC ออกไปยังชุดควบคุมระบบไฟฟ้าของอาคาร',
      'เสียบ WiFi Dongle เข้าที่พอร์ตด้านล่างและดาวน์โหลดแอปพลิเคชัน ShinePhone เพื่อทำตามขั้นตอนจับคู่และลงทะเบียนเครื่อง'
    ]
  },
  '5': {
    id: '5',
    name: 'รางอลูมิเนียม Mounting Rail 4.2m',
    category: 'อุปกรณ์ติดตั้ง',
    price: 650,
    capacity: '-',
    imageUrl: '/OIP(2).jpg',
    brand: 'Generic Premium',
    stock: 150,
    description: [
      'รางอลูมิเนียมสำหรับการติดตั้งโครงรับแผงบนหลังคา ความยาวมาตรฐาน 4.2 เมตร',
      'ผลิตจากอลูมิเนียมอัลลอยด์พรีเมียม AL6005-T5 แข็งแรงและให้น้ำหนักเบาเป็นพิเศษ ลดภาระน้ำหนักบนหลังคา',
      'ชุบผิวสัมผัสกันการสึกหรอและป้องกันสนิมยาวนานกว่า 25 ปีในสภาพภูมิอากาศร้อนชื้นแบบไทย',
      'มีร่องประกอบภายในที่ออกแบบมาเฉพาะเพื่อช่วยให้ใส่และขันน็อตแคลมป์ยึดได้รวดเร็วทันที'
    ],
    specs: [
      { label: 'ความยาวรางทั้งหมด (Length)', value: '4.2 เมตร (4200 มม.)' },
      { label: 'เกรดวัสดุโลหะผสม', value: 'Anodized Aluminum AL6005-T5' }
    ],
    dimensions: '4200 x 28 x 50 มม.',
    weight: '2.5 กิโลกรัม / เส้น',
    certifications: ['TUV Approved', 'AS/NZS 1170.2 (มาตรฐานความต้านทานต่อแรงลมออสเตรเลีย)'],
    warranty: 'รับประกันความทนทานและการผุกร่อนของโครงสร้างยาวนาน 10 ปี',
    installationSteps: [
      'หาตำแหน่งจันทันหรือแปหลังคา เจาะยึดชุดตะขอเกี่ยวหลังคา (Roof Hook) หรือตัวยึด L-feet ตามตำแหน่งแนววางราง',
      'วางพาดรางอลูมิเนียมลงบนฐานล็อกของขาจับ ยึดล็อกน็อตของฐานเข้ากับด้านข้างของราง ตรวจสอบระดับความขนาน',
      'ใช้แผ่นต่อราง (Rail Splice) สไลด์เข้าในช่องหน้าตัดราง หากต้องการต่อขยายความยาวของโครงระบบ และขันสกรูยึดขอบทั้งสองด้านให้แน่น',
      'หลังจากยึดรางเสร็จเรียบร้อย ให้ดำเนินการวางแผงและจัดแนวแผงให้ได้ระยะก่อนขันแคลมป์ยึดตามข้อกำหนด'
    ]
  },
  '6': {
    id: '6',
    name: 'แบตเตอรี่ลิเธียม Huawei LUNA2000',
    category: 'ระบบกักเก็บพลังงาน',
    price: 95000,
    capacity: '5kWh',
    imageUrl: '/OIP(3).jpg',
    brand: 'Huawei',
    stock: 8,
    description: [
      'ระบบแบตเตอรี่เก็บไฟฟ้าออนกริดอัจฉริยะ (Smart String ESS) ประสิทธิภาพสูงสำหรับการจัดเก็บไฟแสงอาทิตย์ส่วนเกิน',
      'ใช้เซลล์แบตเตอรี่ชนิด Lithium Iron Phosphate (LFP) ปลอดภัยขั้นสูง ป้องกันไฟไหม้และการลัดวงจร',
      'รองรับการจ่ายพลังงานลึกได้เต็ม 100% (Depth of Discharge - DoD 100%) ดึงไฟมาใช้ได้เต็มที่ทุกหยด',
      'ดีไซน์แบบ Modular สวยงาม ทันสมัยประหยัดพื้นที่ ติดตั้งง่าย รองรับการต่อขยายความจุซ้อนได้สูงสุดถึง 30 kWhต่อระบบ'
    ],
    specs: [
      { label: 'ความจุเก็บพลังงานสุทธิ', value: '5 kWh (สามารถขยายเพิ่มโมดูลสูงสุด 3 ชุดต่อ 1 ระบบเป็น 15 kWh)' },
      { label: 'กำลังไฟฟ้าเอาต์พุตสูงสุด', value: '2.5 kW (กระแสชั่วขณะสูงสุด 5 kW นาน 10 วินาที)' },
      { label: 'ชนิดของแบตเตอรี่ (Battery Cell)', value: 'Lithium Iron Phosphate (LFP)' },
      { label: 'พิกัดแรงดันไฟฟ้าใช้งาน', value: '350V - 560V (High Voltage DC)' },
      { label: 'มาตรฐานความแข็งแรงและระดับกันน้ำ', value: 'IP66' }
    ],
    dimensions: '670 x 150 x 600 มม. (รวมความหนาโมดูลควบคุม)',
    weight: '63.8 กิโลกรัม (รวมฐานวางพื้นและกล่องควบคุมด้านบน)',
    certifications: ['IEC 62619 (ความปลอดภัยระดับแบตเตอรี่อุตสาหกรรม)', 'CE', 'UN38.3', 'RCM'],
    warranty: 'รับประกันประสิทธิภาพการประจุไฟและการจ่ายไฟยาวนาน 10 ปี (Huawei Warranty)',
    installationSteps: [
      'เลือกพื้นที่ติดตั้งที่มีระนาบพื้นผิวสม่ำเสมอ แนะนำให้วางตั้งชิดผนังในร่มและมีฝาครอบกันน้ำกระเซ็น',
      'วางฐานพื้นยึด (Floor Stand Base) และขันสกรูยึดผนังด้านหลังเพื่อประคองตัวฐานรับน้ำหนัก',
      'ยกโมดูลแบตเตอรี่ (Luna2000-5-E0) ขึ้นวางบนฐาน และนำส่วนหัวควบคุมพลังงาน (Luna2000-5C-C0) วางซ้อนสลักล็อกชั้นบนสุด',
      'ขันสกรูยึดห่วงคล้องหลังเครื่องเข้ากับผนังบ้าน เพื่อป้องกันการโค่นล้มหากเกิดเหตุแผ่นดินไหว',
      'ต่อสายเคเบิล DC สีแดงและสีดำเข้าสู่ขั้วจ่ายไฟ DC ของอินเวอร์เตอร์ไฮบริด Huawei',
      'เชื่อมสายสัญญาณข้อมูล RS485 เพื่อส่งสถานะแบตเตอรี่ และทำการ Commissioning อุปกรณ์ผ่านโปรแกรม FusionSolar'
    ]
  }
};

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === 'string' ? params.id : '1';
  
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'installation' | 'warranty'>('specs');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 🌟 ดึงข้อมูลจาก API และผสานเข้ากับ Mock หรือสร้างใหม่หากเป็นสินค้าที่พนักงานเพิ่งเพิ่ม
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch('/api/products');
        if (response.ok) {
          const products = await response.json();
          const dbProduct = products.find((p: any) => p.id === id);
          
          if (dbProduct && mockProductsDb[id]) {
            // กรณีสินค้าเก่า: รวมข้อมูล mock เข้ากับข้อมูลจาก DB
            setProduct({
              ...mockProductsDb[id],
              price: dbProduct.price,
              stock: dbProduct.stock,
              name: dbProduct.name
            });
          } else if (dbProduct) {
            // กรณีสินค้าใหม่ที่พนักงานเพิ่งเพิ่ม!: นำข้อมูลจาก DB มาสร้างโครงสร้างใหม่
            setProduct({
              id: dbProduct.id,
              name: dbProduct.name,
              category: dbProduct.category,
              price: dbProduct.price,
              capacity: '-',
              imageUrl: dbProduct.image || '/file.svg',
              brand: 'SolarTech (General)',
              stock: dbProduct.stock,
              description: dbProduct.description ? [dbProduct.description] : ['สินค้านี้ยังไม่มีรายละเอียดเพิ่มเติม'],
              specs: [
                { label: 'ข้อมูลทั่วไป', value: 'ดูรายละเอียดเชิงลึกได้จากคู่มือที่แนบมากับสินค้า' }
              ],
              dimensions: 'อ้างอิงตามคู่มือสินค้า',
              weight: 'อ้างอิงตามคู่มือสินค้า',
              certifications: ['มาตรฐานความปลอดภัยสากล'],
              warranty: 'รับประกันสินค้า 1 ปี ตามเงื่อนไขของบริษัท',
              installationSteps: ['โปรดติดต่อทีมช่างผู้ชำนาญการของ SolarTech เพื่อดำเนินการติดตั้งให้ได้มาตรฐาน']
            });
          } else if (mockProductsDb[id]) {
            setProduct(mockProductsDb[id]);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-zinc-500 text-lg animate-pulse">กำลังโหลดข้อมูลสินค้า...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="text-5xl">⚠️</p>
        <h2 className="text-2xl font-bold text-zinc-900">ไม่พบสินค้าที่คุณต้องการค้นหา</h2>
        <p className="text-zinc-500">สินค้าชิ้นนี้อาจถูกนำออกจากระบบหรือไม่มีรหัสสินค้านี้ในระบบแล้ว</p>
        <Link href="/products" className="bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors">
          กลับสู่หน้ารายการสินค้า
        </Link>
      </div>
    );
  }

  // 🌟 ป้องกันไม่ให้เพิ่มหรือลดจำนวนเกินสต๊อก
  const updateQuantity = (val: number) => {
    setQuantity(prev => {
      const newQty = prev + val;
      if (newQty < 1) return 1;
      if (newQty > product.stock) return product.stock;
      return newQty;
    });
  };

  const handleAddToCart = () => {
    const session = localStorage.getItem('solar_session');
    
    if (!session) {
      alert('❌ กรุณาล็อกอินหรือสมัครสมาชิกก่อนทำการเลือกซื้อสินค้าค่ะ');
      router.push('/login'); 
      return; 
    }

    const existingCart = JSON.parse(localStorage.getItem('solar_cart') || '[]');
    const existingItem = existingCart.find((item: any) => item.id === product.id);
    
    // 🌟 เช็คว่ารวมกับของเดิมในตะกร้าแล้วเกินสต๊อกหรือไม่
    if (existingItem) {
      if (existingItem.quantity + quantity > product.stock) {
        alert(`❌ ขออภัยค่ะ สินค้านี้มีในสต๊อกเพียง ${product.stock} ชิ้น (คุณมีในตะกร้าแล้ว ${existingItem.quantity} ชิ้น)`);
        return;
      }
      existingItem.quantity += quantity;
    } else {
      existingCart.push({ 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: quantity, 
        icon: product.imageUrl 
      });
    }
    
    localStorage.setItem('solar_cart', JSON.stringify(existingCart));
    window.dispatchEvent(new Event('cartUpdated')); 
    alert(`🛒 เพิ่ม "${product.name}" จำนวน ${quantity} ชิ้น ลงตะกร้าเรียบร้อยแล้ว!`);
  };

  const inquireAboutProduct = () => {
    const session = localStorage.getItem('solar_session');
    if (!session) {
      alert('❌ กรุณาล็อกอินก่อนใช้งานระบบแชตติดต่อสอบถามค่ะ');
      router.push('/login');
      return;
    }
    const event = new CustomEvent('openChatWithProduct', {
      detail: { 
        id: product.id, 
        name: product.name, 
        category: product.category, 
        price: product.price, 
        capacity: product.capacity, 
        imageUrl: product.imageUrl 
      }
    });
    window.dispatchEvent(event);
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      
      {/* 🔴 แถบสีตกแต่งแบรนด์ */}
      <div className="w-full h-1 bg-red-600"></div>

      <div className="max-w-6xl mx-auto px-6 pt-8">
        
        {/* Navigation Breadcrumb */}
        <div className="text-sm text-zinc-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-red-600 transition-colors">หน้าแรก</Link>
          <span>/</span>
          <Link href="/products" className="hover:text-red-600 transition-colors">แคตตาล็อกสินค้า</Link>
          <span>/</span>
          <span className="text-zinc-900 font-medium truncate">{product.name}</span>
        </div>

        {/* Dynamic Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          
          {/* 🖼️ Left Side: Sticky Product Image Card */}
          <div className="flex items-center justify-center bg-[#f7f7f7] border border-zinc-100 rounded-2xl p-8 aspect-square relative shadow-sm h-fit">
            <img 
              src={product.imageUrl} 
              alt={product.name} 
              className={`w-full h-full max-h-[420px] object-contain drop-shadow-md mix-blend-multiply ${product.stock === 0 ? 'opacity-50 grayscale' : ''}`} 
            />
            {product.stock === 0 ? (
               <span className="absolute top-4 right-4 bg-zinc-800 text-white text-xs px-3 py-1 font-bold rounded-full">
                 สินค้าหมด
               </span>
            ) : product.stock <= 10 ? (
              <span className="absolute top-4 right-4 bg-amber-100 text-amber-800 text-xs px-3 py-1 font-bold rounded-full">
                สินค้าจำนวนจำกัด: เหลืออีกเพียง {product.stock} ชิ้น
              </span>
            ) : null}
          </div>

          {/* 📝 Right Side: Product Details Card */}
          <div className="flex flex-col justify-between py-2">
            <div>
              {/* Category & Brand Info */}
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-50 text-blue-600 font-bold text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-sm font-semibold text-zinc-500">
                    แบรนด์: {product.brand}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-extrabold text-zinc-900 leading-snug mb-4 tracking-tight">
                {product.name}
              </h1>

              {/* Quick Details List */}
              <div className="space-y-2 mb-6">
                {product.description.map((desc, i) => (
                  <p key={i} className="text-[15px] text-zinc-600 flex items-start gap-2.5 leading-relaxed">
                    <span className="text-red-600 text-base mt-0.5">•</span>
                    {desc}
                  </p>
                ))}
              </div>

              {/* Capacity Quick Tag */}
              {product.capacity !== '-' && (
                <div className="bg-zinc-50 px-4 py-2 rounded-lg border border-zinc-100 text-zinc-700 text-sm font-medium w-fit mb-6">
                  ⚡ พิกัดกำลังจ่ายไฟ/ขนาด: <span className="font-bold text-zinc-900">{product.capacity}</span>
                </div>
              )}

              {/* Price Tag */}
              <div className="mb-8 p-4 bg-zinc-50 rounded-xl border border-zinc-100 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-400 font-semibold mb-0.5">ราคาขายส่ง/ขายปลีกอุปกรณ์</p>
                  <p className="text-3xl font-black text-zinc-900">
                    ฿{product.price.toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  {product.stock > 0 ? (
                    <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 font-semibold px-2.5 py-1 rounded-md">
                      มีสินค้าในสต็อกพร้อมส่ง
                    </span>
                  ) : (
                    <span className="text-xs bg-red-50 text-red-600 border border-red-100 font-semibold px-2.5 py-1 rounded-md">
                      สินค้าหมดชั่วคราว
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Shopping Action Row */}
            <div className="space-y-4 pt-4 border-t border-zinc-100">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-zinc-700">จำนวนที่ต้องการสั่งซื้อ:</span>
                <div className="flex items-center gap-3 bg-zinc-100 p-1.5 rounded-lg border border-zinc-200 w-fit">
                  <button 
                    onClick={() => updateQuantity(-1)}
                    disabled={quantity <= 1 || product.stock === 0}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-zinc-50 font-bold text-zinc-600 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-10 text-center font-bold text-zinc-900 text-base">{product.stock === 0 ? 0 : quantity}</span>
                  <button 
                    onClick={() => updateQuantity(1)}
                    disabled={quantity >= product.stock || product.stock === 0}
                    className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm hover:bg-zinc-50 font-bold text-zinc-600 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {/* 💬 Ask Admin Button */}
                <button
                  onClick={inquireAboutProduct}
                  className="flex-1 bg-white hover:bg-blue-50 border border-blue-200 text-blue-600 font-bold py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
                >
                  <span className="text-lg">💬</span> สอบถามแอดมิน / ขอใบเสนอราคา
                </button>

                {/* 🛒 Add to Cart Button (เช็คสต๊อก) */}
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`flex-1 font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm shadow-md ${
                    product.stock === 0 
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                      : 'bg-slate-900 hover:bg-red-600 text-white'
                  }`}
                >
                  <span>{product.stock === 0 ? 'สินค้าหมด' : '🛒 เพิ่มลงตะกร้าสินค้า'}</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* 📚 Lower Info Section with Tabs */}
        <div className="border-t border-zinc-200 pt-10">
          
          {/* Tab Selection */}
          <div className="flex gap-8 border-b border-zinc-200 mb-8 overflow-x-auto pb-0.5">
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 text-base font-bold transition-all relative shrink-0 ${
                activeTab === 'specs' ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              ข้อมูลทางเทคนิค
              {activeTab === 'specs' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 rounded-full" />}
            </button>
            
            <button
              onClick={() => setActiveTab('installation')}
              className={`pb-4 text-base font-bold transition-all relative shrink-0 ${
                activeTab === 'installation' ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              คู่มือการติดตั้งเบื้องต้น
              {activeTab === 'installation' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 rounded-full" />}
            </button>

            <button
              onClick={() => setActiveTab('warranty')}
              className={`pb-4 text-base font-bold transition-all relative shrink-0 ${
                activeTab === 'warranty' ? 'text-red-600' : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              มาตรฐานและการรับประกัน
              {activeTab === 'warranty' && <span className="absolute bottom-0 left-0 w-full h-[3px] bg-red-600 rounded-full" />}
            </button>
          </div>

          {/* Tab Contents */}
          <div className="min-h-[250px] leading-relaxed text-zinc-700">
            
            {/* 📋 Tab 1: Specs Table */}
            {activeTab === 'specs' && (
              <div className="space-y-6 max-w-3xl">
                <h3 className="text-lg font-bold text-zinc-900 mb-4">ข้อมูลจำเพาะไฟฟ้าและขนาดอุปกรณ์</h3>
                <div className="border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full text-sm text-left text-zinc-600 border-collapse">
                    <tbody>
                      <tr className="border-b border-zinc-100 bg-zinc-50/50">
                        <td className="px-5 py-3.5 font-bold text-zinc-800 w-1/2">ยี่ห้อ (Brand)</td>
                        <td className="px-5 py-3.5">{product.brand}</td>
                      </tr>
                      {product.specs.map((spec, i) => (
                        <tr key={i} className="border-b border-zinc-100 hover:bg-zinc-50/30 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-zinc-800">{spec.label}</td>
                          <td className="px-5 py-3.5">{spec.value}</td>
                        </tr>
                      ))}
                      <tr className="border-b border-zinc-100 bg-zinc-50/50">
                        <td className="px-5 py-3.5 font-bold text-zinc-800">ขนาดโครงสร้าง (Dimensions)</td>
                        <td className="px-5 py-3.5">{product.dimensions}</td>
                      </tr>
                      <tr className="hover:bg-zinc-50/30 transition-colors">
                        <td className="px-5 py-3.5 font-bold text-zinc-800">น้ำหนักอุปกรณ์ (Weight)</td>
                        <td className="px-5 py-3.5">{product.weight}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 🛠️ Tab 2: Installation Manual */}
            {activeTab === 'installation' && (
              <div className="max-w-4xl space-y-6">
                <div className="bg-amber-50 text-amber-900 border border-amber-200 p-4 rounded-xl flex items-start gap-3 mb-6 text-sm">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="font-bold">ข้อควรระวังเพื่อความปลอดภัย</p>
                    <p className="mt-0.5">การติดตั้งและต่อสายเชื่อมระบบไฟฟ้าควรได้รับการตรวจสอบหรือดำเนินการติดตั้งโดยช่างไฟฟ้าผู้มีความรู้ความชำนาญเท่านั้น เพื่อความปลอดภัยต่อชีวิตและทรัพย์สินของตัวท่านเอง</p>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-zinc-900 mb-4">ขั้นตอนการติดตั้งและประกอบระบบเบื้องต้น</h3>
                <div className="space-y-4">
                  {product.installationSteps.map((step, index) => (
                    <div key={index} className="flex gap-4 p-4 bg-zinc-50 border border-zinc-100 rounded-xl">
                      <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {index + 1}
                      </span>
                      <p className="text-[15px] leading-relaxed text-zinc-600 mt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 🛡️ Tab 3: Certifications & Warranty */}
            {activeTab === 'warranty' && (
              <div className="max-w-4xl space-y-8">
                
                {/* Certifications Block */}
                <div>
                  <h3 className="text-lg font-bold text-zinc-900 mb-4">มาตรฐานการรับรองสากล</h3>
                  <div className="flex flex-wrap gap-3">
                    {product.certifications.map((cert, i) => (
                      <span 
                        key={i} 
                        className="bg-zinc-100 border border-zinc-200 text-zinc-800 font-semibold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5"
                      >
                        ✓ {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Warranty Block */}
                <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-xl">
                  <h3 className="text-lg font-bold text-zinc-900 mb-3 flex items-center gap-2">
                    🛡️ นโยบายการรับประกันผลิตภัณฑ์
                  </h3>
                  <p className="text-[15px] leading-relaxed text-zinc-600 mb-4">
                    {product.warranty}
                  </p>
                  <div className="text-xs text-zinc-400 space-y-1">
                    <p>* การรับประกันนี้ไม่ครอบคลุมความเสียหายจากการติดตั้งผิดวิธี, ไฟฟ้าลัดวงจรในระบบภายนอก หรือภัยพิบัติทางธรรมชาติ</p>
                    <p>* โปรดเก็บบัตรรับประกันสินค้าและใบเสร็จ/ใบกำกับภาษีอย่างเป็นทางการไว้เพื่อใช้ยื่นเคลมประกันศูนย์</p>
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}