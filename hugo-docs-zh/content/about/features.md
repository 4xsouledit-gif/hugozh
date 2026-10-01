+++
title = "特性"
linkTitle = "特性"
description = "Hugo 的功能集：框架、内容创作、内容管理、资源管道与性能。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/about/features/"
+++

## 框架

跨平台
: 在 Linux、macOS、Windows 等系统上安装单个可执行文件即可使用。

[多语言](/content-management/multilingual/)
: 为每种语言和地区本地化项目，包括翻译、图片、日期、货币、数字与排序规则；支持单主机与多主机配置。

输出格式
: 把页面渲染为一种或多种输出格式，可按页面类型、section 和路径控制；HTML 为默认格式，还可添加 JSON、RSS、CSV 等。

模板
: 用变量、函数和方法编写模板，把内容、资源和数据转换成发布的页面；也可为任何输出格式创建模板。

主题
: 使用社区贡献的数百个主题减少开发时间和成本；主题覆盖企业站点、文档项目、作品集、落地页、博客、简历等。可从 [themes.gohugo.io](https://themes.gohugo.io/) 获取。

模块
: 创建或导入打包好的原型、资源、内容、数据、模板、翻译表、静态文件或配置；模块可作为新项目的基础，也可增强已有项目。

隐私
: 通过配置项目，帮助符合各地区的隐私法规。

[安全](/about/security/)
: 安全模型假定模板与配置作者可信、内容作者不可信，可生成防范代码注入的 HTML；其他保护可阻止调用任意应用、限制环境变量访问、阻止连接任意远程数据源。

## 内容创作

[内容格式](/content-management/content-formats/)
: 支持 Markdown、HTML、AsciiDoc、Emacs Org Mode、Pandoc 与 reStructuredText；默认的 Markdown 遵循 CommonMark 与 GitHub Flavored Markdown 规范。

[Markdown 属性](/content-management/markdown-attributes/)
: 为 Markdown 图片和块级元素（引用块、代码块、标题、分隔线、列表、段落、表格）添加 `class`、`id` 等属性。

Markdown 扩展
: 利用内置扩展创建表格、定义列表、脚注、任务列表、插入文本、标记文本、下标、上标等。

Markdown 渲染钩子
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

多维内容模型
: 从单一来源按语言、版本和角色的任意组合生成页面，同一份内容可发布到项目内的多个站点，无需复制文件。

内容适配器
: 在构建时动态添加内容，例如从 JSON、TOML、YAML 或 XML 等远程数据源生成页面。

[分类法](/content-management/taxonomies/)
: 对内容分类，在页面之间建立逻辑关系，例如建立作者分类法并指派作者；分类系统还提供带权重的倒排索引，按相关度渲染相关页面列表。

数据
: 用 CSV、JSON、TOML、YAML 和 XML 等本地或远程数据源扩充内容，例如用短代码从远程 CSV 渲染表格。

[菜单](/content-management/menus/)
: 通过菜单系统快速访问内容，可全局、自动或逐页配置，是 Hugo 多语言架构的关键部分。

[URL 管理](/content-management/urls/)
: 通过全局或逐页配置，从任意路径提供任意页面。

## 资源管道

CSS 处理
: 打包、转换、压缩、生成 source map、SRI 哈希，并集成 PostCSS。

[图像处理](/content-management/image-processing/)
: 转换、缩放、裁剪、旋转、调整颜色、应用滤镜、叠加文字和图片，以及提取元数据。

JavaScript 打包
: 把 TypeScript 与 JSX 转译为 JavaScript，并打包、tree shake、压缩、生成 source map、SRI 哈希。

Sass 处理
: 把 Sass 转译为 CSS，并打包、tree shake、压缩、生成 source map、SRI 哈希，可集成 PostCSS。

Tailwind CSS 处理
: 把 Tailwind CSS 工具类编译为标准 CSS，并打包、tree shake、优化、压缩、SRI 哈希，可集成 PostCSS。

## 性能

缓存
: 把局部模板渲染一次后缓存结果（全局或指定上下文），减少构建时间和成本，例如避免资源管道结果在每页重复处理。

分段
: 把站点划分为多个分段以减少构建时间和成本，例如每小时渲染首页和新闻区块、每周渲染整个项目。

压缩
: 压缩 HTML、CSS 和 JavaScript，减小文件体积、带宽占用和加载时间。
