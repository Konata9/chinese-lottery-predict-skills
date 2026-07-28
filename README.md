# 中文彩票号码推荐 Skill
[![skills.sh](https://skills.sh/b/konata9/chinese-lottery-predict-skills)](https://skills.sh/konata9/chinese-lottery-predict-skills)

该仓库用于基于真实开奖数据，为中国彩票生成仅供娱乐的号码推荐：

- 双色球（SSQ）
- 大乐透（DLT）

**建议配合 Claude Code/OpenCode 等 Agent 使用。**

当前仓库包含：

- 面向 AI 的 skill 定义：[SKILL.md](SKILL.md)

## 安装

```bash
npx skills add https://github.com/konata9/chinese-lottery-predict-skills --skill chinese-lottery-predict

# 全局安装
npx skills add https://github.com/konata9/chinese-lottery-predict-skills --skill chinese-lottery-predict -g
```

## 说明

当前 skill 的正式要求是：

- 必须使用真实数据
- 不允许使用模拟数据
- 如果无法获取真实数据，必须直接报错终止
- 用户未提供预算时，默认按 `10 元` 处理
- 按 `2 元 / 组` 计算，默认 `10 元` 时至少输出 `5` 组号码

## 风险提示

彩票开奖具有随机性。所有推荐内容仅供娱乐参考，不得表述为保证中奖或保证准确。

## 仓库结构

```text
.
├── SKILL.md
├── README.md
├── CHANGELOG.md
└── references/
    └── data-sources.md
```

## 数据获取策略

skill 获取真实数据时应按以下优先级尝试：

1. `WebSearch`
2. `WebFetch`
3. `duckducksearch`
4. `tavily-search`

如果以上方式都无法获得可校验的真实开奖数据，则应直接终止，不允许退回模拟数据。

## 参考资料

- 数据来源与校验规则：[references/data-sources.md](references/data-sources.md)

## License

MIT License
