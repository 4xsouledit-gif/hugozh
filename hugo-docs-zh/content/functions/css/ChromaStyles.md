+++
title = "css.ChromaStyles"
linkTitle = "ChromaStyles"
description = "返回语法高亮器使用的 CSS 样式表。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/functions/css/chromastyles/"

[params.functions_and_methods]
signatures = ["css.ChromaStyles OPTIONS"]
returnType = "resource.Resource"
+++

## 这一页解决什么问题

把 `markup.highlight.noClasses` 设为 `false` 后，代码高亮输出的是 CSS 类（`.chroma .k` 之类），页面上必须再引用一份配套的样式表，否则代码块没有任何颜色。过去这份样式表要用 `hugo gen chromastyles` 命令行生成成静态文件；从 0.165.0 起，`css.ChromaStyles` 可以在模板里直接把它生成成资源——样式跟着站点配置走，换主题色只要改配置。

## 什么时候用，什么时候别用

**该用**：

- 想让高亮样式跟随 `markup.highlight.style` 配置自动变化；
- 需要明/暗两套样式（`mode` + `modeSelector`），或需要去掉注释前缀（`omitClassComments`）；
- 想把这份样式表并进主 CSS（配合 [`css.Build`](/functions/css/build/)，见上游「完整示例」）。

**别用**：

- `noClasses` 仍为 `true`（内联样式输出）→ 根本不需要这份样式表；
- 只是想让已有 CSS 走构建管道 → 用 [`css.Build`](/functions/css/build/)；
- 只想临时看一眼某个内置配色 → 直接改 `markup.highlight.style`，不必自己写管道。

**（0.165.0 新增）**

`css.ChromaStyles` 函数以 `Resource` 对象的形式返回语法高亮器使用的 CSS 样式表。当 `noClasses` 选项为 `false` 时需要这份样式表：它既可以在项目配置中作为[全局默认值][global default]设置，也可以在使用下列任一功能时单独指定：

- [`highlight`][] 短代码
- [`transform.Highlight`][] 函数
- [`transform.HighlightCodeBlock`][] 函数
- Markdown 围栏代码块[信息串](g)中的高亮选项

Hugo 会缓存结果，因此用相同的选项多次调用该函数不会带来额外开销。

## 选项

