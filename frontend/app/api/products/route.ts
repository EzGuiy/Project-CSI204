import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    // กำหนดเส้นทางไปหาไฟล์ data/db.json ที่เราสร้างไว้
    const filePath = path.join(process.cwd(), 'data', 'db.json');
    
    // อ่านไฟล์ JSON
    const fileData = await fs.readFile(filePath, 'utf8');
    const db = JSON.parse(fileData);
    
    // ส่งข้อมูลเฉพาะส่วน products กลับไปให้หน้าเว็บ
    return NextResponse.json(db.products, { status: 200 });

  } catch (error) {
    console.error("Error reading db.json:", error);
    // ถ้าเกิดข้อผิดพลาด (เช่น หาไฟล์ไม่เจอ) ให้ส่ง Error กลับไป
    return NextResponse.json(
      { error: 'ไม่สามารถดึงข้อมูลสินค้าได้' }, 
      { status: 500 }
    );
  }
}