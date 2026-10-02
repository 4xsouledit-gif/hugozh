+++
title = "vimeo"
linkTitle = "vimeo"
description = "用 vimeo 短代码在正文中嵌入 Vimeo 视频：参数表、可复制的调用、实测 iframe 输出、class 与内联样式的关系、隐私开关。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/shortcodes/vimeo/"

[params.teach]
difficulty = "入门"
time = "8 分钟"
prereq = [
  "站点能构建成功（`hugo --renderToMemory` 退出码为 0）。",
  "知道自己要嵌入的视频地址，能从中取出视频 ID。",
]
outcomes = [
  "写出带 `id` 的 `vimeo` 调用，并在产物里核对生成的 `div` + `iframe` 结构；",
  "说清 `class` 为什么会去掉内联样式，以及这跟你自己写 CSS 的关系；",
  "用 `[privacy.vimeo]` 的 `disable` / `enableDNT` / `simple` 控制跟踪与脚本加载。",
]
next = ["/shortcodes/youtube/", "/shortcodes/instagram/"]

+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `vimeo` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

## 这一页解决什么问题

把视频放进文章，最省事的做法是直接 `<iframe>`，但要让它**在窄屏上不变形**得自己写一层按比例撑高的容器，还要记得加 `title`（无障碍）与 `loading`（性能）。抄一遍容易，抄十遍就容易漏。

`vimeo` 短代码把这段套版收进 Hugo：你写视频 ID，构建时生成「按 16:9 撑高的 `div` + `iframe`」这套结构，需要的话再补上 `class`、`title`、`loading`。

`vimeo` 短代码在正文中嵌入一个 Vimeo 播放器，默认输出带内联样式的 `iframe` 元素，外层包一个 `div` 元素。

## 示例

要展示地址为 `https://vimeo.com/19899678` 的视频，只需在 Markdown 中写入视频 ID：

```md {file="content/example.md"}
{{</* vimeo 19899678 */>}}
```

**你应当看到什么**（实测输出，Hugo 0.167；空白是模板自带的缩进）：

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    src="https://player.vimeo.com/video/19899678?dnt=0"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;" allow="fullscreen">
  </iframe>
</div>
```

结构读法：外层 `div` 用 `padding-bottom: 56.25%`（16:9）撑出高度，`iframe` 绝对定位铺满它。**这就是窄屏不变形的原因**，也是你不必自己写容器样式的原因。

也可以使用命名参数，并同时调整其他选项：

```md
{{</* vimeo id=19899678 allowFullScreen=false loading=lazy */>}}
```

**实测**：给出 `class` 后，`div` 与 `iframe` 上的内联样式会被移除，只留类名，方便完全交给自己的 CSS：

```html
<div class="my-class">
  <iframe src="https://player.vimeo.com/video/19899678?dnt=0" loading="lazy" title="vimeo title">
  </iframe>
</div>
```

> [!CAUTION]
> 去掉内联样式的**代价**是：撑高与铺满都没了。若你的样式表里没有为这类容器写 `position` / `padding-bottom` / `height`，加上 `class` 后视频会塌成一条细缝或按原始尺寸溢出。要用 `class`，就配套写 CSS。

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | 视频的 `id`。当 `id` 是第一个且唯一的位置参数时可以省略（写成 `{{</* vimeo 19899678 */>}}`）。 |
| `allowFullScreen` | `bool` | `iframe` 元素能否激活全屏模式。默认值为 `true`。自 Hugo 0.146.0 起可用。 |
| `class` | `string` | 外层 `div` 元素的 `class` 属性。添加一个或多个 CSS 类会禁用内联样式。 |
| `loading` | `string` | `iframe` 元素的 loading 属性，取值为 `eager` 或 `lazy`。默认值为 `eager`。自 Hugo 0.146.0 起可用。 |
| `title` | `string` | `iframe` 元素的 `title` 属性。 |

把 `loading` 设为 `lazy` 可以推迟视频的加载，减少首屏开销；首屏以内的视频则应保留默认的 `eager`。

> [!WARNING]
> **实测（Hugo 0.167）**：把 `class` 写成**第二个位置参数**（`{{</* vimeo 19899678 "my-class" */>}}`）不会生效，也不报错——`class` 必须写成命名参数。位置参数只用于 `id`。

### 视频 ID 从哪来

视频地址 `https://vimeo.com/19899678` 里，末尾那串数字就是 ID。私有视频的地址形如 `https://vimeo.com/19899678/abcdef1234`，ID 仍是前面的数字部分。

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

