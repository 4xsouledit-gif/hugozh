+++
title = "JavaScript 构建"
linkTitle = "JavaScript 构建"
description = "用 js.Build 打包、转译、摇树与压缩 JavaScript 资源。含 npm 依赖安装、完整可运行示例与常见报错。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/hugo-pipes/js/"

[params.teach]
difficulty = "进阶"
time = "25–35 分钟"
prereq = [
  "会写基本的 JavaScript 模块（`import` / `export`）",
  "项目根目录下已建好 `assets/` 目录；若代码要 `import` npm 包，还需要 Node.js",
  "读过[简介](/hugo-pipes/introduction/)，理解「取资源 → 进管道 → 发布」这条链路",
]
outcomes = [
  "用 `js.Build` 把带 `import` 的多个 JS 文件打包成浏览器可直接加载的单个脚本",
  "让开发环境带 source map、生产环境压缩并加指纹，两条路径由 `hugo.IsDevelopment` 控制",
  "在 `Could not resolve` 一类报错出现时，判断是路径写错还是依赖没装",
]
next = ["/hugo-pipes/minification/", "/hugo-pipes/fingerprint/", "/functions/js/build/"]

+++

## 这一页解决什么问题

浏览器原生支持 `import`，但直接发布多文件模块会带来两个实际问题：请求数变多，以及老浏览器不认新语法。`js.Build` 用 esbuild 把模块**打包成一个文件**，顺带完成转译、摇树与压缩，并可按环境决定是否生成 source map。

和 [PostCSS](/hugo-pipes/postcss/) 不同，**esbuild 内嵌在 Hugo 里**：只要不导入 npm 包，这一节不需要 Node.js。

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

**这段模板在做什么**：开发时保留可读代码与 source map，方便在浏览器里断点调试；生产时压缩并加指纹，得到可长期缓存的 `main.<哈希>.js` 与 `integrity` 校验值。`cond` 是 Go 模板的三元表达式，`cond 条件 A B` 在条件为真时取 `A`。

## 完整可运行示例

这个示例打包两个互相 `import` 的文件，演示「多文件进、单文件出」。

**① 建项目并进入目录**：

```bash
hugo new project js-demo
cd js-demo
```

**② 新建被导入的模块** `assets/js/lib/greet.js`：

```js
export function greet(name) {
  return `你好，${name}！`;
}
```

**③ 新建入口文件** `assets/js/main.js`：

```js
import { greet } from './lib/greet.js';

document.addEventListener('DOMContentLoaded', () => {
  const el = document.getElementById('app');
  if (el) el.textContent = greet('世界');
});
```

**④ 新建首页模板** `layouts/home.html`：

```go-html-template {file="layouts/home.html"}
<!doctype html>
<html lang="zh-cn">
  <head>
    <meta charset="utf-8">
    <title>js.Build 演示</title>
  </head>
  <body>
    <h1>JS 打包演示</h1>
    <p id="app">（如果这行没被替换，说明脚本没跑起来）</p>
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
  </body>
</html>
```

**⑤ 看开发环境**：

```bash
hugo server
```

**⑥ 看生产环境**（`Ctrl + C` 停掉服务器后执行）：

```bash
hugo
```

### 你应当看到什么

开发环境（`hugo server`）：

- 页面上「（如果这行没被替换…）」被换成 **你好，世界！** —— 这证明打包后的脚本真的执行了；
- 查看网页源代码，`<script src="/js/main.js">`，路径里**没有**哈希；
- 项目里出现 source map：资源 `main.js` 的末尾有 `//# sourceMappingURL=main.js.map`，开发环境会一并提供该文件；
- 打开 `/js/main.js`，能看到两个源文件的内容被合并在一起，`import` 语句已经消失——这就是「打包」。

生产环境（`hugo`）：

- `public/js/main.<哈希>.js` 存在，且`<script>` 标签带 `integrity="sha256-…"` 与 `crossorigin="anonymous"`；
- 该文件是压缩过的（换行极少、变量名被缩短）；
- 目录里**没有** `main.js.map`（因为 `sourceMap` 设为 `none`）。

**如果页面文字没有被替换**，说明脚本报错了。打开浏览器开发者工具的 Console，`Could not resolve` 一类消息会在那里出现——构建阶段 Hugo 也会先报一次错。

## 安装 Node.js 依赖

凡是不在 `assets` 目录内的导入，或者无法解析到 `assets` 内某个组件的导入，都会交给 `esbuild` 处理，并以**项目目录**作为解析起点，也就是说，查找 `node_modules` 之类的目录时都从项目根目录开始。因此，如果项目引用了 npm 依赖，必须先运行 `npm install` 再执行构建；若正在开发一个需要被导入、且依赖自身 `package.json` 中那些依赖的主题或组件，可用 `hugo mod npm pack` 把项目中的 npm 依赖汇总起来。

```bash
npm install
```

**为什么顺序不能反**：`js.Build` 在构建期解析导入路径。`node_modules/` 不存在时，esbuild 无法解析 `import ... from 'some-package'`，Hugo 会直接以 `Could not resolve "some-package"` 结束构建——而不是等到运行时才失败。

