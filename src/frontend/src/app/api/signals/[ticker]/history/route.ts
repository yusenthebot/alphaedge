import { type NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.ALPHAEDGE_API_URL || "http://localhost:8765";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "20";

  try {
    const res = await fetch(
      `${BACKEND_URL}/api/signals/${ticker}/history?limit=${limit}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error(`[api/signals/${ticker}/history] backend error:`, err);
    return NextResponse.json(
      { ticker: ticker.toUpperCase(), history: [], count: 0 },
      { status: 503 }
    );
  }
}
