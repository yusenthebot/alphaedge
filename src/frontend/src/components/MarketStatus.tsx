"use client";

import { useEffect, useState } from "react";

function getMarketStatus(): { open: boolean; label: string; next: string } {
  const now = new Date();
  // Convert to ET
  const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
  const h = et.getHours();
  const m = et.getMinutes();
  const day = et.getDay(); // 0=Sun, 6=Sat
  const mins = h * 60 + m;

  if (day === 0 || day === 6) {
    return { open: false, label: "Market Closed", next: "Opens Monday 9:30 AM ET" };
  }
  if (mins >= 9 * 60 + 30 && mins < 16 * 60) {
    const closeIn = 16 * 60 - mins;
    const ch = Math.floor(closeIn / 60);
    const cm = closeIn % 60;
    return { open: true, label: "Market Open", next: `Closes in ${ch}h ${cm}m` };
  }
  if (mins < 9 * 60 + 30) {
    const openIn = 9 * 60 + 30 - mins;
    return { open: false, label: "Pre-Market", next: `Opens in ${openIn}m` };
  }
  return { open: false, label: "After Hours", next: "Opens tomorrow 9:30 AM ET" };
}

export function MarketStatus() {
  const [status, setStatus] = useState(getMarketStatus());

  useEffect(() => {
    const iv = setInterval(() => setStatus(getMarketStatus()), 30_000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        className={`relative flex h-2 w-2 ${status.open ? "" : ""}`}
      >
        {status.open && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-none bg-[#00FF41] opacity-60" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-none ${
            status.open ? "bg-[#00FF41]" : "bg-[#666]"
          }`}
        />
      </span>
      <span className={status.open ? "text-[#00FF41]" : "text-[var(--pixel-text-muted)]"}>
        {status.label}
      </span>
      <span className="text-[var(--pixel-text-muted)]">· {status.next}</span>
    </div>
  );
}
