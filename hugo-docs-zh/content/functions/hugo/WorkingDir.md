+++
title = "hugo.WorkingDir"
linkTitle = "hugo.WorkingDir"
description = "返回项目的工作目录。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/functions/hugo/workingdir/"

[params.functions_and_methods]
signatures = ["hugo.WorkingDir"]
returnType = "string"
+++

## 这一页解决什么问题

你需要知道「这次构建是从哪个目录跑的」：写调试信息、生成指向本地文件的提示、在 CI 日志里标明工作路径，或者排查「为什么读不到某个文件」——所有相对路径（`content/`、`assets/`、`data/`）都以它为基准。`hugo.WorkingDir` 返回项目根目录的**绝对路径**。

## 什么时候用，什么时候别用

**该用**：

- 调试输出里标明构建位置；
- 需要把「相对项目根的路径」拼成绝对路径做提示（注意平台分隔符）。

**别用**：

- 想取资源/内容文件的路径并**发布到线上** → 这是构建机的本地绝对路径，不应出现在面向读者的页面里；
- 想取站点 URL 或发布目录 → 用 `site.BaseURL`、`hugo.PublishDir` 之类；本函数返回的是文件系统路径。

上游给出的示意输出：

```go-html-template
{{ hugo.WorkingDir }} → /home/user/projects/my-hugo-site
```

## 完整示例：在调试页输出项目路径

```go-html-template {file="layouts/_partials/debug-info.html"}
<p>项目目录：{{ hugo.WorkingDir }}</p>
```

在本机（Hugo 0.167.0 extended，Windows，临时站点 `C:\Users\hencter\AppData\Local\Temp\hugo-lead-hugo`）实测渲染为：

```html
<p>项目目录：C:\Users\hencter\AppData\Local\Temp\hugo-lead-hugo</p>
```

**你应当看到什么**：Windows 上是反斜杠分隔的绝对路径，**末尾没有分隔符**（实测输出结尾就是目录名，没有 `\`）；macOS/Linux 上则是 `/home/...` 这样的斜杠路径。你换一台机器构建，这个值就会不同，所以不要把它写死进断言。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点（`hugo --source <临时目录> --ignoreCache`）。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `{{ hugo.WorkingDir }}` | `string`，绝对路径（本机为 `C:\Users\hencter\AppData\Local\Temp\hugo-lead-hugo`） | 否 |
| 末尾分隔符 | 无 | 否 |
| 空值 / `nil` | 不适用：恒有值 | 否 |
| 传入参数 `{{ hugo.WorkingDir "x" }}` | —— | 是：`wrong number of args for WorkingDir: want 0 got 1` |
| 返回类型（`printf "%T"`） | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 本地能用的绝对路径拼接到线上页面后无意义 | `hugo.WorkingDir` 是构建机的本地路径 | 只在调试页/非生产环境输出，生产环境请用根相对链接 |
| 没报错但结果不对 | 拼路径时多出/少了一个分隔符 | Windows 是 `\`，且返回值末尾不带分隔符 | 用 `path.Join`/`printf "%s/%s"` 时先确认分隔符，跨平台优先用 [`path.Join`](/functions/path/join/) |
| 报错看不懂 | `wrong number of args for WorkingDir: want 0 got 1` | 给它传了参数 | 它无参数，直接写 `{{ hugo.WorkingDir }}` |

更多排查入口见[故障排查](/troubleshooting/)。
