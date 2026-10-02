+++
title = "path.Dir"
linkTitle = "Dir"
description = "返回给定路径中除最后一个元素以外的部分；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/path/dir/"

[params.functions_and_methods]
signatures = ["path.Dir PATH"]
returnType = "string"
+++

## 这一页解决什么问题

要从 `/images/2024/photo.webp` 得到 `/images/2024`：给「上一级」链接、按目录分组、从文件路径回溯目录。`path.Dir` 就是取「去掉最后一段」的结果。

它与 [`path.Base`](/functions/path/base/) 正好互补：`Dir` + `/` + `Base` 能还原原路径（`Dir` 不保留结尾斜杠，要拼接时自己补）。

## 什么时候用，什么时候别用

**该用**：

- 从文件路径回溯它所在的目录；
- 生成「返回上级」链接（记得再用 [`urls.RelURL`](/functions/urls/relurl/) 处理，或至少保证前缀正确）；
- 与 [`path.Base`](/functions/path/base/) 配合，把一条路径拆成目录与文件名。

**别用**：

- 想一次拿到目录和文件名两个部分 → 用 [`path.Split`](/functions/path/split/)，它的 `Dir` 保留结尾斜杠、`File` 是尾段，比「`Dir` 再拼斜杠」更贴合原路径；
- 想要文件名 → 用 [`path.Base`](/functions/path/base/)；
- 想要页面在站内的目录 → 页面对象有 `.RelPermalink`、`.Section`、`.CurrentSection` 等现成属性，别对永久链接做字符串切割；
- 只想到上一级再规范化 `..` → 用 [`path.Join`](/functions/path/join/)（例如 `path.Join $dir ".."`），它内部会做 [`path.Clean`](/functions/path/clean/)。

## 上游给出的结果

```go-html-template
{{ path.Dir "a/news.html" }} → a
{{ path.Dir "news.html" }} → .
{{ path.Dir "a/b/c" }} → a/b
{{ path.Dir "/a/b/c" }} → /a/b
{{ path.Dir "/a/b/c/" }} → /a/b/c
{{ path.Dir "" }} → .
```

## 完整示例：从图片路径回溯目录

```go-html-template {file="layouts/_partials/dir.html"}
{{ $p := "/images/2024/photo.webp" }}
<p>{{ path.Dir $p }}</p>
<p>{{ path.Dir "photo.webp" }}</p>
<p>{{ path.Dir "/a/b/" }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>/images/2024</p>
<p>.</p>
<p>/a/b</p>
```

**你应当看到什么**：第一行去掉了 `photo.webp` 且**不保留结尾斜杠**；第二行说明没有目录时返回 `.`（不是空字符串），直接输出会在页面上看到孤立的点，需要自己判空或改用 [`path.Split`](/functions/path/split/)；第三行确认结尾斜杠不影响结果。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"a/news.html"` | `a` | 否 |
| `"news.html"`（无目录） | `"."` | 否 |
| `"a/b/c"` | `a/b` | 否 |
| `"/a/b/c"`、`"/a/b/c/"` | `/a/b`、`/a/b/c` | 否 |
| `"a\\b\\c.html"`（Windows 反斜杠） | `a/b` | 否 |
| `""` | `"."` | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 拼接 `{{ path.Dir $p }}/{{ path.Base $p }}` 得到 `a/news.html` 但少了斜杠语义 | `Dir` 不保留结尾斜杠 | 手工补 `/`，或改用 [`path.Split`](/functions/path/split/) 的 `.Dir`（它保留斜杠） |
| 没报错但结果不对 | 无目录的路径渲染出 `.` | 返回 `.` 而不是空串 | 判空或改用 `path.Split` |
| 没报错但结果不对 | 对页面永久链接做切割，得到意外目录 | 永久链接是 URL，不是文件路径 | 用页面对象的 `.CurrentSection`、`.Section` 等属性 |
| 报错看不懂 | `unable to cast ... to string` | 传入了切片、映射等非标量 | 传字符串 |

更多排查入口见[故障排查](/troubleshooting/)。
