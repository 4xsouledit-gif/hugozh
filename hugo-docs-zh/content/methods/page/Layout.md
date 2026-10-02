+++
title = "Layout"
linkTitle = "Layout"
description = "返回前置元数据中定义的页面布局。"
date = 2026-10-02
weight = 410
source = "https://gohugo.io/methods/page/layout/"

[params.functions_and_methods]
signatures = ["PAGE.Layout"]
returnType = "string"
+++

## 这一页解决什么问题

`Layout` 读回前置元数据里的 `layout` 字段——也就是你为该页面**手动指定**的模板名。它主要用于排查「这个页面到底用了哪个模板」，也可以让模板根据自身布局做分支。

## 什么时候用，什么时候别用

**该用**：

- 排查模板是否按预期生效（打印出来看一眼最快）；
- 同一套模板服务多种版式时，按 `.Layout` 走不同分支。

**别用**：

- 想拿到**实际使用的模板文件名**（例如 `_default/single.html`）→ Hugo 没有公开这一信息，`.Layout` 只反映前置元数据的值；
- 想按页面种类选模板 → 那是[模板查找顺序](/templates/lookup-order/)的职责，用 [`Kind`](/methods/page/kind/) 判断即可。

## 用法

在前置元数据中指定 `layout` 字段即可指向特定模板。详见[说明][]。

```toml
title = 'Contact'
layout = 'contact'
```

Hugo 会用 contact.html 渲染该页面。

```tree
layouts/
├── baseof.html
├── contact.html
├── home.html
├── page.html
├── section.html
├── taxonomy.html
└── term.html
```

虽然在模板中很少用到，但你可以这样取值：

```go-html-template
{{ .Layout }}
```

如果前置元数据中没有定义 `layout` 字段，`Layout` 方法返回空字符串。

## 完整示例：确认页面用的是哪个布局

最小站点：`content/docs/guide/alpha.md` 的前置元数据写 `layout = 'lab-alpha'`（本项目里存在 `layouts/_default/lab-alpha.html`）；首页与 section 页都不写 `layout`。模板：

```go-html-template {file="layouts/_default/single.html"}
<p>layout={{ .Layout }}</p>
```

`hugo --source <站点目录> --ignoreCache` 构建后，alpha 输出：

```html
<p>layout=lab-alpha</p>
```

首页与 section 页（未指定 `layout`）用同一个表达式渲染，输出：

```html
<p>layout=</p>
```

**你应当看到什么**：返回值就是前置元数据里写的那个字符串；没写时是**空字符串**，不是页面种类、也不是模板文件名。注意它反映的是「你指定了什么」，即使该模板不存在（Hugo 会退回默认模板），`.Layout` 依然返回你写的值。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`alpha.md` 写了 `layout = 'lab-alpha'`，首页与 section 页未写。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 前置元数据写了 `layout` | 原样字符串（如 `lab-alpha`） | 否 |
| 未写 `layout`（首页、section 页、普通页面） | 空字符串，`with` 判为假 | 否 |
| 指定的模板不存在 | 仍返回该字符串；页面用默认模板渲染 | 否（可能伴随模板查找警告） |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| `layout` 不生效 | 页面还是用默认模板 | 模板文件放错目录或文件名不匹配 | 对照[模板查找顺序](/templates/lookup-order/#target-a-template)：通常放 `layouts/_default/<layout>.html` |
| 拼错了却不报错 | 页面正常渲染，但版式不对 | `layout` 指向不存在的模板时 Hugo 会退回默认模板 | 临时打印 `{{ .Layout }}` 核对 |
| 把 `.Layout` 当模板路径 | 拼出的路径不存在 | 它只是前置元数据里的值 | 需要模板名时自己拼，例如 `printf "_default/%s.html" .Layout`（仅用于展示） |

更多排查入口见[故障排查](/troubleshooting/)。

[说明]: /templates/lookup-order/#target-a-template
