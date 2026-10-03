+++
title = "多语言"
linkTitle = "多语言"
description = "按语言组织内容与翻译表，生成多语言站点与语言切换入口；含配置位置、验证方法与常见坑。"
date = 2026-10-01
weight = 120
source = "https://gohugo.io/content-management/multilingual/"

[params.teach]
difficulty = "进阶"
time = "30–40 分钟"
prereq = [
  "有一个能构建的单语言站点，知道项目配置里哪些键是顶层标量、哪些是表。",
  "读过[菜单](/content-management/menus/)与[页面包](/content-management/page-bundles/)。",
]
outcomes = [
  "在项目配置里声明多种语言与默认语言，并决定默认语言是否带语言子目录；",
  "用文件名后缀或目录两种方式组织译文，并让两种方式与配置保持一致；",
  "用翻译表（i18n）本地化界面文案，用多语言配置本地化日期、数字与货币；",
  "用 `hugo list all` 与产物目录验证每种语言都生成到了预期地址。",
]
next = ["/configuration/languages/", "/content-management/menus/", "/content-management/page-bundles/"]

+++

## 这一页解决什么问题

多语言站点有三个独立的层次，混在一起就会乱：**内容**（译文文件放哪）、**界面文案**（翻译表 i18n）、**本地化格式**（日期、货币、数字）。它们各自的配置位置不同，验证方法也不同。本页逐层给出配置位置与验证手段。

配置几乎全部集中在项目配置的 `[languages]` 区段与顶层标量键上：

```toml
[languages.en]
weight = 1
[languages.zh]
weight = 2
```

**验证多语言是否搭起来了**，一步到位：

```bash
hugo
```

**你应当看到什么**（**实测：Hugo 0.167**）：构建输出的统计表会**按语言分列**（例如 `│ EN │ ZH │`），每种语言各有自己的页面数；产物目录里，非默认语言的内容出现在语言子目录下：

```text
public/multi/index.html        ← 默认语言（en）的页面
public/zh/multi/index.html     ← 另一种语言（zh）的页面
```

再用 `hugo list all` 看地址最直观——同一个逻辑页面会有多行，`permalink` 分别带各自的语言前缀：

```text
content/multi.md     → https://example.org/multi/
content/multi.zh.md  → https://example.org/zh/multi/
```

**你应当看到什么**（继续验证配置生效）：`hugo config` 的输出里能找到 `defaultcontentlanguage` 与完整的 `[languages]` 表。**默认语言是否带子目录由 `defaultContentLanguageInSubdir` 决定**：为 `false`（默认）时默认语言在根目录、其它语言在各自语言子目录下；为 `true` 时所有语言都在语言子目录下。

## 配置

多语言站点的语言清单与默认语言都在项目配置中声明。以下是基础设置：

```toml
defaultContentLanguage = "en"
defaultContentLanguageInSubdir = false
disableDefaultLanguageRedirect = false
disableLanguages = []
```

`defaultContentLanguage` 是项目的默认语言，写法遵循 RFC 5646；定义了一种或多种语言后，该值必须与某个已定义的语言键匹配。

`defaultContentLanguageInSubdir` 决定是否把默认语言的内容也输出到同名子目录中，默认值为 `false`。

`disableDefaultLanguageRedirect` 用于关闭默认语言的重定向别名，默认值为 `false`。当 `defaultContentLanguageInSubdir` 为 `true` 时，它会阻止根目录跳转到语言子目录；为 `false` 时，它会阻止语言子目录跳转回根目录。

`disableLanguages` 是一个语言键切片，用于在构建时停用这些语言。虽然可用，但更推荐在每个语言下使用 `disabled` 键。完整的语言设置说明见 [配置](/configuration/)。

## 翻译内容

管理内容翻译有两种方式，两者都会为每个页面指定语言，并把它与对应的翻译页面互相链接。

### 按文件名翻译

以两个文件为例：

```text
content/about.en.md
content/about.fr.md
```

第一个文件被指派为英语并与第二个链接，第二个被指派为法语并与第一个链接。语言取自文件名后缀中的语言代码；只要路径与文件基名相同，这些内容就会作为彼此的翻译页面链接起来。

