+++
title = "hugo.IsServer"
linkTitle = "hugo.IsServer"
description = "报告内置开发服务器是否正在运行。"
date = 2026-10-02
weight = 140
source = "https://gohugo.io/functions/hugo/isserver/"

[params.functions_and_methods]
signatures = ["hugo.IsServer"]
returnType = "bool"
+++

## 这一页解决什么问题

有些行为只应该出现在「`hugo server` 正在跑」的时候：热重载提示、LiveReload 脚本、断点调试面板。`hugo.IsServer` 报告内置开发服务器是否在运行，与「环境名是什么」是两件独立的事——构建时即使环境是 `development`，它也是假。

## 什么时候用，什么时候别用

**该用**：

- 只有在开发服务器下才需要的行为（调试浮层、LiveReload 相关判断）；
- 需要区分「服务器在跑」与「环境名恰好是 development」时。

**别用**：

- 只想判断是不是开发环境 → 用 [`hugo.IsDevelopment`](/functions/hugo/isdevelopment/)：`hugo build --environment development` 时它才是你要的语义（此时 `IsServer` 为假，实测）；
- 想判断是不是正式发布 → 用 [`hugo.IsProduction`](/functions/hugo/isproduction/)。

上游给出的示意输出：

```go-html-template
{{ hugo.IsServer }} → true/false
```

## 完整示例：只在开发服务器下显示调试信息

```go-html-template {file="layouts/_partials/debug.html"}
{{ if hugo.IsServer }}
  <p>Hugo 开发服务器运行中；环境：{{ hugo.Environment }}</p>
{{ else }}
  <p>静态构建；环境：{{ hugo.Environment }}</p>
{{ end }}
```

在本机（Hugo 0.167.0 extended，Windows）实测 `hugo --source <临时目录> --ignoreCache`（不带 `--environment`）渲染为：

```html
  <p>静态构建；环境：production</p>
```

**你应当看到什么**：本站用命令行构建，所以永远是「静态构建」分支。上游说明 `hugo server` 下该值为 `true`——**本站约定不启动开发服务器，因此 true 分支未实测**，请以你自己机器上 `hugo server` 的输出为准。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点；只跑了构建命令。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `hugo build`（含 `--environment development`） | `false` | 否 |
| `hugo server` | 上游说明为 `true`；本站未实测（未启动服务器） | 否 |
| 传入参数 `{{ hugo.IsServer "x" }}` | —— | 是：`wrong number of args for IsServer: want 0 got 1` |
| 返回类型（`printf "%T"`） | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 加 `--environment development` 后调试块仍不显示 | 该分支判断的是「服务器是否在跑」，不是环境名 | 判断环境用 [`hugo.IsDevelopment`](/functions/hugo/isdevelopment/) |
| 没报错但结果不对 | 服务器下也看不到调试块 | 模板被缓存或改的不是当前渲染的布局 | 停掉 server 重启，并用 [`hugo.Environment`](/functions/hugo/environment/) 打印一次现场值 |
| 报错看不懂 | `wrong number of args for IsServer: want 0 got 1` | 给它传了参数 | 它无参数，可直接用在 `if` 里 |

更多排查入口见[故障排查](/troubleshooting/)。
