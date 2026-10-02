+++
title = "短代码模板"
linkTitle = "短代码模板"
description = "创建自定义短代码模板：位置与命名、参数读取、错误处理、嵌套与渲染顺序，每步都带可核对的输出。"
date = 2026-10-01
weight = 130
source = "https://gohugo.io/templates/shortcode/"

[params.teach]
difficulty = "进阶"
time = "40–60 分钟"
prereq = [
  "读过[短代码](/shortcodes/)，知道作者在 Markdown 里怎么调用它。",
  "知道 `layouts/_shortcodes` 的位置与局部模板的写法（见[内容类型](/templates/types/)）。",
]
outcomes = [
  "写出一个带参数、带默认值与错误处理的短代码模板，并在页面里调用它；",
  "用 `.Inner` / `.InnerDeindent` 处理成对短代码之间的内容，并说清何时需要 `RenderString`；",
  "用 `.Parent` 实现嵌套短代码的继承关系；",
  "遇到「短代码没执行」或「构建失败」时，能分辨是命名、参数还是转义写法的问题。",
]
next = ["/templates/types/", "/shortcodes/", "/methods/shortcode/"]

+++

> [!NOTE]
> Hugo 在 v0.146.0 中重写了模板系统：短代码模板目录由 `layouts/shortcodes` 更名为 `layouts/_shortcodes`。旧项目升级时注意改名。

> [!NOTE]
> 创建自定义短代码之前，请先阅读[短代码](/shortcodes/)。理解用法细节有助于设计出更好的模板。

## 这一页解决什么问题

内容作者在 Markdown 里能直接用的只有 Markdown 语法，遇到音频播放器、画廊、图表、需要复用的一整块结构时就不够了。短代码（shortcode）补上这一层：作者写一行 `{{</* 名字 参数 */>}}`，你在模板里决定它渲染成什么 HTML。

这一页覆盖从「创建一个能跑的短代码」到「处理参数、错误与嵌套」的完整路径。核心原则只有一条：**短代码模板的上下文是短代码本身，不是页面**；页面要通过 `.Page` 取。

## 简介

Hugo 为许多常见任务提供了内置短代码，但更专门的需求往往需要自己编写。常见的自定义短代码包括音频播放器、视频播放器、图片画廊、图表、地图、表格，以及各种自定义元素。

**什么时候别自己写**：如果内置短代码（如 `figure`、`highlight`、`youtube`）已经能满足需求，直接用；自定义一个同名短代码会**覆盖内置的那个**，升级 Hugo 时行为可能变化，而你的站点不会收到任何提示。

## 目录结构

短代码模板创建在 `layouts/_shortcodes` 目录中，可以放在该目录根部，也可以组织成子目录：

```tree
layouts/
└── _shortcodes/
    ├── diagrams/
    │   ├── kroki.html
    │   └── plotly.html
    ├── media/
    │   ├── audio.html
    │   ├── gallery.html
    │   └── video.html
    ├── capture.html
    ├── column.html
    ├── include.html
    └── row.html
```

在内容中调用子目录里的短代码时，写出它相对于 `_shortcodes` 目录的路径，并省略文件扩展名：

```md
{{</* media/audio path=/audio/podcast/episode-42.mp3 */>}}
```

## 查找顺序

Hugo 依据短代码名称、当前输出格式与当前语言来选择模板。下例按具体程度从高到低排列，最笼统的排在最后：

| 短代码名 | 输出格式 | 语言 | 模板路径 |
| --- | --- | --- | --- |
| foo | html | en | `layouts/_shortcodes/foo.en.html` |
| foo | html | en | `layouts/_shortcodes/foo.html.html` |
| foo | html | en | `layouts/_shortcodes/foo.html` |
| foo | html | en | `layouts/_shortcodes/foo.html.en.html` |

输出格式为 `rss` 时同理：

| 短代码名 | 输出格式 | 语言 | 模板路径 |
| --- | --- | --- | --- |
| foo | rss | en | `layouts/_shortcodes/foo.en.rss.xml` |
| foo | rss | en | `layouts/_shortcodes/foo.rss.xml` |
| foo | rss | en | `layouts/_shortcodes/foo.en.xml` |
| foo | rss | en | `layouts/_shortcodes/foo.xml` |

