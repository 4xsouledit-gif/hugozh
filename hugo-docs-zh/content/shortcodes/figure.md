+++
title = "figure"
linkTitle = "figure"
description = "用 figure 短代码在内容中插入 HTML figure 元素与图注：完整参数表、可复制的调用、实测输出与配错时的排查表。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/shortcodes/figure/"

[params.teach]
difficulty = "入门"
time = "10 分钟"
prereq = [
  "站点能构建成功（`hugo --renderToMemory` 退出码为 0），并且你有一张可用的图片。",
  "知道图片放在哪里：页面资源与页面包放在 `content/`，全局资源放在 `assets/`。",
]
outcomes = [
  "写出一个带 `alt`、`caption`、`width`/`height`、`loading` 的 `figure` 调用；",
  "在 `public/` 里核对它渲染出的 `<figure>` / `<figcaption>` 结构，而不是只看浏览器；",
  "判断图片为什么没显示（路径没解析到、位置放错），并按本页排查表定位。",
]
next = ["/shortcodes/highlight/", "/content-management/image-processing/"]

+++

> [!NOTE]
> 若要覆盖 Hugo 内置的 `figure` 短代码，请把[源代码][]复制到 `layouts/_shortcodes` 目录下同名文件中。

## 这一页解决什么问题

Markdown 原生的插图语法只有 `![alt](src "title")` 三个位置，没有图注、没有固定尺寸、没有「点图片跳转」的写法。`figure` 短代码补上这些：它把插图渲染成标准的 HTML `figure` 元素，`alt` 走无障碍、`caption` 与 `attr` 走图注、`link` 让整张图可点击、`width` / `height` / `loading` 控制版式与加载。

它也是**最常被调用的内置短代码**，值得先在这里把两件事弄清楚：调用怎么写，以及图片路径是按什么规则解析的。

## 示例

正文里这样写（`class` 是可选的，加上它便于用 CSS 统一控制版式）：

```md {file="content/example.md"}
{{</* figure
  src="/images/examples/zion-national-park.jpg"
  alt="A photograph of Zion National Park"
  link="https://www.nps.gov/zion/index.htm"
  caption="Zion National Park"
  class="ma0 w-75"
*/>}}
```

Hugo 渲染出这样的 HTML：

```html
<figure class="ma0 w-75">
  <a href="https://www.nps.gov/zion/index.htm">
    <img
      src="/images/examples/zion-national-park.jpg"
      alt="A photograph of Zion National Park"
    >
  </a>
  <figcaption>
    <p>Zion National Park</p>
  </figcaption>
</figure>
```

**你应当看到什么**：产物 `public/example/index.html` 里，调用所在的位置变成了上面这段结构——`<figure>` 里先是 `<img>`（本例外面多一层 `<a>`，因为给了 `link`），后面是 `<figcaption>`。调用原文一个字都不应残留。

只给 `src` 和 `alt` 时，输出会精简成：

```html
<figure><img src="/images/k.jpg"
			alt="A kitten">
</figure>
```

## 参数

`src`
: （`string`）`img` 元素的 `src` 属性。取值通常是页面资源（page resource）或全局资源（global resource）。

`alt`
: （`string`）`img` 元素的 `alt` 属性。

`width`
: （`int`）`img` 元素的 `width` 属性。

`height`
: （`int`）`img` 元素的 `height` 属性。

`loading`
: （`string`）`img` 元素的 `loading` 属性。想要图片延迟加载就在调用里写 `loading="lazy"`。

`class`
: （`string`）`figure` 元素的 `class` 属性。

`link`
: （`string`）包裹 `img` 元素的锚点元素的 `href` 属性。给出它，整张图就变成可点击的链接。

`target`
: （`string`）包裹 `img` 元素的锚点元素的 `target` 属性。常与 `link` 一起用（例如 `target="_blank"`）。

`rel`
: （`rel`）包裹 `img` 元素的锚点元素的 `rel` 属性。常与 `target="_blank"` 一起用。

`title`
: （`string`）在 `figurecaption` 元素内位于顶部，包裹在 `h4` 元素中。

`caption`
: （`string`）在 `figurecaption` 元素内位于底部，可以包含纯文本或 Markdown。

`attr`
: （`string`）在 `figurecaption` 元素内出现在图注旁边，可以包含纯文本或 Markdown。通常写图片来源或作者署名。

`attrlink`
: （`string`）包裹署名文字的锚点元素的 `href` 属性。与 `attr` 配合使用。

### 参数怎么影响输出（实测）

下表是逐项实测（Hugo 0.167）。记法是：**只有 `caption` 或 `attr` 存在时才会出现 `<figcaption>`**，`title` 与 `attr` 都在其中，`title` 在上（`<h4>`）、`caption` 与 `attr` 在下。

| 调用里给的东西 | 输出的变化 |
| --- | --- |
| `src` + `alt` | `<figure><img src="…" alt="…"></figure>`，没有 `figcaption` |
| 再加 `width=640 height=480` | `<img … width="640" height="480">`，顺序在 `alt` 之后 |
| 再加 `loading="lazy"` | `<img … loading="lazy">` |
| 再加 `caption="C"` | 追加 `<figcaption><p>C</p></figcaption>` |
| 再加 `title="T"` | `figcaption` 内**顶部**多出 `<h4>T</h4>` |
| 再加 `attr="Photo: Jane"` | `attr` 接在 `caption` 后面，同一个 `<p>` 里 |
| 再加 `attrlink="…"` | `attr` 的文字被 `<a href="…">` 包住 |
| 再加 `link="…"` | `<img>` 被 `<a href="…">` 包住，锚点里可以再加 `target` / `rel` |
| 再加 `class="ma0 w-75"` | `<figure class="ma0 w-75">` |

