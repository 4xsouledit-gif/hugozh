+++
title = "简介"
linkTitle = "简介"
description = "介绍资源的查找与获取、资产目录、资源发布、管道写法与缓存，并给出一个照做即可跑通的最小示例。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/hugo-pipes/introduction/"

[params.teach]
difficulty = "入门"
time = "15–25 分钟"
prereq = [
  "已装好 Hugo，并且 `hugo version` 能打印出版本号（见[安装 Hugo](/installation/)）",
  "知道项目根目录、`assets/`、`layouts/` 各自在哪（见[目录结构](/getting-started/directory-structure/)）",
  "会打开终端，并能在项目根目录下执行 `hugo server`",
]
outcomes = [
  "说清「资源」在 Hugo 里的三种来源，并用对应函数把它取出来",
  "写出 `resources.Get … | minify | fingerprint` 这样的管道链，并解释每一环为什么在那个位置",
  "知道资源要满足什么条件才会出现在 `public/` 目录里，从而能自己排查「构建成功但文件不在」",
  "看懂 `resources.Get` 返回 `nil` 时管道为什么会报错",
]
next = ["/hugo-pipes/transpile-sass-to-css/", "/content-management/page-resources/", "/getting-started/directory-structure/"]

+++

## 这一页解决什么问题

模板里写死 `<link href="/css/main.css">`，浏览器拿到的是原样文件：没有编译、没有压缩、没有缓存失效机制。Hugo Pipes 就是解决这三件事的一层函数集合——**把文件当作「资源」取进来，经过一串函数变换，再以你指定的路径发布出去**。

它要回答的问题只有四个：

1. 文件从哪里取？（`assets/`、远程 URL，还是页面包内部）
2. 取回来的东西是什么类型？（资源对象，不是字符串）
3. 中间做哪些变换？（编译、压缩、拼装、加指纹）
4. 结果什么时候、以什么名字写进 `public/`？

下面按这四问展开。**第 1、4 问是新手翻车最多的地方**，其余是写法约定。

## 在 assets 中查找资源

这里讨论的是全局资源与远程资源：

全局资源
: `assets` 目录中的文件，或位于任何挂载到 `assets` 目录的目录中的文件。

远程资源
: 位于远程服务器上、可通过 HTTP 或 HTTPS 访问的文件。

若资源的作用域属于某个 `Page`，请参阅[页面资源](/content-management/page-resources/)一节。

**为什么要把三者分开**：它们的获取函数不通用。全局资源用 `resources.Get` 这类**函数**，页面资源用 `Page` 对象上的 `Resources.Get` 这类**方法**，远程资源用 `resources.GetRemote`。函数名看起来很像，写混了通常得到的是「找不到资源」而不是一句明确的类型错误。

## 取得资源

要用 Hugo Pipes 处理一个资源，必须先把它取出来。

对于全局资源，使用：

- `resources.ByType`
- `resources.Get`
- `resources.GetMatch`
- `resources.Match`

对于远程资源，使用：

- `resources.GetRemote`

### 取不到时会发生什么

这一节值得单独记：**取不到资源时，Hugo 默认给出的不是你想要的那种报错**。

| 函数 | 找不到时返回 | 后果 |
| --- | --- | --- |
| `resources.Get` | `nil` | 直接把 `nil` 送进后面的管道函数会构建失败；用 `with` 包住最稳 |
| `resources.GetMatch` | `nil` | 同上 |
| `resources.Match` | 空切片 | `range` 它不会报错，只是什么都不渲染 |
| `resources.ByType` | 空切片 | 同上 |
| `resources.GetRemote` | HTTP 404 时返回 `nil`；其他请求错误会让构建失败 | 不想让构建失败就用 `try` 捕获 |

**为什么这样设计**：`Get` 的语义是「按精确路径取一份资源」，取不到就是没有；`Match`/`ByType` 的语义是「按模式取一批」，取不到一批就是空集。记住这一点，就不会再困惑「为什么这行静悄悄地没输出」。

```go-html-template
{{ with resources.Get "images/a.jpg" }}
  <img src="{{ .RelPermalink }}" width="{{ .Width }}" height="{{ .Height }}" alt="">
{{ end }}
```

## 复制资源

请使用 `resources.Copy` 函数。它给出同一份内容的另一个目标路径，用来避免同一个资源在不同位置被重复处理，也方便把带哈希的资源和固定名字的资源同时发布出去。

## 资产目录

