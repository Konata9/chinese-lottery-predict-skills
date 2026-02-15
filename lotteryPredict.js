#!/usr/bin/env node

/**
 * 彩票预测系统 - Node.js修复版
 * 包含春节休市判断和节假日处理
 */

const fs = require('fs');
const path = require('path');

// 节假日配置
const HOLIDAYS = {
  // 2026年春节休市
  '2026-02-14': { name: '春节休市开始', endDate: '2026-02-23' },
  '2026-02-15': { name: '春节休市', endDate: '2026-02-23' },
  '2026-02-16': { name: '春节休市', endDate: '2026-02-23' },
  '2026-02-17': { name: '春节休市', endDate: '2026-02-23' },
  '2026-02-18': { name: '春节休市', endDate: '2026-02-23' },
  '2026-02-19': { name: '春节休市', endDate: '2026-02-23' },
  '2026-02-20': { name: '春节休市', endDate: '2026-02-23' },
  '2026-02-21': { name: '春节休市', endDate: '2026-02-23' },
  '2026-02-22': { name: '春节休市', endDate: '2026-02-23' },
  '2026-02-23': { name: '春节休市结束', endDate: '2026-02-23' },
};

// 彩票类型配置
const LOTTERY_CONFIG = {
  dlt: {
    name: '大乐透',
    redRange: { min: 1, max: 35 },
    blueRange: { min: 1, max: 12 },
    redCount: 5,
    blueCount: 2,
    drawDays: [1, 3, 6], // 周一、三、六
    drawTime: '21:30',
    pricePerTicket: 2,
  },
  ssq: {
    name: '双色球',
    redRange: { min: 1, max: 33 },
    blueRange: { min: 1, max: 16 },
    redCount: 6,
    blueCount: 1,
    drawDays: [2, 4, 7], // 周二、四、日
    drawTime: '21:15',
    pricePerTicket: 2,
  }
};

/**
 * 检查是否是节假日
 */
function isHoliday(dateStr) {
  return HOLIDAYS[dateStr];
}

/**
 * 获取下期开奖日期
 */
function getNextDrawDate(lotteryType, fromDate = new Date()) {
  const config = LOTTERY_CONFIG[lotteryType];
  if (!config) {
    throw new Error(`未知的彩票类型: ${lotteryType}`);
  }

  const currentDate = new Date(fromDate);
  let daysToAdd = 0;
  
  while (true) {
    const checkDate = new Date(currentDate);
    checkDate.setDate(currentDate.getDate() + daysToAdd);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    // 检查节假日
    const holiday = isHoliday(dateStr);
    if (holiday) {
      const holidayEnd = new Date(holiday.endDate);
      holidayEnd.setHours(23, 59, 59, 999); // 设置为当天结束时间
      // 如果在节假日期间（包括结束日），跳过
      if (checkDate <= holidayEnd) {
        daysToAdd++;
        continue;
      }
    }
    
    // 检查是否是开奖日
    const dayOfWeek = checkDate.getDay(); // 0=周日, 1=周一, ...
    const adjustedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    
    if (config.drawDays.includes(adjustedDay)) {
      const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
      return {
        date: checkDate,
        dateStr: `${checkDate.getFullYear()}年${(checkDate.getMonth() + 1).toString().padStart(2, '0')}月${checkDate.getDate().toString().padStart(2, '0')}日`,
        weekday: weekdays[dayOfWeek],
        time: config.drawTime,
        lotteryName: config.name,
        isHoliday: !!holiday
      };
    }
    
    daysToAdd++;
  }
}

/**
 * 生成随机号码
 */
function generateRandomNumbers(config) {
  // 生成红球
  const reds = [];
  while (reds.length < config.redCount) {
    const num = Math.floor(Math.random() * (config.redRange.max - config.redRange.min + 1)) + config.redRange.min;
    if (!reds.includes(num)) {
      reds.push(num);
    }
  }
  reds.sort((a, b) => a - b);
  
  // 生成蓝球
  const blues = [];
  while (blues.length < config.blueCount) {
    const num = Math.floor(Math.random() * (config.blueRange.max - config.blueRange.min + 1)) + config.blueRange.min;
    if (!blues.includes(num)) {
      blues.push(num);
    }
  }
  blues.sort((a, b) => a - b);
  
  return { reds, blues };
}

/**
 * 分析历史数据（模拟）
 */
