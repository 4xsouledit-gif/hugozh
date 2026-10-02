+++
title = "transform.Emojify"
linkTitle = "Emojify"
description = "返回把 emoji 短代码替换为对应 emoji 字符后的给定字符串。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/transform/emojify/"

[params.functions_and_methods]
signatures = ["transform.Emojify INPUT"]
returnType = "template.HTML"
aliases = ["emojify"]
+++

## 这一页解决什么问题

想让模板里生成的文本带上 emoji，又不想在源码里直接放 emoji 字符（有些编辑器、终端、Git 流程对非 ASCII 字符不友好）。`emojify` 让你写 `:heart:` 这样的短代码，由它替换成真正的 emoji 字符。

`emojify` 与 `transform.Emojify` 是同一个函数：前者是别名。

## 什么时候用，什么时候别用

**该用**：

- 模板或数据文件里存的是 emoji 短代码，需要在输出前替换；
- 想避免源码里出现裸 emoji 字符（提交历史、字体兼容）。

**别用**：

- **内容文件**里的 emoji 短代码 → 不用逐处调函数：在项目配置里把 [`enableEmoji`](/configuration/all/) 设为 `true`，Hugo 会在渲染正文时自动替换（上游说明）；
- 想输出自定义图标/SVG → 用图片或内联 SVG，短代码表是固定的；
- 想替换**任意**占位符 → `emojify` 只认内置 emoji 清单里的名字，未知短代码原样保留（实测 `:notreal:` 不变）。

## 上游给出的结果

可用的表情符号见 [emoji 短代码][]清单。

`emojify` 函数可以在模板中调用，但默认不能直接用在内容文件里。要在内容文件中使用 emoji，请在项目配置中把 [`enableEmoji`][] 设为 `true`；此后就可以把 emoji 简写直接写进内容文件：

```md
I :heart: Hugo!
```

I :heart: Hugo!

## 完整示例：替换短代码

```go-html-template {file="layouts/_partials/emoji.html"}
{{ $s := "I :heart: Hugo!" }}
<p>{{ $s | emojify }}</p>
<p>{{ ":smile:" | emojify }}</p>
<p>{{ ":notreal:" | emojify }}</p>
```

Hugo 渲染为（变量赋值行本身会留下空行，这里省略）：

```html
<p>I ❤️ Hugo!</p>
<p>😄</p>
<p>:notreal:</p>
```

**你应当看到什么**：已知短代码被替换为 emoji 字符；第三行说明**未知短代码不会被删掉**，而是原样输出——所以「没生效」通常意味着名字拼错了。返回值类型是 `template.HTML`，emoji 会原样进入 HTML。

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，单语言站点（`locale = 'zh-CN'`），Windows。

| 输入 | 结果 | 是否报错 |
| --- | --- | --- |
| `"I :heart: Hugo!"` | `I ❤️ Hugo!` | 否 |
| `":smile:"` | `😄` | 否 |
| `":notreal:"`（未知短代码） | `:notreal:`（原样保留） | 否 |
| `"no emoji"`（无短代码） | `no emoji` | 否 |
| 返回类型 | `template.HTML`（实测 `printf "%T"` 输出 `template.HTML`） | 否 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上原样显示 `:heart:` | 短代码名不在内置清单里，或该处没有调用 `emojify` | 对照 [emoji 短代码][]清单核对名字；内容文件用 `enableEmoji` |
| 没报错但结果不对 | 内容里的 `:heart:` 没被替换 | 默认不在内容文件里替换 | 在项目配置中设 `enableEmoji = true` |
| 没报错但结果不对 | 想把短代码当普通文本显示 | `emojify` 会替换它 | 不要在会经过 `emojify` 的地方放字面短代码 |

更多排查入口见[故障排查](/troubleshooting/)。

[`enableEmoji`]: /configuration/all/
[emoji 短代码]: /quick-reference/emojis/
