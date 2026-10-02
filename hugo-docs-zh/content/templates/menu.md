+++
title = "菜单模板"
linkTitle = "菜单模板"
description = "在模板中遍历菜单项，渲染平铺或嵌套的导航结构：最小可运行示例、属性输出顺序与当前项高亮的验证方法。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/templates/menu/"

[params.teach]
difficulty = "进阶"
time = "25–35 分钟"
prereq = [
  "会在项目配置或页面前置元数据里[定义菜单项](/content-management/menus/)。",
  "读过[简介](/templates/introduction/)，能看懂 `range`、`with`、`dict` 与局部模板调用。",
]
outcomes = [
  "写出一个递归的菜单局部模板，渲染任意层级的嵌套列表；",
  "让当前页面与祖先栏目自动带上 `class` / `aria-current` 高亮属性；",
  "解释为什么输出里的属性是按字母序排列的，并能核对渲染结果；",
  "在菜单项没有关联页面、或参数未定义时不报错地跳过。",
]
next = ["/templates/pagination/", "/content-management/menus/", "/content-management/multilingual/"]

+++

## 这一页解决什么问题

导航菜单有两部分：**菜单项从哪来**（项目配置、前置元数据或自动生成）和**怎么渲染**（一层平铺还是多层嵌套）。这一页只解决后者——把 `site.Menus` 里的数据变成可访问的 `<nav>`。

最容易被忽略的是「当前项高亮」：访客需要知道自己现在在哪个栏目。Hugo 为此提供了 `IsMenuCurrent` 与 `HasMenuCurrent` 两个方法，本页的示例把它们都用上了，并给出可直接核对的渲染结果。

## 概览

先[定义菜单项](/content-management/menus/)，再用菜单方法渲染菜单。Hugo 在 `site.Menus` 上暴露所有菜单，例如 `site.Menus.main`、`site.Menus.footer`。

决定渲染方式的因素有三个：

1. 菜单项的定义方式：自动生成、写在前置元数据中、写在项目配置中；
1. 菜单结构：平铺还是嵌套；
1. 菜单项的[本地化方式](/content-management/multilingual/)：项目配置或翻译表。

下面的示例把这些组合都考虑在内。

## 示例

这个**局部模板（partial）**递归「遍历」菜单结构，渲染出经过本地化、且具备可访问性的嵌套列表：

```go-html-template {file="layouts/_partials/menu.html"}
{{- $page := .page }}
{{- $menuID := .menuID }}

{{- with index site.Menus $menuID }}
  <nav>
    <ul>
      {{- partial "inline/menu/walk.html" (dict "page" $page "menuEntries" .) }}
    </ul>
  </nav>
{{- end }}

{{- define "_partials/inline/menu/walk.html" }}
  {{- $page := .page }}
  {{- range .menuEntries }}
    {{- $attrs := dict "href" .URL }}
    {{- if $page.IsMenuCurrent .Menu . }}
      {{- $attrs = merge $attrs (dict "class" "active" "aria-current" "page") }}
    {{- else if $page.HasMenuCurrent .Menu .}}
      {{- $attrs = merge $attrs (dict "class" "ancestor" "aria-current" "true") }}
    {{- end }}
    {{- $name := .Name }}
    {{- with .Identifier }}
      {{- with T . }}
        {{- $name = . }}
      {{- end }}
    {{- end }}
    <li>
      <a
        {{- range $k, $v := $attrs }}
          {{- with $v }}
            {{- printf " %s=%q" $k $v | safeHTMLAttr }}
          {{- end }}
        {{- end -}}
      >{{ $name }}</a>
      {{- with .Children }}
        <ul>
          {{- partial "inline/menu/walk.html" (dict "page" $page "menuEntries" .) }}
        </ul>
      {{- end }}
    </li>
  {{- end }}
{{- end }}
```

要点如下：

- 用 `index site.Menus $menuID` 取出指定 ID 的菜单，菜单不存在时 `with` 会跳过整段输出；
- `.IsMenuCurrent` 判断当前页是否就是该菜单项，命中时加上高亮属性；`.HasMenuCurrent` 判断当前页是否位于该菜单项的子层级中，命中时标记为祖先项，两者常常配合使用；
- `.Identifier` 优先作为翻译表的键交给 `T` 函数处理，取不到翻译结果时回退到 `.Name`，这就是菜单项本地化的实现方式；
- `.Children` 返回子菜单项集合，递归调用同一个模板即完成嵌套渲染。

调用上面的局部模板，传入菜单 ID 和当前页面：

```go-html-template {file="layouts/page.html"}
{{ partial "menu.html" (dict "menuID" "main" "page" .) }}
{{ partial "menu.html" (dict "menuID" "footer" "page" .) }}
```

### 最小可运行示例

先在项目配置里定义两个菜单项（`[[menus.main]]` 是「数组表」，每个条目一个方括号对）：

```toml {file="hugo.toml"}
[[menus.main]]
  name = 'Home'
  pageRef = '/'
  weight = 10

[[menus.main]]
  name = 'Posts'
  pageRef = '/posts'
  weight = 20
```

再把上面的 `layouts/_partials/menu.html` 原样复制进项目，并让任一模板调用它：

```go-html-template {file="layouts/page.html"}
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>{{ .Title }}</title></head>
<body>
  {{ partial "menu.html" (dict "menuID" "main" "page" .) }}
  <h1>{{ .Title }}</h1>
</body>
</html>
```