资源文件必须存放在资产目录中。该目录默认为 `assets`，可通过配置文件的 `assetDir` 键修改。

**为什么要有 `assets/` 和 `static/` 两个目录**：它们是两条完全不同的路径。

| 目录 | Hugo 怎么处理 | 什么时候用 |
| --- | --- | --- |
| `assets/` | 交给 Hugo Pipes，可以编译、压缩、加指纹；**不主动复制到 `public/`** | 需要经过任何转换的文件 |
| `static/` | 原样复制到 `public/` 根下，不经过管道 | 不需要转换的文件，例如 `favicon.ico`、`robots.txt` |

放错目录是「没报错但结果不对」的典型来源：把 `main.scss` 放到 `static/` 里，它会被原样复制出去，浏览器收到一段 SCSS 源码，样式自然不生效。

## 资源发布

当你调用 `.Permalink`、`.RelPermalink` 或 `.Publish` 时，Hugo 会把资源发布到 `publishDir`（通常是 `public`）。你也可以用 `.Content` 把资源内容内联到输出中。

**这是全章最重要的一个「会怎样」**：不调用上述任何一个方法，资源就**不会**出现在 `public/` 里，而且构建**不会报错**。所以看到「构建成功、文件不在」时，第一件事是回到模板里找：这份资源的结果有没有被真正引用过？

对远程资源还有一条细节：用 `Permalink`、`RelPermalink` 或 `Publish` 发布远程资源时，Hugo 把生成的文件放在 `publishDir` **根目录**下，文件名取 URL 的基名，并在其后附加一个哈希值以保证缓存键唯一。

## Go 管道

为了便于阅读，本文档中的 Hugo Pipes 示例使用 Go 管道写法：

```go-html-template
{{ $style := resources.Get "sass/main.scss" | css.Sass | resources.Minify | resources.Fingerprint }}
<link rel="stylesheet" href="{{ $style.Permalink }}">
```

管道把左边表达式的结果作为**最后一个参数**传给右边的函数，所以 `A | f` 等价于 `f A`。函数自己的选项要写成 `f $opts A` 的形式，在管道里就是：

```go-html-template
{{ $opts := dict "transpiler" "dartsass" }}
{{ $r := resources.Get "sass/main.scss" | css.Sass $opts }}
```

**顺序记成一句话**：转换 → 压缩 → 指纹。指纹必须最后，否则哈希对应的不是最终发布出去的那份内容。

## 缓存

Hugo Pipes 的每次调用都以整条*管道链*为键进行缓存。一条管道链的例子是：

```go-html-template
{{ $mainJs := resources.Get "js/main.js" | js.Build "main.js" | minify | fingerprint }}
```

一条管道链在同一次站点构建中只会于第一次遇到时执行，其余情况都从缓存读取结果。因此，即便某个模板要被执行成千上万次，Hugo Pipes 也不会对构建速度造成负面影响。

**代价**：同一条链的结果会被复用，所以「我明明改了源文件」并不足以让结果变化——缓存没失效时会沿用它。怀疑缓存干扰判断时，用 `hugo --ignoreCache` 重建一次再下结论。

## 完整可运行示例

下面这套步骤不依赖任何主题，在新项目里可以直接跑通。**需要 Hugo extended 版的只有 `css.Sass` 那一步；本示例用的是 `resources.Minify` 与 `resources.Fingerprint`，任何版本都能跑。**

**① 建项目并进入目录**（后面所有命令都在项目根目录执行）：

```bash
hugo new project pipes-demo
cd pipes-demo
```

**② 新建资源文件** `assets/css/main.css`：

```css
body {
  font-family: system-ui, sans-serif;
  color: #222;
}
```

**③ 新建首页模板** `layouts/home.html`（当前模板系统中首页模板就是这个名字）：

```go-html-template {file="layouts/home.html"}
{{ with resources.Get "css/main.css" }}
  {{ $css := . | minify | fingerprint }}
  <!doctype html>
  <html lang="zh-cn">
    <head>
      <meta charset="utf-8">
      <title>Hugo Pipes 演示</title>
      <link rel="stylesheet" href="{{ $css.RelPermalink }}" integrity="{{ $css.Data.Integrity }}" crossorigin="anonymous">
    </head>
    <body>
      <h1>资源管道跑通了</h1>
    </body>
  </html>
{{ end }}
```

**④ 构建并在本地查看**：

```bash
hugo server
```

### 你应当看到什么

