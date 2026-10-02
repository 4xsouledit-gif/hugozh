+++
title = "Description"
linkTitle = "Description"
description = "返回前置元数据中定义的页面描述。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/methods/page/description/"

[params.functions_and_methods]
signatures = ["PAGE.Description"]
returnType = "string"
+++

## 这一页解决什么问题

`Description` 取出前置元数据里的 `description`，最常见的去处是 `<meta name="description">`、Open Graph 的 `og:description` 与列表页导语。它和摘要不是一回事：`description` 是你**手写**的一句话，`.Summary` 是从正文里**截出来**的一段。

## 什么时候用，什么时候别用

**该用**：

- 输出 `meta` / `og:description` / 结构化数据；
- 列表页想用手写导语，而不是正文截断出来的开头。

**别用**：

- 想显示正文开头 → 用 `.Summary`；
- 想显示纯文本正文 → 用 [`Plain`](/methods/page/plain/)；
- 假设它一定有值 → `description` 可以为空，模板要兜底（见下文）。

## 用法

页面描述在概念上不同于[内容摘要][]，通常用于页面自身的元数据。

```toml
title = 'How to make spicy tuna hand rolls'
description = 'Instructions for making spicy tuna hand rolls.'
```

```go-html-template {file="layouts/baseof.html"}
<head>
  <meta name="description" content="{{ .Description }}">
</head>
```

## 完整示例：写入 meta 标签

最小站点：`content/docs/guide/alpha.md` 的前置元数据有 `description = '演示 Page 方法的示例页面。'`；同目录 `beta.md` 没有写 `description`。模板放在 `layouts/baseof.html`：

```go-html-template {file="layouts/baseof.html"}
<meta name="description" content="{{ .Description }}">
```

`hugo --source <站点目录> --ignoreCache` 构建后，alpha 页面输出：

```html
<meta name="description" content="演示 Page 方法的示例页面。">
```

beta 页面（未定义 `description`）输出：

```html
<meta name="description" content="">
```

**你应当看到什么**：返回值是前置元数据里的原始字符串，不会自动截断，也不会剥离 Markdown 标记；没有定义时得到空值。要避免输出空的 `meta` 标签，用 `{{ with .Description }}` 包起来。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`alpha.md` 有 `description`，`beta.md` 没有。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 前置元数据有 `description` | 原样字符串 | 否 |
| 没有 `description` | 空值，`with` / `if` 判为假 | 否 |
| 值里含引号或 HTML | 输出时按所在上下文转义（放进属性里会被转义） | 否 |
| 值里含 Markdown | **不会**渲染，按纯文本原样输出 | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 页面里有空标签 | 出现 `<meta name="description" content="">` | 该页没有写 `description` | 用 `{{ with .Description }}` 包一层 |
| 没报错但结果不对 | 列表页导语与正文开头重复 | 把 `.Description` 与 `.Summary` 当成了同一个东西 | 导语用手写 `description`，正文摘要用 `.Summary` |
| 描述里出现了 `**` 之类的符号 | 以为 `description` 支持 Markdown | 它按纯文本输出 | 直接写纯文本，或改用 `markdownify`（注意转义） |

更多排查入口见[故障排查](/troubleshooting/)。

[内容摘要]: /content-management/summaries/
