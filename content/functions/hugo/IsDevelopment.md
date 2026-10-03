+++
title = "hugo.IsDevelopment"
linkTitle = "hugo.IsDevelopment"
description = "报告当前运行环境是否为 development。"
date = 2026-10-02
weight = 90
source = "https://gohugo.io/functions/hugo/isdevelopment/"

[params.functions_and_methods]
signatures = ["hugo.IsDevelopment"]
returnType = "bool"
+++

## 这一页解决什么问题

模板里经常要区分「本地开发/预览」与「正式发布」：开发时显示草稿标记、跳过统计脚本、把资源指向本地。`hugo.IsDevelopment` 返回一个布尔值，**当且仅当**当前运行环境等于 `development` 时为真。它比手写字符串比较更安全，也把意图写得更清楚。

## 什么时候用，什么时候别用

**该用**：

- 需要「开发环境」这个语义时（`--environment development`，或 `hugo server` 的默认环境）；
- 想在开发时输出调试信息。

**别用**：

- 想判断「是不是由开发服务器在跑」 → 用 [`hugo.IsServer`](/functions/hugo/isserver/)：`hugo build --environment development` 时 `IsDevelopment` 为真、`IsServer` 仍为假（实测，见下表）；
- 想判断「是不是正式发布」 → 用 [`hugo.IsProduction`](/functions/hugo/isproduction/)：`staging` 环境下两者都为假，不要用 `not IsDevelopment` 去推断生产；
- 想拿环境名本身 → 用 [`hugo.Environment`](/functions/hugo/environment/)。

上游给出的示意输出：

```go-html-template
{{ hugo.IsDevelopment }} → true/false
```

## 完整示例：开发环境显示草稿提示

```go-html-template {file="layouts/_partials/draft-banner.html"}
{{ if hugo.IsDevelopment }}
  <p class="banner">开发预览：内容可能未定稿。</p>
{{ end }}
```

在本机（Hugo 0.167.0 extended，Windows）实测：

- `hugo --source <临时目录> --ignoreCache`（默认环境）输出为空；

- `hugo --source <临时目录> --ignoreCache --environment development` 输出：

```html
  <p class="banner">开发预览：内容可能未定稿。</p>
```

**你应当看到什么**：只有显式指定 development 环境（或跑 `hugo server`）时横幅才出现。默认的 `hugo` 命令是 `production`，什么都不输出。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 默认构建（无 `--environment`） | `false` | 否 |
| `--environment development` | `true` | 否 |
| `--environment staging` | `false` | 否 |
| 在 `if` 中使用 | 按布尔值正常工作（`false` 时整块不输出） | 否 |
| 传入参数 `{{ hugo.IsDevelopment "x" }}` | —— | 是：`wrong number of args for IsDevelopment: want 0 got 1` |
| 返回类型（`printf "%T"`） | `bool` | 否 |

`hugo.IsServer` / `hugo.IsDevelopment` 的区别实测：`--environment development` 下 `IsDevelopment` 为 `true`，而 `IsServer` 为 `false`——环境名与「服务器是否在跑」是两件事。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `{{ if hugo.IsDevelopment }}` 在本地预览时一直为假 | 用 `hugo build` 而不是 `hugo server`，也没带 `--environment development` | 本地用 `hugo server`，或构建时加 `--environment development` |
| 没报错但结果不对 | 把 `staging` 当成「非开发即生产」处理 | `not hugo.IsDevelopment` 在 `staging` 下也为真 | 生产判断改用 [`hugo.IsProduction`](/functions/hugo/isproduction/) |
| 报错看不懂 | `wrong number of args for IsDevelopment: want 0 got 1` | 给它传了参数 | 它无参数，可直接用在 `if` 里 |

更多排查入口见[故障排查](/troubleshooting/)。
