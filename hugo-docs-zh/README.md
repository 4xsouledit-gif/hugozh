# Hugo 官方文档 · 中文翻译站

一个**自包含**的 Hugo 站点：内容为 Hugo 官方文档（<https://gohugo.io/>）的简体中文翻译，版式全部由项目自身的 `layouts/` 与 `assets/` 提供，**不需要安装任何外部主题，也不需要联网即可构建与预览**。

- 站点类型：静态站点（Hugo）
- 规模：**16 个一级章节，共 202 页**（201 个内容文件 + 首页 `content/_index.md`）
- 语言：简体中文（`zh-cn`）
- 上游原文仓库：<https://github.com/gohugoio/hugoDocs>（本工作区中的 `hugoDocs/` 为只读克隆，请勿修改）

## 运行要求

| 项目 | 要求 |
| --- | --- |
| Hugo | **0.158 或更高版本**（已在 v0.167.0 上验证） |
| 版本类型 | **标准版即可**，不需要 extended（项目不使用 SCSS 管道） |
| 站点配置键 | 使用 `locale`；该键在 0.158 之前名为 `languageCode`（Hugo 0.158.0 起弃用） |
| 其他 | 无 Node.js、无 npm 依赖、无外部主题、无需联网 |

若必须在 0.158 之前的 Hugo 上构建，请把 `hugo.toml` 中的 `locale` 改回 `languageCode`。

## 快速开始

所有命令都在**本项目根目录**（即本 README 所在目录）执行，路径均为相对路径：

```bash
hugo server          # 本地预览：http://localhost:1313/
hugo server -D       # 连同草稿（draft: true）一起预览
hugo                 # 构建静态站点，输出到 public/
hugo --minify        # 构建并压缩输出
```

- 首次构建时 Hugo 会在 `resources/_gen/` 下缓存指纹化后的 CSS/JS，属于正常现象。
- 部署到子路径（例如 `https://example.com/docs/`）时，先修改 `hugo.toml` 中的 `baseURL` 再构建。

## 目录结构

```text
hugo-docs-zh/
├── hugo.toml                      # 站点配置：baseURL、locale、菜单、Markdown 与高亮设置
├── README.md
├── archetypes/
│   └── default.md                 # hugo new content 使用的默认原型（六个前置元数据字段）
├── assets/
│   ├── css/
│   │   ├── main.css               # 版式主体：顶部 :root 自定义属性 + 深色模式 + 响应式
│   │   └── syntax.css             # 代码高亮配色（Chroma 类名）
│   └── js/
│       └── scrollspy.js           # 右侧「本页目录」滚动高亮（原生 JS，无依赖）
├── content/
│   ├── _index.md                  # 首页
│   ├── about/                     # 5 页
│   ├── commands/                  # 45 页
│   ├── configuration/             # 34 页
│   ├── content-management/        # 23 页
│   ├── contribute/                # 4 页
│   ├── getting-started/           # 4 页
│   ├── host-and-deploy/           # 15 页
│   ├── hugo-modules/              # 5 页
│   ├── hugo-pipes/                # 10 页
│   ├── installation/              # 5 页
│   ├── quick-reference/           # 3 页
│   ├── render-hooks/              # 9 页
│   ├── shortcodes/                # 12 页
│   ├── templates/                 # 14 页
│   ├── tools/                     # 6 页
│   └── troubleshooting/           # 7 页
└── layouts/
    ├── index.html                 # 首页模板（每章列出前 6 个链接）
    ├── _default/
    │   ├── baseof.html            # 基础模板
    │   ├── single.html            # 内容页：原文出处、上一篇 / 下一篇
    │   └── list.html              # 章节列表页
    └── partials/
        ├── head.html              # <head>、标题、CSS 管道（minify + fingerprint + SRI）
        ├── header.html            # 顶部导航（读取 menus.main）
        ├── sidebar.html           # 左侧文档目录（只展开当前章节）
        ├── toc.html               # 右侧本页目录（.TableOfContents）
        ├── footer.html            # 页脚与版权说明
        └── scripts.html           # 滚动高亮脚本（minify + fingerprint + SRI）
```

每个一级章节目录下均有一个 `_index.md`（章节导语，同时作为列表页内容）和若干主题页。

## 页面清单

