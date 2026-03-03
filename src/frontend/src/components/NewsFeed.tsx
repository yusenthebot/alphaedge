"use client";

import { useEffect, useState, useCallback } from "react";

interface NewsItem {
  text: string;
  created_at: string;
  time_str: string;
  is_important: boolean;
}

const POLL_INTERVAL = 120_000; // 2 minutes
const MAX_VISIBLE = 15;

export default function NewsFeed() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchNews = useCallback(async () => {
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNews(data.news ?? []);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("news fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const iv = setInterval(fetchNews, POLL_INTERVAL);
    return () => clearInterval(iv);
  }, [fetchNews]);

  return (
    <div className="rounded-2xl border border-[#2A2A35] bg-[#0D0D0D] p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-black uppercase tracking-widest text-[#A0A0A0]">
          Jin10 Live
        </h3>
        {lastUpdated && (
          <span className="text-[10px] text-[#444]">
            {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>

      {/* News list */}
      <div className="max-h-[400px] space-y-1 overflow-y-auto pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#2A2A35]">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex animate-pulse items-start gap-2 rounded-lg px-2 py-2"
            >
              <div className="mt-1 h-3 w-10 rounded bg-[#1C1C24]" />
              <div className="h-3 flex-1 rounded bg-[#1C1C24]" />
            </div>
          ))
        ) : news.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#444]">
            No news available
          </div>
        ) : (
          news.slice(0, MAX_VISIBLE).map((item, i) => (
            <div
              key={`${item.created_at}-${i}`}
              className={`flex items-start gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-[#15151B] ${
                item.is_important ? "text-white" : "text-[#A0A0A0]"
              }`}
            >
              <span className="mt-0.5 shrink-0 text-[11px] tabular-nums text-[#555]">
                {item.time_str}
              </span>
              {item.is_important && (
                <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-[#EF4444]" />
              )}
              <span className="text-xs leading-relaxed">
                {item.text.length > 100
                  ? item.text.slice(0, 100) + "..."
                  : item.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
