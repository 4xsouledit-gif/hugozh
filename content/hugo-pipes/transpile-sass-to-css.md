+++
title = "把 Sass 编译为 CSS"
linkTitle = "把 Sass 编译为 CSS"
description = "用 css.Sass 把 Sass 或 SCSS 编译为 CSS，再压缩与加指纹。含 extended 版依赖、Dart Sass 安装与常见报错。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/hugo-pipes/transpile-sass-to-css/"

[params.teach]
difficulty = "进阶"
time = "20–30 分钟"
prereq = [
  "Hugo **extended** 或 extended/deploy 版（`hugo version` 输出里带 `+extended`）；想用 Sass 最新特性还要在 `PATH` 里装好 Dart Sass",
  "知道项目根目录下有 `assets/` 目录（见[目录结构](/getting-started/directory-structure/)）",
  "读过[简介](/hugo-pipes/introduction/)，理解「取资源 → 进管道 → 发布」这条链路",
]
outcomes = [
  "把 SCSS/Sass 编译成 CSS，并发布成带哈希文件名的样式表",
  "用项目配置里的颜色、字号生成 Sass 变量（`vars` 选项 + `hugo:vars`）",
  "在构建失败时，区分「用了非 extended 版」「Dart Sass 没装」「`@use` 路径没配」这三类原因",
]
next = ["/hugo-pipes/postcss/", "/hugo-pipes/fingerprint/", "/functions/css/sass/"]

+++

## 这一页解决什么问题

浏览器不认识 SCSS：变量、`@use`、嵌套规则它都读不懂。这一步把 `.scss` / `.sass` 编译成普通 CSS，并让产物带上哈希文件名，从而可以被浏览器长期缓存。

编译要在 Hugo 里完成，需要满足一个前提：**Hugo 必须能找到一个 Sass 转译器**。这一点决定了本节一半以上的报错。

## 适用前提

用 `css.Sass` 函数把 Sass 转译为 CSS。Hugo 的 extended 版与 extended/deploy 版内置了 LibSass 转译器；若想使用 Sass 语言的最新特性，则需另行安装 Dart Sass。Sass 有 SCSS 与缩进语法两种书写形式，Hugo 都支持。

转译器的选择由 `transpiler` 选项决定，取值为 `libsass` 或 `dartsass`，默认是 `libsass`。**（v0.153.0 起弃用）** 内置的 LibSass 转译器已标记为过时并将在未来的版本中移除，因此建议改用 Dart Sass：把 `transpiler` 设为 `dartsass` 即可。

采用 Dart Sass 时，把它装进 `PATH` 覆盖到的位置，Hugo 就能找到它。用 `hugo env` 命令可以列出当前生效的转译器。在持续集成的构建环境中，通常需要在构建开始前先安装 Dart Sass，除非你已按原样把 `resources` 目录提交进仓库。

### 为什么「extended」这件事必须提前确认

LibSass 是**编译进 Hugo 可执行文件**的，普通版里根本没有这段代码。所以非 extended 版遇到 `css.Sass` 时不会「编译出一点东西」，而是直接失败：

```text
TOCSS: failed to transform "sass/main.scss" (text/x-sass): this feature is not available in your current Hugo version, see https://goo.gl/YMrWcn for more information.
```

看到 `this feature is not available in your current Hugo version` 就是这个问题：换 extended 版，或改用 Dart Sass（后者不依赖二进制里的转译器）。

Windows 上常见的原因是装了 `Hugo.Hugo` 而不是 `Hugo.Hugo.Extended`；macOS 上是 `brew install hugo` 装到了非 extended 的公式。详见[安装 Hugo](/installation/)。

## 取得资源

样式表同样要先作为资源取出，再进入管道。资源位于资产目录 `assets` 中，例如 `assets/sass/main.scss` 就写为 `resources.Get "sass/main.scss"`。

**路径是相对于 `assets/` 的**，不要写 `assets/sass/main.scss`——那样 Hugo 会在 `assets/assets/` 里找，结果拿到 `nil`，随后在管道里报一个看起来与 Sass 无关的错。

## 管道方法链

```go-html-template
{{ $opts := dict "transpiler" "dartsass" }}
{{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
```

选项以映射形式传入，要与其他函数串成管道链时紧随其后：

```go-html-template
{{ $r := resources.Get "sass/main.scss" | css.Sass $opts | resources.Minify | resources.Fingerprint }}
```