> [!NOTE]
> 文件名中的语言代码必须小写，例如使用 `about.en-us.md`，而不是 `about.en-US.md`。

> [!NOTE]
> 如果文件没有语言代码，它会被指派为默认语言。

### 按目录翻译

这种方式为每种语言使用不同的内容目录，通过 `contentDir` 参数设置：

```toml
[languages.en]
  contentDir = "content/english"
  label = "English"
  weight = 10
[languages.fr]
  contentDir = "content/french"
  label = "Français"
  weight = 20
```

`contentDir` 的取值可以是任何合法路径，甚至可以是绝对路径，唯一的限制是各内容目录之间不能重叠。

配合上面的配置：

```text
content/english/about.md
content/french/about.md
```

第一个文件被指派为英语并与第二个链接，第二个被指派为法语并与第一个链接。语言由文件所在的 `content` 目录决定；只要相对于各自语言的内容目录而言路径与基名相同，这些内容就会作为翻译页面链接起来。

### 绕开默认链接规则

只要在 front matter 中设置相同的 `translationKey`，无论基名或位置如何，页面都会被链接为翻译页面。例如下面三个文件：

```text
content/about-us.en.md
content/om.nn.md
content/presentation/a-propos.fr.md
```

在三个页面中都写入以下 front matter，它们就会被视为彼此的翻译：

```toml
translationKey = "about"
```

### 本地化永久链接

由于链接依赖路径与文件名，所有翻译页面通常共享同一个 URL（只有语言子目录不同）。要本地化 URL，可在 front matter 中设置 `slug` 或 `url`。

例如法语翻译可以使用自己的本地化 slug：

```yaml
---
title: A Propos
slug: "a-propos"
---
```

最终 URL 为：

```text
content/about.md    -> https://example.org/about/
content/about.fr.md -> https://example.org/fr/a-propos/
```

两个页面仍然是彼此的翻译。

自 v0.167.0 起，在 `section`、分类法或术语页面上设置 `slug` 时，Hugo 会把该 slug 应用到其下所有页面的 URL。例如本地化 `products` section 及其子页面的地址：

```yaml
---
title: Produits
slug: "produits"
---
```

最终 URL 为：

```text
content/products/_index.fr.md             -> https://example.org/fr/produits/
content/products/electronics/_index.fr.md -> https://example.org/fr/produits/electronics/
content/products/electronics/tv.fr.md     -> https://example.org/fr/produits/electronics/tv/
```

`slug` 与 `url` 的详细行为见 [URL 管理](/content-management/urls/)。

### 页面包

为避免重复维护文件，每个页面包（page bundle）都会继承其翻译页面所在包的资源，内容文件（Markdown、HTML 等）除外。因此模板中可以直接访问所有关联包中的文件。

如果关联的多个包中存在基名相同的文件，只会保留其中的一个，选择顺序是：

- 优先使用当前语言包中的文件；
- 否则按语言 `weight` 的顺序，取最先找到的文件。

> [!NOTE]
> 页面包资源与内容文件遵循相同的语言指派逻辑，既可以按文件名区分（`image.jpg`、`image.fr.jpg`），也可以按目录区分（`english/about/header.jpg`、`french/about/header.jpg`）。

## 界面文案的翻译表

模板中的固定文案通过翻译表维护，放在 `i18n/` 目录下，每种语言一个文件：

```toml
# i18n/de.toml
products = "Produkte"
services = "Leistungen"
```

在模板中用翻译函数取值，键名即翻译表中的键：

```go-html-template
<a href="{{ .RelPermalink }}">{{ T "products" }}</a>
```

`i18n` 与 `T` 是同一个函数的两种写法，可以交替使用。翻译表还支持按数量区分单复数等形式，具体写法以当前版本的官方文档为准。

## 本地化

以下示例假定项目的主语言是英语，另有法语与德语翻译：

```toml
defaultContentLanguage = "en"

[languages.en]
  contentDir = "content/en"
  label = "English"
  weight = 1
[languages.fr]
  contentDir = "content/fr"
  label = "Français"
  weight = 2
[languages.de]
  contentDir = "content/de"
  label = "Deutsch"
  weight = 3
```