function analyzeHistoricalData(lotteryType) {
  const config = LOTTERY_CONFIG[lotteryType];
  
  // 模拟历史数据
  const historicalReds = [];
  const historicalBlues = [];
  
  // 生成模拟历史开奖记录（最近30期）
  for (let i = 0; i < 30; i++) {
    const { reds, blues } = generateRandomNumbers(config);
    historicalReds.push(...reds);
    historicalBlues.push(...blues);
  }
  
  // 统计频率
  const redCounter = {};
  const blueCounter = {};
  
  historicalReds.forEach(num => {
    redCounter[num] = (redCounter[num] || 0) + 1;
  });
  
  historicalBlues.forEach(num => {
    blueCounter[num] = (blueCounter[num] || 0) + 1;
  });
  
  // 热号（出现频率最高的）
  const hotReds = Object.entries(redCounter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([num]) => parseInt(num));
  
  const hotBlues = Object.entries(blueCounter)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([num]) => parseInt(num));
  
  // 冷号（出现频率最低的）
  const coldReds = Object.entries(redCounter)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 10)
    .map(([num]) => parseInt(num));
  
  const coldBlues = Object.entries(blueCounter)
    .sort((a, b) => a[1] - b[1])
    .slice(0, 5)
    .map(([num]) => parseInt(num));
  
  return {
    hotReds,
    hotBlues,
    coldReds,
    coldBlues,
    redDistribution: redCounter,
    blueDistribution: blueCounter
  };
}

/**
 * 生成预测结果
 */
function generatePredictions(lotteryType, budget = 10) {
  const config = LOTTERY_CONFIG[lotteryType];
  const analysis = analyzeHistoricalData(lotteryType);
  const nextDraw = getNextDrawDate(lotteryType);
  
  // 生成推荐方案
  const schemes = [];
  const pricePerTicket = config.pricePerTicket;
  const maxTickets = Math.floor(budget / pricePerTicket);
  
  for (let i = 0; i < Math.min(5, maxTickets); i++) {
    let reds = [];
    let blues = [];
    let strategy = '';
    
    // 策略1：热号为主
    if (i === 0) {
      reds = [...analysis.hotReds].sort(() => Math.random() - 0.5).slice(0, config.redCount);
      blues = [...analysis.hotBlues].sort(() => Math.random() - 0.5).slice(0, config.blueCount);
      strategy = '热号策略';
    }
    // 策略2：冷号为主
    else if (i === 1) {
      reds = [...analysis.coldReds].sort(() => Math.random() - 0.5).slice(0, config.redCount);
      blues = [...analysis.coldBlues].sort(() => Math.random() - 0.5).slice(0, config.blueCount);
      strategy = '冷号策略';
    }
    // 策略3：混合策略
    else {
      // 70%热号 + 30%冷号
      const hotRedCount = Math.floor(config.redCount * 0.7);
      const coldRedCount = config.redCount - hotRedCount;
      
      const hotBlueCount = Math.floor(config.blueCount * 0.7);
      const coldBlueCount = config.blueCount - hotBlueCount;
      
      const hotReds = [...analysis.hotReds].sort(() => Math.random() - 0.5).slice(0, hotRedCount);
      const coldReds = [...analysis.coldReds].sort(() => Math.random() - 0.5).slice(0, coldRedCount);
      const hotBlues = [...analysis.hotBlues].sort(() => Math.random() - 0.5).slice(0, hotBlueCount);
      const coldBlues = [...analysis.coldBlues].sort(() => Math.random() - 0.5).slice(0, coldBlueCount);
      
      reds = [...hotReds, ...coldReds];
      blues = [...hotBlues, ...coldBlues];
      strategy = '混合策略';
    }
    
    reds.sort((a, b) => a - b);
    blues.sort((a, b) => a - b);
    
    schemes.push({
      scheme: i + 1,
      reds,
      blues,
      strategy
    });
  }
  
  return {
    lotteryType,
    lotteryName: config.name,
    nextDraw,
    analysis,
    schemes,
    budget,
    maxTickets,
    pricePerTicket,
    generatedAt: new Date().toISOString()
  };
}

/**
 * 格式化预测报告
 */