**实测（Hugo 0.167）**：

| 配置 | 产物里的变化 |
| --- | --- |
| 默认（全部关闭） | `iframe src="https://player.vimeo.com/video/19899678?dnt=0"` |
| `enableDNT = true` | `iframe src="…/video/19899678?dnt=1"` |
| `disable = true` | 短代码**什么都不输出**，构建不报错、不警告 |

- **标准模式在构建时不访问 Vimeo**：上面那套 `div` + `iframe` 是静态 HTML，断网也能构建；
- **简单模式需要构建时联网**：它要通过 `resources.GetRemote` 拉取视频信息。实测在无外网权限的环境里会得到
  `WARN The "vimeo" shortcode was unable to retrieve the remote data: …`，并按 `simple` 模板的逻辑输出空内容。也就是说，**简单模式是唯一会让构建依赖网络的选项**。

## 什么时候用，什么时候别用

**该用**：

- 正文里真的要看视频；
- 需要窄屏自适应，又不想自己写容器样式（用默认内联样式版）；
- 需要对访客做隐私保护（`enableDNT = true`、或 `simple = true` 只在点击后才跳转到 Vimeo）。

**别用**：

- 只想给出视频链接 → 直接写 Markdown 链接，轻得多；
- 需要**离线**的产物、或构建环境没有外网 → 别开 `simple`；默认模式不联网，可以放心用；
- 想让视频样式完全受自己控制 → 可以用 `class`，但记得自己补上撑高的 CSS；
- 页面上有多个视频、又不需要都自动加载 → 给首屏以外的视频加 `loading="lazy"`。

## 验证方法

1. 在内容里写一次调用：

   ```md {file="content/example.md"}
   {{</* vimeo id=19899678 class="video-embed" loading=lazy title="产品演示" */>}}
   ```

2. 构建：

   ```bash
   hugo
   ```

3. 打开 `public/example/index.html`，搜索 `player.vimeo.com`。

**你应当看到什么**：一个 `<div class="video-embed">`，里面是 `<iframe src="https://player.vimeo.com/video/19899678?dnt=0" loading="lazy" title="产品演示">`。

- 搜不到 `player.vimeo.com` → 检查 `[privacy.vimeo] disable` 是不是 `true`；
- `iframe` 在，但页面上视频区域高度为 0 → 你用了 `class` 却没写撑高的 CSS（见上面的警告）；
- 想确认播放与全屏是否正常，必须**在浏览器里**打开预览，构建产物检查不到这些。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 加了 `class` 后视频区域塌陷 | `class` 会移除内联样式，而你没写配套 CSS | 自己写 `position: relative; padding-bottom: 56.25%` 一类样式；或去掉 `class` |
| 没报错但结果不对 | `allowFullScreen=false` / `loading=lazy` 没生效 | 写成了位置参数，或 Hugo 版本低于 0.146.0 | 用命名参数；`hugo version` 确认版本 |
| 没报错但结果不对 | 产物里完全没有嵌入内容 | `[privacy.vimeo] disable = true` | 改成 `false` |
| 没报错但结果不对 | 构建时出现 `unable to retrieve the remote data` 警告 | 开了 `simple = true`，而构建环境访问不到 Vimeo | 关闭 `simple`（默认模式不需要联网），或给构建环境放行网络 |
| 没报错但结果不对 | 页面上直接显示了短代码的调用原文 | 把文档里的转义写法抄进了正文 | 删掉 `/*` 与 `*/` |
| 报错看不懂 | `failed to extract shortcode: template for shortcode "vimeo" not found` | `layouts/_shortcodes/` 下有同名文件但内容有误 | 删掉自定义文件即恢复内置版本 |

更多排查入口见[故障排查](/troubleshooting/)。

[这个文件]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/vimeo_simple.html
[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/vimeo.html
