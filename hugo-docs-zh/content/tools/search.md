+++
title = "站内搜索"
linkTitle = "站内搜索"
description = "为静态站点添加搜索功能的开源与商业方案。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/tools/search/"
+++

## 简介

静态网站也能有动态搜索功能吗？可以。对于静态网站，Hugo 提供了 Google 或其他搜索引擎嵌入式脚本之外的另一种选择：Hugo 允许你直接为内容文件建立索引，从而给访客提供自定义的搜索功能。

常见做法有两种。一种是在构建阶段生成索引文件——Hugo 可以输出 JSON 或 HTML 形式的索引，再由浏览器端的脚本读取并匹配，整个过程不需要服务器。另一种是接入第三方的搜索服务，把内容推送到对方的索引中，通过 API 或嵌入的脚本返回结果，适合内容量大或需要多语言分词的站点。

## 开源方案

[Pagefind][]
: 一个完全静态的搜索库，目标是在大型站点上也有良好表现，同时尽可能少占用用户的带宽。

[GitHub Gist for Hugo Workflow][]
: 这个 gist 包含一套简单的工作流，用于为静态网站创建搜索索引。它用一个简单的 Grunt 脚本为所有内容文件建立索引，并用 [lunr.js][] 提供搜索结果。

[hugo-lunr][]
: 用 [lunr.js][] 为静态 Hugo 站点添加站内搜索的简单方式。hugo-lunr 会为 Hugo 项目中的 HTML 与 Markdown 文档创建索引文件。

[hugo-lunr-zh][]
: 与 Hugo-lunr 有些相似，但 Hugo-lunr-zh 能帮你切分中文关键词。

[GitHub Gist for Fuse.js integration][]
: 这个 gist 演示了如何利用 Hugo 现有的构建期处理，生成可供客户端 [Fuse.js][] 使用的可搜索 JSON 索引。虽然这个 gist 用 Fuse.js 做模糊匹配，但任何能读取 JSON 索引的客户端搜索工具都可以。除了 Hugo 之外，不需要 npm、grunt 或其他构建期工具。

[hugo-search-index][]
: 一个包含 Gulp 任务与预构建浏览器脚本的库，用于实现搜索。Gulp 会根据项目中的 Markdown 文件生成搜索索引。

[hugofastsearch][]
: 对「GitHub Gist for Fuse.js integration」的可用性与速度改进——全局的、为键盘操作优化的搜索。

[JS & Fuse.js tutorial][]
: 一个简单的客户端搜索方案，使用 FuseJS（不需要 jQuery）。

[hugo-zbsearch][]
: 一个 Hugo 模块，提供由 [ZBSearch][] 驱动的客户端全文搜索。支持 27 种语言的分词、拼写容错、字段权重提升，并可用于任何主题。以 Hugo 模块的形式分发，除 `hugo mod get` 外无需任何配置。

[INFINI Pizza for WebAssembly][]
: Pizza 是一个用 Rust 编写的超轻量却功能完整的搜索引擎。只需三行代码，你就可以在五分钟内为 Hugo 网站快速加上离线搜索功能。关于与 Hugo 集成的分步指南，请查看[这篇博客教程][this blog tutorial]。

[searchmysite.net][]
: 一个无广告、注重隐私的 Google Programmable Search 替代品，聚焦于个人网站：把你的站点加入 searchmysite.net（如果还没有的话），然后用一行代码给你的 Hugo 站点加上站内搜索框。免费档会在你的站点上显示搜索框，结果页在 searchmysite.net 上；付费档会把结果嵌入你的站点（并允许你按需重建索引等）。全部[开源][open source]，也支持自行托管。参见 [Website Search Tool][] 以及一篇[带 Hugo 示例的博客文章][blog post with a Hugo-specific example]。

## 商业方案

[Algolia DocSearch][]
: Algolia DocSearch 对公开的技术文档站点免费，且易于设置。其他场景可以使用 [Algolia 的搜索 API][Algolia's Search API]，在应用与网站中轻松提供出色的搜索体验。Algolia Search 提供托管的全文本、数值、分面与地理位置搜索。

[Bonsai][]
: Bonsai 是全托管的 Elasticsearch 服务，速度快、可靠，设置简单。按照[官方文档中的这篇指南][this guide from the docs]，可以轻松地把 Hugo 中的文档导入 Elasticsearch。

[ExpertRec][]
: ExpertRec 是托管的搜索即服务方案，快速且可扩展。设置与集成极其简单，几分钟即可完成。搜索设置可以通过仪表盘调整，无需编写代码。

[Algolia DocSearch]: https://docsearch.algolia.com/
[Algolia's Search API]: https://www.algolia.com
[Bonsai]: https://www.bonsai.io
[ExpertRec]: https://www.expertrec.com/
[Fuse.js]: https://fusejs.io/
[GitHub Gist for Fuse.js integration]: https://gist.github.com/eddiewebb/735feb48f50f0ddd65ae5606a1cb41ae
[GitHub Gist for Hugo Workflow]: https://gist.github.com/sebz/efddfc8fdcb6b480f567
[INFINI Pizza for WebAssembly]: https://github.com/infinilabs/pizza-docsearch
[JS & Fuse.js tutorial]: https://makewithhugo.com/add-search-to-a-hugo-site/
[Pagefind]: https://github.com/cloudcannon/pagefind
[hugo-lunr-zh]: https://www.npmjs.com/package/hugo-lunr-zh
[hugo-lunr]: https://www.npmjs.com/package/hugo-lunr
[hugo-search-index]: https://www.npmjs.com/package/hugo-search-index
[hugo-zbsearch]: https://github.com/serenasensini/hugo-zbsearch
[hugofastsearch]: https://gist.github.com/cmod/5410eae147e4318164258742dd053993
[lunr.js]: https://lunrjs.com/
[this blog tutorial]: https://dev.to/medcl/adding-search-functionality-to-a-hugo-static-site-based-on-infini-pizza-for-webassembly-4h5e
[this guide from the docs]: https://bonsai.io/docs/hugo
[ZBSearch]: https://github.com/micheleriva/zbsearch
[searchmysite.net]: https://searchmysite.net/
[open source]: https://github.com/searchmysite/searchmysite.net
[Website Search Tool]: https://searchmysite.net/pages/website-search-tool/
[blog post with a Hugo-specific example]: https://blog.searchmysite.net/posts/one-line-to-add-a-site-specific-search-to-your-site/
