+++
title = "templates.Defer"
linkTitle = "Defer"
description = "把模板的执行推迟到所有站点与输出格式都渲染完成之后。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/templates/defer/"

[params.functions_and_methods]
signatures = ["templates.Defer OPTIONS"]
returnType = "string"
+++

## 用法

`templates.Defer` 函数把模板的执行推迟到所有站点与输出格式都渲染完成之后。

> [!NOTE]
> 不要在通过 `partialCached` 函数调用的 _partial_ 模板中调用该函数。这条限制具有传递性：如果 `partialCached` 调用的 _partial_ 模板又调用了 `templates.Defer`，Hugo 会返回错误。在短代码（shortcode）或渲染钩子（render hook）模板中使用该函数也可能导致不可预期的结果。

> [!NOTE]
> 该函数只能与 `with` 关键字配合使用。
>
> 在外面定义的变量在内部不可见，反之亦然。要传入数据，请使用 `data` 选项。

`templates.Defer` 函数只接受一个参数，即一个映射，其中可含以下键：

`key`
: （`string`）用于该延迟模板的键。它与模板内容的哈希值一起作为缓存键。不指定该键时，Hugo 每次渲染都会执行这个延迟模板，对 CSS、JavaScript 这类共享资源来说效率很低。

`data`
: （`map`）可选，作为数据传给延迟模板的映射。在延迟模板中可以通过 `.` 或 `$` 访问它。

```go-html-template
Language Outside: {{ site.Language.Name }}
Page Outside: {{ .RelPermalink }}
I18n Outside: {{ i18n "hello" }}
{{ $data := (dict "page" . )}}
{{ with (templates.Defer (dict "data" $data )) }}
     Language Inside: {{ site.Language.Name }}
     Page Inside: {{ .page.RelPermalink }}
     I18n Inside: {{ i18n "hello" }}
{{ end }}
```

即使执行被推迟，[输出格式][output format]、[站点][site]与[语言][language]仍保持不变。在上例中，这意味着延迟模板内部的 `site.Language.Name` 与 `.RelPermalink` 与其外部完全一致。

## 示例

下面的示例把 CSS 处理推迟到 Hugo 渲染完所有页面之后。

### 处理 Tailwind CSS

[`css.TailwindCSS`][] 函数会用 [`hugo_stats.json`][] 判断哪些类名及其它 HTML 标识符被使用。由于 Hugo 必须先渲染完所有页面才能写出该文件，处理 CSS 时要按下面的模板延迟执行：

```go-html-template {file="layouts/baseof.html"}
<head>
  {{ with (templates.Defer (dict "key" "global")) }}
    {{ partial "css.html" . }}
  {{ end }}
</head>
```

```go-html-template {file="layouts/_partials/css.html"}
{{ with resources.Get "css/main.css" }}
  {{ $opts := dict "minify" (not hugo.IsDevelopment) }}
  {{ with . | css.TailwindCSS $opts }}
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

要让上面的写法在运行服务器（或 `hugo -w`）时也工作良好，请添加以下配置：

```toml
[build]
  [build.buildStats]
    enable = true
  [[build.cachebusters]]
    source = 'assets/notwatching/hugo_stats\.json'
    target = 'css'
  [[build.cachebusters]]
    source = '(postcss|tailwind)\.config\.js'
    target = 'css'
[module]
  [[module.mounts]]
    source = 'assets'
    target = 'assets'
  [[module.mounts]]
    disableWatch = true
    source = 'hugo_stats.json'
    target = 'assets/notwatching/hugo_stats.json'
```

### 移除未使用的 CSS

在第 4 步中创建的 `postcss.config.mjs` 配置文件，会让 [`PurgeCSS`][] 插件在 [`css.PostCSS`][] 函数运行时读取 [`hugo_stats.json`][]。由于 Hugo 只有在所有页面渲染完成后才会写出该文件，CSS 处理必须延迟执行。

第 1 步
: 安装 [Node.js][]。

第 2 步
: 在项目根目录安装所需的 Node 包：

  ```sh
  npm i -D postcss postcss-cli autoprefixer @fullhuman/postcss-purgecss
  ```

第 3 步
: 构建站点时启用生成 [`hugo_stats.json`][] 文件。如果只在生产构建中使用它，可以考虑把它放到 [`config/production`][] 下。

  ```toml
  [build.buildStats]
  enable = true
  ```

  细节与可选设置参见[配置构建][configure build]。

第 4 步
: 在项目根目录为 `PurgeCSS` 与 `autoprefixer` 插件创建配置文件。

  ```js {file="postcss.config.mjs"}
  import autoprefixer from 'autoprefixer';
  import purgeCSSPlugin from '@fullhuman/postcss-purgecss';

  const purgecss = purgeCSSPlugin({
    content: ['./hugo_stats.json'],
    defaultExtractor: content => {
      const els = JSON.parse(content).htmlElements;
      return [
        ...(els.tags || []),
        ...(els.classes || []),
        ...(els.ids || []),
      ];
    },
    // https://purgecss.com/safelisting.html
    safelist: []
  });

  export default {
    plugins: [
      process.env.HUGO_ENVIRONMENT !== 'development' ? purgecss : null,
      autoprefixer,
    ]
  };
  ```

第 5 步
: 把 CSS 文件放到 `assets/css` 目录中。

第 6 步
: 延迟 CSS 处理，让它在站点渲染完成后再执行：

  ```go-html-template {file="layouts/baseof.html"}
  <head>
    {{ with (templates.Defer (dict "key" "global")) }}
      {{ partial "css.html" . }}
    {{ end }}
  </head>
  ```

  ```go-html-template {file="layouts/_partials/css.html"}
  {{ with resources.Get "css/main.css" }}
    {{ if hugo.IsDevelopment }}
      <link rel="stylesheet" href="{{ .RelPermalink }}">
    {{ else }}
      {{ with . | postCSS | minify | fingerprint }}
        <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
      {{ end }}
    {{ end }}
  {{ end }}
  ```

[Node.js]: https://nodejs.org/en
[`PurgeCSS`]: https://github.com/FullHuman/purgecss
[`config/production`]: /configuration/introduction/#configuration-directory
[`css.PostCSS`]: /functions/css/postcss/
[`css.TailwindCSS`]: /functions/css/tailwindcss/
[`hugo_stats.json`]: /configuration/build/
[configure build]: /configuration/build/
[language]: /methods/site/language/
[output format]: /configuration/output-formats/
[site]: /methods/page/site/
