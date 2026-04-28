import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ZodError, z } from "zod";
import { authenticate } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const accountId = parseInt(id);

    if (isNaN(accountId)) {
      return NextResponse.json(
        { message: "ID บัญชีไม่ถูกต้อง" },
        { status: 400 },
      );
    }

    const account = await db.accounts.findUnique({
      where: {
        account_id: accountId,
        deletedAt: null,
      },
    });

    if (!account || account.userId !== userId) {
      return NextResponse.json(
        { message: "ไม่พบข้อมูลบัญชี หรือคุณไม่มีสิทธิ์เข้าถึง" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { message: "สำเร็จ", data: account },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid request", errors: error.flatten() },
        { status: 400 },
      );
    }

    console.error("ไม่สำเร็จ:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