**顺序为什么是「编译 → 压缩 → 指纹」**：压缩和指纹处理的都是编译**之后**的 CSS。把指纹放在编译前，`integrity` 记录的就不是浏览器实际收到的那份内容，浏览器会拒绝加载样式表。

## 配置选项

`css.Sass` 接受一个选项映射，常用键如下。

- `transpiler`：转译器，`libsass` 或 `dartsass`，默认 `libsass`。
- `outputStyle`：输出样式。LibSass 可取 `nested`（默认）、`expanded`、`compact`、`compressed`；Dart Sass 取 `expanded`（默认）或 `compressed`。
- `enableSourceMap`：是否生成 source map，默认 `false`。另有 `sourceMapIncludeSources` 决定是否把源文件嵌入 source map，默认 `false`，适用于 Dart Sass。
- `targetPath`：目标路径，相对于 `publishDir`；若不设置，则默认为资源原路径换用 `.css` 扩展名。
- `includePaths`：一个路径切片，用于解析 `@use` 与 `@import`，例如 `node_modules/bootstrap/scss`。
- `precision`：浮点运算精度，默认 `8`，适用于 LibSass。
- `silenceDeprecations` 与 `silenceDependencyDeprecations`：用于压制度弃告警，后者默认 `false`，适用于 Dart Sass。
- `vars`：键值映射，用来生成 Sass 变量。

> [!NOTE]
> `outputStyle` 的合法取值随转译器而变：给 Dart Sass 传 `compact` 或 `nested` 会被拒绝。跨机器协作时，显式写出 `transpiler` 与 `outputStyle`，不要依赖默认值——默认值随版本与转译器变化。

## Sass 变量

`vars` 中的变量会在样式表里遇到 `hugo:vars` 这一内部标识符时注入。在配置文件中集中定义颜色与字号，再交给模板，是一种常见做法：

```toml
[params.theme.style]
font-family = '"Times New Roman", Times, serif'
font-size = '24px'
primary-color = 'blue'
```

```go-html-template
{{ $opts := dict "transpiler" "dartsass" "vars" site.Params.theme.style }}
{{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
```

样式表中以 `@use 'hugo:vars' as v;` 引入后，即可用 `v.$primary-color` 这样的形式取值。传入 `vars` 时，Hugo 会用正则匹配识别 `24px`、`#FF0000` 一类常见的带类型 CSS 值；必要时可用 `css.Quoted` 或 `css.Unquoted` 明确指定类型，避免自动推断造成歧义。

## 完整可运行示例

下面这一套不需要任何主题，直接跑通「配置 → SCSS → 编译 → 指纹 → 页面引用」。

**① 建项目并进入目录**：

```bash
hugo new project sass-demo
cd sass-demo
```

**② 在项目配置 `hugo.toml` 末尾追加颜色与字号**：

```toml
[params.theme.style]
font-family = '"Times New Roman", Times, serif'
font-size = '24px'
primary-color = 'blue'
```

**③ 新建样式表** `assets/sass/main.scss`：

```scss
@use 'hugo:vars' as v;

body {
  color: v.$primary-color;
  font-family: v.$font-family;
  font-size: v.$font-size;
}
```

**④ 新建首页模板** `layouts/home.html`：

```go-html-template {file="layouts/home.html"}
{{ with resources.Get "sass/main.scss" }}
  {{ $opts := dict
    "transpiler" "dartsass"
    "outputStyle" "expanded"
    "vars" site.Params.theme.style
  }}
  {{ with . | css.Sass $opts }}
    {{ $css := . | fingerprint }}
    <!doctype html>
    <html lang="zh-cn">
      <head>
        <meta charset="utf-8">
        <title>Sass 编译演示</title>
        <link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}" crossorigin="anonymous">
      </head>
      <body>
        <h1>这行字的颜色与字体来自 Sass 变量</h1>
      </body>
    </html>
  {{ end }}
{{ end }}
```

**⑤ 预览**：

```bash
hugo server
```

### 你应当看到什么

- 页面上的标题是**蓝色**、衬线字体（`Times New Roman`），字号明显大于默认值——说明配置里的值真的进了 CSS；
- 查看网页源代码，`<link>` 的 `href` 形如 `/sass/main.<哈希>.css`：说明 `targetPath` 未设置时，Hugo 用了原路径换成 `.css` 扩展名，并附上了指纹；
- 执行一次 `hugo` 后，`public/sass/main.<哈希>.css` 存在，打开它应当看到**展开格式**的 CSS：

  ```css
  body {
    color: blue;
    font-family: "Times New Roman", Times, serif;
    font-size: 24px;
  }
  ```