也就是说，从 `foo.en.rss.xml` 依次退到 `foo.rss.xml`、`foo.en.xml`，最后是 `foo.xml`。**同名的项目模板优先于主题模板、也优先于内置短代码**。

## 常用方法

短代码模板中有若干方法可用，`layouts/_shortcodes` 下各方法的作用如下：

| 方法 | 作用 |
| --- | --- |
| `.Get` | 按名称或序号读取单个参数。 |
| `.GetMatch` | 按模式匹配参数名并返回值。 |
| `.Params` | 以映射或切片的形式给出全部参数。 |
| `.IsNamedParams` | 判断本次调用使用的是命名参数还是位置参数。 |
| `.Inner` | 返回成对短代码之间的内容。 |
| `.InnerDeindent` | 返回去掉公共前导缩进后的内部内容。 |
| `.Parent` | 返回父级短代码的上下文，用于嵌套。 |
| `.Name` | 返回短代码名称，常用于错误信息。 |
| `.Position` | 返回短代码在内容文件中的位置，常用于错误信息。 |
| `.Page` | 返回调用该短代码的页面对象。 |

方法清单与签名详见[短代码方法](/methods/shortcode/)。

## 示例

下面的示例由浅入深，部分为便于理解做了简化。

### 插入年份

创建一个插入当前年份的短代码：

```go-html-template {file="layouts/_shortcodes/year.html"}
{{- now.Format "2006" -}}
```

然后在内容中调用它：

```md {file="content/example.md"}
This is {{</* year */>}}, and look at how far we've come.
```

这个短代码既可以行内使用，也可以独占一行作为块使用。若可能被行内调用，请用带连字符的动作定界符去掉两侧的空白。

**结果长什么样**：`public/example/index.html` 里应当出现

```html
<p>This is 2026, and look at how far we've come.</p>
```

如果输出变成了 `This is 2026 , and …`（数字与逗号之间多了空格），说明两侧的空白没处理干净——回到模板确认是否写成了 `{{- … -}}`。`2006` 是 Go 的时间格式参考值，表示「四位年份」，不是字面输出。

### 插入图片

假设 `content/example/index.md` 是一个包含若干页面资源的页面包：

```tree
content/
├── example/
│   ├── a.jpg
│   └── index.md
└── _index.md
```

创建一个短代码，把图片取为页面资源、按给定宽度缩放、转换为 WebP 格式，并加上 `alt` 属性：

```go-html-template {file="layouts/_shortcodes/image.html"}
{{- with .Page.Resources.Get (.Get "path") }}
  {{- with .Process (printf "resize %dx wepb" ($.Get "width")) -}}
    <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="{{ $.Get "alt" }}">
  {{- end }}
{{- end -}}
```

在内容中调用：

```md {file="content/example/index.md"}
{{</* image path=a.jpg width=300 alt="A white kitten" */>}}
```

上面的写法用到了 `with` 语句在每次操作成功后重新绑定上下文、`Get` 方法按名称取出参数，以及 `$` 访问模板最外层的上下文。

**结果长什么样**：产物里是一张已缩放并转成 WebP 的图，文件名带 Hugo 生成的哈希：

```html
<img src="/example/a_hu8f3c2b1d4e5a6f70.webp" width="300" height="200" alt="A white kitten">
```

宽度 300 是你传的；高度按比例算出；`src` 里的哈希由 Hugo 生成，**不要手写、也不要指望它稳定**。

> [!NOTE]
> 请务必彻底理解上下文的概念，新手最常犯的模板错误大多与它有关。相关说明见[简介](/templates/introduction/)。

### 加上错误处理

前面的例子虽然可用，但图片不存在时会静默失败，缺少必需参数时也不会优雅退出。下面补上错误处理：

```go-html-template {file="layouts/_shortcodes/image.html"}
{{- with .Get "path" }}
  {{- with $r := $.Page.Resources.Get ($.Get "path") }}
    {{- with $.Get "width" }}
      {{- with $r.Process (printf "resize %dx wepb" ($.Get "width" )) }}
        {{- $alt := or ($.Get "alt") "" -}}
        <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="{{ $alt }}">
      {{- end }}
    {{- else }}
      {{- errorf "The %q shortcode requires a 'width' argument: see %s" $.Name $.Position }}
    {{- end }}
  {{- else }}
    {{- warnf "The %q shortcode was unable to find %s: see %s" $.Name ($.Get "path") $.Position }}
  {{- end }}
{{- else }}
  {{- errorf "The %q shortcode requires a 'path' argument: see %s" .Name .Position }}
{{- end -}}
```

