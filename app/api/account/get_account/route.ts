import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ZodError, z, email } from "zod";
import { tr } from "zod/locales";

export async function GET(req:NextRequest) {
    try {
        const account = await db.accounts.findMany({
            select:{
                account_id:true,
                userId:true,
                name:true,
                balance:true,
                currency:true
                
            }
        })

        return NextResponse.json(
      { message: "สำเร็จ", data: account },
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