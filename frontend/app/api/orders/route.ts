import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const getFilePath = () => path.join(process.cwd(), 'data', 'db.json');

// สำหรับดึงข้อมูลคำสั่งซื้อ (ลูกค้าดูของตัวเอง / พนักงานดูทั้งหมด)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId'); // รับ ID ลูกค้ามา
    
    const fileData = await fs.readFile(getFilePath(), 'utf8');
    const db = JSON.parse(fileData);

    // ถ้ามี userId ส่งมา ให้กรองเฉพาะออเดอร์ของคนนั้น (สำหรับหน้า Tracking)
    if (userId) {
        const userOrders = db.orders.filter((order: any) => order.userId === userId);
        return NextResponse.json(userOrders, { status: 200 });
    }
    
    // ถ้าไม่มี userId คือพนักงานขอดูทั้งหมด
    return NextResponse.json(db.orders, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

// สำหรับสร้างคำสั่งซื้อใหม่ (ตอนลูกค้ากดชำระเงินในหน้า Checkout)
export async function POST(request: Request) {
  try {
    const newOrder = await request.json();
    const fileData = await fs.readFile(getFilePath(), 'utf8');
    const db = JSON.parse(fileData);

    // สร้าง ID ให้ออเดอร์ใหม่ และตั้งสถานะเริ่มต้นเป็น "รอชำระเงิน" หรือ "ตรวจสอบ"
    const orderToSave = {
        ...newOrder,
        id: `ord-${Date.now()}`,
        status: newOrder.paymentMethod === 'promptpay' ? 'รอชำระเงิน' : 'ตรวจสอบ', 
        createdAt: new Date().toISOString()
    };

    db.orders.push(orderToSave);
    await fs.writeFile(getFilePath(), JSON.stringify(db, null, 2));

    return NextResponse.json({ success: true, order: orderToSave }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
// 🟡 อัปเดตสถานะคำสั่งซื้อ (สำหรับพนักงานจัดการออเดอร์)
export async function PUT(request: Request) {
  try {
    const { orderId, status } = await request.json();
    const fileData = await fs.readFile(getFilePath(), 'utf8');
    const db = JSON.parse(fileData);

    // ค้นหาออเดอร์และอัปเดตสถานะ
    const orderIndex = db.orders.findIndex((o: any) => o.id === orderId);
    if (orderIndex > -1) {
        db.orders[orderIndex].status = status;
        await fs.writeFile(getFilePath(), JSON.stringify(db, null, 2));
        return NextResponse.json({ message: 'อัปเดตสถานะสำเร็จ' }, { status: 200 });
    } else {
        return NextResponse.json({ error: 'ไม่พบคำสั่งซื้อ' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'ไม่สามารถอัปเดตสถานะได้' }, { status: 500 });
  }
}