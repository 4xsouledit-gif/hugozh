+++
title = "站内搜索"
linkTitle = "站内搜索"
description = "为静态站点添加搜索：构建期 JSON 索引与第三方搜索服务的取舍、最小可用配置与验证方法、中文分词与常见故障。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/tools/search/"

[params.teach]
difficulty = "进阶"
time = "30–60 分钟（构建期索引方案）"
prereq = [
  "站点能正常构建，且你改得动 `hugo.toml` 与 `layouts/`。",
  "知道输出格式（output format）是怎么回事；不确定时先读[输出格式](/configuration/output-formats/)与[输出](/configuration/outputs/)。",
  "会一点浏览器开发者工具的基本用法（看 Network 面板的请求与响应）。",
]
outcomes = [
  "在「构建期生成索引」与「接入第三方搜索服务」之间做出选择，并说出各自代价；",
  "用自定义输出格式让 Hugo 在构建时产出 `search.json`，并验证它含多少条记录；",
  "说清楚静态搜索为什么通常只做匹配、不做排序，以及中文为什么在部分方案里失效；",
  "搜索框没反应时，按「先看 Network、再看索引文件、最后看匹配逻辑」的顺序定位。",
]
next = ["/tools/front-ends/", "/configuration/output-formats/", "/configuration/outputs/", "/quick-reference/glossary/cjk/"]
+++

## 这一页解决什么问题

静态站点没有服务器，那搜索请求由谁来回答？答案是：**要么在构建时把索引预先做好，要么把内容交给别人的服务器。** 这一页帮你在这两条路之间做决定，并给出第一条路的最短可行配置。

先明确一件容易被误解的事：静态搜索通常**只能做「匹配」，做不了像搜索引擎那样的「排序」**。构建期索引的方案把标题、摘要、链接打包成一个 JSON 文件，浏览器下载后做字符串或模糊匹配；内容多、字段多时，这个文件会跟着变大，而你无法像数据库那样只取前几条。

所以判断标准不是「哪个方案先进」，而是：**你的索引文件有多大、中文要不要分词、愿不愿意让内容离开自己的服务器。**

## 两条路线怎么选

| 你的情况 | 建议路线 | 代价 |
| --- | --- | --- |
| 内容规模中小（几百到一两千页），不想引入外部服务 | **构建期索引**（本页最小步骤） | 索引文件大小随页数线性增长，全量下载 |
| 内容很多，或需要更强的相关性、拼写容错、分面筛选 | 第三方搜索服务（Algolia、Bonsai、ExpertRec 等） | 内容需推送到对方服务器；通常按量计费 |
| 中文为主，希望按词切分而不是按字匹配 | 选用带中文分词能力的方案（如 `hugo-lunr-zh`、`hugo-zbsearch`） | 多一个构建期工具或模块 |
| 只要「大站也快、带宽占用低」 | Pagefind 这类以构建产物为输入的工具 | 需要在构建后额外跑一次索引步骤 |
| 站点是公开技术文档 | Algolia DocSearch | 免费档有准入条件，需提交申请 |

一句话取舍：**先用构建期索引做出来，量级上来再换。** 尽早知道自己的索引有多大，比一开始就选一个复杂方案更划算——本页会教你实测这个数字。

## 方案清单

### 开源方案

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

### 商业方案

