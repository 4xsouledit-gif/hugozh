+++
title = "os.ReadFile"
linkTitle = "ReadFile"
description = "返回文件的内容。"
date = 2026-10-02
weight = 50
source = "https://gohugo.io/functions/os/readfile/"

[params.functions_and_methods]
signatures = ["os.ReadFile PATH"]
returnType = "string"
aliases = ["readFile"]
+++

## 这一页解决什么问题

把项目里的一个文本文件原样搬进模板：`README.md`、`LICENSE`、一段 SVG、一个 CSV 片段。`os.ReadFile` 返回**未经解释**的原始内容——这一点很关键：Markdown 不会变成 HTML，模板语法也不会被执行。

## 什么时候用，什么时候别用

**该用**：

- 内联一段原始文本（许可证、说明、SVG 标记）；
- 把 Markdown 读进来后自己决定要不要渲染。

**别用**：

- 想让 Markdown 变成 HTML → 读出来之后还要过 [`transform.Markdownify`](/functions/transform/markdownify/)；
- 想处理资源（图片缩放、SCSS 编译、加指纹）→ 用 `resources.Get`，它返回资源对象；
- 只想判断文件在不在 → 用 [`os.FileExists`](/functions/os/fileexists/)：本函数对不存在的路径**返回空字符串而不报错**；
- 想读结构化数据 → 放进 `data/` 目录按数据文件使用。

## 用法

`os.ReadFile` 函数先尝试相对于项目目录的根解析路径。如果找不到匹配的文件，它会尝试相对于 [`contentDir`][] 解析路径。路径开头的分隔符（`/`）是可选的。

假设项目目录根下有一个名为 README.md 的文件：

```md
This is **bold** text.
```

以下模板代码：

```go-html-template
{{ readFile "README.md" }}
```

输出：

```html
This is **bold** text.
```

注意，`os.ReadFile` 返回的是原始（未经解释）内容。

[`contentDir`]: /configuration/all/#contentdir

## 完整示例（实测）

项目根下有内容为 `This is **bold** text.` 的 `README.md`，`content/about.md` 带前置元数据。

```go-html-template {file="layouts/_partials/inline.html"}
[{{ readFile "README.md" }}]
[{{ readFile "content/about.md" }}]
```

Hugo 0.167.0 实测输出（第二行的 `+` 与 `'` 在网页里会显示为 HTML 实体）：

```text
[This is **bold** text.]
[+++
title='About'
+++
About body]
```

**你应当看到什么**：第一行里 `**bold**` 原样出现——Markdown 没有被渲染；第二行连 `+++` 前置元数据都一起读出来了，说明本函数不区分正文与元数据。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 文件存在（实测 `"README.md"`） | 文件原文，逐字符返回（Markdown 标记不解释） | 否 |
| 文件不存在（实测 `readFile "nope.md"`） | `""`（空字符串） | **否**——静默返回空串 |
| 带前导斜杠（实测 `"/README.md"`） | 与不带斜杠等价 | 否 |
| 相对 `contentDir` 的路径（实测 `"content/about.md"`） | 连同前置元数据一起返回 | 否 |
| 路径指向**目录**（实测 `readFile "content"`） | —— | **是，构建失败**：`error calling readFile: read ...\content: Incorrect function.`（Windows 上的报错文案） |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上出现 `**bold**` 字样 | `readFile` 返回原文，不渲染 Markdown | 接 [`transform.Markdownify`](/functions/transform/markdownify/) |
| 没报错但结果不对 | 文件明明不存在，页面却是空的 | 不存在的路径返回空字符串、**不报错**（实测） | 先用 [`os.FileExists`](/functions/os/fileexists/) 判断 |
| 报错看不懂 | `error calling readFile: read …: Incorrect function.` | 传入的路径是**目录**而不是文件 | 改成具体文件的路径；列目录用 [`os.ReadDir`](/functions/os/readdir/) |
| 没报错但结果不对 | 相对路径读到了意外的文件 | 路径先按项目根解析，再按 `contentDir` 解析 | 路径尽量从项目根写全（如 `content/about.md`） |

更多排查入口见[故障排查](/troubleshooting/)。