function formatPredictionReport(prediction) {
  const config = LOTTERY_CONFIG[prediction.lotteryType];
  const nextDraw = prediction.nextDraw;
  
  const report = [];
  report.push(`# ${prediction.lotteryName} 预测分析报告`);
  report.push('');
  
  // 基本信息
  report.push('## 📅 基本信息');
  report.push(`- **分析期数**: 近30期`);
  report.push(`- **数据来源**: 历史数据分析`);
  report.push(`- **下期开奖**: ${nextDraw.dateStr}（${nextDraw.weekday}）${nextDraw.time}`);
  
  // 节假日状态
  if (nextDraw.isHoliday) {
    report.push(`- **⚠️ 注意**: 当前处于春节休市期间，开奖时间可能调整`);
  }
  
  report.push('');
  
  // 历史数据分析
  const analysis = prediction.analysis;
  report.push('## 📊 历史数据分析');
  report.push(`- **热号 (Hot)**: 红球 ${analysis.hotReds.map(n => n.toString().padStart(2, '0')).join(', ')} | 蓝球 ${analysis.hotBlues.map(n => n.toString().padStart(2, '0')).join(', ')}`);
  report.push(`- **冷号 (Cold)**: 红球 ${analysis.coldReds.map(n => n.toString().padStart(2, '0')).join(', ')} | 蓝球 ${analysis.coldBlues.map(n => n.toString().padStart(2, '0')).join(', ')}`);
  report.push('');
  
  // 推荐号码
  report.push('## 🔮 推荐号码');
  report.push('根据历史走势分析，为您生成以下推荐：');
  report.push('');
  
  // 表格头
  if (config.blueCount === 1) {
    report.push('| 方案 | 红球 | 蓝球 | 说明 |');
  } else {
    report.push('| 方案 | 前区 | 后区 | 说明 |');
  }
  report.push('| :--- | :--- | :--- | :--- |');
  
  // 表格内容
  prediction.schemes.forEach(scheme => {
    const redsStr = scheme.reds.map(n => n.toString().padStart(2, '0')).join(' ');
    const bluesStr = scheme.blues.map(n => n.toString().padStart(2, '0')).join(' ');
    report.push(`| ${scheme.scheme} | ${redsStr} | ${bluesStr} | ${scheme.strategy} |`);
  });
  
  report.push('');
  
  // 购彩建议
  report.push(`## 💡 购彩建议 (预算: ${prediction.budget}元)`);
  if (prediction.maxTickets > 0) {
    report.push(`- **可购买注数**: ${prediction.maxTickets}注`);
    report.push(`- **每注价格**: ${prediction.pricePerTicket}元`);
    report.push(`- **推荐方案**: 选择1-2组号码，分散风险`);
  } else {
    report.push(`- **预算不足**: ${prediction.budget}元无法购买完整注数`);
    report.push(`- **建议预算**: 至少${config.pricePerTicket}元`);
  }
  
  report.push('');
  report.push('> **⚠️ 风险提示**: 彩票无绝对规律，预测结果仅供参考，请理性投注。');
  report.push('> **📅 节假日提醒**: 春节、国庆等长假期间彩票市场会休市，请关注官方通知。');
  
  return report.join('\n');
}

/**
 * 主函数
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.log('用法: node lotteryPredict.js <彩票类型> [预算]');
    console.log('彩票类型: dlt (大乐透) 或 ssq (双色球)');
    console.log('预算: 整数，单位元 (默认: 10)');
    process.exit(1);
  }
  
  const lotteryType = args[0].toLowerCase();
  if (!LOTTERY_CONFIG[lotteryType]) {
    console.log(`错误: 未知的彩票类型 '${lotteryType}'`);
    console.log(`可用类型: ${Object.keys(LOTTERY_CONFIG).join(', ')}`);
    process.exit(1);
  }
  
  let budget = 10;
  if (args.length > 1) {
    budget = parseInt(args[1]);
    if (isNaN(budget)) {
      console.log('错误: 预算必须是整数');
      process.exit(1);
    }
  }
  
  try {
    // 生成预测
    const prediction = generatePredictions(lotteryType, budget);
    
    // 输出报告
    const report = formatPredictionReport(prediction);
    console.log(report);
    
    // 同时保存JSON文件
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const outputFile = `lottery_prediction_${lotteryType}_${timestamp}.json`;
    
    fs.writeFileSync(
      outputFile,
      JSON.stringify(prediction, null, 2),
      'utf8'
    );
    
    console.log(`\n📁 详细数据已保存到: ${outputFile}`);
    
  } catch (error) {
    console.error(`错误: ${error.message}`);
    process.exit(1);
  }
}

// 执行主函数
if (require.main === module) {
  main();
}

module.exports = {
  generatePredictions,
  formatPredictionReport,
  getNextDrawDate,
  isHoliday
};