+++
title = "JavaScript 构建"
linkTitle = "JavaScript 构建"
description = "用 js.Build 打包、转译、摇树与压缩 JavaScript 资源。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/hugo-pipes/js/"
+++

> [!NOTE]
> `js.Build` 以 [`evanw/esbuild`](https://github.com/evanw/esbuild) 为基础，在打包、转译与压缩方面性能高、成熟度好。

用 `js.Build` 可以：

- 打包（bundle）
- 转译（TypeScript 与 JSX）
- 摇树（tree shake，移除无用代码）
- 压缩（minify）
- 生成 source map

```go-html-template
{{ with resources.Get "js/main.js" }}
  {{ $opts := dict
    "minify" (cond hugo.IsDevelopment false true)
    "sourceMap" (cond hugo.IsDevelopment "linked" "none")
  }}
  {{ with . | js.Build $opts }}
    {{ if hugo.IsDevelopment }}
      <script src="{{ .RelPermalink }}"></script>
    {{ else }}
      {{ with . | fingerprint }}
        <script src="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous"></script>
      {{ end }}
    {{ end }}
  {{ end }}
{{ end }}
```

## 安装 Node.js 依赖

凡是不在 `assets` 目录内的导入，或者无法解析到 `assets` 内某个组件的导入，都会交给 `esbuild` 处理，并以**项目目录**作为解析起点，也就是说，查找 `node_modules` 之类的目录时都从项目根目录开始。因此，如果项目引用了 npm 依赖，必须先运行 `npm install` 再执行构建；若正在开发一个需要被导入、且依赖自身 `package.json` 中那些依赖的主题或组件，可用 `hugo mod npm pack` 把项目中的 npm 依赖汇总起来。

```bash
npm install
```

## 配置选项

`js.Build` 接受一个选项映射，键名与取值如下。

- `format`：输出格式，取 `iife`、`cjs`、`esm` 之一，默认 `iife`，即自执行函数，便于直接以 script 标签引入。
- `importContext`：（自 v0.165.0 起）解析 import 语句时使用的资源获取上下文（resource getter）。Hugo 先按语句中书写的路径在这个上下文中查找，找不到再回退到文件系统。
- `targetPath`：不设置时以源文件路径作为目标路径的基准。注意目标 MIME 类型不同时（例如源文件是 TypeScript），目标路径的扩展名可能随之改变。
- `defines`：一个映射，用于在构建时做字符串替换，每个键会被它的值替换。
- `drop`：（自 v0.144.0 起）在构建前改写源码，丢弃特定构造，取 `debugger` 或 `console` 之一。参见 <https://esbuild.github.io/api/#drop>。
- `externals`：外部依赖切片。可以用它裁掉确定不会执行到的依赖。参见 <https://esbuild.github.io/api/#external>。
- `inject`：切片，用于把某个全局变量自动替换为另一个文件中的导入。其中的路径必须相对于 `assets`。参见 <https://esbuild.github.io/api/#inject>。
- `JSX`：如何处理与转换 JSX 语法，取 `transform`、`preserve`、`automatic` 之一，默认 `transform`。其中 `automatic` 转换由 React 17+ 引入，会自动导入所需的 JSX 辅助函数。参见 <https://esbuild.github.io/api/#jsx>。
- `JSXImportSource`：从哪个库自动导入 JSX 辅助函数，仅在 `JSX` 为 `automatic` 时有效。指定的库需要通过 npm 安装，并暴露相应的导出。参见 <https://esbuild.github.io/api/#jsx-import-source>。
- `loaders`：（自 v0.140.0 起）为给定文件类型配置加载器后，就可以用 `import` 语句或 `require` 调用加载该类型文件。例如把 `.png` 扩展名配置为 data URL 加载器，导入 `.png` 文件就会得到包含该图片内容的数据 URL。可用的加载器有 `none`、`base64`、`binary`、`copy`、`css`、`dataurl`、`default`、`empty`、`file`、`global-css`、`js`、`json`、`jsx`、`local-css`、`text`、`ts`、`tsx`。参见 <https://esbuild.github.io/api/#loader>。
- `minify`：是否压缩生成的 JavaScript 代码，默认 `false`。
- `params`：可以在 JavaScript 文件中以 JSON 形式导入的参数，类型为映射或切片。注意它适合配置项之类的小数据；数据较大时，应把文件放入或挂载到 `assets` 中直接导入。
- `platform`：（自 v0.140.0 起）取 `browser`、`node`、`neutral` 之一，默认 `browser`。参见 <https://esbuild.github.io/api/#platform>。
- `shims`：映射，用于把某个组件替换为另一个。常见用法是生产环境通过 shim 从 CDN 加载 React 这类依赖，而开发环境仍使用打包进来的完整 `node_modules` 依赖。
- `sourceMap`：要生成的 source map 类型，取 `external`、`inline`、`linked`、`none` 之一，默认 `none`。`linked` 与 `external` 的 source map 会写到目标路径，文件名为输出文件名加 `.map`；取 `linked` 时还会在输出文件中写入 `sourceMappingURL`。
- `sourcesContent`：（自 v0.140.0 起）是否在 source map 中包含源文件的内容，默认 `true`。
- `target`：语言目标，取 `es5`、`es2015`、`es2016`、`es2017`、`es2018`、`es2019`、`es2020`、`es2021`、`es2022`、`es2023`、`es2024`、`es2025` 或 `esnext` 之一，默认 `esnext`。

`JSX` 与 `JSXImportSource` 搭配使用，可以在 Preact 这类非 React 的 JSX 库中省去手工导入：

```go-html-template
{{ $js := resources.Get "js/main.jsx" | js.Build (dict "JSX" "automatic" "JSXImportSource" "preact") }}
```

上面的配置下，使用 Preact 组件与 JSX 时不必每次都导入 `h` 与 `Fragment`：

```jsx
import { render } from 'preact';

const App = () => <>Hello world!</>;

const container = document.getElementById('app');
if (container) render(<App />, container);
```

`shims` 的典型用法如下，对应的 shim 文件内容形如 `module.exports = window.React;`：

```go-html-template
{{ $shims := dict "react" "js/shims/react.js"  "react-dom" "js/shims/react-dom.js" }}
{{ $js = $js | js.Build (dict "shims" $shims) }}
```

下面这个例子把 `react` 与 `react-dom` 排除在打包之外，并替换 `process.env.NODE_ENV`：

```go-html-template
{{ $externals := slice "react" "react-dom" }}
{{ $defines := dict "process.env.NODE_ENV" `"development"` }}

{{ $opts := dict "targetPath" "main.js" "externals" $externals "defines" $defines }}
{{ $built := resources.Get "scripts/main.js" | js.Build $opts }}
<script src="{{ $built.RelPermalink }}" defer></script>
```

## 从 assets 目录导入

`js.Build` 完整支持 Hugo 的统一文件系统。简而言之，下面的写法会解析到分层文件系统中 `assets/my/module` 里最靠上的 `index.{js,ts,tsx,jsx}`：

```js
import { hello } from 'my/module';
```

以 `.` 开头的导入相对当前文件解析；其他类型的文件（如 JSON、CSS）需要写出包含扩展名的相对路径：

```js
import { hello3 } from 'my/module/hello3';
import { hello4 } from './lib';
import * as data from 'my/module/data.json';
```

用 `params` 选项可以在模板与 JavaScript 之间传递数据：

```go-html-template
{{ $js := resources.Get "js/main.js" | js.Build (dict "params" (dict "api" "https://example.org/api")) }}
```

在 JavaScript 文件中以 `@params` 这个特殊模块接收：

```js
import * as params from '@params';
```

另外，Hugo 默认会生成一份 `assets/jsconfig.json`，用于映射这些导入路径，方便在代码编辑器中跳转与获得智能提示；若不需要，可通过 `[build]` 分类下的 `noJSConfigInAssets` 关闭。

## 构建产物

自 v0.165.0 起，除主输出之外，Hugo 还可能发布其他文件：

- 由 esbuild 的 `file` 加载器复制到输出目录的文件，例如字体与图片
- `sourceMap` 选项取 `external` 或 `linked` 时生成的 source map

返回资源上的 `.Data.Artifacts` 以切片形式暴露这些产物，每一项都提供 `MediaType`、`Permalink` 与 `RelPermalink`。例如，为构建过程发布的图片文件渲染预加载链接：

```go-html-template
{{ with resources.Get "js/main.js" }}
  {{ with . | js.Build }}
    {{ range .Data.Artifacts }}
      {{ if eq .MediaType.MainType "image" }}
        <link rel="preload" href="{{ .RelPermalink }}" as="image" type="{{ .MediaType.Type }}">
      {{ end }}
    {{ end }}
    <script src="{{ .RelPermalink }}"></script>
  {{ end }}
{{ end }}
```

## 发布与指纹

调用 `.RelPermalink` 或 `.Permalink` 会把构建结果发布到 `publishDir`。生产环境通常再串上 `resources.Fingerprint`，用带哈希的文件名与 `.Data.Integrity` 获得更好的缓存效果与完整性校验，参见[资源指纹](/hugo-pipes/fingerprint/)。
