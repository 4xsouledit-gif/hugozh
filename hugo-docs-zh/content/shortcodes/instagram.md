+++
title = "instagram"
linkTitle = "instagram"
description = "用 instagram 短代码在正文中嵌入 Instagram 帖子。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/shortcodes/instagram/"
+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `instagram` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

`instagram` 短代码在正文中嵌入一条 Instagram 帖子。它不接受内部内容，只接受一个位置参数，即帖子地址中的 ID。

## 示例

要展示地址为 `https://www.instagram.com/p/CxOWiQNP2MO/` 的帖子，只需在 Markdown 中写入帖子 ID：

```md
{{</* instagram CxOWiQNP2MO */>}}
```

渲染时会由 Instagram 提供的脚本把帖子内容插入页面。

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | Instagram 帖子的 ID，即帖子地址 `https://www.instagram.com/p/<ID>/` 中 `p` 之后的那一段。作为第一个位置参数传入，不能与其他参数混用。 |

该短代码不使用命名参数，示例中的 `CxOWiQNP2MO` 就是帖子 ID。

## 隐私

嵌入第三方内容会向对方发起请求，因此相关行为由项目配置中的隐私设置控制：

```toml
[privacy.instagram]
disable = false
simple = false
```

`disable`
: （`bool`）是否禁用该短代码。默认值为 `false`。

`simple`
: （`bool`）是否启用简单模式以生成图片卡片。取 `true` 时，Hugo 生成一张不含 JavaScript 的静态卡片。该模式只支持图片卡片，图片直接从 Instagram 的服务器获取。默认值为 `false`。

把 `disable` 设为 `true` 后，正文中的 `instagram` 短代码不再向 Instagram 请求任何内容；改用 `simple` 则可以在不加载脚本的前提下仍显示一张卡片。

[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/instagram.html
