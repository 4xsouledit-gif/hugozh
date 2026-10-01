+++
title = "把 Sass 编译为 CSS"
linkTitle = "把 Sass 编译为 CSS"
description = "用 css.Sass 把 Sass 或 SCSS 编译为 CSS，并压缩与加指纹。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/hugo-pipes/transpile-sass-to-css/"
+++

## 适用前提

用 `css.Sass` 函数把 Sass 转译为 CSS。Hugo 的 extended 版与 extended/deploy 版内置了 LibSass 转译器；若想使用 Sass 语言的最新特性，则需另行安装 Dart Sass。Sass 有 SCSS 与缩进语法两种书写形式，Hugo 都支持。

转译器的选择由 `transpiler` 选项决定，取值为 `libsass` 或 `dartsass`，默认是 `libsass`。内置的 LibSass 转译器已标记为过时并将在未来的版本中移除，因此建议改用 Dart Sass：把 `transpiler` 设为 `dartsass` 即可。

采用 Dart Sass 时，把它装进 `PATH` 覆盖到的位置，Hugo 就能找到它。用 `hugo env` 命令可以列出当前生效的转译器。在持续集成的构建环境中，通常需要在构建开始前先安装 Dart Sass，除非你已按原样把 `resources` 目录提交进仓库。

## 取得资源

样式表同样要先作为资源取出，再进入管道。资源位于资产目录 `assets` 中，例如 `assets/sass/main.scss` 就写为 `resources.Get "sass/main.scss"`。

## 管道方法链

```go-html-template
{{ $opts := dict "transpiler" "dartsass" }}
{{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
```

选项以映射形式传入，要与其他函数串成管道链时紧随其后：

```go-html-template
{{ $r := resources.Get "sass/main.scss" | css.Sass $opts | resources.Minify | resources.Fingerprint }}
```

## 配置选项

`css.Sass` 接受一个选项映射，常用键如下。

- `transpiler`：转译器，`libsass` 或 `dartsass`，默认 `libsass`。
- `outputStyle`：输出样式。LibSass 可取 `nested`（默认）、`expanded`、`compact`、`compressed`；Dart Sass 取 `expanded`（默认）或 `compressed`。
- `enableSourceMap`：是否生成 source map，默认 `false`。另有 `sourceMapIncludeSources` 决定是否把源文件嵌入 source map，默认 `false`，适用于 Dart Sass。
- `targetPath`：目标路径，相对于 `publishDir`；若不设置，则默认为资源原路径换用 `.css` 扩展名。
- `includePaths`：一个路径切片，用于解析 `@use` 与 `@import`，例如 `node_modules/bootstrap/scss`。
- `precision`：浮点运算精度，默认 `8`，适用于 LibSass。
- `silenceDeprecations` 与 `silenceDependencyDeprecations`：用于压制度弃告警，后者默认 `false`，适用于 Dart Sass。
- `vars`：键值映射，用来生成 Sass 变量。

## Sass 变量

`vars` 中的变量会在样式表里遇到 `hugo:vars` 这一内部标识符时注入。在配置文件中集中定义颜色与字号，再交给模板，是一种常见做法：

```toml
[params.theme.style]
font-family = '"Times New Roman", Times, serif'
font-size = '24px'
primary-color = 'blue'
```

```go-html-template
{{ $opts := dict "transpiler" "dartsass" "vars" site.Params.theme.style }}
{{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
```

样式表中以 `@use 'hugo:vars' as v;` 引入后，即可用 `v.$primary-color` 这样的形式取值。传入 `vars` 时，Hugo 会用正则匹配识别 `24px`、`#FF0000` 一类常见的带类型 CSS 值；必要时可用 `css.Quoted` 或 `css.Unquoted` 明确指定类型，避免自动推断造成歧义。

## 示例

```go-html-template
{{ with resources.Get "sass/main.scss" }}
  {{ $opts := dict
    "transpiler" "dartsass"
    "targetPath" "css/main.css"
    "outputStyle" (cond hugo.IsDevelopment "expanded" "compressed")
    "includePaths" (slice "node_modules/bootstrap/scss")
  }}
  {{ with . | css.Sass $opts | fingerprint }}
    <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
  {{ end }}
{{ end }}
```

## 缓存与并发

管道链的结果按整条链缓存，同一次构建中只执行一次，反复调用不会重复编译。

## 发布与指纹

调用 `.RelPermalink` 或 `.Permalink` 会触发发布。生产环境通常再串上 `resources.Fingerprint`，得到带哈希的文件名与 `.Data.Integrity`，便于设置长缓存并启用子资源完整性校验。
