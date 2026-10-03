+++
title = "GetPage"
linkTitle = "GetPage"
description = "返回给定路径对应的 Page 对象。"
date = 2026-10-02
weight = 80
source = "https://gohugo.io/methods/site/getpage/"

[params.functions_and_methods]
signatures = ["SITE.GetPage PATH"]
returnType = "page.Page"
+++

## 这一页解决什么问题

`GetPage` 按**路径**取回一个页面对象：内容区块（section）、常规页面、分类法页面都行。拿到 `Page` 之后就能继续用页面方法——`.Title`、`.RelPermalink`、`.Pages`、`.Resources` 等。

它是「按名字找内容」的标准方式：导航、相关文章、把某个 section 的列表嵌进首页，都靠它。与之相对，`.Site.Sections`、`.Site.RegularPages` 是「按集合拿内容」，`where` 是「按条件筛内容」。

## 什么时候用，什么时候别用

**该用**：

- 路径**已知**，要引用某个具体页面或区块（`/books`、`/books/jamaica-inn`）；
- 需要页面的资源（图片等），例如 headless [页面包](g)（叶子包）；
- 首页要列出某个 section 的内容。

**别用**：

- 只想遍历所有 section → 用 [`Site.Sections`](/methods/site/sections/)；只想遍历所有文章 → 用 [`Site.RegularPages`](/methods/site/regularpages/)；
- 要按标题、日期、参数筛选 → 用 [`where`](/functions/collections/where/) 配合页面集合；
- 在**页面上下文**里取相对自己位置的页面 → 那是页面上的 `GetPage` 方法（见 [methods/page](/methods/page/)），路径相对当前页面而不是 `content/`；
- 忘了兜底：路径写错时它返回 `nil` 而不是报错，直接 `.Title` 会得到空字符串甚至执行失败——始终用 `with` 包起来。

## 用法

`GetPage` 方法在 `Page` 对象上同样可用，此时可以指定相对于当前页面的路径。详见[说明][]。

在 `Site` 对象上使用 `GetPage` 方法时，请指定相对于 `content` 目录的路径。

如果 Hugo 无法把路径解析为页面，该方法返回 `nil`。

考虑如下内容结构：

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

下面这个 _home_ 模板：

```go-html-template {file="layouts/home.html"}
{{ with .Site.GetPage "/works/paintings" }}
  <ul>
    {{ range .Pages }}
      <li>{{ .Title }} by {{ .Params.artist }}</li>
    {{ end }}
  </ul>
{{ end }}
```

渲染结果为：

```html
<ul>
  <li>Starry Night by Vincent van Gogh</li>
  <li>The Mona Lisa by Leonardo da Vinci</li>
</ul>
```

要获取常规页面而不是 section 页面：

```go-html-template {file="layouts/home.html"}
{{ with .Site.GetPage "/works/paintings/starry-night" }}
  {{ .Title }} → Starry Night
  {{ .Params.artist }} → Vincent van Gogh
{{ end }}
```

## 多语言项目

在多语言项目中，`Site` 对象上的 `GetPage` 方法会把给定路径解析为当前语言的页面。

要获取其他语言的页面，请查询 `Sites` 对象：

```go-html-template
{{ with where hugo.Sites "Language.Name" "eq" "de" }}
  {{ with index . 0 }}
    {{ with .GetPage "/works/paintings/starry-night" }}
      {{ .Title }} → Sternenklare Nacht
    {{ end }}
  {{ end }}
{{ end }}
```

## 页面包

考虑如下内容结构：

```tree
content/
├── headless/
│   ├── a.jpg
│   ├── b.jpg
│   ├── c.jpg
│   └── index.md  <-- front matter: headless = true
└── _index.md
```

在 _home_ 模板中，用 `Site` 对象上的 `GetPage` 方法渲染 headless [页面包](g)中的所有图片：

```go-html-template {file="layouts/home.html"}
{{ with .Site.GetPage "/headless" }}
  {{ range .Resources.ByType "image" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

## 完整示例（实测）

我用下面这棵内容树实测（放在最小站点的 `content/` 下，标题与 `authors` 参数写在每页的前置元数据里）：

```tree
content/
├── books/
│   ├── _index.md
│   ├── and-then-there-were-none.md
│   ├── death-on-the-nile.md
│   ├── jamaica-inn.md
│   └── pride-and-prejudice.md
├── films/
│   ├── _index.md
│   ├── film-1.md
│   ├── film-2.md
│   └── film-3.md
└── _index.md
```

home 模板（`layouts/index.html`，当前模板系统下是 `layouts/home.html`）：

```go-html-template {file="layouts/index.html"}
{{ with .Site.GetPage "/books" }}
  <ul>
    {{ range .Pages }}
      <li>{{ .Title }}</li>
    {{ end }}
  </ul>
{{ end }}

{{ with .Site.GetPage "/books/jamaica-inn" }}
  <p>{{ .Title }} by {{ index .Params.authors 0 }}</p>
{{ end }}

{{ with .Site.GetPage "/books/nope" }}
  <p>找到页面</p>
{{ else }}
  <p>没有这个页面</p>
{{ end }}
```

Hugo 渲染为（`range` 留下的空行已省略）：

```html
<ul>
  <li>Pride and Prejudice</li>
  <li>Jamaica Inn</li>
  <li>Death on the Nile</li>
  <li>And Then There Were None</li>
</ul>

<p>Jamaica Inn by ddmaurier</p>

<p>没有这个页面</p>
```

**你应当看到什么**：`/books` 返回的是**区块页面**，`.Pages` 是它下面的常规页面（顺序为默认排序：本例中按日期降序）；`/books/jamaica-inn` 返回常规页面，可以直接读它的参数；不存在的路径走了 `else` 分支。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点，内容结构如上，Windows。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| `/books`（区块） | 区块 `Page`，`.Pages` 有 4 项；实测 `printf "%T"` → 满足 `page.Page` | 否 |
| `/` | home 页面（实测 `.Kind` → `home`，`.Title` → `Home`） | 否 |
| `/genres/suspense`（术语页） | 术语页面（实测 `.Kind` → `term`） | 否 |
| 不存在的路径（如 `/books/nope`） | `nil`（`with` 判为假） | 否 |
| 路径不带前导斜杠（如 `books`） | 仍能解析到 `/books`（实测可用），但建议统一写 `"/books"`，避免与页面方法的相对路径语义混淆 | 否 |
| 路径带 `.md` 后缀（如 `/books/jamaica-inn.md`） | 能解析到该页（实测可用） | 否 |
| 路径指向目录但没有 `_index.md` | 仍返回该目录的 section 页面（Hugo 自动合成，实测 `.Kind` → `section`、`.Title` 取目录名） | 否 |
| 拿 `nil` 结果直接取字段（未用 `with`） | 取不到值；对 `nil` 调用方法会执行失败 | 视写法 |

[说明]: /methods/page/getpage/
