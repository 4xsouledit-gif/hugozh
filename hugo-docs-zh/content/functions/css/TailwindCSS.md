+++
title = "css.TailwindCSS"
linkTitle = "TailwindCSS"
description = "返回用 Tailwind CSS CLI 处理给定资源后生成的资源。"
date = 2026-10-02
weight = 70
source = "https://gohugo.io/functions/css/tailwindcss/"

[params.functions_and_methods]
signatures = ["css.TailwindCSS [OPTIONS] RESOURCE"]
returnType = "resource.Resource"
+++

用 `css.TailwindCSS` 函数处理 Tailwind CSS 文件。这个函数借助 Tailwind CSS CLI 完成以下工作：

1. 扫描模板中使用的 Tailwind CSS 工具类。
1. 把这些工具类编译为标准 CSS。
1. 生成优化后的 CSS 输出文件。

> [!NOTE]
> 这个函数要配合 Tailwind CSS v4.0 及更高版本使用；它们需要相对[现代的浏览器][modern browser]才能正确渲染。

## 准备

第 1 步
: 安装 Tailwind CSS v4.0 或更高版本：

  ```sh {copy=true}
  npm install --save-dev tailwindcss @tailwindcss/cli @tailwindcss/typography
  ```

  <!-- TODO
  Remove the admonition below somewhere after v0.176.0, 15 minor releases
  after deprecation.
  -->

  > [!NOTE]
  > 自 v0.161.0 起，Hugo 不再支持 Tailwind 的[独立二进制文件][standalone binary]。现在必须像上面那样通过 `npm` 安装 Tailwind CSS CLI。

第 2 步
: 在项目配置中加入：

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
  [security.exec]
    allow = ['^(dart-)?sass$', '^go$', '^git$', '^node$', '^postcss$', '^tailwindcss$']
  ```

第 3 步
: 创建一个 CSS 入口文件：

  ```css {file="assets/css/main.css" copy=true}
  @import "tailwindcss";
  @plugin "@tailwindcss/typography";
  @source "hugo_stats.json";
  ```

  Tailwind CSS 会遵循 `.gitignore` 文件。也就是说，如果 `hugo_stats.json` 出现在 `.gitignore` 中，Tailwind CSS 会忽略它。要让 Tailwind CSS 能用到 `hugo_stats.json`，就必须像上例那样显式地把它声明为来源。

第 4 步
: 创建一个 _partial_ 模板，用 Tailwind CSS CLI 处理 CSS：

  ```go-html-template {file="layouts/_partials/css.html" copy=true}
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

第 5 步
: 从 _base_ 模板调用这个 _partial_ 模板，并把模板执行推迟到所有站点与输出格式都渲染完成之后：

  ```go-html-template {file="layouts/baseof.html" copy=true}
  <head>
    {{ with (templates.Defer (dict "key" "global")) }}
      {{ partial "css.html" . }}
    {{ end }}
  </head>
  ```

## 选项

`css.TailwindCSS` 函数接受一个选项映射。

`disableInlineImports`
: **（0.147.4 新增）**
: (`bool`) 是否禁用 `@import` 语句的内联。内联是递归进行的，但目前每个文件只内联一次，无法在不同作用域（根、媒体查询等）中导入同一个文件。注意这个导入例程并不关心 CSS 规范，因此 `@import` 语句可以出现在文件中任意位置。默认是 `false`。

`importContext`
: **（0.165.0 新增）**
: (`resource.ResourceGetter`) 解析 `@import` 语句时使用的资源获取器（resource getter）。Hugo 先按语句中书写的路径在这个上下文中查找，找不到再回退到文件系统。当 [`disableInlineImports`](#disableinlineimports) 为 `true` 时该选项无效。

`minify`
: (`bool`) 是否优化并压缩输出。默认是 `false`。

`optimize`
: (`bool`) 是否在不压缩的前提下优化输出。默认是 `false`。

`skipInlineImportsNotFound`
: (`bool`) 是否存在无法解析的导入语句时仍允许构建继续，并保留原有的导入声明。需要特别注意的是，内联导入器不处理基于 URL 的导入或带媒体查询的导入，因此即使禁用了这个选项，它们也会原样保留。默认是 `false`。

## 注入 CSS 变量

[`css.Build`][] 函数有一个 [`vars`][] 选项，可用于把 CSS 变量注入样式表。当需要根据站点配置或其他数据动态设置值时，这特别有用。要在 Tailwind CSS 中做到这一点，可以在把结果交给 `css.TailwindCSS` 之前，先用 `css.Build` 做一步预处理。写法如下：

```go-html-template
{{ with resources.Get "css/styles.css" }}
  {{ $cssOpts := dict
    "vars" (dict "favourite-color" "#7f93c9")
    "externals" (slice "tailwindcss")
  }}
  {{ $tailwindOpts := dict "disableInlineImports" true }}
  {{ with . | css.Build $cssOpts | css.TailwindCSS $tailwindOpts }}
    <link rel="stylesheet" href="{{ .RelPermalink }}">
  {{ end }}
{{ end }}
```

关于上例的几点说明：

- 在 `css.Build` 的选项里把 `tailwindcss` 标为外部依赖，可以避免它在这一步被处理，从而留到下一步由 Tailwind CSS CLI 正确处理。
- Tailwind CSS 这一步把 `disableInlineImports` 设为 `true`，因为导入已由 `css.Build` 处理。

[modern browser]: https://tailwindcss.com/docs/compatibility#browser-support
[standalone binary]: https://github.com/tailwindlabs/tailwindcss/releases/latest
[`css.Build`]: /functions/css/build/
[`vars`]: /functions/css/build/#vars
