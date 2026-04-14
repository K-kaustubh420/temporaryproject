import { NextResponse } from 'next/server'
import { runGooseEngine } from '@/app/lib/engine-core'

export async function POST(req: Request) {
  const { content } = await req.json();
  if (!content) return NextResponse.json({ error: 'Empty content' }, { status: 400 });

  const result = runGooseEngine(content);
  return NextResponse.json(result);
}