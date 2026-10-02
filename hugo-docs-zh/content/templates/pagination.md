+++
title = "分页"
linkTitle = "分页"
description = "把列表页拆分为多个分页并生成页码导航：配置默认值、两种分页方法、缓存陷阱与产物核对方法。"
date = 2026-10-01
weight = 100
source = "https://gohugo.io/templates/pagination/"

[params.teach]
difficulty = "进阶"
time = "30–40 分钟"
prereq = [
  "有一个列表页（`home` 或 `section`）并且内容超过一页，例如 `content/posts/` 下有 4 篇文章。",
  "读过[内容类型](/templates/types/)，知道列表页模板里可以遍历 `.Pages`。",
]
outcomes = [
  "用 `[pagination]` 配置每页条数与分页 URL 片段；",
  "用 `.Paginate` 与 `.Paginator` 两种方式分页，并说清它们的差别；",
  "在构建产物里核对分页目录（`/posts/page/2/`）与第一页别名是否按预期生成；",
  "避开「同一列表页多次调用分页」这个不会报错的坑。",
]
next = ["/templates/menu/", "/methods/pager/", "/configuration/pagination/"]

+++

## 为什么需要分页

在列表页上一次性展示大量页面集合并不友好：

- 超长列表令人生畏且难以浏览，访客容易在海量信息中迷失；
- 页面越大加载越慢，可能让人失去耐心而离开站点；
- 没有任何筛选或组织时，找到一个特定条目变成了漫长的滚动。

对 `home`、`section`、`taxonomy`、`term` 这几类列表页进行分页可以改善可用性。

> [!NOTE]
> 与分页有关的最常见模板错误，是在同一个列表页上多次调用分页。请参阅下文的缓存一节。

## 这一页解决什么问题

分页要做两件事，缺一不可：

1. **切数据**——把列表页的页面集合切成若干份，模板只遍历当前这一份；
2. **给导航**——渲染「上一页 / 下一页 / 第 N 页」的链接，否则访客看不到后面的内容。

Hugo 把两者分开：切数据用 `.Paginate` 或 `.Paginator`，导航通常直接调用内建的 `pagination.html`。所以「分页好像没生效」时，先分清楚是**数据没切**还是**导航没画**。

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

```toml {file="hugo.toml"}
[pagination]
  disableAliases = false
  pagerSize = 10
  path = 'page'
```

| 键名 | 类型 | 默认值 | 含义 |
| --- | --- | --- | --- |
| `pagerSize` | `int` | `10` | 每个 pager 中包含的页面数量； |
| `path` | `string` | `page` | 分页路径的片段，决定第 2 页是 `/posts/page/2/` 还是别的形态； |
| `disableAliases` | `bool` | `false` | 是否禁用第一个 pager 的别名。 |

把 `path` 改成 `seite`，第 2 页就变成 `/posts/seite/2/`。**别名**（alias）是给第一个 pager 生成的重定向目录，让旧的 `/posts/page/1/` 这类地址继续可用。

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

注意第 3 步的 `7`：这是**第二个参数**，会覆盖 `pagerSize`。不写它就用配置值。

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

```go-html-template
{{/* 反例：两个分支都会被求值，第二次调用拿到的是缓存结果 */}}
{{ $paginator := cond $condition (.Paginate $a) (.Paginate $b) }}

{{/* 正例：只有命中的分支会执行 */}}
{{ $paginator := "" }}
{{ if $condition }}
  {{ $paginator = .Paginate $a }}
{{ else }}
  {{ $paginator = .Paginate $b }}
{{ end }}
```

这个坑的可怕之处在于**不报错**：页面照样渲染，只是数据是你没预期的那个集合。

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

**边界情况**：分组之后分页，`pagerSize` 限制的到底是「每个 pager 里的分组数」还是「页面数」，上游未给出单独说明。因此核对条数时以构建产物为准：先数一个 pager 里出现了几个 `.Key`（分组），再数每组里有几个页面，确认切分点符合预期。

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

需要自定义导航组件时，可以使用 `Pager` 对象提供的各种方法读取上一页、下一页、首页、末页等信息，自行拼装链接——方法清单见 [Pager 方法](/methods/pager/)。

## 最小可运行示例

把下面四个文件放进项目，就能得到一份可核对的分页结果。

内容（4 篇文章 + 一个 section 首页）：

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

项目配置（每页 2 条）：

```toml {file="hugo.toml"}
[pagination]
  disableAliases = false
  pagerSize = 2
  path = 'page'
```

section 模板：

```go-html-template {file="layouts/section.html"}
{{ range (.Paginate .Pages).Pages }}
  <h2><a href="{{ .RelPermalink }}">{{ .LinkTitle }}</a></h2>
{{ end }}

{{ partial "pagination.html" . }}
```

构建：

```bash
hugo
```

### 结果长什么样

发布后的站点结构是：

```tree
public/
├── posts/
│   ├── page/
│   │   ├── 1/
│   │   │   └── index.html  <-- alias to public/posts/index.html
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

`public/posts/index.html` 里应当只有 **2** 篇文章的标题（`pagerSize = 2`），`public/posts/page/2/index.html` 里是另外 2 篇——两页加起来正好覆盖 4 篇，不重不漏。

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

### 验证标准

1. `public/posts/index.html` 的标题数量等于 `pagerSize`；
2. `public/posts/page/2/` 存在，并且这一页的标题与第一页**不重复**；
3. `disableAliases = false` 时，`public/posts/page/1/` 是一个别名（打开它会跳到 `/posts/`）；
4. **没有** `public/posts/page/3/`（4 条内容按每页 2 条正好两页）——多出来的空页通常意味着 `pagerSize` 没生效。

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH` → [安装 Hugo](/installation/) |
| 没报错但结果不对 | 页面上只有第一页，没有页码导航 | 只做了分页却没调用 `{{ partial "pagination.html" . }}`，或内容总量没超过 `pagerSize`（只有一页自然没有导航） |
| 没报错但结果不对 | 每个分页显示的内容都一样 | 同一列表页里调用了两次分页，第二次用了缓存结果 → 见本页「缓存」一节，改成只调用一次 |
| 没报错但结果不对 | 改了 `pagerSize` 但每页条数没变 | `.Paginate` 传了第二个参数（显式条数）会覆盖配置；或改的不是当前语言的 `[pagination]` → 见[分页配置](/configuration/pagination/) |
| 没报错但结果不对 | 分页链接指向 404 | `path` 改过但旧链接还在用；或部署时没上传 `page/` 目录 → 核对产物结构 |
| 报错看不懂 | 报错里出现 `pagination` 并指向你的列表模板 | 同一列表页第二次调用分页，且两次参数不同（分页只能初始化一次）→ 只保留一次调用，条件分页改用 `if-else` |
| 报错看不懂 | 报错指向内建 `pagination.html`，提示取不到分页器 | 调用时用了 `(dict "format" "terse")` 这类写法却漏了 `"page" .` → 两个键都要给 |

更多排查入口见[故障排查](/troubleshooting/)。
