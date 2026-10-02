+++
title = "Hugo Pipes"
linkTitle = "Hugo Pipes"
description = "用资源管道把 assets 目录里的文件取得、转换、压缩、加指纹并发布出去。本章给出环境依赖、阅读顺序与常见报错的排查入口。"
date = 2026-10-01
weight = 50
source = "https://gohugo.io/hugo-pipes/"
+++

## 本章内容

Hugo Pipes 是一组用于处理资源的函数。所谓资源（resource），是位于 `assets` 目录中，或位于通过模块挂载映射到 `assets` 目录中的文件；此外还有可从 HTTP 或 HTTPS 服务器取得的远程资源。用这些函数可以把 Sass 编译为 CSS、用 PostCSS 处理样式表、打包并转译 JavaScript，再压缩、加指纹并发布到站点。

本章各个页面分别介绍：

| 页面 | 解决的问题 | 额外依赖 |
| --- | --- | --- |
| [简介](/hugo-pipes/introduction/) | 资源的查找、获取、复制、发布与缓存机制 | 无 |
| [把 Sass 编译为 CSS](/hugo-pipes/transpile-sass-to-css/) | 用 `css.Sass` 把 SCSS / Sass 编译为 CSS | Hugo **extended**（内置 LibSass），或另装 Dart Sass |
| [PostCSS](/hugo-pipes/postcss/) | 用 `css.PostCSS` 配合任意 PostCSS 插件 | Node.js + 项目内安装的 `postcss-cli` |
| [JavaScript 构建](/hugo-pipes/js/) | 用 `js.Build` 打包、转译、摇树、压缩 JavaScript | 无（esbuild 已内置）；要 `import` npm 包时才需要 Node.js |
| [资源打包](/hugo-pipes/bundling/) | 用 `resources.Concat` 把多个同类型资源拼接成一份 | 无 |
| [资源压缩](/hugo-pipes/minification/) | 用 `resources.Minify` 压缩文本类资源 | 无 |
| [资源指纹](/hugo-pipes/fingerprint/) | 用 `resources.Fingerprint` 生成哈希文件名与 SRI 值 | 无 |
| [从字符串创建资源](/hugo-pipes/resource-from-string/) | 用 `resources.FromString` 生成内容来自变量或配置的资源 | 无 |
| [从模板创建资源](/hugo-pipes/resource-from-template/) | 用 `resources.ExecuteAsTemplate` 执行资源里的模板动作 | 无 |

## 读完本章你应该能够

- 判断一份文件属于**全局资源**、**远程资源**还是**页面资源**，并用对应的函数把它取出来；
- 把「取得 → 转换 → 压缩 → 指纹」写成一条管道链，并说出每一环为什么放在那个位置；
- 用 `css.Sass` 把 SCSS 编译成 CSS、用 `css.PostCSS` 跑插件、用 `js.Build` 打包 JavaScript；
- 用 `resources.Concat`、`resources.Minify`、`resources.Fingerprint` 产出带哈希文件名和 `integrity` 的最终资源；
- 在资源没有出现在 `public/` 目录时，按「资源是否存在 → 是否被引用 → 是否被缓存」的顺序自己定位问题。

## 开始之前：先确认环境

本章多数页面开箱可用，但有三处依赖会直接决定构建是否成功。**先花一分钟确认，比构建失败后再回查省事得多。**

**① Hugo 是否为 extended 版。** `css.Sass` 的内置 LibSass 转译器只编进 extended 与 extended/deploy 版本：

```bash
hugo version
```

你应当看到版本号里带 `+extended`，例如：

```text
hugo v0.167.0+extended windows/amd64 BuildDate=... VendorInfo=gohugoio
```

没有 `+extended` 时，`css.Sass` 会直接构建失败；此时要么换成 extended 版，要么改用 Dart Sass 转译器（参见[把 Sass 编译为 CSS](/hugo-pipes/transpile-sass-to-css/)）。

**② 需要 Node.js 时它是否可用。** [PostCSS](/hugo-pipes/postcss/) 与「从 npm 导入」的 [JavaScript 构建](/hugo-pipes/js/) 都要用到 Node.js，而且依赖必须装在**项目根目录**下：

```bash
node --version
npm --version
```

记下这两个版本号：向他人求助时它们和 `hugo version` 的输出一样重要。

**③ Dart Sass 是否在 `PATH` 里（可选）。** 想用 Sass 的最新特性时需要它：

```bash
hugo env
```

这条命令会列出当前构建实际可用的组件（转译器、依赖库等）。若输出里没有 Dart Sass，而你又把 `transpiler` 设成了 `dartsass`，构建就会在 Sass 环节报错。

## 阅读顺序

按下面的顺序读，后面的页面默认你已经知道前面讲过的东西：

1. **[简介](/hugo-pipes/introduction/)** —— 先弄懂「资源」是什么、怎么取、什么时候才会被发布到 `public/`。这是本章唯一必须按顺序读的页面。
2. **[把 Sass 编译为 CSS](/hugo-pipes/transpile-sass-to-css/)** —— 最常见的样式构建入口，也是 extended 版本差异最容易绊人的地方。
3. **[PostCSS](/hugo-pipes/postcss/)** —— 当你需要插件生态（自动前缀、嵌套、压缩）时走这条路。
4. **[JavaScript 构建](/hugo-pipes/js/)** —— 打包、转译、摇树与 source map。
5. **[资源打包](/hugo-pipes/bundling/) → [资源压缩](/hugo-pipes/minification/) → [资源指纹](/hugo-pipes/fingerprint/)** —— 三件事通常连用，顺序也是这个顺序。
6. **[从字符串创建资源](/hugo-pipes/resource-from-string/) → [从模板创建资源](/hugo-pipes/resource-from-template/)** —— 内容不来自磁盘文件时的两种做法按需查阅。

