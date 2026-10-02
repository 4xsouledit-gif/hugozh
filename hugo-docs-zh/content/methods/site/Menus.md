+++
title = "Menus"
linkTitle = "Menus"
description = "返回给定站点的菜单对象集合。"
date = 2026-10-02
weight = 160
source = "https://gohugo.io/methods/site/menus/"

[params.functions_and_methods]
signatures = ["SITE.Menus"]
returnType = "navigation.Menus"
+++

## 这一页解决什么问题

`Menus` 返回**配置里定义好的导航菜单集合**。它的意义在于「导航与内容分开管理」：链接写在配置文件或页面前置元数据里，模板只负责渲染，改导航不必动模板。

除了遍历条目，菜单还解决一个模板里不好办的问题——**判断当前页对应的菜单项并高亮它**，靠的是页面方法 `IsMenuCurrent`（见下文示例）。

## 什么时候用，什么时候别用

**该用**：

- 渲染主导航、页脚、侧栏链接列表；
- 需要当前项高亮 / `aria-current`；
- 多语言站点按语言显示不同菜单（上游 NOTE 指向[菜单][]一节）。

**别用**：

- 用 [`partialCached`][] 缓存菜单模板 → 上游明确要求改用 [`partial`][]：激活状态**每个页面都不同**，缓存会串味；
- 把导航链接硬编码进模板 → 那就失去了菜单的意义，改一次要动模板；
- 想遍历页面生成导航 → 用 [`Site.Sections`](/methods/site/sections/) 或 [`Site.RegularPages`](/methods/site/regularpages/)。

## 用法

`Site` 对象上的 `Menus` 方法返回菜单的集合，其中每个菜单包含一个或多个条目，条目可以是平铺的，也可以是嵌套的。每个条目指向站点内的某个页面，或指向外部资源。

> [!NOTE]
> 菜单可以通过多种方式定义和本地化。完整说明和示例请参见[菜单][]一节。

一个站点可以有多个菜单。例如一个主菜单和一个页脚菜单：

```toml
[[menus.main]]
name = 'Home'
pageRef = '/'
weight = 10

[[menus.main]]
name = 'Books'
pageRef = '/books'
weight = 20

[[menus.main]]
name = 'Films'
pageRef = '/films'
weight = 30

[[menus.footer]]
name = 'Legal'
pageRef = '/legal'
weight = 10

[[menus.footer]]
name = 'Privacy'
pageRef = '/privacy'
weight = 20
```

这个模板渲染主菜单：

```go-html-template
{{ with site.Menus.main }}
  <nav class="menu">
    {{ range . }}
      {{ if $.IsMenuCurrent .Menu . }}
        <a class="active" aria-current="page" href="{{ .URL }}">{{ .Name }}</a>
      {{ else }}
        <a href="{{ .URL }}">{{ .Name }}</a>
      {{ end }}
    {{ end }}
  </nav>
{{ end }}
```

查看首页时，结果是：

```html
<nav class="menu">
  <a class="active" aria-current="page" href="/">Home</a>
  <a href="/books/">Books</a>
  <a href="/films/">Films</a>
</nav>
```

查看 `books` 页面时，结果是：

```html
<nav class="menu">
  <a href="/">Home</a>
  <a class="active" aria-current="page" href="/books/">Books</a>
  <a href="/films/">Films</a>
</nav>
```

你通常会用_局部模板_来渲染菜单。由于活动菜单条目在每个页面上都不同，请用 [`partial`][] 函数调用模板，不要用 [`partialCached`][] 函数。

上面的示例很简单。更多信息请参见[菜单模板][]一节。

## 完整示例（实测）

配置（`hugo.toml`）：主菜单三项，外加一项**外部链接**，以及一个页脚菜单。

```toml
[[menus.main]]
name = 'Home'
pageRef = '/'
weight = 10

[[menus.main]]
name = 'Books'
pageRef = '/books'
weight = 20

[[menus.main]]
name = 'Films'
pageRef = '/films'
weight = 30

[[menus.main]]
name = 'Hugo'
url = 'https://gohugo.io/'
weight = 40
```

先看条目本身（base URL 为 `https://example.org/`）：

```go-html-template {file="layouts/index.html"}
{{ range site.Menus.main }}
  {{ .Name }} → {{ .URL }}
{{ end }}
```

实测输出：

```text
Home → /
Books → /books/
Films → /films/
Hugo → https://gohugo.io/
```

**你应当看到什么**：`pageRef` 条目解析成站内页面地址（`.URL`），`url` 条目原样输出外链。把 base URL 换成 `https://example.org/docs/` 后重跑，站内条目变成 `/docs/`、`/docs/books/`、`/docs/films/`，而外链 `https://gohugo.io/` **不受影响**——这正是「用 `pageRef` 还是 `url`」的判断依据。

再把上游模板放进 home 模板与区块列表模板（`layouts/index.html` 与 `layouts/_default/list.html`），用 `hugo --baseURL https://example.org/docs/` 实测：

```html
<!-- 首页 /docs/ -->
<nav class="menu">
  <a class="active" aria-current="page" href="/docs/">Home</a>
  <a href="/docs/books/">Books</a>
  <a href="/docs/films/">Films</a>
  <a href="https://gohugo.io/">Hugo</a>
</nav>

<!-- Books 区块页 /docs/books/ -->
<nav class="menu">
  <a href="/docs/">Home</a>
  <a class="active" aria-current="page" href="/docs/books/">Books</a>
  <a href="/docs/films/">Films</a>
  <a href="https://gohugo.io/">Hugo</a>
</nav>
```

（上方只保留了 `<nav>` 内容行，模板 `range` 产生的空白与换行已省略。）

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`main` 菜单含 `pageRef` 与 `url` 两种条目，未定义页脚菜单时另测。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `site.Menus.main`（已定义） | 条目集合，可 `range`；实测顺序与配置中的 `weight` 升序一致（`Home`、`Books`、`Films`、`Hugo`） | 否 |
| 用 `pageRef` 的条目 | `.URL` 解析为页面地址，**包含 baseURL 子路径** | 否 |
| 用 `url` 的条目 | `.URL` 原样返回 | 否 |
| 取不存在的菜单（`site.Menus.nope`） | `nil`（`with` 判为假） | 否 |
| 完全没有 `[[menus]]` 配置 | `site.Menus` 为空映射（实测 `map[]`） | 否 |
| `printf "%T" .Site.Menus` | `navigation.Menus` | 否 |
| 用 `partialCached` 渲染且依赖激活状态 | 高亮状态会被缓存串味（上游明确要求改用 `partial`） | 否（但结果错误） |

[`partialCached`]: /functions/partials/includecached/
[`partial`]: /functions/partials/include/
[菜单模板]: /templates/menu/
[菜单]: /content-management/menus/
