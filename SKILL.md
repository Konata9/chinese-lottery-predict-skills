---
name: chinese-lottery-predict
description: Predicts the next lottery numbers for Chinese lotteries like Double Color Ball (双色球) and Super Lotto (大乐透). Use this skill when user asks to predict lottery results in Chinese (e.g., "预测双色球", "大乐透推荐").
---

# Chinese Lottery Predict

Analyzes historical data from major Chinese lottery websites to provide statistical predictions for the next draw.

## Prerequisites

- **WebSearch**: To fetch the latest lottery results.
- **Python (Optional)**: For statistical analysis of number frequency (Hot/Cold numbers).

## Workflow

### 1. Input Parsing
The user will provide:
- **Lottery Type**: e.g., "双色球" (Double Color Ball) or "大乐透" (Super Lotto).
- **Funds** (Optional): Budget for the purchase (default: "10元").

### 2. Data Retrieval Strategy
采用四级数据获取策略，确保数据准确性和可靠性：

#### 第一级：直接数据抓取（首选）
1. **多数据源并行获取**：
   - 中彩网 (zhcw.com) - 官方权威数据
   - 500彩票网 (500.com) - 行业领先平台
   - 新浪彩票 (sina.com.cn) - 门户网站数据

2. **数据验证机制**：
   - 每个数据源必须返回完整的号码集合（红球33个，蓝球16个）
   - 至少需要2个数据源验证通过
   - 数据不一致时采用多数原则

#### 第二级：搜索引擎抓取（备用）
1. **当直接抓取失败时**，使用搜索引擎获取数据
2. **搜索策略**：
   - 使用 DuckDuckGo、Bing、百度等多引擎搜索
   - 关键词：`"{彩票类型}" 最新开奖结果`、`"{彩票类型}" 历史号码`
   - 从搜索结果页面提取结构化数据

#### 第三级：WebSearch工具（如有配置）
1. **如果配置了WebSearch API密钥**，使用官方搜索工具
2. **搜索关键词**：
   - `"{彩票类型}" 近50期开奖结果`
   - `site:zhcw.com {彩票类型} 往期`

#### 第四级：静态数据分析（兜底）
1. 使用内置的历史数据样本
2. 基于统计学原理生成建议
3. 明确标注数据来源为"模拟数据"

#### 数据质量保障
1. **交叉验证**：至少2个独立数据源验证
2. **完整性检查**：必须包含所有可能号码
3. **时效性检查**：数据应包含近期开奖结果
4. **一致性检查**：热号/冷号趋势应基本一致

### 3. Data Analysis
Analyze the retrieved data to identify:
- **Hot Numbers**: Numbers that appeared most frequently in the last 30 draws.
- **Cold Numbers**: Numbers that haven't appeared in a long time.
- **Omitted Numbers**: Current omission count for each number.

### 4. Prediction Generation
Generate 1-5 sets of numbers based on a mix of Hot and Cold numbers.
*Disclaimer: Lottery draws are independent random events. Predictions are for entertainment only.*

### 5. Output Generation
Generate a report in Chinese using the following format.

#### Output Template

```markdown
# {LotteryType} 预测分析报告

## 📅 基本信息
- **分析期数**: 近 {count} 期
- **数据来源**: {source_domain}
- **下期开奖**: {next_draw_date}

## 📊 历史数据分析
- **热号 (Hot)**: {hot_numbers}
- **冷号 (Cold)**: {cold_numbers}

## 🔮 推荐号码
根据历史走势分析，为您生成以下推荐：

| 方案 | 红球 | 蓝球/后区 | 说明 |
| :--- | :--- | :--- | :--- |
| 1 | {reds} | {blues} | {reason} |
| 2 | {reds} | {blues} | {reason} |

## 💡 购彩建议 (预算: {funds})
{suggestion_text}

> **⚠️ 风险提示**: 彩票无绝对规律，预测结果仅供参考，请理性投注。
```

## Implementation Examples

### Python Implementation for Data Retrieval
```python
import requests
import re
from collections import Counter

def fetch_lottery_data(lottery_type="双色球"):
    '''从多个数据源获取彩票数据'''
    data_sources = [
        {'name': '中彩网', 'url': 'https://www.zhcw.com/ssq/'},
        {'name': '500彩票网', 'url': 'https://kaijiang.500.com/ssq.shtml'},
    ]
    
    all_reds = []
    all_blues = []
    
    for source in data_sources:
        try:
            response = requests.get(source['url'], headers={'User-Agent': 'Mozilla/5.0'}, timeout=15)
            if response.status_code == 200:
                numbers = re.findall(r'(\\d{2})', response.text)
                reds = [n for n in numbers if n.isdigit() and 1 <= int(n) <= 33]
                blues = [n for n in numbers if n.isdigit() and 1 <= int(n) <= 16]
                
                if len(set(reds)) >= 30 and len(set(blues)) >= 14:
                    all_reds.extend(reds)
                    all_blues.extend(blues)
        except:
            continue
    
    return all_reds, all_blues

def analyze_numbers(reds, blues):
    '''分析热号和冷号'''
    red_counter = Counter(reds)
    blue_counter = Counter(blues)
    
    hot_reds = [num for num, _ in red_counter.most_common(10)]
    hot_blues = [num for num, _ in blue_counter.most_common(5)]
    cold_reds = [num for num, _ in red_counter.most_common()[-10:]]
    cold_blues = [num for num, _ in blue_counter.most_common()[-5:]]
    
    return {
        'hot_reds': hot_reds,
        'hot_blues': hot_blues,
        'cold_reds': cold_reds,
        'cold_blues': cold_blues
    }
```

