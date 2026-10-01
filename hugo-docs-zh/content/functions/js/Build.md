+++
title = "js.Build"
linkTitle = "Build"
description = "返回把给定 JavaScript 资源打包、转译、摇树并压缩后生成的资源。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/functions/js/build/"

[params.functions_and_methods]
signatures = ["js.Build [OPTIONS] RESOURCE"]
returnType = "resource.Resource"
+++

> [!NOTE]
> `js.Build` 函数由 [`evanw/esbuild`][] 包提供支持，为打包、转换与压缩提供了成熟且高性能的基础。

用 `js.Build` 函数可以：

- 打包（bundle）
- 转译（TypeScript 与 JSX）
- 摇树（tree shake）
- 压缩（minify）
- 生成 source map

```go-html-template
{{ with resources.Get "js/main.js" }}
  {{$opts := dict
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

## 选项

`js.Build` 函数接受一个选项映射。

`format`
: (`string`) 输出格式，取 `iife`、`cjs`、`esm` 之一。默认是 `iife`，即自执行函数，适合直接以 `<script>` 标签引入。

`importContext`
: **（0.165.0 新增）**
: (`resource.ResourceGetter`) 解析 import 语句时使用的资源获取器（resource getter）。Hugo 先按语句中书写的路径在这个上下文中查找，找不到再回退到文件系统。

`targetPath`
: (`string`) 不设置时以源文件路径作为目标路径的基准。注意目标 MIME 类型不同时（例如源文件是 TypeScript），目标路径的扩展名可能随之改变。

`defines`
: (`map`) 这个选项让你定义一组在构建时执行的字符串替换。它必须是一个映射，其中每个键都会被它的值替换。

  ```go-html-template
  {{ $defines := dict "process.env.NODE_ENV" `"development"` }}
  ```

`drop`
: **（0.144.0 新增）**
: (`string`) 在构建前改写源码，丢弃特定构造：取 `debugger` 或 `console` 之一。
: 参见 <https://esbuild.github.io/api/#drop>

`externals`
: (`slice`) 外部依赖。可以用它裁掉确定不会执行到的依赖。参见 <https://esbuild.github.io/api/#external>。

`inject`
: (`slice`) 这个选项让你把某个全局变量自动替换为另一个文件中的导入。其中的路径必须相对于 `assets`。参见 <https://esbuild.github.io/api/#inject>。

`JSX`
: (`string`) 如何处理与转换 JSX 语法，取 `transform`、`preserve`、`automatic` 之一。默认是 `transform`。其中 `automatic` 转换由 React 17+ 引入，会自动导入所需的 JSX 辅助函数。参见 <https://esbuild.github.io/api/#jsx>。

`JSXImportSource`
: (`string`) 从哪个库自动导入 JSX 辅助函数，仅在 `JSX` 为 `automatic` 时有效。指定的库需要通过 npm 安装，并暴露相应的导出。参见 <https://esbuild.github.io/api/#jsx-import-source>。

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

`loaders`
: **（0.140.0 新增）**
: (`map`) 为给定文件类型配置加载器后，就可以用 `import` 语句或 `require` 调用加载该类型文件。例如把 `.png` 扩展名配置为 data URL 加载器，导入 `.png` 文件就会得到包含该图片内容的数据 URL。可用的加载器有 `none`、`base64`、`binary`、`copy`、`css`、`dataurl`、`default`、`empty`、`file`、`global-css`、`js`、`json`、`jsx`、`local-css`、`text`、`ts`、`tsx`。参见 <https://esbuild.github.io/api/#loader>。

`minify`
: (`bool`) 是否压缩生成的 JS 代码。默认是 `false`。

`params`
: (`map` 或 `slice`) 可以在 JS 文件中以 JSON 形式导入的参数，例如：

  ```go-html-template
  {{ $js := resources.Get "js/main.js" | js.Build (dict "params" (dict "api" "https://example.org/api")) }}
  ```

  然后在 JS 文件中：

  ```js
  import * as params from '@params';
  ```

  注意它适合配置项之类的小数据；数据较大时，应把文件放入或挂载到 `assets` 中直接导入。

`platform`
: **（0.140.0 新增）**
: (`string`) 取 `browser`、`node`、`neutral` 之一。默认是 `browser`。参见 <https://esbuild.github.io/api/#platform>。

`shims`
: (`map`) 这个选项让你把某个组件替换为另一个。常见用法是生产环境通过 shim 从 CDN 加载 React 这类依赖，而开发环境仍使用打包进来的完整 `node_modules` 依赖：

  ```go-html-template
  {{ $shims := dict "react" "js/shims/react.js"  "react-dom" "js/shims/react-dom.js" }}
  {{ $js = $js | js.Build dict "shims" $shims }}
  ```

  _shim_ 文件的内容可能形如：

  ```js
  // js/shims/react.js
  module.exports = window.React;
  ```

  ```js
  // js/shims/react-dom.js
  module.exports = window.ReactDOM;
  ```

  这样配置之后，下面这些导入在两种场景下都能正常工作：

  ```js
  import * as React from 'react';
  import * as ReactDOM from 'react-dom/client';
  ```

`sourceMap`
: (`string`) 要生成的 source map 类型，取 `external`、`inline`、`linked`、`none` 之一。默认是 `none`。`linked` 与 `external` 的 source map 会写到目标路径，文件名为输出文件名加 ".map"；取 `linked` 时还会在输出文件中写入 `sourceMappingURL`。

`sourcesContent`
: **（0.140.0 新增）**
: (`bool`) 是否在 source map 中包含源文件的内容。默认是 `true`。

`target`
: (`string`) 语言目标，取 `es5`、`es2015`、`es2016`、`es2017`、`es2018`、`es2019`、`es2020`、`es2021`、`es2022`、`es2023`、`es2024`、`es2025`、`esnext` 之一。默认是 `esnext`。

## 从 assets 目录导入

`js.Build` 完整支持 Hugo 的统一文件系统（unified file system）。在[测试项目][test project]中可以看到一些简单示例；简而言之，下面的写法是可行的：

```js
import { hello } from 'my/module';
```

它会解析到分层文件系统中 `assets/my/module` 里最靠上的 `index.{js,ts,tsx,jsx}`。

```js
import { hello3 } from 'my/module/hello3';
```

会解析到 `assets/my/module` 中的 `hello3.{js,ts,tsx,jsx}`。

以 `.` 开头的导入相对当前文件解析：

```js
import { hello4 } from './lib';
```

其他类型的文件（如 `JSON`、`CSS`）需要写出包含扩展名的相对路径，例如：

```js
import * as data from 'my/module/data.json';
```

凡是不在 `assets` 目录内的导入，或者无法解析到 `assets` 内某个组件的导入，都会交给 [`esbuild`][] 处理，并以**项目目录**作为解析起点，也就是说，查找 `node_modules` 之类的目录时都从项目根目录开始。另见 [`hugo mod npm pack`][]。如果项目引用了 npm 依赖，必须先运行 `npm install` 再执行 `hugo build`。

还要注意新增的 `params` 选项，它可以把数据从模板传给 JS 文件，例如：

```go-html-template
{{ $js := resources.Get "js/main.js" | js.Build (dict "params" (dict "api" "https://example.org/api")) }}
```

然后在 JS 文件中：

```js
import * as params from '@params';
```

Hugo 默认会生成一份 `assets/jsconfig.json` 文件，用于映射这些导入。它方便在代码编辑器中跳转与获得智能提示；若不需要，可以[关闭它][turn it off]。

## Node.js 依赖

用 `js.Build` 函数引入 Node 依赖。

凡是不在 `assets` 目录内的导入，或者无法解析到 `assets` 内某个组件的导入，都会交给 [`esbuild`][] 处理，并以**项目目录**作为解析起点，也就是说，查找 `node_modules` 之类的目录时都从项目根目录开始。另见 [`hugo mod npm pack`][]。如果项目引用了 npm 依赖，必须先运行 `npm install` 再执行 `hugo build`。

解析 npm 包（即位于 `node_modules` 目录中的包）的起始目录始终是主项目目录。

> [!NOTE]
> 如果你正在开发一个需要被导入、且依赖自身 `package.json` 中那些依赖的主题或组件，建议了解 [`hugo mod npm pack`][]：它能汇总一个项目中的全部 npm 依赖。

## 构建产物

**（0.165.0 新增）**

除主输出之外，Hugo 还可能作为构建的一部分发布其他文件：

- 由 esbuild 的 `file` 加载器复制到输出目录的文件，例如字体与图片
- `sourceMap` 选项取 `external` 或 `linked` 时生成的 source map

返回资源上的 `Data` 方法把这些文件以产物切片的形式暴露出来，每一项都提供 `MediaType`、`Permalink` 与 `RelPermalink` 方法。

例如，为构建过程发布的图片文件渲染预加载链接：

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

## 示例

```go-html-template
{{ $built := resources.Get "js/index.js" | js.Build "main.js" }}
```

或者带选项：

```go-html-template
{{ $externals := slice "react" "react-dom" }}
{{ $defines := dict "process.env.NODE_ENV" `"development"` }}

{{ $opts := dict "targetPath" "main.js" "externals" $externals "defines" $defines }}
{{ $built := resources.Get "scripts/main.js" | js.Build $opts }}
<script src="{{ $built.RelPermalink }}" defer></script>
```

[`esbuild`]: https://esbuild.github.io/
[`evanw/esbuild`]: https://github.com/evanw/esbuild
[`hugo mod npm pack`]: /commands/hugo-mod-npm-pack/
[test project]: https://github.com/gohugoio/hugoTestProjectJSModImports
[turn it off]: /configuration/build/#nojsconfiginassets
