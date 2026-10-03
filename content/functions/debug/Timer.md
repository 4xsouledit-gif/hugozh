+++
title = "debug.Timer"
linkTitle = "debug.Timer"
description = "返回一个具名计时器，用于测量执行耗时并输出到控制台。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/debug/timer/"

[params.functions_and_methods]
signatures = ["debug.Timer NAME"]
returnType = "debug.Timer"
+++

## 这一页解决什么问题

模板变慢时，你需要知道**慢在哪一段**。`debug.Timer` 提供最轻量的计时：实例化时开始计时，调用 `.Stop`（或构建结束）时把统计打到控制台。它不改变页面输出，适合临时插进模板做定位。

## 什么时候用，什么时候别用

**该用**：

- 怀疑某个循环或局部模板拖慢构建；
- 对比改动前后的耗时（配合 `--logLevel info`）；
- 排查 [`partialCached`](/functions/partials/includecached/) 是否真的命中缓存。

**别用**：

- 需要长期性能数据 → 用 `--templateMetrics` / `--templateMetricsHints`（见[性能](/troubleshooting/performance/)）；
- 生产构建 → 定位完应删掉，留着只是噪声；
- 想精确到某一行 → 用 Hugo 的模板度量而不是手工埋点。

用 `debug.Timer` 函数测量一段代码的执行时间，这有助于发现模板中的性能瓶颈。

计时器在你实例化它时启动，在调用它的 `Stop` 方法时停止。

```go-html-template
{{ $t := debug.Timer "TestSqrt" }}
{{ range 2000 }}
  {{ $f := math.Sqrt . }}
{{ end }}
{{ $t.Stop }}
```

构建站点时使用 `--logLevel info` 命令行参数。

```sh
hugo build --logLevel info
```

结果会在构建结束时显示到控制台。计时器数量不限；如果没有停止它们，它们会在构建结束时被停止。

```text
INFO  timer:  name TestSqrt count 1002 duration 2.496017496s average 2.491035ms median 2.282291ms
```

## 完整示例（实测）

```go-html-template
{{ $t := debug.Timer "TestSqrt" }}
{{ range 2000 }}
  {{ $f := math.Sqrt . }}
{{ end }}
{{ $t.Stop }}
```

构建时打开 `info` 日志：

```sh
hugo --source <站点目录> --ignoreCache --logLevel info
```

Hugo 0.167.0 实测控制台输出（数值随机器波动）：

```text
INFO  timer:  name TeachTimer count 1 duration 2.1666ms average 2.1666ms median 2.1666ms
```

**你应当看到什么**：构建正常结束，控制台多出一行 `timer:`，其中 `name` 是你给的名字，`duration` / `average` / `median` 是耗时统计。

## 返回值边界（实测）

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 调用 `$t.Stop` | 输出该计时器的统计行 | 否 |
| 不调用 `.Stop` | 构建结束时统一停止并输出（上游说明） | 否 |
| 计时器对页面输出 | 无影响（不产生模板输出） | 否 |
| 未开启 `info` 日志 | 实测 `--logLevel warn` 时不输出 `timer:` 行 | 否 |
| 返回类型 | `debug.Timer` 对象（有 `Stop` 方法） | 否 |
