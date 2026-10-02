+++
title = "hugo.IsExtended"
linkTitle = "hugo.IsExtended"
description = "报告 Hugo 二进制是 extended 版还是 extended/deploy 版。"
date = 2026-10-02
weight = 100
source = "https://gohugo.io/functions/hugo/isextended/"

[params.functions_and_methods]
signatures = ["hugo.IsExtended"]
returnType = "bool"
+++

## 这一页解决什么问题

Hugo 有标准版与 extended 版，某些能力只有 extended 版才有（例如把 SCSS 编译成 CSS 的 `css.Sass`/`css.Build` 管道）。如果模板里无条件调用这些功能，标准版上构建就会失败。`hugo.IsExtended` 让你在模板里先判断，再决定是调用功能还是给出可读的提示。

## 什么时候用，什么时候别用

**该用**：

- 依赖 extended 专属能力（[`css.Sass`](/functions/css/sass/)、[`css.Build`](/functions/css/build/) 等）前做守卫，给出人话错误提示；
- 在调试页标明当前二进制版本。

**别用**：

- 用 `hugo.Version` 里是否含 "extended" 来判断 → **实测不可行**：本机 extended 二进制的 `hugo.Version` 是 `0.167.0`，`strings.Contains hugo.Version "extended"` 返回 `false`（`+extended` 只出现在 `hugo version` 的命令行输出里）；
- 判断某个功能是否存在 → 直接调用并在需要时用 [`errorf`](/functions/fmt/errorf/) 给出提示，比猜测版本/发行版更可靠。

上游给出的示意输出：

```go-html-template
{{ hugo.IsExtended }} → true/false
```

## 完整示例：extended 专属功能前做守卫

```go-html-template {file="layouts/_partials/styles.html"}
{{ if hugo.IsExtended }}
  {{ with resources.Get "sass/main.scss" | css.Sass }}
    <link rel="stylesheet" href="{{ .RelPermalink }}">
  {{ end }}
{{ else }}
  {{ errorf "本模板需要 Hugo extended 版才能编译 SCSS" }}
{{ end }}
```

在本机（Hugo 0.167.0 extended，Windows）实测：`hugo.IsExtended` 为 `true`，因此走第一个分支（若 `assets/sass/main.scss` 不存在，`resources.Get` 返回 nil，`with` 不渲染，构建不报错）。

**你应当看到什么**：extended 二进制上为 `true`。可以用 `hugo version` 交叉验证——扩展版的版本行末尾带 `+extended`，而模板里的 `hugo.Version` 不带这个后缀。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| extended 版（本机） | `true` | 否 |
| 标准版 | 上游未说明；本站未安装标准版，未实测 | 否 |
| extended/deploy 版 | 上游说明同样为 `true`；本站未安装，未实测 | 否 |
| 传入参数 `{{ hugo.IsExtended "x" }}` | —— | 是：`wrong number of args for IsExtended: want 0 got 1` |
| 返回类型（`printf "%T"`） | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 判断「版本串里有没有 extended」总是假 | `hugo.Version` 不含发行版后缀（实测 extended 下仍为 `0.167.0`） | 用 `hugo.IsExtended`；发行版后缀只在 `hugo version` 命令行输出里 |
| 报错看不懂 | 标准版上出现 `failed to transform ... to CSS: this feature is not available in your current Hugo version` 之类的错误 | 标准版没有 Sass 转译能力 | 用 `hugo.IsExtended` 守卫，或改用 extended 版构建 |
| 报错看不懂 | `wrong number of args for IsExtended: want 0 got 1` | 给它传了参数 | 它无参数，可直接用在 `if` 里 |

更多排查入口见[故障排查](/troubleshooting/)。
