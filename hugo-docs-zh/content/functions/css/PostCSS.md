+++
title = "css.PostCSS"
linkTitle = "PostCSS"
description = "返回用 PostCSS 处理给定 CSS 资源后生成的资源。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/css/postcss/"

[params.functions_and_methods]
signatures = ["css.PostCSS [OPTIONS] RESOURCE"]
returnType = "resource.Resource"
aliases = ["postCSS"]
+++

`css.PostCSS` 函数使用 [PostCSS][] 及其任意[插件][]来转换 CSS。

## 准备

第 1 步
: 安装 [Node.js][]。

第 2 步
: 在项目根目录安装所需的 Node 包。例如，安装 PostCSS、它的命令行界面，以及自动为 CSS 添加厂商前缀的插件：

  ```sh
  npm install --save-dev postcss postcss-cli autoprefixer
  ```

第 3 步
: 在项目根目录创建 PostCSS 配置文件。Hugo 会向 PostCSS 进程暴露若干[环境变量](#环境变量)，其中包括当前的 Hugo [环境](g)名。例如在下面的配置中，运行 `hugo server` 会禁用厂商前缀、启用内联 sourcemap；而为生产环境构建时则相反，会应用厂商前缀并禁用 sourcemap：

  ```js {file="postcss.config.mjs" copy=true}
  import autoprefixer from 'autoprefixer';

  const isDev = process.env.HUGO_ENVIRONMENT === 'development';

  export default {
    plugins: [
      !isDev ? autoprefixer : null
    ],
    map: isDev ? { inline: true } : false
  };
  ```

第 4 步
: 把 CSS 文件放进 `assets/css` 目录。

第 5 步
: 创建一个 _partial_ 模板来处理 CSS：

  ```go-html-template {file="layouts/_partials/css.html" copy=true}
  {{ with resources.Get "css/main.css" }}
    {{ $opts := dict
      "inlineImports" true
    }}
    {{ with . | css.PostCSS $opts }}
      {{ if hugo.IsDevelopment }}
        <link rel="stylesheet" href="{{ .RelPermalink }}">
      {{ else }}
        {{ with . | minify | fingerprint }}
          <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
        {{ end }}
      {{ end }}
    {{ end }}
  {{ end }}
  ```

第 6 步
: 从 _base_ 模板调用这个 _partial_ 模板：

  ```go-html-template {file="layouts/baseof.html" copy=true}
  <head>
    {{ partial "css.html" . }}
  </head>
  ```

## 选项

`css.PostCSS` 函数接受一个选项映射。

使用 PostCSS 配置文件时，适用下列选项：

`config`
: (`string`) 存放 PostCSS 配置文件的目录路径。默认情况下，Hugo 会依次在项目根目录以及各模块中查找 `postcss.config.js`、`postcss.config.mjs`、`postcss.config.cjs`。只有当配置文件位于自定义子目录时才需要使用这个选项。

`importContext`
: **（0.165.0 新增）**
: (`resource.ResourceGetter`) 解析 `@import` 语句时使用的[资源获取器](g)。Hugo 先按语句中书写的路径在这个上下文中查找，找不到再回退到文件系统。仅在 [`inlineImports`](#inlineimports) 为 `true` 时有效。

`inlineImports`
: (`bool`) 是否启用导入语句内联。内联是递归进行的，但同一个文件只会被导入一次。Hugo 相对于模块挂载点查找导入，并遵循主题覆盖规则。默认是 `false`。

  注意 Hugo 内部的导入例程并不遵循 CSS 规范：`@import` 语句可以出现在文件中任意位置。不过，外部 URL 导入以及带媒体查询的导入会在内联过程中被忽略。

  下面的片段演示了一个会被 Hugo 忽略的外部 URL 导入：

  ```css
  @import url('https://fonts.googleapis.com/css?family=Open+Sans&display=swap');
  ```

`skipInlineImportsNotFound`
: (`bool`) 是否存在无法解析的导入语句时仍允许构建继续，并保留原有的导入声明。如果你希望把标准 CSS 导入原样保留而不解析，把这个选项设为 `true`。默认是 `false`。

不使用配置文件而直接配置 PostCSS 时，适用下列选项：

`noMap`
: (`bool`) 是否禁用默认的内联 source map。默认是 `false`。

`parser`
: (`string`) 自定义 PostCSS 解析器。

`stringifier`
: (`string`) 自定义 PostCSS 字符串化器（stringifier）。

`syntax`
: (`string`) 自定义 PostCSS 语法。

`use`
: (`string`) 以空格分隔的 PostCSS [插件][]列表。

例如，不通过配置文件，而是直接用选项映射传入插件并禁用 source map：

```go-html-template {file="layouts/_partials/css.html" copy=true}
{{ with resources.Get "css/main.css" }}
  {{ $opts := dict
    "noMap" true
    "use" "autoprefixer postcss-color-alpha"
  }}
  {{ with . | css.PostCSS $opts }}
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

## 环境变量

Hugo 会向 PostCSS 进程传递下列环境变量，在 PostCSS 配置文件中可以直接使用。

`PWD`
: 项目工作目录的绝对路径。

`HUGO_ENVIRONMENT`
: 当前的 Hugo 环境，由 `--environment` 命令行参数设置。
`hugo build` 默认是 `production`，`hugo server` 默认是 `development`。

`HUGO_PUBLISHDIR`
: 发布目录的绝对路径，通常是 `public`。即使使用 `--renderToMemory` 命令行参数渲染到内存，这个值仍指向磁盘上的目录。

`HUGO_FILE_FILENAME`
: Hugo 会自动把项目根目录下的下列文件挂载到 `assets/_jsconfig` 之下：

- `babel.config.js`、`babel.config.mjs`、`babel.config.cjs`
- `postcss.config.js`、`postcss.config.mjs`、`postcss.config.cjs`
- `tailwind.config.js`、`tailwind.config.mjs`、`tailwind.config.cjs`

对每个文件，Hugo 会创建一个名为 `HUGO_FILE_FILENAME` 的对应环境变量，其中 `FILENAME` 是该文件名转为大写、并把句点替换为下划线后的结果。这样就能在 JavaScript 中访问这些文件，例如：

```js
let tailwindConfig = process.env.HUGO_FILE_TAILWIND_CONFIG_JS || './tailwind.config.js';
```

[Node.js]: https://nodejs.org/en
[PostCSS]: https://postcss.org/
[插件]: https://postcss.org/docs/postcss-plugins
