import { NextResponse } from "next/server";

const BACKEND_URL = process.env.ALPHAEDGE_API_URL || "http://localhost:8765";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/alerts`, {
      next: { revalidate: 120 },
    });

    if (!res.ok) {
      throw new Error(`Backend returned ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.error("[api/alerts] backend error:", err);
    return NextResponse.json(
      { error: "Alerts backend unavailable", alerts: [], count: 0 },
      { status: 503 }
    );
  }
}
