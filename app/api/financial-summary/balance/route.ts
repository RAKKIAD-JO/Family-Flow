import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // รวมยอดเงินคงเหลือจากทุกบัญชีที่ไม่ได้ถูกลบ
    const result = await db.accounts.aggregate({
      where: {
        userId,
        deletedAt: null,
      },
      _sum: {
        balance: true,
      },
    });

    const totalBalance = result._sum.balance || 0;

    return NextResponse.json({
      totalBalance,
      currency: "THB", // สมมติว่าเป็น THB หรืออาจดึงจาก account แรก
    });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}