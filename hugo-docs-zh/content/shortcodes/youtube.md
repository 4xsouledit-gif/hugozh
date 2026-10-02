+++
title = "youtube"
linkTitle = "youtube"
description = "用 youtube 短代码在正文中嵌入 YouTube 视频：完整参数表、可复制的调用、实测 iframe 输出、起止秒数与隐私开关。"
date = 2026-10-01
weight = 110
source = "https://gohugo.io/shortcodes/youtube/"

[params.teach]
difficulty = "入门"
time = "10 分钟"
prereq = [
  "站点能构建成功（`hugo --renderToMemory` 退出码为 0）。",
  "知道自己要嵌入的视频地址，能从中取出 11 位的视频 ID。",
]
outcomes = [
  "写出带 `start` / `end` / `loading` / `title` 的 `youtube` 调用；",
  "在产物里核对 `div` + `iframe` 结构，以及参数如何变成 URL 查询参数；",
  "用 `[privacy.youTube]` 的 `privacyEnhanced` 切换到 `youtube-nocookie.com`，并说清它挡住了什么。",
]
next = ["/shortcodes/vimeo/", "/shortcodes/x/"]

+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `youtube` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

## 这一页解决什么问题

直接贴 YouTube 的嵌入代码会得到一长串 `iframe` 属性：`allow`、`referrerpolicy`、按比例撑高的容器、URL 上的 `autoplay` / `start` / `loop` 查询参数。手写容易漏，尤其是「从第 30 秒开始播到第 60 秒」这种需求。

`youtube` 短代码把这些参数变成短代码参数：你写视频 ID 和 `start=30 end=60`，Hugo 负责拼出正确的 `iframe` 与 URL 查询参数。

`youtube` 短代码在正文中嵌入一个 YouTube 播放器，默认输出带 `style` 属性的 `iframe` 元素，外层包一个带 `style` 属性的 `div` 元素。

## 示例

要展示地址为 `https://www.youtube.com/watch?v=0RKpf3rK57I` 的视频，只需在 Markdown 中写入视频 ID：

```md {file="content/example.md"}
{{</* youtube 0RKpf3rK57I */>}}
```

**你应当看到什么**（实测输出，Hugo 0.167，为便于对照做了换行）：

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
    loading="eager"
    referrerpolicy="strict-origin-when-cross-origin"
    src="https://www.youtube.com/embed/0RKpf3rK57I?autoplay=0&amp;controls=1&amp;end=0&amp;loop=0&amp;mute=0&amp;start=0"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;"
    title="YouTube video"></iframe>
</div>
```

三个值得注意的地方：

- 外层 `div` 用 `padding-bottom: 56.25%`（16:9）撑高，`iframe` 绝对定位铺满，因此窄屏不变形；
- **参数最终变成 URL 查询参数**：`autoplay`、`controls`、`end`、`loop`、`mute`、`start` 都在 `src` 上，没有给默认值的参数显示为 `0` 或 `1`；
- `title` 默认是 `YouTube video`——**这是无障碍属性，建议按视频内容改成有意义的中文标题**。

也可以使用命名参数，并同时指定播放区间与加载方式：

```md
{{</* youtube id=0RKpf3rK57I start=30 end=60 loading=lazy */>}}
```

**实测**输出（Hugo 0.167；`allow`、`referrerpolicy`、`style` 与默认一致，只为对照换行）：

```html
<div style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
  <iframe
    allow="…"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
    src="https://www.youtube.com/embed/0RKpf3rK57I?autoplay=0&amp;controls=1&amp;end=60&amp;loop=0&amp;mute=0&amp;start=30"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border:0;"
    title="YouTube video"></iframe>
</div>
```

把 `autoplay`、`loop`、`class`、`title` 一起叠上去，就能看清参数之间的连带关系：

```md
{{</* youtube id=0RKpf3rK57I start=30 end=60 loading=lazy autoplay=true loop=true class="yt-class" title="yt title" */>}}
```

**实测**输出（同一版本）：

```html
<div class="yt-class">
  <iframe
    allow="…"
    loading="lazy"
    referrerpolicy="strict-origin-when-cross-origin"
    src="https://www.youtube.com/embed/0RKpf3rK57I?autoplay=1&amp;controls=1&amp;end=60&amp;loop=1&amp;mute=1&amp;playlist=0RKpf3rK57I&amp;start=30"
    title="yt title"></iframe>