作者没有提供 `path` 或 `width` 时，这个模板会报错并让构建优雅失败；找不到指定路径的图片时给出警告；没有提供 `alt` 时，`alt` 属性被设为空字符串。`Name` 与 `Position` 方法能为错误与警告提供有用的上下文，例如缺少 `width` 参数时会抛出：

```text
ERROR The "image" shortcode requires a 'width' argument: see "/home/user/project/content/example/index.md:7:1"
```

**这段错误信息的价值**在于最后的 `文件:行:列`：内容一多，`see "…:7:1"` 能直接把你送到出问题的那一行。写自己的短代码时，务必在 `errorf` / `warnf` 里带上 `$.Name` 与 `$.Position`，否则读者只能全局搜索。

两种失败方式的区别也要记住：

| 写法 | 构建结果 | 适用场景 |
| --- | --- | --- |
| `errorf` | **构建失败**，必须修 | 参数缺失、用法错误——作者必须改 |
| `warnf` | 构建继续，终端打印 WARNING | 资源找不到等可降级情况 |

### 位置参数

短代码参数可以是命名参数，也可以是位置参数。前面用的是命名参数，下面看位置参数的写法。命名参数版本如下：

```md {file="content/example/index.md"}
{{</* image path=a.jpg width=300 alt="A white kitten" */>}}
```

改用位置参数调用：

```md {file="content/example/index.md"}
{{</* image a.jpg 300 "A white kitten" */>}}
```

在模板中用从 0 开始的下标配合 `Get` 方法取值，并把它们赋给含义清晰的变量：

```go-html-template {file="layouts/_shortcodes/image.html"}
{{ $path := .Get 0 }}
{{ $width := .Get 1 }}
{{ $alt := .Get 2 }}
```

> [!NOTE]
> 位置参数适合只有一两个参数且经常使用的短代码，因为用得多了自然记得住顺序。使用频率较低或参数超过两个时，命名参数可读性更好，也更不容易出错。

**边界情况**：位置参数越界时 `Get` 返回空值而不是报错，模板会安静地渲染出缺参数的 HTML。所以用位置参数时，最好在模板里显式检查必需项（见上面的错误处理示例）。

### 同时支持两种参数

可以让短代码同时接受命名参数与位置参数，但一次调用中不能混用。用 `IsNamedParams` 方法判断本次调用用的是哪一种：

```go-html-template {file="layouts/_shortcodes/image.html"}
{{ $path := cond (.IsNamedParams) (.Get "path") (.Get 0) }}
{{ $width := cond (.IsNamedParams) (.Get "width") (.Get 1) }}
{{ $alt := cond (.IsNamedParams) (.Get "alt") (.Get 2) }}
```

这里用 `cond`（`compare.Conditional` 的别名）来实现：`IsNamedParams` 为真时按名称取值，否则按位置取值。

混用（一半命名、一半位置）时 Hugo 只会识别其中一种形式，另一种取到空值——**不会报错**，所以模板设计上要么只支持一种，要么像上面这样显式分支。

### 参数集合

用 `Params` 方法把参数作为一个集合取出。使用命名参数时它返回映射：

```go-html-template {file="layouts/_shortcodes/image.html"}
{{ .Params.path }} → a.jpg
{{ .Params.width }} → 300
{{ .Params.alt }} → A white kitten
```

使用位置参数时它返回切片，需要用 `index` 按下标取值：

```go-html-template {file="layouts/_shortcodes/image.html"}
{{ index .Params 0 }} → a.jpg
{{ index .Params 1 }} → 300
{{ index .Params 2 }} → A white kitten
```

把 `Params` 与 `collections.IsSet` 函数配合使用，可以判断某个参数是否被设置过，即使它的值是假值。

### 内部内容

用 `Inner` 方法取出短代码标签之间包裹的内容。下例同时把内容与标题传给短代码，短代码生成一个 `div`，其中包含显示标题的 `h2` 与传入的内容：

```md {file="content/example.md"}
{{</* contrived title="A Contrived Example" */>}}
This is a **bold** word, and this is an _emphasized_ word.
{{</* /contrived  */>}}
```

