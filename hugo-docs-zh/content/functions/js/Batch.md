+++
title = "js.Batch"
linkTitle = "Batch"
description = "返回一个批处理器（batcher），用于构建带全局代码分割、钩子与运行器配置灵活的 JavaScript 打包组。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/js/batch/"

[params.functions_and_methods]
signatures = ["js.Batch [ID]"]
returnType = "js.Batcher"
+++

## 这一页解决什么问题

一个页面往往要挂好几段 JS，每段还可能有多个实例：同一个地图组件在页面上放三次，只有坐标不同。`js.Build` 一次只处理一个文件，做不了「按组打包 + 全局代码分割 + 把每个实例的参数交给一个 runner 统一初始化」。`js.Batch` 提供的正是这套机制：先在模板里注册「组 / 脚本 / 实例 / runner」，再统一构建；同一组的脚本会合成模块并做代码分割，runner 则拿到该组所有实例的数据。

## 什么时候用，什么时候别用

**该用**：

- 同一组件在一页出现多次、参数不同，需要统一初始化（上游的 React/Leaflet 示例就是这种场景）；
- 需要全局代码分割：多个入口共享的模块只发布一次。

**别用**：

- 只有一个 JS 入口 → 用 [`js.Build`](/functions/js/build/)，不必引入 batch 的复杂度；
- 要用 Babel 的 preset/插件链 → 用 [`js.Babel`](/functions/js/babel/)；
- 只是把 `assets/js/x.js` 原样发布 → 直接 `resources.Get` 加 `.RelPermalink`。

> [!NOTE]
> `js.Batch` 函数由 [`evanw/esbuild`][] 包提供支持，为打包、转换与压缩提供了成熟且高性能的基础。

> [!NOTE]
> 这个特性的可运行示例见[这个测试与演示仓库][js_batch_demo]。

批次 `ID` 用于创建该批次的基础目录，允许使用正斜杠。`js.Batch` 函数返回一个对象，其 API 结构如下：

