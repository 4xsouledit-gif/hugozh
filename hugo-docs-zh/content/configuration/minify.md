+++
title = "压缩配置"
linkTitle = "压缩配置"
description = "通过 minify 配置精简站点输出的各类资源。"
date = 2026-10-01
weight = 150
source = "https://gohugo.io/configuration/minify/"
+++

`[minify]` 用于在发布阶段压缩输出资源。默认配置如下：

```toml
[minify]
disableCSS = false
disableHTML = false
disableJS = false
disableJSON = false
disableSVG = false
disableXML = false
minifyOutput = false
```

## 内容类型开关

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `disableCSS` | `bool` | `false` | 是否禁用 CSS 压缩。 |
| `disableHTML` | `bool` | `false` | 是否禁用 HTML 压缩。 |
| `disableJS` | `bool` | `false` | 是否禁用 JavaScript 压缩。 |
| `disableJSON` | `bool` | `false` | 是否禁用 JSON 压缩。 |
| `disableSVG` | `bool` | `false` | 是否禁用 SVG 压缩。 |
| `disableXML` | `bool` | `false` | 是否禁用 XML 压缩，例如 RSS 输出。 |
| `minifyOutput` | `bool` | `false` | 是否在渲染时直接压缩输出，而不是在写入文件时压缩。 |

所有这些开关默认都是 `false`，即各类资源的压缩默认开启，只有把对应开关设为 `true` 才会跳过该类型。

## 底层压缩器选项

`[minify.tdewolff]` 下的键会原样传给 [tdewolff/minify](https://github.com/tdewolff/minify) 项目，默认值如下：

```toml
[minify.tdewolff.css]
inline = false
precision = 0
version = 0

[minify.tdewolff.html]
keepComments = false
keepConditionalComments = false
keepDefaultAttrVals = true
keepDocumentTags = true
keepEndTags = true
keepQuotes = false
keepSpecialComments = true
keepWhitespace = false
templateDelims = ['', '']

[minify.tdewolff.js]
keepVarNames = false
precision = 0
version = 2022

[minify.tdewolff.json]
keepNumbers = false
precision = 0

[minify.tdewolff.svg]
keepComments = false
keepNamespaces = ['', 'x-bind']
precision = 0

[minify.tdewolff.xml]
keepWhitespace = false
```

关键点说明：

- `css.inline` 属于内部使用，修改它不会产生任何效果。
- `html.keepConditionalComments` 已弃用，请改用 `html.keepSpecialComments`。
- `precision` 用于控制压缩后数值保留的小数位数，`0` 表示由压缩器自行取舍；`js.version` 指定 JavaScript 的版本年份，`2022` 表示按 ES2022 语法压缩。

## 使用示例

只在 HTML 与 XML 输出上启用压缩，跳过 CSS 与 JS：

```toml
[minify]
disableCSS = true
disableJS = true
minifyOutput = true
```

如果要保留 HTML 中的注释和空白（例如某些依赖注释的第三方脚本），可以局部覆盖底层选项：

```toml
[minify.tdewolff.html]
keepComments = true
keepWhitespace = true
```
