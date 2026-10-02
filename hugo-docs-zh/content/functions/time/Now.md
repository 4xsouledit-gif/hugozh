+++
title = "time.Now"
linkTitle = "Now"
description = "返回当前本地时间。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/time/now/"

[params.functions_and_methods]
signatures = ["time.Now"]
returnType = "time.Time"
aliases = ["now"]
+++

## 这一页解决什么问题

`time.Now` 返回**构建时**的当前时间（`time.Time`）：页脚的版权年份、判断内容是否已过期/尚未发布、给随机种子提供变化值，都靠它。

必须记住它不是「读者打开页面的时间」。静态站点的时间在 `hugo` 构建那一刻就固定进产物里了——想让读者看到实时时间，需要客户端脚本。

## 什么时候用，什么时候别用

**该用**：

- 页脚年份：`© {{ now.Year }}`；
- 时间比较：`where .Site.RegularPages "Date" "lt" now` 找未来内容；
- 给 [`collections.D`](/functions/collections/d/) 之类需要 seed 的函数提供变化值（如 `time.Now.YearDay`）。

**别用**：

- 想展示「访问者本地时间」→ 静态站点做不到，需要 JavaScript；
- 想展示某个固定日期 → 用 [`time.AsTime`](/functions/time/astime/)；
- 想直接把值打印给读者看 → 先过 [`time.Format`](/functions/time/format/)，否则会带出单调时钟计数（见实测）。

## 用法

例如，在 America/Los_Angeles 时区的 2023 年 10 月 15 日构建站点时：

```go-html-template
{{ time.Now }}
```

这会生成一个 `time.Time` 值，其字符串表示类似：

```text
2023-10-15 12:59:28.337140706 -0700 PDT m=+0.041752605
```

要格式化并[本地化](g)该值，请把它传给 [`time.Format`][] 函数：

```go-html-template
{{ time.Now | time.Format "Jan 2006" }} → Oct 2023
```

`time.Now` 函数返回 `time.Time` 值，因此可以对结果链式调用任意[时间方法][time methods]。例如：

```go-html-template
{{ time.Now.Year }} → 2023 (int)
{{ time.Now.Weekday.String }} → Sunday
{{ time.Now.Month.String }} → October
{{ time.Now.Unix }} → 1697400955 (int64)
```

## 完整示例：把构建时间写进页脚

```go-html-template {file="layouts/_partials/build-time.html"}
{{ $now := time.Now }}
<p>类型：{{ printf "%T" $now }}</p>
<p>年份：{{ $now.Year }}</p>
<p>星期：{{ $now.Weekday.String }}</p>
<p>月份：{{ $now.Month.String }}</p>
<p>格式化：{{ $now | time.Format "2006-01-02 15:04" }}</p>
```

Hugo 渲染为（本次实测：构建时间 2026-10-03 01:56，站点 `timeZone = "Asia/Shanghai"`；**你的结果会随构建时间与机器时区不同**）：

```html
<p>类型：time.Time</p>
<p>年份：2026</p>
<p>星期：Saturday</p>
<p>月份：October</p>
<p>格式化：2026-10-03 01:56</p>
```

**你应当看到什么**：返回的是 `time.Time`；可以链式调用时间方法拿到年份、星期、月份；显示给读者时用 `time.Format` 生成固定格式，不要直接打印原始值。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`，`timeZone = 'Asia/Shanghai'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 每次构建 | 值都不同（构建时快照，构建内固定） | 否 |
| 直接打印 | 形如 `2026-10-03 01:56:02.7363455 +0800 CST m=+0.121460101`，末尾带**单调时钟计数**，不适合给读者看 | 否 |
| 时区 | 受项目配置 `timeZone` 影响（实测输出带 `+0800 CST`） | 否 |
| 参数 | 该函数不接受参数，没有参数边界 | 否 |
| 返回类型 | `time.Time` | 否 |

上游未说明本函数的异常情况（它没有输入）。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上出现 `m=+0.12…` | 直接打印了 `time.Now` 原始值 | 过 [`time.Format`](/functions/time/format/) 再输出 |
| 没报错但结果不对 | 读者看到的时间不是「现在」 | 静态站点的时间是**构建时**固定的 | 需要实时时间就用客户端脚本；或用「最后更新」语义 |
| 没报错但结果不对 | 页脚年份与本地差一年/一天 | 构建机时区与你的预期不同 | 在项目配置里显式设置 `timeZone` |
| 没报错但结果不对 | 每次构建产物都变化导致 diff 噪声 | 页面里直接嵌入了构建时间 | 只在必要处使用，或用 `time.Now.YearDay` 这类按天稳定的值 |

更多排查入口见[故障排查](/troubleshooting/)。

[`time.Format`]: /functions/time/format/
[time methods]: /methods/time/
