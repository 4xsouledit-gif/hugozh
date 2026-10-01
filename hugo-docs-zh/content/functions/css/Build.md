+++
title = "css.Build"
linkTitle = "Build"
description = "返回把给定 CSS 资源打包、转换并压缩后生成的资源。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/css/build/"

[params.functions_and_methods]
signatures = ["css.Build [OPTIONS] RESOURCE"]
returnType = "resource.Resource"
+++

**（0.158.0 新增）**

> [!NOTE]
> `css.Build` 函数由 [`evanw/esbuild`][] 包提供支持，为打包、转换与压缩提供了成熟且高性能的基础。

用 `css.Build` 函数可以：

- 递归地把 CSS 文件中的 `@import` 语句替换为被导入文件的内容
- 为兼容浏览器做语法转换
- 为兼容浏览器添加厂商前缀
- 压缩打包后的 CSS 代码
- 生成 source map

若 `@import` 语句带有媒体查询、特性查询或级联层（cascade layer）赋值，该函数会把导入的内容包进对应的 `@media`、`@supports` 或 `@layer` 规则中。

## 用法

下例中，Hugo 把 `@import` 语句引用的本地文件打包成一份资源，并以内容内联的方式发布。

```tree
assets/
└── css/
    ├── components/
    │   ├── a.css
    │   └── b.css
    └── main.css
```

```css {file="assets/css/main.css" copy=true}
@import url('https://cdn.jsdelivr.net/npm/the-new-css-reset/css/reset.min.css');

@import './components/a.css';
@import './components/b.css';

.c {color: blue; }
```

```css {file="assets/css/components/a.css" copy=true}
.a { color: red; }
```

```css {file="assets/css/components/b.css" copy=true}
.b { color: green; }
```

```go-html-template {file="layouts/_partials/css.html" copy=true}
{{ with resources.Get "css/main.css" | css.Build }}
  {{ if hugo.IsDevelopment }}
    <link rel="stylesheet" href="{{ .RelPermalink }}">
  {{ else }}
    {{ with . | fingerprint }}
      <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
    {{ end }}
  {{ end }}
{{ end }}
```

```go-html-template {file="layouts/baseof.html" copy=true}
{{ partialCached "css.html" . }}
```

生成的 CSS 代码：

```css {file="public/css/main.css"}
@import "https://cdn.jsdelivr.net/npm/the-new-css-reset/css/reset.min.css";

.a {
  color: red;
}

.b {
  color: green;
}

.c {
  color: blue;
}
```