```go-html-template {file="layouts/_shortcodes/contrived.html"}
<div class="contrived">
  <h2>{{ .Get "title" }}</h2>
  {{ .Inner | .Page.RenderString }}
</div>
```

上面的调用使用标准写法，因此需要用 `RenderString` 方法把内部内容里的 Markdown 转换成 HTML。若改用 Markdown 写法调用，这一转换就是多余的。

**结果长什么样**：产物里应当是**已转换的** HTML——内部内容变成了 `<strong>` 与 `<em>`：

```html
<div class="contrived">
  <h2>A Contrived Example</h2>
  <p>This is a <strong>bold</strong> word, and this is an <em>emphasized</em> word.</p>
</div>
```

如果你看到的是原样的 `**bold**`，说明内部内容没经过 `RenderString`（标准写法下 `.Inner` 是未渲染的文本）；如果看到的是被转义的 `&lt;strong&gt;`，说明该用 `safeHTML` 的地方漏了。

### 嵌套

当短代码在另一个短代码内部被调用时，`Parent` 方法提供父级短代码的上下文，从而形成一种继承模型。下面这个例子虽属刻意构造，但足以说明概念。

假设有一个 `gallery` 短代码，接受一个名为 `class` 的参数：

```go-html-template {file="layouts/_shortcodes/gallery.html"}
<div class="{{ .Get "class" }}">
  {{ .Inner }}
</div>
```

另有一个 `img` 短代码，接受一个名为 `src` 的参数；你希望它既能用在 `gallery` 内部，也能单独使用，由父级决定它的上下文：

```go-html-template {file="layouts/_shortcodes/img.html"}
{{ $src := .Get "src" }}
{{ with .Parent }}
  <img src="{{ $src }}" class="{{ .Get "class" }}-image">
{{ else }}
  <img src="{{ $src }}">
{{ end }}
```

在内容中这样调用：

```md {file="content/example.md"}
{{</* gallery class="content-gallery" */>}}
  {{</* img src="/images/one.jpg" */>}}
  {{</* img src="/images/two.jpg" */>}}
{{</* /gallery */>}}
{{</* img src="/images/three.jpg" */>}}
```

输出的 HTML 如下。前两个 `img` 继承了父级 `gallery` 调用中设置的 `class` 值 `content-gallery`，第三个只使用 `src`：

```html
<div class="content-gallery">
  <img src="/images/one.jpg" class="content-gallery-image">
  <img src="/images/two.jpg" class="content-gallery-image">
</div>
<img src="/images/three.jpg">
```

**验证标准**：第三个 `img` 一定是「裸」的。如果它带上了类名，说明 `.Parent` 在顶层调用时也不为空——检查是不是把 `img` 嵌在了别的短代码里。

### 渲染顺序

调用短代码所用的写法决定它在 Markdown 渲染的哪个阶段执行：

1. 用 Markdown 写法调用的短代码在 Markdown 渲染器之前按文档顺序执行。
1. Markdown 渲染器运行。
1. 用标准写法调用的短代码在 Markdown 渲染器之后按文档顺序执行。

这意味着，文档中靠前但使用标准写法调用的短代码，仍然晚于靠后但使用 Markdown 写法调用的短代码执行。

在同一阶段内，同一嵌套层级的短代码按文档顺序自上而下执行。短代码嵌套时，Hugo 由内向外渲染：每个嵌套短代码都先于它的父级执行，父级收到的 `Inner` 内容是所有嵌套短代码渲染完成的输出。例如对于下面的调用：

```md {file="content/example.md"}
{{</* outer */>}}
  {{</* inner-a */>}}
  {{</* inner-b */>}}
{{</* /outer */>}}
{{</* standalone */>}}
```

Hugo 的渲染顺序是 `inner-a`、`inner-b`、`outer`（把前两者的渲染结果作为 `.Inner` 接收），最后是 `standalone`。

**这条规则的实际影响**：父级拿到的是「渲染后的结果」，它无法判断子级原本写的是什么，也无法替子级补参数。需要父子协商时，用 `.Parent` 从子级读取父级的参数（如上文的 `gallery` / `img`），而不是反过来。

### 关于模板的返回值