- 把 `outputStyle` 改成 `"compressed"` 再构建一次，同一份文件的 CSS 会挤成一行——这可以用来确认选项确实生效。

> [!NOTE]
> 换用内置 LibSass 时，把 `"transpiler" "dartsass"` 删掉即可（默认就是 `libsass`），但 `@use 'hugo:vars'` 与 `outputStyle` 的取值需要按 LibSass 的规则检查。**本页示例按推荐路线使用 Dart Sass。**

## 什么时候用 / 什么时候别用

**该用的时候**

- 你已经在写 SCSS/Sass，或者要用变量、嵌套、`@use` 组织多个样式文件；
- 你希望把站点配置里的颜色、字号注入样式表（`vars` + `hugo:vars`）；
- 你需要编译后立刻压缩并加指纹。

**别用的时候**

- 只有一份普通 CSS，没有变量与嵌套：直接放 `static/` 让 Hugo 原样复制，或用 `resources.Get` 后只做 `minify`/`fingerprint`，少一层工具链就少一处失败点；
- 你要用的是 PostCSS 插件生态（自动前缀、Tailwind 等）：走[PostCSS](/hugo-pipes/postcss/) 那条路。**不要为了同一份文件同时上 Sass 与 PostCSS** ——两条链各自缓存、各自输出，维护成本翻倍；
- 你只是想在 CSS 里做一点变量替换：`resources.ExecuteAsTemplate` 也能做，见[从模板创建资源](/hugo-pipes/resource-from-template/)。

## 常见坑

**① 命令找不到（命令类）**

| 现象 | 原因 | 处理 |
| --- | --- | --- |
| `hugo: command not found` | Hugo 没装或没进 `PATH` | [安装 Hugo](/installation/) |
| 构建报 `this feature is not available in your current Hugo version` | 用的是非 extended 版 | 换 extended 版，或改用 Dart Sass |
| `hugo env` 里没有 Dart Sass，而 `transpiler` 设成了 `dartsass` | Dart Sass 没装或不在 `PATH` | `npm install -g sass`、`brew install sass/sass/sass`，或下载预编译二进制并加入 `PATH` |

**② 没报错但结果不对（静默失败类）**

| 现象 | 原因 | 怎么确认 |
| --- | --- | --- |
| 页面完全没样式，构建无报错 | `resources.Get` 的路径写成了 `assets/sass/main.scss`，返回 `nil`，`with` 把整段跳过 | 改成相对 `assets/` 的 `sass/main.scss` |
| 样式是旧的 | 编译结果的哈希没变，说明输入的 SCSS 没被读到（文件名/路径错了） | 改一个明显的值（如颜色）再构建，看文件名哈希是否变化 |
| 配置里的颜色没生效 | 配置写成了 `[params.theme.style]` 之外的位置，或模板里没传 `vars` | 临时在页面上打印 `{{ site.Params.theme.style }}` 检查 |
| `hugo server` 正常，CI 上失败 | CI 环境里没有 Dart Sass | 在构建工作流里先安装 Dart Sass，或提交 `resources/` 目录 |

**③ 报错看不懂（报错类）**

- `TOCSS: failed to transform ...`：`TOCSS` 是「to CSS」这一环的通用前缀，**后面的那句才是原因**。先读冒号后半段，再决定是版本问题、路径问题还是语法问题；
- `Error: Can't find stylesheet to import.` 一类 Dart Sass 报错：`@use` / `@import` 的目标没找到。用 `includePaths` 指明搜索目录（例如 `node_modules/bootstrap/scss`），或检查相对路径；
- 报错里出现 `expected ";"` / `expected "}"` 之类：SCSS 语法错误，报错文件与行号指向的就是源文件本身，直接去那一行看；
- 报错指向的文件与你改的无关：渲染期问题常常这样冒出来，见[故障排查](/troubleshooting/)。

逐级排查的顺序：**`hugo version` 有没有 `+extended` → `hugo env` 有没有 Dart Sass → 资源路径是否相对 `assets/` → SCSS 语法是否有错**。

## 相关页面

- [css.Sass](/functions/css/sass/)（完整的选项参考与 Dart Sass 各平台安装表）
- [css.Quoted](/functions/css/quoted/) / [css.Unquoted](/functions/css/unquoted/)（显式指定变量类型）
- [PostCSS](/hugo-pipes/postcss/)
- [资源指纹](/hugo-pipes/fingerprint/)
- [故障排查](/troubleshooting/)