共 **16 个一级章节、201 个内容文件**，加上首页合计 **202 页**。「页数」为该章节目录下 `*.md` 的实际数量（含该章的 `_index.md`）。

| # | 章节（中文） | 目录 / 上游路径 | 页数 |
| --- | --- | --- | ---: |
| 1 | 入门 | `content/getting-started/` · `/getting-started/` | 4 |
| 2 | 安装 | `content/installation/` · `/installation/` | 5 |
| 3 | 关于 | `content/about/` · `/about/` | 5 |
| 4 | 内容管理 | `content/content-management/` · `/content-management/` | 23 |
| 5 | 配置 | `content/configuration/` · `/configuration/` | 34 |
| 6 | 命令 | `content/commands/` · `/commands/` | 45 |
| 7 | 模板 | `content/templates/` · `/templates/` | 14 |
| 8 | 渲染钩子 | `content/render-hooks/` · `/render-hooks/` | 9 |
| 9 | 短代码 | `content/shortcodes/` · `/shortcodes/` | 12 |
| 10 | Hugo 管道 | `content/hugo-pipes/` · `/hugo-pipes/` | 10 |
| 11 | Hugo 模块 | `content/hugo-modules/` · `/hugo-modules/` | 5 |
| 12 | 托管与部署 | `content/host-and-deploy/` · `/host-and-deploy/` | 15 |
| 13 | 疑难解答 | `content/troubleshooting/` · `/troubleshooting/` | 7 |
| 14 | 快速参考 | `content/quick-reference/` · `/quick-reference/` | 3 |
| 15 | 工具 | `content/tools/` · `/tools/` | 6 |
| 16 | 参与贡献 | `content/contribute/` · `/contribute/` | 4 |
| — | **合计** | 16 章 | **201** |

另有一页全站首页（`content/_index.md`），因此站点共有 **202 个页面**。`commands/` 章页数最多（每条命令与子命令一页）；`quick-reference/` 目前只有术语表以外的三页（`_index.md`、`emojis.md`、`glob-patterns.md`）。

> 上表统计的是**归位完成后**的状态：`getting-started/` 下的 `installation.md`、`configuration.md` 已移入 `/installation/`、`/configuration/`，`content-management/` 下的 `types.md`、`emojis.md`、`render-hooks.md`、`shortcodes.md` 已移入 `/templates/`、`/quick-reference/`、`/render-hooks/`、`/shortcodes/`。这 6 个旧文件已删除，`content/` 下 `.md` 总数与上表一致。

## 页面约定

每页使用 TOML 前置元数据（`+++` 分隔），一共六个字段，`archetypes/default.md` 已给出模板（全站首页 `content/_index.md` 例外，只有 `title`、`description`、`date`）：

```toml
+++
title = "页面标题"
linkTitle = "侧栏与导航中显示的短标题"
description = "一句话摘要"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/..."
+++
```

| 字段 | 作用 |
| --- | --- |
| `title` | 页面 `<h1>` 与浏览器标题 |
| `linkTitle` | 侧栏、上一篇 / 下一篇、首页链接中显示的文字（留空时 Hugo 回退到 `title`） |
| `description` | 页面导语，同时用于章节列表页与首页的章节简介 |
| `date` | 页面日期，渲染在页脚 |
| `weight` | **决定顺序**：同一章节内数字越小越靠前，左侧目录、首页链接、上一篇 / 下一篇都按它排序 |
| `source` | 上游英文原文地址，模板会把它渲染在页脚「英文原文：…」一行 |

正文书写约定：

- 一级标题由模板输出，**正文只用 `##` 及以下**，避免出现两个 `<h1>`；`##` 会进入右侧「本页目录」。
- 章节导语写在对应章节的 `_index.md` 里，它会同时出现在该章列表页顶部。
- 内部链接写站点内路径（如 `/shortcodes/#notation`），不要指向 gohugo.io。

## 短代码注意事项（重要）

**内容里不能出现未转义的 `{{<` 或 `{{%`。** Hugo 在 Markdown 解析**之前**就会扫描并提取短代码，**围栏代码块与行内代码都不豁免**（见 `content/content-management/syntax-highlighting.md` 的「转义」一节：文档给出的示例本身就写在围栏里，其中的转义仍被解析）；一旦出现未转义的定界符，Hugo 会去找同名短代码模板，找不到就报 `failed to extract shortcode: template for shortcode "…" not found`，**整个站点构建失败**（不是单页失败）。

