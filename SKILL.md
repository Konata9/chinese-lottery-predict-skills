---
name: chinese-lottery-predict
description: 根据往期彩票中奖结果预测下一期彩票中奖号码，并给出推荐。当用户询问“帮我预测下一期双色球中奖号码”，“帮我推荐下一期大乐透中奖号码”时，使用此技能。
---

# chinese-lottery-predict

从中彩网的历史数据中分析出每期彩票的中奖号码，根据分析结果预测下一期彩票的中奖号码。

## Prerequisites

- WebSearch tool available
- Playwright installed
- Internet connection

## Workflow

### Input

User provides:
- **LotteryType** (required): The type of lottery to predict (e.g., "双色球", "大乐透")
- **Funds** (optional): The funds user want to pay.(e.g., "20元"), default is "20元"
- **Language** (optional): Output language, defaults to Chinese (zh-CN)

### History data fetch

Use Playwright get the history data of the specified lottery type.
- 双色球：
  - https://www.zhcw.com/kjxx/ssq/
  - https://www.cwl.gov.cn/ygkj/wqkjgg/ssq/
- 大乐透：
  - https://www.zhcw.com/kjxx/dlt/
  - https://www.lottery.gov.cn/kj/kjlb.html?dlt

Compare the history data make sure history data is complete and correct.

If can not find the history data, use WebSearch tool to search for the latest history data.

Goal: Analyze the historical data to predict the next lottery draw.

### Output Format

Generate structured material document:

```markdown
# {LotteryType} 预测建议

## 收集时间
{timestamp}

## 历史数据分析
{siteaddress}

## 下期开奖时间
{nextlotterydraw}

## 号码预测
根据历史数据分析，预测下一期彩票的中奖号码组。

- {lotterytype} 中奖号码预测组：
  - 红球：{predictedrednumbers} 蓝球：{predictedbluenumbers}
  - 红球：{predictedrednumbers} 蓝球：{predictedbluenumbers}
  - 红球：{predictedrednumbers} 蓝球：{predictedbluenumbers}
  - ... 

## 购彩建议
根据预测结果，建议用户在 {funds} 的前提下购买 {lotterytype} 彩票。
可以按以下方式购买：
- 建议1：...
- 建议2：...

注意：以上结果由 AI 预测，不构成任何购买建议。请理性考虑后购买。
```

## Execution Steps

1. **Receive lotterytype** from user
2. **Use Playwright tool to get the history data of the specified lottery type from given site.**
3. **Get history data from site**
4. **Analyze history data**
5. **Predict next lottery numbers**

## Example

User: `帮我预测下一期双色球中奖号码`

Expected behavior:
1. Search "https://www.zhcw.com/kjxx/ssq/"
2. Analyze history data to predict the next lottery draw.
3. Generate structured material report

## Tips
- Always note the source URL for credibility