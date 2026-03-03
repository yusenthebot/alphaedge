import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.ALPHAEDGE_API_URL || "http://localhost:8765";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  try {
    const res = await fetch(`${BACKEND_URL}/api/history/${ticker}?days=7`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ ticker, data: [] }, { status: 503 });
  }
}
