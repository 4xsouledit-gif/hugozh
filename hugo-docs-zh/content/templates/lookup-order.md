+++
title = "模板查找顺序"
linkTitle = "模板查找顺序"
description = "Hugo 为给定页面挑选模板的查找规则，以及新版目录约定。"
date = 2026-10-01
weight = 90
source = "https://gohugo.io/templates/lookup-order/"
+++

> [!NOTE]
> Hugo 在 v0.146.0 中彻底重写了模板系统。相关文档正在陆续更新，你可以先阅读[新版模板系统概览](/templates/new-templatesystem-overview/)。

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
    ├── contact.html
    └── single.html
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
    ├── contact.html
    └── single.html
```

对于放在 `layouts` 中、与某条页面路径部分或完全匹配的模板，向上越接近该页面的匹配被认为越好。例如 `layouts/docs/api/_markup/render-link.html` 用于渲染页面路径 `/docs/api` 及其下级页面的链接，`layouts/docs/baseof.html` 用作页面路径 `/docs` 及其下级页面的基础模板。因此放在 `layouts/docs/` 中的模板对 `/docs` 及其下级页面生效。
