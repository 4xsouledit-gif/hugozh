+++
title = "短代码"
linkTitle = "短代码"
description = "Hugo 内置短代码总览：标准记法与 Markdown 记法的渲染顺序差异、参数规则、12 个内置短代码的参数与输出，示例可直接复制到自己的站点。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/shortcodes/"
aliases = ["/content-management/shortcodes/"]

[params.teach]
difficulty = "入门"
time = "15–20 分钟"
prereq = [
  "站点能构建成功：在项目根目录执行 `hugo --renderToMemory`，退出码为 0。",
  "内容文件用的是 Markdown，知道前置元数据（front matter）写在哪。",
  "能打开构建产物目录 `public/`，愿意用搜索（`Ctrl+F`）核对输出，而不是只看浏览器。",
]
outcomes = [
  "说清 `{{</* */>}}` 与 `{{%/* */%}}` 的区别：谁先执行、内部内容会被怎么处理；",
  "按「这个短代码要不要处理内部 Markdown」在两种记法之间做出选择，而不是凭手感；",
  "照着本节的 12 页抄一个调用到自己站点，并在 `public/` 里核对它渲染成什么；",
  "遇到「命令找不到 / 没报错但结果不对 / 报错看不懂」时，先查本页的常见坑表，再进[故障排查](/troubleshooting/)。",
]
next = ["/shortcodes/figure/", "/shortcodes/highlight/", "/templates/shortcode/"]

+++

## 这一页解决什么问题

短代码（shortcode）是**可以在 Markdown 正文里调用的一段模板**。作者写一行调用，Hugo 在构建时把它展开成 HTML：插图与图注、带语法高亮的代码、指向站内页面的链接、参数值、二维码、社交平台嵌入，都是这么来的。

这一页是本章的总入口，解决三件具体的事：

1. **写法选择**——`{{</* */>}}` 和 `{{%/* */%}}` 到底差在哪，选错了会出现「Markdown 没生效」或「Markdown 被渲染了两遍」；
2. **参数规则**——命名参数与位置参数怎么用、引号什么时候必须加；
3. **去哪查**——`figure`、`highlight`、`ref`、`relref`、`param`、`details`、`qr`、`instagram`、`vimeo`、`x`、`youtube` 十一页，各自给出参数表与**可复制的调用 + 预期输出**。

> [!NOTE]
> 本节所有示例都按「**复制到自己站点就能跑**」的标准写。唯一要动手改的是**转义标记**：文档里展示语法时写作 `{{</* name */>}}`，你抄进正文时要删掉 `/*` 与 `*/`，只保留尖括号定界符的那一对，得到真正的调用形式。

## 短代码从哪来

短代码分三类，**调用写法完全一致**，区别只在实现放在哪：

| 类型 | 来源 | 你要做的事 |
| --- | --- | --- |
| 内置短代码（embedded shortcode） | 随 Hugo 发布 | 什么都不用建，直接调用；本节 11 页都是这一类 |
| 自定义短代码 | 站点作者写模板 | 在 `layouts/_shortcodes/` 下建 `<名字>.html` |
| 内联短代码 | 模板直接写在内容文件里 | 短代码名以 `.inline` 结尾 |

自定义模板放在 `layouts/_shortcodes/` 目录，**文件名（去掉扩展名）就是短代码名**。模板本身是普通模板，可以读参数、访问页面与站点数据，也可以调用局部模板（partial）；创建自己的短代码时注意，同名模板会**覆盖内置短代码**。完整的模板写法、参数读取与错误处理见[短代码模板](/templates/shortcode/)。

## 两种记法：标准写法与 Markdown 写法

调用短代码时用一对定界符包裹短代码名，定界符决定了**短代码展开与 Markdown 渲染的先后顺序**：

| 写法 | 示例 | 处理时机 | 短代码的**输出**会怎样 |
| --- | --- | --- | --- |
| 标准写法（standard notation） | `{{</* name */>}}` | 在 Markdown 渲染**之后**执行 | 直接落进页面，不再经过 Markdown |
| Markdown 写法（Markdown notation） | `{{%/* name */%}}` | 在 Markdown 渲染**之前**执行 | 会被 Markdown 渲染器**再处理一遍** |

> [!IMPORTANT]
> **实测更正（Hugo 0.167.0，Windows，最小站点）**：很多资料（本站此前也这么写）把这条差别说成「Markdown 记法下 `.Inner` 是**已渲染**的 HTML」。实测**不成立**：两种记法下 `.Inner` 拿到的都是**未渲染的原文**——把 `.Inner` 包进 `<pre>` 打印出来，两种记法显示的都是 `We design the **best** widgets in the world.`。
>
> 真正的差别在**输出**上：Markdown 记法下，短代码输出之后还会再经过一遍 Markdown 渲染器，于是「把 `.Inner` 原样输出」的模板看起来就像内部 Markdown 被渲染了；标准记法下输出直接落进页面，内部 Markdown 永远是字面量。下一节「跑一遍」把两种记法的真实产物并排放着，可以自己对照。

