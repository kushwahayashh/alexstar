import { NextResponse } from "next/server";
import { getDb, initDb } from "@/lib/db";

export async function GET() {
  await initDb();
  const sql = getDb();
  const todos = await sql`SELECT id, text, completed FROM todos ORDER BY created_at DESC`;
  return NextResponse.json(todos);
}

export async function POST(req: Request) {
  const { text } = await req.json();
  if (!text?.trim()) {
    return NextResponse.json({ error: "Text is required" }, { status: 400 });
  }

  const sql = getDb();
  const [todo] = await sql`INSERT INTO todos (text) VALUES (${text.trim()}) RETURNING id, text, completed`;
  return NextResponse.json(todo, { status: 201 });
}
