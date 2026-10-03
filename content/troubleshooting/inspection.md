+++
title = "检查与调试"
linkTitle = "检查与调试"
description = "构建不报错、输出却不对时，用模板函数把 Hugo 实际拿到的值打印出来：debug.Dump、printf / warnf、templates.Current，以及配合使用的命令行标志。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/troubleshooting/inspection/"

[params.teach]
difficulty = "进阶"
time = "15–20 分钟"
prereq = [
  "能定位到自己站点的模板文件（`layouts/` 及其主题目录下的同名文件）",
  "知道改完模板要重新构建或让 `hugo server` 自动重建",
]
outcomes = [
  "用 `debug.Dump` 把任意数据结构的真实内容打出来，不再靠猜字段名",
  "用 `printf` 把值渲染到页面、用 `warnf` 打到控制台，并看懂 `%[1]v` 这类带索引的格式串",
  "用 `templates.Current` 判断某段输出到底由哪个模板产生",
  "知道这些手段各自的边界：什么时候会什么都看不到、什么时候输出会骗人",
]
next = ["/troubleshooting/logging/", "/functions/debug/dump/", "/functions/templates/current/"]

+++

**适用场景**：站点能构建、终端不报错，但页面上的某个值是空的、是错的，或者干脆没出现。这时候最省力的做法不是反复改模板猜原因，而是**把 Hugo 真正拿到的数据打印出来看一眼**。

本节的所有手段都只在「你知道要去看哪个模板」的前提下有效。如果连哪个模板负责这块输出都不知道，先看本页最后一节的 `templates.Current`。

## 检查数据结构：debug.Dump

用 `debug.Dump` 函数检查一个数据结构：

```go-html-template
<pre>{{ debug.Dump .Params }}</pre>
```

签名是 `debug.Dump VALUE`，返回类型为 `string`。把上面这行临时插进目标模板（插在你想观察的位置），保存、重新构建，再打开对应页面。

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

**你应当看到什么**：一段缩进过的、类似 JSON 的文本，键就是页面前置元数据里的键。注意两点便于对照的教学价值：

- 键名被**统一转成小写**（`publishDate` 显示为 `publishdate`），所以模板里要用 `.Params.publishdate` 或 `.PublishDate`，而不是照抄前置元数据里的写法；
- 只出现页面自己写过的字段，没有默认值填充。看不到某个键，说明前置元数据里确实没写。

**返回值边界**

- 值不存在时不会报错，而是取到 nil（Go 模板里的「无值」）。**不要拿 nil 直接和字符串比较**（`{{ if eq .Params.foo "x" }}` 在 `foo` 不存在时会抛出类型不符的错误），先用 `{{ with .Params.foo }}` 判断；
- 输出格式可能随 Hugo 版本变化，官方明确它**仅供调试**，不要写进正式模板：`debug.Dump` 的说明见[debug.Dump](/functions/debug/dump/)；
- 调试完请删除这行。留在模板里会让每个页面都多出一大段文本。

## 检查简单值：printf 与 warnf

用 `printf` 函数把结果渲染到页面，或用 `warnf` 函数输出到控制台，可以检查简单的数据结构。下面的布局字符串同时显示值与数据类型：

```go-html-template
{{ $value := 42 }}
{{ printf "%[1]v (%[1]T)" $value }} → 42 (int)
```

**怎么读这个格式串**（这是最容易被跳过、却最有用的一步）：

- `%v` 按默认格式打印值，`%T` 打印类型；
- `[1]` 是**参数索引**，表示「复用第 1 个参数」，所以 `$value` 只传了一次，却被打印了两次。没有 `[1]` 时，第二个占位符会去取第 2 个参数，结果自然是空的。

**验证标准**：上面两行放进任意模板，页面上应当出现 `42 (int)`。若看到 `42 ()` 或 `%!v(MISSING)`，就是格式串的参数对不上。

**为什么有时会「什么都看不到」**：`printf` 的结果要渲染进页面才看得见；用 `warnf` 则打印到控制台：

```go-html-template
{{ $value := 42 }}
{{ warnf "value=%v type=%T" $value }}
```

