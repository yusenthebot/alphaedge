#!/usr/bin/env python3
"""
Stock Price Checker
快速查看股票价格 (Yahoo Finance)
"""

import json
import argparse
import urllib.request
from datetime import datetime

SHORTCUTS = {
    'mag7': ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA'],
    'ai': ['NVDA', 'AMD', 'MSFT', 'GOOGL', 'META', 'PLTR'],
    'chip': ['NVDA', 'AMD', 'INTC', 'TSM', 'AVGO', 'QCOM'],
    'robot': ['ISRG', 'ABB', 'ROK', 'TER'],
    'cn': ['BABA', 'JD', 'PDD', 'NIO', 'XPEV', 'LI', 'BIDU'],
    'idx': ['^GSPC', '^DJI', '^IXIC', '^VIX'],
    'crypto': ['BTC-USD', 'ETH-USD', 'SOL-USD'],
}

def get_quote(symbol: str) -> dict:
    """获取股票报价"""
    url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=2d"
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read().decode())
    except Exception as e:
        return {'symbol': symbol, 'error': str(e)}
    
    result = data.get('chart', {}).get('result', [])
    if not result:
        return {'symbol': symbol, 'error': 'No data'}
    
    meta = result[0].get('meta', {})
    
    current = meta.get('regularMarketPrice', 0)
    prev_close = meta.get('chartPreviousClose', meta.get('previousClose', 0))
    
    change = change_pct = 0
    if prev_close and current:
        change = current - prev_close
        change_pct = (change / prev_close) * 100
    
    return {
        'symbol': meta.get('symbol', symbol),
        'name': meta.get('shortName', '')[:25],
        'price': current,
        'change': change,
        'change_pct': change_pct,
        'currency': meta.get('currency', 'USD'),
        'market_state': meta.get('marketState', ''),
    }

def format_quote(q: dict) -> str:
    if 'error' in q:
        return f"❌ {q['symbol']}: {q['error']}"
    
    arrow = '📈' if q['change_pct'] > 0.1 else '📉' if q['change_pct'] < -0.1 else '➖'
    sign = '+' if q['change_pct'] > 0 else ''
    
    price = f"{q['price']:.2f}" if q['price'] < 1000 else f"{q['price']:,.0f}"
    change = f"{sign}{q['change']:.2f} ({sign}{q['change_pct']:.2f}%)"
    name = f" {q['name']}" if q['name'] else ''
    
    return f"{arrow} **{q['symbol']}**{name}: {price} {change}"

def main():
    parser = argparse.ArgumentParser(description='Stock Price Checker')
    parser.add_argument('symbols', nargs='*', help='股票代码或快捷方式 (mag7/ai/chip/cn/idx/crypto)')
    parser.add_argument('--list', action='store_true', help='列出快捷方式')
    parser.add_argument('--json', action='store_true', help='JSON 输出')
    
    args = parser.parse_args()
    
    if args.list:
        print("📑 快捷方式:\n")
        for name, syms in SHORTCUTS.items():
            print(f"  {name}: {', '.join(syms)}")
        return
    
    if not args.symbols:
        args.symbols = ['idx']
    
    symbols = []
    for s in args.symbols:
        if s.lower() in SHORTCUTS:
            symbols.extend(SHORTCUTS[s.lower()])
        else:
            symbols.append(s.upper())
    symbols = list(dict.fromkeys(symbols))
    
    quotes = [get_quote(s) for s in symbols]
    
    if args.json:
        print(json.dumps(quotes, indent=2, ensure_ascii=False))
        return
    
    print(f"📊 股票报价 ({datetime.now().strftime('%H:%M')})\n")
    for q in quotes:
        print(format_quote(q))

if __name__ == '__main__':
    main()
