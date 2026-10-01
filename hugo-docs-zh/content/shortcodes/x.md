+++
title = "x"
linkTitle = "x"
description = "用 x 短代码在正文中嵌入 X 帖子。"
date = 2026-10-01
weight = 100
source = "https://gohugo.io/shortcodes/x/"
+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `x` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

`x` 短代码在正文中嵌入一条 X（原 Twitter）帖子。自 Hugo 0.141.0 起可用。

## 示例

要展示地址为 `https://x.com/SanDiegoZoo/status/1453110110599868418` 的帖子，需要给出作者用户名与帖子 ID：

```md
{{</* x user="SanDiegoZoo" id="1453110110599868418" */>}}
```

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `user` | `string` | 帖子作者的 X 用户名，即帖子地址中 `x.com/` 之后、`/status/` 之前的部分。 |
| `id` | `string` | 帖子的 ID，即帖子地址中 `/status/` 之后的部分。 |

两个参数都使用命名参数写法传入，值需加引号。

## 隐私

嵌入第三方内容会向对方发起请求，因此相关行为由项目配置中的隐私设置控制：

```toml
[privacy.x]
disable = false
enableDNT = false
simple = false
```

`disable`
: （`bool`）是否禁用该短代码。默认值为 `false`。

`enableDNT`
: （`bool`）是否阻止 X 把帖子数据与嵌入页面数据用于个性化推荐和广告。默认值为 `false`。

`simple`
: （`bool`）是否启用简单模式。取 `true` 时，Hugo 构建出不含 JavaScript 的静态帖子版本。默认值为 `false`。

简单模式版本的短代码源码见[这个文件][]。

启用简单模式后，如果想去掉硬编码的内联样式，可以在项目配置中把 `disableInlineCSS` 设为 `true`：

```toml
[services.x]
disableInlineCSS = false
```

该设置默认值为 `false`。

[这个文件]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/x_simple.html
[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/x.html