构建后打开任意页面的产物（例如 `public/posts/index.html`）：

```bash
hugo
```

### 结果长什么样

在文章列表页 `/posts/` 上，你应当看到（为便于阅读做了换行）：

```html
<nav>
  <ul>
    <li><a href="/">Home</a></li>
    <li><a aria-current="page" class="active" href="/posts/">Posts</a></li>
  </ul>
</nav>
```

三件事都可以拿来验证：

1. **当前项有高亮**：`/posts/` 这一项同时带上了 `class="active"` 与 `aria-current="page"`；`aria-current` 是给屏幕阅读器用的，不要省；
2. **属性按字母序输出**：`aria-current` → `class` → `href`。原因是 `$attrs` 是一个映射（`dict` 创建），Go 模板遍历映射时按键排序，所以**顺序与你在模板里写的顺序无关**，改动属性顺序不会影响输出；
3. **链接是根相对路径**：`.URL` 对站内页面给出 `/posts/` 这样的地址。

把浏览器地址换到 `/`（首页），第一项应当变成高亮，第二项恢复成只有 `href`。

### 嵌套菜单的输出

给 `Posts` 加一个子项（父项必须有 `identifier`，子项用 `parent` 指向它）：

```toml {file="hugo.toml"}
[[menus.main]]
  name = 'Posts'
  identifier = 'posts'
  pageRef = '/posts'
  weight = 20

[[menus.main]]
  name = 'Archive'
  parent = 'posts'
  pageRef = '/posts/archive'
  weight = 10
```

在 `/posts/archive/` 上，父项会命中 `HasMenuCurrent`（因为当前页位于它的下一级），输出形如：

```html
<li><a class="ancestor" aria-current="true" href="/posts/">Posts</a>
  <ul>
    <li><a aria-current="page" class="active" href="/posts/archive/">Archive</a></li>
  </ul>
</li>
```

**验证标准**：父项是 `ancestor`、子项是 `active`。如果父项没有任何属性，检查它是否定义了 `identifier`——`.IsMenuCurrent` / `.HasMenuCurrent` 要求菜单项能对应到页面，前置元数据里定义的菜单项或配置里带 `pageRef` 的菜单项才满足条件。

## 页面引用

无论菜单项以何种方式定义，只要它指向某个页面，就能通过 `.Page` 拿到该页面的上下文，从而读取页面参数。比如在每个菜单项的名称后面显示页面参数 `version`：

```go-html-template {file="layouts/page.html"}
{{- range site.Menus.main }}
  <a href="{{ .URL }}">
    {{ .Name }}
    {{- with .Page }}
      {{- with .Params.version -}}
        ({{ . }})
      {{- end }}
    {{- end }}
  </a>
{{- end }}
```

写这类模板时要防御性地使用 `with` 或 `if`，因为存在两种例外：菜单项指向的是外部资源，此时没有关联页面；或者关联页面并没有定义 `version` 参数，直接取值会得到空值。

**边界情况**：`.Page` 在「外部链接菜单项」上是空值；`.Params.version` 未定义时也是空值。两层 `with` 嵌套就是为了让这两种情况都安静地跳过，而不是渲染出 `()` 这样的空壳。

## 菜单项参数

在项目配置或前置元数据中定义菜单项时，可以附带 `params` 键。下面这个例子为每个链接元素渲染一个 `class` 属性：

```go-html-template {file="layouts/_partials/menu.html"}
{{- range site.Menus.main }}
  <a {{ with .Params.class -}} class="{{ . }}" {{ end -}} href="{{ .URL }}">
    {{ .Name }}
  </a>
{{- end }}
```

同样要防御性地处理 `params.class` 未定义的菜单项，用 `with` 判断之后再输出属性，避免渲染出空的 `class`。

## 本地化

Hugo 提供两种菜单项本地化方法，详见[多语言](/content-management/multilingual/)章节：在项目配置中为每种语言分别定义菜单项，或者用翻译表按键查找名称。

用翻译表时，菜单项必须提供 `identifier`，因为翻译的键就是它——这也解释了为什么上面的示例里 `.Identifier` 会先于 `.Name` 被使用。

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH` → [安装 Hugo](/installation/) |
| 没报错但结果不对 | 菜单整块不输出 | `index site.Menus $menuID` 取不到菜单（ID 拼错、或菜单定义在了 `[menus.main]` 而不是 `[[menus.main]]`）→ 用 `with` 包住时不会报错，先确认配置生效 |
| 没报错但结果不对 | 所有菜单项都没有高亮 | 菜单项缺少 `pageRef`，或定义在前置元数据之外 → 见本页「嵌套菜单的输出」末段 |
| 没报错但结果不对 | 输出里出现 `()` 或空 `class=""` | `.Page` / `.Params.class` 为空值 → 用 `with` / `if` 判空后再输出 |
| 报错看不懂 | `error calling IsMenuCurrent: … nil pointer` | 当前上下文不是 `Page` 对象（例如在 `with` 块里点被换掉了）→ 像示例那样先把页面存进 `$page` 再传进局部模板 |
| 报错看不懂 | `can't evaluate field Children in type …` | 菜单项既不是菜单条目也不是页面对象（常见于把 `.Children` 用在了别的集合上）→ 确认 `range` 的对象是 `site.Menus.<id>` 或其 `Children` |

更多排查入口见[故障排查](/troubleshooting/)。
