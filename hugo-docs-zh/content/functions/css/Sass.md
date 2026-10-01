+++
title = "css.Sass"
linkTitle = "Sass"
description = "返回把给定 Sass 资源转译为 CSS 后生成的资源。"
date = 2026-10-02
weight = 60
source = "https://gohugo.io/functions/css/sass/"

[params.functions_and_methods]
signatures = ["css.Sass [OPTIONS] RESOURCE"]
returnType = "resource.Resource"
aliases = ["toCSS"]
+++

用 Hugo extended 与 extended/deploy 版本内置的 LibSass 转译器把 Sass 转译为 CSS，或者[安装 Dart Sass](#dart-sass) 以使用 Sass 语言的最新特性。

<!-- TODO
Remove the admonition below somewhere after v0.168.0, 15 minor releases
after deprecation.
-->

> [!WARNING]
> 内置的 LibSass 转译器自 [v0.153.0][] 起弃用，并将在未来的版本中移除。请改用 Dart Sass 转译器，即按下文示例把 `transpiler` 选项设为 `dartsass`。

Sass 有两种语法形式：[SCSS][] 与[缩进语法][indented]。Hugo 两者都支持。

## 选项

`css.Sass` 函数接受一个选项映射。

`enableSourceMap`
: (`bool`) 是否生成 source map。默认是 `false`。

  ```go-html-template
  {{ $opts := dict
    "transpiler" "dartsass"
    "enableSourceMap" true
  }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

`importContext`
: **（0.165.0 新增）**
: (`resource.ResourceGetter`) 解析 `@use` 与 `@import` 语句时使用的资源获取器（resource getter）。Hugo 先按语句中书写的路径在这个上下文中查找，找不到再回退到文件系统。适用于 Dart Sass。

`includePaths`
: (`slice`) 路径切片，相对于项目根目录；转译器在解析 `@use` 与 `@import` 语句时会使用这些路径。

  ```go-html-template
  {{ $opts := dict
    "transpiler" "dartsass"
    "includePaths" (slice "node_modules/bootstrap/scss")
  }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

`outputStyle`
: (`string`) 生成 CSS 的输出风格。使用 LibSass 时取 `nested`（默认）、`expanded`、`compact`、`compressed` 之一；使用 Dart Sass 时取 `expanded`（默认）或 `compressed`。

  ```go-html-template
  {{ $opts := dict
    "transpiler" "dartsass"
    "outputStyle" "compressed"
  }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

`precision`
: (`int`) 浮点运算的精度。适用于 LibSass。默认是 `8`。

  ```go-html-template
  {{ $opts := dict
    "transpiler" "dartsass"
    "precision" 10
  }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

`silenceDeprecations`
: **（0.139.0 新增）**
: (`slice`) 要静默的弃用项 ID 切片。ID 在 Dart Sass 的警告信息中写在方括号内（例如 `WARN Dart Sass: DEPRECATED [import]` 中的 `import`）。适用于 Dart Sass。

  ```go-html-template
  {{ $opts := dict
    "transpiler" "dartsass"
    "silenceDeprecations" (slice "import")
  }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

`silenceDependencyDeprecations`
: **（0.146.0 新增）**
: (`bool`) 是否静默来自依赖的弃用警告。这里把通过加载路径被间接导入的任何文件都视为依赖。这不适用于 `@warn` 或 `@debug` 规则。默认是 `false`。

  ```go-html-template
  {{ $opts := dict
    "transpiler" "dartsass"
    "silenceDependencyDeprecations" true
  }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

`sourceMapIncludeSources`
: (`bool`) 是否把源码嵌入生成的 source map。适用于 Dart Sass。默认是 `false`。

  ```go-html-template
  {{ $opts := dict
    "transpiler" "dartsass"
    "enableSourceMap" true "sourceMapIncludeSources" true
  }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

`targetPath`
: (`string`) 资源的目标路径，相对于 [`publishDir`][]。不设置时，目标路径默认为该资源原路径并把扩展名改为 `.css`。

  ```go-html-template
  {{ $opts := dict
    "transpiler" "dartsass"
    "targetPath" "css/bundle.css"
  }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

`transpiler`
: (`string`) 要使用的转译器，取 `libsass` 或 `dartsass`。Hugo 的 extended 与 extended/deploy 版本包含 LibSass 转译器。要使用 Dart Sass 转译器，参见[安装说明](#dart-sass)。默认是 `libsass`。

  ```go-html-template
  {{ $opts := dict "transpiler" "dartsass" }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

`vars`
: (`map`) 用于生成 Sass 变量的键值对映射。当 `css.Sass` 函数在 `@use` 或 `@import` 语句中遇到 `hugo:vars` 这个内部标识符时，会把这些变量注入样式表。

  ```go-html-template
  {{ $vars := dict
    "font-family" "\"Times New Roman\", Times, serif"
    "font-size" "24px"
    "primary-color" "blue"
  }}
  {{ $opts := dict
    "transpiler" "dartsass"
    "vars" $vars
  }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

  在上例中，只要在样式表里使用该标识符，就能以 `hugo:vars` 命名空间下的 Sass 变量访问这些值：

  ```scss
  @use 'hugo:vars' as v;

  .element {
    color: v.$primary-color;
    font-family: v.$font-family;
    font-size: v.$font-size;
  }
  ```

  上面的写法会生成等价于下述内容的输出：

  ```css
  .element {
    color: blue;
    font-family: "Times New Roman", Times, serif;
    font-size: 24px;
  }
  ```

  **（0.161.0 新增）**

  该映射可选地包含嵌套映射。每个嵌套映射会作为一个独立的 `hugo:vars/<name>` 命名空间暴露出来，其中 `<name>` 是嵌套映射的键（转为小写）。顶层的标量值与嵌套映射彼此独立：顶层的 `@use 'hugo:vars'` 只包含标量值，而 `@use 'hugo:vars/<name>'` 只包含指定嵌套映射中的标量。

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
  {{ $opts := dict
    "transpiler" "dartsass"
    "vars" $vars
  }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

  在样式表中，用各自独立的 `@use` 语句引用每个嵌套命名空间。给它指定一个别名，以便访问该命名空间中的变量：

  ```scss
  @use 'hugo:vars' as v;
  @use 'hugo:vars/mobile' as mobile;

  body {
    color: v.$primary-color;
    font-family: v.$font-family;
    font-size: v.$font-size;
  }

  @media (max-width: 650px) {
    body {
      color: mobile.$primary-color;
      font-size: mobile.$font-size;
    }
  }
  ```

  上面的写法会生成等价于下述内容的输出：

  ```css
  body {
    color: blue;
    font-family: "Times New Roman", Times, serif;
    font-size: 24px;
  }

  @media (max-width: 650px) {
    body {
      color: red;
      font-size: 12px;
    }
  }
  ```

  在项目配置中设置 Sass 变量时，`vars` 选项很有用。

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
  {{ $opts := dict
    "transpiler" "dartsass"
    "vars" site.Params.theme.style }}
  {{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
  ```

  向 `css.Sass` 函数传入 `vars` 映射时，Hugo 会用正则匹配识别诸如 `24px` 或 `#FF0000` 这类常见的有类型 CSS 值。必要时可以用 [`css.Quoted`][] 或 [`css.Unquoted`][] 函数绕过自动类型推断，明确表示某个值的类型。

## 示例

```go-html-template {copy=true}
{{ with resources.Get "sass/main.scss" }}
  {{ $opts := dict
    "enableSourceMap" hugo.IsDevelopment
    "outputStyle" (cond hugo.IsDevelopment "expanded" "compressed")
    "targetPath" "css/main.css"
    "transpiler" "dartsass"
    "vars" site.Params.styles
    "includePaths" (slice "node_modules/bootstrap/scss")
  }}
  {{ with . | css.Sass $opts }}
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

## Dart Sass

<!-- TODO
Revise the paragraphs below somewhere after v0.168.0, 15 minor releases
after the deprecation of the LibSass transpiler.
-->

Hugo 的 extended 与 extended/deploy 版本包含 [LibSass][]，用于把 Sass 转译为 CSS。2020 年，Sass 团队弃用 LibSass，转而推荐 [Dart Sass][]。

在开发与生产环境中安装 Dart Sass，即可使用 Sass 语言的最新特性。

### 安装概览

Dart Sass 与 Hugo v0.114.0 及更高版本兼容。

如果你曾在 Hugo v0.113.0 及更早版本中使用 Embedded Dart Sass[^1]，请先卸载 Embedded Dart Sass，再安装 Dart Sass。若两者都已安装，Hugo 会使用 Dart Sass。

如果你是通过 [Snap 包][Snap package]安装 Hugo 的，则无需再安装 Dart Sass，Hugo 的 Snap 包已包含 Dart Sass。

### 开发环境

只要把 Dart Sass 安装到 PATH 中的某个位置，Hugo 就能找到它。

操作系统 | 包管理器 | 站点               | 安装方式
:-------|:---------|:-------------------|:-----------------------------
Linux    | Homebrew | [brew.sh][]        | `brew install sass/sass/sass`
Linux    | Snap     | [snapcraft.io][]   | `sudo snap install dart-sass`
macOS    | Homebrew | [brew.sh][]        | `brew install sass/sass/sass`
Windows  | Chocolatey | [chocolatey.org][] | `choco install sass`
Windows  | Scoop    | [scoop.sh][]       | `scoop install sass`

你也可以为 Linux、macOS 与 Windows 安装[预编译二进制文件][prebuilt binaries]。预编译二进制文件必须安装在项目目录之外，并确保其路径包含在系统的 PATH 环境变量中。

运行 `hugo env` 可以列出当前生效的转译器。

> [!NOTE]
> 如果你从源码构建 Hugo 并运行 `mage test -v`，而 Dart Sass 是通过 Snap 包安装的，测试会失败。这是由 Snap 包的严格受限（strict confinement）模型导致的。

### 生产环境

要在 CI/CD 平台上把 Dart Sass 与 Hugo 一起使用，通常必须修改构建工作流，在 Hugo 站点构建开始之前安装 Dart Sass。因为这类平台没有预装 Dart Sass，而 Hugo 需要它来处理 Sass 文件。

有一个重要的例外可以跳过这一步：你已经把 `resources` 目录提交到了仓库。这只有在下列条件都满足时才可行：

- 你没有改动 Hugo 默认的资源缓存位置。
- 你没有在项目配置中把 [`useResourceCacheWhen`][] 设为 never。

把 `resources` 目录提交上去，就等于把预构建好的 CSS 文件直接交给 CI/CD 平台，平台因此无需自己运行 Sass 编译。

关于如何在生产环境中安装 Dart Sass 的示例，参见下列托管指南：

- [Cloudflare][]
- [GitHub Pages][]
- [GitLab Pages][]
- [Netlify][]
- [Render][]
- [SourceHut][]
- [Vercel][]

[^1]: 2023 年，Sass 团队弃用 Embedded Dart Sass，转而推荐 Dart Sass。

[Cloudflare]: /host-and-deploy/host-on-cloudflare/
[Dart Sass]: https://sass-lang.com/dart-sass/
[GitHub Pages]: /host-and-deploy/host-on-github-pages/
[GitLab Pages]: /host-and-deploy/host-on-gitlab-pages/
[LibSass]: https://sass-lang.com/libsass
[Netlify]: /host-and-deploy/host-on-netlify/
[Render]: /host-and-deploy/host-on-render/
[SCSS]: https://sass-lang.com/documentation/syntax#scss
[Snap package]: https://snapcraft.io/hugo
[SourceHut]: /host-and-deploy/host-on-sourcehut-pages/
[Vercel]: /host-and-deploy/host-on-vercel/
[`css.Quoted`]: /functions/css/quoted/
[`css.Unquoted`]: /functions/css/unquoted/
[`publishDir`]: /configuration/all/#publishdir
[`useResourceCacheWhen`]: /configuration/build/#useresourcecachewhen
[brew.sh]: https://brew.sh/
[chocolatey.org]: https://community.chocolatey.org/packages/sass
[indented]: https://sass-lang.com/documentation/syntax#the-indented-syntax
[prebuilt binaries]: https://github.com/sass/dart-sass/releases/latest
[scoop.sh]: https://scoop.sh/#/apps?q=sass
[snapcraft.io]: https://snapcraft.io/dart-sass
[v0.153.0]: https://github.com/gohugoio/hugo/releases/tag/v0.153.0
