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

// 🟡 อัปเดตสินค้า (ทั้งเพิ่ม/ลดสต๊อก และ แก้ไขข้อมูลทั้งหมด)
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const fileData = await fs.readFile(getFilePath(), 'utf8');
    const db = JSON.parse(fileData);

    const index = db.products.findIndex((p: any) => p.id === body.id);
    if (index > -1) {
      if (body.amount !== undefined) {
        // 1. กรณีหน้าเว็บส่งแค่ { id, amount } มา แปลว่ากดปุ่ม +/- สต๊อก
        db.products[index].stock = Math.max(0, db.products[index].stock + body.amount);
      } else {
        // 2. กรณีหน้าเว็บส่งข้อมูลมาครบ แปลว่ากดเซฟจากฟอร์ม "แก้ไขสินค้า"
        db.products[index] = { ...db.products[index], ...body };
      }
      await fs.writeFile(getFilePath(), JSON.stringify(db, null, 2));
      return NextResponse.json({ message: 'อัปเดตสำเร็จ', product: db.products[index] }, { status: 200 });
    } else {
      return NextResponse.json({ error: 'ไม่พบสินค้า' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'ไม่สามารถอัปเดตสินค้าได้' }, { status: 500 });
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