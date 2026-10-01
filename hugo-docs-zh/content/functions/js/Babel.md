+++
title = "js.Babel"
linkTitle = "Babel"
description = "返回用 Babel 转译给定 JavaScript 资源后生成的资源。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/js/babel/"

[params.functions_and_methods]
signatures = ["js.Babel [OPTIONS] RESOURCE"]
returnType = "resource.Resource"
aliases = ["babel"]
+++

`js.Babel` 函数使用 [Babel][] 转换 JavaScript。

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

[Babel]: https://babeljs.io/
[Node.js]: https://nodejs.org/en/download
