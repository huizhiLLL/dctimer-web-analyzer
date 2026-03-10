# DCTimer Web Analyzer 数据流设计（B5）

## 1. 目标

这份文档定义网站内部从“解析数据库”到“生成页面内容”的完整数据流。

核心目的：
- 明确每一层该做什么
- 避免统计逻辑散落在组件里
- 避免页面直接依赖原始 SQLite 表结构
- 让图表、文案、成就、筛选都共享同一套中间数据

---

## 2. 总体分层

建议把数据流拆成 5 层：

1. **原始数据库层**
2. **统一业务模型层**
3. **筛选结果层**
4. **统计聚合层**
5. **页面视图模型层**

整体关系：

```txt
SQLite .db
  -> parser
  -> business entities
  -> filters applied
  -> aggregations / insights
  -> page view models
  -> UI rendering
```

---

## 3. 第 1 层：原始数据库层

来源：DCTimer 导出的 `.db` 文件。

特点：
- 直接反映 Android SQLite 表结构
- 有固定结果表和扩展结果表
- 字段命名受 App 内部实现影响
- 不适合直接给页面使用

代表结构：

```ts
type RawSessionRow = {
  id: number
  name: string | null
  type: number | null
  mulp: number | null
  ra: number | null
  sorting: number | null
}

type RawSolveRow = {
  id: number
  sid?: number
  rest: number
  resp: number
  resd: number
  scr: string | null
  time: string | null
  note: string | null
  p1?: number | null
  p2?: number | null
  p3?: number | null
  p4?: number | null
  p5?: number | null
  p6?: number | null
  moves?: string | null
}
```

职责：
- 只负责被 parser 读取
- 不直接暴露给图表和组件

---

## 4. 第 2 层：统一业务模型层

这一层是整个网站的数据核心。

目标：
- 把所有结果表合并成统一 solve 列表
- 把 session 信息和项目类型解析好
- 把 penalty / DNF / 时间字段标准化

### 4.1 SessionEntity

```ts
type PuzzleTypeInfo = {
  code: number
  idx: number | null
  sub: number | null
  categoryName: string | null
  itemName: string | null
  displayName: string
}

type SessionEntity = {
  id: number
  name: string
  puzzleTypeCode: number | null
  puzzle: PuzzleTypeInfo | null
  multiPhase: number
  averageSetting: number | null
  sorting: number
  solveCount: number
  firstSolveAt: string | null
  lastSolveAt: string | null
}
```

### 4.2 SolveEntity

```ts
type SolveEntity = {
  id: number
  sessionId: number
  baseTimeMs: number
  penalty: 0 | 1 | 2
  isDnf: boolean
  finalTimeMs: number | null
  scramble: string | null
  recordedAt: string | null
  note: string | null
  phases: number[]
  moves: string | null
  sourceTable: string
}
```

### 4.3 建议补充的派生字段

为了后续聚合更稳定，建议在进入统计层前，再补一层轻量派生字段：

```ts
type EnrichedSolveEntity = SolveEntity & {
  recordedYear: number | null
  recordedMonth: string | null
  recordedDate: string | null
  recordedHour: number | null
  recordedWeekday: number | null
  hasNote: boolean
  hasMoves: boolean
  phaseCount: number
}
```

理由：
- 年、月、日、小时这些字段会被很多统计重复使用
- 提前展开后，聚合层会简单很多
- 这些仍然属于“业务事实”，还不算页面专用数据

---

## 5. 第 3 层：筛选结果层

这一层的目标是：
**根据用户选择的年份、分组、低样本过滤等条件，得到一份“当前分析范围内”的标准数据集。**

### 5.1 筛选输入

```ts
type AnalyzerFilter = {
  year: number | 'all'
  includedSessionIds: number[]
  excludeLowSample: boolean
  minSolveCount: number
  keyword: string
  puzzleCodes: number[]
}
```

### 5.2 筛选输出

```ts
type FilteredDataset = {
  filter: AnalyzerFilter
  sessions: SessionEntity[]
  solves: EnrichedSolveEntity[]
  includedSessionMap: Map<number, SessionEntity>
}
```

### 5.3 筛选顺序建议

建议统一顺序，避免结果不一致：

1. 先筛 session
   - 按 `includedSessionIds`
   - 按关键词
   - 按 puzzle code
   - 按低样本过滤
2. 再筛 solve
   - sessionId 属于选中集合
   - 时间落在所选年份或范围内
3. 最后回填筛选后的 session 列表
   - 只保留当前仍有成绩的数据，或保留空分组按产品策略决定