短代码模板不写返回语句，Hugo 把模板渲染出的内容当作该次调用的返回值，直接放在调用处。由于渲染 HTML 时使用的是 Go 的 `html/template` 包，模板里由数据计算出来的字符串默认会被转义，以免内容破坏页面结构或引入注入风险；模板中直接书写的标签属于静态文本，会原样输出。

因此，当一段由数据拼出的字符串需要作为 HTML 输出时，要显式把它标记为可信内容；只想把它作为纯文本显示时则保持默认的转义即可。编写模板时请把这个区别放在心上：如果转义结果中出现 `&lt;` 之类的实体，通常说明该内容被当作文本处理了。

### 其他参考

想找更多思路，可以研究 Hugo 的内置短代码，其源码是很好的范例：[GitHub 上的内置短代码目录](https://github.com/gohugoio/hugo/tree/master/tpl/tplimpl/embedded/templates/_shortcodes)。

## 完整可运行示例：从创建到验证

最短的一条闭环，适合第一次上手：

**第 1 步**：创建短代码模板 `layouts/_shortcodes/year.html`：

```go-html-template {file="layouts/_shortcodes/year.html"}
{{- now.Format "2006" -}}
```

**第 2 步**：在任意内容页里调用它：

```md {file="content/example.md"}
+++
title = 'Example'
date = 2026-01-01
+++

This is {{</* year */>}}.
```

> [!NOTE]
> 上例中的 `{{</* year */>}}` 是**转义写法**，只在「文档里展示短代码语法」时使用。复制到自己的正文里时要去掉 `/*` 与 `*/` 两个标记，只保留尖括号里的调用形式——否则页面上会原样显示这串字符。

**第 3 步**：构建并核对产物：

```bash
hugo
```

你应当看到 `public/example/index.html` 里出现 `This is 2026.`。如果构建报错

```text
ERROR failed to extract shortcode: template for shortcode "year" not found
```

那就是模板文件的位置或名字不对：确认它在 `layouts/_shortcodes/year.html`（不是 `layouts/shortcodes/`，也不是 `year.html.html`）。

## 检测短代码是否被使用

`HasShortcode` 方法可以检查某个短代码是否在页面上被调用过。例如有一个自定义的 `audio` 短代码：

```md {file="content/example.md"}
{{</* audio src=/audio/test.mp3 */>}}
```

可以在基础模板中用 `HasShortcode` 判断该页面是否用过 `audio`，从而有条件地加载 CSS：

```go-html-template {file="layouts/baseof.html"}
<head>
  {{ if .HasShortcode "audio" }}
    <link rel="stylesheet" src="/css/audio.css">
  {{ end }}
</head>
```

**验证标准**：用过 `audio` 的页面产物里应当出现 `<link rel="stylesheet" src="/css/audio.css">`，没用过的页面里应当完全没有这一行。这个写法能避免把播放器样式加载到全站每个页面。

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH` → [安装 Hugo](/installation/) |
| 没报错但结果不对 | 页面上直接显示了 `{{</* year */>}}` 这串字符 | 你把文档里的**转义写法**（`{{</* year */>}}`）抄进了正文；正文里应当去掉 `/*` 与 `*/` |
| 没报错但结果不对 | 内部内容的 Markdown 没被渲染（显示成 `**bold**`） | 标准写法下 `.Inner` 是未渲染文本 → 加 `{{ .Inner \| .Page.RenderString }}`；或改用 Markdown 写法调用 |
| 没报错但结果不对 | 行内短代码两侧多出空格/换行 | 模板两侧没用 `{{-` / `-}}` 吃掉空白 → 见「插入年份」 |
| 没报错但结果不对 | 参数取到空值，页面缺内容 | 命名参数与位置参数混用、或下标越界；`Get` 不会报错 → 模板里显式检查必需参数 |
| 报错看不懂 | `failed to extract shortcode: template for shortcode "…" not found` | 文件名/目录不对（旧目录 `layouts/shortcodes`、子目录路径写错）→ 对照「目录结构」与「查找顺序」 |
| 报错看不懂 | `ERROR The "image" shortcode requires a 'path' argument: see "…:7:1"` | 这是模板里 `errorf` 主动抛出的，按提示的行号去内容文件补参数即可 |
| 报错看不懂 | 构建失败但报错指向别的页面 | 短代码占位符相关错误会被归因到其它页面 → 用 `hugo --ignoreCache` 复现，并参考[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。
