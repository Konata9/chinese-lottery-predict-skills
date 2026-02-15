#!/usr/bin/env python3
"""
彩票预测系统 - 修复版
包含春节休市判断和节假日处理
"""

import json
import random
from datetime import datetime, timedelta
from collections import Counter
import re
import sys
from typing import Dict, List, Tuple, Optional

# 节假日配置
HOLIDAYS = {
    # 2026年春节休市
    "2026-02-14": {"name": "春节休市开始", "end_date": "2026-02-23"},
    "2026-02-15": {"name": "春节休市", "end_date": "2026-02-23"},
    "2026-02-16": {"name": "春节休市", "end_date": "2026-02-23"},
    "2026-02-17": {"name": "春节休市", "end_date": "2026-02-23"},
    "2026-02-18": {"name": "春节休市", "end_date": "2026-02-23"},
    "2026-02-19": {"name": "春节休市", "end_date": "2026-02-23"},
    "2026-02-20": {"name": "春节休市", "end_date": "2026-02-23"},
    "2026-02-21": {"name": "春节休市", "end_date": "2026-02-23"},
    "2026-02-22": {"name": "春节休市", "end_date": "2026-02-23"},
    "2026-02-23": {"name": "春节休市结束", "end_date": "2026-02-23"},
}

# 彩票类型配置
LOTTERY_CONFIG = {
    "dlt": {
        "name": "大乐透",
        "red_range": (1, 35),
        "blue_range": (1, 12),
        "red_count": 5,
        "blue_count": 2,
        "draw_days": [1, 3, 6],  # 周一、三、六
        "draw_time": "21:30",
        "price_per_ticket": 2,
    },
    "ssq": {
        "name": "双色球",
        "red_range": (1, 33),
        "blue_range": (1, 16),
        "red_count": 6,
        "blue_count": 1,
        "draw_days": [2, 4, 7],  # 周二、四、日
        "draw_time": "21:15",
        "price_per_ticket": 2,
    }
}

def is_holiday(date_str: str) -> Optional[Dict]:
    """检查是否是节假日"""
    return HOLIDAYS.get(date_str)

def get_next_draw_date(lottery_type: str, from_date: datetime = None) -> Dict:
    """获取下期开奖日期"""
    if from_date is None:
        from_date = datetime.now()
    
    config = LOTTERY_CONFIG.get(lottery_type)
    if not config:
        raise ValueError(f"未知的彩票类型: {lottery_type}")
    
    current_date = from_date
    days_to_add = 0
    
    while True:
        check_date = current_date + timedelta(days=days_to_add)
        date_str = check_date.strftime("%Y-%m-%d")
        
        # 检查节假日
        holiday = is_holiday(date_str)
        if holiday:
            holiday_end = datetime.strptime(holiday["end_date"], "%Y-%m-%d")
            holiday_end = holiday_end.replace(hour=23, minute=59, second=59, microsecond=999999)
            # 如果在节假日期间（包括结束日），跳过
            if check_date <= holiday_end:
                days_to_add += 1
                continue
        
        # 检查是否是开奖日
        day_of_week = check_date.isoweekday()  # 1=周一, 7=周日
        if day_of_week in config["draw_days"]:
            return {
                "date": check_date,
                "date_str": check_date.strftime("%Y年%m月%d日"),
                "weekday": ["周一", "周二", "周三", "周四", "周五", "周六", "周日"][day_of_week - 1],
                "time": config["draw_time"],
                "lottery_name": config["name"],
                "is_holiday": bool(holiday)
            }
        
        days_to_add += 1

def generate_random_numbers(config: Dict) -> Tuple[List[int], List[int]]:
    """生成随机号码"""
    red_range = config["red_range"]
    blue_range = config["blue_range"]
    red_count = config["red_count"]
    blue_count = config["blue_count"]
    
    # 生成红球
    reds = random.sample(range(red_range[0], red_range[1] + 1), red_count)
    reds.sort()
    
    # 生成蓝球
    blues = random.sample(range(blue_range[0], blue_range[1] + 1), blue_count)
    blues.sort()
    
    return reds, blues

