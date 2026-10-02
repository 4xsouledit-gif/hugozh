+++
title = "js.Babel"
linkTitle = "Babel"
description = "返回用 Babel 转译给定 JavaScript 资源后生成的资源。"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/js/babel/"

[params.functions_and_methods]
signatures = ["js.Babel [OPTIONS] RESOURCE"]
returnType = "resource.Resource"
aliases = ["babel"]
+++

`js.Babel` 函数使用 [Babel][] 转换 JavaScript。

## 这一页解决什么问题

Babel 是 JavaScript 转译器，能力来自 preset 与插件：`@babel/preset-env` 能按目标浏览器把现代语法（可选链 `?.`、空值合并 `??` 等）降级成老浏览器能跑的写法。`js.Babel` 把 `assets/` 里的 JS 交给**你项目里安装的 Babel CLI** 及其配置处理，返回处理后的资源。它和 [`css.PostCSS`](/functions/css/postcss/)、[`css.TailwindCSS`](/functions/css/tailwindcss/) 一样属于「外部工具链」型管道，需要 Node.js 与 npm 包。

## 什么时候用，什么时候别用

**该用**：

- 项目已有 Babel 配置，或需要 Babel 特有的 preset/插件链；
- 要按目标浏览器精细控制语法降级（`targets`）。

**别用**：

- 打包多模块、摇树、压缩 → 用 [`js.Build`](/functions/js/build/)：esbuild 已内嵌，不需要 Node，且会合并 `import`；
- 需要按组批量打包、代码分割、runner → 用 [`js.Batch`](/functions/js/batch/)；
- 项目没有 Node.js → 换 [`js.Build`](/functions/js/build/)。

> [!NOTE]
> **实测**：默认的 `security.exec.allow` 是 `['^(dart-)?sass$', '^go$', '^git$', '^node$', '^postcss$']`，**不含 `babel`**，因此必须按下面「准备」第 5 步把它加进去，否则构建报 `access denied: "babel" is not whitelisted in policy "security.exec.allow"`。

## 准备

第 1 步
: 安装 [Node.js][]。

第 2 步
: 在项目根目录安装所需的 Node 包。例如，安装 Babel 的核心编译器、它的命令行界面，以及根据目标环境转译现代 JavaScript 的预设：

  ```sh
  npm install --save-dev @babel/core @babel/cli @babel/preset-env
  ```

第 3 步
: 在项目根目录创建 Babel 配置文件。例如，使用环境预设，目标为 Google Chrome 79 或更高版本：

  ```js {file="babel.config.mjs" copy=true}
  export default {
    presets: [
      [
        '@babel/preset-env',
        {
          targets: {
            chrome: "79"
          }
        }
      ]
    ]
  };
  ```

第 4 步
: 把 JS 文件放进 `assets/js` 目录。

第 5 步
: 在项目配置中把 `babel` 可执行文件加入 Hugo 的 `security.exec.allow` 列表：

  ```toml
  [security.exec]
    allow = ['^(dart-)?sass$', '^go$', '^git$', '^node$', '^postcss$', '^babel$']
  ```

第 6 步
: 创建一个 _partial_ 模板来处理这段 JavaScript：

  ```go-html-template {file="layouts/_partials/js.html" copy=true}
  {{ with resources.Get "js/main.js" }}
    {{ $opts := dict
      "minified" (cond hugo.IsDevelopment false true)
      "noComments" (cond hugo.IsDevelopment false true)
      "sourceMap" (cond hugo.IsDevelopment "inline" "none")
    }}
    {{ with . | js.Babel $opts }}
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

第 7 步
: 从 _base_ 模板调用这个 _partial_ 模板：

  ```go-html-template {file="layouts/baseof.html" copy=true}
  <head>
    {{ partial "js.html" . }}
  </head>
  ```

## 选项

`js.Babel` 函数接受一个选项映射。

`compact`
: (`bool`) 是否移除可选的换行与空白。当 `minified` 为 `true` 时会启用。默认是 `false`。

`config`
: (`string`) Babel 配置文件的路径。默认情况下，Hugo 会依次在项目根目录以及各模块中查找 `babel.config.js`、`babel.config.mjs`、`babel.config.cjs`。只有当你需要指向一个自定义名称或位于自定义子目录中的配置文件时才使用这个选项。

`minified`
: (`bool`) 是否压缩转译后的代码。会启用 `compact` 选项。默认是 `false`。

`noBabelrc`
: (`bool`) 是否忽略 `.babelrc` 与 `.babelignore` 文件。默认是 `false`。

`noComments`
: (`bool`) 是否移除注释。默认是 `false`。

`sourceMap`
: (`string`) 是否生成 source map，取 `external`、`inline`、`none` 之一。默认是 `none`。

`verbose`
: (`bool`) 是否启用详细日志。默认是 `false`。

<!--
In the above, technically "none" is not one of the enumerated sourceMap
values but it has the same effect and is easier to document than an empty string.
-->

## 完整示例：把现代语法降级到 Chrome 79

准备（对应上文「准备」各步）：

```sh
npm install --save-dev @babel/core @babel/cli @babel/preset-env
```

```js {file="babel.config.mjs"}
export default {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          chrome: "79"
        }
      }
    ]
  ]
};
```

```toml {file="hugo.toml"}
[security.exec]
  allow = ['^(dart-)?sass$', '^go$', '^git$', '^node$', '^postcss$', '^babel$']