要压缩生成的 CSS 代码，请使用下文所述的 [`minify`](#minify) 选项。

## 选项

`css.Build` 函数接受一个选项映射，用于微调打包、压缩与浏览器兼容性。

`externals`
: (`[]string`) 要从打包中排除的路径模式切片。这些模式对应的 `@import` 语句会在生成的 CSS 代码中原样保留。参见[详情][esb external]。

  ```go-html-template
  {{ $opts := dict "externals" (slice "./exclude-these/*" "./exclude-these-too/*") }}
  {{ $r := resources.Get "css/main.css" | css.Build $opts }}
  ```

`importContext`
: **（0.165.0 新增）**
: (`resource.ResourceGetter`) 解析 `@import` 语句时使用的[资源获取器](g)。Hugo 先按 `@import` 语句中书写的路径在这个上下文中查找，找不到再回退到文件系统。

`loaders`
: (`map`) 文件扩展名到加载器类型的映射，用于决定打包时如何处理具有给定扩展名的文件。默认情况下，Hugo 对 `.css` 文件使用 `css` 加载器，对其余文件使用 `file` 加载器。常用加载器包括：

  - `css`：把文件作为 CSS 文件处理
  - `dataurl`：把文件以内嵌的 base64 数据 URL 形式嵌入
  - `empty`：把文件排除在打包结果之外
  - `file`：把文件复制到输出目录并改写其 URL
  - `text`：把文件内容作为字符串加载

  参见[详情][esb loader]。

  ```go-html-template
  {{ $opts := dict "loaders" (dict ".png" "dataurl" ".svg" "dataurl") }}
  {{ $r := resources.Get "css/main.css" | css.Build $opts }}
  ```

`mainFields`
: (`[]string`) `package.json` 文件中用于确定 Node 包 CSS 入口点的字段名切片，按优先级排列。默认是 `["style", "main"]`。参见[详情][esb mainfields]。

  当 `@import` 语句引用某个 Node 包时，Hugo 会查阅该包 `package.json` 中的元数据来查找样式表。若某个包用非标准字段定义 CSS 入口点，可用这个选项支持它。

  ```go-html-template
  {{ $opts := dict "mainFields" (slice "css" "style" "main") }}
  {{ $r := resources.Get "css/main.css" | css.Build $opts }}
  ```

`minify`
: (`bool`) 是否压缩生成的 CSS 代码。默认是 `false`。参见[详情][esb minify]。

  ```go-html-template
  {{ $opts := dict "minify" true }}
  {{ $r := resources.Get "css/main.css" | css.Build $opts }}
  ```

`sourceMap`
: (`string`) 要生成的 source map 类型，取 `external`、`inline`、`linked`、`none` 之一。默认是 `none`。参见[详情][esb sourcemap]。

  ```go-html-template
  {{ $opts := dict "sourceMap" "linked" }}
  {{ $r := resources.Get "css/main.css" | css.Build $opts }}
  ```

`sourcesContent`
: (`bool`) 是否在 source map 中包含源文件的内容。默认是 `true`。参见[详情][esb sourcesContent]。

  ```go-html-template
  {{ $opts := dict "sourceMap" "linked" "sourcesContent" false }}
  {{ $r := resources.Get "css/main.css" | css.Build $opts }}
  ```

`target`
: (`[]string`) 生成的 CSS 代码的目标环境，用于决定执行哪些语法转换、添加哪些厂商前缀。不设置时不做任何转换或加前缀。每个元素由目标名称与版本号组成。支持的目标包括 `chrome`、`edge`、`firefox`、`ie`、`ios`、`opera`、`safari`。参见[详情][esb target]。

  ```go-html-template
  {{ $target := slice "chrome115" "edge115" "firefox116" "ios16.4" "opera101" "safari16.4" }}
  {{ $opts := dict "target" $target }}
  {{ $r := resources.Get "css/main.css" | css.Build $opts }}
  ```

  上述目标环境大致相当于截至 2026 年 3 月 [browserlist][] 的「baseline widely available」配置。

`targetPath`
: (`string`) 资源的目标路径，相对于 [`publishDir`][]。不设置时，目标路径默认为该资源原路径并把扩展名改为 `.css`。

  ```go-html-template
  {{ $opts := dict "targetPath" "css/styles.css" }}
  {{ $r := resources.Get "css/main.css" | css.Build $opts }}
  ```

`vars`
: **（0.160.0 新增）**
: (`map`) 用于生成 CSS 变量的键值对映射。当 `css.Build` 函数在 `@import` 语句中遇到 `hugo:vars` 这个内部标识符时，会把这些变量注入样式表。

  ```go-html-template
  {{ $vars := dict
    "font-family" "\"Times New Roman\", Times, serif"
    "font-size" "24px"
    "primary-color" "blue"
  }}
  {{ $opts := dict "vars" $vars }}
  {{ $r := resources.Get "css/main.css" | css.Build $opts }}
  ```

  在上例中，只要在 CSS 里使用该标识符，就能用标准 CSS 变量语法访问这些值。

  ```css
  @import 'hugo:vars';

  .element {
    color: var(--primary-color);
    font-family: var(--font-family);
    font-size: var(--font-size);
  }
  ```

  上面的写法会生成等价于下述内容的输出：

  ```css
  :root {
    --font-family:
      "Times New Roman",
      Times,
      serif;
    --font-size: 24px;
    --primary-color: blue;
  }

  .element {
    color: var(--primary-color);
    font-family: var(--font-family);
    font-size: var(--font-size);
  }
  ```

  **（0.161.0 新增）**

  该映射可选地包含嵌套映射。每个嵌套映射会作为一个独立的 `hugo:vars/<name>` 命名空间暴露出来，其中 `<name>` 是嵌套映射的键（转为小写）。顶层的标量值与嵌套映射彼此独立：顶层的 `@import 'hugo:vars'` 只包含标量值，而 `@import 'hugo:vars/<name>'` 只包含指定嵌套映射中的标量。

  ```go-html-template
  {{ $vars := dict
    "font-family" "\"Times New Roman\", Times, serif"
    "font-size" "24px"
    "primary-color" "blue"
    "mobile" (dict
      "font-size" "12px"
      "primary-color" "red"
    )
  }}
  {{ $opts := dict "vars" $vars }}
  {{ $r := resources.Get "css/main.css" | css.Build $opts }}
  ```

  由于嵌套导入遵循与普通 `@import` 语句相同的规则，你可以给 `hugo:vars/<name>` 导入附加媒体查询、特性查询或级联层赋值。

  ```css
  @import 'hugo:vars';
  @import 'hugo:vars/mobile' (max-width: 650px);

  body {
    background-color: var(--primary-color);
    font-family: var(--font-family);
  }
  ```

  上面的写法会生成等价于下述内容的输出：

  ```css
  :root {
    --font-family: "Times New Roman", Times, serif;
    --font-size: 24px;
    --primary-color: blue;
  }

  @media (max-width: 650px) {
    :root {
      --font-size: 12px;
      --primary-color: red;
    }
  }

  body {
    background-color: var(--primary-color);
    font-family: var(--font-family);
  }
  ```

  在项目配置中设置 CSS 变量时，`vars` 选项很有用。

  ```toml
  [params.theme.style]
  font-family = '"Times New Roman", Times, serif'
  font-size = '24px'
  primary-color = 'blue'

  [params.theme.style.mobile]
  font-size = '12px'
  primary-color = 'red'
  ```

  ```go-html-template
  {{ $opts := dict "vars" site.Params.theme.style }}
  {{ $r := resources.Get "css/main.css" | css.Build $opts }}
  ```

  向 `css.Build` 函数传入 `vars` 映射时，可以用 [`css.Quoted`][] 函数明确表示某个值必须当作带引号的字符串处理，最常用于 `font-family` 名称或 `content` 属性。

  > [!NOTE]
  > 如果你使用 TailwindCSS，并想用 `vars` 选项注入 CSS 变量，参见 [TailwindCSS 文档中的这一节](/functions/css/tailwindcss/#注入-css-变量)。

## 示例

下例使用上文介绍的若干[选项](#选项)来打包、转换并压缩 CSS 代码。

```go-html-template {file="layouts/_partials/css.html" copy=true}
{{ with resources.Get "css/main.css" }}
  {{ $opts := dict
    "loaders" (dict ".png" "dataurl" ".svg" "dataurl")
    "minify" (cond hugo.IsDevelopment false true)
    "sourceMap" (cond hugo.IsDevelopment "linked" "none")
    "target" (slice "chrome115" "edge115" "firefox116" "ios16.4" "opera101" "safari16.4")
    "targetPath" "css/styles.css"
  }}
  {{ with . | css.Build $opts }}
    {{ if hugo.IsDevelopment }}
      <link rel="stylesheet" href="{{ .RelPermalink }}">
    {{ else }}
      {{ with . | fingerprint }}
        <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
      {{ end }}
    {{ end }}
  {{ end }}
{{ end }}
```

使用上述选项时，Hugo 会做以下事情：

- 把 PNG 与 SVG 图片以内嵌数据 URL 的形式写入生成的 CSS 代码
- 在生产环境压缩输出，在开发环境不压缩
- 在开发环境生成外部 source map，在生产环境不生成
- 转换语法以兼容目标浏览器版本
- 添加厂商前缀以兼容目标浏览器版本
- 把生成的 CSS 代码发布到 `css/styles.css`
- 在生产环境加入 SRI 哈希，并把文件哈希插入文件名

## 构建产物

**（0.165.0 新增）**

除主输出之外，Hugo 还可能作为构建的一部分发布其他文件：

- 由 `file` 加载器复制到输出目录的文件，例如字体与图片
- [`sourceMap`](#sourcemap) 选项取 `external` 或 `linked` 时生成的 source map

返回资源上的 `Data` 方法把这些文件以产物切片的形式暴露出来，每一项都提供 `MediaType`、`Permalink` 与 `RelPermalink` 方法。

例如，为构建过程发布的字体文件渲染预加载链接：

```go-html-template {file="layouts/_partials/css.html"}
{{ with resources.Get "css/main.css" }}
  {{ with . | css.Build }}
    {{ range .Data.Artifacts }}
      {{ if eq .MediaType.MainType "font" }}
        <link rel="preload" href="{{ .RelPermalink }}" as="font" type="{{ .MediaType.Type }}" crossorigin>
      {{ end }}
    {{ end }}
    <link rel="stylesheet" href="{{ .RelPermalink }}">
  {{ end }}
{{ end }}
```

## 常见写法

下面的例子涵盖在项目内或 Node 包内引用资源时最常见的用法。这些写法对 `@import` 语句以及用于图片和字体的 `url()` 函数记法都适用。

凡是通过路径引用的资源，包括图片、字体与样式表，都必须位于[统一文件系统](g)的 `assets` 目录中，或位于某个 Node 包内。

### assets 目录中的文件

要引入 `assets` 目录中的样式表，可以使用裸路径、相对路径或根相对路径。使用裸路径时，Hugo 先相对于当前样式表查找，再相对于 `assets` 目录查找。

```css {file="/assets/css/main.css"}
/* A bare path */
@import "variables.css";

/* A relative path */
@import "./theme.css";
@import "../layout.css";

/* A root-relative path */
@import "/css/grid.css";

/* A url() reference using the same resolution logic */
.logo { background: url("/images/logo.svg"); }
```

### Node 包

按名称引用某个 Node 包时，Hugo 会查阅该包内的 `package.json` 文件来寻找入口点。

```css {file="/assets/css/main.css"}
@import "bootstrap";
```

### 包内的文件

要引用某个 Node 包内的具体文件，请给出以包名开头的路径。

```css {file="/assets/css/main.css"}
@import "bootstrap/dist/css/bootstrap-grid.css";
```

[`css.Quoted`]: /functions/css/quoted/
[`evanw/esbuild`]: https://github.com/evanw/esbuild
[`publishDir`]: /configuration/all/#publishdir
[browserlist]: https://browsersl.ist
[esb external]: https://esbuild.github.io/api/#external
[esb loader]: https://esbuild.github.io/api/#loader
[esb mainfields]: https://esbuild.github.io/api/#main-fields
[esb minify]: https://esbuild.github.io/api/#minify
[esb sourcemap]: https://esbuild.github.io/api/#sourcemap
[esb sourcesContent]: https://esbuild.github.io/api/#sources-content
[esb target]: https://esbuild.github.io/api/#target
