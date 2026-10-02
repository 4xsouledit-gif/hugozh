+++
title = "path.Split"
linkTitle = "Split"
description = "返回给定路径的目录与文件名两部分，分割点在最后一个斜杠之后；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/functions/path/split/"

[params.functions_and_methods]
signatures = ["path.Split PATH"]
returnType = "paths.DirFile"
+++

## 这一页解决什么问题

一次拿到路径的「目录」和「文件名」两部分。相比分别调用 [`path.Dir`](/functions/path/dir/) 与 [`path.Base`](/functions/path/base/)，`path.Split` 的优势是 `.Dir` **保留结尾斜杠**，两者拼起来正好还原原路径（上游说明的性质：`path = dir + file`）。

返回的不是字符串而是一个结构体（实测类型为 `paths.DirFile`），用 `.Dir` 与 `.File` 取字段。

## 什么时候用，什么时候别用

**该用**：

- 需要同时用到目录和文件名，且希望拼回原路径不出错；
- 从资源路径推「同名文件放在同目录」的路径：`{{ printf "%s%s.webp" $df.Dir $df.File }}` 这类拼法；
- 想区分「结尾是目录」（`.File` 为空）与「结尾是文件」。

**别用**：

- 只需要文件名 → 用 [`path.Base`](/functions/path/base/)；
- 只需要目录且不想带结尾斜杠 → 用 [`path.Dir`](/functions/path/dir/)（实测 `path.Dir "a/news.html"` → `a`，而 `path.Split` 的 `.Dir` 是 `a/`）；
- 想解析 URL 的查询串与片段 → `Split` 不认识 `?`、`#`，用 [`urls`](/functions/urls/) 或 [`urls.Parse`](/functions/urls/parse/)；
- 想按**任意分隔符**切字符串 → 用 [`strings.Split`](/functions/strings/split/)，`path.Split` 只按斜杠切一刀。

## 上游给出的结果

如果给定路径中没有斜杠，`path.Split` 返回的目录为空，文件名部分就是整条路径。两个返回值满足 path = dir+file。

```go-html-template
{{ $dirFile := path.Split "a/news.html" }}
{{ $dirFile.Dir }} → a/
{{ $dirFile.File }} → news.html

{{ $dirFile := path.Split "news.html" }}
{{ $dirFile.Dir }} → "" (empty string)
{{ $dirFile.File }} → news.html

{{ $dirFile := path.Split "a/b/c" }}
{{ $dirFile.Dir }} → a/b/
{{ $dirFile.File }} → c
```

## 完整示例：拆出目录与文件名

```go-html-template {file="layouts/_partials/split.html"}
{{ $df := path.Split "/images/photo.webp" }}
<p>{{ $df.Dir }}|{{ $df.File }}</p>
{{ $df = path.Split "photo.webp" }}
<p>{{ $df.Dir }}|{{ $df.File }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>/images/|photo.webp</p>
<p>|photo.webp</p>
```

**你应当看到什么**：第一行 `.Dir` 带结尾斜杠（`/images/`），第二行没有目录时 `.Dir` 是空字符串——所以「`Dir + File` 还原原路径」在两种情况下都成立。这与 [`path.Dir`](/functions/path/dir/) 的行为不同（后者对 `photo.webp` 返回 `.`）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | `.Dir` | `.File` | 是否报错 |
| --- | --- | --- | --- |
| `"a/news.html"` | `a/` | `news.html` | 否 |
| `"news.html"`（无斜杠） | `""` | `news.html` | 否 |
| `"a/b/c"` | `a/b/` | `c` | 否 |
| `"/a/b/"`（结尾斜杠） | `/a/b/` | `""` | 否 |
| `""` | `""` | `""` | 否 |
| `nil` | `""` | `""` | 否 |
| 返回类型 | `paths.DirFile`（实测 `printf "%T"` 输出 `paths.DirFile`），字段为 `.Dir` / `.File` | | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 用 `{{ $df }}` 直接输出，得到结构体的调试形式 | 返回的是结构体，不是字符串 | 明确取 `.Dir` 或 `.File` |
| 没报错但结果不对 | 拿 `.Dir` 当 [`path.Dir`](/functions/path/dir/) 用，结果多一个 `/` | `Split` 的 `.Dir` 保留结尾斜杠（这是它拼回原路径的前提） | 需要不带斜杠的目录就用 `path.Dir`，或自己 [`strings.TrimSuffix "/"`](/functions/strings/trimsuffix/) |
| 没报错但结果不对 | 结尾是目录时 `.File` 为空，模板里输出空白 | `"/a/b/"` 的 `.File` 是空字符串 | 判断空再决定是否拼文件名 |
| 没报错但结果不对 | 想拆 URL 的查询串 | `Split` 只按最后一个斜杠切，不解析 `?` / `#` | 用 [`urls.Parse`](/functions/urls/parse/) 或先 [`strings.Split`](/functions/strings/split/) |

更多排查入口见[故障排查](/troubleshooting/)。