```

```js {file="assets/js/main.js"}
const greet = (name) => `Hello, ${name}!`;
const label = greet?.("Hugo") ?? "nobody";
console.log(label);
```

```go-html-template {file="layouts/_partials/js.html"}
{{ with resources.Get "js/main.js" | js.Babel }}
  <script src="{{ .RelPermalink }}"></script>
{{ end }}
```

在本机（Hugo 0.167.0 extended，Windows，`@babel/cli` 已装在项目根）实测：`.RelPermalink` 为 `/js/main.js`，产物为：

```js
"use strict";

var _greet;
const greet = name => `Hello, ${name}!`;
const label = (_greet = greet === null || greet === void 0 ? void 0 : greet("Hugo")) !== null && _greet !== void 0 ? _greet : "nobody";
console.log(label);
```

**你应当看到什么**：可选链与空值合并被展开成兼容写法（`greet === null || greet === void 0 ? void 0 : …`），而箭头函数与模板字符串**保留原样**——因为 `targets` 设为 chrome 79，它们本来就受支持。Babel 只做你指定的目标所需的转换。

加上 `"minified" true` 与 `"noComments" true` 后，实测输出压缩成一行：

```js
"use strict";var _greet;const greet=name=>`Hello, ${name}!`;const label=(_greet=greet===null||greet===void 0?void 0:greet("Hugo"))!==null&&_greet!==void 0?_greet:"nobody";console.log(label);
```

设置 `"sourceMap" "inline"` 后，实测产物末尾追加一行内联 source map：

```js
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3Rkb3V0IiwibmFtZXMiOltdLCJzb3VyY2VzIjpbInN0ZGluIl0s…
```

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows；`@babel/core`、`@babel/cli`、`@babel/preset-env` 已装在项目根，`security.exec.allow` 含 `^babel$`。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 正常转译 | 资源；`.RelPermalink` 沿用源路径 `/js/main.js` | 否 |
| `"minified" true` + `"noComments" true` | 输出压缩成一行、注释移除 | 否 |
| `"sourceMap" "inline"` | 产物末尾追加内联 source map | 否 |
| 未把 `babel` 加入 `security.exec.allow` | —— | 是：`BABEL: failed to transform "/js/es6.js" (text/javascript): access denied: "babel" is not whitelisted in policy "security.exec.allow"` |
| JS 语法错误 | —— | 是：`BABEL: failed to transform "/js/bad.js" (text/javascript): SyntaxError: …bad.js: Unexpected token (1:6)` |
| 直传字符串 | —— | 是：`error calling Babel: type string not supported in Resource transformations` |
| 直传 `nil` | —— | 是：`error calling Babel: type <nil> not supported in Resource transformations` |
| 未安装 `@babel/cli` | 上游未给出消息；本站未实测该分支（预期与 PostCSS 一样提示找不到可执行文件） | —— |
| 文件不存在但用 `with` 守卫 | 整段不渲染 | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `access denied: "babel" is not whitelisted in policy "security.exec.allow"` | 默认白名单不含 `babel`（**实测**） | 按「准备」第 5 步把它加入 `[security.exec] allow` |
| 报错看不懂 | 提示找不到 `babel` 可执行文件 | 没在**项目根**安装 `@babel/cli` | 在项目根 `npm install --save-dev @babel/core @babel/cli @babel/preset-env` |
| 没报错但结果不对 | 现代语法一点没变 | `targets` 设得太新，或配置文件没被读到 | 收紧 `targets`；确认 `babel.config.mjs` 在项目根（也可用 `config` 选项指定） |
| 报错看不懂 | `SyntaxError: … Unexpected token` | 源文件本身就是非法 JS；注意 Babel 报的是工作目录下的路径 | 按报错行号修源文件 |
| 没报错但结果不对 | `import` 语句仍在产物里 | Babel 只转译语法、不合并模块 | 需要打包请改用 [`js.Build`](/functions/js/build/) |

更多排查入口见[故障排查](/troubleshooting/)。

[Babel]: https://babeljs.io/
[Node.js]: https://nodejs.org/en/download
