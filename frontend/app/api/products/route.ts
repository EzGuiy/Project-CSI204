import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const getFilePath = () => path.join(process.cwd(), 'data', 'db.json');

// 🟢 ดึงข้อมูลสินค้าทั้งหมด
export async function GET() {
  try {
    const fileData = await fs.readFile(getFilePath(), 'utf8');
    const db = JSON.parse(fileData);
    return NextResponse.json(db.products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลสินค้าได้' }, { status: 500 });
  }
}

// 🟡 อัปเดตสต๊อกสินค้า (สำหรับพนักงาน)
export async function PUT(request: Request) {
  try {
    const { id, amount } = await request.json();
    const fileData = await fs.readFile(getFilePath(), 'utf8');
    const db = JSON.parse(fileData);

    // หาและอัปเดตสต๊อก
    db.products = db.products.map((p: any) => 
      p.id === id ? { ...p, stock: Math.max(0, p.stock + amount) } : p
    );

    await fs.writeFile(getFilePath(), JSON.stringify(db, null, 2));
    return NextResponse.json({ message: 'อัปเดตสต๊อกสำเร็จ' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'ไม่สามารถอัปเดตสต๊อกได้' }, { status: 500 });
  }
}

// 🔴 ลบสินค้า (สำหรับแอดมิน)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const fileData = await fs.readFile(getFilePath(), 'utf8');
    const db = JSON.parse(fileData);

    // คัดกรองเอาสินค้าที่ ID ตรงกันออกไป
    db.products = db.products.filter((p: any) => p.id !== id);

    await fs.writeFile(getFilePath(), JSON.stringify(db, null, 2));
    return NextResponse.json({ message: 'ลบสินค้าสำเร็จ' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'ไม่สามารถลบสินค้าได้' }, { status: 500 });
  }
}
// 🟢 เพิ่มสินค้าใหม่ (สำหรับพนักงานและแอดมิน)
export async function POST(request: Request) {
  try {
    const newProduct = await request.json();
    const fileData = await fs.readFile(getFilePath(), 'utf8');
    const db = JSON.parse(fileData);

    // สร้าง ID ใหม่ให้สินค้า
    const nextId = (db.products.length > 0 ? Math.max(...db.products.map((p: any) => parseInt(p.id) || 0)) + 1 : 1).toString();
    
    const productToSave = {
      ...newProduct,
      id: nextId,
    };

    db.products.push(productToSave);
    await fs.writeFile(getFilePath(), JSON.stringify(db, null, 2));

    return NextResponse.json({ message: 'เพิ่มสินค้าสำเร็จ', product: productToSave }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'ไม่สามารถเพิ่มสินค้าได้' }, { status: 500 });
  }
}