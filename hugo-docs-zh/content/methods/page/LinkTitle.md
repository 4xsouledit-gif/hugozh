+++
title = "LinkTitle"
linkTitle = "LinkTitle"
description = "返回给定页面的链接标题。"
date = 2026-10-02
weight = 430
source = "https://gohugo.io/methods/page/linktitle/"

[params.functions_and_methods]
signatures = ["PAGE.LinkTitle"]
returnType = "string"
+++

## 这一页解决什么问题

`LinkTitle` 返回**适合当链接文字**的标题：优先取前置元数据的 `linkTitle`，没写就回退到 `Title`。导航、卡片、上下篇链接都用它，这样长标题不会把导航撑破。

## 什么时候用，什么时候别用

**该用**：

- 生成 `<a>` 的文字（列表、导航、相关文章）；
- 想让短标题只影响链接、不影响页面主标题。

**别用**：

- 想要页面**完整标题**（`<h1>`、`<title>`）→ 用 `.Title`；
- 想要侧栏用的短名 → 就是 `linkTitle`，但注意它同时也是侧栏的排序显示名；
- 想要文件名派生的名字 → 用 `.File.ContentBaseName` 之类。

## 用法

`LinkTitle` 方法返回前置元数据中定义的 `linkTitle` 字段；若未定义，则回退到 [`Title`][] 方法的返回值。

```toml
title = 'Seventeen delightful recipes for healthy desserts'
linkTitle = 'Dessert recipes'
```

```go-html-template
{{ .LinkTitle }} → Dessert recipes
```

如上所示，当页面标题很长时，在前置元数据中定义链接标题是有好处的。在模板中生成锚元素时可以用它：

```go-html-template
<a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
```

## 完整示例：链接文字用短标题

最小站点：`content/docs/guide/alpha.md` 的 `title` 很长、`linkTitle = 'Alpha 页'`；同目录 `beta.md` 只写了 `title = 'Beta'`、没有 `linkTitle`。模板：

```go-html-template {file="layouts/_default/single.html"}
<a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a>
```

`hugo --source <站点目录> --ignoreCache` 构建后，alpha 输出：

```html
<a href="/docs/guide/alpha/">Alpha 页</a>
```

beta（没有 `linkTitle`）输出：

```html
<a href="/docs/guide/beta/">Beta</a>
```

**你应当看到什么**：alpha 用了短名 `Alpha 页`，beta 回退到标题 `Beta`；两者的 `.RelPermalink` 不受影响。译文页面（`linkTitle = 'Alpha 中文'`）同样取各自的短名。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`alpha.md` 的 `title` 为长标题、`linkTitle = 'Alpha 页'`；`beta.md` 无 `linkTitle`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 前置元数据有 `linkTitle` | 原样字符串 | 否 |
| 没有 `linkTitle` | 回退到 `.Title` | 否 |
| `linkTitle` 为空字符串 | 回退到 `.Title` | 否 |
| 译文页面 | 取各自语言文件里的值 | 否 |
| 返回类型 | `string` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 导航被长标题撑破 | 链接文字用了 `.Title` | 长标题适合页面主标题，不适合导航 | 加 `linkTitle` 并改用 `.LinkTitle` |
| 想在正文里显示长标题却显示成短的 | `<h1>` 里用了 `.LinkTitle` | `LinkTitle` 优先取短名 | `<h1>` 用 `.Title` |
| `linkTitle` 没生效 | 键名拼错（如 `linktitle` / `link_title`） | 前置元数据键名必须精确 | 用 `linkTitle`（TOML/YAML 大小写敏感） |
| 列表排序变了 | 侧栏顺序与预期不同 | 侧栏常按 `linkTitle` 显示并参与排序 | 检查各页 `weight` 与 `linkTitle` |

更多排查入口见[故障排查](/troubleshooting/)。

[`Title`]: /methods/page/title/
