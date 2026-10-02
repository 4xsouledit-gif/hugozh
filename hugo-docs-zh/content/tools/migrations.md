+++
title = "从其他系统迁移"
linkTitle = "从其他系统迁移"
description = "把 Jekyll、WordPress、Medium 等旧站内容迁到 Hugo：先判断走内置 importer 还是社区工具，再按「导出 → 转换 → 核对」三步验证，附迁移后必须检查的清单。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/tools/migrations/"

[params.teach]
difficulty = "进阶"
time = "30 分钟读完；实际迁移视文章数量而定（几百篇通常需要半天到两天）"
prereq = [
  "旧站点的后台或数据库可访问，能导出全部内容。",
  "本机已装好 Hugo 并能建起一个空站点。",
  "旧站内容已完整备份（迁移工具大多会就地改写或生成大量文件）。",
]
outcomes = [
  "按源系统选出正确路线：Hugo 内置 importer、社区转换工具，还是先导出再手工处理；",
  "用 `hugo import jekyll` 跑通一次最小迁移，并核对 front matter、固定链接与静态资源三处结果；",
  "列出迁移后必须逐项检查的清单，避免上线才发现链接大面积 404；",
  "知道旧站 URL 与新站 URL 不一致时，用 `aliases` 或重定向兜住老访客。",
]
next = ["/commands/hugo-import-jekyll/", "/content-management/urls/", "/getting-started/directory-structure/", "/tools/search/"]
+++

## 这一页解决什么问题

这一页解决**「我的文章怎么从旧系统搬过来」**。它不追求帮你选一个「最好的工具」，而是让你在动手前就能判断：这次迁移要花多少工夫、哪些东西会丢、搬完之后检查哪几样才算完成。

有两件事必须先说清楚，否则后面几乎一定要返工：

1. **迁移工具只负责把文件转成 Hugo 能读的格式，不负责让你的旧链接继续有效。** URL 结构是新旧系统的最大差异，而它决定搜索引擎与老访客还能不能找到页面。要处理这一层，靠的是 [URL 管理](/content-management/urls/)里的 `aliases` 与固定链接设置。
2. **迁移的成败以「构建通过 + 抽查页面 + 链接可达」为准**，不以工具输出「Completed」为准。社区工具的维护状态差异很大，工具跑完没报错、内容却是空的，是很常见的结果。

## 该走哪条路

先看源系统，再看工具是否还活着：

| 源系统 | 首选路线 | 备选 |
| --- | --- | --- |
| Jekyll / Octopress | **Hugo 内置** `hugo import jekyll`，见[命令页](/commands/hugo-import-jekyll/) | `JekyllToHugo`、`ConvertToHugo`、`octohug` |
| WordPress | `wordpress-to-hugo-exporter` 插件导出 Markdown/YAML；内容多、要保 URL 用 `wp2hugo` | 导出成 Jekyll 格式再用内置 importer；`blog2md`、`wordhugopress` |
| Medium | `medium2md`（一条命令）或 `medium-to-hugo`（含标签与图片） | —— |
| Tumblr | `tumblr2hugomarkdown` 或 `tumblr-importr` | `Tumblr to Hugo`（额外产出重定向用 CSV） |
| Blogger | `blogger2hugo`（用 Google Takeout 的 `.atom` 备份） | `blogimport`、`blogger-to-hugo`、`BloggerToHugo`（仅 Windows）、`blog2md` |
| DokuWiki | `dokuwiki-to-hugo`（生成 TOML 头部，可直接塞进 `content/`） | —— |
| Drupal / Joomla / Contentful / BlogML | `drupal2hugo` / `hugojoomla` / `contentful-hugo` / `BlogML2Hugo` | —— |

判断社区工具还能不能用的三个动作（比看介绍可靠）：

1. **看最近一次提交**：打开工具的仓库，提交列表顶部那条是什么时候。（想从命令行确认，用 `git clone --depth 1 <仓库地址>` 之后执行 `git log -1 --date=short --format='%ad %s'`。）
2. **看它提到哪些版本**：README 与 Issues 里有没有说明支持的 Hugo 版本、以及最近报出的问题。
3. **先拿 3–5 篇文章试跑**：确认产物能被 `hugo` 构建、正文不空，再决定是否全量转换。