要展示短代码语法本身，必须写成转义形式：

```text
{{</* name */>}}          →  页面显示 {{< name >}}
{{%/* name */%}}          →  页面显示 {{% name %}}
{{</*/* name */*/>}}      →  页面显示 {{</* name */>}}（要展示转义写法本身时）
```

本站 `content/` 下所有短代码示例均已使用转义写法；新增页面时请沿用该写法。

**另一个会把构建打挂的字面串：`HAHAHUGOSHORTCODE`。** 它是 Hugo 内部给短代码占位用的前缀。内容里一旦出现这个**完整字符串**，Hugo 的短代码状态机就会报：

```text
illegal state in content; shortcode token missing end delim
```

并且错误会**归因到正在渲染的那个页面上**（看起来像该页内容有问题，实际是这个字符串与占位符机制冲突）。本站 `content/troubleshooting/audit.md` 就曾因此整页从未渲染成功过。

需要展示它时，像上游文档那样在中间插入零宽字符（U+FEFF）打断字面串，渲染结果不变：

```text
H&#xfeff;AHAHUGOSHORTCODE   →  页面显示 HAHAHUGOSHORTCODE
```

注意 `&#xfeff;` 实体必须写在**代码 span 之外**：写在反引号里不会被解码，读者会看到实体本身。

## 主题与分层

样式不写在站点里，而是放在主题里；站点只保留**跨主题的约束**。配置文件用一条列表组合主题：

```toml
theme = ["hugo-docs-theme-zh", "hugo-docs-theme"]
```

| 层 | 位置 | 内容 |
| --- | --- | --- |
| 项目约束层 | `layouts/_default/baseof.html` | 唯一的 `main` 块与六个必须由主题提供的 partial 名称——所有主题共同遵守的契约，不放别的 |
| 基础主题 | `themes/hugo-docs-theme/` | 版式模板（首页 / 列表 / 单页 / 404）、partial（含 SEO 头与 JSON-LD）、`main.css`、`syntax.css`、`scrollspy.js`、`robots.txt` |
| 中文叠加层 | `themes/hugo-docs-theme-zh/` | 只有 CJK 排版（`assets/css/cjk.css`）与 `[params.cjk] enabled` 开关 |

两个主题都由命令生成（`hugo new theme`），生成的示例模板、示例文章与示例菜单已删除。查找顺序为「项目 → 最左主题 → 次左」，`layouts`/`static`/`archetypes` **按文件级覆盖**（同路径文件是替换而非合并），`i18n`/`data` 才按键深度合并；主题配置只能设置 `params`、`menu`、`outputformats`、`mediatypes`。依据：<https://gohugo.io/hugo-modules/theme-components/>。

改动样式时据此选层：换配色改基础主题，换中文排版改叠加层，只有「所有主题都必须一致」的部分才写进项目层。

## 站点实现

- **左侧目录只展开当前章节**：`themes/hugo-docs-theme/layouts/partials/sidebar.html` 遍历 `site.Home.Sections.ByWeight` 列出全部一级章节，只对 `.CurrentSection` 与当前章节 `RelPermalink` 相等的那一个展开二级列表，因此 16 个章节同时出现时目录仍然紧凑。
- **右侧「本页目录」滚动高亮**：`partials/toc.html` 输出 `.TableOfContents`（层级由 `[markup.tableOfContents]` 限定为 h2–h3），`assets/js/scrollspy.js`（原生 JS、无依赖）在滚动时给当前标题对应的链接加 `.is-current`；判定阈值 = 顶部栏高度 + 20px，并把同一个值写进 `scroll-padding-top`，保证点击锚点后的落点与高亮一致。目录自身过长时会自动滚动以保持高亮项可见；窄屏下目录被 CSS 隐藏，脚本自动不生效。默认**不会**改写地址栏里的 `#锚点`。
- **首页只列每章前 6 个链接**：`layouts/index.html` 对每章输出「N 篇 · 前 6 个链接 · 查看全部 →」，页数超过 6 时才显示「查看全部」。
- **代码高亮**：`hugo.toml` 中 `markup.highlight.noClasses = false`，即输出 Chroma 类名而非内联样式，配色由 `assets/css/syntax.css` 决定。
- **资源管道**：`head.html` / `scripts.html` 用 `minify | fingerprint` 处理 CSS 与 JS，指纹文件名带 SRI 完整性校验；中文层的 `cjk.css` 由 `[params.cjk] enabled` 控制是否加载。
- **顶部导航**：`partials/header.html` 读取 `hugo.toml` 的 `[[menus.main]]`，目前为 首页 / 入门 / 内容管理 / 命令 / Hugo 官网；左侧目录则始终列出全部 16 章。

