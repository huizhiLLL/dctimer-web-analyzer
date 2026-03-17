# DCTimer Web Analyzer

一个面向 DCTimer 用户的网页分析工具，用于在浏览器中导入本地 `.db` 数据库，并生成更清晰的训练报告。

## 项目特点

- 本地导入并解析 DCTimer 数据库
- 基础 schema 检查与 DCTimer 识别
- 支持年份与分组筛选
- 提供总览、分组分布、项目分布、关键发现等报告内容

## 页面结构

- `/` 导入数据库并完成基础检查
- `/filters` 选择年份与分组范围
- `/report` 查看筛选后的分析结果

## 开发

```bash
npm install
npm run dev
```

常用命令：

- `npm run build`
- `npm run test`

## LICENSE

MIT