## 最小可用步骤：用内置 importer 迁移 Jekyll

Jekyll 是唯一由 Hugo 自己提供迁移命令的系统，因此它也是验证「迁移流程长什么样」的最短路径。命令需要两个位置参数，**先源目录、后目标目录**：

```bash
hugo import jekyll ./my-jekyll-site ./my-hugo-site
```

目标目录已经存在且非空时，必须显式允许写入：

```bash
hugo import jekyll ./my-jekyll-site ./my-hugo-site --force
```

迁移过程不顺利时，把日志级别调到 `debug` 再看：

```bash
hugo import jekyll ./my-jekyll-site ./my-hugo-site --logLevel debug
```

**你应当看到什么**：

1. 命令退出码为 0，目标目录里出现 `content/` 与 `hugo.toml` 之类的站点文件；
2. 新站点目录下执行构建，退出码为 0：

   ```bash
   cd ./my-hugo-site
   hugo --renderToMemory
   ```

3. 文章出现在内容清单里，数量与源站点的一篇文章数大致相符：

   ```bash
   hugo list all
   ```

4. 打开构建产物里的任意两篇（例如 `public/posts/xxx/index.html`），**正文不是空的**，且标题、日期是原文章的值。

以上四条任一不成立，先别继续往下搬——先拿三五篇定位问题，比全量导入后再排查便宜得多。

> [!TIP]
> 迁移是「**导出 → 转换 → 核对**」三步，工具只做第二步。核对阶段至少要覆盖三处：**front matter**（日期、标签、草稿状态是否带过来）、**固定链接**（新旧 URL 是否一致）、**静态资源**（文章里的图片链接是否还指向旧站）。这三处各自的失败方式不同，但都会表现为「文章看着在，实际不能用」。

## 迁移后必须检查的清单

| 检查项 | 怎么查 | 不合格的表现 |
| --- | --- | --- |
| 文章总数 | `hugo list all` 的行数与源站文章数对比 | 差了很多：导出不完整，或草稿被排除 |
| 正文完整性 | 在产物里打开几篇最长的文章 | 正文为空、只剩标题；短代码或代码块被吃掉 |
| 前置元数据 | 打开源文件，确认 `title`/`date`/`tags` 等键齐全并与源站对应 | 日期全是迁移当天；标签丢失 |
| 固定链接 | 用源站的一批旧 URL 拼出新站地址逐条打开 | 大量 404 —— 需要配置固定链接与 `aliases`，见 [URL 管理](/content-management/urls/) |
| 静态资源 | 搜索产物里是否还有指向旧域名的 `img src` | 图片 404、仍从旧站加载 |
| 分类与标签 | 检查 `public/tags/`、`public/categories/` 下的页面 | 标签页为空：源站的分类体系没有映射成 Hugo 的分类法 |
| 构建告警 | `hugo --ignoreCache` 是否输出 WARNING | 有告警说明部分内容被跳过，逐条处理后再发布 |

只有这一张表全部通过，这次迁移才算结束。**搜索引擎收录的是 URL，不是文章**，所以固定链接那一行的优先级最高。

## Jekyll

另一种做法是使用 Hugo 内置的 [Jekyll 导入命令](/commands/hugo-import-jekyll/)。

[JekyllToHugo][]
: 一个把 Jekyll 博客文章转换为 Hugo 站点的小脚本。

[ConvertToHugo][]
: 把博客从 Jekyll 转换到 Hugo。

## Octopress

[octohug][]
: Octopress 到 Hugo 的迁移工具。

## DokuWiki

[dokuwiki-to-hugo][]
: 把 DokuWiki 源页面从 [DokuWiki 语法][DokuWiki syntax]迁移为 Hugo 的 Markdown 语法。它还包含 TODO 插件一类的额外处理。用 Python 3 编写，注重可扩展性。同时会为每个页面生成 TOML 头部。设计目标是让你把 wiki 目录直接复制粘贴进 `content` 目录。

