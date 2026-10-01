+++
title = "构建选项"
linkTitle = "构建选项"
description = "介绍页面级 build 选项、无头包、cascade 与站点级构建配置。"
date = 2026-10-01
weight = 230
source = "https://gohugo.io/content-management/build-options/"
+++

## 页面级构建选项

构建选项存放在前置元数据（front matter）中一个名为 `build` 的保留对象里（早期版本写作 `_build`），它的默认值如下：

```toml
+++
title = "示例页面"
[build]
list = 'always'
publishResources = true
render = 'always'
+++
```

`list` 决定页面在何时进入页面集合：

- `always`：进入**所有**页面集合，例如 `site.RegularPages`、`.Pages` 等。这是默认值。
- `local`：只进入**本地**页面集合，例如 `.RegularPages`、`.Pages` 等。用它可以做出「可正常导航、但不对外列出」的内容区块。
- `never`：不进入任何页面集合。

`publishResources` 只对页面包（page bundle）有效，决定是否发布它关联的页面资源（page resource）：

- `true`：总是发布资源。这是默认值。
- `false`：只有在模板中调用了资源的 `Permalink`、`RelPermalink` 或 `Publish` 方法时，才发布该资源。

`render` 决定页面在何时渲染：

- `always`：总是把页面渲染到磁盘。这是默认值。
- `link`：不渲染到磁盘，但仍为页面分配 `Permalink` 与 `RelPermalink` 值。
- `never`：不渲染到磁盘，并把页面排除在所有页面集合之外。

注意取值的类型：`list` 与 `render` 取字符串，`publishResources` 取布尔值。另外，无论构建选项如何设置，页面都可以通过 `.Page.GetPage` 或 `.Site.GetPage` 方法获取。

## 无头页面（headless page）

无头页面是不发布的页面，它的内容与资源可以被其他页面引用：

```tree
content/
├── headless/
│   ├── a.jpg
│   ├── b.jpg
│   └── index.md  <-- 叶子包
└── _index.md     <-- 首页
```

在前置元数据中设置构建选项：

```toml
+++
title = '无头页面'
[build]
  list = 'never'
  publishResources = false
  render = 'never'
+++
```

在首页中包含它的内容与图片：

```go-html-template {file="layouts/home.html"}
{{ with .Site.GetPage "/headless" }}
  {{ .Content }}
  {{ range .Resources.ByType "image" }}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
  {{ end }}
{{ end }}
```

发布后的站点结构如下：

```tree
public/
├── headless/
│   ├── a.jpg
│   └── b.jpg
└── index.html
```

注意两点：Hugo 没有为该页面发布 HTML 文件；尽管前置元数据里 `publishResources` 是 `false`，Hugo 仍然发布了这些页面资源，因为模板在每个资源上调用了 `RelPermalink` 方法。这是预期行为。

## 无头内容区块（headless section）

无头内容区块同样不发布，其下的每个页面都是一个无头包：

```tree
content/
├── headless/
│   ├── note-1/
│   │   ├── a.jpg
│   │   ├── b.jpg
│   │   └── index.md  <-- 叶子包
│   ├── note-2/
│   │   ├── c.jpg
│   │   ├── d.jpg
│   │   └── index.md  <-- 叶子包
│   └── _index.md     <-- 分支包
└── _index.md         <-- 首页
```

在前置元数据中用 `cascade` 关键字把取值下发给后代页面：

```toml
+++
title = '无头内容区块'
[[cascade]]
[cascade.build]
  list = 'local'
  publishResources = false
  render = 'never'
+++
```

这里把 `list` 设为 `local`，是为了让后代页面仍然留在本地页面集合中。在首页中包含它们的内容与图片：

```go-html-template {file="layouts/home.html"}
{{ with .Site.GetPage "/headless" }}
  {{ range .Pages }}
    {{ .Content }}
    {{ range .Resources.ByType "image" }}
      <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
    {{ end }}
  {{ end }}
{{ end }}
```

发布后的结构与无头页面类似：`public/headless/note-1/` 与 `public/headless/note-2/` 下只有图片，没有任何 HTML 文件。

## 只列出、不发布

