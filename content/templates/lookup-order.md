+++
title = "模板查找顺序"
linkTitle = "模板查找顺序"
description = "Hugo 为给定页面挑选模板的查找规则、新版目录约定，以及用 --templateMetrics 验证「页面到底用了哪个模板」的方法。"
date = 2026-10-01
weight = 70
source = "https://gohugo.io/templates/lookup-order/"

[params.teach]
difficulty = "进阶"
time = "25–35 分钟"
prereq = [
  "读过[内容类型](/templates/types/)，知道 `home`、`page`、`section`、`single`、`list`、`all` 各自是什么。",
  "站点里至少有两类页面（例如首页 + 一篇内容），能构建并查看 `public/`。",
]
outcomes = [
  "面对一个 URL，能按页面种类 → 布局 → 输出格式 → 语言 → 类型 → section 的顺序推断出候选模板；",
  "用 front matter 的 `type` 与 `layout` 把某个页面指向指定模板；",
  "用 `hugo --templateMetrics` 确认某个模板被用了多少次，而不是靠猜；",
  "在 v0.146.0 之后的新目录约定下，正确命名模板文件。",
]
next = ["/templates/new-templatesystem-overview/", "/templates/types/", "/troubleshooting/"]

+++

> [!NOTE]
> Hugo 在 v0.146.0 中彻底重写了模板系统。相关文档正在陆续更新，你可以先阅读[新版模板系统概览](/templates/new-templatesystem-overview/)。

## 这一页解决什么问题

同一个 `layouts/` 目录里可能同时存在 `page.html`、`single.html`、`all.html`、`books/page.html` 好几个文件都能渲染某个页面。Hugo 必须有一套确定的规则挑出**唯一一个**：这套规则就是查找顺序。

理解它的收益很具体：

- 新建模板后没生效，你能立刻判断是「文件名不对」还是「优先级不够」；
- 不想为了一个联系表单把全站页面样式都改掉时，你知道该用 `type` + `layout` 精确指向；
- 页面渲染结果不对时，你能列出候选模板并逐个排除，而不用靠猜。

## 查找规则

Hugo 为给定页面选择模板时，会考虑下列参数，并按具体程度给模板排序。这套顺序应当让人感到自然，具体取值差异见后文示例。

页面种类（kind）
: 页面的 `Kind`（首页也算一种）。它同时决定该页面是**单页**（regular content page，HTML 模板从 `_default/single.html` 里找）还是**列表页**（章节列表、首页、分类法列表、分类法条目，HTML 模板从 `_default/list.html` 里找）。

布局（layout）
: 可以在 front matter 中设置。

输出格式
: 输出格式同时有 `name`（如 `rss`、`amp`、`html`）与 `suffix`（如 `xml`、`html`）。Hugo 优先选择两者都匹配的模板（如 `index.amp.html`），找不到再退而求其次。若输出格式的媒体类型定义了多个后缀，只考虑第一个。

语言
: 模板文件名中可以带语言标记。若站点语言是 `fr`，`index.fr.amp.html` 优于 `index.amp.html`，但 `index.amp.html` 又优于 `index.fr.html`。

类型（type）
: 取 front matter 中 `type` 的值；未设置时取根章节的名称（如 `blog`）。它总有值，都没设置时就是 `page`。

章节（section）
: 对 `section`、`taxonomy`、`term` 这几类页面有意义。

> [!NOTE]
> 模板可以放在项目或主题的 `layouts` 目录中，Hugo 会在两者之间交错查找，最终选出最具体的那一个。

三条实用推论，记住它们能省下大量排查时间：

1. **越具体的赢**：`type` / `layout` 比 `page` / `single` 这类通用名字更具体，所以内容页可以用 front matter 把模板「点名」；
2. **项目赢主题**：项目 `layouts/` 与主题 `layouts/` 交错比较时，同样具体的文件以项目为准——这就是「不改主题也能定制」的机制；
3. **没命中就回退**：具体模板缺失时按[内容类型](/templates/types/)里的回退链继续找（`page → single → all`），而不是报错。

## 新版模板系统的变化