> [!WARNING]
> **实测发现**：同时给 `caption` 与 `attr` 时，两者是**直接拼接**的，中间没有空格，也不换行——输出形如 `<p>Zion National ParkPhoto: Jane</p>`。要分开就自己在 `caption` 末尾留空格或标点，例如 `caption="Zion National Park — "`。

## 图片位置

`figure` 短代码解析内部 Markdown 目标地址时，先查找匹配的页面资源（page resource），找不到时回退到匹配的全局资源（global resource）。远程地址原样传递，无法解析目标地址时不会抛出错误或警告。

**这后半句是本页最容易踩的地方**：路径写错**不会报错**，只会渲染出一个 `src` 原样照抄的 `<img>`，页面上表现为「图裂了」或「什么都没有」。

全局资源必须放在 `assets` 目录。如果资源已经放在 `static` 目录，且不便或不愿迁移，就需要在项目配置中把该目录挂载到 `assets` 目录，即同时加入下面两段配置：

```toml
[[module.mounts]]
source = 'assets'
target = 'assets'

[[module.mounts]]
source = 'static'
target = 'assets'
```

## 什么时候用，什么时候别用

**该用**：

- 需要图注（`caption`）或署名（`attr`）——这是 Markdown 图片语法做不到的；
- 需要固定 `width` / `height`，避免图片加载完成后页面跳动；
- 需要整张图可点击（`link` + `target` + `rel`）；
- 需要延迟加载（`loading="lazy"`）。

**别用**：

- 只想要一张普通插图、不需要图注 → 直接用 Markdown 的 `![alt](src)` 更短；
- 想要 **缩放、裁剪、转格式** → 那是[图像处理](/content-management/image-processing/)的工作，`figure` 只负责把 `src` 写进 HTML，不会处理图片本身；
- 想让图片自适应容器宽度 → 那是 CSS 的事（`img { max-width: 100% }`）。

## 验证方法

1. 在内容文件里写一次调用（把图片名换成你自己的）：

   ```md {file="content/example.md"}
   {{</* figure src="/images/kitten.jpg" alt="一只白猫" caption="白猫" width=640 height=480 loading="lazy" */>}}
   ```

2. 构建：

   ```bash
   hugo
   ```

3. 打开 `public/example/index.html`，搜索 `kitten.jpg`。

**你应当看到什么**：`<figure>` 里有 `<img src="/images/kitten.jpg" alt="一只白猫" width="640" height="480" loading="lazy">`，紧跟 `<figcaption><p>白猫</p></figcaption>`。

- 如果只搜到一段没展开的短代码调用原文，说明你多写了转义标记 `/*` `*/`；
- 如果 `src` 是空字符串 `src=""`，说明参数没被识别（见排查表第一行）；
- 如果页面上图片打不开但 HTML 看起来正确，问题在图片路径或文件位置，不在短代码。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 输出里 `src=""`，整段参数像是没生效 | **`figure` 只接受命名参数**；写成 `{{</* figure "/images/a.jpg" "alt" */>}}` 时位置参数会被忽略 | 改成 `src="/images/a.jpg" alt="…"` 的命名写法 |
| 没报错但结果不对 | 图裂了，浏览器提示找不到文件 | 路径没解析到资源，又因为不报错而被忽略 | 页面资源放进对应页面包（叶子包目录），全局资源放进 `assets/`；必要时把 `static/` 挂载到 `assets/`（见「图片位置」） |
| 没报错但结果不对 | 有了 `caption` 却没有 `<figcaption>` | 参数名拼错（如 `captions=`、`Caption=`） | 键名**大小写敏感**，按本页参数表逐字核对 |
| 没报错但结果不对 | 图注与署名挤在一起 | `caption` 与 `attr` 直接拼接，中间无分隔 | 在 `caption` 结尾自带空格或标点 |
| 没报错但结果不对 | 页面上直接显示了短代码的调用原文 | 把文档里的转义写法抄进了正文 | 删掉 `/*` 与 `*/` |
| 报错看不懂 | `failed to extract shortcode: template for shortcode "figure" not found` | 找不到名为 `figure` 的短代码模板：调用名拼成了 `fig`、`figcaption`，或者自定义的 `layouts/_shortcodes/figure.html` 路径/文件名没对上（模板内部写错报的是模板解析错误，不是这一条） | 先核对调用名与 `layouts/_shortcodes/` 下的文件名是否逐字一致；要覆盖内置版就照抄[源代码][] |
| 报错看不懂 | 构建报错指向别的页面 | 短代码占位符相关错误常被归因到其它页面 | 用 `hugo --ignoreCache` 复现，并参考[故障排查](/troubleshooting/) |

[源代码]: https://github.com/gohugoio/hugo/blob/master/tpl/tplimpl/embedded/templates/_shortcodes/figure.html
