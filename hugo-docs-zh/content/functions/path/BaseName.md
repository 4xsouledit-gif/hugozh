+++
title = "path.BaseName"
linkTitle = "BaseName"
description = "返回给定路径的最后一个元素并去掉扩展名（如果有）；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/path/basename/"

[params.functions_and_methods]
signatures = ["path.BaseName PATH"]
returnType = "string"
+++

## 这一页解决什么问题

把 `/a/b/news.html` 变成 `news`：生成锚点 id、构造「同名资源」路径、给下载文件起一个人类可读的名字。这是 [`path.Base`](/functions/path/base/) 再去掉扩展名的组合，`path.BaseName` 一步做完。

## 什么时候用，什么时候别用

**该用**：

- 从路径取「不带扩展名的文件名」；
- 按文件名生成锚点、`id`、`class` 或排序键；
- 和 [`path.Ext`](/functions/path/ext/) 配合：一个拿主体，一个拿扩展名。

**别用**：

- 想保留扩展名 → 用 [`path.Base`](/functions/path/base/)；
- 想拿目录 → 用 [`path.Dir`](/functions/path/dir/)；
- 想得到「双扩展名文件的主体」（`archive.tar.gz` → `archive`）→ 本函数只去掉**最后一个**扩展名，实测得到 `archive.tar`，需要再调用一次或自己处理；
- 想要**页面**自己的文件名 → 页面对象上的 `.File.BaseFileName` / `.File.TranslationBaseName` 更合适（前者保留语言标记语义，后者在多语言站点里更稳）；
- 想处理 URL ↔ 文件名的互转 → 见 [`urls`](/functions/urls/) 与 [`urlize`](/functions/urls/urlize/)。

## 上游给出的结果

```go-html-template
{{ path.BaseName "a/news.html" }} → news
{{ path.BaseName "news.html" }} → news
{{ path.BaseName "a/b/c" }} → c
{{ path.BaseName "/x/y/z/" }} → z
{{ path.BaseName "" }} → .
```

## 完整示例：去掉扩展名再取主体

```go-html-template {file="layouts/_partials/slug.html"}
{{ $p := "/images/photo.webp" }}
<p>{{ path.BaseName $p }}</p>
<p>{{ path.BaseName "archive.tar.gz" }}</p>
<p>{{ path.BaseName ".gitignore" }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>photo</p>
<p>archive.tar</p>
<p></p>
```

**你应当看到什么**：第二行是 `archive.tar`——只去掉最后一个 `.gz`，所以「双扩展名」要自己处理；第三行是**空字符串**——`.gitignore` 的第一个字符就是点，Go 的 `path.Ext` 认为整个文件名都是扩展名，于是主体为空（上游未说明，本页实测）。这一条在按文件名生成 slug 时会让结果变成空串，务必留意。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"a/news.html"`、`"news.html"` | `news` | 否 |
| `"a/b/c"`（无扩展名） | `c` | 否 |
| `"/x/y/z/"`（结尾斜杠） | `z` | 否 |
| `"archive.tar.gz"` | `archive.tar`（只去掉最后一个扩展名） | 否 |
| `".gitignore"`（以点开头的隐藏文件） | `""`（空字符串） | 否 |
| `"a/b/"`（结尾斜杠的目录） | `b` | 否 |
| `""` | `"."` | 否 |
| `nil` | `"."` | 否 |
| 数字（如 `42`） | `"42"` | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 隐藏文件（`.gitignore`、`.htaccess`）得到空名 | 整个文件名被当作扩展名 | 特判以 `.` 开头的名字，或直接使用原文件名 |
| 没报错但结果不对 | `archive.tar.gz` 只得到了 `archive.tar` | 只去掉最后一个扩展名 | 再调用一次，或用 [`strings.TrimSuffix`](/functions/strings/trimsuffix/) 处理已知后缀 |
| 没报错但结果不对 | 空输入得到 `.` | 与 Go `path` 包一致的行为 | 先判断非空 |
| 报错看不懂 | `unable to cast []int{1} of type []int to string` | 传入了切片、映射等非标量 | 传字符串，或先 [`cast.ToString`](/functions/cast/tostring/) |

更多排查入口见[故障排查](/troubleshooting/)。