新版模板系统还调整了 `layouts` 目录的结构与各类标识符的权重。以下对应关系与权重顺序参见[新版模板系统概览](/templates/new-templatesystem-overview/)一节，两处内容保持一致。

### 模板标识符的权重

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

### 目录与模板名的变化

- 取消 `layouts/_default` 目录：把其中的文件全部上移到 `layouts/` 根目录。原 `_default/single.html` 相应地成为 `layouts/single.html`，用于渲染单页；原 `_default/list.html` 成为 `layouts/list.html`，用于渲染列表页；原 `_default/baseof.html` 成为 `layouts/baseof.html`，作为基础模板。
- 首页不再有 `index.html` 这种模板：把 `index.html` 改名为 `home.html`。
- `layouts/partials` 更名为 `layouts/_partials`；`layouts/shortcodes` 更名为 `layouts/_shortcodes`。
- 旧系统里用于分类法条目的 `terms.html` 并没有一个「改名为 `term.html`」的官方对应关系：新版按页面种类查找 `term.html`、`list.html` 或 `all.html`，与旧文件名 `terms.html` 不是改名关系。
- 不再有顶层的 `layouts/taxonomy`、`layouts/section` 目录，除非它本身代表一条页面路径。应把它们上移到 `layouts/`，以页面种类 `section`、`taxonomy` 或 `term` 作为基名；或者放进该分类法对应的页面路径目录。
- 名为 `taxonomy.html` 的模板过去同时是 `term` 与 `taxonomy` 两种页面种类的候选，现在只对 `taxonomy` 生效。若要两者共用，请同时创建 `taxonomy.html` 与 `term.html`，或改用更通用的 `list.html`。
- 新增了 `all` 这种「兜底」布局：如果只有 `layouts/all.html` 一个模板，它将用于所有 HTML 页面的渲染。
- 取消了 `_internal` 内置模板的概念：现在只要创建同名局部模板，就能覆盖原本的内置模板。
- 对于基础模板（如 `baseof.html`），旧版本允许把 layout、type 或 kind 之一用连字符接在 `baseof` 关键字前面。应把该标识符移到第一个点之后，例如把 `list-baseof.html` 改名为 `baseof.list.html`。
- 模板文件名中可用的标识符包括：页面种类（`home`、`page`、`section`、`taxonomy`、`term`）、标准布局（`list`、`single`、`all`）、自定义布局（front matter 中 `layout` 字段的值）、语言（如 `en`）、输出格式（如 `html`、`rss`），以及代表媒体类型的后缀。例如 `all.en.html` 与 `home.rss.xml`。

以 `_` 开头的目录保留给特殊用途：`_partials` 存放局部模板，`_shortcodes` 存放短代码模板，`_markup` 存放渲染钩子模板。其余任何不以 `_` 开头的目录都代表一条页面路径的根，可以按需任意嵌套，而 `_shortcodes` 与 `_markup` 这类以下划线开头的目录也可以放在树的任意层级。

## 让页面使用指定模板

你无法通过修改查找顺序让某个模板去匹配某个内容页，但可以让内容页去匹配模板：在 front matter 中指定 `type`、`layout`，或两者同时指定。

假设内容结构如下，`content` 根目录下的文件其内容类型（type）为 `page`：

```tree
content/
├── about.md
└── contact.md
```

要让这些页面使用统一的模板，建立同名的子目录即可：

```tree
layouts/
└── page/
    └── single.html
```

联系页面通常带有表单，需要单独的模板，于是在 front matter 中指定 `layout`：

```toml
title = 'Contact'
layout = 'contact'
```

再为它创建模板。目录中 `contact.html` 渲染联系页面，`single.html` 渲染其余同为 `page` 类型的页面：

```tree
layouts/
└── page/
    ├── contact.html  <-- renders contact.md
    └── single.html   <-- renders about.md
```

`page` 这个类型名含义过于宽泛，改用更明确的类型并同时指定 `type` 与 `layout` 会更清晰：

```toml
title = 'About'
type = 'miscellaneous'
```

```toml
title = 'Contact'
type = 'miscellaneous'
layout = 'contact'
```