## WordPress

[wordpress-to-hugo-exporter][]
: 一个一键式 WordPress 插件，把所有文章、页面、分类法、元数据与设置转换为 Markdown 和 YAML，可直接放进 Hugo。（注意：如果你在使用该插件时遇到问题，可以[把站点导出为 Jekyll 格式][export your site for Jekyll]，再使用前面提到的 Hugo 内置 Jekyll 转换器。）

[blog2md][]
: 适用于你的免费 YOUR-TLD.wordpress.com 网站导出的 [xml 文件](https://en.support.wordpress.com/export/)。它还会把已批准的评论连同文章一起保存到 `YOUR-POST-NAME-comments.md` 文件中。

[wordhugopress][]
: 一个用 Java 编写的小工具，从数据库中导出整个 WordPress 站点，以及存放在本地或远端的资源（例如图片）文件。因此也可以从备份文件进行迁移。支持把多个 WordPress 站点合并为一个 Hugo 站点。

[wp2hugo][]
: 一个基于 Go 的命令行工具，用于把 WordPress 网站迁移到 Hugo。它会保留原始 URL、GUID、图片 URL、代码高亮、目录以及 WordPress 导航分类。它可以迁移 WordPress 的自定义文章类型、自定义分类法、自定义字段与页面层级。它支持通过 Polylang 或 WPML 翻译的 WordPress 博客。它会导入 WordPress 媒体库数据库及其原始标题与日期。该工具可以下载全部媒体，也可以只下载插入到页面中的媒体。它会把 WordPress 短代码与 Gutenberg 区块转换为 Hugo 短代码，包括图库、图片、音频、YouTube 嵌入、Gist 与 Google Maps。

## Medium

[medium2md][]
: 一个简单的 Medium 到 Hugo 的导出器，一条命令即可导入文章，包括前置字段。

[medium-to-hugo][]
: 一个用 Go 编写的命令行工具，把 Medium 文章导出为与 Hugo 兼容的 Markdown 格式。会包含标签与图片。所有图片都会下载到本地并正确链接。

## Tumblr

[tumblr-importr][]
: 一个导入器，使用 Tumblr API 生成 Hugo 静态站点。

[tumblr2hugomarkdown][]
: 把所有 Tumblr 内容导出为 Hugo Markdown 文件，并保留原始格式。

[Tumblr to Hugo][]
: 一个迁移工具，把你的每篇 Tumblr 文章转换为带正确标题与路径的内容文件。它还会生成一个 CSV 文件，帮助你设置 URL 重定向。

## Drupal

[drupal2hugo][]
: 把 Drupal 站点转换为 Hugo。

## Joomla

[hugojoomla][]
: 这个用 Java 编写的工具读取 Joomla 数据库，把全部内容转换为 Markdown 文件。它会把 Joomla 内部格式的 URL 改为合适的形式。

## Blogger

[blogimport][]
: 把 Blogger 文章导入 Hugo 的工具。

[blogger-to-hugo][]
: 另一个把 Blogger 文章导入 Hugo 的工具。它还会下载内嵌图片，把它们保存到本地。

[blog2md][]
: 适用于你的 YOUR-TLD.blogspot.com 网站导出的 [xml 文件](https://support.google.com/blogger/answer/41387?hl=en)。它还会把评论连同文章一起保存到 `YOUR-POST-NAME-comments.md` 文件中。

[BloggerToHugo][]
: 又一个把 Blogger 文章导入 Hugo 的工具。仅限 Windows 平台，且需要 .NET Framework 4.5。使用前请先阅读 README.md。

[blogger2hugo][]
: 把来自 [Google Takeout][] 的 Blogger 备份文件（`.atom`）转换为 Markdown（`.md`）文件。该工具生成的输出与 Hugo 的 `content/` 结构兼容。

## Contentful

[contentful-hugo][]
: 一个根据 [Contentful][] 上的内容为 Hugo 生成内容文件的工具。

## BlogML

[BlogML2Hugo][]
: 一个帮你把 BlogML xml 文件转换为 Hugo Markdown 文件的工具。附件与图片的链接需要用户自行处理。它能让导出 BlogML 文件的博客（例如 BlogEngine.NET）更容易转换为 Hugo 站点。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| `hugo import jekyll` 报目标目录非空 | 命令默认只写空目录 | 确认真要写入该目录后加 `--force`；更稳妥的做法是每次都导入到一个全新目录 |
| 只给了一个路径参数，命令报错 | 它需要两个位置参数，顺序是「源目录 目标目录」 | 补全参数；先 `pwd` 确认两个路径都存在 |
| 迁移后文章全都跑到同一个目录 | 源系统没有目录层级信息，或文章都是页面包外的散文件 | 按[目录结构](/getting-started/directory-structure/)重建分区，再用 `weight` 与 `cascade` 组织，而不是逐篇手工移动 |
| 构建报 `failed to extract shortcode` | 旧系统的短代码/宏被原样写进了正文，而新站点没有对应短代码 | 见[短代码](/shortcodes/)；批量替换成普通 Markdown，或为它补一个模板 |
| 迁移后旧链接全部 404 | 新旧 URL 结构不同，且没有配置重定向 | 配置固定链接与 `aliases`，见 [URL 管理](/content-management/urls/) |
| 图片显示为破图 | 附件没有被工具下载，正文里仍是旧域名地址 | 用工具提供的「下载媒体」选项，或在源文件里批量替换域名 |
| 工具跑完显示成功但 `content/` 是空的 | 工具与当前版本不兼容，或输入格式不符合预期 | 换用内置命令或另一个工具；先拿三五篇文章试跑，别一次全量转换 |
| 报错看不懂 | 报错来自转换脚本（Python/Java/Go 各自的错误） | 先确认 `hugo --renderToMemory` 的退出码：为 0 说明站点本身没问题，故障在转换产物或脚本 |

更多排查入口见[故障排查](/troubleshooting/)；迁移完成后想给站点加搜索，见[站内搜索](/tools/search/)。

[BlogML2Hugo]: https://github.com/jijiechen/BlogML2Hugo
[BloggerToHugo]: https://github.com/huanlin/blogger-to-hugo
[Contentful]: https://www.contentful.com/
[ConvertToHugo]: https://github.com/coderzh/ConvertToHugo
[DokuWiki syntax]: https://www.dokuwiki.org/wiki:syntax
[Google Takeout]: https://takeout.google.com/takeout/custom/blogger?hl=en
[JekyllToHugo]: https://github.com/fredrikloch/JekyllToHugo
[Tumblr to Hugo]: https://github.com/jipiboily/tumblr-to-hugo
[blog2md]: https://github.com/palaniraja/blog2md
[blogger-to-hugo]: https://pypi.org/project/blogger-to-hugo/
[blogger2hugo]: https://github.com/noorkhafidzin/blogger2hugo
[blogimport]: https://github.com/natefinch/blogimport
[contentful-hugo]: https://github.com/ModiiMedia/contentful-hugo
[dokuwiki-to-hugo]: https://github.com/wgroeneveld/dokuwiki-to-hugo
[drupal2hugo]: https://github.com/danapsimer/drupal2hugo
[export your site for Jekyll]: https://wordpress.org/plugins/jekyll-exporter/
[hugojoomla]: https://github.com/davetcc/hugojoomla
[medium-to-hugo]: https://github.com/bgadrian/medium-to-hugo
[medium2md]: https://github.com/gautamdhameja/medium-2-md
[octohug]: https://github.com/codebrane/octohug
[tumblr-importr]: https://github.com/carlmjohnson/tumblr-importr
[tumblr2hugomarkdown]: https://github.com/Wysie/tumblr2hugomarkdown
[wordhugopress]: https://github.com/nantipov/wordhugopress
[wordpress-to-hugo-exporter]: https://github.com/SchumacherFM/wordpress-to-hugo-exporter
[wp2hugo]: https://github.com/ashishb/wp2hugo
