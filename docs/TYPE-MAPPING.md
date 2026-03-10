# DCTimer `sessiontb.type` 编码规则与项目映射

## 1. 结论

DCTimer 中，分组所属项目不是文本保存，而是保存在 `sessiontb.type` 这个整数编码字段里。

源码已确认其编码/解码逻辑：

```java
int idx = puzzle >> 5;
int sub = puzzle & 31;
```

以及：

```java
scrambleIdx = idx << 5 | idx2;
```

因此可以确定：

- `type = idx << 5 | sub`
- `idx = type >> 5`
- `sub = type & 31`

也就是说：
- 高位表示项目大类
- 低 5 位表示该大类下的子项

每个分组属于什么项目，取决于：
- `sessiontb.type`
- 通过上述位运算拆分出 `idx` 和 `sub`
- 再根据资源数组映射为名称

---

## 2. 一个成绩如何确定所属项目

单条 solve 本身不单独存项目名称。

归属链路为：

- solve -> `sessionId`
- `sessionId` -> 对应 `sessiontb` 记录
- `sessiontb.type` -> 拆出 `idx` / `sub`
- `idx` / `sub` -> 映射出项目大类与子项名称

因此网站侧建议统一使用：

```ts
solve -> session -> puzzleTypeCode -> puzzleTypeInfo
```

---

## 3. 映射来源

DCTimer 启动时会加载：

- `R.array.item_scr`：项目大类列表
- 一组子项数组：`item_wca`, `item_222`, `item_333`, ...

源码中构造关系如下：

```java
StringUtils.scrambleItems = getResources().getStringArray(R.array.item_scr);
StringUtils.scrambleSubitems = new String[StringUtils.scrambleItems.length][];
int[] subid = {
  R.array.item_wca,
  R.array.item_222,
  R.array.item_333,
  R.array.item_444,
  R.array.item_555,
  R.array.item_666,
  R.array.item_666,
  R.array.item_mega,
  R.array.item_pyr,
  R.array.item_sq1,
  R.array.item_clk,
  R.array.item_skewb,
  R.array.item_mnl,
  R.array.item_cmt,
  R.array.item_gear,
  R.array.item_smc,
  R.array.item_15p,
  R.array.item_other,
  R.array.item_333_sub,
  R.array.item_bandage,
  R.array.item_minx_sub,
  R.array.item_relay
};
for (int i = 0; i < subid.length; i++)
  StringUtils.scrambleSubitems[i] = getResources().getStringArray(subid[i]);
```

注意点：
- `StringUtils.scrambleItems` 长度为 22
- 但 `getScrambleName(idx, sub)` 中实际使用 `scrambleItems[idx + 1]`
- 也就是说这里存在一个偏移约定：`idx` 对应的是“去掉第 0 项后的分类索引”

因此在 Web 侧实现时，建议不要照搬这种隐式偏移，而是直接构建显式映射对象。

---

## 4. 推荐 Web 侧映射结构

建议在网站内部建立统一映射：

```ts
type PuzzleCategory = {
  idx: number
  key: string
  name: string
  items: string[]
}
```

例如：

```ts
const categories: PuzzleCategory[] = [
  { idx: 0, key: 'wca', name: 'WCA', items: [...] },
  { idx: 1, key: '222', name: '2x2', items: [...] },
  { idx: 2, key: '333', name: '3x3', items: [...] },
]
```

再由：

