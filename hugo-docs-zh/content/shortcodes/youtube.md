+++
title = "youtube"
linkTitle = "youtube"
description = "用 youtube 短代码在正文中嵌入 YouTube 视频。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/shortcodes/youtube/"
+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `youtube` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

`youtube` 短代码在正文中嵌入一个 YouTube 播放器，默认输出带 `style` 属性的 `iframe` 元素，外层包一个带 `style` 属性的 `div` 元素。

## 示例

要展示地址为 `https://www.youtube.com/watch?v=0RKpf3rK57I` 的视频，只需在 Markdown 中写入视频 ID：

```md
{{</* youtube 0RKpf3rK57I */>}}
```

也可以使用命名参数，并同时指定播放区间与加载方式：

```md
{{</* youtube id=0RKpf3rK57I start=30 end=60 loading=lazy */>}}
```

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 视频的 `id`。当 `id` 是第一个且唯一的位置参数时可以省略。 |
| `allowFullScreen` | `bool` | `iframe` 元素能否激活全屏模式。默认值为 `true`。 |
| `autoplay` | `bool` | 是否自动播放视频。会强制把 `mute` 设为 `true`。默认值为 `false`。 |
| `class` | `string` | 外层 `div` 元素的 `class` 属性。指定后，会移除 `iframe` 元素及其外层 `div` 元素上的 `style` 属性。 |
| `controls` | `bool` | 是否显示视频控件。默认值为 `true`。 |
| `end` | `int` | 播放器停止播放的时间点，以视频开始后的秒数计。 |
| `loading` | `string` | `iframe` 元素的 loading 属性，取值为 `eager` 或 `lazy`。默认值为 `eager`。 |
| `loop` | `bool` | 是否无限重复视频。首次播放之后会忽略 `start` 与 `end` 参数。默认值为 `false`。 |
| `mute` | `bool` | 是否静音。当 `autoplay` 为 `true` 时始终为 `true`。默认值为 `false`。 |
| `start` | `int` | 播放器开始播放的时间点，以视频开始后的秒数计。 |
| `title` | `string` | `iframe` 元素的 `title` 属性。默认值为 `YouTube video`。 |

把 `loading` 设为 `lazy` 可以推迟视频的加载，减少首屏开销；首屏以内的视频则应保留默认的 `eager`。

## 隐私

嵌入第三方内容会向对方发起请求，因此相关行为由项目配置中的隐私设置控制：

```toml
[privacy.youTube]
disable = false
privacyEnhanced = false
```

配置键名不区分大小写，写作 `[privacy.youtube]` 同样有效。

`disable`
: （`bool`）是否禁用该短代码。默认值为 `false`。

`privacyEnhanced`
: （`bool`）是否阻止 YouTube 在用户播放嵌入视频之前收集网站访客信息。默认值为 `false`。

[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/youtube.html
