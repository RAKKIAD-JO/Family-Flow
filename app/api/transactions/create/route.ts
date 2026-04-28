import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { db } from "@/lib/db";
import { authenticate } from "@/lib/auth";

const createTransactionSchema = z.object({
  amount: z.coerce.number().positive(),
  description: z.string().trim().min(1).max(500).optional(),
  date: z.coerce.date().optional(),
  isPersonal: z.coerce.boolean().optional().default(true),
  accountId: z.coerce.number().int().positive(),
  categoryId: z.coerce.number().int().positive(),
  tags: z.array(z.string().trim().min(1).max(50)).max(20).optional().default([]),
});

export async function POST(req: NextRequest) {
  try {
    const userId = await authenticate(req);
    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const data = createTransactionSchema.parse(body);

    const account = await db.accounts.findFirst({
      where: { account_id: data.accountId, userId, deletedAt: null },
      select: { account_id: true, balance: true, currency: true },
    });

    if (!account) {
      return NextResponse.json(
        { message: "ไม่พบบัญชี หรือคุณไม่มีสิทธิ์เข้าถึง" },
        { status: 404 },
      );
    }

    const category = await db.categories.findUnique({
      where: { category_id: data.categoryId },
      select: { category_id: true, type: true, name: true },
    });

    if (!category) {
      return NextResponse.json(
        { message: "ไม่พบหมวดหมู่ (category)" },
        { status: 404 },
      );
    }

    const normalizedTags = [
      ...new Set(
        (data.tags ?? [])
          .map((t) => t.trim().toLowerCase())
          .filter((t) => t.length > 0),
      ),
    ];

    const result = await db.$transaction(async (tx) => {
      const transaction = await tx.transactions.create({
        data: {
          amount: data.amount,
          description: data.description,
          date: data.date ?? new Date(),
          isPersonal: data.isPersonal,
          userId,
          categoryId: category.category_id,
          accountId: account.account_id,
        },
      });

      const balanceDelta = category.type === "INCOME" ? data.amount : -data.amount;

      const updatedAccount = await tx.accounts.update({
        where: { account_id: account.account_id },
        data: { balance: { increment: balanceDelta } },
        select: { account_id: true, balance: true, currency: true },
      });

      if (normalizedTags.length > 0) {
        const tagRows = await Promise.all(
          normalizedTags.map((name) =>
            tx.tag.upsert({
              where: { name },
              update: {},
              create: { name },
              select: { tag_id: true },
            }),
          ),
        );

        // --- เพิ่มการ Log เพื่อ Debug ---
  console.log("DEBUG: transactionId คือ", transaction.transaction_id);
  console.log("DEBUG: tagRows ที่ได้มาคือ", JSON.stringify(tagRows));

        await tx.transactionTag.createMany({
          data: tagRows.map((t) => ({
            transactionId: transaction.transaction_id,
            tagId: t.tag_id,
          })),
          skipDuplicates: true,
        });
      }

  
      const fullTransaction = await tx.transactions.findUnique({
        where: { transaction_id: transaction.transaction_id },
        include: {
          category: { select: { category_id: true, name: true, type: true } },
          account: { select: { account_id: true, name: true, currency: true } },
          tags: { include: { tag: true } },
        },
      });

      return { transaction: fullTransaction, account: updatedAccount };
    });

    return NextResponse.json(
      { message: "สร้างรายการสำเร็จ", data: result },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: "Invalid request", errors: error.flatten() },
        { status: 400 },
      );
    }

    console.error("Create transaction error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