### 5.4 低样本过滤建议

这里要注意一个小细节：

低样本过滤最好基于**当前时间范围内的解次**，而不是全库总解次。

比如：
- 某个 session 历史总共 300 次
- 但今年只有 2 次

如果当前分析是“2025 年年报”，那它应该被视作低样本分组。

---

## 6. 第 4 层：统计聚合层

这是最关键的一层喵。

它不关心 UI 长什么样，只负责把筛选后的数据变成：
- 指标
- 趋势
- 分组对比
- 高光事件
- 文案素材

建议再拆成 5 个子模块：

1. summary metrics
2. timeline stats
3. session stats
4. achievements / highlights
5. narrative inputs

---

## 7. 汇总指标模型

用于总览页顶部 KPI 卡片。

```ts
type SummaryMetrics = {
  totalSolves: number
  totalValidSolves: number
  totalDnf: number
  dnfRate: number
  totalPlus2: number
  plus2Rate: number
  activeDays: number
  activeMonths: number
  bestSingleMs: number | null
  meanMs: number | null
  medianMs: number | null
  favoriteSessionId: number | null
  favoritePuzzleCode: number | null
  firstSolveAt: string | null
  lastSolveAt: string | null
}
```

计算口径建议：
- `totalSolves`：全部成绩，包括 DNF
- `totalValidSolves`：非 DNF
- `dnfRate = totalDnf / totalSolves`
- `plus2Rate = totalPlus2 / totalSolves`
- `meanMs`：只统计有效成绩
- `medianMs`：只统计有效成绩

---

## 8. 时间趋势模型

用于月度趋势图、活跃热力图、时段分布图。

### 8.1 月度统计

```ts
type MonthlyStats = {
  month: string
  solveCount: number
  validSolveCount: number
  dnfCount: number
  plus2Count: number
  activeDays: number
  bestSingleMs: number | null
  meanMs: number | null
  medianMs: number | null
  dnfRate: number
}
```

### 8.2 日期热力图

```ts
type DailyActivityPoint = {
  date: string
  solveCount: number
}
```

### 8.3 小时分布

```ts
type HourlyStats = {
  hour: number
  solveCount: number
  meanMs: number | null
}
```

### 8.4 星期分布

```ts
type WeekdayStats = {
  weekday: number
  solveCount: number
  activeDays: number
}
```

---

## 9. 分组画像模型

用于“各分组占比 / 对比 / 主力分组”页面。

```ts
type SessionStats = {
  sessionId: number
  sessionName: string
  puzzleTypeCode: number | null
  puzzleDisplayName: string | null
  solveCount: number
  validSolveCount: number
  dnfCount: number
  dnfRate: number
  bestSingleMs: number | null
  meanMs: number | null
  medianMs: number | null
  activeDays: number
  firstSolveAt: string | null
  lastSolveAt: string | null
}
```

如果后面要做“项目层级聚合”，可以再补：

```ts
type PuzzleStats = {
  puzzleTypeCode: number | null
  puzzleDisplayName: string
  solveCount: number
  validSolveCount: number
  dnfRate: number
  bestSingleMs: number | null
  meanMs: number | null
  activeDays: number
}
```

---

## 10. 成长与稳定性模型

用于“这一年有没有进步、是否更稳”。

### 10.1 月度成长

```ts
type ProgressStats = {
  month: string
  bestSingleMs: number | null
  medianMs: number | null
  meanMs: number | null
  stabilityScore: number | null
}
```

### 10.2 稳定性定义建议

首版不建议做太复杂，可以先用：
- 有效成绩标准差
- 中位绝对偏差 MAD
- IQR（四分位距）

推荐首版优先：
- 对外展示：`stabilityScore`（0-100）
- 内部计算：先用标准差 / IQR 组合

例如：

```ts
type StabilityDetail = {
  stdDevMs: number | null
  iqrMs: number | null
  score: number | null
}
```

---

## 11. 高光事件模型

用于“年报味”的成就卡、故事卡。

```ts
type HighlightEvent = {
  id: string
  type:
    | 'best_single'
    | 'best_month'
    | 'most_active_day'
    | 'most_active_month'
    | 'longest_streak'
    | 'breakthrough'
    | 'most_stable_period'
  title: string
  description: string
  timestamp: string | null
  priority: number
  relatedSessionId?: number
  relatedMonth?: string
  value?: number | string
}
```

### 11.1 首版高光建议

首版就先做这些，最稳：
- 年度最佳单次
- 单月最高产
- 单日最高产
- 最长连续活跃天数
- 最稳定月份
- 最常练分组