## SEO

`partials/head.html` 输出：唯一 `<title>`、`<meta name="description">`（页面 `description` → `.Summary` → 站点默认，`plainify` 后截断 160 字）、绝对 `<link rel="canonical">`、`og:*` 与 `twitter:card`、多语言 `hreflang`（仅当站点确有多种语言时）、RSS 替代链接与 `theme-color`；`partials/schema.html` 输出 JSON-LD（页面 `TechArticle`，首页 `WebSite`）。

- **抓取控制**：`hugo server`（development）输出 `noindex, nofollow`，正式构建（production）输出 `index, follow`，预览环境不会被误索引；单页可用 front matter 的 `noindex = true` 覆盖。
- **`robots.txt` 与站点地图**：`enableRobotsTXT = true` 加上主题中的 `layouts/robots.txt`——正式环境才 `Allow: /` 并附 `Sitemap:` 绝对地址；`sitemap.xml` 由 Hugo 按 `[sitemap]` 配置生成。
- **结构化数据的坑**：在 `<script type="application/ld+json">` 里写 `{{ $data | jsonify }}`，Go 会把已序列化的字符串当 JS 字符串字面量再编码一次，输出成 `"{…}"`，结构化数据随即失效。正确做法是把**对象**交给模板（`{{ $data }}`），让 JS 上下文做净化序列化；依据 <https://gohugo.io/functions/safe/js/>。
- **验证方式**：构建后从 `public/index.html` 取出 JSON-LD 交给真正的 JSON 解析器解析一遍——标签存在不等于数据可用。

## 版本控制与日期

站点源码由 Git 管理（仓库根在工作区，`hugo-docs-zh/` 只是其中一个目录；`.dsh/skills/` 也在同一仓库内）。产出物不入库：

```gitignore
hugo-docs-zh/public/
hugo-docs-zh/resources/
hugo-docs-zh/.hugo_build.lock
```

`.gitattributes` 里 `* text=auto eol=lf` 统一换行符，避免跨平台整文件 diff。

**让 Hugo 回读仓库**（`hugo.toml`）：

```toml
enableGitInfo = true

[frontmatter]
  lastmod = [':git', 'lastmod', 'date']   # 优先取提交时间
```

于是每个页面都有 `.GitInfo`，正文页元信息会显示「提交 51660c8」（悬停可见提交说明与作者），**每次提交后各页「最后更新」自动前进**，不依赖手写日期。

**日期呈现**（`partials/time.html`）：本地化长日期 + 相对时间，并始终包在语义化的 `<time datetime="ISO8601">` 中——「发布于 2026年10月1日（今天）· 最后更新 2026年10月1日（今天）· 提交 51660c8」。

```html
<time datetime="2026-10-01T00:00:00+08:00" title="2026年10月1日">2026年10月1日</time>
```

一个实测结论：Hugo 的本地化 token（`:date_long` 等）**对中文会回退成英文**（同一模板下 `locale = "de-DE"` 输出 `1. Oktober 2026`，`locale = "zh-CN"` 输出 `October 1, 2026`）。因此中文格式由**中文叠加主题**显式给出：`[params] dateFormat = "2006年1月2日"`（放在 `[params.cjk]` **之前**——TOML 中表头之后的键会归入该表）。相关坑见 skill 的 G21/G22。

## 调整外观

- **颜色、栏宽、字体**：改 `themes/hugo-docs-theme/assets/css/main.css` 顶部的 `:root` 自定义属性（`--accent`、`--bg`、`--sidebar-width`、`--toc-width`、`--content-max` 等），改这一处即可整体换配色。
- **中文排版**：改 `themes/hugo-docs-theme-zh/assets/css/cjk.css`（字体栈、行距、两端对齐、断行规则）。
- **深色模式**：没有手动开关，`main.css` 中的 `@media (prefers-color-scheme: dark)` 会**跟随系统**；要固定为浅色，删掉该媒体查询即可。
- **代码高亮配色**：改 `themes/hugo-docs-theme/assets/css/syntax.css`。
- **顶部导航**：增删 `hugo.toml` 中的 `[[menus.main]]` 条目。
- **页脚说明**：改 `themes/hugo-docs-theme/layouts/partials/footer.html`。