也可以让内容区块本身正常发布，只把后代页面挡在输出目录之外。例如做一个术语表：

```tree
content/
├── glossary/
│   ├── _index.md
│   ├── bar.md
│   ├── baz.md
│   └── foo.md
└── _index.md
```

```toml
+++
title = '术语表'
[build]
render = 'always'
[[cascade]]
[cascade.build]
  list = 'local'
  publishResources = false
  render = 'never'
+++
```

区块页自己设成 `render = 'always'` 而正常输出，后代页面则只留在本地页面集合里，由区块模板把它们的正文直接渲染出来：

```go-html-template {file="layouts/glossary/section.html"}
<dl>
  {{ range .Pages }}
    <dt>{{ .Title }}</dt>
    <dd>{{ .Content }}</dd>
  {{ end }}
</dl>
```

于是输出目录里只有 `public/glossary/index.html` 与 `public/index.html`，各术语没有独立页面。

## 只发布、不列出

反过来，也可以让区块页自己不发布、不进入列表，同时保留后代页面各自生成独立页面：

```tree
content/
├── books/
│   ├── _index.md
│   ├── book-1.md
│   └── book-2.md
└── _index.md
```

```toml
+++
title = '图书'
[build]
render = 'never'
list = 'never'
+++
```

后代页面沿用默认构建选项，因此输出目录里没有 `public/books/index.html`，却有 `public/books/book-1/index.html` 与 `public/books/book-2/index.html`。

## 按环境隐藏内容区块

文档站往往有一批只给贡献者看的内部说明。与其另建一套外部文档，不如把它放进一个只在正式环境隐藏的内容区块：仍旧用 `cascade` 下发构建选项，并用 `target` 关键字把规则限定在生产环境。

```toml
+++
title = '内部资料'
[[cascade]]
[cascade.build]
render = 'never'
list = 'never'
[cascade.target]
environment = 'production'
+++
```

这样本地开发时该区块照常可见，生产构建的输出里则不会出现它。`cascade` 只作用于后代页面，不作用于声明它的那个页面，所以区块页自身的 `build` 仍需按需单独设置。

## 站点级构建配置

站点配置中的 `[build]` 区段控制全局构建行为。它与页面级的 `build` 对象是两回事，键名也不相同，常用的有：

- `buildStats`：在项目根目录生成 `hugo_stats.json`，记录已发布站点中每个 HTML 元素的 `class`、`id` 属性与标签名，可作为数据源清理未使用的 CSS（即 pruning、purging、tree shaking）。子键 `enable` 默认 `false`；`disableIDs`、`disableTags`、`disableClasses` 默认也是 `false`，分别用于排除 id、标签与 class。清理 CSS 通常只在生产构建进行，建议把 `buildStats` 放在 `config/production` 之下。
- `cachebusters`：声明被监视的源文件变化时，让资源缓存中的哪些键失效，从而触发 CSS 等依赖资源重建。每条规则含 `source`（匹配 `assets/...` 等虚拟目录下文件的正则）与 `target`（匹配缓存键的正则，可使用 `source` 中的捕获组，如 `$1`）。
- `cleanDestinationDir`：Hugo 构建前并不清空 `publishDir`，只覆盖同名文件，删除或改名后的旧页面会残留其中。该设置默认关闭，开启后 Hugo 会在渲染前清掉 `publishDir` 里没有对应静态文件的文件与目录；`keepDirs`、`keepFiles` 用 glob 指定要保留的目录与文件，二者在 `0.167.0` 中引入，且设置的值会替换默认值而不是追加。
- `noJSConfigInAssets`：是否禁止在 `assets` 目录写入 `jsconfig.json`（供 `js.Build` 的导入映射使用，便于编辑器智能提示）；不使用 `js.Build` 时本来就不会写入。
- `useResourceCacheWhen`：何时使用资源文件缓存，取值为 `never`、`fallback`、`always`，适用于把 Sass 转译为 CSS 的场景，默认 `fallback`。

## 相关阅读

- [内容管理概览](/content-management/)
- [页面包](/content-management/page-bundles/)
- [页面资源](/content-management/page-resources/)
- [配置 Hugo](/configuration/)
