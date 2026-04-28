import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth";
import { formatPagination, parsePagination } from "@/lib/pagination";
import { Prisma } from "@prisma/client";

const listSchema = z.object({
  accountId: z.coerce.number().int().positive().optional(),
  categoryId: z.coerce.number().int().positive().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const sp = req.nextUrl.searchParams;
    const parsed = listSchema.parse({
      accountId: sp.get("accountId") ?? undefined,
      categoryId: sp.get("categoryId") ?? undefined,
      from: sp.get("from") ?? undefined,
      to: sp.get("to") ?? undefined,
    });

    const pagination = parsePagination(sp);

    const where: Prisma.TransactionsWhereInput = {
      userId,
    };

    if (parsed.accountId) where.accountId = parsed.accountId;
    if (parsed.categoryId) where.categoryId = parsed.categoryId;
    if (parsed.from || parsed.to) {
      where.date = {};
      if (parsed.from) where.date.gte = parsed.from;
      if (parsed.to) where.date.lte = parsed.to;
    }

    const skip = (pagination.page - 1) * pagination.pageSize;

    const [total, items] = await Promise.all([
      db.transactions.count({ where }),
      db.transactions.findMany({
        where,
        orderBy: { date: "desc" },
        skip,
        take: pagination.pageSize,
        include: {
          category: { select: { category_id: true, name: true, type: true } },
          account: { select: { account_id: true, name: true, currency: true } },
          tags: { include: { tag: true } },
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "สำเร็จ",
        data: items,
        pagination: formatPagination(pagination.page, pagination.pageSize, total),
      },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid request", errors: error.flatten() },
        { status: 400 },
      );
    }

    console.error("List transactions error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}

