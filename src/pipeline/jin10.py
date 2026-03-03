#!/usr/bin/env python3
"""
jin10.py — 金十数据快讯爬虫
抓取 jin10.com 实时快讯，过滤重要信息

Usage:
    python jin10.py              # 获取最新快讯
    python jin10.py --hours 3    # 获取过去3小时
    python jin10.py --important  # 只显示重要快讯
    python jin10.py --json       # JSON 输出
"""

import argparse
import json
import os
import re
import sys
from datetime import datetime, timedelta
from pathlib import Path
from typing import Optional
import urllib.request
import urllib.error
import urllib.parse

# 缓存配置
CACHE_DIR = Path.home() / ".cache" / "will"
CACHE_FILE = CACHE_DIR / "jin10_cache.json"
CACHE_TTL_SECONDS = 180  # 3 分钟缓存

# 金十数据 API (flash news)
JIN10_API = "https://flash-api.jin10.com/get_flash_list"

# 重要关键词 - 用于过滤
IMPORTANT_KEYWORDS = [
    # 市场异动
    "涨停", "跌停", "暴涨", "暴跌", "大涨", "大跌", "创新高", "创新低",
    "熔断", "崩盘", "飙升", "跳水",
    # 贵金属/商品
    "黄金", "白银", "原油", "天然气", "铜", "铝",
    # 外汇
    "美元指数", "人民币", "汇率",
    # 地缘政治
    "特朗普", "拜登", "普京", "习近平", "战争", "制裁", "关税",
    # 央行/政策
    "美联储", "央行", "降息", "加息", "QE", "缩表", "利率",
    # 经济数据
    "非农", "CPI", "GDP", "PMI", "失业率",
    # 科技/AI
    "人工智能", "AI", "芯片", "半导体", "英伟达", "NVIDIA",
    # 重大事件
    "IPO", "收购", "并购", "破产", "违约",
]

# 来源标签映射
SOURCE_EMOJI = {
    "快讯": "📰",
    "数据": "📊",
    "要闻": "🔥",
}


def load_cache() -> Optional[dict]:
    """加载缓存（如果有效）"""
    try:
        if not CACHE_FILE.exists():
            return None
        
        with open(CACHE_FILE, 'r', encoding='utf-8') as f:
            cache = json.load(f)
        
        # 检查缓存是否过期
        cached_time = datetime.fromisoformat(cache.get('timestamp', '2000-01-01'))
        if datetime.now() - cached_time > timedelta(seconds=CACHE_TTL_SECONDS):
            return None
        
        return cache.get('data', [])
    except Exception:
        return None


def save_cache(data: list[dict]):
    """保存缓存"""
    try:
        CACHE_DIR.mkdir(parents=True, exist_ok=True)
        cache = {
            'timestamp': datetime.now().isoformat(),
            'data': data
        }
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(cache, ensure_ascii=False, fp=f)
    except Exception:
        pass  # 缓存失败不影响主功能


def fetch_flash_news(max_items: int = 50, use_cache: bool = True) -> list[dict]:
    """从金十 API 获取快讯（支持分页获取更多数据）
    
    Args:
        max_items: 最大条数
        use_cache: 是否使用缓存（默认 True）
    """
    # 尝试使用缓存
    if use_cache:
        cached = load_cache()
        if cached:
            return cached[:max_items]
    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Accept": "application/json",
        "Referer": "https://www.jin10.com/",
        "x-app-id": "bVBF4FyRTn5NJF5n",
        "x-version": "1.0.0",
    }
    
    all_items = []
    max_time = ""
    pages_needed = (max_items // 20) + 1  # 每页约20条
    
    for _ in range(min(pages_needed, 5)):  # 最多5页
        params = {"channel": "-8200"}
        if max_time:
            params["max_time"] = max_time
        
        url = f"{JIN10_API}?{urllib.parse.urlencode(params)}"
        
        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode("utf-8"))
                items = data.get("data", [])
                if not items:
                    break
                all_items.extend(items)
                max_time = items[-1].get("time", "")
                
                if len(all_items) >= max_items:
                    break
        except (urllib.error.URLError, json.JSONDecodeError) as e:
            print(f"Error fetching data: {e}", file=sys.stderr)
            break
    
    # 保存缓存
    if all_items:
        save_cache(all_items)
    
    return all_items[:max_items]


def parse_flash(item: dict) -> Optional[dict]:
    """解析单条快讯"""
    try:
        # 提取内容
        content = item.get("data", {})
        if isinstance(content, str):
            text = content
        else:
            text = content.get("content", "") or content.get("title", "")
        
        # 清理 HTML
        text = re.sub(r"<[^>]+>", "", text)
        text = text.strip()
        
        if not text:
            return None
        
        # 时间
        time_str = item.get("time", "")
        try:
            dt = datetime.strptime(time_str, "%Y-%m-%d %H:%M:%S")
        except ValueError:
            dt = datetime.now()
        
        # 判断重要性
        is_important = any(kw in text for kw in IMPORTANT_KEYWORDS)
        
        # 来源类型
        channel = item.get("channel", "")
        
        return {
            "time": dt,
            "time_str": dt.strftime("%H:%M"),
            "text": text,
            "important": is_important,
            "channel": channel,
            "id": item.get("id", ""),
        }
    except Exception:
        return None


def filter_by_time(items: list[dict], hours: float) -> list[dict]:
    """过滤指定时间范围内的快讯"""
    cutoff = datetime.now() - timedelta(hours=hours)
    return [item for item in items if item["time"] >= cutoff]


def filter_important(items: list[dict]) -> list[dict]:
    """只保留重要快讯"""
    return [item for item in items if item["important"]]


def format_output(items: list[dict], as_json: bool = False) -> str:
    """格式化输出"""
    if as_json:
        # JSON 输出
        output = []
        for item in items:
            output.append({
                "time": item["time"].isoformat(),
                "text": item["text"],
                "important": item["important"],
            })
        return json.dumps(output, ensure_ascii=False, indent=2)
    
    # 文本输出
    if not items:
        return "📭 没有符合条件的快讯"
    
    lines = []
    for item in items:
        prefix = "🔥" if item["important"] else "•"
        lines.append(f"{prefix} [{item['time_str']}] {item['text']}")
    
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(description="金十数据快讯爬虫")
    parser.add_argument("--hours", type=float, default=3, help="获取过去N小时的快讯 (default: 3)")
    parser.add_argument("--important", "-i", action="store_true", help="只显示重要快讯")
    parser.add_argument("--json", "-j", action="store_true", help="JSON 输出")
    parser.add_argument("--limit", "-n", type=int, default=50, help="最大条数 (default: 50)")
    args = parser.parse_args()
    
    # 获取数据
    raw_items = fetch_flash_news(max_items=100)
    
    # 解析
    items = []
    for raw in raw_items:
        parsed = parse_flash(raw)
        if parsed:
            items.append(parsed)
    
    # 过滤时间
    items = filter_by_time(items, args.hours)
    
    # 过滤重要性
    if args.important:
        items = filter_important(items)
    
    # 限制数量
    items = items[:args.limit]
    
    # 输出
    print(format_output(items, as_json=args.json))
    
    # 统计
    if not args.json:
        total = len(items)
        important = len([i for i in items if i["important"]])
        print(f"\n📊 共 {total} 条，重要 {important} 条")


if __name__ == "__main__":
    main()
