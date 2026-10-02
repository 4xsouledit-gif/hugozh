+++
title = "hugo.IsProduction"
linkTitle = "hugo.IsProduction"
description = "报告当前运行环境是否为 production。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/functions/hugo/isproduction/"

[params.functions_and_methods]
signatures = ["hugo.IsProduction"]
returnType = "bool"
+++

## 这一页解决什么问题

「这段代码只有在正式发布时才生效」是模板里最常见的分支之一：注入统计脚本、输出完整的结构化数据、开启资源压缩、隐藏调试面板。`hugo.IsProduction` 把这件事变成一个布尔值——当且仅当运行环境是 `production` 时为真，而 `hugo` 命令的默认环境就是 `production`。

## 什么时候用，什么时候别用

**该用**：

- 需要「正式环境」语义时（分析脚本、robots、结构化数据等）；
- 需要一个「默认就为真」的开关，只在本地特殊处理。

**别用**：

- 想做「非生产则……」（反向判断） → 用 [`hugo.IsDevelopment`](/functions/hugo/isdevelopment/) 或 [`hugo.Environment`](/functions/hugo/environment/)：`staging` 下 `IsProduction` 与 `IsDevelopment` **同时为假**（实测），`not IsProduction` 会把这个中间环境误当成开发环境；
- 想判断是不是开发服务器 → 用 [`hugo.IsServer`](/functions/hugo/isserver/)。

上游给出的示意输出：

```go-html-template
{{ hugo.IsProduction }} → true/false
```

## 完整示例：正式环境才注入统计脚本

```go-html-template {file="layouts/_partials/analytics.html"}
{{ if hugo.IsProduction }}
  <script src="https://example.org/stats.js" defer></script>
{{ else }}
  <!-- 非正式环境不注入 -->
{{ end }}
```

在本机（Hugo 0.167.0 extended，Windows）实测：

- `hugo --source <临时目录> --ignoreCache`：

```html
  <script src="https://example.org/stats.js" defer></script>
```

- `hugo --source <临时目录> --ignoreCache --environment staging`：

```html
  <!-- 非正式环境不注入 -->
```

**你应当看到什么**：默认构建就注入；一旦指定了任何其它环境名（`development`、`staging`、自定义值），`IsProduction` 都变成 `false`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 默认构建（无 `--environment`） | `true` | 否 |
| `--environment development` | `false` | 否 |
| `--environment staging` | `false` | 否 |
| 在 `if` 中使用 | 按布尔值正常工作 | 否 |
| 传入参数 `{{ hugo.IsProduction "x" }}` | —— | 是：`wrong number of args for IsProduction: want 0 got 1` |
| 返回类型（`printf "%T"`） | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 本地构建也注入了统计脚本 | 本地跑的是 `hugo build`，默认环境就是 `production` | 本地改用 `hugo server` 或加 `--environment development` |
| 没报错但结果不对 | `staging` 被当成开发环境处理 | `staging` 下 `IsProduction` 与 `IsDevelopment` 都为假，`not IsProduction` 不等于开发环境 | 显式判断 `hugo.Environment` 的取值，或为 `staging` 单独分支 |
| 报错看不懂 | `wrong number of args for IsProduction: want 0 got 1` | 给它传了参数 | 它无参数，可直接用在 `if` 里 |

更多排查入口见[故障排查](/troubleshooting/)。