三种情况下这一差别不会显现，用哪种记法都一样：短代码**没有内部内容**（自闭合写法）；短代码只把参数当字符串用（如 `qr`、`youtube`）；短代码模板自己会把内部内容交给 Markdown 渲染（如内置的 `details`，模板里写的是 `.Inner | .Page.RenderString`）。

### 渲染顺序

把上一节翻成执行顺序，就是下面四步（上游原文的表述是一致的：Markdown 记法的短代码在 Markdown 渲染器**之前**按文档顺序执行，标准记法在**之后**按文档顺序执行）：

```text
1. Markdown 记法（`%` 定界符）调用的短代码，按在文档中出现的顺序执行
2. Markdown 渲染器运行
3. 标准记法（尖括号定界符）调用的短代码，按在文档中出现的顺序执行
4. 短代码嵌套时由内向外：子级先渲染，父级拿到的是子级渲染好的结果
```

**实测（Hugo 0.167）**：由此可以直接推出一个反直觉的现象——**文档里靠前、但用标准写法调用的短代码，仍然晚于靠后、用 Markdown 写法调用的短代码执行**。也就是说，这不是「从上到下依次执行」，不能靠调换位置来安排先后。

### 跑一遍：同一段内容，两种记法

下面这个最小的自定义短代码只在内容外面套一个 `div`，正好用来观察内部内容被处理成了什么。复制到自己的站点：

```go-html-template {file="layouts/_shortcodes/wrap.html"}
<div class="wrap">
{{ .Inner }}
</div>
```

内容文件里两种记法各调用一次：

```md {file="content/example.md"}
{{%/* wrap */%}}
### 小标题

这是 **粗体** 文本。
{{%/* /wrap */%}}

{{</* wrap */>}}
### 小标题

这是 **粗体** 文本。
{{</* /wrap */>}}
```

**你应当看到什么**（实测输出，Hugo 0.167；为便于对照做了缩排）：

```html
<div class="wrap">
<h3 id="小标题">小标题</h3>
<p>这是 <strong>粗体</strong> 文本。</p>
</div>

<div class="wrap">

### 小标题

这是 **粗体** 文本。

</div>
```

同一个模板、同一段内容，只换了记法：上面是标题与粗体都成了 HTML，下面是**原样的 Markdown 字符**。原因就是顺序——Markdown 记法下内部内容先过 Markdown 渲染器，标准记法下 `.Inner` 原样交给模板，没人再帮它渲染。

#### 本站把这段跑了一遍（真实产物）

本站主题里就有这个 `wrap` 短代码（`themes/hugo-docs-theme/layouts/_shortcodes/wrap.html`，模板与上面一字不差，只用于本页教学），所以下面两段可以**照着上面的写法真实调用出来**，而不是只给代码块里的示意：

Markdown 记法——内部内容会过一遍 Markdown 渲染器：

{{% wrap %}}
### 小标题

这是 **粗体** 文本。
{{% /wrap %}}

标准记法——内部内容原样输出，星号还是星号：

{{< wrap >}}
### 小标题

这是 **粗体** 文本。
{{< /wrap >}}

对照上文「你应当看到什么」里的产物，两段完全一致：**Markdown 记法那一段产出的是真正的 `<h3>` 元素**，标准记法那一段的 `### 小标题` 只是四个字符——查看页面源代码即可确认。

**实测（Hugo 0.167.0，最小站点）**：真正的标题会进 `.TableOfContents`——把这两段放进一个内容页，右栏目录里只出现 Markdown 记法那一个标题，标准记法那个进不去。本章这一页是**章节首页**，本站模板不给章节首页渲染右栏目录（`partials/toc.html` 判的是 `.IsPage`），所以这里看不到目录上的差别；换到 `figure`、`details` 这类内容页就能看到。

> [!TIP]
> **怎么选**：短代码要处理内部 Markdown（标题、粗体、列表、链接），就用 Markdown 记法 `{{%/* */%}}`；内部是纯文本、代码或已经写好的 HTML，两种都行，用标准记法 `{{</* */>}}` 更符合直觉。**不要**在标准记法下同时给模板加 `RenderString` 又用 Markdown 记法调用，那会把内容渲染两遍。

### 另一个可观察的差别

**实测**：短代码单独占一行、输出是一个完整 URL 时，Markdown 记法的结果会被 Markdown 渲染器包成链接，标准记法不会：

```md
{{</* ref "/books/book-1" */>}}   → https://example.org/books/book-1/（纯文本）
{{%/* ref "/books/book-1" */%}}   → <a href="https://example.org/books/book-1/">https://example.org/books/book-1/</a>
```

