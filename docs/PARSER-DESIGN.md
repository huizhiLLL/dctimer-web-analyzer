# DCTimer Web Analyzer 前端解析器设计草案

## 1. 目标

解析器负责在浏览器本地读取 DCTimer 导出的 SQLite `.db` 文件，并将原始表结构转换为统一、可供页面与统计模块使用的业务数据模型。

要求：
- 纯前端
- 不上传数据
- 对旧版本数据库具备一定兼容能力
- 解析结果适合后续筛选、聚合、图表、文案生成

---

## 2. 解析器职责范围

解析器负责：
- 读取 SQLite 文件
- 探测数据库 schema
- 校验是否为 DCTimer 导出数据库
- 解析 `sessiontb`
- 解析固定结果表与扩展结果表
- 合并为统一的 session / solve 列表
- 归一化 penalty / DNF / 多阶段 / recordedAt
- 生成基础数据库概览信息
- 提供错误与警告信息

解析器不负责：
- 页面 UI 渲染
- 高层图表配置
- 年度故事文案生成
- 分享图导出

---

## 3. 模块拆分建议

```ts
/db
  sql-engine.ts          // SQLite WASM 初始化与查询封装
  schema-inspector.ts    // 表结构探测
  dctimer-validator.ts   // DCTimer 数据库识别
  session-parser.ts      // sessiontb 解析
  solve-parser.ts        // result 表解析
  normalizer.ts          // 统一归一化逻辑
  puzzle-type.ts         // type 编码解析与映射
  parser.ts              // 对外总入口
```

---

## 4. 对外接口草案

## 4.1 输入

```ts
type ParseDctimerDbInput = {
  file: File
  locale?: 'zh-CN' | 'en'
}
```

## 4.2 输出

```ts
type ParseDctimerDbResult = {
  meta: DatabaseMeta
  sessions: SessionEntity[]
  solves: SolveEntity[]
  warnings: ParserWarning[]
  errors: ParserError[]
}
```

---

## 5. 数据结构草案

## 5.1 元信息

```ts
type DatabaseMeta = {
  fileName: string
  fileSize: number
  schemaVersion: number | null
  tableNames: string[]
  sessionCount: number
  solveCount: number
  yearRange: number[]
  importedAt: string
}
```

## 5.2 解析警告与错误

```ts
type ParserWarning = {
  code:
    | 'MISSING_OPTIONAL_COLUMN'
    | 'UNKNOWN_PUZZLE_TYPE'
    | 'INVALID_TIME_STRING'
    | 'UNKNOWN_RESULT_TABLE'
    | 'PARTIAL_PARSE'
  message: string
  detail?: Record<string, unknown>
}

type ParserError = {
  code:
    | 'INVALID_SQLITE_FILE'
    | 'NOT_DCTIMER_DB'
    | 'MISSING_SESSION_TABLE'
    | 'READ_FAILED'
  message: string
  detail?: Record<string, unknown>
}
```

## 5.3 Session 模型

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

## 5.4 Solve 模型

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

---

## 6. schema 探测策略

解析前应先获取：
- 所有表名
- 每张表的字段名

建议查询：

```sql
SELECT name FROM sqlite_master WHERE type='table';
PRAGMA table_info(sessiontb);
PRAGMA table_info(resulttb);
```

### 必备校验
- 是否存在 `sessiontb`
- 是否至少存在一张结果表：
  - `resulttb`
  - `result2...result15`
  - `resultstb`

### 可选字段探测
- `sessiontb.sorting`
- `moves`
- `p1~p6`
- `note`
- `time`

若缺少可选字段：
- 发出 warning
- 使用默认值或空值降级

---

## 7. DCTimer 数据识别策略

只靠文件名不可靠。

建议综合判断：
- 文件可被 SQLite 引擎打开
- 存在 `sessiontb`
- 存在 DCTimer 风格的结果表
- `sessiontb` 中字段大致符合：`id`, `name`, `type`, `mulp`, `ra`, `sorting?`

满足以上条件则认定为 DCTimer 数据库。

---

## 8. Session 解析策略

从 `sessiontb` 读取全部记录。

对每条记录：
- 读取 `id`
- 读取 `name`
- 读取 `type`
- 读取 `mulp`
- 读取 `ra`
- 读取 `sorting`
- 用 `decodePuzzleType(type)` 生成 `puzzle`

