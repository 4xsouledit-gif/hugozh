+++
title = "x"
linkTitle = "x"
description = "用 x 短代码在正文中嵌入 X 帖子：两个必需参数、构建时会联网取数据、隐私与简单模式、失败时的排查表。"
date = 2026-10-01
weight = 100
source = "https://gohugo.io/shortcodes/x/"

[params.teach]
difficulty = "进阶"
time = "10 分钟"
prereq = [
  "站点能构建成功（`hugo --renderToMemory` 退出码为 0），Hugo 版本为 0.141.0 或更高。",
  "构建机可以访问外网（本页的默认模式需要联网，见「构建时会联网」）。",
]
outcomes = [
  "从帖子地址拆出 `user` 与 `id`，写出能被构建的调用；",
  "说清默认模式与简单模式的区别，以及为什么构建会依赖网络；",
  "遇到 `unable to retrieve the remote data` 时，按本页排查表定位是网络、权限还是配置问题。",
]
next = ["/shortcodes/instagram/", "/shortcodes/vimeo/"]

+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `x` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

## 这一页解决什么问题

引用一条 X（原 Twitter）帖子，通常要贴它的嵌入代码或用官方 widget 脚本。`x` 短代码把这件事简化成两个参数：作者用户名与帖子 ID。

有一点必须在动手前知道：**这个短代码在构建时会向外请求 oEmbed 数据**。它是本节 11 个内置短代码里少数几个让构建依赖网络的一个，因此「构建机能不能出网」会直接决定它是否渲染成功。自 Hugo 0.141.0 起可用。

`x` 短代码在正文中嵌入一条 X（原 Twitter）帖子。自 Hugo 0.141.0 起可用。

## 示例

要展示地址为 `https://x.com/SanDiegoZoo/status/1453110110599868418` 的帖子，需要给出作者用户名与帖子 ID：

```md {file="content/example.md"}
{{</* x user="SanDiegoZoo" id="1453110110599868418" */>}}
```

**你应当看到什么**：构建成功后，产物 `public/example/index.html` 里出现一段源自 X oEmbed 的 `blockquote.twitter-tweet` 结构（默认模式还会自动插入一段内联 `<style>`，让引用块带上蓝边）。帖子正文由 X 返回的 HTML 决定，因此**具体文字随帖子内容变化**，不要照抄本文的示例文字。

### 构建时会联网

**实测（Hugo 0.167）**：`x` 短代码在构建时通过 `resources.GetRemote` 请求

```text
https://publish.x.com/oembed?dnt=false&omit_script=true&url=https%3A%2F%2Fx.com%2FSanDiegoZoo%2Fstatus%2F1453110110599868418
```

拿不到数据时，Hugo **只打印一条 WARNING，不中断构建**，该位置输出空内容：

```text
WARN  The "x" shortcode was unable to retrieve the remote data: … error calling GetRemote: … See "content/example.md:7:1"
```

> [!WARNING]
> 「构建成功但页面上什么都没有」是这一页最典型的失败现象。日志里的 WARNING 不显眼，而且带 `文件:行:列`——排查时先看构建日志有没有 `shortcode-x-getremote` 相关的警告，再看网络。

## 参数

| 参数名 | 类型 | 说明 |
| --- | --- | --- |
| `user` | `string` | 帖子作者的 X 用户名，即帖子地址中 `x.com/` 之后、`/status/` 之前的部分。 |
| `id` | `string` | 帖子的 ID，即帖子地址中 `/status/` 之后的部分。 |

两个参数都使用命名参数写法传入，值需加引号。

### 怎么拆地址

以 `https://x.com/SanDiegoZoo/status/1453110110599868418` 为例：

```text
https://x.com/SanDiegoZoo/status/1453110110599868418
                └────┬────┘        └────────┬────────┘
                   user                   id
```

- `user` **不要**带前导 `@`；
- `id` 是一长串数字，**不要**加引号以外的任何修饰；
- 老地址域名是 `twitter.com`，用户名与 ID 的取法相同。

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

**实测（Hugo 0.167）**：

| 配置 | 产物里的变化 |
| --- | --- |
| 默认 | 请求 `…/oembed?dnt=false&omit_script=true&…`，输出引用块 + 一段内联 `<style>` |
| `simple = true` | 请求同样的 oEmbed 接口，但输出**不含 JavaScript** 的静态版本；模板里会读取 `services.x.disableInlineCSS`，为 `true` 时不输出那段内联样式 |
| `disable = true` | 短代码**什么都不输出**，构建不报错、不警告 |

两种模式都要联网：简单模式省掉的是**访客浏览器**加载 X 脚本，不是构建时的请求。因此**断网环境里这个短代码无法使用**（会出现上面的 WARNING 与空输出）。

## 什么时候用，什么时候别用

**该用**：

- 内容确实以某条 X 帖子为主题，且你接受构建依赖外网；
- 站点有隐私要求 → 至少设 `enableDNT = true`；不想让访客加载 X 脚本 → 用 `simple = true`。

**别用**：

- **构建环境不能出网**（内网 CI、离线打包）→ 这个短代码会静默输出空内容，改用截图 + [figure](/shortcodes/figure/)；
- 只想引用一句话 → 直接抄文字并给出链接，不引入第三方请求；
- 帖子可能被删除或账号转私密 → 第三方嵌入迟早失效，重要内容请自留副本；
- 需要**稳定的产物**（同一份源码每次构建输出完全一致）→ 外部接口返回的内容会变，做不到。

## 验证方法

1. 在内容里写一次调用：

   ```md
   {{</* x user="SanDiegoZoo" id="1453110110599868418" */>}}
   ```

2. 构建，**同时留意日志**：

   ```bash
   hugo
   ```

3. 打开 `public/example/index.html`，搜索 `twitter-tweet` 或帖子 ID。

**你应当看到什么**：

- 成功：产物里有 `blockquote.twitter-tweet` 与指向 `https://x.com/…/status/1453110110599868418` 的链接；
- 失败（最常见）：产物里该位置为空，构建日志里出现 `The "x" shortcode was unable to retrieve the remote data`。

排查顺序建议是：**先看日志有没有 WARNING → 再用浏览器直接打开那个 oEmbed 地址看能不能访问 → 最后才怀疑参数**。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 构建成功，页面上什么都没有 | 构建机访问不到 `publish.x.com`，短代码只发 WARNING 并输出空内容 | 看构建日志确认；给构建环境放行网络，或改用截图 |
| 没报错但结果不对 | 产物里完全没有内容，且日志干净 | `[privacy.x] disable = true` | 改成 `false` |
| 没报错但结果不对 | 帖子结构与样式都变了 | oEmbed 返回的 HTML 由 X 决定，不受 Hugo 控制 | 接受它，或改用 `simple` + `disableInlineCSS` 自行控制样式 |
| 报错看不懂 | `unable to retrieve the remote data` | 网络不可达、代理未配置、或构建环境有出网限制 | 先解决网络；CI 环境可考虑把结果缓存或改用静态替代方案 |
| 没报错但结果不对 | 页面上直接显示了短代码的调用原文 | 把文档里的转义写法抄进了正文 | 删掉 `/*` 与 `*/` |
| 报错看不懂 | `failed to extract shortcode: template for shortcode "x" not found` | Hugo 版本低于 0.141.0，或 `layouts/_shortcodes/` 下的自定义文件有误 | 升级 Hugo；删掉自定义文件即恢复内置版本 |

更多排查入口见[故障排查](/troubleshooting/)。

[这个文件]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/x_simple.html
[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/x.html