### 日期、货币、数字与百分比

日期用 `time.Format` 格式化，例如模板中写入 `{{ .Date | time.Format ":date_full" }}`，`2021-11-03T12:34:56+01:00` 会分别渲染为 Wednesday, November 3, 2021（英语）、mercredi 3 novembre 2021（法语）、Mittwoch, 3. November 2021（德语）。

货币、数字与百分比分别使用 `lang.FormatCurrency`、`lang.FormatNumber`、`lang.FormatPercent`。同一个数值 `512.5032` 在三种语言下的输出如下：

| 格式化方式 | English | Français | Deutsch |
| --- | --- | --- | --- |
| `FormatCurrency 2 "USD"` | $512.50 | 512,50 $US | 512,50 $ |
| `FormatNumber 2` | 512.50 | 512,50 | 512,50 |
| `FormatPercent 2` | 512.50% | 512,50 % | 512,50 % |

## 菜单

菜单项的本地化方式取决于菜单的定义位置：

- 使用 section 页面菜单**自动**定义菜单项时，必须借助翻译表来本地化每一项；
- 在 **front matter** 中定义菜单项时，菜单本身已经按语言区分；若其中的名称不够用，再用翻译表补充；
- 在**项目配置**中定义菜单项时，必须在每个语言键下分别创建菜单项；名称不够用时同样借助翻译表。

### 按语言定义菜单

既可以写在单个配置文件中，也可以使用配置目录结构。

#### 单个配置文件

条目较少时使用单个配置文件即可：

```toml
# 单个配置文件，按语言分别定义菜单项
[languages.de]
label = "Deutsch"
locale = "de-DE"
weight = 1
[[languages.de.menus.main]]
name = "Produkte"
pageRef = "/products"
weight = 10
[[languages.de.menus.main]]
name = "Leistungen"
pageRef = "/services"
weight = 20

[languages.en]
label = "English"
locale = "en-US"
weight = 2
[[languages.en.menus.main]]
name = "Products"
pageRef = "/products"
weight = 10
[[languages.en.menus.main]]
name = "Services"
pageRef = "/services"
weight = 20
```

#### 配置目录

菜单结构较复杂时，可以创建配置目录，把菜单项按语言拆成多个文件：

```text
config/
└── _default/
    ├── menus.de.toml
    ├── menus.en.toml
    └── hugo.toml
```

```toml
# config/_default/menus.de.toml
[[main]]
  name = "Produkte"
  pageRef = "/products"
  weight = 10
[[main]]
  name = "Leistungen"
  pageRef = "/services"
  weight = 20
```

```toml
# config/_default/menus.en.toml
[[main]]
  name = "Products"
  pageRef = "/products"
  weight = 10
[[main]]
  name = "Services"
  pageRef = "/services"
  weight = 20
```

### 使用翻译表

渲染菜单项文本时，示例菜单模板会查询当前语言的翻译表，为此需要使用菜单项的 `identifier`：

```go-html-template
{{ or (T .Identifier) .Name | safeHTML }}
```

如果翻译表不存在，或者翻译表中没有对应的 `identifier` 键，模板会回退到 `name`。`identifier` 的取值取决于菜单的定义方式：

- 使用 section 页面菜单**自动**定义时，`identifier` 是页面的 `.Section`；
- 在**项目配置**或 **front matter** 中定义时，需要为菜单项显式设置 `identifier`。

例如在项目配置中定义菜单项，并为每项指定 `identifier`：

```toml
# 项目配置
[[menus.main]]
identifier = "products"
name = "Products"
pageRef = "/products"
weight = 10

[[menus.main]]
identifier = "services"
name = "Services"
pageRef = "/services"
weight = 20
```

再在翻译表中建立同名的条目：

```toml
# i18n/de.toml
products = "Produkte"
services = "Leistungen"
```

## 缺失的翻译

如果某个字符串在当前语言下没有翻译，Hugo 会使用默认语言的值；若默认值也不存在，则显示空字符串。

