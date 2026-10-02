+++
title = "os.FileExists"
linkTitle = "FileExists"
description = "报告文件或目录是否存在。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/os/fileexists/"

[params.functions_and_methods]
signatures = ["os.FileExists PATH"]
returnType = "bool"
aliases = ["fileExists"]
+++

## 这一页解决什么问题

模板要按「有没有这个文件」分支时用它：站点根下有没有 `README.md`、内容目录里有没有那张配图、某个可选的数据文件是否提供。`os.FileExists` 只回答存在与否，不去读内容，因此比先 [`os.ReadFile`](/functions/os/readfile/) 再判断要安全得多——后者在路径不存在时只会给你一个空字符串。

## 什么时候用，什么时候别用

**该用**：

- 可选文件的存在性判断（有就渲染，没有就跳过）；
- 需要「目录也算存在」时（本函数对目录返回 `true`）。

**别用**：

- 想读内容 → 用 [`os.ReadFile`](/functions/os/readfile/)（注意：**传目录会让构建失败**）；
- 想要大小、修改时间等元信息 → 用 [`os.Stat`](/functions/os/stat/)；
- 想列出目录里的条目 → 用 [`os.ReadDir`](/functions/os/readdir/)；
- 想取得可处理的资源对象（图片、SCSS）→ 用 `resources.Get`：它返回 `nil` 而不是布尔值，可以直接 `with`。

## 用法

`os.FileExists` 函数先尝试相对于项目目录的根解析路径。如果找不到匹配的文件或目录，它会尝试相对于 [`contentDir`][] 解析路径。路径开头的分隔符（`/`）是可选的。

目录结构如下：

```tree
content/
├── about.md
├── contact.md
└── news/
    ├── article-1.md
    └── article-2.md
```

该函数返回以下值：

```go-html-template
{{ fileExists "content" }} → true
{{ fileExists "content/news" }} → true
{{ fileExists "content/news/article-1" }} → false
{{ fileExists "content/news/article-1.md" }} → true
{{ fileExists "news" }} → true
{{ fileExists "news/article-1" }} → false
{{ fileExists "news/article-1.md" }} → true
```

[`contentDir`]: /configuration/all/#contentdir

## 完整示例（实测）

在项目根下放置 `README.md`，并准备上面的 `content/` 目录结构：

```go-html-template {file="layouts/_partials/has-file.html"}
[{{ fileExists "news/article-1.md" }}]|[{{ fileExists "news/article-1" }}]|[{{ fileExists "nope" }}]
```

Hugo 0.167.0 实测输出：

```text
[true]|[false]|[false]
```

**你应当看到什么**：`news/article-1.md` 存在（路径可以先相对于项目根解析，再相对于 `contentDir`），所以是 `true`；漏掉扩展名的 `news/article-1` 是 `false`；完全不存在的路径也是 `false`，不报错。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows；项目结构与上游示例一致。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"content"`、`"content/news"`（目录） | `true`——**目录也算存在** | 否 |
| `"content/news/article-1"`（缺扩展名） | `false` | 否 |
| `"content/news/article-1.md"` | `true` | 否 |
| `"news"`、`"news/article-1.md"`（相对 `contentDir`） | `true` | 否 |
| `"nope"`（完全不存在） | `false` | 否 |
| `"/README.md"`（带前导斜杠） | `true`——前导斜杠可选 | 否 |
| 返回类型 | `bool`，永远不是 `nil` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 判断「文件存在」通过了，读出来却是目录 | 目录也返回 `true`（实测 `"content"` 为 `true`） | 需要区分类型就用 [`os.Stat`](/functions/os/stat/) 看 `.IsDir` |
| 没报错但结果不对 | 明明有文件却返回 `false` | 漏写扩展名（实测缺 `.md` 就是 `false`），或路径基准不对 | 补全文件名；记住路径先按项目根、再按 `contentDir` 解析 |
| 报错看不懂 | 想确认存在就调用 [`os.ReadFile`](/functions/os/readfile/)，结果拿到空字符串 | 该函数对不存在的路径返回空串、不报错 | 先 `fileExists` 判断，再读 |

更多排查入口见[故障排查](/troubleshooting/)。
