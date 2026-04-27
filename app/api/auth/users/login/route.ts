import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { ZodError, z ,email} from "zod";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const jwtSecret = process.env.JWT_SECRET;

export async function POST(req: NextRequest) {
  try {
    if (!jwtSecret) {
      return NextResponse.json(
        { message: "JWT_SECRET is not set" },
        { status: 500 },
      );
    }

    const body = await req.json();
    const data = loginSchema.parse(body);

    const existingUser = await db.users.findUnique({
      where: { email: data.email },
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 },
      );
    }

    if (!existingUser.isActive) {
      return NextResponse.json(
        { message: "บัญชีนี้ถูกปิดการใช้งาน" },
        { status: 403 },
      );
    }

    const isValidPassword = await bcrypt.compare(
      data.password,
      existingUser.password,
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" },
        { status: 401 },
      );
    }

    const token = await new SignJWT({
      userId: existingUser.user_id,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(jwtSecret));

    const response = NextResponse.json(
      {
        message: "เข้าสู่ระบบสำเร็จ",
        token:token, 
      },
      { status: 200 },
    );

    response.cookies.set("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid request", errors: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Login error:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
