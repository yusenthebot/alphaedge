import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.ALPHAEDGE_API_URL || "http://localhost:8765";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const days = new URL(req.url).searchParams.get("days") || "7";
  try {
    const res = await fetch(`${BACKEND_URL}/api/history/${ticker}?days=${days}`, {
      next: { revalidate: 300 },
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ ticker, data: [] }, { status: 503 });
  }
}
