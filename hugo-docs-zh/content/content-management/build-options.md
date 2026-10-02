+++
title = "构建选项"
linkTitle = "构建选项"
description = "页面级 build 选项、无头包、cascade 与站点级构建配置；含配置位置、构建验证方法与最常配错的地方。"
date = 2026-10-01
weight = 230
source = "https://gohugo.io/content-management/build-options/"

[params.teach]
difficulty = "进阶"
time = "25–35 分钟"
prereq = [
  "读过[页面包](/content-management/page-bundles/)与[页面资源](/content-management/page-resources/)，知道叶子包与分支包的区别。",
  "会写前置元数据，并知道 `cascade` 是向下传递的。",
]
outcomes = [
  "用 `list` / `render` / `publishResources` 三个选项精确控制「页面进不进列表、生不生成 HTML、资源发不发布」；",
  "做出「不发布页面但发布资源」「发布区块页但不发布后代页」这类组合，并知道输出目录该长什么样；",
  "用 `cascade` + `target` 只在特定环境隐藏整个内容区块；",
  "用 `hugo list all` 与产物目录验证配置，而不是靠猜。",
]
next = ["/content-management/page-bundles/", "/content-management/page-resources/", "/configuration/build/"]

+++

## 这一页解决什么问题

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

它解决的是「**这个页面到底要不要出现在站点里**」——一个页面有三件独立的事，构建选项把它们拆开控制：

| 选项 | 管什么 | 关掉之后的直接后果 |
| --- | --- | --- |
| `list` | 进不进页面集合（`.Pages`、`site.RegularPages` 等） | 列表页、`range .Pages` 里看不到它 |
| `render` | 生不生成 HTML 文件 | 输出目录里没有对应 `index.html` |
| `publishResources` | 页面资源发不发布 | 图片等资源不出现在输出目录里 |

