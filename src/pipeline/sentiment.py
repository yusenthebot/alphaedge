#!/usr/bin/env python3
"""
sentiment.py — 简单情感分析模块
基于关键词的情感分析，无需外部依赖
"""

import re
from typing import Tuple

# 情感词汇表
POSITIVE_WORDS = {
    # 英文
    'bullish', 'surge', 'soar', 'rally', 'gain', 'rise', 'jump', 'boom',
    'breakthrough', 'success', 'record', 'high', 'best', 'excellent',
    'great', 'strong', 'growth', 'profit', 'win', 'beat', 'exceed',
    'upgrade', 'outperform', 'buy', 'recommend', 'optimistic', 'positive',
    # 中文
    '上涨', '大涨', '暴涨', '飙升', '飙涨', '突破', '新高', '历史新高',
    '利好', '看涨', '看多', '强势', '成功', '增长', '盈利', '超预期',
    '获批', '通过', '达成', '签署', '合作', '扩张', '扩大',
}

NEGATIVE_WORDS = {
    # 英文
    'bearish', 'crash', 'plunge', 'drop', 'fall', 'decline', 'slump',
    'collapse', 'failure', 'low', 'worst', 'weak', 'loss', 'miss',
    'downgrade', 'underperform', 'sell', 'warning', 'risk', 'concern',
    'fear', 'panic', 'crisis', 'recession', 'default', 'bankrupt',
    # 中文
    '下跌', '大跌', '暴跌', '崩盘', '跳水', '重挫', '新低', '历史新低',
    '利空', '看跌', '看空', '弱势', '失败', '亏损', '下滑', '不及预期',
    '警告', '风险', '担忧', '恐慌', '危机', '衰退', '违约', '破产',
}

NEUTRAL_MODIFIERS = {
    # 减弱情感的词
    'may', 'might', 'could', 'possible', 'unlikely', 'uncertain',
    '可能', '或许', '预计', '预期', '传闻', '据悉',
}

INTENSIFIERS = {
    # 加强情感的词
    'very', 'extremely', 'significantly', 'dramatically', 'sharply',
    'massive', 'huge', 'major', 'critical', 'historic', 'unprecedented',
    '非常', '极其', '大幅', '剧烈', '显著', '历史性', '重大', '空前',
}

def analyze_sentiment(text: str) -> Tuple[str, float, dict]:
    """
    分析文本情感
    
    Returns:
        (sentiment, score, details)
        sentiment: 'positive', 'negative', 'neutral'
        score: -1.0 到 1.0
        details: 分析详情
    """
    if not text:
        return ('neutral', 0.0, {})
    
    text_lower = text.lower()
    
    # 英文用空格分词
    english_words = set(re.findall(r'[a-zA-Z]+', text_lower))
    
    # 对于中文，直接在文本中查找关键词
    def find_chinese_keywords(text: str, keyword_set: set) -> set:
        found = set()
        for kw in keyword_set:
            if not kw.isascii() and kw in text:  # 中文关键词
                found.add(kw)
        return found
    
    # 英文匹配
    positive_found = english_words & POSITIVE_WORDS
    negative_found = english_words & NEGATIVE_WORDS
    intensifier_found = english_words & INTENSIFIERS
    modifier_found = english_words & NEUTRAL_MODIFIERS
    
    # 中文匹配
    positive_found |= find_chinese_keywords(text, POSITIVE_WORDS)
    negative_found |= find_chinese_keywords(text, NEGATIVE_WORDS)
    intensifier_found |= find_chinese_keywords(text, INTENSIFIERS)
    modifier_found |= find_chinese_keywords(text, NEUTRAL_MODIFIERS)
    
    pos_count = len(positive_found)
    neg_count = len(negative_found)
    
    # 强化词增加权重
    intensity_boost = 1.0 + (0.3 * len(intensifier_found))
    
    # 中性修饰词减弱情感
    modifier_dampen = 1.0 - (0.2 * len(modifier_found))
    modifier_dampen = max(0.5, modifier_dampen)  # 最低 0.5
    
    # 计算得分
    if pos_count == 0 and neg_count == 0:
        score = 0.0
        sentiment = 'neutral'
    else:
        raw_score = (pos_count - neg_count) / (pos_count + neg_count)
        score = raw_score * intensity_boost * modifier_dampen
        score = max(-1.0, min(1.0, score))  # 限制范围
        
        if score > 0.1:
            sentiment = 'positive'
        elif score < -0.1:
            sentiment = 'negative'
        else:
            sentiment = 'neutral'
    
    return (sentiment, round(score, 2), {
        'positive_words': list(positive_found),
        'negative_words': list(negative_found),
        'intensifiers': list(intensifier_found),
        'modifiers': list(modifier_found),
    })

def get_sentiment_emoji(sentiment: str, score: float) -> str:
    """获取情感 emoji"""
    if sentiment == 'positive':
        if score > 0.5:
            return '🚀'
        return '📈'
    elif sentiment == 'negative':
        if score < -0.5:
            return '💥'
        return '📉'
    return '➡️'

def batch_analyze(texts: list) -> list:
    """批量分析"""
    results = []
    for text in texts:
        sentiment, score, details = analyze_sentiment(text)
        results.append({
            'text': text[:100] + '...' if len(text) > 100 else text,
            'sentiment': sentiment,
            'score': score,
            'emoji': get_sentiment_emoji(sentiment, score),
        })
    return results

# === CLI ===
if __name__ == '__main__':
    import sys
    import json
    
    if len(sys.argv) > 1:
        text = ' '.join(sys.argv[1:])
        sentiment, score, details = analyze_sentiment(text)
        emoji = get_sentiment_emoji(sentiment, score)
        
        print(f"{emoji} {sentiment.upper()} (score: {score})")
        
        if details['positive_words']:
            print(f"   📈 正面: {', '.join(details['positive_words'])}")
        if details['negative_words']:
            print(f"   📉 负面: {', '.join(details['negative_words'])}")
    else:
        # Demo
        test_texts = [
            "黄金暴涨突破5600美元，创历史新高！",
            "股市大跌，投资者恐慌抛售",
            "美联储维持利率不变，符合预期",
            "Tesla stock surged 10% on strong earnings",
            "Market crashed as recession fears grow",
        ]
        
        print("🔬 情感分析 Demo\n")
        for text in test_texts:
            sentiment, score, _ = analyze_sentiment(text)
            emoji = get_sentiment_emoji(sentiment, score)
            print(f"{emoji} [{score:+.2f}] {text}")