## 新增页面

```bash
hugo new content <章节>/<页面>.md     # 例如 hugo new content getting-started/my-page.md
```

- 新页面会套用 `archetypes/default.md`，请填写 `title` / `linkTitle` / `description` / `source`，并按需调整 `weight`（越小越靠前）。
- 只要文件放在对应章节目录下，**无需改任何模板**：左侧目录、首页链接、上一篇 / 下一篇都会自动带上它。
- 新增章节：在 `content/` 下新建目录并添加 `_index.md` 与若干页面，侧栏与首页会自动出现该章节。
- 注意 Hugo 0.158+ 已用 `hugo new project` 取代 `hugo new site`（本站不是通过该命令创建的，此处仅作版本提示）。

## 范围与已知偏差

本站以「覆盖上游全部一级章节、1:1 对应」为目标，目前**已完成 16 个一级章节**，但以下部分**尚未翻译**，因此还不是完整的中文镜像：

| 未翻译部分 | 上游规模（约） | 说明 |
| --- | --- | --- |
| `functions/` | 约 200 页 | 函数参考（`Page`、`Site`、`Collections`、`Math`、`Strings`、`Time` 等命名空间的全部函数） |
| `methods/` | 约 100 页 | 方法参考（`Page`、`Resource`、`Menu` 等对象的方法） |
| `quick-reference/glossary/` | 约 160 条 | 术语表条目（本站 `quick-reference/` 仅有 3 页） |
| `news/` | — | 官方博客 / 发布说明 |
| `_common/` | — | 供其他页面 `include` 的文档片段（非独立页面） |

其他如实说明：

- `about/license.md` 是 Apache License 2.0 的**逐节转述**（按小节归纳许可条款要点），**不是法律全文的逐字翻译**；涉及权利与义务时请以官方仓库中的 `LICENSE` 文件与 <https://gohugo.io/about/license/> 为准。
- 部分页面上游的**默认值由 `code-toggle` 等数据块提供**（例如 `configuration/server.md` 中开发服务器的默认请求头与重定向规则）。本站未逐字列出全部默认值，而是以文字说明为主，需要精确默认值时请看该页 `source` 指向的官网页面。
- 各页 `weight` 用于站内排序，与上游文档的排列顺序**不保证逐条一致**。
- 译文以对上游英文原文的翻译为主，个别表格、示例与措辞做了适应中文阅读的调整。

## 验证状态

- 本项目的文件由本工作区生成，**生成环境无法运行命令行、也无法访问 gohugo.io**；因此构建验证依赖使用者在本地执行 `hugo server`（建议 Hugo 0.158+）。
- 已知的一处历史问题已修复：`hugo.toml` 中的 `languageCode` 自 Hugo 0.158.0 起弃用，已改为 `locale`——这也是本站要求 0.158+ 的原因。
- 另一处已修复的问题：内容中曾出现**未转义的短代码定界符**（写在行内代码里也会触发），导致整站构建失败；现已全部改用 `{{</* … */>}}` / `{{%/* … */%}}` 转义写法（详见上文「短代码注意事项」）。
- 构建产物中会包含 Hugo 默认分类法生成的 `tags/`、`categories/` 空页面（本站内容未使用分类法）。如需彻底去掉，在 `hugo.toml` 中加入 `disableKinds = ["taxonomy", "term"]` 即可。
- 译文中的**个别默认值与版本号请以 `source` 指向的官网页面为准**。

## 版权与免责

- 原文版权归 Hugo 项目及其文档贡献者所有，原文仓库：<https://github.com/gohugoio/hugoDocs>。
- 本站仅包含中文译文，以及为展示译文而编写的模板、样式与脚本，仅供学习交流，**不能替代官方文档**；如有歧义，一切以官方英文原文为准。
- 如官方文档的许可条款有更新，请以官方仓库中的许可文件为准，并据此调整本站的使用与再分发方式。