> [!IMPORTANT]
> **先分清两个同名但不同层的东西**：前置元数据里的 `[build]` 是**页面级**选项，只管这一个页面；项目配置里的 `[build]` 区段是**站点级**设置（`buildStats`、`cachebusters` 等），与页面发布完全无关。写成页面级还是站点级，效果天差地别，配置位置见本页末的[站点级构建配置](#站点级构建配置)。

**验证构建选项的三步**（本页每个例子都用它）：

```bash
hugo list all        # 1. 页面有没有进入集合（list 的影响）
hugo                 # 2. 真正构建
```

```bash
ls -R public         # 3. 输出目录里有没有 index.html、有没有资源文件（render 与 publishResources 的影响）
```

**你应当看到什么**（**实测：Hugo 0.167**）：给一个页面设成

```toml
[build]
list = 'never'
render = 'never'
publishResources = false
```

并在同目录放一个 `asset.txt`，构建后：

- `public/<该页>/index.html` **不存在**（`render = never`）；
- `public/<该页>/asset.txt` **不存在**（`publishResources = false`，且模板没有引用它）；
- `hugo list all` 的输出里**也看不到这一页**——`list = never` 会让它从列表类命令中一并消失，不是命令坏了。

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

```tree
public/
├── headless/
│   ├── note-1/
│   │   ├── a.jpg
│   │   └── b.jpg
│   └── note-2/
│       ├── c.jpg
│       └── d.jpg
└── index.html
```

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

```tree
public/
├── glossary/
│   └── index.html
└── index.html
```

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

```tree
public/
├── books/
│   ├── book-1/
│   │   └── index.html
│   └── book-2/
│       └── index.html
└── index.html
```

## 按环境隐藏内容区块

文档站往往有一批只给贡献者看的内部说明。与其另建一套外部文档，不如把它放进一个只在正式环境隐藏的内容区块：仍旧用 `cascade` 下发构建选项，并用 `target` 关键字把规则限定在生产环境。

内容结构如下：

```tree
content/
├── internal/
│   ├── shortcodes/
│   │   ├── _index.md
│   │   ├── shortcode-1.md
│   │   └── shortcode-2.md
│   └── _index.md
├── reference/
│   ├── _index.md
│   ├── reference-1.md
│   └── reference-2.md
├── tutorials/
│   ├── _index.md
│   ├── tutorial-1.md
│   └── tutorial-2.md
└── _index.md
```

配置如下：

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

生产站点的输出结构如下：

```tree
public/
├── reference/
│   ├── reference-1/
│   │   └── index.html
│   ├── reference-2/
│   │   └── index.html
│   └── index.html
├── tutorials/
│   ├── tutorial-1/
│   │   └── index.html
│   ├── tutorial-2/
│   │   └── index.html
│   └── index.html
└── index.html
```

## 组合速查与什么时候用

三个选项各自的取值可以组合，常见组合的用途如下——每一行的「输出目录」一列就是验证标准：

| 想要的效果 | `list` | `render` | `publishResources` | 输出目录 |
| --- | --- | --- | --- | --- |
| 普通页面（默认） | `always` | `always` | `true` | 页面 HTML + 全部资源 |
| 无头页面：内容供别处引用，自己不出现 | `never` | `never` | `false` | 无页面 HTML；资源在被引用时才发布 |
| 无头内容区块：后代可本地导航但不发布 | `local`（由 `cascade` 下发） | `never` | `false` | 只有被引用的资源 |
| 只列出、不发布（术语表） | `local`（下发后代） | 后代 `never`，区块页 `always` | `false` | 只有区块页 `index.html` |
| 只发布、不列出（区块页不出现） | `never` | `never`（只设区块页本身） | 默认 `true` | 后代各自有 `index.html`，区块页没有 |
| 生产环境隐藏整块内容 | `never`（+ `target`） | `never`（+ `target`） | `false` | 生产构建里完全不出现 |

**别用**这些组合：

- **`render = 'never'` 却指望页面的 URL 可用**——`never` 既不生成文件也把页面排除在集合外，链接会 404；只想「有链接但没文件」应当用 `link`；
- **`publishResources = false` 却指望资源自动出现**——只有模板真的调用了 `.RelPermalink`、`.Permalink` 或 `.Publish` 时才会发布，见[无头页面](#无头页面headless-page)的示例；
- **把页面级 `[build]` 写进项目配置**——那是站点级区段，键名完全不同，页面不会按你的预期被隐藏。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面在站点里「消失了」，`hugo list all` 也查不到 | `list = 'never'` 会让页面退出所有页面集合（实测：Hugo 0.167） | 临时改成 `local` 或 `always` 验证；用它做无头页时属预期 |
| 没报错但结果不对 | 设了 `publishResources = false`，图片却还在输出目录里 | 模板里调用了该资源的 `RelPermalink`/`Permalink`/`Publish`——这是**预期行为**，只要被引用就会发布 | 若确实不想发布，就别在模板里引用它；只想控制页面本身则用 `render` |
| 没报错但结果不对 | 无头页面能通过 URL 访问 | 同时设了 `list = 'never'` 但 `render` 还是 `always`（或只设了 `headless` 之外的选项） | 三个都要设：`list`/`render` 为 `never`、`publishResources` 按需；或直接用 `headless = true` |
| 没报错但结果不对 | `cascade` 里的构建选项没有作用到区块页自己 | `cascade` 只向下传给后代页面 | 区块页自身要在同一声明里单独写 `[build]` |
| 没报错但结果不对 | 环境限定没生效，生产站也隐藏了 | `[cascade.target] environment` 写错，或本地也是 `production` 环境 | 用 `hugo env` 确认当前环境；构建生产站用 `hugo --environment production` |
| 报错看不懂 | `ERROR … can not convert … to …` 之类类型错误 | `list` 与 `render` 要字符串（`'always'`），`publishResources` 要布尔（`true` 不带引号） | 按上表核对引号：`list = 'never'`、`publishResources = false` |
| 报错看不懂 | 配置里写了 `_build`，行为与预期不符 | `_build` 是早期版本的写法 | 改用 `build`，见本页开头说明 |

更多排查入口见[故障排查](/troubleshooting/)。

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
