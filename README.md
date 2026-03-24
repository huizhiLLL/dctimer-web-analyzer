# DCTimer Web Analyzer

一个在浏览器本地运行的 DCTimer 数据分析器，用于导入本地 `.db` 文件并生成简洁的训练报告。

## 当前状态

项目已经完成首个可用闭环：

- 本地导入 SQLite `.db`
- 基础 schema 检查与 DCTimer 识别
- 解析 `sessiontb`、固定结果表与 `resultstb`
- 按年份与分组筛选
- 生成基础报告页：总览、分布、关键发现、分组列表
- 已补 parser / analysis / store 的基础测试

当前仍未完成：

- 月度趋势、热力、时段分布等正式图表
- 高光事件、叙事文案、分享导出
- 更多筛选条件与更完整的旧版数据库兼容处理

## 页面

- `/` 导入数据库并查看基础检查结果
- `/filters` 选择年份与分组
- `/report` 查看筛选后的基础报告

## License

MIT