以后再加：
- 爆发期
- 首次 sub-X
- 多次连续 PB

---

## 12. 文案素材模型

文案生成不要直接从原始 solve 算，最好从“聚合事实”生成。

```ts
type NarrativeFacts = {
  summary: SummaryMetrics
  topSession: SessionStats | null
  topPuzzle: PuzzleStats | null
  bestMonth: MonthlyStats | null
  mostActiveMonth: MonthlyStats | null
  mostStableMonth: ProgressStats | null
  highlightEvents: HighlightEvent[]
}
```

这样文案模块只需要：
- 看哪些事实存在
- 套模板或规则生成句子

例如：
- “这一年你完成了 {totalSolves} 次复原。”
- “你最偏爱的分组是 {sessionName}，总共练了 {solveCount} 次。”
- “{month} 是你最投入的一个月。”

---

## 13. 第 5 层：页面视图模型层

这是最接近 UI 的一层。

目标：
- 把统计结果加工成页面直接可用的结构
- 尽量让组件只负责展示

### 13.1 总览页 ViewModel

```ts
type OverviewPageModel = {
  heroTitle: string
  heroSubtitle: string
  kpiCards: Array<{
    key: string
    label: string
    value: string
    accent?: string
  }>
  storyCards: Array<{
    id: string
    title: string
    body: string
    icon?: string
    rarity?: 'common' | 'rare' | 'epic' | 'legendary'
  }>
}
```

### 13.2 趋势页 ViewModel

```ts
type TrendPageModel = {
  monthlySolveSeries: Array<[string, number]>
  monthlyMedianSeries: Array<[string, number | null]>
  heatmapPoints: Array<[string, number]>
  hourlySeries: Array<[number, number]>
}
```

### 13.3 分组页 ViewModel

```ts
type SessionProfilePageModel = {
  ranking: Array<{
    sessionId: number
    name: string
    puzzle: string
    solveCount: number
    bestSingleText: string
    meanText: string
    dnfRateText: string
  }>
}
```

重点：
- 这里可以格式化文本
- 但不要再做业务统计

---

## 14. 状态管理建议

建议全站围绕一个 analyzer store 运作。

```ts
type AnalyzerState = {
  parseResult: ParseDctimerDbResult | null
  filter: AnalyzerFilter
  filteredDataset: FilteredDataset | null
  summaryMetrics: SummaryMetrics | null
  monthlyStats: MonthlyStats[]
  sessionStats: SessionStats[]
  puzzleStats: PuzzleStats[]
  highlightEvents: HighlightEvent[]
  narrativeFacts: NarrativeFacts | null
}
```

推荐用 computed / memo 化形成数据管线：

```txt
parseResult
 -> filter
 -> filteredDataset
 -> aggregations
 -> page view models
```

这样当用户改筛选条件时：
- 不需要重新解析 db
- 只需要重新做筛选与聚合

---

## 15. 推荐模块边界

可以按下面方式拆代码：

```txt
src/
  domain/
    parser/
    puzzle/
  analysis/
    filters/
    summary/
    timeline/
    sessions/
    highlights/
    narrative/
  view-models/
    overview/
    trends/
    sessions/
  stores/
    analyzer.ts
```

这样更清晰：
- `domain` 负责“事实”
- `analysis` 负责“统计”
- `view-models` 负责“页面消费”

---

## 16. 推荐执行顺序

B5 之后，真正开发时建议按这个顺序推进：

1. 先实现 parser，产出 `SessionEntity[]` + `SolveEntity[]`
2. 再实现 enriched solve 派生字段
3. 再实现 filters
4. 再实现 summary / monthly / session stats
5. 再实现 highlight / narrative
6. 最后做 page view models 和 UI

原因：
- 越往上层越依赖下层稳定
- 先把“真数据 -> 真统计”打通，页面开发会轻松很多

---

## 17. 首版必须打通的最小闭环

首版最小闭环建议是：

```txt
.db 文件
 -> parser
 -> sessions + solves
 -> 筛选
 -> summary metrics + monthly stats + session stats
 -> overview page / trend page / session page
```

也就是说，高光和叙事虽然重要，但可以作为“第二波增强”。

---

## 18. 最终结论

这套数据流的核心思想是：

- **parser 只做解析与归一化**
- **analysis 只做统计与洞察**
- **view-model 只做页面消费结构转换**
- **UI 不直接碰原始数据库结构**

这样后面无论加：
- 新图表
- 新年报卡片
- 新文案规则
- 新分享页

都不会把底层弄乱。
