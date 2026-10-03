+++
title = "GetPage"
linkTitle = "GetPage"
description = "根据给定路径返回 Page 对象。"
date = 2026-10-02
weight = 210
source = "https://gohugo.io/methods/page/getpage/"
aliases = ["/functions/getpage"]

[params.functions_and_methods]
signatures = ["PAGE.GetPage PATH"]
returnType = "page.Page"
+++

## 这一页解决什么问题

模板里常常要「按路径拿到另一个页面」：跨栏目引用、取固定页面做首页区块、从当前页找同目录的兄弟页。`GetPage` 就是这条路：给一个路径，返回 `Page` 对象；**找不到时返回 `nil`**，因此必须做防御。

## 什么时候用，什么时候别用

**该用**：

- 取已知路径的页面（`/about/`、`/docs/guide/beta/`）；
- 从当前页按相对路径取同目录 / 上级的页面。

**别用**：

- 想按标题或参数找页面 → 用 [`where`](/functions/collections/where/) 从集合里筛；
- 想拿当前页 → 直接用 `.`；
- 想在 `range` 里遍历一堆页面 → 用 `.Pages` / `.RegularPages`，不要循环调用 `GetPage`；
- 拿到结果不判断就访问字段 → 路径写错时会直接报错。

## 用法

`GetPage` 方法在 `Site` 对象上也可用。详见[说明][]。

在 `Page` 对象上使用 `GetPage` 方法时，请指定相对于当前目录或相对于 `content` 目录的路径。

如果 Hugo 无法把路径解析为页面，该方法返回 `nil`。如果路径有歧义，Hugo 会抛出错误并中止构建。

内容结构如下：

```tree
content/
├── works/
│   ├── paintings/
│   │   ├── _index.md
│   │   ├── starry-night.md
│   │   └── the-mona-lisa.md
│   ├── sculptures/
│   │   ├── _index.md
│   │   ├── david.md
│   │   └── the-thinker.md
│   └── _index.md
└── _index.md
```

下面的示例展示了渲染 `works/paintings/the-mona-lisa.md` 的结果：

```go-html-template {file="layouts/works/page.html"}
{{ with .GetPage "starry-night" }}
  {{ .Title }} → Starry Night
{{ end }}

{{ with .GetPage "./starry-night" }}
  {{ .Title }} → Starry Night
{{ end }}

{{ with .GetPage "../paintings/starry-night" }}
  {{ .Title }} → Starry Night
{{ end }}

{{ with .GetPage "/works/paintings/starry-night" }}
  {{ .Title }} → Starry Night
{{ end }}

{{ with .GetPage "../sculptures/david" }}
  {{ .Title }} → David
{{ end }}

{{ with .GetPage "/works/sculptures/david" }}
  {{ .Title }} → David
{{ end }}
```

## 完整示例：取同目录的另一个页面

最小站点：`content/docs/guide/alpha.md` 与 `content/docs/guide/beta.md`。模板放在 `layouts/_default/single.html`：

```go-html-template {file="layouts/_default/single.html"}
{{ with .GetPage "beta" }}
  <a href="{{ .RelPermalink }}">{{ .Title }}</a>
{{ else }}
  <p>没有找到该页面</p>
{{ end }}
```

`hugo --source <站点目录> --ignoreCache` 构建后，alpha 页面输出：

```html
<a href="/docs/guide/beta/">Beta</a>
```

**你应当看到什么**：相对路径 `beta` 与相对 `content` 根的 `/docs/guide/beta` 得到**同一个页面**（实测两者都渲染出 `Beta`）；写成不存在的路径（如 `nope`）时 `with` 判为假，输出兜底文案而不是让构建失败。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；调用位置是 `/docs/guide/alpha` 页面。

| 调用 | 结果 | 是否报错 |
| --- | --- | --- |
| `.GetPage "beta"`（相对当前目录） | 同目录页面 | 否 |
| `.GetPage "/docs/guide/beta"`（相对 content 根） | 同一个页面 | 否 |
| `.GetPage "guide"`（相对父目录） | `/docs/guide` 这个 section 页 | 否 |
| `.GetPage "nope"` | **`nil`**，`with` 判为假 | 否 |
| 对 `nil` 结果接着访问 `.Title` | —— | 是：模板渲染报错 |
| 路径有歧义 | —— | 是：Hugo 报错并中止构建（上游已说明） |
| 返回类型 | `page.Page`（可能为 `nil`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 构建报错 | `nil pointer evaluating …Title` | 路径写错，`GetPage` 返回 `nil` | 用 `{{ with .GetPage "…" }}` 包起来，并加 `else` 给出提示或 `errorf` |
| 没报错但结果不对 | 相对路径取到的不是预期页面 | 相对路径以**当前页面所在目录**为基准 | 不确定时写以 `/` 开头、相对 `content` 根的路径 |
| 构建报错 | 路径歧义导致构建中止 | 同一路径匹配到多个页面 | 写完整路径，或改用 `.Site.GetPage` |

更多排查入口见[故障排查](/troubleshooting/)。

[说明]: /methods/site/getpage/
