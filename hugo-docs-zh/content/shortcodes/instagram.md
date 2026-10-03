+++
title = "instagram"
linkTitle = "instagram"
description = "用 instagram 短代码在正文中嵌入 Instagram 帖子：唯一的参数、只收位置参数的原因、隐私开关与验证方法。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/shortcodes/instagram/"

[params.teach]
difficulty = "入门"
time = "8 分钟"
prereq = [
  "站点能构建成功（`hugo --renderToMemory` 退出码为 0）。",
  "知道自己要嵌入的帖子地址，能从中取出帖子 ID。",
]
outcomes = [
  "从帖子地址取出 ID，写出能被构建的 `instagram` 调用；",
  "在 `public/` 里核对它生成的 `blockquote.instagram-media` 与 `embed.js`；",
  "按需用 `[privacy.instagram]` 的 `disable` / `simple` 控制是否允许这条嵌入。",
]
next = ["/shortcodes/x/", "/shortcodes/vimeo/"]

+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `instagram` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

## 这一页解决什么问题

在文章里引用一条 Instagram 帖子，官方做法是复制它的嵌入代码：一段结构复杂的 `blockquote` 加一个 `<script async src="…/embed.js">`。这段代码又长又不好维护，而且把第三方脚本散落在正文各处。

`instagram` 短代码把这段模板收进 Hugo：你只写帖子 ID，构建时由短代码生成那套 `blockquote` + 脚本。**代价是页面从此依赖 Instagram 的域名**——访问者的浏览器会去拉 `instagram.com` 的脚本，所以是否允许由隐私配置决定。

`instagram` 短代码在正文中嵌入一条 Instagram 帖子。它不接受内部内容，只接受一个位置参数，即帖子地址中的 ID。

## 示例

要展示地址为 `https://www.instagram.com/p/CxOWiQNP2MO/` 的帖子，只需在 Markdown 中写入帖子 ID：

```md {file="content/example.md"}
{{</* instagram CxOWiQNP2MO */>}}
```

渲染时会由 Instagram 提供的脚本把帖子内容插入页面。

**你应当看到什么**：产物 `public/example/index.html` 里，调用位置变成一大段 `<blockquote class="instagram-media" …>…</blockquote>`，其后紧跟一行：

```html
<script async src="https://www.instagram.com/embed.js"></script>
```

在浏览器里打开这一页时，是这段脚本把 `blockquote` 换成真正的帖子卡片。**构建时不会访问 Instagram**，所以断网也能构建成功；只有访客打开页面时才会请求 Instagram。

### 本站实际渲染效果

下面这个框就是 `instagram` 短代码在本站构建时生成的**原始产物**：一个 `blockquote`，`data-instgrm-permalink` 指向那条帖子，其后跟着那段 `embed.js`。

{{< demo label="只给帖子 ID：CxOWiQNP2MO" >}}
{{< instagram CxOWiQNP2MO >}}
{{< /demo >}}

> [!NOTE]
> 你看到的**不是**加载完成后的帖子卡片，而是 Hugo 生成的 HTML（以及随后的 `embed.js`）：本站在这一页与上游文档站一样，把脚本交给读者浏览器去执行。如果浏览器访问不到 `instagram.com`（离线、被网络策略拦截），这里就会停在上面这种占位卡片上；**构建过程本身不访问 Instagram**，断网也能构建成功。

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `id` | `string` | Instagram 帖子的 ID，即帖子地址 `https://www.instagram.com/p/<ID>/` 中 `p` 之后的那一段。作为第一个位置参数传入，不能与其他参数混用。 |

该短代码不使用命名参数，示例中的 `CxOWiQNP2MO` 就是帖子 ID。

> [!WARNING]
> **实测（Hugo 0.167）**：写成命名参数 `{{</* instagram id="CxOWiQNP2MO" */>}}` 会直接让**构建失败**：
>
> ```text
> ERROR The "instagram" shortcode requires a single positional parameter, the ID of the Instagram post.
> ```
>
> 这与别的短代码（如 `vimeo`、`youtube` 的 `id=` 任意）不一样，照抄时容易踩。

### 怎么取帖子 ID

帖子地址形如 `https://www.instagram.com/p/CxOWiQNP2MO/`，取 `p/` 与结尾 `/` 之间的那一段：

```text
https://www.instagram.com/p/CxOWiQNP2MO/
                            └────┬────┘
                              帖子的 ID
```

- 地址末尾有没有 `/` 都不影响；
- 不要连 `p/` 一起抄进去；
- 短代码只认 ID，**不要**把完整地址填进去。

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

**实测（Hugo 0.167）**：`disable = true` 时，短代码在产物里**什么都不输出**（连 `blockquote` 都没有），构建不报错也不警告。所以「页面上突然少了这个嵌入」的第一嫌疑人就是这个开关。

## 什么时候用，什么时候别用

**该用**：

- 内容确实以 Instagram 帖子为主题（活动报道、作品展示）；
- 你接受访客的浏览器加载 Instagram 的脚本。

**别用**：

- 只想放一张图 → 把图片存进自己的站点，用 [figure](/shortcodes/figure/) 或 Markdown 图片，不引入第三方脚本；
- 站点有严格的隐私要求、或需要**离线**可用的产物 → 设 `disable = true`，或者用 `simple = true`（静态卡片，但图片仍来自 Instagram）；
- 帖子可能被删除 → 第三方嵌入迟早会失效，重要内容建议自己留存截图或副本。

## 验证方法

1. 在内容里写一次调用：

   ```md {file="content/example.md"}
   {{</* instagram CxOWiQNP2MO */>}}
   ```

2. 构建：

   ```bash
   hugo
   ```

3. 打开 `public/example/index.html`，搜索 `instagram-media` 与 `embed.js`。

**你应当看到什么**：

- `<blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/CxOWiQNP2MO" …>`；
- 结尾处一行 `<script async src="https://www.instagram.com/embed.js"></script>`。

- 只搜到短代码的调用原文 → 定界符被转义了；
- 什么都没搜到 → 检查 `[privacy.instagram] disable` 是不是 `true`；
- HTML 有了但浏览器里只显示一个灰色占位块 → 正常，等脚本加载完成，或检查网络是否能访问 Instagram。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 报错看不懂 | `requires a single positional parameter` | 用了命名参数 `id="…"` | 直接写 `{{</* instagram 帖子ID */>}}` |
| 没报错但结果不对 | 产物里完全没有嵌入内容 | `[privacy.instagram] disable = true` | 改成 `false`，或接受现状并换成本地图片 |
| 没报错但结果不对 | 浏览器里显示空白占位 | 访客网络访问不到 `instagram.com`，或帖子已删除/非公开 | 这是第三方内容固有的不确定性，重要内容请自留副本 |
| 没报错但结果不对 | 页面上直接显示了短代码的调用原文 | 把文档里的转义写法抄进了正文 | 删掉 `/*` 与 `*/` |
| 报错看不懂 | `failed to extract shortcode: template for shortcode "instagram" not found` | `layouts/_shortcodes/` 下有同名文件但内容有误 | 删掉自定义文件即恢复内置版本 |

更多排查入口见[故障排查](/troubleshooting/)。

[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/instagram.html
