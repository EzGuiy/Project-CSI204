import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// ฟังก์ชันดึงข้อมูลแชททั้งหมด
export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'db.json');
    const fileData = await fs.readFile(filePath, 'utf8');
    const db = JSON.parse(fileData);
    return NextResponse.json(db.chats || [], { status: 200 });
  } catch (error) {
    console.error("Error reading chats from db.json:", error);
    return NextResponse.json({ error: 'ไม่สามารถดึงข้อมูลแชทได้' }, { status: 500 });
  }
}

// ฟังก์ชันส่งข้อความแชทใหม่
export async function POST(request: Request) {
  try {
    const newMessage = await request.json();
    if (!newMessage || !newMessage.chatId) {
      return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'db.json');
    const fileData = await fs.readFile(filePath, 'utf8');
    const db = JSON.parse(fileData);

    if (!db.chats) {
      db.chats = [];
    }

    db.chats.push(newMessage);

    await fs.writeFile(filePath, JSON.stringify(db, null, 2), 'utf8');

    return NextResponse.json({ message: 'ส่งข้อความสำเร็จ', chat: newMessage }, { status: 201 });
  } catch (error) {
    console.error("Error writing chat to db.json:", error);
    return NextResponse.json({ error: 'ไม่สามารถบันทึกข้อมูลแชทได้' }, { status: 500 });
  }
}

// ฟังก์ชันอัปเดตสถานะการอ่าน (mark as read)
export async function PUT(request: Request) {
  try {
    const { chatId } = await request.json();
    if (!chatId) {
      return NextResponse.json({ error: 'ไม่พบรหัสแชท' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'db.json');
    const fileData = await fs.readFile(filePath, 'utf8');
    const db = JSON.parse(fileData);

    if (db.chats) {
      let updated = false;
      db.chats = db.chats.map((m: any) => {
        if (m.chatId === chatId && m.sender === 'user' && !m.isRead) {
          updated = true;
          return { ...m, isRead: true };
        }
        return m;
      });

      if (updated) {
        await fs.writeFile(filePath, JSON.stringify(db, null, 2), 'utf8');
      }
    }

    return NextResponse.json({ message: 'อัปเดตสถานะสำเร็จ' }, { status: 200 });
  } catch (error) {
    console.error("Error updating chat in db.json:", error);
    return NextResponse.json({ error: 'ไม่สามารถอัปเดตข้อมูลแชทได้' }, { status: 500 });
  }
}

// ฟังก์ชันลบห้องแชท
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');
    if (!chatId) {
      return NextResponse.json({ error: 'ไม่พบรหัสแชทที่ต้องการลบ' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'data', 'db.json');
    const fileData = await fs.readFile(filePath, 'utf8');
    const db = JSON.parse(fileData);

    if (db.chats) {
      db.chats = db.chats.filter((m: any) => m.chatId !== chatId);
      await fs.writeFile(filePath, JSON.stringify(db, null, 2), 'utf8');
    }

    return NextResponse.json({ message: 'ลบข้อมูลแชทสำเร็จ' }, { status: 200 });
  } catch (error) {
    console.error("Error deleting chat from db.json:", error);
    return NextResponse.json({ error: 'ไม่สามารถลบข้อมูลแชทได้' }, { status: 500 });
  }
}
