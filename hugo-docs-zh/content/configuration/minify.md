+++
title = "压缩配置"
linkTitle = "压缩配置"
description = "通过 minify 配置精简站点输出的各类资源。"
date = 2026-10-01
weight = 150
source = "https://gohugo.io/configuration/minify/"
+++

## 这一页解决什么问题

`[minify]` 决定发布时要不要压掉输出资源里的空白与冗余，以及压到什么程度。注意：**压缩默认就是开着的**（各 `disable*` 都是 `false`），所以这一页更多是回答「什么时候该关掉某一类」，而不是「怎么打开」。

压缩出问题时的典型症状是：代码块缩进错乱、依赖注释的脚本失效、或者样式被压坏——都是「构建成功但页面不对」。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `disableHTML` | HTML 里含依赖空白的代码块，或有靠注释工作的第三方脚本 | 压缩后 `<pre>` 内容错位、脚本失效；多数情况用下面的 `keepComments` / `keepWhitespace` 局部解决更合适 |
| `disableCSS` / `disableJS` | 样式或脚本行为异常，需要先排除压缩因素 | 关掉后产物变大，但问题若仍在，说明与压缩无关 |
| `disableXML` | 希望 RSS / 站点地图保持可读 | 关闭压缩后 feed 体积增加 |
| `minifyOutput` | 希望在渲染阶段就压缩，而不是写文件时压缩 | 不影响压缩内容本身，只改变内部处理时机；不确定时保持默认 `false` |
| `[minify.tdewolff.*]` | 需要保留注释、空白、变量名等细节 | 键名或层级写错会**静默无效**，压缩行为与预期不符且没有任何提示 |

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

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 代码块或 `<pre>` 里的格式错乱 | HTML 压缩删掉了有意义的空白 | 设 `[minify.tdewolff.html] keepWhitespace = true`，或整体 `disableHTML = true` |
| 依赖 HTML 注释的第三方脚本失效 | 注释默认被压缩器删除 | 设 `keepComments = true`；`keepSpecialComments` 保留的是另一类特殊注释 |
| 配置写了却没有任何效果 | `[minify.tdewolff.*]` 的键名或层级写错；这些键直接透传给外部压缩器，Hugo 不校验 | 对照本页默认值逐键核对；用 `hugo config` 确认最终取值 |
| 只在本地预览里看效果，无法确认压缩结果 | 预览输出与正式构建产物不保证一致 | 运行 `hugo build` 后直接查看 `public/` 下的文件 |
| `precision` 改了却没变化 | `0` 表示「由压缩器自行取舍」，它不是一个精确位数 | 需要固定小数位数时显式给出正整数 |

更多排查入口见[故障排查](/troubleshooting/)。