原因是标准记法的输出绕过了 Markdown 渲染器，而自动链接（autolink）是 Markdown 渲染器的事。想把短代码的输出当链接、当图片地址用时，要选 Markdown 记法。

## 参数规则

参数分两类，**一次调用中不得混用**：

| 类型 | 写法 | 例 |
| --- | --- | --- |
| 位置参数 | 按书写顺序传入，模板用 `.Get 0`、`.Get 1` 按下标取 | `{{</* vimeo 19899678 */>}}` |
| 命名参数 | `key=value`，键名**大小写敏感** | `{{</* qr text="https://gohugo.io" */>}}` |

几条容易踩的规则：

- 值里含空格（或含 `=`）时**必须加引号**：`caption="Zion National Park"`；不加引号会解析出错或截断。
- 可接受的类型是字符串、整数、浮点数与布尔值。`open=true` 是布尔真，`open="true"` 是字符串。
- 位置参数越界时 `.Get` 返回空值而**不报错**，模板会安静地渲染出缺参数的 HTML；所以抄示例时不要把参数顺序记错。
- 每个内置短代码接受的参数形式不同：有的只收位置参数（`instagram`），有的只收命名参数（`figure`、`qr` 的 `text`），有的两种都收（`highlight`、`vimeo`、`youtube`、`x`）。**以各页的参数表为准**。

## 模板中可用的上下文

自定义或内联短代码模板里，可以这样读调用信息（方法清单见[短代码方法](/methods/shortcode/)）：

| 字段 | 作用 |
| --- | --- |
| `.Get` | 按名称或序号读取单个参数 |
| `.GetMatch` | 按模式匹配参数名并返回值 |
| `.Params` | 给出全部参数（命名参数是映射，位置参数是切片） |
| `.Inner` | 成对短代码之间的内部内容 |
| `.InnerDeindent` | 同上，但去掉共有的前导缩进 |
| `.IsNamedParams` | 判断本次调用用的是命名参数还是位置参数 |
| `.Page` | 调用该短代码的页面 |
| `.Parent` | 外层短代码的上下文（嵌套时用） |
| `.Name` / `.Ordinal` | 短代码名称 / 本次调用在页面中的序号 |
| `.Position` | 调用位置，写 `errorf`、`warnf` 时带上它，报错能直接指到行 |

除此之外，模板中同样能访问站点与页面数据、站点参数以及各类模板函数。

## 这一章的「实际渲染效果」是怎么做的

本章每一页都有一节叫「本站实际渲染效果」。里面的内容不是截图，也不只是把产物再贴一遍，而是**真的在页面上调用一次那个短代码**——图片是真的、代码是真高亮的、折叠是真能点开的、二维码是真能扫的、播放器是真能播放的。

用的也是短代码，两个，都放在主题里：

| 短代码 | 模板 | 作用 |
| --- | --- | --- |
| `demo` | `themes/hugo-docs-theme/layouts/_shortcodes/demo.html` | 画一个带标签的方框，把框内的短代码产物展示出来 |
| `wrap` | `themes/hugo-docs-theme/layouts/_shortcodes/wrap.html` | 只把内部内容包进一个 `div`，用来观察两种记法的差别（见上一节） |

调用长这样（`demo` 用标准记法，框内放真正的短代码调用）：

```md
{{</* demo label="带 caption 的 figure" */>}}
{{</* figure src="images/examples/hugo-icon.png" alt="示例" caption="图注" */>}}
{{</* /demo */>}}
```

写出来的效果就是下面这个框——**这个框本身就是 `demo` 的输出**，里面的图片是 `figure` 的真实产物：

{{< demo label="框内的短代码会先渲染，再交给 demo 展示" >}}
{{< figure src="images/examples/hugo-icon.png" alt="示例图标" caption="框内放什么，就展示什么" width=120 >}}
{{< /demo >}}

三条写作约束，都是实测踩出来的：

- **框内只放短代码调用或现成的 HTML，不放 Markdown 正文。** 理由就是上一节的实测更正：`.Inner` 在两种记法下都是原文，而框内是块级 HTML（`<div class="demo-stage">`），里面的 Markdown 会被原始 HTML 块吞掉；
- **`demo` 用标准记法调用**：框内的子短代码会先渲染、再交给 `demo`，所以嵌套是安全的；
- **要展示「Markdown 记法的效果」时不要套 `demo`**——Markdown 记法的输出还要再过一遍 Markdown 渲染器，套进 HTML 块里就失效了。上一节那两个 `wrap` 调用就是直接写在正文里的。

这也是本站对「不能只展现代码」的具体做法：文档给出的写法，读者能在同一页上看到它跑出来的样子，并且可以点、可以播、可以扫、可以折叠。

## 本节 12 页怎么读