</div>
```

两条链路能对上：`autoplay=1` 同时带来 `mute=1`（见参数表），`loop=1` 让 URL 里多出 `playlist=<视频ID>`。

> [!CAUTION]
> 给出 `class` 后，`div` 与 `iframe` 上的 `style` 属性都会**被移除**。若自己的样式表里没有撑高与定位，视频区域会塌陷。要用 `class` 就配套写 CSS。
>
> 另外，**`class` 会禁用内联样式**这一点与「用类名做渐进增强」的习惯相反：这里类名不是叠加，而是替换。

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

### 参数之间的相互影响

这几条是实际写作时最容易忽略的：

| 你写了 | 连带发生什么 |
| --- | --- |
| `autoplay=true` | `mute` 被强制为 `true`（多数浏览器只允许静音自动播放） |
| `autoplay=true loading="lazy"` | 视频要等进入视口才开始加载，自动播放往往在用户已经滚过去之后才发生——两者通常不该同时用 |
| `loop=true` | 首次播放后忽略 `start` / `end`；URL 上会多出 `playlist=<视频ID>`（YouTube 侧要求同视频才能循环） |
| `class="…"` | `div` 与 `iframe` 的 `style` 被移除，需自带 CSS |
| `title="…"` 不写 | 无障碍标签停在英文的 `YouTube video` |

### 视频 ID 从哪来

视频地址通常是下面两种形式，ID 都是 `v=` 或 `youtu.be/` 之后的那 11 位字符：

```text
https://www.youtube.com/watch?v=0RKpf3rK57I
https://youtu.be/0RKpf3rK57I
```

短代码只认 ID，**不要**把整个地址填进去。

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

**实测（Hugo 0.167）**：

| 配置 | 产物里的变化 |
| --- | --- |
| 默认 | `iframe src="https://www.youtube.com/embed/0RKpf3rK57I?…"` |
| `privacyEnhanced = true` | `iframe src="https://www.youtube-nocookie.com/embed/0RKpf3rK57I?…"`——域名换成无 Cookie 站点 |
| `disable = true` | 短代码**什么都不输出**，构建不报错、不警告 |

标准模式**在构建时不访问 YouTube**，上面那套 HTML 是静态拼出来的，断网也能构建。

## 什么时候用，什么时候别用

**该用**：

- 正文里真的要看视频，且希望窄屏自适应；
- 需要「从第 30 秒开始、到第 60 秒停」这类区间播放；
- 需要 `privacyEnhanced` 减轻第三方跟踪。

**别用**：

- 只想给出视频链接 → 直接写 Markdown 链接；
- 页面首屏以外有很多视频、又不想拖慢首屏 → 要么加 `loading="lazy"`，要么改成点击后再加载（那需要自定义短代码）；
- 需要完全离线可用的产物 → 嵌入本质上依赖第三方域名，离线场景请改用本地视频文件。

## 验证方法

1. 在内容里写一次调用：

   ```md {file="content/example.md"}
   {{</* youtube id=0RKpf3rK57I start=30 end=60 loading=lazy title="产品演示" */>}}
   ```

2. 构建：

   ```bash
   hugo
   ```

3. 打开 `public/example/index.html`，搜索 `youtube.com/embed`。

**你应当看到什么**：一个 `iframe`，`loading="lazy"`，`title="产品演示"`，`src` 指向 `https://www.youtube.com/embed/0RKpf3rK57I`，并在问号后面带上 …`end=60`…`start=30` 这些查询参数。

- `src` 里应当同时有 `start=30` 与 `end=60`，说明参数被正确拼进了 URL；
- 若 `src` 是 `youtube-nocookie.com`，说明站点开了 `privacyEnhanced`；
- 搜不到 `youtube.com/embed` → 检查 `[privacy.youTube] disable` 是不是 `true`；
- `iframe` 在、但页面视频区域高度为 0 → 你用了 `class` 却没写撑高的 CSS；
- 播放、全屏、自动播放这些行为**必须在浏览器里**验证，构建产物检查不到。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 加了 `class` 后视频区域塌陷 | `class` 会移除内联样式，而你没写配套 CSS | 自己写 `position: relative; padding-bottom: 56.25%` 一类样式；或去掉 `class` |
| 没报错但结果不对 | 自动播放没声音 | `autoplay=true` 会强制静音，这是浏览器的普遍限制 | 需要声音就别用 `autoplay` |
| 没报错但结果不对 | `loop=true` 后 `start` / `end` 失效 | 文档明确：首次播放之后忽略这两个参数 | 需要区间循环时自己控制播放器 |
| 没报错但结果不对 | 读屏软件念出英文的「YouTube video」 | 没写 `title` | 补上有意义的 `title` |
| 没报错但结果不对 | 产物里完全没有嵌入内容 | `[privacy.youTube] disable = true` | 改成 `false` |
| 报错看不懂 | `failed to extract shortcode: template for shortcode "youtube" not found` | `layouts/_shortcodes/` 下有同名文件但内容有误 | 删掉自定义文件即恢复内置版本 |

更多排查入口见[故障排查](/troubleshooting/)。

[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/youtube.html