名称策略：
- 若 `name` 为空，前端可在展示层回退成 `Session {n}`
- 解析层保留原始值，并附带 normalized name 更合适

排序策略：
- 若 `sorting` 缺失或为 0，可按读取顺序或 `id` 回退

---

## 9. Solve 解析策略

## 9.1 固定表

以下表分别对应固定 session：
- `resulttb` -> `sessionId = 0`
- `result2` -> `sessionId = 1`
- ...
- `result15` -> `sessionId = 14`

> 注意：这是表与 session id 的约定，需要在实现中明确写死映射，不要靠猜。

## 9.2 扩展表

- `resultstb` 内部包含 `sid`
- `sid` 即真实 session id

## 9.3 单条 solve 归一化规则

原始字段：
- `rest`
- `resp`
- `resd`
- `scr`
- `time`
- `note`
- `p1~p6`
- `moves`

归一化建议：
- `baseTimeMs = rest`
- `penalty = normalizePenalty(resp, resd)`
- `isDnf = (resd === 0) || (resp === 2)`
- `finalTimeMs = isDnf ? null : rest + (resp === 1 ? 2000 : 0)`
- `recordedAt = parseRecordedAt(time)`
- `phases = compact([p1, p2, p3, p4, p5, p6])`

其中：

```ts
function normalizePenalty(resp: number, resd: number): 0 | 1 | 2 {
  if (resd === 0) return 2
  if (resp === 1) return 1
  if (resp === 2) return 2
  return 0
}
```

---

## 10. recordedAt 解析策略

源码里日期格式通常为：

```txt
yyyy-MM-dd HH:mm:ss
```

前端处理建议：
- 原样保留字符串
- 同时尝试解析为标准时间对象可识别的 ISO-like 格式
- 若解析失败：
  - `recordedAt = null`
  - 追加 `INVALID_TIME_STRING` warning

可增加：
- `recordedDate`, `recordedYear`, `recordedMonth`, `recordedDay`, `recordedHour`

但更建议放在聚合层二次加工，而不是解析层过早展开。

---

## 11. 会话统计回填策略

解析出全部 solves 后，再反向回填每个 session：
- `solveCount`
- `firstSolveAt`
- `lastSolveAt`

这样 session 列表页可以直接使用。

---

## 12. 数据概览生成策略

在解析完成后生成基础概览：
- 总分组数
- 总成绩数
- 有效成绩数
- DNF 数
- `+2` 数
- 覆盖年份范围
- 最近成绩时间

这部分会用于：
- 文件导入成功页
- 调试页
- 空状态判断

---

## 13. 推荐执行流程

```ts
async function parseDctimerDb(input: ParseDctimerDbInput): Promise<ParseDctimerDbResult> {
  // 1. 读取文件字节
  // 2. 打开 SQLite 数据库
  // 3. 探测 schema
  // 4. 校验是否为 DCTimer 数据库
  // 5. 解析 sessions
  // 6. 解析固定结果表
  // 7. 解析 resultstb
  // 8. 合并并归一化 solves
  // 9. 回填 session 统计字段
  // 10. 生成 meta / warnings / errors
  // 11. 返回结果
}
```

---

## 14. 兼容性策略

### 14.1 缺失 `moves`
- `moves = null`
- 记录 warning

### 14.2 缺失 `sorting`
- 使用 `id` 或读取顺序兜底
- 记录 warning

### 14.3 缺失 `p1~p6`
- `phases = []`
- 记录 warning

### 14.4 部分结果表不存在
- 只解析存在的表
- 不视为致命错误

### 14.5 旧版字段命名差异
如后续发现实际存在旧版 `result` / `penalty` / `scramble` 等老字段形式，可在 `schema-inspector` 中增加版本适配层。

---

## 15. 与上层模块的接口边界

解析器输出的数据，应足够供以下模块直接使用：
- 分组筛选
- 时间范围筛选
- 年度汇总统计
- 趋势聚合
- 项目聚合
- 文案生成
- 图表展示

也就是说，上层无需再直接写 SQL。

---

## 16. 下一步实现建议

在正式写代码前，建议继续完成：
- 把 `type` 映射整理成前端可直接 import 的 TS 常量结构
- 明确固定结果表与 session id 的映射函数
- 设计几个测试用数据库样例的覆盖场景

优先级建议：
1. 先写 `puzzle-type.ts`
2. 再写 schema 探测
3. 再写 session / solve parser
4. 最后接页面
