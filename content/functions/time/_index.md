+++
title = "时间函数"
linkTitle = "time"
description = "使用这些函数处理时间值。"
date = 2026-10-02
weight = 280
source = "https://gohugo.io/functions/time/"
+++

## 这一页解决什么问题

模板里的日期/时间绕不开三个动作：**解析**（字符串 → `time.Time`）、**换算**（时区）、**输出**（固定格式或本地化），外加时长的构造与解析。本章覆盖的正是这几件事。

```
字符串日期 ──time.AsTime──▶ time.Time ──time.In──▶ 换时区的 time.Time ──time.Format──▶ 字符串
「数量+单位」──time.Duration──▶ time.Duration
时长字符串 ──time.ParseDuration──▶ time.Duration
```

## 读完本章你应该能够

- 判断手上的值是字符串还是 `time.Time`，并知道前者必须先过 [`time.AsTime`](/functions/time/astime/)；
- 用 [`time.Format`](/functions/time/format/) 输出固定格式，并知道机器可读的写法是 `2006-01-02T15:04:05Z07:00`；
- 用 [`time.In`](/functions/time/in/) 把同一时刻换算到别的时区，并说清时区优先级的四级顺序；
- 说明 [`time.Now`](/functions/time/now/) 是**构建时间**而不是访问时间；
- 用 [`time.Duration`](/functions/time/duration/) 或 [`time.ParseDuration`](/functions/time/parseduration/) 构造时长，并取到秒数/分钟数。

## 什么时候用本章的函数，什么时候别用

**该用**：

- 日期是**字符串**（YAML/JSON 日期、加引号的 TOML、数据文件里的日期）→ 先解析；
- 输出需要**固定格式**（RSS、`datetime` 属性、文件名）或需要本地化标记；
- 需要跨时区展示，或需要时长计算。

**别用**：

- 页面日期（`.Date`、`.Lastmod`、`.PublishDate`）本身已经是 `time.Time` → 直接配合 `time.Format` 输出，不必再解析；
- 想通过本地化标记输出多语言日期 → 先读 [`time.Format`](/functions/time/format/) 的实测说明（本站改用固定布局，避免部分语言回退成英文）；
- 需要日历运算（加减月份、取某一天）→ 看 [methods/time](/methods/time/) 下的时间方法；
- 需要「读者打开页面的当前时间」→ 静态站点做不到，那属于客户端脚本的职责。

## 阅读顺序

1. **解析与输出**：[time.AsTime](/functions/time/astime/) → [time.Format](/functions/time/format/) → [time.In](/functions/time/in/)
2. **时长**：[time.Duration](/functions/time/duration/) → [time.ParseDuration](/functions/time/parseduration/)
3. **当前时间**：[time.Now](/functions/time/now/)（配合 [methods/time](/methods/time/) 的方法链）

## 完整示例：从字符串日期到上海时间

```go-html-template {file="layouts/_partials/date-line.html"}
{{ $t := time.AsTime "2023-10-15T13:18:50-07:00" }}
<p>原值：{{ $t }}</p>
<p>固定格式：{{ time.Format "2006-01-02" $t }}</p>
<p>换到上海时间：{{ $t | time.In "Asia/Shanghai" | time.Format "2006-01-02 15:04" }}</p>
<p>24 小时的秒数：{{ (time.Duration "hour" 24).Seconds }}</p>
```

Hugo 渲染为（站点配置 `timeZone = "Asia/Shanghai"`）：

```html
<p>原值：2023-10-15 13:18:50 -0700 -0700</p>
<p>固定格式：2023-10-15</p>
<p>换到上海时间：2023-10-16 04:18</p>
<p>24 小时的秒数：86400</p>
```

**你应当看到什么**：原值保留输入字符串里的偏移（`-0700`）；`time.Format` 用固定布局取日期；换算到 `Asia/Shanghai` 后跨到了次日 `04:18`；秒数由 `time.Duration` 返回值的 `.Seconds` 方法算出。
