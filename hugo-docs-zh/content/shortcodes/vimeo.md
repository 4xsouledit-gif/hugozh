+++
title = "vimeo"
linkTitle = "vimeo"
description = "用 vimeo 短代码在正文中嵌入 Vimeo 视频。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/shortcodes/vimeo/"
+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `vimeo` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

`vimeo` 短代码在正文中嵌入一个 Vimeo 播放器，默认输出带内联样式的 `iframe` 元素，外层包一个 `div` 元素。

## 示例

要展示地址为 `https://vimeo.com/19899678` 的视频，只需在 Markdown 中写入视频 ID：

```md
{{</* vimeo 19899678 */>}}
```

也可以使用命名参数，并同时调整其他选项：

```md
{{</* vimeo id=19899678 allowFullScreen=false loading=lazy */>}}
```

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 视频的 `id`。当 `id` 是第一个且唯一的位置参数时可以省略。 |
| `allowFullScreen` | `bool` | `iframe` 元素能否激活全屏模式。默认值为 `true`。自 Hugo 0.146.0 起可用。 |
| `class` | `string` | 外层 `div` 元素的 `class` 属性。添加一个或多个 CSS 类会禁用内联样式。 |
| `loading` | `string` | `iframe` 元素的 loading 属性，取值为 `eager` 或 `lazy`。默认值为 `eager`。自 Hugo 0.146.0 起可用。 |
| `title` | `string` | `iframe` 元素的 `title` 属性。 |

把 `loading` 设为 `lazy` 可以推迟视频的加载，减少首屏开销；首屏以内的视频则应保留默认的 `eager`。

## 隐私

嵌入第三方内容会向对方发起请求，因此相关行为由项目配置中的隐私设置控制：

```toml
[privacy.vimeo]
disable = false
enableDNT = false
simple = false
```

`disable`
: （`bool`）是否禁用该短代码。默认值为 `false`。

`enableDNT`
: （`bool`）是否阻止 Vimeo 播放器跟踪会话数据与分析信息。默认值为 `false`。

`simple`
: （`bool`）是否启用简单模式。取 `true` 时，视频缩略图从 Vimeo 获取，并叠加一个播放按钮；点击缩略图会在新的 Vimeo 标签页中打开视频。默认值为 `false`。

简单模式版本的短代码源码见[这个文件][]。

[这个文件]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/vimeo_simple.html
[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/vimeo.html
