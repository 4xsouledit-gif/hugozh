+++
title = "IsHome"
linkTitle = "IsHome"
description = "报告给定页面是否为首页。"
date = 2026-10-02
weight = 310
source = "https://gohugo.io/methods/page/ishome/"

[params.functions_and_methods]
signatures = ["PAGE.IsHome"]
returnType = "bool"
+++

## 这一页解决什么问题

`IsHome` 判断当前页面是不是**首页**（`kind = home`）。首页模板往往与其他页面不同，如果在通用模板里判断，就需要它；它也是「不要在这一页显示面包屑 / 侧边栏」这类条件的基础。

## 什么时候用，什么时候别用

**该用**：

- 通用模板里给首页特殊处理（隐藏面包屑、换页头）；
- 站内链接里判断「是否已在首页」。

**别用**：

- 想判断 section 页 → 用 [`IsSection`](/methods/page/issection/)；
- 想判断分支页面（首页、section、分类法页、术语页）→ 用 [`IsBranch`](/methods/page/isbranch/)；
- 想拿首页页面对象 → 用 `site.Home`（Site 对象上的属性），而不是靠 `.IsHome` 拼。

## 用法

如果[页面种类](g)为 `home`，`Page` 对象上的 `IsHome` 方法就返回 `true`。

```tree
content/
├── books/
│   ├── book-1/
│   │   └── index.md  <-- kind = page
│   ├── book-2.md     <-- kind = page
│   └── _index.md     <-- kind = section
└── _index.md         <-- kind = home
```

```go-html-template
{{ .IsHome }}
```

## 完整示例：通用模板里给首页特殊处理

最小站点：`content/_index.md`（首页）与 `content/docs/guide/alpha.md`（普通页面）。模板放在 `layouts/baseof.html`：

```go-html-template {file="layouts/baseof.html"}
{{ if .IsHome }}
  <header class="home-header">{{ .Title }}</header>
{{ else }}
  <header class="page-header">{{ .Title }}</header>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，首页输出：

```html
<header class="home-header">首页</header>
```

普通页面输出：

```html
<header class="page-header">极长的页面标题，用来演示 LinkTitle 的回退与覆盖</header>
```

**你应当看到什么**：只有首页得到 `true`；section、分类法、术语、普通页面都是 `false`。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；站点含首页、section、术语页与普通页面。

| 页面 | `IsHome` | 是否报错 |
| --- | --- | --- |
| 首页 | `true` | 否 |
| section 页 `/docs/`、`/docs/guide/` | `false` | 否 |
| 分类法页 `/tags/`、术语页 `/tags/hugo/` | `false` | 否 |
| 普通页面、叶子包页面 | `false` | 否 |
| 返回类型 | `bool` | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 首页布局不生效 | 首页仍在用通用页头 | 判断写在了页面模板而不是 `baseof.html`（首页不走 single 模板） | 在 `baseof.html` 或 `layouts/index.html` 里判断 |
| 没报错但结果不对 | 把 section 页也当成首页 | `IsHome` 只对 `kind = home` 成立 | section 用 `IsSection`，分支用 `IsBranch` |
| 链接重复 | 首页上仍输出了「回首页」链接 | 没有判断当前页 | 用 `{{ if not .IsHome }}` 包住 |

更多排查入口见[故障排查](/troubleshooting/)。

