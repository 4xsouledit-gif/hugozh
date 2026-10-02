+++
title = "path.Ext"
linkTitle = "Ext"
description = "返回给定路径的文件扩展名；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/path/ext/"

[params.functions_and_methods]
signatures = ["path.Ext PATH"]
returnType = "string"
+++

## 这一页解决什么问题

按扩展名分支是最常见的模板判断之一：`.png` 走图片标签、`.mp4` 走视频、`.pdf` 加个下载图标。`path.Ext` 把路径尾段的扩展名取出来（**带点**），交给 `if`/`eq` 或 `switch` 用。

它只看最后一个点，且只在**最后一段**里找点，所以 `a.b/c` 的扩展名是空——目录名里的点不算。

## 什么时候用，什么时候别用

**该用**：

- 按文件类型选择渲染方式：`{{ if eq (path.Ext $src) ".mp4" }}`；
- 显示或比较扩展名；
- 与 [`path.BaseName`](/functions/path/basename/) 配对，分别拿到「主体」和「扩展名」。

**别用**：

- 判断**资源类型**（是不是图片、能不能处理）→ 用 [`resources`](/functions/resources/) 的 `.MediaType` / `.ResourceType`，比字符串猜扩展名可靠；
- 想按 MIME 类型输出 `type` 属性 → 用资源的 `.MediaType.Type`；
- 想去掉扩展名 → 用 [`path.BaseName`](/functions/path/basename/)；
- 想取文件名 → 用 [`path.Base`](/functions/path/base/)；
- 不是 `string` 的输入 → 先 [`cast.ToString`](/functions/cast/tostring/)；切片会直接报错。

## 上游给出的结果

扩展名是路径中最后一个以斜杠分隔的元素里、从最后一个点开始的后缀；如果没有点，则为空字符串。

```go-html-template
{{ path.Ext "a/b/c/news.html" }} → .html
```

## 完整示例：按扩展名分支

```go-html-template {file="layouts/_partials/ext.html"}
{{ $p := "/images/photo.webp" }}
<p>{{ path.Ext $p }}</p>
<p>{{ path.Ext "archive.tar.gz" }}</p>
<p>{{ path.Ext "README" }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>.webp</p>
<p>.gz</p>
<p></p>
```

**你应当看到什么**：返回值**带点**（`.webp` 而不是 `webp`），比较时别漏；第二行只给出**最后一个**扩展名；第三行没有点时是空字符串。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"a/b/c/news.html"` | `.html` | 否 |
| `"news.tar.gz"` | `.gz`（只取最后一个点之后） | 否 |
| `"a.b/c"`（点在目录段） | `""`（空字符串） | 否 |
| `"a/b/c"`、`"README"`（无点） | `""` | 否 |
| `"/x/y/z/"`（结尾斜杠） | `""` | 否 |
| `".gitignore"` | `.gitignore`（整个名字被当作扩展名） | 否 |
| `""`、`nil` | `""` | 否 |
| 返回类型 | `string`，结果是空串或「点 + 后缀」 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | `eq (path.Ext $p) "webp"` 永远为假 | 返回值带前导点 | 比较 `.webp`，或用 [`strings.TrimPrefix "."`](/functions/strings/trimprefix/) |
| 没报错但结果不对 | 隐藏文件（`.gitignore`）的扩展名是它自己 | 只看最后一个点，而点在首位 | 特判以 `.` 开头的名字 |
| 没报错但结果不对 | `a.b/c` 被判成了有扩展名 | 只在最后一段里找点 | 先 [`path.Base`](/functions/path/base/) 再判断，或直接用资源的 `.MediaType` |
| 报错看不懂 | `unable to cast ... to string` | 传入的不是字符串 | 先 [`cast.ToString`](/functions/cast/tostring/) |

更多排查入口见[故障排查](/troubleshooting/)。
