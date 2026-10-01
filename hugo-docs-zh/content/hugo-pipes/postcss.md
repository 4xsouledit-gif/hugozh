+++
title = "PostCSS"
linkTitle = "PostCSS"
description = "用 css.PostCSS 配合 PostCSS 插件处理 CSS 资源。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/hugo-pipes/postcss/"
+++

## 适用前提

用 `css.PostCSS` 函数配合 PostCSS 及其任意插件来转换 CSS。PostCSS 运行在 Node.js 之上，因此本机需要安装 Node.js；此外，处理过程会在项目根目录执行 `postcss` 命令，该命令必须已经在项目里安装好。

## 安装依赖

在项目根目录安装所需的 Node 包。例如安装 PostCSS 本身、它的命令行接口，以及自动为 CSS 添加厂商前缀的插件：

```bash
npm install --save-dev postcss postcss-cli autoprefixer
```

这些依赖写在项目根目录的 `package.json` 中，构建前需要先安装它们。

## 配置文件

在项目根目录创建 PostCSS 配置文件。若配置文件不放在项目根目录，而放在自定义子目录里，可用 `config` 选项指定该目录的路径。

Hugo 会向 PostCSS 进程暴露若干环境变量，其中包括当前的 Hugo 环境名，因此配置文件可以据此区分开发与生产：

```js
import autoprefixer from 'autoprefixer';

const isDev = process.env.HUGO_ENVIRONMENT === 'development';

export default {
  plugins: [
    !isDev ? autoprefixer : null
  ],
  map: isDev ? { inline: true } : false
};
```

上例中，运行 `hugo server` 时不加厂商前缀，但启用内联 source map；生产构建时则添加前缀并关闭 source map。

## 取得资源与管道

把 CSS 文件放进 `assets/css` 目录，然后取出资源并送入管道：

```go-html-template
{{ with resources.Get "css/main.css" }}
  {{ $opts := dict "inlineImports" true }}
  {{ with . | css.PostCSS $opts }}
    {{ with . | minify | fingerprint }}
      <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
    {{ end }}
  {{ end }}
{{ end }}
```

## 配置选项

使用配置文件时，可用下列选项：

- `config`：存放 PostCSS 配置文件的目录路径。默认情况下，Hugo 会在项目根目录以及各个模块中按 `postcss.config.js`、`postcss.config.mjs`、`postcss.config.cjs` 的顺序查找；只有当配置文件位于自定义子目录时才需要使用该选项。
- `inlineImports`：是否内联 `@import` 语句，默认 `false`。内联是递归的，但同一个文件只导入一次；Hugo 按模块挂载解析相对导入，并尊重主题覆盖。注意 Hugo 内部的导入例程并不严格遵循 CSS 规范，`@import` 可以写在文件任意位置，但外部 URL 导入与带媒体查询的导入会在内联时被忽略。
- `skipInlineImportsNotFound`：是否在存在无法解析的导入语句时仍然继续构建，并保留原有导入声明，默认 `false`。

不借助配置文件、直接在选项映射中配置 PostCSS 时，可用 `noMap`（是否关闭默认的内联 source map，默认 `false`）、`parser`、`stringifier`、`syntax`，以及 `use`（以空格分隔的插件列表）：

```go-html-template
{{ with resources.Get "css/main.css" }}
  {{ $opts := dict "noMap" true "use" "autoprefixer postcss-color-alpha" }}
  {{ with . | css.PostCSS $opts }}
    <link rel="stylesheet" href="{{ .RelPermalink }}">
  {{ end }}
{{ end }}
```

## 环境变量

Hugo 会向 PostCSS 进程传入下列环境变量：`PWD` 是项目工作目录的绝对路径；`HUGO_ENVIRONMENT` 是当前 Hugo 环境，由 `--environment` 命令行标志设置，`hugo build` 默认是 `production`，`hugo server` 默认是 `development`；`HUGO_PUBLISHDIR` 是发布目录的绝对路径，通常是 `public`，即便使用 `--renderToMemory` 渲染到内存，该值仍指向磁盘上的目录。

此外，Hugo 会把项目根目录下的 `babel.config.js`、`postcss.config.js`、`tailwind.config.js` 等配置文件（含 `.mjs` 与 `.cjs` 变体）自动挂载到 `assets/_jsconfig`，并为每个文件生成一个以 `HUGO_FILE_` 开头、把文件名转为大写并把点替换为下划线的环境变量。在 JavaScript 中即可这样引用：

```js
let tailwindConfig = process.env.HUGO_FILE_TAILWIND_CONFIG_JS || './tailwind.config.js';
```

## 缓存与并发

PostCSS 的调用按整条管道链缓存，同一次构建中只执行一次，随后重复调用直接取用缓存结果。若希望配置文件或统计文件变化时让相关资源缓存立即失效，可在 `[build]` 分类下配置 `cachebusters`，用 `source` 与 `target` 两个正则分别匹配源文件与需要过期的缓存键。

## 发布与指纹

调用 `.RelPermalink` 或 `.Permalink` 即可发布处理后的 CSS；生产环境通常再串上 `resources.Minify` 与 `resources.Fingerprint`，配合 `.Data.Integrity` 使用带哈希的文件名。
