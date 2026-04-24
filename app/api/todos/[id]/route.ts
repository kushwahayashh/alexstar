import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getDb();
  const [todo] = await sql`UPDATE todos SET completed = NOT completed WHERE id = ${Number(id)} RETURNING id, text, completed`;

  if (!todo) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(todo);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sql = getDb();
  await sql`DELETE FROM todos WHERE id = ${Number(id)}`;
  return NextResponse.json({ ok: true });
}