### 你应当看到什么

- 终端出现 `added N packages` 且无 `npm ERR!`；
- 项目根目录有 `node_modules/`；
- 再次执行 `hugo`，之前 `Could not resolve` 的那一条消失。

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

> [!NOTE]
> `defines` 的值是**替换后的源码文本**，所以字符串要连引号一起写。上例用了反引号包裹的 Go 原始字符串 `` `"development"` ``，替换进代码后正好是带引号的 JS 字符串字面量。写成 `"development"`（不带内层引号）会生成非法的 JS。

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

**为什么 `@params` 有用**：配置值（API 地址、站点语言、构建时间戳）在模板里是现成的，在 JS 里却拿不到。用 `params` 传过去，就不必再手写一份 `config.js`——**也就不会出现两份配置不一致的问题**。

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

**别忘了真正引用它**：把结果赋值给 `$js` 却不输出 `<script>`，构建同样成功，但 `public/` 里不会出现这个文件。

## 什么时候用 / 什么时候别用

**该用的时候**

- 代码有多个模块，需要**合并成一个文件**交付；
- 使用 TypeScript 或 JSX，需要**转译**；
- 想用 `defines` 在构建期替换常量（例如把 `process.env.NODE_ENV` 定死，让摇树能删掉开发分支）；
- 需要按环境分别输出「带 source map 的开发版」与「压缩加哈希的生产版」。

**别用的时候**

- 只有一小段不需要模块化的脚本：直接放 `static/js/` 用 `<script>` 引入，或放进 `assets/` 后只做 `minify` / `fingerprint`；
- 需要**代码分割（code splitting）与动态 chunk**：`js.Build` 面向单文件产物，复杂应用应交给 Vite / Webpack 之类工具，把产物放进 `assets/` 让 Hugo 加指纹即可；
- 需要 Babel 特有的插件链：Hugo 另提供 [js.Babel](/functions/js/babel/)，但更复杂的转换同样建议交给专职构建工具；
- 只是想**压缩**一份已经写好的 JS：用 `resources.Minify` 更直接。

## 常见坑

**① 命令找不到（命令类）**

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `hugo: command not found` | Hugo 没装或没进 `PATH` | [安装 Hugo](/installation/) |
| `npm: command not found` | 代码里 `import` 了 npm 包，但本机没有 Node.js | 安装 Node.js；若完全不想用 npm，就把依赖改成放 `assets/` 的本地文件 |
| `exec: "babel": executable file not found` | 用了 `js.Babel` 却没装 `@babel/cli` | 见 [js.Babel](/functions/js/babel/) |

**② 没报错但结果不对（静默失败类）**

| 现象 | 原因 | 怎么确认 |
| --- | --- | --- |
| 构建成功，但页面没有 `<script>` | `resources.Get` 拿到 `nil`，`with` 把整段跳过 | 检查路径是否相对 `assets/`（写 `assets/js/main.js` 就错了） |
| `public/` 里没有构建结果 | 结果从没被 `.RelPermalink` / `.Permalink` / `.Publish` 引用 | 看模板里是否输出了 `<script>` 标签 |
| 文件名不是预期路径 | 没设 `targetPath`，Hugo 按源文件路径推导 | 显式写 `"targetPath" "js/main.js"` |
| 生产环境仍有 `console.log` | `drop` 未设置（默认不丢弃任何构造，且它是字符串而非切片） | 加 `"drop" "console"` |
| 改了源码但浏览器行为没变 | 缓存：管道链缓存或浏览器缓存 | `hugo --ignoreCache`，浏览器强制刷新（`Ctrl + F5`） |

**③ 报错看不懂（报错类）**

- `Could not resolve "./lib/greet.js"`：esbuild 找不到被导入的文件。先看**相对路径是相对于当前文件**，再确认扩展名与文件名大小写（Windows 上大小写不敏感，Linux/CI 上敏感，这是「本机好的、CI 挂了」的经典原因）；
- `Could not resolve "some-package"`：npm 依赖没装，先在项目根目录执行 `npm install`；
- 报错里带 `file:line:column` 与一个 `^` 插入符：esbuild 直接指出了源码位置，从插入符开始往下读原始报错，通常一句话就说清了；
- 页面渲染出来了但脚本没跑、构建却没问题：问题在**运行时**，看浏览器 Console；服务端渲染无关，`js.Build` 只负责产出文件；
- 报错指向的文件与 JS 无关：渲染期问题也会这样冒出来，见[故障排查](/troubleshooting/)。

排查顺序：**资源路径对不对 → 被打包的文件能不能解析全部 import → npm 依赖装没装 → 运行时 Console 报什么**。

## 相关页面

- [js.Build](/functions/js/build/)（完整选项参考）
- [js.Babel](/functions/js/babel/) / [js.Batch](/functions/js/batch/)
- [资源压缩](/hugo-pipes/minification/) / [资源指纹](/hugo-pipes/fingerprint/)
- [PostCSS](/hugo-pipes/postcss/)
- [故障排查](/troubleshooting/)