`css.ChromaStyles` 函数需要一个选项映射。其中 [`targetPath`](#targetpath) 是唯一必填的选项。

`classDark`
: (`string`) 当 [`modeSelector`](#modeselector) 为 `true` 且 [`mode`](#mode) 为 `dark` 时，用于限定选择器作用域的 CSS 类名。默认是 `dark`。

`classLight`
: (`string`) 当 [`modeSelector`](#modeselector) 为 `true` 且 [`mode`](#mode) 为 `light` 时，用于限定选择器作用域的 CSS 类名。默认是 `light`。

`highlightStyle`
: (`string`) 高亮行的前景色与背景色，例如 `#fff000 bg:#000fff`。默认取所选 [`style`](#style) 定义的颜色。

`lineNumbersInlineStyle`
: (`string`) 行内行号的前景色与背景色，例如 `#fff000 bg:#000fff`。默认取所选 [`style`](#style) 定义的颜色。

`lineNumbersTableStyle`
: (`string`) 表格行号的前景色与背景色，例如 `#fff000 bg:#000fff`。默认取所选 [`style`](#style) 定义的颜色。

`mode`
: (`string`) 颜色[模式][mode]，取 `light` 或 `dark`。指定的样式必须支持该模式。省略这个选项时，Hugo 使用样式自身的默认模式。

`modeSelector`
: (`bool`) 是否把 CSS 选择器限定在顶层模式类之下。例如 `light` 模式的样式表会把选择器限定在 `.light` 之下，生成 `.light .chroma` 而不是 `.chroma`。要生成配对使用的明暗两份样式表时，把它设为 `true`。默认是 `false`。

`omitClassComments`
: (`bool`) 是否在生成的样式表中省略 CSS 类注释前缀。默认是 `false`。

`style`
: (`string`) 语法高亮样式。默认取项目配置中的 [`style`][] 值。可用样式列表见[语法高亮样式][]。

`targetPath`
: (`string`) 资源的目标路径，相对于 [`publishDir`][]。必填。

## 示例

前两个示例用 [`partials.IncludeCached`][] 函数从 _base_ 模板调用 _partial_ 模板。两个示例都假定项目配置如下：

```toml
[markup.highlight]
noClasses = false
style = 'github'
```

### 单一样式表

要使用项目配置中的 [`style`][] 值生成并引入样式表：

```go-html-template {file="layouts/_partials/highlight.html" copy=true}
{{ $opts := dict "targetPath" "css/highlight.css" }}
{{ with css.ChromaStyles $opts }}
  <link rel="stylesheet" href="{{ .RelPermalink }}">
{{ end }}
```

### 明暗两份样式表

要为同时支持两种[模式][mode]的样式生成并引入配对的明暗两份样式表：

```go-html-template {file="layouts/_partials/highlight.html" copy=true}
{{ $opts := dict
  "mode" "light"
  "targetPath" "css/highlight-light.css"
}}
{{ with css.ChromaStyles $opts }}
  <link rel="stylesheet" href="{{ .RelPermalink }}">
{{ end }}

{{ $opts := dict
  "mode" "dark"
  "modeSelector" true
  "targetPath" "css/highlight-dark.css"
}}
{{ with css.ChromaStyles $opts }}
  <link rel="stylesheet" href="{{ .RelPermalink }}">
{{ end }}
```

浅色样式表不限定作用域，充当默认值。深色样式表的选择器限定在 `dark` 类之下，因此其中的规则只有在根元素带有该类时才生效。

### 完整示例

这个示例为站点加上浅色/深色/跟随系统的主题切换器，并用 [`css.Build`][] 函数把生成的样式表打包进主 CSS 文件。

第 1 步
: 在项目配置中加入：

  ```toml
  [markup.highlight]
  noClasses = false
  style = 'github'
  ```

第 2 步
: 创建一个 CSS 入口文件，用 `@import` 语句引入生成的样式表，并为页面其余部分写好浅色与深色规则：

  ```css {file="assets/css/main.css" copy=true}
  @import "./highlight-light.css";
  @import "./highlight-dark.css";

  html {
    background-color: #fff;
    color: #000;
    color-scheme: light;
  }

  a {
    color: #00e;
  }

  html.dark {
    background-color: #000;
    color: #fff;
    color-scheme: dark;
  }

  html.dark a {
    color: #6af;
  }
  ```

第 3 步
: 创建一个 _partial_ 模板来生成这些样式表，并把它们与 CSS 入口文件打包在一起：

  ```go-html-template {file="layouts/_partials/css.html" copy=true}
  {{ $opts := dict
    "mode" "light"
    "targetPath" "css/highlight-light.css"
  }}
  {{ $highlightLight := css.ChromaStyles $opts }}

  {{ $opts := dict
    "mode" "dark"
    "modeSelector" true
    "targetPath" "css/highlight-dark.css"
  }}
  {{ $highlightDark := css.ChromaStyles $opts }}

  {{ with resources.Get "css/main.css" }}
    {{ $opts := dict
      "importContext" (slice $highlightLight $highlightDark)
      "minify" (cond hugo.IsDevelopment false true)
      "sourceMap" (cond hugo.IsDevelopment "linked" "none")
    }}
    {{ with . | css.Build $opts }}
      {{ if hugo.IsDevelopment }}
        <link rel="stylesheet" href="{{ .RelPermalink }}">
      {{ else }}
        {{ with . | fingerprint }}
          <link rel="stylesheet" href="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous">
        {{ end }}
      {{ end }}
    {{ end }}
  {{ end }}
  ```

  [`importContext`][] 选项让生成的样式表在 `css.Build` 解析 CSS 入口文件中的 `@import` 语句时可用。

第 4 步
: 创建一个 JavaScript 文件来控制主题切换器：把手动选择持久化到本地存储，并在访问者选择「跟随系统」时跟随操作系统的偏好：

  ```js {file="assets/js/main.js" copy=true}
  const root = document.documentElement;
  const fieldset = document.getElementById('theme-switcher');
  const mq = window.matchMedia('(prefers-color-scheme: dark)');

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      root.classList.add('dark');
    } else if (theme === 'light') {
      root.classList.remove('dark');
    } else {
      root.classList.toggle('dark', mq.matches);
    }
    fieldset.querySelector(`input[value="${theme ?? 'system'}"]`).checked = true;
  };

  // Keep class in sync with system preference when no manual override is set.
  mq.addEventListener('change', () => {
    if (!localStorage.getItem('theme')) {
      root.classList.toggle('dark', mq.matches);
    }
  });

  applyTheme(localStorage.getItem('theme'));

  fieldset.addEventListener('change', (e) => {
    const next = e.target.value === 'system' ? null : e.target.value;
    if (next === null) {
      localStorage.removeItem('theme');
    } else {
      localStorage.setItem('theme', next);
    }
    applyTheme(next);
  });
  ```

第 5 步
: 创建一个 _partial_ 模板来处理这段 JavaScript：

  ```go-html-template {file="layouts/_partials/js.html" copy=true}
  {{ with resources.Get "js/main.js" }}
    {{ $opts := dict
      "minify" (cond hugo.IsDevelopment false true)
      "sourceMap" (cond hugo.IsDevelopment "linked" "none")
    }}
    {{ with . | js.Build $opts }}
      {{ if hugo.IsDevelopment }}
        <script defer src="{{ .RelPermalink }}"></script>
      {{ else }}
        {{ with . | fingerprint }}
          <script defer src="{{ .RelPermalink }}" integrity="{{ .Data.Integrity }}" crossorigin="anonymous"></script>
        {{ end }}
      {{ end }}
    {{ end }}
  {{ end }}
  ```

第 6 步
: 从 _base_ 模板调用这两个 _partial_ 模板，并加入主题切换器的标记。`head` 元素中的内联脚本会在首次绘制之前应用主题，避免深色主题的访问者加载页面时闪出浅色内容：

  ```go-html-template {file="layouts/baseof.html" copy=true}
  <!DOCTYPE html>
  <html lang="{{ site.Language.Locale }}">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>{{ site.Title }}</title>
      <script>
        const theme = localStorage.getItem('theme');
        document.documentElement.classList.toggle('dark',
          theme === 'dark' ||
          (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches));
      </script>
      {{ partialCached "css.html" . }}
      {{ partialCached "js.html" . }}
    </head>
    <body>
      <header>
        <fieldset id="theme-switcher">
          <legend>Color scheme</legend>
          <label><input type="radio" name="theme" value="light"> Light</label>
          <label><input type="radio" name="theme" value="dark"> Dark</label>
          <label><input type="radio" name="theme" value="system"> System</label>
        </fieldset>
      </header>
      <main>
        {{ block "main" . }}{{ end }}
      </main>
    </body>
  </html>
  ```

第 7 步
: 要验证上述配置，在首页加入一个围栏代码块：

  ````md {file="content/_index.md" copy=true}
  ```go
  func printGreeting(showGreeting bool) {
    if showGreeting {
      fmt.Println("Hello, World!")
    }
  }
  ```
  ````

## 完整示例：生成并引用高亮样式表

```go-html-template {file="layouts/_partials/highlight.html"}
{{ $opts := dict "targetPath" "css/highlight.css" }}
{{ with css.ChromaStyles $opts }}
  <link rel="stylesheet" href="{{ .RelPermalink }}">
{{ end }}
```

在本机（Hugo 0.167.0 extended，Windows，配置里未设置 `markup.highlight.style`）实测：`.RelPermalink` 为 `/css/highlight.css`，产物开头几行为（默认样式为 monokai 配色，底色 `#272822`）：

```css
/* Background */ .bg { color:#f8f8f2;background-color:#272822; }
/* PreWrapper */ .chroma { color:#f8f8f2;background-color:#272822;-webkit-text-size-adjust:none; }
/* Error */ .chroma .err { color:#960050;background-color:#1e0010 }
/* LineLink */ .chroma .lnlinks { outline:none;text-decoration:none;color:inherit }
```

**你应当看到什么**：一份以 `.chroma` 为根的完整样式表（本机 3742 字节），每行前的 `/* 注释 */` 说明该规则对应的元素类型。

开启 `modeSelector` 后，选择器会被加上模式类前缀（实测）：

```go-html-template
{{ $opts := dict "mode" "dark" "modeSelector" true "targetPath" "css/hl-dark.css" }}
{{ with css.ChromaStyles $opts }}{{ .RelPermalink }}{{ end }}
```

```css
/* Background */ .dark .bg { color:#f8f8f2;background-color:#272822; }
/* PreWrapper */ .dark .chroma { color:#f8f8f2;background-color:#272822;-webkit-text-size-adjust:none; }
```

开启 `omitClassComments` 后注释消失（实测同一份样式表从 3742 字节变为 2375 字节）：

```css
.bg { color:#f8f8f2;background-color:#272822; }
.chroma { color:#f8f8f2;background-color:#272822;-webkit-text-size-adjust:none; }
```

## 返回值边界（实测）

测量条件：Hugo 0.167.0 extended，Windows，最小站点。

| 情况 | 结果 | 是否报错 |
| --- | --- | --- |
| 只给 `targetPath` | 资源；`.RelPermalink` 按 `targetPath`；用默认样式、选择器无模式前缀 | 否 |
| `"mode" "dark"` + `"modeSelector" true` | 选择器加 `.dark ` 前缀（实测） | 否 |
| `"omitClassComments" true` | 去掉 `/* 注释 */`（实测 3742 → 2375 字节） | 否 |
| 缺少 `targetPath` | —— | 是：`error calling ChromaStyles: targetPath cannot be empty` |
| `style` 不存在（如 `nope`） | —— | 是：`error calling ChromaStyles: invalid style: nope` |
| `mode` 非法（如 `nope`） | —— | 是：`error calling ChromaStyles: invalid mode: nope` |
| 传字符串而不是选项映射 | —— | 是：`error calling ChromaStyles: invalid character 'x' looking for beginning of value` |
| 完全不传参数 | —— | 是：`wrong number of args for ChromaStyles: want 1 got 0` |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 代码块没有任何颜色 | 生成了样式表但页面没引用，或 `noClasses` 与样式表类型不匹配 | 按本页示例输出 `<link rel="stylesheet" href="{{ .RelPermalink }}">` |
| 没报错但结果不对 | 切到暗色主题后样式不生效 | 生成暗色样式表时没开 `modeSelector`，选择器没有 `.dark` 前缀 | 设 `"modeSelector" true`（默认前缀类名为 `dark`，可用 `classDark` 改） |
| 没报错但结果不对 | 产物里有一大堆用不上的规则 | 这是样式表的完整输出，函数不做按需裁剪 | 需要精简就用 [`css.Build`](/functions/css/build/) 打包并按需处理 |
| 报错看不懂 | `targetPath cannot be empty` | 唯一必填选项没传 | 至少传 `dict "targetPath" "css/highlight.css"` |
| 报错看不懂 | `invalid style: xxx` | `style` 名拼错 | 用 [语法高亮样式](/quick-reference/syntax-highlighting-styles/) 里列出的名字 |

更多排查入口见[故障排查](/troubleshooting/)。

[`css.Build`]: /functions/css/build/
[`highlight`]: /shortcodes/highlight/
[`importContext`]: /functions/css/build/#importcontext
[`partials.IncludeCached`]: /functions/partials/includecached/
[`publishDir`]: /configuration/all/#publishdir
[`style`]: /configuration/markup/#style
[`transform.HighlightCodeBlock`]: /functions/transform/highlightcodeblock/
[`transform.Highlight`]: /functions/transform/highlight/
[global default]: /configuration/markup/#noclasses
[mode]: /quick-reference/syntax-highlighting-styles/#modes
[语法高亮样式]: /quick-reference/syntax-highlighting-styles/