翻译过程中，可视化地标出缺失项会很有帮助。配置项 `enableMissingTranslationPlaceholders` 会用占位符 `[i18n] identifier` 标记所有未翻译的字符串，其中 `identifier` 是缺失翻译的 id。

> [!NOTE]
> 开启该设置后生成的站点会带有这些占位符，通常不适合直接用于生产环境。

至于**内容**缺失翻译时的合并，请使用 `lang.Merge`。

要定位缺失的翻译字符串，可以在构建时加上 `--printI18nWarnings` 参数：

```sh
hugo build --printI18nWarnings | grep i18n
i18n|MISSING_TRANSLATION|en|wordCount
```

## 多语言主题支持

要让主题支持多语言模式，模板中的 URL 需要满足以下条件：

- 来自内建的 `.Permalink` 或 `.RelPermalink`；
- 或由 `urls.RelLangURL`、`urls.AbsLangURL` 函数构造，或者带上页面的 `LanguagePrefix`。

定义了多种语言时，`LanguagePrefix` 会返回 `/en`（或当前语言的对应前缀）；单语言站点中它是空字符串，因此不会产生副作用。

## 生成多语言内容

如果翻译内容放在同一目录中：

```sh
hugo new content post/test.en.md
hugo new content post/test.de.md
```

如果翻译内容分目录存放：

```sh
hugo new content content/en/post/test.md
hugo new content content/de/post/test.md
```

生成命令的完整参数见 [基础用法](/getting-started/basic-usage/)。

## 什么时候做多语言、什么时候别做

**该做**：

- 站点确实要维护两套以上语言的**内容**，且希望它们共享模板、样式与构建流程；
- 需要在同一站点内提供语言切换入口与本地化的日期/数字格式。

**别做**：

- **只有零星几页是外语**——多语言配置会让 URL、菜单、`baseURL`、别名与 sitemap 全部多一层语言维度，维护成本远高于单独建一个站点；
- **把「界面文案翻译」当成「内容翻译」**——翻译表（i18n）只管模板里的固定文案，正文译文仍要按文件名或目录组织；
- **以为译文会自动生成**——Hugo 不会翻译内容；缺失的译文就是缺失的页面（除非按[缺失的翻译](#缺失的翻译)一节做了兜底）。

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 某种语言的页面根本没生成 | 文件名后缀与配置里的语言键不一致（配置写 `zh-cn`，文件写成 `index.zh.md`）；或该语言被 `disabled` / `disableLanguages` 停用 | 对照项目配置的 `[languages]` 键逐字核对后缀；用 `hugo list all` 看该语言是否有行 |
| 没报错但结果不对 | 默认语言的地址与预期差一层 `/en/` | `defaultContentLanguageInSubdir` 的取值与预期不符 | 需要默认语言也进子目录就设为 `true`；否则保持默认 `false` |
| 没报错但结果不对 | 语言切换链接指向错误语言或 404 | 模板里手写 URL 而不是用 `.Permalink`/`.RelPermalink`，或没用 `urls.RelLangURL`、`LanguagePrefix` | 按[多语言主题支持](#多语言主题支持)一节改用带语言前缀的写法 |
| 没报错但结果不对 | 页面上的固定文案还是原文 | 没有对应的翻译表条目，或 `i18n` 目录文件名与语言键不匹配 | 按[界面文案的翻译表](#界面文案的翻译表)检查文件位置与键名；构建时用 `--printI18nWarnings` 列出缺失项 |
| 没报错但结果不对 | 日期、数字格式还是英文 | 该语言的本地化数据不完整，`:date_*` 一类记号会回退为英文 | 显式指定格式（例如 `.Format "2006-01-02"`），不要依赖本地化记号 |
| 没报错但结果不对 | 菜单某语言下缺项或串语言 | 菜单项没有按语言分别定义，也没用翻译表本地化 `name` | 见[菜单](#菜单)一节，按语言定义或用翻译表 |
| 报错看不懂 | 构建报语言键相关的配置错误 | `defaultContentLanguage` 与已定义的 `[languages.*]` 键不匹配 | 让两者逐字一致；注意语言键大小写与层级 |

更多排查入口见[故障排查](/troubleshooting/)。