### DuckDuckGo Search Implementation
```python
import requests
from bs4 import BeautifulSoup

def duckduckgo_search(query, max_results=5):
    '''使用DuckDuckGo进行搜索'''
    url = 'https://html.duckduckgo.com/html/'
    params = {'q': query, 'kl': 'us-en', 'kp': '1'}
    
    response = requests.get(url, params=params, headers={'User-Agent': 'Mozilla/5.0'}, timeout=15)
    if response.status_code == 200:
        soup = BeautifulSoup(response.text, 'html.parser')
        results = []
        
        for result in soup.find_all('div', class_='result')[:max_results]:
            title_elem = result.find('a', class_='result__title')
            link_elem = result.find('a', class_='result__url')
            snippet_elem = result.find('a', class_='result__snippet')
            
            if title_elem and link_elem:
                results.append({
                    'title': title_elem.get_text(strip=True),
                    'url': link_elem.get_text(strip=True),
                    'snippet': snippet_elem.get_text(strip=True)[:200] if snippet_elem else ''
                })
        
        return results
    return []
```

## Usage Examples

**User**: "预测下期双色球"
**Action**: 
1. 使用多数据源获取最新开奖数据
2. 分析热号/冷号分布
3. 生成预测报告

**User**: "大乐透，买50块钱的"
**Action**: 
1. 获取大乐透历史数据
2. 根据50元预算生成2-3组推荐号码
3. 提供购彩策略建议

**User**: "用DuckDuckGo搜索双色球数据"
**Action**: 调用DuckDuckGo搜索功能获取补充数据

## 修复和更新内容

### 重要修复：春节休市处理
**问题**：之前的预测系统忽略了春节等节假日休市安排，导致给出错误的开奖时间。

**修复内容**：
1. **添加节假日判断逻辑**：包含2026年春节休市安排（2月14日-2月23日）
2. **正确计算开奖时间**：休市结束后找到第一个开奖日
3. **节假日提醒**：在预测报告中明确标注节假日状态

### 新增功能
1. **Node.js实现**：创建了 `lotteryPredict.js`，符合此方的技术偏好
2. **Python实现**：保留了 `lottery_predict.py` 作为备选
3. **节假日配置**：可扩展的节假日系统，支持未来年份更新
4. **预算计算**：根据预算自动计算可购买注数
5. **多种策略**：热号策略、冷号策略、混合策略

### 使用示例

```bash
# 预测大乐透，预算10元
node lotteryPredict.js dlt 10

# 预测双色球，预算20元
node lotteryPredict.js ssq 20

# 使用Python版本
python lottery_predict.py dlt 10
```

### 输出示例
```
# 大乐透 预测分析报告

## 📅 基本信息
- **分析期数**: 近30期
- **数据来源**: 历史数据分析
- **下期开奖**: 2026年02月25日（周三）21:30
- **⚠️ 注意**: 当前处于春节休市期间，开奖时间可能调整

## 📊 历史数据分析
- **热号 (Hot)**: 红球 05, 12, 18, 23, 27, 30, 33, 08, 15, 21 | 蓝球 03, 07, 09, 11, 05
- **冷号 (Cold)**: 红球 01, 04, 06, 10, 13, 17, 20, 24, 28, 32 | 蓝球 02, 04, 06, 08, 10

## 🔮 推荐号码
根据历史走势分析，为您生成以下推荐：

| 方案 | 前区 | 后区 | 说明 |
| :--- | :--- | :--- | :--- |
| 1 | 05 12 18 23 27 | 03 07 | 热号策略 |
| 2 | 01 04 06 10 13 | 02 04 | 冷号策略 |
| 3 | 05 12 18 20 24 | 03 08 | 混合策略 |

## 💡 购彩建议 (预算: 10元)
- **可购买注数**: 5注
- **每注价格**: 2元
- **推荐方案**: 选择1-2组号码，分散风险

> **⚠️ 风险提示**: 彩票无绝对规律，预测结果仅供参考，请理性投注。
> **📅 节假日提醒**: 春节、国庆等长假期间彩票市场会休市，请关注官方通知。
```

## Changelog

### v1.2.0 (2026-02-15) - 春节休市修复版
- **Fixed**: 添加春节休市判断逻辑，正确计算开奖时间
- **Added**: Node.js实现版本 (lotteryPredict.js)
- **Added**: 节假日配置系统，支持未来年份扩展
- **Added**: 预算计算和购彩建议
- **Added**: 多种预测策略（热号、冷号、混合）
- **Enhanced**: 输出报告包含节假日状态提醒
- **Enhanced**: 数据保存为JSON文件供后续分析

### v1.1.0 (2026-02-06)
- **Improved**: Enhanced data retrieval strategy with four-level fallback system
- **Added**: DuckDuckGo search as alternative to WebSearch
- **Added**: Multi-source verification for data accuracy
- **Added**: Python implementation examples
- **Enhanced**: Data quality checks and validation mechanisms
