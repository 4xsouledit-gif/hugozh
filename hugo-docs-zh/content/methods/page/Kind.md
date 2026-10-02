+++
title = "Kind"
linkTitle = "Kind"
description = "返回给定页面的种类。"
date = 2026-10-02
weight = 380
source = "https://gohugo.io/methods/page/kind/"

[params.functions_and_methods]
signatures = ["PAGE.Kind"]
returnType = "string"
+++

## 这一页解决什么问题

`Kind` 用一个小写单词告诉你**这是哪一类页面**：`home`、`page`、`section`、`taxonomy`、`term`。模板要根据页面类型走不同分支时，它是最省事的判断依据（比 `IsPage` / `IsSection` 那一组方法更紧凑）。

## 什么时候用，什么时候别用

**该用**：

- 用 `if` / `else if` 按页面类型分流；
- 调试时快速确认某个页面的类型。

**别用**：

- 只想判断「是不是普通页面」→ 用 [`IsPage`](/methods/page/ispage/) 更直白；
- 想判断「是不是分支」→ 用 [`IsBranch`](/methods/page/isbranch/)；
- 想拿 section 页对象 → 用 [`CurrentSection`](/methods/page/currentsection/)，`Kind` 只给字符串。

## 用法

[页面种类](g)是 `home`、`page`、`section`、`taxonomy` 或 `term` 之一。

```tree
content/
├── books/
│   ├── book-1/
│   │   └── index.md    <-- kind = page
│   ├── book-2.md       <-- kind = page
│   └── _index.md       <-- kind = section
├── tags/
│   ├── fiction/
│   │   └── _index.md   <-- kind = term
│   └── _index.md       <-- kind = taxonomy
└── _index.md           <-- kind = home
```

在模板中取值：

```go-html-template
{{ .Kind }}
```

## 完整示例：按页面类型分流

最小站点：首页、`content/docs/guide/_index.md`（section）、`content/docs/guide/alpha.md`（普通页面）、默认 `tags` 分类法生成的 `/tags/`（taxonomy）与 `/tags/hugo/`（term）。模板：

```go-html-template {file="layouts/_default/baseof.html"}
{{ if eq .Kind "home" }}<p>首页</p>
{{ else if eq .Kind "page" }}<p>内容页</p>
{{ else if eq .Kind "section" }}<p>栏目页</p>
{{ else }}<p>分类法或术语页</p>{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，把同一个模板用在各类页面上会依次得到：

```html
<p>首页</p>
<p>内容页</p>
<p>栏目页</p>
<p>分类法或术语页</p>
```

**你应当看到什么**：`.Kind` 的值是五个固定字符串之一；与 `IsHome` / `IsPage` / `IsSection` 的判断结果一致（见各页实测表）。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；站点含首页、两层 section、普通页面、分类法页与术语页。

| 页面 | `.Kind` | 是否报错 |
| --- | --- | --- |
| 首页 | `home` | 否 |
| 普通页面、叶子包页面 | `page` | 否 |
| section 页 | `section` | 否 |
| 分类法页 `/tags/` | `taxonomy` | 否 |
| 术语页 `/tags/hugo/` | `term` | 否 |
| 返回类型 | `string`（小写） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 判断不生效 | `eq .Kind "Page"` 为假 | 值是小写 | 用小写字面量，或先 `lower` |
| 分支页面没有正文 | 用 `page` 分支渲染了列表页 | section 页的 `.Kind` 是 `section` | 各类型分别处理，或改用 `IsBranch` |
| 叶子包被当成别的类型 | 误以为叶子包是另一种 kind | 叶子包也是 `page` | 需要包类型时用 [`BundleType`](/methods/page/bundletype/) |

更多排查入口见[故障排查](/troubleshooting/)。