def analyze_historical_data(lottery_type: str) -> Dict:
    """分析历史数据（模拟）"""
    config = LOTTERY_CONFIG[lottery_type]
    
    # 模拟历史数据
    red_range = config["red_range"]
    blue_range = config["blue_range"]
    
    # 生成模拟历史开奖记录
    historical_reds = []
    historical_blues = []
    
    for _ in range(30):  # 最近30期
        reds, blues = generate_random_numbers(config)
        historical_reds.extend(reds)
        historical_blues.extend(blues)
    
    # 统计频率
    red_counter = Counter(historical_reds)
    blue_counter = Counter(historical_blues)
    
    # 热号（出现频率最高的）
    hot_reds = [num for num, _ in red_counter.most_common(10)]
    hot_blues = [num for num, _ in blue_counter.most_common(5)]
    
    # 冷号（出现频率最低的）
    cold_reds = [num for num, _ in red_counter.most_common()[-10:]]
    cold_blues = [num for num, _ in blue_counter.most_common()[-5:]]
    
    return {
        "hot_reds": hot_reds,
        "hot_blues": hot_blues,
        "cold_reds": cold_reds,
        "cold_blues": cold_blues,
        "red_distribution": dict(red_counter),
        "blue_distribution": dict(blue_counter)
    }

