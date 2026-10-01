+++
title = "检查与调试"
linkTitle = "检查与调试"
description = "用模板函数与命令行标志检查数据、模板和构建过程。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/troubleshooting/inspection/"
+++

## 检查数据结构

用 `debug.Dump` 函数检查数据结构：

```go-html-template
<pre>{{ debug.Dump .Params }}</pre>
```

渲染结果类似下面的内容：

```text
{
  "date": "2023-11-10T15:10:42-08:00",
  "draft": false,
  "iscjklanguage": false,
  "lastmod": "2023-11-10T15:10:42-08:00",
  "publishdate": "2023-11-10T15:10:42-08:00",
  "tags": [
    "foo",
    "bar"
  ],
  "title": "My first post"
}
```

## 检查简单值

用 `printf` 函数把结果渲染到页面，或用 `warnf` 函数输出到控制台，可以检查简单的数据结构。下面的布局字符串同时显示值与数据类型：

```go-html-template
{{ $value := 42 }}
{{ printf "%[1]v (%[1]T)" $value }} → 42 (int)
```

## 标记模板执行边界

从 v0.146.0 起，可以用 `templates.Current` 函数直观地标记模板的执行边界，或显示模板的调用栈。当模板层层嵌套、难以判断某段输出由谁产生时，这个函数比逐段注释更省事。

## 命令行检查手段

除了在模板中输出中间值，还可以用构建标志观察 Hugo 的行为，完整选项见[命令](/commands/)：

```bash
# 打开调试输出，查看构建过程中的细节
hugo build --logLevel debug

# 打印重复的目标路径、未被使用的模板
hugo build --printPathWarnings --printUnusedTemplates

# 显示模板执行的统计信息与改进提示
hugo build --templateMetrics --templateMetricsHints
```

各标志的作用如下：

- `--debug` 见于旧版资料，当前版本请改用 `--logLevel debug`，日志级别的含义见[日志](/troubleshooting/logging/)。
- `--printPathWarnings` 打印目标路径重复等警告；输出前后不一致时，首先应检查是否有两个页面发布了同一个路径。
- `--printUnusedTemplates` 打印没有被使用到的模板，便于发现写错文件名或路径的模板。
- `--renderToMemory`（`-M`）把渲染结果放在内存中而不落盘，对 `hugo server` 比较有用：某些情况下更快，但会占用更多内存。
- `--templateMetrics` 显示模板执行的统计信息，`--templateMetricsHints` 与它同时使用时给出改进提示；两者输出的解读见[性能](/troubleshooting/performance/)。
- `--printI18nWarnings` 打印缺失的翻译，多语言站点可以用它定位漏翻的字符串。
- `--printMemoryUsage` 按间隔打印内存使用情况；`--panicOnWarning` 在出现第一条 WARNING 日志时直接 panic，适合让问题立刻暴露。

这些标志输出的多为警告，不会中断构建；如果要在部署前做一次集中检查，见[审计](/troubleshooting/audit/)。