- 终端打印出本地地址（默认 `http://localhost:1313/`），并且**没有** `ERROR`；
- 浏览器打开该地址，能看到「资源管道跑通了」这行字，且文字是有样式的（无衬线字体）；
- 在页面上右键 →「查看网页源代码」，`<link>` 的 `href` 形如 `/css/main.<一长串十六进制字符>.css`。**路径里有哈希，就说明 `fingerprint` 生效了**；
- 浏览器开发者工具的 Network 面板里，这个 CSS 请求返回 `200`。

再执行一次 `hugo`，然后看磁盘：

```bash
hugo
```

- 项目根目录出现 `public/css/main.<哈希>.css`，文件名与页面里引用的一致；
- 打开该文件，内容是压缩过的（空白与换行被去掉）。

只要这四条对得上，说明「取得 → 加工 → 发布」这条链路你已经打通了。

## 什么时候用 / 什么时候别用

**该用 Hugo Pipes 的时候**

- 文件需要**转换**：SCSS/Sass 编译、PostCSS 插件、TypeScript/JSX 转译、JS 打包；
- 文件需要**压缩或加指纹**：希望用 `main.<hash>.css` 这类文件名做长期缓存，或用 `integrity` 做完整性校验；
- 内容**不是来自磁盘文件**：来自站点配置、页面参数或模板计算，用 `resources.FromString` / `resources.ExecuteAsTemplate` 生成；
- 同一份资源**被多个模板引用**：管道链有缓存，重复引用不会重复计算。

**别用 Hugo Pipes 的时候**

- 文件**不需要任何转换**：放进 `static/` 让 Hugo 直接复制，少一层出错的可能；
- 只是想**在页面上显示图片**并做缩放/裁剪：那是[图像处理](/content-management/image-processing/)的职责，走 `.Resize` 一类方法；
- 资源**属于某个页面**：用[页面资源](/content-management/page-resources/)，而不是把它硬塞进全局 `assets/` 再用字符串拼路径；
- 依赖关系**需要真 Node 生态**（React 组件库、Vue 单文件组件）：`js.Build` 能打包，但复杂前端工程该交给 Vite/Webpack 之类工具，把产物放进 `assets/` 再交给 Hugo 加指纹。

## 常见坑

**① 命令找不到（命令类）**

```text
hugo: command not found
```

终端里没有 `hugo` 这个命令。先解决它，Hugo Pipes 的所有问题都排在它后面——见[安装 Hugo](/installation/)。若你在项目根目录外执行命令，Hugo 找不到 `hugo.toml`，会构建出一个空站点且**不报错**，看起来也像「资源没生效」。

**② 没报错但结果不对（静默失败类）**

| 现象 | 真正的原因 | 怎么确认 |
| --- | --- | --- |
| `public/` 里没有那份资源 | 模板里从没调用过它的 `.Permalink` / `.RelPermalink` / `.Publish` | 搜模板里是否出现过该变量 |
| 页面没有样式，但构建成功 | `main.scss` 放在了 `static/` 而非 `assets/` | 看 `public/css/main.scss` 是否存在（原样出现了就是放错了） |
| 改了源文件，输出没变 | 管道链缓存未失效 | 用 `hugo --ignoreCache` 重建 |
| 页面空白，控制台无报错 | `resources.Get` 返回了 `nil`，`with` 把整段跳过了 | 临时用 `{{ errorf "missing: %s" "css/main.css" }}` 之类手段确认路径拼错没有 |

**③ 报错看不懂（报错类）**

- 报错里出现 `can't evaluate field RelPermalink in type resource.Resource` 一类「无法取值」：多半是上游某个函数返回了 `nil`，把 `with` 补上；
- 报错里出现 `TOCSS: ... this feature is not available in your current Hugo version`：用了非 extended 版却调用 `css.Sass`，见[把 Sass 编译为 CSS](/hugo-pipes/transpile-sass-to-css/)；
- 报错指向**另一个文件**或不涉及资源：渲染期的问题（短代码、编码、配置）常常这样冒出来，先查[故障排查](/troubleshooting/)。

排查的基本顺序是：**资源是否存在 → 是否被引用 → 缓存是否干扰**。这三步走完，绝大多数问题都能定位。

## 相关页面

- [把 Sass 编译为 CSS](/hugo-pipes/transpile-sass-to-css/)
- [页面资源](/content-management/page-resources/)
- [目录结构](/getting-started/directory-structure/)（判断文件该放 `assets/` 还是 `static/`）
- [故障排查](/troubleshooting/)
- [命令](/commands/)
