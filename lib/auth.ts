
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const jwtSecret = process.env.JWT_SECRET;

export async function authenticate(req: NextRequest) {
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set");
  }

  const token = req.cookies.get("token")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(jwtSecret));
    const userId = payload.userId;
    // มั่นใจว่า userId ที่ได้จาก JWT เป็นตัวเลขตามที่เก็บใน DB
    return typeof userId === "number" ? userId : null;
  } catch (error) {
    return null;
  }
}