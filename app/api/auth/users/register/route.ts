import { NextRequest, NextResponse } from "next/server";
import { z,email } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const boby = await req.json();
    const data = registerSchema.parse(boby);

    const existingUser = await db.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "อีเมลนี้มีผู้ใช้แล้ว" },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await db.users.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: "ลงทะเบียนสำเร็จ", data:data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: "Invalid request", error },
      { status: 400 },
    );
  }
}
