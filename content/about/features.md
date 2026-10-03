+++
title = "特性"
linkTitle = "特性"
description = "Hugo 的功能集：框架、内容创作、内容管理、资源管道与性能，并说明哪些能力需要额外安装或改配置才能用。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/about/features/"
+++

## 这一页解决什么问题

这一页是 Hugo 的能力清单，用来回答「我要做的这件事，Hugo 有没有现成支持」。内容按五个分区组织：框架、内容创作、内容管理、资源管道、性能。

用法建议：先扫分区标题，找到与自己需求相关的那几项，再点进对应页面看具体做法。**清单里写着「支持」，不等于你手上这份 Hugo 开箱就能用**——有的能力要装扩展版或 Node.js，有的要改配置（Markdown 扩展开关、安全策略放行）。本页末尾的「怎么确认这些特性在你这一版可用」给出核对命令，[常见坑](#常见坑)列出最容易误判的几种情况。

## 框架

[跨平台](/installation/)
: 在 Linux、macOS、Windows 等系统上安装单个可执行文件即可使用。

[多语言](/content-management/multilingual/)
: 为每种语言和地区本地化项目，包括翻译、图片、日期、货币、数字、百分比与排序规则；支持单主机与多主机配置。

[输出格式](/configuration/output-formats/)
: 把页面渲染为一种或多种输出格式，可按页面类型、section 和路径控制；HTML 为默认格式，还可添加 JSON、RSS、CSV 等。例如，可以另做一个 REST API 来访问内容。

[模板](/templates/introduction/)
: 用变量、函数和方法编写模板，把内容、资源和数据转换成发布的页面；HTML 模板最常见，也可为任何输出格式创建模板。

主题
: 使用社区贡献的数百个主题减少开发时间和成本；主题覆盖企业站点、文档项目、作品集、落地页、博客、简历等。可从 [themes.gohugo.io](https://themes.gohugo.io/) 获取。

[模块](/hugo-modules/)
: 创建或导入打包好的原型、资源、内容、数据、模板、翻译表、静态文件或配置；模块可作为新项目的基础，也可增强已有项目。

[隐私](/configuration/privacy/)
: 通过配置项目，帮助符合各地区的隐私法规。

[安全](/about/security/)
: 安全模型假定模板与配置作者可信、内容作者不可信，可生成防范代码注入的 HTML；其他保护可阻止调用任意应用、限制环境变量访问、阻止连接任意远程数据源。

## 内容创作

[内容格式](/content-management/formats/)
: 支持 Markdown、HTML、AsciiDoc、Emacs Org Mode、Pandoc 与 reStructuredText；默认的 Markdown 遵循 [CommonMark](https://spec.commonmark.org/current/) 与 [GitHub Flavored Markdown](https://github.github.com/gfm/) 规范。其中 AsciiDoc、Pandoc、reStructuredText 需要本机装好对应的外部程序，并把它加入 `security.exec.allow`——默认策略不放行这三个程序，见[配置安全](/configuration/security/)。

[Markdown 属性](/content-management/markdown-attributes/)
: 为 Markdown 图片和块级元素（引用块、代码块、标题、分隔线、列表、段落、表格）添加 `class`、`id` 等属性。

[Markdown 扩展](/configuration/markup/#扩展)
: 利用内置扩展创建表格、定义列表、脚注、任务列表、插入文本、标记文本、下标、上标等。其中插入文本、标记文本、下标、上标对应的开关默认关闭，需要先开启。

[Markdown 渲染钩子](/render-hooks/introduction/)
: 渲染引用块、代码块、标题、图片、链接和表格时，可覆盖 Markdown 到 HTML 的转换，例如把独立图片渲染为 `figure` 元素。

[图表](/content-management/diagrams/)
: 用围栏代码块和渲染钩子在内容中加入图表。

[数学公式](/content-management/mathematics/)
: 用 LaTeX 标记在 Markdown 中加入数学公式和表达式。

[语法高亮](/content-management/syntax-highlighting/)
: 用内置高亮器高亮代码，Markdown 围栏代码块默认启用；支持数百种语言和数十种样式。

[短代码](/shortcodes/)
: 使用内置短代码或自行创建，插入复杂内容，例如 `audio`、`video` 元素、从数据源渲染表格、插入其他页面的片段。

## 内容管理

[多维内容模型](/quick-reference/glossary/sites-matrix/)
: 从单一来源按语言、版本和角色的任意组合生成页面，同一份内容可发布到项目内的多个 [sites](g)，无需复制文件。

[内容适配器](/content-management/content-adapters/)
: 在构建时动态添加内容，例如从 JSON、TOML、YAML 或 XML 等远程数据源生成页面。

[分类法](/content-management/taxonomies/)
: 对内容分类，在页面之间建立逻辑关系，例如建立作者分类法并指派作者；分类系统还提供带权重的倒排索引，按相关度渲染相关页面列表。

[数据](/content-management/data-sources/)
: 用 CSV、JSON、TOML、YAML 和 XML 等本地或远程数据源扩充内容，例如用短代码从远程 CSV 渲染表格。

[菜单](/content-management/menus/)
: 通过菜单系统快速访问内容，可全局、自动或逐页配置，是 Hugo 多语言架构的关键部分。

[URL 管理](/content-management/urls/)
: 通过全局或逐页配置，从任意路径提供任意页面。

## 资源管道

[CSS 处理](/functions/css/build/)
: 打包、转换、压缩、生成 source map、SRI 哈希，并集成 PostCSS。

[图像处理](/content-management/image-processing/)
: 转换、缩放、裁剪、旋转、调整颜色、应用滤镜、叠加文字和图片，以及提取元数据。

[JavaScript 打包](/functions/js/build/)
: 把 TypeScript 与 JSX 转译为 JavaScript，并打包、tree shake、压缩、生成 source map、SRI 哈希。

[Sass 处理](/functions/css/sass/)
: 把 Sass 转译为 CSS，并打包、tree shake、压缩、生成 source map、SRI 哈希，可集成 PostCSS。

[Tailwind CSS 处理](/functions/css/tailwindcss/)
: 把 Tailwind CSS 工具类编译为标准 CSS，并打包、tree shake、优化、压缩、SRI 哈希，可集成 PostCSS。

## 性能

[缓存](/functions/partials/includecached/)
: 把局部模板渲染一次后缓存结果（全局或指定上下文），减少构建时间和成本，例如避免资源管道结果在每页重复处理。

[分段](/configuration/segments/)
: 把站点划分为多个分段以减少构建时间和成本，例如每小时渲染首页和新闻区块、每周渲染整个项目。

[压缩](/configuration/minify/)
: 压缩 HTML、CSS 和 JavaScript，减小文件体积、带宽占用和加载时间。

## 怎么确认这些特性在你这一版可用

清单描述的是 Hugo 的能力，不等于你手上这份立刻能做。三条命令就能问清楚：

```bash
hugo version                # 版本号，以及是不是 extended 版
hugo env                    # 版本、平台，以及编译进来的库（如 libsass）
hugo config --printZero     # 连同默认值一起打印生效配置
```

`--printZero` 是关键：不带它时，`hugo config` 只打印被显式设置过的键，默认值看不到。

**实测环境**：Hugo v0.167.0（windows/amd64，extended），用**未做任何配置覆盖**的空项目跑 `hugo config --printZero`（本节所有默认值都取自这次输出，因此与你自己项目的实际生效值可能不同——你自己的项目若覆盖过某个键，就要以你那份输出为准）。据此得到：

> 注意区分「默认值」与「本站的生效值」：本站在 `hugo.toml` 里显式开了 `[markup.goldmark.extensions.passthrough]`（数学公式透传），所以下面列的 `extensions` 默认开关在**本站**并非全部保持默认。要看你自己的站点，跑 `hugo config --printZero` 对照。

- `security.exec.allow` 的默认值是 `^(dart-)?sass$`、`^go$`、`^git$`、`^node$`、`^postcss$`。也就是说 Sass 与 PostCSS 相关的外部程序默认可用，而 **AsciiDoc、Pandoc、reStructuredText、Tailwind CSS CLI 都不在清单里**；用到它们时构建会失败，并在报错里点出被拒绝的程序名。Tailwind 的官方配置示例要求显式加入 `^tailwindcss$`，见 [Tailwind CSS 处理](/functions/css/tailwindcss/)。
- `markup.goldmark.extensions` 默认开启的是 `definitionList`、`linkify`、`strikethrough`、`table`、`taskList` 与脚注；`extras` 下的 `insert`、`mark`、`delete`、`subscript`、`superscript` 默认都是 `false`。所以「插入文本、标记文本、下标、上标」要先打开对应开关。
- `hugo version` 里有没有 `+extended`，决定内嵌 LibSass 在不在。用的是标准版又想处理 Sass 时，可以安装 Dart Sass 并把 `transpiler` 设为 `dartsass`（上游：[Sass 处理](/functions/css/sass/)；内嵌 LibSass 自 v0.153.0 起弃用，将来会移除）。

**你应当看到什么**：`hugo config --printZero` 的输出里能找到 `[security]`、`[markup.goldmark.extensions]` 两个分区，值形如上文所列。你项目里改过的键会显示成你写的值——这也是核对「配置到底生效没有」最直接的办法。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 按「Sass 处理」配置好之后，构建报找不到 Sass 编译器 | 装的是标准版（没有内嵌 LibSass），或想用新语法但没安装 Dart Sass | `hugo version` 看有没有 `+extended`；或安装 Dart Sass 并设 `transpiler = "dartsass"`，见 [Sass 处理](/functions/css/sass/) |
| 「Tailwind CSS 处理」构建失败，报外部程序未被允许 | 默认 `security.exec.allow` 里没有 `tailwindcss`（实测 v0.167.0） | 按 [Tailwind CSS 处理](/functions/css/tailwindcss/) 把 `^tailwindcss$` 加进 `security.exec.allow`；该功能还需要用 npm 安装 Tailwind CSS v4 或更高版本 |
| 「Markdown 扩展」里的插入文本、标记文本、下标、上标不生效 | `markup.goldmark.extensions.extras.*` 默认关闭（实测 v0.167.0） | 在[配置 Markdown](/configuration/markup/#扩展)里打开对应开关 |
| 内容格式选 AsciiDoc / Pandoc / reStructuredText，构建失败 | 这三种格式要调用外部程序，默认不在 `security.exec.allow` 里 | 先装对应程序，再把名字加入白名单，见[内容格式](/content-management/formats/)与[配置安全](/configuration/security/) |
| 用了「缓存」一节提到的 `partialCached`，构建却没有变快 | `partialCached` 按调用时传入的变体参数区分缓存；传进去的值每次都不同，等于每次都新建一份缓存 | 让缓存的变体参数保持稳定，细节见 [partialCached](/functions/partials/includecached/) |

配置类的报错（权限被拒、开关未开）通常会在构建时报出具体键名；完整的分诊入口见[故障排查](/troubleshooting/)。
