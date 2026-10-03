+++
title = "hugo.Environment"
linkTitle = "hugo.Environment"
description = "返回当前运行的环境。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/hugo/environment/"

[params.functions_and_methods]
signatures = ["hugo.Environment"]
returnType = "string"
+++

## 这一页解决什么问题

同一套模板往往要在不同场合做不同的事：正式站点注入分析脚本，本地预览不注入；预览环境加一条「这是测试站」的横幅。`hugo.Environment` 返回当前运行的环境名，取值由 `--environment` 命令行标志决定，默认是 `production`。它也是你**自定义环境名**（如 `staging`）的唯一读取入口。

## 什么时候用，什么时候别用

**该用**：

- 需要区分**自定义环境**（`staging`、`preview` 等）——只有它能拿到这个名字；
- 需要把环境名本身显示出来或写进日志。

**别用**：

- 只想判断「是不是生产环境」 → 用 [`hugo.IsProduction`](/functions/hugo/isproduction/)：语义更直白，也不必和字符串字面量比较；
- 只想判断「是不是本地开发服务器」 → 用 [`hugo.IsServer`](/functions/hugo/isserver/)；`hugo server` 默认把环境设为 `development`，但两者不是同一回事；
- 判断「是不是开发环境」 → 用 [`hugo.IsDevelopment`](/functions/hugo/isdevelopment/)。

`hugo.Environment` 函数返回当前运行的环境，其取值由 `--environment` 命令行标志决定：

```go-html-template
{{ hugo.Environment }} → production
```

命令行示例：

命令|环境
:--|:--
`hugo build`|`production`
`hugo build --environment staging`|`staging`
`hugo server`|`development`
`hugo server --environment staging`|`staging`

> [!NOTE]
> 上表来自上游，其中 `hugo server` 两行本站未跑（本站约定不启动开发服务器）；`hugo build` 两行已在 Hugo 0.167.0 上实测复现。

## 完整示例：只在正式环境注入统计脚本

```go-html-template {file="layouts/_partials/analytics.html"}
{{ if hugo.IsProduction }}
  <script src="https://example.org/stats.js" defer></script>
{{ else }}
  <p>当前环境：{{ hugo.Environment }}（未注入统计脚本）</p>
{{ end }}
```

在本机分别实测：

- `hugo --source <临时目录> --ignoreCache`（默认）：

```html
  <script src="https://example.org/stats.js" defer></script>
```

- `hugo --source <临时目录> --ignoreCache --environment staging`：

```html
  <p>当前环境：staging（未注入统计脚本）</p>
```

**你应当看到什么**：默认构建时 `hugo.IsProduction` 为真；换成 `staging` 后输出的是环境名。环境名是**任意字符串**——`--environment` 传什么就返回什么。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点；构建命令为 `hugo --source <临时目录> --ignoreCache`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 默认构建（不带 `--environment`） | `production` | 否 |
| `--environment development` | `development` | 否 |
| `--environment staging` | `staging` | 否 |
| `--environment 任意字符串` | 原样返回该字符串 | 否 |
| 空值 / `nil` | 不适用：恒有值，默认 `production` | 否 |
| 传入参数 `{{ hugo.Environment "x" }}` | —— | 是：`wrong number of args for Environment: want 0 got 1` |
| 返回类型（`printf "%T"`） | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 本地开发时统计脚本仍然被注入 | 本地用的是 `hugo build`（环境仍是 `production`），而不是 `hugo server` 或 `--environment development` | 用 [`hugo.IsProduction`](/functions/hugo/isproduction/) 判断，并确认本地命令带 `--environment development` |
| 没报错但结果不对 | 比较 `hugo.Environment "production"` 时行为不符合预期 | 环境名大小写、拼写由 `--environment` 决定，没有归一化 | 打印一次 `{{ hugo.Environment }}` 确认实际值 |
| 报错看不懂 | `wrong number of args for Environment: want 0 got 1` | 给它传了参数 | 它无参数，直接写 `{{ hugo.Environment }}` |

更多排查入口见[故障排查](/troubleshooting/)。
