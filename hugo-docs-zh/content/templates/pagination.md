+++
title = "分页"
linkTitle = "分页"
description = "把列表页拆分为多个分页，并生成页码导航。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/templates/pagination/"
+++

## 为什么需要分页

在列表页上一次性展示大量页面集合并不友好：

- 超长列表令人生畏且难以浏览，访客容易在海量信息中迷失；
- 页面越大加载越慢，可能让人失去耐心而离开站点；
- 没有任何筛选或组织时，找到一个特定条目变成了漫长的滚动。

对 `home`、`section`、`taxonomy`、`term` 这几类列表页进行分页可以改善可用性。

> [!NOTE]
> 与分页有关的最常见模板错误，是在同一个列表页上多次调用分页。请参阅下文的缓存一节。

## 术语

paginate
: 把一个列表页拆分为两个或多个子集。

pagination
: 对列表页进行分页的过程。

pager
: 分页过程中产生的分页器，包含列表页的一个子集以及指向其他分页的导航链接。

paginator
: 一组 pager 的集合。

## 配置

分页的默认行为由项目配置中的 `[pagination]` 小节决定：

- `pagerSize`：每个 pager 中包含的页面数量；
- `path`：分页路径的片段，默认是 `page`；
- `disableAliases`：是否禁用第一个 pager 的别名，默认是 `false`。

## 方法

要对 `home`、`section`、`taxonomy` 或 `term` 页面分页，在对应模板的 `Page` 对象上调用以下方法之一：

- `.Paginate`
- `.Paginator`

`.Paginate` 更灵活，它可以：

- 对任意页面集合分页；
- 对页面集合进行筛选、排序和分组；
- 覆盖项目配置中定义的每页数量。

相比之下，`.Paginator` 只对传入模板的那个页面集合分页，并且不能覆盖每页数量，始终使用 `pagination.pagerSize` 配置值。

### 使用 .Paginate

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate $pages.ByTitle 7 }}

{{ range $paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ partial "pagination.html" . }}
```

上面依次做了五件事：

1. 构建页面集合；
1. 按标题排序；
1. 对该集合分页，每个 pager 放 7 页；
1. 遍历分页后的集合，为每页渲染一个链接；
1. 调用内建的分页模板，生成 pager 之间的导航链接。

### 使用 .Paginator

```go-html-template
{{ range .Paginator.Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ partial "pagination.html" . }}
```

这里的三步是：

1. 对传入模板的页面集合分页，每页数量取默认配置；
1. 遍历分页后的集合，为每页渲染一个链接；
1. 调用内建的分页模板生成导航链接。

## 缓存

> [!NOTE]
> 与分页有关的最常见模板错误，是在同一个列表页上多次调用分页。

无论用哪种方法，**首次调用会被缓存且不可更改**。如果在同一个列表页上多次调用分页，后续调用使用的都是缓存结果，也就是说后续调用不会按代码字面意思生效。

需要按条件分页时，不要使用 `compare.Conditional` 函数，因为它会急切求值所有参数；改用 `if-else` 结构来控制调用时机。

## 分组

分页可以与任意分组方法配合使用：

```go-html-template
{{ $pages := where site.RegularPages "Type" "posts" }}
{{ $paginator := .Paginate ($pages.GroupByDate "Jan 2006") }}

{{ range $paginator.PageGroups }}
  <h2>{{ .Key }}</h2>
  {{ range .Pages }}
    <h3><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h3>
  {{ end }}
{{ end }}

{{ partial "pagination.html" . }}
```

分组之后通过 `$paginator.PageGroups` 遍历各个分组，每个分组用 `.Key` 表示分组键、用 `.Pages` 表示组内页面。

## 导航

如前面的示例所示，在 pager 之间添加导航最简单的办法是使用 Hugo 内建的分页模板：

```go-html-template
{{ partial "pagination.html" . }}
```

内建的分页模板有两种格式：`default` 和 `terse`。上面的写法等价于：

```go-html-template
{{ partial "pagination.html" (dict "page" . "format" "default") }}
```

`terse` 格式的控件和页码槽位更少，渲染成横向列表时占用更少空间：

```go-html-template
{{ partial "pagination.html" (dict "page" . "format" "terse") }}
```

> [!NOTE]
> 要覆盖 Hugo 内建的分页模板，把内建模板的源码复制到 `layouts/_partials` 目录下的同名文件中，再用 `partial` 函数从模板里调用它：在模板中写 `{{ partial "pagination.html" . }}` 即可。

需要自定义导航组件时，可以使用 pager 对象提供的各种方法读取上一页、下一页、首页、末页等信息，自行拼装链接。

## 发布结构

下面的例子展示列表页分页后，发布到站点的目录结构。假设内容如下：

```tree
content/
├── posts/
│   ├── _index.md
│   ├── post-1.md
│   ├── post-2.md
│   ├── post-3.md
│   └── post-4.md
└── _index.md
```

项目配置如下：

```toml {file="hugo.toml"}
[pagination]
  disableAliases = false
  pagerSize = 2
  path = 'page'
```

section 模板如下：

```go-html-template {file="layouts/section.html"}
{{ range (.Paginate .Pages).Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ partial "pagination.html" . }}
```

发布后的站点结构是：

```tree
public/
├── posts/
│   ├── page/
│   │   ├── 1/
│   │   │   └── index.html  <-- 指向 public/posts/index.html 的别名
│   │   └── 2/
│   │       └── index.html
│   ├── post-1/
│   │   └── index.html
│   ├── post-2/
│   │   └── index.html
│   ├── post-3/
│   │   └── index.html
│   ├── post-4/
│   │   └── index.html
│   └── index.html
└── index.html
```

要禁止为第一个 pager 生成别名，修改项目配置：

```toml {file="hugo.toml"}
[pagination]
  disableAliases = true
  pagerSize = 2
  path = 'page'
```

此时发布结构变为：

```tree
public/
├── posts/
│   ├── page/
│   │   └── 2/
│   │       └── index.html
│   ├── post-1/
│   │   └── index.html
│   ├── post-2/
│   │   └── index.html
│   ├── post-3/
│   │   └── index.html
│   ├── post-4/
│   │   └── index.html
│   └── index.html
└── index.html
```

区别只在于 `posts/page/1/` 这个别名目录：第一个 pager 的内容与列表页本身相同，别名让旧链接继续可用；如果托管平台或链接策略不需要它，关掉即可少生成一个目录。