- [Group](#group)
  - [Script](#script)
    - [SetOptions](#optionssetter)
  - [Instance](#instance)
    - [SetOptions](#optionssetter)
  - [Runner](#runner)
    - [SetOptions](#optionssetter)
  - [Config](#config)
    - [SetOptions](#optionssetter)

## Group

`Group` 方法接受一个 `ID`（`string`）作为参数，其中不能带斜杠。它返回一个对象，包含下列方法：

### Script

`Script` 方法接受一个 `ID`（`string`）作为参数，其中不能带斜杠。它返回一个 [OptionsSetter](#optionssetter)，可用于为该脚本设置[脚本选项](#脚本选项)。

```go-html-template
{{ with js.Batch "js/mybatch" }}
  {{ with .Group "mygroup" }}
      {{ with .Script "myscript" }}
          {{ .SetOptions (dict "resource" (resources.Get "myscript.js")) }}
      {{ end }}
  {{ end }}
{{ end }}
```

`SetOptions` 接受一个[脚本选项](#脚本选项)映射。注意如果你希望该脚本由某个 [Runner](#runner) 处理，就需要设置 `export` 选项，使其与你想要传给运行器的内容一致（默认是 `*`）。

### Instance

`Instance` 方法接受两个 `string` 参数 `SCRIPT_ID` 与 `INSTANCE_ID`，其中不能带斜杠。它返回一个 [OptionsSetter](#optionssetter)，可用于为该实例设置[参数选项](#参数选项)。

```go-html-template
{{ with js.Batch "js/mybatch" }}
  {{ with .Group "mygroup" }}
      {{ with .Instance "myscript" "myinstance" }}
          {{ .SetOptions (dict "params" (dict "param1" "value1")) }}
      {{ end }}
  {{ end }}
{{ end }}
```

`SetOptions` 接受一个[参数选项](#参数选项)映射。实例选项会以 JSON 形式传给同一组中的任何 [Runner](#runner) 脚本。

### Runner

`Runner` 方法接受一个 `ID`（`string`）作为参数，其中不能带斜杠。它返回一个 [OptionsSetter](#optionssetter)，可用于为该运行器设置[脚本选项](#脚本选项)。

```go-html-template
{{ with js.Batch "js/mybatch" }}
  {{ with .Group "mygroup" }}
      {{ with .Runner "myrunner" }}
          {{ .SetOptions (dict "resource" (resources.Get "myrunner.js")) }}
      {{ end }}
  {{ end }}
{{ end }}
```

`SetOptions` 接受一个[脚本选项](#脚本选项)映射。

运行器会收到一份数据结构，其中包含该组的全部实例，并对所定义 `export` 的 [JavaScript 导入][]保持实时绑定（live binding）。

运行器脚本的导出必须是一个函数，它接受一个参数，即该组的数据结构。一份组数据结构的 JSON 示例是：

```json
{
    "id": "leaflet",
    "scripts": [
        {
            "id": "mapjsx",
            "binding": JAVASCRIPT_BINDING,
            "instances": [
                {
                    "id": "0",
                    "params": {
                        "c": "h-64",
                        "lat": 48.8533173846729,
                        "lon": 2.3497416090232535,
                        "r": "map.jsx",
                        "title": "Cathédrale Notre-Dame de Paris",
                        "zoom": 23
                    }
                },
                {
                    "id": "1",
                    "params": {
                        "c": "h-64",
                        "lat": 59.96300872062237,
                        "lon": 10.663529183196863,
                        "r": "map.jsx",
                        "title": "Holmenkollen",
                        "zoom": 3
                    }
                }
            ]
        }
    ]
}
```

下面是一个用 React 渲染元素的运行器脚本示例。注意导出名（`default`）必须与[脚本选项](#脚本选项)中的 `export` 选项一致（`default` 是运行器脚本的默认值）。本页示例的可运行版本见这个 `js.Batch` [演示仓库][js_batch_demo]。

```js
import * as ReactDOM from 'react-dom/client';
import * as React from 'react';

export default function Run(group) {
  console.log('Running react-create-elements.js', group);
  const scripts = group.scripts;
  for (const script of scripts) {
    for (const instance of script.instances) {
      /* This is a convention in this project. */
      let elId = `${script.id}-${instance.id}`;
      let el = document.getElementById(elId);
      if (!el) {
        console.warn(`Element with id ${elId} not found`);
        continue;
      }
      const root = ReactDOM.createRoot(el);
      const reactEl = React.createElement(script.binding, instance.params);
      root.render(reactEl);
    }
  }
}
```

### Config

返回一个 [OptionsSetter](#optionssetter)，可用于为该批次设置[构建选项](#构建选项)。

这些选项与 `js.Build` 的大体相同，但要注意：

- `targetPath` 是自动设置的（可能会有多个输出）。
- `format` 必须是 `esm`，目前这是唯一支持[代码分割][code splitting]的格式。
- `params` 会在脚本中以 `@params/config` 命名空间的形式可用。这样你就可以同时导入 [Script](#script) 或 [Runner](#runner) 的参数，以及 [Config](#config) 的参数：

```js
import * as params from "@params";
import * as config from "@params/config";
```

批次的 `Config` 可以在任何模板（包括 _短代码_ 模板）中设置，但只会设置一次（先设置者生效）：

```go-html-template
{{ with js.Batch "js/mybatch" }}
  {{ with .Config }}
       {{ .SetOptions (dict
        "target" "es2023"
        "format" "esm"
        "jsx" "automatic"
        "loaders" (dict ".png" "dataurl")
        "minify" true
        "params" (dict "param1" "value1")
        )
      }}
  {{ end }}
{{ end }}
```

## 选项

### 构建选项

`format`
: (`string`) 目前 `esbuild` 只支持以 `esm` 作为[代码分割][code splitting]的输出格式。

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

### 脚本选项

`resource`
: 要构建的资源。可以是文件资源，也可以是虚拟资源。

`export`
: 运行器要绑定到的导出。设为 `*` 表示导出[整个命名空间][entire namespace]。[Runner](#runner) 脚本默认是 `default`，其他[脚本](#script)默认是 `*`。

`importContext`
: 用于解析导入的附加上下文。Hugo 总是先检查它，再回退到 `assets` 与 `node_modules`。一个常见用法是解析页面包内的导入。参见[导入上下文](#导入上下文)。

`params`
: 会以 JSON 形式传给脚本的参数映射。这些参数会绑定到 `@params` 命名空间：

  ```js
  import * as params from '@params';
  ```

### 参数选项

`params`
: 会以 JSON 形式传给脚本的参数映射。

### 导入上下文

默认情况下，Hugo 会首先尝试解析 `assets` 目录中的导入，找不到时再交给 `esbuild` 解析（例如从 `node_modules` 中解析）。`importContext` 选项可用于设置解析导入时的第一个上下文。一个常见用法是解析[页面包][page bundle]内的导入。

```go-html-template
{{ $common := resources.Match "/js/headlessui/*.*" }}
{{ $importContext := (slice $.Page ($common.Mount "/js/headlessui" ".")) }}
```

你可以传入任何实现了 [`Resource.Get`][] 的对象。传入切片即可设置多个上下文。

上例用 [`Resources.Mount`][] 把 `assets` 中的某个目录相对于页面包来解析。

### OptionsSetter

`OptionsSetter` 是一种特殊的对象，只会返回一次。也就是说，你应该用 [`with`][] 把它包起来：

```go-html-template
{{ with .Script "myscript" }}
    {{ .SetOptions (dict "resource" (resources.Get "myscript.js"))}}
{{ end }}
```

## Build

`Build` 方法返回一个具有下列结构的对象：

- Groups（map）
  - [`Resources`][]

每个 [`Resource`][] 的媒体类型要么是 `application/javascript`，要么是 `text/css`。

在模板中，你通常会处理某个给定 `ID` 的组（例如当前 section 的脚本）。由于构建是并发进行的，这需要在 [`templates.Defer`][] 块中完成：

> [!NOTE]
> [`templates.Defer`][] 充当同步点，用来处理不同模板并发添加的脚本。如果你的批次是在一个模板中一次性创建的，就不需要它。
>
> 更多信息参见[这个讨论][this discussion]。

```go-html-template
{{ $group := .group }}
{{ with (templates.Defer (dict "key" $group "data" $group )) }}
  {{ with (js.Batch "js/mybatch") }}
    {{ with .Build }}
      {{ with index .Groups $ }}
        {{ range . }}
          {{ $s := . }}
          {{ if eq $s.MediaType.SubType "css" }}
            <link href="{{ $s.RelPermalink }}" rel="stylesheet" />
          {{ else }}
            <script src="{{ $s.RelPermalink }}" type="module"></script>
          {{ end }}
        {{ end }}
      {{ end }}
  {{ end }}
{{ end }}
```

## 已知问题

在 `esbuild` [代码分割][code splitting]特性的官方文档中，页首有一段警告说明。这两个问题是：

- `esm` 是目前唯一实现的输出格式。这意味着它在旧式浏览器中无法工作。参见 [caniuse][]。
- 存在一个已知的导入顺序问题。

在对这个新特性与不同库进行的[大量测试][extensive testing]中，我们并没有把该顺序问题视为麻烦。主要有两种情况：

1. 导入的执行顺序不确定，参见[这条评论][comment-1]
1. 导入只有一种执行顺序，参见[这条评论][comment-2]

很多人会说上述两种情况都属于[代码坏味道][code smells]。第一种在 Hugo 中有个简单的变通办法：把导入顺序写在一个单独的脚本里，并确保它较早传给 `esbuild`，例如放进一个名称在字母表中靠前的脚本组。

```js
import './lib2.js';
import './lib1.js';

console.log('entrypoints-workaround.js');
```

## 完整示例：一个脚本、两个实例、一个 runner

```js {file="assets/js/card.js"}
export default function Card(params) { return params.title; }
```

```js {file="assets/js/runner.js"}
export default function Run(group) {
  console.log("group:" + group.id);
  for (const script of group.scripts) {
    for (const instance of script.instances) {
      console.log(script.id + "/" + instance.id, instance.params.title);
    }
  }
}
```

```go-html-template {file="layouts/_partials/batch.html"}
{{ with js.Batch "js/mybatch" }}
  {{ with .Group "g" }}
    {{ with .Script "card" }}{{ .SetOptions (dict "resource" (resources.Get "js/card.js")) }}{{ end }}
    {{ with .Instance "card" "0" }}{{ .SetOptions (dict "params" (dict "title" "First")) }}{{ end }}
    {{ with .Instance "card" "1" }}{{ .SetOptions (dict "params" (dict "title" "Second")) }}{{ end }}
    {{ with .Runner "run" }}{{ .SetOptions (dict "resource" (resources.Get "js/runner.js")) }}{{ end }}
  {{ end }}
{{ end }}

{{ with (js.Batch "js/mybatch") }}
  {{ with .Build }}
    {{ range $group, $resources := .Groups }}
      {{ range $resources }}
        <script src="{{ .RelPermalink }}" type="module"></script>
      {{ end }}
    {{ end }}
  {{ end }}
{{ end }}
```

在本机（Hugo 0.167.0 extended，Windows）实测：`Groups` 的键是组 ID（`g`），值是该组的资源切片；构建产出

```text
/js/mybatch/g_run_runner.js
/js/mybatch/g.js
/js/mybatch/chunk-2KN6OLE4.js
```

（最后一个是共享分块，文件名里的哈希随内容变化。）

产物 `g.js` 末尾（实测，注释里的绝对路径已省略）就是 runner 的调用现场：

```js
// ns-hugo-imp-func:__hu_v/js/g_card.js
var g_card_exports = {};
__export(g_card_exports, {
  default: () => Card
});
function Card(params) {
  return params.title;
}

// ns-hugo-imp-func:/g.js
var group = { id: "g", scripts: [] };
group.scripts.push({ "id": "card", "binding": g_card_exports, "instances": [{ "id": "0", "params": { "title": "First" } }, { "id": "1", "params": { "title": "Second" } }] });
Run(group);
```

**你应当看到什么**：runner 不需要你手动调用——产物里自动以 `group` 为参数调用它；`instances[].params` 正是模板里 `Instance` 设置的值，`binding` 指向脚本的导出（这里是 `Card`）。同一组的脚本合并在一个文件里，共享模块被拆成 chunk。

`Config` 里的 `params` 通过 `@params/config` 命名空间提供给脚本（实测：脚本里 `console.log(config.color)` 被注入为字面量）：

```go-html-template
{{ with .Config }}{{ .SetOptions (dict "format" "esm" "params" (dict "color" "red")) }}{{ end }}
```

```js
// ns-hugo-params:@params/config
var color = "red";
```

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 一个组、一个脚本 | `Groups` 键为组 ID，产出 `/js/mybatch/g1.js` | 否 |
| 脚本 + runner | 同组产出 runner 与脚本两个文件，并生成共享 chunk（实测三个文件） | 否 |
| `Config` 的 `params` | 脚本里可用 `@params/config` 读到注入值 | 否 |
| 不传 ID `{{ js.Batch }}` | —— | 是：`wrong number of args for Batch: want 1 got 0`（签名写作 `[ID]`，但**实测必填**） |
| `Group`/`Script`/`Runner` 的 ID 含 `/` | —— | 是：`error calling Group: id must not contain forward slashes` |
| 脚本没设 `resource` | —— | 是：`error calling SetOptions: resource not set` |
| `Config` 设 `"format" "iife"` | —— | 是：`error calling Build: failed to build JS batch "b": only esm format is currently supported` |
| 对同一个 `OptionsSetter` 连续调用两次 `SetOptions` | 不报错（**实测**）；上游仍建议用 `with` 包裹，因为 setter 只在首次取得 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面里看不到任何脚本效果 | 只注册了批次，没有把 `.Build` 的 `Groups` 输出成 `<script>` | 按本页示例遍历 `.Groups` 输出资源；并发场景用 [`templates.Defer`](/functions/templates/defer/) 包住 |
| 没报错但结果不对 | runner 没被调用 | runner 的导出名与 `export` 选项不匹配（runner 默认 `default`） | runner 用 `export default function Run(group) {…}`，或显式设置 `export` |
| 没报错但结果不对 | 实例参数读不到 | `.Instance` 的第一个参数不是脚本 `ID` | 写成 `.Instance "脚本ID" "实例ID"` |
| 报错看不懂 | `only esm format is currently supported` | `Config` 里把 `format` 设成了非 `esm` | 保持 `esm`（代码分割只支持这一种输出格式） |
| 报错看不懂 | `id must not contain forward slashes` | 组 / 脚本 / runner 的 ID 里带了 `/` | ID 只用普通标识符；目录层级由 `js.Batch` 的批次 ID 提供 |
| 报错看不懂 | `resource not set` | `SetOptions` 的 dict 里漏了 `resource` | 补上 `"resource" (resources.Get "js/xxx.js")` |

更多排查入口见[故障排查](/troubleshooting/)。

[JavaScript 导入]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import
[`Resource.Get`]: /methods/page/resources/#get
[`Resource`]: /methods/resource/
[`Resources.Mount`]: /methods/page/resources/#mount
[`Resources`]: /methods/page/resources/
[`evanw/esbuild`]: https://github.com/evanw/esbuild
[`templates.Defer`]: /functions/templates/defer/
[`with`]: /functions/go-template/with/
[caniuse]: https://caniuse.com/?search=ESM
[code smells]: https://en.wikipedia.org/wiki/Code_smell
[code splitting]: https://esbuild.github.io/api/#splitting
[comment-1]: https://github.com/evanw/esbuild/issues/399#issuecomment-1458680887
[comment-2]: https://github.com/evanw/esbuild/issues/399#issuecomment-735355932
[entire namespace]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#namespace_import
[extensive testing]: https://github.com/bep/hugojsbatchdemo
[js_batch_demo]: https://github.com/bep/hugojsbatchdemo/
[page bundle]: /content-management/page-bundles/
[this discussion]: https://discourse.gohugo.io/t/js-batch-with-simple-global-script/53002/5