## 处理资源的一般步骤

无论处理哪一类资源，流程都是相同的：先取得资源，再把资源送进一条由若干函数首尾相接组成的管道链，最后把结果发布出去。

```go-html-template
{{ $style := resources.Get "sass/main.scss" | css.Sass | resources.Minify }}
<link rel="stylesheet" href="{{ $style.RelPermalink }}">
```

上例中的竖线就是 Go 模板的管道语法，它把前一个函数的结果作为最后一个参数传给后一个函数，因此写法是从左到右依次变换。

**把顺序记成一句话**：转换（编译）→ 压缩 → 指纹。转换在前，因为后面两步处理的是转换后的内容；指纹在最后，因为哈希必须对应最终发布出去的那份文件。

## 取得资源

全局资源用下列方法取得：`resources.Get`、`resources.GetMatch`、`resources.Match`、`resources.ByType`。远程资源用 `resources.GetRemote` 取得。要复制已有资源，用 `resources.Copy`。若资源与某个页面打包在一起，则属于页面资源，需通过 `Page` 对象上的方法访问，详见[页面资源](/content-management/page-resources/)。

**会怎样**：这几个函数在**找不到资源时返回 `nil`**，而不是返回一个空资源。把 `nil` 直接交给管道后面的函数会立刻构建失败（后续页面里用 `with` 包住，就是在防这一手）。

## 发布与指纹

Hugo 在调用资源的 `.Permalink`、`.RelPermalink` 或 `.Publish` 方法时把它发布到 `publishDir`（默认是 `public`）。若不想产生独立文件，可以用 `.Content` 把资源内容直接内联到页面中。生产环境通常还会追加指纹，例如 `resources.Fingerprint`，以便利用浏览器缓存并在必要时通过 `integrity` 属性做子资源完整性校验。

**为什么这很重要**：只写 `{{ resources.Get "css/main.css" }}` 而从不引用结果的**方法**，文件不会出现在 `public/` 里，而且**不会报任何错**。这是 Hugo Pipes 新手最常见的一类「没报错但结果不对」。

## 缓存与并发

Hugo Pipes 的调用以整条管道链为键进行缓存：一条管道链在同一次站点构建中只会在第一次遇到时执行，其余调用直接读取缓存结果。因此即便某个模板要执行成千上万次，也不会因此拖慢构建速度。

缓存的代价是：改了资源文件的内容或管道选项之后，结果不会因为「重新执行一次」而变化——构建缓存未失效时会沿用旧结果。怀疑缓存干扰判断时，用 `hugo --ignoreCache` 重新构建一次（这是本站自检时也使用的参数）。

## 配置

与构建相关的设置位于 `[build]` 配置分类中，例如 `noJSConfigInAssets` 与 `cachebusters`；PostCSS 自身的选项则写在项目根目录的 `postcss.config.js` 一类配置文件中。若在处理样式表时希望改变资源缓存的使用时机，可留意该分类下的相关键，具体含义见[配置 Hugo](/configuration/)。

## 卡住了怎么办

先按现象定位。下表按「命令找不到 / 没报错但结果不对 / 报错看不懂」三类列出最常见的入口：

| 类别 | 现象 | 通常的原因 | 先去这里 |
| --- | --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 不是内部或外部命令 | Hugo 没装好或没进 `PATH` | [安装 Hugo](/installation/) |
| 报错看不懂 | `TOCSS: ... this feature is not available in your current Hugo version` | 用的是非 extended 版，却又调用 `css.Sass` | [把 Sass 编译为 CSS](/hugo-pipes/transpile-sass-to-css/) |
| 命令找不到 | `exec: "postcss": executable file not found` 一类报错 | 没在项目里 `npm install`，或不在项目根目录执行 | [PostCSS](/hugo-pipes/postcss/) |
| 报错看不懂 | `Could not resolve "some-package"` | 引用了 npm 依赖但没执行 `npm install` | [JavaScript 构建](/hugo-pipes/js/) |
| 没报错但结果不对 | 构建成功，但 `public/` 里找不到那份资源 | 资源从未被 `.Permalink` / `.RelPermalink` / `.Publish` 引用 | [简介](/hugo-pipes/introduction/) |
| 没报错但结果不对 | 改了源文件，输出却没变 | 构建缓存未失效 | 用 `hugo --ignoreCache` 重建，见[缓存与并发](#缓存与并发) |
| 报错看不懂 | 报错看起来完全不涉及资源 | 短代码占位符、配置编码等问题也会在渲染期爆出来 | [故障排查](/troubleshooting/) |
| 报错看不懂 | 报错指向的文件并不是你改的那个 | Hugo 的报错归因只是线索，不一定是事实 | [故障排查](/troubleshooting/) |

更系统的排查顺序（先确认输入，再确认模板，最后确认输出目录）见[故障排查](/troubleshooting/)；命令行参数见[命令](/commands/)。
