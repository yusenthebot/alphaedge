"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp, TrendingDown } from "lucide-react";
import type { Signal } from "@/types/signal";

const STORAGE_KEY = "alphaedge-recent-searches";
const MAX_RECENT = 5;

function loadRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) return parsed.slice(0, MAX_RECENT);
    }
  } catch {}
  return [];
}

function saveRecent(list: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch {}
}

export default function SearchBar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [preview, setPreview] = useState<Signal | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load recent searches on mount
  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setQuery("");
      setPreview(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Keyboard shortcut: Cmd+K / Ctrl+K to open
  // (handled by parent, but Escape to close is handled here)
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  // Click outside to close
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  // Debounced preview fetch
  const fetchPreview = useCallback((ticker: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!ticker || !/^[A-Z]{1,5}$/.test(ticker)) {
      setPreview(null);
      setLoadingPreview(false);
      return;
    }
    setLoadingPreview(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/signals?tickers=${ticker}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const sig = data.signals?.[0] ?? null;
        setPreview(sig);
      } catch {
        setPreview(null);
      } finally {
        setLoadingPreview(false);
      }
    }, 400);
  }, []);

  const handleInputChange = (val: string) => {
    const upper = val.toUpperCase().replace(/[^A-Z]/g, "");
    setQuery(upper);
    fetchPreview(upper);
  };

  const navigateToTicker = useCallback((ticker: string) => {
    const t = ticker.trim().toUpperCase();
    if (!t || !/^[A-Z]{1,5}$/.test(t)) return;

    // Update recent searches
    const updated = [t, ...recent.filter((r) => r !== t)].slice(0, MAX_RECENT);
    setRecent(updated);
    saveRecent(updated);

    onClose();
    router.push(`/ticker/${t}`);
  }, [recent, onClose, router]);

  const handleSubmit = () => {
    if (query) navigateToTicker(query);
  };

  const removeRecent = (ticker: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recent.filter((r) => r !== ticker);
    setRecent(updated);
    saveRecent(updated);
  };

  if (!open) return null;

  const SIGNAL_COLORS: Record<string, string> = {
    BUY: "#00FF41",
    HOLD: "#FFB800",
    SELL: "#FF3131",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative w-full max-w-lg rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-surface)] shadow-2xl fade-in-up"
      >
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-[var(--pixel-border-dim)] px-4 py-3">
          <Search className="h-5 w-5 text-[var(--pixel-text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
            placeholder="Search any ticker... (e.g. AMZN, GOOGL)"
            maxLength={5}
            className="flex-1 bg-transparent text-sm text-[var(--pixel-text)] placeholder-[#555] outline-none"
          />
          {query && (
            <button
              onClick={() => { setQuery(""); setPreview(null); }}
              className="rounded p-0.5 text-[var(--pixel-text-muted)] transition hover:text-[var(--pixel-text)]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <kbd className="hidden rounded border border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)] px-1.5 py-0.5 text-[10px] text-[#555] sm:inline">
            ESC
          </kbd>
        </div>

        {/* Preview result */}
        {query && (
          <div className="border-b border-[var(--pixel-border-dim)] px-4 py-3">
            {loadingPreview ? (
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 animate-pulse rounded-none bg-[#2A2A35]" />
                <div className="space-y-1.5">
                  <div className="h-4 w-24 animate-pulse rounded bg-[#2A2A35]" />
                  <div className="h-3 w-32 animate-pulse rounded bg-[#2A2A35]" />
                </div>
              </div>
            ) : preview ? (
              <button
                onClick={() => navigateToTicker(preview.ticker)}
                className="flex w-full items-center justify-between rounded-none bg-[var(--pixel-bg)] p-3 transition hover:bg-[var(--pixel-surface-2)]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-black text-[var(--pixel-text)]">{preview.ticker}</span>
                  <span
                    className="rounded-md px-2 py-0.5 text-xs font-black tracking-widest"
                    style={{
                      background: (SIGNAL_COLORS[preview.signal] ?? "#A0A0A0") + "22",
                      color: SIGNAL_COLORS[preview.signal] ?? "#A0A0A0",
                      border: `1px solid ${(SIGNAL_COLORS[preview.signal] ?? "#A0A0A0")}55`,
                    }}
                  >
                    {preview.signal}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[var(--pixel-text)]">${preview.price.toFixed(2)}</span>
                  <span className={`flex items-center gap-0.5 text-sm font-semibold ${preview.change >= 0 ? "text-[#00FF41]" : "text-[#FF3131]"}`}>
                    {preview.change >= 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    {preview.change >= 0 ? "+" : ""}{preview.change.toFixed(2)}%
                  </span>
                  <span className="text-xs text-[#555]">Strength {preview.strength}</span>
                </div>
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="flex w-full items-center gap-3 rounded-none bg-[var(--pixel-bg)] p-3 text-left transition hover:bg-[var(--pixel-surface-2)]"
              >
                <Search className="h-4 w-4 text-[#555]" />
                <span className="text-sm text-[var(--pixel-text-off)]">
                  Look up <span className="font-bold text-[var(--pixel-text)]">{query}</span>
                </span>
              </button>
            )}
          </div>
        )}

        {/* Recent searches */}
        {recent.length > 0 && (
          <div className="px-4 py-3">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-[var(--pixel-text-muted)]">
              <Clock className="h-3 w-3" />
              Recent
            </div>
            <div className="flex flex-wrap gap-2">
              {recent.map((ticker) => (
                <button
                  key={ticker}
                  onClick={() => navigateToTicker(ticker)}
                  className="group/chip flex items-center gap-1.5 rounded-none border border-[var(--pixel-border-dim)] bg-[var(--pixel-bg)] px-3 py-1.5 text-xs font-semibold text-[var(--pixel-text-off)] transition hover:border-[#00FF41]/30 hover:bg-[var(--pixel-surface-2)] hover:text-[var(--pixel-text)]"
                >
                  {ticker}
                  <span
                    onClick={(e) => removeRecent(ticker, e)}
                    className="rounded-none p-0.5 text-[var(--pixel-text-muted)] opacity-0 transition hover:bg-[#2A2A35] hover:text-[#FF3131] group-hover/chip:opacity-100"
                  >
                    <X className="h-2.5 w-2.5" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Hint */}
        <div className="border-t border-[var(--pixel-border-dim)] px-4 py-2.5 text-[10px] text-[#333]">
          Type a ticker symbol and press Enter to view full analysis
        </div>
      </div>
    </div>
  );
}
