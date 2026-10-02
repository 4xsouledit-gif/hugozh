+++
title = "path.Base"
linkTitle = "Base"
description = "返回给定路径的最后一个元素；路径分隔符会先替换为斜杠（`/`）。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/path/base/"

[params.functions_and_methods]
signatures = ["path.Base PATH"]
returnType = "string"
+++

## 这一页解决什么问题

拿到一条路径（`/images/2024/photo.webp`），只要最后那一段（`photo.webp`）：显示文件名、给下载链接生成 `download` 属性、从资源路径推断类型。`path.Base` 就是这件事。

它处理的是**路径字符串**，不是文件系统：分隔符统一按斜杠理解，Windows 反斜杠也会被换算成 `/`（实测），不需要文件真的存在。

## 什么时候用，什么时候别用

**该用**：

- 从路径取文件名（含扩展名）：`/a/b/news.html` → `news.html`；
- 路径来自 `resources`、`hugo.Data` 或参数，需要显示尾段；
- 想统一处理 Windows/Linux 两种分隔符。

**别用**：

- 想**去掉扩展名** → 用 [`path.BaseName`](/functions/path/basename/)；`Base` 会把 `.html` 一起留下；
- 想要目录部分 → 用 [`path.Dir`](/functions/path/dir/)；
- 想同时拿到目录和文件名 → 用 [`path.Split`](/functions/path/split/)，一次调用拿到两个字段；
- 想拼接路径或规范化 `..`、`//` → 用 [`path.Join`](/functions/path/join/) / [`path.Clean`](/functions/path/clean/)；
- 想取**页面**的文件名 → 页面对象上有现成的 `.File.BaseFileName`（无扩展名）和 `.File.TranslationBaseName`，比手工 `path.Base` 稳妥。另外绝对 URL 请用 [`urls`](/functions/urls/) 系列处理，不要手工切字符串。

## 上游给出的结果

```go-html-template
{{ path.Base "a/news.html" }} → news.html
{{ path.Base "news.html" }} → news.html
{{ path.Base "a/b/c" }} → c
{{ path.Base "/x/y/z/" }} → z
{{ path.Base "" }} → .
```

## 完整示例：从资源路径取文件名

```go-html-template {file="layouts/_partials/basename.html"}
{{ $p := "/images/photo.webp" }}
<p>{{ path.Base $p }}</p>
<p>{{ path.Base "a\\b\\c.html" }}</p>
<p>{{ path.Base "" }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>photo.webp</p>
<p>c.html</p>
<p>.</p>
```

**你应当看到什么**：第二行说明 **Windows 风格的反斜杠也会被当作分隔符**（模板字符串里写成 `\\`，实际是一个 `\`）；第三行是空输入的特例——返回的是 `.` 而不是空字符串，这是从 Go 的 `path` 包继承来的行为，页面上直接输出会看到一个孤零零的点。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"a/news.html"`、`"news.html"`、`"a/b/c"` | `news.html`、`news.html`、`c` | 否 |
| `"/x/y/z/"`（结尾斜杠） | `z` | 否 |
| `""` | `"."` | 否 |
| `"a\\b\\c.html"`（Windows 反斜杠） | `c.html` | 否 |
| `nil` | `"."`（按空路径处理） | 否 |
| 数字（如 `42`） | `"42"` | 否 |
| 切片、映射等非标量 | —— | 是：`error calling Base: unable to cast []int{1} of type []int to string` |
| 返回类型 | `string`，永不返回空以外的类型 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上出现一个孤立的 `.` | 空输入返回 `"."` | 先判断输入非空，或改用 `with path.Base $p` |
| 没报错但结果不对 | 输出带着 `.html`，只想要名字 | `Base` 保留扩展名 | 改用 [`path.BaseName`](/functions/path/basename/) |
| 没报错但结果不对 | 路径里有 `..`、多余斜杠时结果不合预期 | `Base` 只看最后一段，不做规范化 | 先 [`path.Clean`](/functions/path/clean/) 再 `Base` |
| 报错看不懂 | `unable to cast []int{1} of type []int to string` | 传了切片/映射等非字符串值 | 传字符串，或先 [`cast.ToString`](/functions/cast/tostring/) |

更多排查入口见[故障排查](/troubleshooting/)。