[Algolia DocSearch][]
: Algolia DocSearch 对公开的技术文档站点免费，且易于设置。其他场景可以使用 [Algolia 的搜索 API][Algolia's Search API]，在应用与网站中轻松提供出色的搜索体验。Algolia Search 提供托管的全文本、数值、分面与地理位置搜索。

[Bonsai][]
: Bonsai 是全托管的 Elasticsearch 服务，速度快、可靠，设置简单。按照[官方文档中的这篇指南][this guide from the docs]，可以轻松地把 Hugo 中的文档导入 Elasticsearch。

[ExpertRec][]
: ExpertRec 是托管的搜索即服务方案，快速且可扩展。设置与集成极其简单，几分钟即可完成。搜索设置可以通过仪表盘调整，无需编写代码。

## 最小可用步骤：构建期 JSON 索引

静态网站也能有动态搜索功能吗？可以。对于静态网站，Hugo 提供了 Google 或其他搜索引擎嵌入式脚本之外的另一种选择：Hugo 允许你直接为内容文件建立索引，从而给访客提供自定义的搜索功能。

思路是**让 Hugo 自己生成索引**。Hugo 内置了 `application/json` 输出格式，你不必安装任何构建期工具，只要在配置里定义一个衍生格式，再写一个模板即可。以下步骤在一个最小站点上实测通过（Hugo v0.167.0，Windows）。

1. 在 `hugo.toml` 中定义输出格式，并把它加到首页的输出列表里：

   ```toml
   [outputFormats.searchjson]
     mediaType      = 'application/json'
     baseName       = 'search'
     isPlainText    = true
     isHTML         = false
     notAlternative = true

   [outputs]
     home = ['html', 'rss', 'searchjson']
   ```

   说明：`baseName = 'search'` 决定产物文件名，`notAlternative = true` 表示它是附加产物、不参与 `<link rel="alternate">` 之类的输出；你自己的站点里 `[outputs]` 可能已经有别的格式，**在原来的列表追加一项即可，不要覆盖**。

2. 新建模板 `layouts/index.searchjson.json`（该格式的模板查找名由「页面 kind + 输出格式名 + 后缀」组成；本项目实测把模板放在项目的 `layouts/` 或主题的 `layouts/` 下都能被找到）：

   ```go-html-template
   [
     {{- range $i, $p := site.RegularPages }}{{ if $i }},{{ end }}
     {"lang": {{ $p.Language.Lang | jsonify }}, "title": {{ $p.Title | jsonify }}, "permalink": {{ $p.Permalink | jsonify }}, "summary": {{ $p.Summary | plainify | jsonify }}}
     {{- end }}
   ]
   ```

   三个要点：用 `jsonify` 转义字符串，否则标题里出现引号就会产出非法 JSON；用 `plainify` 去掉摘要里的 HTML 标签；用 `{{ if $i }},{{ end }}` 在元素之间补逗号，其中 `$i` 是 `range` 给出的元素下标（从 0 开始）。带上 `lang` 字段是为了让多语言站点或前端脚本能自行辨认条目属于哪种语言——多语言下的实测结果见本步骤之后的说明。

3. 构建并检查产物：

   ```bash
   hugo --ignoreCache
   ```

4. 在页面上加一个搜索框，用一小段脚本把索引读进来做匹配：

   ```html
   <input type="search" id="q" placeholder="搜索本站">
   <ul id="hits"></ul>
   <script>
     let index = [];
     fetch('/search.json').then(r => r.json()).then(d => { index = d; });
     document.getElementById('q').addEventListener('input', (e) => {
       const kw = e.target.value.trim();
       const hits = kw ? index.filter(p => (p.title + p.summary).includes(kw)).slice(0, 20) : [];
       document.getElementById('hits').innerHTML =
         hits.map(p => `<li><a href="${p.permalink}">${p.title}</a></li>`).join('');
     });
   </script>
   ```

**你应当看到什么**：

- 构建退出码为 0，`public/search.json` 存在；
- 用浏览器打开 `https://你的域名/search.json`（本地预览时是 `http://localhost:1313/search.json`），能直接看到 JSON 文本；用 `jq` 之类的工具或浏览器的 `JSON.parse` 检查它能被解析；
- 页面里搜索框输入某个**确定存在于正文里的词**，列表出现对应链接，点击能跳到那一页；
- 在开发者工具的 Network 面板里能看到一次对 `search.json` 的请求，响应状态 200。

> [!NOTE]
> **实测（Hugo v0.167.0，本站数据）**：这套机制在本仓库的文档站上可以直接验证——本站首页配置了同类的自定义 JSON 输出，构建后会在 `public/pages.json` 生成全站索引：约 **482 KB、948 条记录**，每条含 `title`、`description`、`url`、`kind`、`section` 等字段。**这就是「先量一量索引有多大」的做法**：构建后直接看产物文件的大小与条目数（本站单语言，语言为 `zh-cn`，`defaultContentLanguage = 'zh-cn'`）。
>
> **实测（Hugo v0.167.0，另建的最小多语言站点）**：站点按语言分目录（`content/en` + `content/zh`），并在 `[languages]` 里为每种语言设置 `contentDir`、各语言 `weight`（未写 `defaultContentLanguage`）时，构建会为每种语言各生成一份索引，且**每份只含该语言的页面**：
>
> - `public/search.json` → `{"lang": "en", "rel": "/post-one/", "title": "English post one"}`
> - `public/zh/search.json` → `{"lang": "zh", "rel": "/zh/post-one/", "title": "中文第一篇"}`
>
> 也就是说，多语言站点上 `$p.Language.Lang` 给出了正确的语言，索引也按语言分开存放；**搜索框要按当前语言拼接索引地址**（中文页请求 `/zh/search.json`），直接写死 `/search.json` 会让中文页读到英文索引。
>
> 但这里有一个真实的坑：**多语言站点如果内容没有按语言分开**（例如所有页面都放在根 `content/` 下、又没有用 `post.en.md` 这类语言后缀，或 `[languages]` 只声明了语言却没给各自的内容目录），构建出来就只有一份**混在一起**的索引，条目里也难以区分语言。此时要么先把内容按语言拆开，要么在客户端按链接前缀过滤。

## 第三方服务路线：你需要额外做什么

选择商业方案时，除了注册与计费，你还需要在构建流程里补一步「把内容推送到对方索引」。因此判断一个方案是否适合，问四个问题：

1. **索引在什么时候更新**：每次构建后都要推送一次？有没有增量接口？
2. **内容要不要外发**：全文、仅标题摘要，还是只提交 URL 让对方抓取？
3. **是否需要构建期变量**：API Key 不能写进仓库，通常要放进构建平台的环境变量。
4. **退出时留下什么**：如果停用服务，页面上的搜索框是否能一键移除，而不是留下一堆失效脚本。

开源方案里，`hugo-zbsearch` 以 Hugo 模块分发（除 `hugo mod get` 外无需配置）、`INFINI Pizza` 需要额外的构建步骤与客户端脚本、`Pagefind` 以构建产物为输入在 `public/` 上再跑一次——三者的「额外一步」各不相同，按你能接受的维护成本选。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 搜索框能输入但没有结果 | 索引请求失败（路径不对、被改写规则拦下、构建时未生成） | 打开开发者工具 Network 面板，直接访问索引 URL：404 说明文件没生成或路径错了 |
| 直接访问 `search.json` 得到 404 | 输出格式没加进 `[outputs].home`，或模板名字不符合查找规则 | 核对 `[outputs]` 是否含 `searchjson`；模板文件名必须是 `index.searchjson.json`（放项目或主题的 `layouts/` 下） |
| 页面整体报错、控制台提示 JSON 解析失败 | 索引里有未转义的引号或换行，多半是忘了 `jsonify` | 给每个字符串字段都加 `jsonify`；用浏览器打开索引文件确认它能被解析 |
| 搜索中文没有结果 | 方案按字/词切分的规则不匹配中文（部分方案依赖空格分词） | 改用明确支持中文分词的工具（`hugo-lunr-zh`、`hugo-zbsearch`）；或先把查询词拆成单字再匹配 |
| 索引文件好几百 KB，首屏变慢 | 索引是全量下载的，条目或正文字段过多 | 只索引 `title` / `description` / `summary`，不要把整篇正文塞进去；考虑 Pagefind 之类按需分块加载的方案 |
| 多语言站点里中文页搜出英文结果 | 搜索框写死了站点根的索引地址，读到了另一种语言的索引 | 按当前语言拼接索引地址（如 `/zh/search.json`），或先确认每种语言的索引确实已按语言分目录生成 |
| 本地 `hugo server` 正常，部署后搜索失效 | 部署后路径带子目录（例如项目型 GitHub Pages 的 `/repo/`），绝对路径 `/search.json` 找错位置 | 用带站点根前缀的相对路径，或让模板把索引地址写成 `relURL` 形式 |
| 报错看不懂 | 报错来自主题里的搜索脚本，不是 Hugo | 先执行 `hugo --renderToMemory`；退出码 0 说明构建没问题，去排查前端脚本 |

更多排查入口见[故障排查](/troubleshooting/)；索引产物的配置细节见[输出格式](/configuration/output-formats/)与[输出](/configuration/outputs/)；中文相关术语见[CJK](/quick-reference/glossary/cjk/)。

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
