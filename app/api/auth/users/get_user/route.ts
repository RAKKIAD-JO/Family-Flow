import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const user = await db.users.findFirst({
      where: {
        user_id: userId,
        isActive: true,
        deletedAt: null,
      },
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      { message: "Success", data: user },
      { status: 200 },
    );
  } catch (error) {
    console.error("Get current user error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