实测：`warnf` 有**去重**行为——同一条消息只会打印一次，避免刷屏。因此在 `range` 循环里调试时，你只会看到第一行，很容易误判成「只执行了一次」。调试循环时给消息加上唯一标识：

```go-html-template
{{ range site.RegularPages }}
  {{ .Section | warnf "%#[2]v [%[1]d]" math.Counter }}
{{ end }}
```

`math.Counter` 每次调用返回递增的整数，用它保证每条消息都不同。详见 [fmt.Warnf](/functions/fmt/warnf/)。

## 标记模板执行边界与调用栈：templates.Current

（0.146.0 新增）`templates.Current` 函数可以直观地标记模板的执行边界，或显示模板的调用栈。当模板层层嵌套、难以判断某段输出由谁产生时，它比逐段注释更省事。

> [!NOTE]
> 该函数是实验性的，行为可能变化。签名与返回值见 [templates.Current](/functions/templates/current/)。

返回值是 `tpl.CurrentTemplateInfo` 对象，常用方法如下：

| 方法 | 返回 | 用途 |
| --- | --- | --- |
| `Name` | `string` | 当前模板名，通常是相对 `layouts` 目录的路径 |
| `Filename` | `string` | 当前模板的绝对路径；嵌入式模板为空字符串 |
| `Parent` | `tpl.CurrentTemplateInfo` | 父模板，可能为 nil |
| `Base` | `tpl.CurrentTemplateInfoCommonOps` | 套用在当前模板上的 base 模板，可能为 nil |
| `Ancestors` | `tpl.CurrentTemplateInfos` | 从父模板一路向上的执行链切片，可再链 `Reverse` 反转顺序 |

用法示例：先在项目配置里打开一个开关，避免调试代码进入正式输出：

```toml
[params]
debug = true
```

然后在模板里标记边界：

```go-html-template {file="layouts/page.html"}
{{ define "main" }}
  {{ if site.Params.debug }}
    <div class="debug">[entering {{ templates.Current.Filename }}]</div>
  {{ end }}

  <h1>{{ .Title }}</h1>
  {{ .Content }}

  {{ if site.Params.debug }}
    <div class="debug">[leaving {{ templates.Current.Filename }}]</div>
  {{ end }}
{{ end }}
```

**你应当看到什么**：页面上出现 `[entering /绝对路径/layouts/page.html]` 与 `[leaving …]` 两条标记，把这块输出的起止位置框出来。若 `Filename` 为空，说明当前是嵌入式模板，改用 `Name`。

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

## 常见坑

**命令找不到**

- `hugo build --templateMetrics` 报未知标志：标志名随版本变化，用 `hugo build --help` 查当前版本支持的写法（部分旧版资料里的 `--debug` 已改名为 `--logLevel debug`）；
- 在 Windows 上用 `grep`/`tee` 过滤日志：改用 `Select-String`，或把输出重定向到文件再查看，见[日志](/troubleshooting/logging/)。

**没有报错但结果不对**

- **`debug.Dump` 放对了位置，页面上却没有那段文本**：可能整个模板没有被用到（先查 `hugo build --printUnusedTemplates`），也可能你改的是主题目录里的文件、而项目里有同名覆盖文件，Hugo 用的是后者；
- **`printf` 显示成 `%!v(MISSING)` 或空括号**：格式串占位符与实参数量不匹配，对照上面 `%[1]v` 的说明检查；
- **`warnf` 只出现一次**：正常的去重行为，见上文用 `math.Counter` 打破去重；
- **`templates.Current` 什么都不输出**：`site.Params.debug` 没有生效，先用 `hugo config` 确认参数，再确认模板里的 `if` 条件写对；
- **看到的值是上一次构建的**：加 `--ignoreCache` 重新构建。

**报错看不懂**

- `error calling eq: invalid type for comparison`：拿 nil 去比较了，先用 `with` 判断存在性；
- 模板里出现 `ZgotmplZ`：说明有内容以不安全的方式进入了 URL 或 CSS 上下文，做法见[审计](/troubleshooting/audit/)；
- 报错指向的文件与你修改的文件不一致：先按[故障排查](/troubleshooting/)的「症状 C」二分缩小范围，Hugo 有时会把错误归因到正在渲染的那一页。