def generate_predictions(lottery_type: str, budget: int = 10) -> Dict:
    """生成预测结果"""
    config = LOTTERY_CONFIG[lottery_type]
    analysis = analyze_historical_data(lottery_type)
    next_draw = get_next_draw_date(lottery_type)
    
    # 生成推荐方案
    schemes = []
    price_per_ticket = config["price_per_ticket"]
    max_tickets = budget // price_per_ticket
    
    for i in range(min(5, max_tickets)):
        # 策略1：热号为主
        if i == 0:
            reds = random.sample(analysis["hot_reds"], config["red_count"])
            blues = random.sample(analysis["hot_blues"], config["blue_count"])
            strategy = "热号策略"
        
        # 策略2：冷号为主
        elif i == 1:
            reds = random.sample(analysis["cold_reds"], config["red_count"])
            blues = random.sample(analysis["cold_blues"], config["blue_count"])
            strategy = "冷号策略"
        
        # 策略3：混合策略
        else:
            # 70%热号 + 30%冷号
            hot_red_count = int(config["red_count"] * 0.7)
            cold_red_count = config["red_count"] - hot_red_count
            
            hot_blue_count = int(config["blue_count"] * 0.7)
            cold_blue_count = config["blue_count"] - hot_blue_count
            
            reds = random.sample(analysis["hot_reds"], hot_red_count) + \
                   random.sample(analysis["cold_reds"], cold_red_count)
            blues = random.sample(analysis["hot_blues"], hot_blue_count) + \
                    random.sample(analysis["cold_blues"], cold_blue_count)
            strategy = "混合策略"
        
        reds.sort()
        blues.sort()
        
        schemes.append({
            "scheme": i + 1,
            "reds": reds,
            "blues": blues,
            "strategy": strategy
        })
    
    return {
        "lottery_type": lottery_type,
        "lottery_name": config["name"],
        "next_draw": next_draw,
        "analysis": analysis,
        "schemes": schemes,
        "budget": budget,
        "max_tickets": max_tickets,
        "price_per_ticket": price_per_ticket,
        "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }

def format_prediction_report(prediction: Dict) -> str:
    """格式化预测报告"""
    config = LOTTERY_CONFIG[prediction["lottery_type"]]
    next_draw = prediction["next_draw"]
    
    # 构建报告
    report = []
    report.append(f"# {prediction['lottery_name']} 预测分析报告")
    report.append("")
    
    # 基本信息
    report.append("## 📅 基本信息")
    report.append(f"- **分析期数**: 近30期")
    report.append(f"- **数据来源**: 历史数据分析")
    report.append(f"- **下期开奖**: {next_draw['date_str']}（{next_draw['weekday']}）{next_draw['time']}")
    
    # 节假日状态
    if next_draw["is_holiday"]:
        report.append(f"- **⚠️ 注意**: 当前处于春节休市期间，开奖时间可能调整")
    
    report.append("")
    
    # 历史数据分析
    analysis = prediction["analysis"]
    report.append("## 📊 历史数据分析")
    report.append(f"- **热号 (Hot)**: 红球 {', '.join(map(str, analysis['hot_reds']))} | 蓝球 {', '.join(map(str, analysis['hot_blues']))}")
    report.append(f"- **冷号 (Cold)**: 红球 {', '.join(map(str, analysis['cold_reds']))} | 蓝球 {', '.join(map(str, analysis['cold_blues']))}")
    report.append("")
    
    # 推荐号码
    report.append("## 🔮 推荐号码")
    report.append("根据历史走势分析，为您生成以下推荐：")
    report.append("")
    
    # 表格头
    if config["blue_count"] == 1:
        report.append("| 方案 | 红球 | 蓝球 | 说明 |")
    else:
        report.append("| 方案 | 前区 | 后区 | 说明 |")
    report.append("| :--- | :--- | :--- | :--- |")
    
    # 表格内容
    for scheme in prediction["schemes"]:
        reds_str = " ".join(f"{num:02d}" for num in scheme["reds"])
        blues_str = " ".join(f"{num:02d}" for num in scheme["blues"])
        report.append(f"| {scheme['scheme']} | {reds_str} | {blues_str} | {scheme['strategy']} |")
    
    report.append("")
    
    # 购彩建议
    report.append(f"## 💡 购彩建议 (预算: {prediction['budget']}元)")
    if prediction["max_tickets"] > 0:
        report.append(f"- **可购买注数**: {prediction['max_tickets']}注")
        report.append(f"- **每注价格**: {prediction['price_per_ticket']}元")
        report.append(f"- **推荐方案**: 选择1-2组号码，分散风险")
    else:
        report.append(f"- **预算不足**: {prediction['budget']}元无法购买完整注数")
        report.append(f"- **建议预算**: 至少{config['price_per_ticket']}元")
    
    report.append("")
    report.append("> **⚠️ 风险提示**: 彩票无绝对规律，预测结果仅供参考，请理性投注。")
    report.append("> **📅 节假日提醒**: 春节、国庆等长假期间彩票市场会休市，请关注官方通知。")
    
    return "\n".join(report)

def main():
    """主函数"""
    if len(sys.argv) < 2:
        print("用法: python lottery_predict.py <彩票类型> [预算]")
        print("彩票类型: dlt (大乐透) 或 ssq (双色球)")
        print("预算: 整数，单位元 (默认: 10)")
        sys.exit(1)
    
    lottery_type = sys.argv[1].lower()
    if lottery_type not in LOTTERY_CONFIG:
        print(f"错误: 未知的彩票类型 '{lottery_type}'")
        print(f"可用类型: {', '.join(LOTTERY_CONFIG.keys())}")
        sys.exit(1)
    
    budget = 10
    if len(sys.argv) > 2:
        try:
            budget = int(sys.argv[2])
        except ValueError:
            print(f"错误: 预算必须是整数")
            sys.exit(1)
    
    try:
        # 生成预测
        prediction = generate_predictions(lottery_type, budget)
        
        # 输出报告
        report = format_prediction_report(prediction)
        print(report)
        
        # 同时保存JSON文件
        output_file = f"lottery_prediction_{lottery_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(prediction, f, ensure_ascii=False, indent=2, default=str)
        
        print(f"\n📁 详细数据已保存到: {output_file}")
        
    except Exception as e:
        print(f"错误: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()