然后把布局放进与类型同名的目录：

```tree
layouts/
└── miscellaneous/
    ├── contact.html  <-- renders contact.md
    └── single.html   <-- renders about.md
```

对于放在 `layouts` 中、与某条页面路径部分或完全匹配的模板，向上越接近该页面的匹配被认为越好。例如 `layouts/docs/api/_markup/render-link.html` 用于渲染页面路径 `/docs/api` 及其下级页面的链接，`layouts/docs/baseof.html` 用作页面路径 `/docs` 及其下级页面的基础模板。因此放在 `layouts/docs/` 中的模板对 `/docs` 及其下级页面生效。

### 最小可运行示例

下面这个例子把「目录名 = 页面路径」这条规则跑出来。内容与模板各两个文件：

```toml {file="content/about.md"}
title = 'About'
type = 'miscellaneous'
```

```toml {file="content/contact.md"}
title = 'Contact'
type = 'miscellaneous'
layout = 'contact'
```

```go-html-template {file="layouts/miscellaneous/single.html"}
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>{{ .Title }}</title></head>
<body>
  <p>MISCELLANEOUS/SINGLE: {{ .Title }}</p>
</body>
</html>
```

```go-html-template {file="layouts/miscellaneous/contact.html"}
<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"><title>{{ .Title }}</title></head>
<body>
  <p>MISCELLANEOUS/CONTACT: {{ .Title }}</p>
</body>
</html>
```

构建后核对产物：

```bash
hugo
```

你应当看到：

- `public/about/index.html` 里是 `MISCELLANEOUS/SINGLE: About`；
- `public/contact/index.html` 里是 `MISCELLANEOUS/CONTACT: Contact`。

两个页面共用 `type`、只有 `contact` 多了一个 `layout`，结果就分了岔——这正是 `layout` 在权重表里排第一的原因。

### 验证：确认页面到底用了哪个模板

改完模板想知道「Hugo 到底选了哪个」，用模板指标：

```bash
hugo --renderToMemory --templateMetrics
```

你会看到一张按执行次数排序的统计表（下面是本站构建时的实际输出，节选）：

```text
Template Metrics:

       cumulative       average       maximum         
         duration      duration      duration  count  template
       ----------      --------      --------  -----  --------
          9.28  s      10.50 ms     373.84 ms    884  single.html
          6.18  s       6.99 ms      83.76 ms    884  single.md.md
          6.15  s       6.49 ms      83.76 ms    948  _partials/md-body.html
```

`count` 是模板被执行（渲染）的次数，最后一列是模板名。**这就是「模板有没有被用上」的硬证据**：count 为 0 或该模板根本没出现在表里，就说明没有页面命中它。清理无用模板时还可以加上 `--printUnusedTemplates`。

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH` → [安装 Hugo](/installation/) |
| 没报错但结果不对 | 新模板不生效，`--templateMetrics` 里 count 为 0 | 文件名不符合命名规则（例如 `list-baseof.html`、`terms.html`、`index.html` 这些旧名）→ 对照本页「目录与模板名的变化」 |
| 没报错但结果不对 | 改了主题目录里的模板却被项目覆盖 | 项目 `layouts/` 优先级更高 → 检查项目里是否有同名文件，改在项目里 |
| 没报错但结果不对 | 页面上出现的模板不是预期的那个 | 命中了更具体的模板（例如 `layouts/books/page.html` 会先于 `layouts/page.html`）→ 用 `--templateMetrics` 看实际命中的名字 |
| 报错看不懂 | 构建时出现 `found no layout file for …` 警告 | 查找链上一个可用模板都没有（这是 WARNING，构建仍继续）→ 先放 `layouts/all.html` 兜底，再逐个补齐 |
| 报错看不懂 | 旧项目升级后大量模板失效 | v0.146.0 的目录约定变化（`_default` 取消、`partials` → `_partials` 等）→ 按[新版模板系统概览](/templates/new-templatesystem-overview/)的迁移建议逐条处理 |

更多排查入口见[故障排查](/troubleshooting/)。
