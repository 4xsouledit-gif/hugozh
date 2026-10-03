+++
title = "hugo.Version"
linkTitle = "hugo.Version"
description = "返回 Hugo 二进制的当前版本。"
date = 2026-10-02
weight = 170
source = "https://gohugo.io/functions/hugo/version/"

[params.functions_and_methods]
signatures = ["hugo.Version"]
returnType = "hugo.VersionString"
+++

## 这一页解决什么问题

模板或主题可能用到某个较新版本才有的功能。这时你需要知道「当前跑的是哪个 Hugo 版本」，才能决定是否启用，或者在版本太旧时给出可读的错误提示。`hugo.Version` 返回二进制的版本号字符串，例如 `0.167.0`——注意它**不含** `extended` 之类的发行版后缀。

## 什么时候用，什么时候别用

**该用**：

- 输出到页脚、调试页、issue 模板；
- 需要按版本号做功能判断时（比较方法见下，**不要直接比字符串**）。

**别用**：

- 想判断是不是 extended 版 → 用 [`hugo.IsExtended`](/functions/hugo/isextended/)：**实测** extended 二进制下 `hugo.Version` 仍是 `0.167.0`，`strings.Contains hugo.Version "extended"` 为 `false`；
- 想精确标识构建来源 → 再加 [`hugo.CommitHash`](/functions/hugo/commithash/)、[`hugo.BuildDate`](/functions/hugo/builddate/)。

上游给出的示意输出：

```go-html-template
{{ hugo.Version }} → 0.167.0
```

## 完整示例：按次版本号决定是否启用新功能

```go-html-template {file="layouts/_partials/feature-gate.html"}
{{ $v := split (printf "%s" hugo.Version) "." }}
{{ $minor := int (index $v 1) }}
<p>版本：{{ hugo.Version }}</p>
{{ if ge $minor 128 }}
  <p>启用新版资源管道。</p>
{{ else }}
  <p>版本过旧，请升级 Hugo。</p>
{{ end }}
```

在本机（Hugo 0.167.0 extended，Windows）实测渲染为：

```html
<p>版本：0.167.0</p>
  <p>启用新版资源管道。</p>
```

**你应当看到什么**：`0.167.0`。要比较版本，必须像上面这样**先按 `.` 拆开、再按数字比较**——`hugo.Version` 的类型是 `hugo.VersionString`（实测 `printf "%T"` 得到 `version.VersionString`），它与字符串字面量可以直接 `eq` 比较（实测 `eq hugo.Version "0.167.0"` 为 `true`），但用 `ge`/`lt` 直接比会变成**字典序**比较：**实测** `{{ ge "0.9.0" "0.10.0" }}` 返回 `true`（按语义应为假）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ hugo.Version }}` | `hugo.VersionString`，本机为 `0.167.0` | 否 |
| `eq hugo.Version "0.167.0"` | `true`（可与字符串字面量直接比较） | 否 |
| `printf "%s"` / `printf "%T"` | `0.167.0` / `version.VersionString` | 否 |
| `printf "%.1f"`（当数字用） | `%!f(version.VersionString=0)`，不是版本号 | 否（不报错，输出是垃圾） |
| `split (printf "%s" hugo.Version) "."` | `[0 167 0]` | 否 |
| 空值 / `nil` | 不适用：恒有值 | 否 |
| 传入参数 `{{ hugo.Version "x" }}` | —— | 是：`wrong number of args for Version: want 0 got 1` |
| 直接字典序比较（`ge`/`lt`） | 结果可能与语义不符（实测 `ge "0.9.0" "0.10.0"` 为 `true`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 版本判断在 `0.9` → `0.10` 这类边界上失灵 | 字符串字典序比较：`"0.9.0"` 字典序大于 `"0.10.0"` | 拆成数字再比（见上文完整示例） |
| 没报错但结果不对 | 判断「是不是 extended 版」总是假 | `hugo.Version` 不含发行版后缀 | 用 [`hugo.IsExtended`](/functions/hugo/isextended/) |
| 没报错但结果不对 | 输出的版本号被格式化坏（如 `%!f(...)`） | 把 `hugo.VersionString` 当数字传给 `printf` 的浮点占位符 | 用 `%s`，或先 `printf "%s"` 再处理 |
| 报错看不懂 | `wrong number of args for Version: want 0 got 1` | 给它传了参数 | 它无参数，直接写 `{{ hugo.Version }}` |

更多排查入口见[故障排查](/troubleshooting/)。
