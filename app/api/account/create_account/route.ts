import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth";

const jwtSecret = process.env.JWT_SECRET;

const createAccountSchema = z.object({
  name: z.string().min(2, "ชื่อบัญชีต้องอย่างน้อย 2 ตัวอักษร"),
  balance: z.coerce.number().nonnegative("ยอดเงินต้องไม่ติดลบ").optional().default(0),
  currency: z
    .string()
    .trim()
    .min(3)
    .max(3)
    .transform((value) => value.toUpperCase())
    .optional()
    .default("THB"),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createAccountSchema.parse(body);

    const existingAccount = await db.accounts.findFirst({
      where: {
        userId,
        name: data.name,
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        { message: "ชื่อบัญชีนี้ถูกใช้แล้ว" },
        { status: 400 },
      );
    }

    const account = await db.accounts.create({
      data: {
        name: data.name,
        balance: data.balance,
        currency: data.currency,
        userId,
      },
    });

    return NextResponse.json(
      { message: "สร้างบัญชีสำเร็จ", account },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "ข้อมูลไม่ถูกต้อง", errors: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Create account error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