每页的「示例」之后都有一节「本站实际渲染效果」——写法在上、真实产物在下，两段对照着看。只想快速上手的话，建议先看 `figure` 与 `highlight`（最常用的两个），再看 `ref` / `relref`（会牵涉上面的记法问题），最后看 `param` 与四个社交嵌入页。

另外：`x` 一页是唯一**没有**活例的——它构建时要联网，与本站「断网可构建」的约定冲突，该页写明了原因与实测证据。

| 页 | 什么时候翻它 |
| --- | --- |
| [figure](/shortcodes/figure/) | 要插图并加图注、宽度、链接、署名 |
| [highlight](/shortcodes/highlight/) | 要给一段代码加高亮选项，或给**行内**代码加高亮 |
| [ref](/shortcodes/ref/) | 要在正文里生成指向站内页面的**绝对**地址 |
| [relref](/shortcodes/relref/) | 同上，但要的是**站内相对**地址 |
| [param](/shortcodes/param/) | 要把前置元数据或站点参数里的值写进正文 |
| [details](/shortcodes/details/) | 要折叠一段次要内容，读者点击才展开 |
| [qr](/shortcodes/qr/) | 要把网址、电话、vCard 变成二维码图片 |
| [instagram](/shortcodes/instagram/) | 要嵌入 Instagram 帖子 |
| [vimeo](/shortcodes/vimeo/) | 要嵌入 Vimeo 视频 |
| [x](/shortcodes/x/) | 要嵌入 X（原 Twitter）帖子 |
| [youtube](/shortcodes/youtube/) | 要嵌入 YouTube 视频，可指定起止秒数 |

只想快速上手的话，建议先看 `figure` 与 `highlight`（最常用的两个），再看 `ref` / `relref`（会牵涉上面的记法问题），最后看 `param` 与四个社交嵌入页。

## 怎么验证短代码真的生效

短代码是**构建时**展开的，所以判断依据只有一个：构建产物。

1. 在内容文件里写一次调用，例如：

   ```md {file="content/example.md"}
   正文一句。{{</* figure src="/images/kitten.jpg" alt="一只猫" caption="图注" */>}}
   ```

2. 打开**普通构建**（不是 `--renderToMemory`，那个不写盘）：

   ```bash
   hugo
   ```

3. 打开产物 `public/example/index.html`，搜索 `figure`、`kitten.jpg` 或你写的参数值。

**你应当看到什么**：调用所在的位置出现了展开后的 HTML（`figure` 那行应出现一个 `<figure>` 元素），而调用用的两个花括号加尖括号（`{` `{` `<`）**不再存在**。如果产物里还能搜到调用原文，说明定界符被转义了（多写了 `/*` `*/`），或者这段内容根本没被当作 Markdown 渲染。

## 常见坑

| 类别 | 现象 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH` | 见[安装 Hugo](/installation/) |
| 报错看不懂 | `failed to extract shortcode: template for shortcode "…" not found`，**整站构建失败** | 该名字既不是内置短代码，站点里也没有对应模板 | 对照本文「短代码从哪来」与[短代码模板](/templates/shortcode/)的目录结构、查找顺序 |
| 报错看不懂 | 报同样的错，但你写的是内置短代码 | 正文里出现了**未转义**的短代码定界符——写文档、写教程时展示语法必须写成 `{{</* name */>}}` | 给要展示的调用加上 `/*` 与 `*/`；围栏代码块与行内代码也不例外 |
| 报错看不懂 | `shortcode "qr" must be closed or self-closed` | 有内部内容的短代码要用 `{{</* name */>}}…{{</* /name */>}}` 成对闭合；无内部内容的要自闭合 `{{</* name /*/>}}` | 对照该页示例的写法 |
| 没报错但结果不对 | 内部内容的 Markdown 原样显示成 `**粗体**`、`### 标题` | 用了标准记法，`.Inner` 是未渲染文本，而模板没做 `RenderString` | 改用 Markdown 记法调用，或在模板里 `{{ .Inner \| .Page.RenderString }}`；见本文「跑一遍」 |
| 没报错但结果不对 | 页面上直接显示了 `{{</* figure */>}}` 这串字符 | 把文档里的**转义写法**抄进了正文 | 删掉 `/*` 与 `*/` |
| 没报错但结果不对 | 短代码渲染了，但参数像是没传进去 | 命名参数与位置参数混用、键名大小写写错、值含空格却没加引号 | 见本文「参数规则」与各页参数表 |
| 没报错但结果不对 | 构建成功，但产物里搜不到展开后的 HTML | 用了 `hugo --renderToMemory`（不写盘），或看错了页面路径 | 用普通 `hugo` 构建，再到 `public/` 下按内容文件的路径找 `index.html` |

更多排查入口见[故障排查](/troubleshooting/)。