```ts
function decodePuzzleType(type: number) {
  const idx = type >> 5
  const sub = type & 31
  const category = categories[idx]
  const itemName = category?.items?.[sub] ?? null
  return {
    code: type,
    idx,
    sub,
    categoryName: category?.name ?? null,
    itemName,
    displayName: itemName ? `${category?.name} - ${itemName}` : `${category?.name ?? 'Unknown'} (#${type})`
  }
}
```

---

## 5. 项目大类映射（基于 `item_scr`）

> 以下名称优先采用英文资源数组，便于后续代码与国际化处理。

| idx | key | 类别名 |
| --- | --- | --- |
| 0 | wca | WCA |
| 1 | 222 | 2x2 |
| 2 | 333 | 3x3 |
| 3 | 444 | 4x4 |
| 4 | 555 | 5x5 |
| 5 | 666 | 6x6 |
| 6 | 777 | 7x7 |
| 7 | mega | Megaminx |
| 8 | pyr | Pyraminx |
| 9 | sq1 | Square-1 |
| 10 | clk | Clock |
| 11 | skewb | Skewb |
| 12 | mnl | LxMxN |
| 13 | cmt | Cmetrick |
| 14 | gear | Gear Cube |
| 15 | smc | Siamese Cube |
| 16 | 15p | 15 puzzle |
| 17 | other | Other |
| 18 | 333_sub | 3x3 subsets |
| 19 | bandage | Bandaged Cube |
| 20 | minx_sub | Megaminx subsets |
| 21 | relay | Relay |

---

## 6. 各项目子项映射

## 6.1 WCA (`idx = 0`)

`type = 0 << 5 | sub`

| sub | 名称 |
| --- | --- |
| 0 | 3x3x3 |
| 1 | 4x4x4 |
| 2 | 5x5x5 |
| 3 | 2x2x2 |
| 4 | 3x3 BLD |
| 5 | 3x3 OH |
| 6 | 3x3 FM |
| 7 | Megaminx |
| 8 | Pyraminx |
| 9 | Square-1 |
| 10 | Clock |
| 11 | Skewb |
| 12 | 6x6x6 |
| 13 | 7x7x7 |
| 14 | 4x4 BLD |
| 15 | 5x5 BLD |
| 16 | 3x3 MBLD |

## 6.2 2x2 (`idx = 1`)

| sub | 名称 |
| --- | --- |
| 0 | random state |
| 1 | 3-gen |
| 2 | 6-gen |
| 3 | CLL training |
| 4 | EG1 training |
| 5 | EG2 training |
| 6 | PBL training |
| 7 | EG training |
| 8 | TCLL+ training |
| 9 | TCLL- training |
| 10 | No bar |

## 6.3 3x3 (`idx = 2`)

| sub | 名称 |
| --- | --- |
| 0 | old style |
| 1 | random state |
| 2 | cross solved |
| 3 | last layer |
| 4 | PLL |
| 5 | edges only |
| 6 | corners only |
| 7 | last slot+last layer |
| 8 | ZBLL |
| 9 | ELL |
| 10 | CLL |
| 11 | last six edges |
| 12 | CMLL + LSE |
| 13 | edges permutation |
| 14 | edges orientation |
| 15 | corners permutation |
| 16 | corners orientation |
| 17 | permutation only |
| 18 | orientation only |
| 19 | easy cross |
| 20 | 2GLL |
| 21 | ZBLS |
| 22 | ZZLL |
| 23 | 3-cycle edges |
| 24 | 3-cycle corners |
| 25 | 3x3 for noobs |

## 6.4 4x4 (`idx = 3`)

| sub | 名称 |
| --- | --- |
| 0 | old style |
| 1 | SiGN |
| 2 | YJ |
| 3 | edges |
| 4 | R,r,U,u |

## 6.5 5x5 (`idx = 4`)

| sub | 名称 |
| --- | --- |
| 0 | prefix |
| 1 | SiGN |
| 2 | edges |

## 6.6 6x6 (`idx = 5`)

| sub | 名称 |
| --- | --- |
| 0 | prefix |
| 1 | SiGN |
| 2 | suffix |
| 3 | edges |

## 6.7 7x7 (`idx = 6`)

源码里 `idx = 6` 复用了 `item_666` 作为子项数组。

| sub | 名称 |
| --- | --- |
| 0 | prefix |
| 1 | SiGN |
| 2 | suffix |
| 3 | edges |

## 6.8 Megaminx (`idx = 7`)

| sub | 名称 |
| --- | --- |
| 0 | Pochmann |
| 1 | old style |

## 6.9 Pyraminx (`idx = 8`)

| sub | 名称 |
| --- | --- |
| 0 | random state |
| 1 | random moves |
| 2 | L4E |

## 6.10 Square-1 (`idx = 9`)

| sub | 名称 |
| --- | --- |
| 0 | face turn metric |
| 1 | twist metric |
| 2 | random state |
| 3 | cube shape |
| 4 | PBL |

## 6.11 Clock (`idx = 10`)

| sub | 名称 |
| --- | --- |
| 0 | WCA |
| 1 | Jaap order |
| 2 | concise |
| 3 | efficient pin order |

## 6.12 Skewb (`idx = 11`)

| sub | 名称 |
| --- | --- |
| 0 | random state |
| 1 | U L R B |
| 2 | L2L |

## 6.13 LxMxN (`idx = 12`)

| sub | 名称 |
| --- | --- |
| 0 | 1x3x3 |
| 1 | Super 1x3x3 |
| 2 | 2x3x3 |
| 3 | 2x2x3 |
| 4 | 2x2x4 |
| 5 | 3x3x4 |
| 6 | 3x3x5 |
| 7 | 3x3x6 |
| 8 | 3x3x7 |
| 9 | 4x4x6 |
| 10 | 8x8x8 |
| 11 | 9x9x9 |
| 12 | 10x10x10 |
| 13 | 11x11x11 |

## 6.14 Cmetrick (`idx = 13`)

| sub | 名称 |
| --- | --- |
| 0 | normal |
| 1 | mini |

## 6.15 Gear Cube (`idx = 14`)

| sub | 名称 |
| --- | --- |
| 0 | random state |
| 1 | 3-gen |

## 6.16 Siamese Cube (`idx = 15`)

| sub | 名称 |
| --- | --- |
| 0 | 1x1x3 block |
| 1 | 1x2x3 block |
| 2 | 2x2x2 block |

## 6.17 15 puzzle (`idx = 16`)

| sub | 名称 |
| --- | --- |
| 0 | piece moves |
| 1 | blank moves |

## 6.18 Other (`idx = 17`)

| sub | 名称 |
| --- | --- |
| 0 | Latch Cube |
| 1 | Helicopter |
| 2 | Square-2 |
| 3 | Super SQ1 |
| 4 | UFO |
| 5 | FTO |
| 6 | Redi cube |
| 7 | Master pyraminx |
| 8 | 8 puzzle |

## 6.19 3x3 subsets (`idx = 18`)

| sub | 名称 |
| --- | --- |
| 0 | 2-gen R,U |
| 1 | 2-gen L,U |
| 2 | Roux-gen M,U |
| 3 | 3-gen F,R,U |
| 4 | 3-gen R,U,L |
| 5 | 3-gen R,r,U |
| 6 | half turns only |
| 7 | LSLL(old) |

## 6.20 Bandaged Cube (`idx = 19`)

| sub | 名称 |
| --- | --- |
| 0 | Bicube |
| 1 | SQ1 /,(1,0) |

## 6.21 Megaminx subsets (`idx = 20`)

| sub | 名称 |
| --- | --- |
| 0 | 2-gen R,U |
| 1 | LSLL |

## 6.22 Relay (`idx = 21`)

| sub | 名称 |
| --- | --- |
| 0 | lots of 3x3s |
| 1 | 234 relay |
| 2 | 2345 relay |
| 3 | 23456 relay |
| 4 | 234567 relay |
| 5 | Guildford challenge |
| 6 | Mini Guildford challenge |

---

## 7. Web 侧实现建议

### 7.1 不要直接依赖 Android 资源偏移逻辑

App 内部有 `idx + 1` 这种实现细节。Web 侧建议直接维护显式数组，避免偏移 bug。

### 7.2 显示策略建议

每个 session 在 UI 中建议同时显示：
- `session.name`（用户自定义分组名，优先）
- `decodePuzzleType(type).displayName`（项目类型说明）
- `solveCount`

这样用户筛选时最直观。

### 7.3 容错策略

若出现未知 `type`：
- 仍然保留该 session
- 显示 `Unknown (#type)`
- 不影响解次统计

---

## 8. 与后续功能的关系

这份映射表将直接影响：
- 分组筛选页的项目显示
- 项目级聚合统计
- 主力项目识别
- 自动文案中的项目名
- 图表标签
- 分享页文案

因此它是解析器和统计层的基础依赖。
