import "server-only";

import { cache } from "react";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";

const jwtSecret = process.env.JWT_SECRET;

type Session = {
  userId: number;
};

async function readSession(): Promise<Session | null> {
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not set");
  }

  const token = (await cookies()).get("token")?.value;
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(jwtSecret),
    );
    const userId = payload.userId;

    if (typeof userId !== "number") {
      return null;
    }

    return { userId };
  } catch {
    return null;
  }
}

export const verifySession = cache(async () => {
  const session = await readSession();

  if (!session) {
    redirect("/");
  }

  return session;
});

export const getCurrentUser = cache(async () => {
  const session = await verifySession();

  const user = await db.users.findUnique({
    where: { user_id: session.userId },
    select: {
      user_id: true,
      name: true,
      email: true,
    },
  });

  if (!user) {
    redirect("/");
  }

  return user;
});
