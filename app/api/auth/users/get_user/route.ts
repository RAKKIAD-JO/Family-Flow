import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ZodError, z, email } from "zod";

export async function GET(req: NextRequest) {
  try {
    const user = await db.users.findMany({
      select: {
        user_id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    return NextResponse.json(
      { message: "สำเร็จ", data: user },
      { status: 201 },
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
