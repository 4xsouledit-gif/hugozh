+++
title = "新版模板系统概览"
linkTitle = "新版模板系统概览"
description = "Hugo v0.146.0 重写模板系统后的目录变化、查找顺序与迁移对照，附最小验证示例与升级踩坑表。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/templates/new-templatesystem-overview/"

[params.teach]
difficulty = "进阶"
time = "20–30 分钟"
prereq = [
  "有一个能构建的站点；如果是从旧版本升级，先备份或提交一次 Git。",
  "知道 `layouts/` 下各类模板的名字（见[内容类型](/templates/types/)）。",
]
outcomes = [
  "对照表格完成旧目录到新目录的改名（`_default` 取消、`partials` → `_partials` 等）；",
  "读懂 `all.en.html`、`term.mylayout.en.rss.xml` 这类文件名里每一段的含义；",
  "知道「哪些页面路径目录可以任意嵌套」以及下划线目录的特殊用途；",
  "升级后用 `--templateMetrics` 核对每个页面是否命中了预期模板。",
]
next = ["/templates/lookup-order/", "/templates/types/", "/troubleshooting/"]

+++

在 [Hugo v0.146.0](https://github.com/gohugoio/hugo/releases/tag/v0.146.0) 中，Hugo 完全重新实现了 Go 模板的处理方式，包括 `layouts` 目录的结构调整与更强大的模板查找系统。为了尽量保持向后兼容，官方按「旧到新」做了映射，但仍有一些已知的破坏性变化。本文汇总其中最重要的部分。

## 这一页解决什么问题

如果你手上是**旧项目**，这一页是一张迁移对照表：逐条把旧路径改成新路径，站点就能在新版 Hugo 上正常构建。如果你是**全新项目**，这一页是命名手册：告诉你在 `layouts/` 里该怎么组织文件，以及为什么不能沿用网上老教程里的 `layouts/_default/`。

一句话概括变化：**`_default` 没了、下划线目录代表特殊用途、其余目录代表页面路径、模板文件名由「标识符 + 点」拼成。**

## `layouts` 目录的变化

| 说明 | 需要做的操作 |
| --- | --- |
| 取消 `_default` 目录。 | 把 `layouts/_default` 中的文件全部上移到 `layouts/` 根目录。 |
| `layouts/partials` 更名为 `layouts/_partials`。 | 重命名目录。 |
| `layouts/shortcodes` 更名为 `layouts/_shortcodes`。 | 重命名目录。 |
| `layouts` 中任何不以 `_` 开头的目录都代表一条页面路径的根。新版中可以按需任意嵌套，`_shortcodes` 与 `_markup` 目录可放在树的任意层级。 | 无需操作。 |
| 因此不再有顶层的 `layouts/taxonomy`、`layouts/section` 目录，除非它本身代表一条页面路径。 | 把它们上移到 `layouts/`，以页面种类 `section`、`taxonomy` 或 `term` 作为基名；或者放进该分类法对应的页面路径目录。 |
| 名为 `taxonomy.html` 的模板过去同时是 `term` 与 `taxonomy` 两种页面种类的候选，现在只对 `taxonomy` 生效。 | 同时创建 `taxonomy.html` 与 `term.html`，或改用更通用的 `list.html`。 |
| 对于基础模板（如 `baseof.html`），旧版本允许把 layout、type 或 kind 之一用连字符接在 `baseof` 关键字前面。 | 把该标识符移到第一个点之后，例如把 `list-baseof.html` 改名为 `baseof.list.html`。 |
| 新增了 `all` 这种「兜底」布局。也就是说，如果只有 `layouts/all.html` 一个模板，它将用于所有 HTML 页面的渲染。 | 无需操作。 |
| 取消了 `_internal` 内置模板的概念。旧写法难以在主题中覆盖诸如 `_internal/disqus.html` 之类的模板，现在只要创建同名局部模板即可。 | 把调用内置模板的写法改为调用同名局部模板。 |
| 模板文件名中可用的标识符包括：页面种类（`home`、`page`、`section`、`taxonomy`、`term`）、标准布局（`list`、`single`、`all`）、自定义布局（front matter 中 `layout` 字段的值）、语言（如 `en`）、输出格式（如 `html`、`rss`），以及代表媒体类型的后缀。例如 `all.en.html` 与 `home.rss.xml`。 | 无需操作。 |
| 因此首页不再有 `index.html` 这种模板。 | 把 `index.html` 改名为 `home.html`。 |

## 查找顺序的变化

新版把模板查找统一成一套规则，对所有模板类型都适用，只有**局部模板**例外，因为它不感知上下文。旧方案变体极多、难以理解，新方案力求自然、少有意外。

参与模板权重的标识符，按重要程度排列如下：

| 标识符 | 说明 |
| --- | --- |
| 自定义布局 | front matter 中设置的 `layout`。 |
| 页面种类 | `home`、`section`、`taxonomy`、`term`、`page` 之一。 |
| 标准布局（一） | `list` 或 `single`。 |
| 输出格式 | 输出格式，如 `html`、`rss`。 |
| 标准布局（二） | `all`。 |
| 语言 | 语言，如 `en`。 |
| 媒体类型 | 媒体类型，如 `text/html`。 |
| 页面路径 | 页面路径，如 `/blog/mypost`。 |
| 类型 | front matter 中设置的 `type`。它会取代查找时页面路径里的 `section` 目录。 |

对于放在 `layouts` 中、与某条页面路径部分或完全匹配的模板，向上越接近该页面的匹配被认为越好。例如：

- `layouts/docs/api/_markup/render-link.html` 用于渲染页面路径 `/docs/api` 及其下级页面的链接。
- `layouts/docs/baseof.html` 用作页面路径 `/docs` 及其下级页面的基础模板。
- `layouts/tags/term.html` 用于 `tags` 分类法中所有 `term` 的渲染，但 `blue` 这个条目例外，它使用 `layouts/tags/blue/list.html`。

## 目录结构示例

```tree
layouts
├── baseof.html
├── baseof.term.html
├── home.html
├── page.html
├── section.html
├── taxonomy.html
├── term.html
├── term.mylayout.en.rss.xml
├── _markup
│   ├── render-codeblock-go.term.mylayout.no.rss.xml
│   └── render-link.html
├── _partials
│   └── mypartial.html
├── _shortcodes
│   ├── myshortcode.html
│   └── myshortcode.section.mylayout.en.rss.xml
├── docs
│   ├── baseof.html
│   ├── _shortcodes
│   │   └── myshortcode.html
│   └── api
│       ├── mylayout.html
│       ├── page.html
│       └── _markup
│           └── render-link.html
└── tags
    ├── taxonomy.html
    ├── term.html
    └── blue
        └── list.html
```

### 最小可运行示例：读懂一个文件名

上面那棵树里最长的名字是 `term.mylayout.en.rss.xml`。把它按点拆开，从左到右逐段对照权重表：

| 片段 | 含义 | 对应上面的表 |
| --- | --- | --- |
| `term` | 页面种类 | 页面种类 |
| `mylayout` | 自定义布局（front matter 里的 `layout = 'mylayout'`） | 自定义布局 |
| `en` | 语言 | 语言 |
| `rss` | 输出格式 | 输出格式 |
| `.xml` | 媒体类型后缀 | 媒体类型 |

也就是说：这份模板只服务于「页面种类为 `term`、front matter 指定了 `layout = 'mylayout'`、语言为 `en`、输出格式为 `rss`」的页面——条件越多的文件名越具体，优先级也越高。

**验证标准**：新建一个模板时，先按上表把文件名逐段念一遍；如果某一段你念不出它对应哪个标识符，那个名字大概率不会被命中（会静默回退到更笼统的模板，而**不会报错**）。

再看两个短名字：

- `all.en.html` = 兜底布局 + 语言 `en` + HTML 后缀；
- `home.rss.xml` = 首页 + RSS 输出格式 + XML 后缀。

### 用模板指标核对迁移结果

迁移完成后，务必确认每个页面都命中了预期模板，而不是悄悄回退：

```bash
hugo --renderToMemory --templateMetrics --printUnusedTemplates
```

`--templateMetrics` 打印每个模板的执行次数，`--printUnusedTemplates` 列出一次都没被用到的模板。你应当看到：

- 迁移后重命名的模板（如 `home.html`）出现在指标表里，且 `count` 大于 0；
- 旧名字的残留文件（如 `layouts/index.html`）不再出现在指标表里——它已经不参与渲染了，应当删掉，避免以后误以为它还在生效。

## 迁移建议

从旧版本升级时，可以按下面的顺序处理：先把 `layouts/_default` 中的文件全部上移到 `layouts/` 根目录，并把 `index.html` 改名成 `home.html`；接着重命名 `partials` 与 `shortcodes` 两个目录，补上前导下划线；然后把 `baseof` 系列模板文件名中前置的标识符移到第一个点之后；最后检查分类法模板，确保 `taxonomy.html` 与 `term.html` 各自存在，或统一改用 `list.html`。完成之后，再用[模板查找顺序](/templates/lookup-order/)确认每个页面都命中了预期的模板。

**迁移前先提交 Git**。改名是纯文件操作，出错时能一键回退；而「迁移后页面看起来正常、其实回退到了兜底模板」这类问题不会报错，只能靠上面那张指标表发现。

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH`；同时确认版本 ≥ v0.146.0（`hugo version`）→ [安装 Hugo](/installation/) |
| 没报错但结果不对 | 迁移后页面还能打开，但样式/内容不对 | 模板静默回退到了 `list.html` / `all.html` → 用 `--templateMetrics` 看实际命中的模板名 |
| 没报错但结果不对 | 主题里的模板不再生效 | 主题可能仍在用旧目录（`_default`、`partials`）→ 升级主题版本，或在项目 `layouts/` 下放同名新路径模板覆盖 |
| 没报错但结果不对 | 首页仍不是自己想改的模板 | 旧文件还叫 `index.html`；新版首页只认 `home.html` → 改名后重新构建 |
| 报错看不懂 | `failed to extract shortcode: template for shortcode "…" not found` | `layouts/shortcodes` 还没改成 `layouts/_shortcodes`，短代码模板找不到 → 按本页表格改名 |
| 报错看不懂 | 构建时出现 `found no layout file for …` 警告 | 模板路径仍是旧结构（例如 `layouts/_default/list.html`）→ 上移到 `layouts/list.html` |

更多排查入口见[故障排查](/troubleshooting/)。
