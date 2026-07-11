import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'db.json');
    const fileData = await fs.readFile(filePath, 'utf8');
    const db = JSON.parse(fileData);
    return NextResponse.json(db.users || [], { status: 200 });
  } catch (error) {
    console.error("Error reading users from db.json:", error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newUser = await request.json();
    if (!newUser || !newUser.email || !newUser.password) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'db.json');
    const fileData = await fs.readFile(filePath, 'utf8');
    const db = JSON.parse(fileData);

    if (!db.users) {
      db.users = [];
    }

    // ตรวจสอบความซ้ำซ้อนของอีเมลหรือชื่อผู้ใช้
    const isEmailTaken = db.users.some(
      (u: any) => 
        (newUser.email && u.email === newUser.email) || 
        (newUser.username && u.username === newUser.username) ||
        (u.email === newUser.username) ||
        (u.username === newUser.email)
    );

    if (isEmailTaken) {
      return NextResponse.json({ error: 'อีเมลหรือชื่อผู้ใช้นี้ถูกใช้งานแล้ว' }, { status: 400 });
    }

    // เพิ่มผู้ใช้ใหม่
    db.users.push(newUser);

    // เขียนไฟล์กลับไป
    await fs.writeFile(filePath, JSON.stringify(db, null, 2), 'utf8');

    return NextResponse.json({ message: 'สมัครสมาชิกสำเร็จ', user: newUser }, { status: 201 });
  } catch (error) {
    console.error("Error writing user to db.json:", error);
    return NextResponse.json({ error: 'ไม่สามารถบันทึกข้อมูลผู้ใช้ได้' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'ไม่พบรหัสผู้ใช้ที่ต้องการลบ' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'db.json');
    const fileData = await fs.readFile(filePath, 'utf8');
    const db = JSON.parse(fileData);

    if (db.users) {
      db.users = db.users.filter((u: any) => u.id !== userId);
      await fs.writeFile(filePath, JSON.stringify(db, null, 2), 'utf8');
    }

    return NextResponse.json({ message: 'ลบผู้ใช้สำเร็จ' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting user from db.json:", error);
    return NextResponse.json({ error: 'ไม่สามารถลบผู้ใช้ได้' }, { status: 500 });
  }
}
