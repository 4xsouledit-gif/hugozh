+++
title = "配置"
linkTitle = "配置"
description = "Hugo 配置怎么组织、按什么顺序查找与合并、如何按环境覆盖；含「改了没生效」的排查路径与常见坑。"
date = 2026-10-01
weight = 100
source = "https://gohugo.io/configuration/"

[params.teach]
difficulty = "入门"
time = "20–30 分钟"
prereq = [
  "已经有一个能构建的站点（在站点根目录运行 `hugo`，退出码为 0）；还没有的话先读[快速开始](/getting-started/quick-start/)。",
  "知道站点根目录下有一个 `hugo.toml` 即可，不要求会写模板。",
]
outcomes = [
  "说出 Hugo 读取配置的先后顺序，并判断某个键最终由哪一层决定；",
  "把配置拆到 `config/` 目录，只写各环境的差异，而不是复制整份文件；",
  "用 `hugo config` 确认改动是否真的生效，而不是靠猜；",
  "遇到「改了配置没反应」时，按查找顺序逐层排除。",
]
next = ["/configuration/introduction/", "/configuration/all/", "/troubleshooting/"]
+++

## 这一页解决什么问题

Hugo 有几百个配置项，但一个正常站点真正需要你动手写的通常不到十个。这一章讲清三件事：**配置写在哪里**、**Hugo 按什么顺序读取并合并它们**、**改错了会在哪里露馅**。读完它，你就能判断「我明明改了 `hugo.toml`，为什么页面没变化」这类问题大概率卡在哪一层。

新手在配置上的挫败几乎都来自同一个错觉：以为「文件里写了 = 生效了」。实际上配置有多个来源，彼此还有覆盖关系；写在不该写的位置、或者被后面的来源盖掉，Hugo 既不报错也不提示，页面看起来照常构建。

## 读完本章你应该能够

- 在项目根目录创建 `hugo.toml`（或 YAML/JSON），并说清它与 `config/` 目录各自适合什么场景；
- 按「项目配置 → 环境配置 → 主题/模块 → 环境变量」的顺序，判断某个键最终取哪个值；
- 用 `--config a.toml,b.toml` 组合多份配置，并知道键冲突时谁覆盖谁；
- 说出主题与模块的配置为什么默认**不**合并（`_merge`），以及放宽合并的安全代价；
- 用 `hugo config` 查看生效后的实际配置，而不是照着源文件猜。

## 建议阅读顺序

1. **[配置简介](/configuration/introduction/)** —— 配置文件、配置目录、环境变量与合并策略的总入口。**先读这一页**，后面每页都在它的框架内展开。
2. **[所有设置](/configuration/all/)** —— 键值速查表。不必通读，按需查阅；但要先知道「键名写错不会报错」这件事。
3. **[配置 Markup](/configuration/markup/)** —— 日常改得最多的一类：Markdown 渲染、代码高亮、目录、脚注。
4. **[配置菜单](/configuration/menus/)**、**[配置语言](/configuration/languages/)** —— 建站后很快会用到的两块。
5. 其余页面按需求查：输出格式、缓存、图片处理、模块挂载、安全策略等。

> [!TIP]
> 只关心「让站点跑起来」？照[配置简介](/configuration/introduction/)里「合理的默认值」写四行就够了，其余配置等真正需要时再回来查。

## 配置的查找顺序与合并规则

配置写错最常见的表现不是报错，而是**没有反应**：Hugo 根本没读到你写的那份文件，或者读到了却被后面的来源覆盖。所以先记住「谁覆盖谁」，再去查具体的键。

Hugo 组装一份最终配置时，后一步会覆盖前一步中同名的键：

| 顺序 | 来源 | 说明 |
| --- | --- | --- |
| 1 | 项目根目录的 `hugo.toml` / `hugo.yaml` / `hugo.json` | 按 `toml` → `yaml` → `json` 的优先级取存在的那一份；这是最常见的起点 |
| 2 | `--config a.toml,b.yaml` 指定的文件 | 按列出顺序加载，**右侧覆盖左侧**；此时不再使用默认的项目配置文件 |
| 3 | `config/_default/` 目录 | 按配置分区、语言拆分的默认配置 |
| 4 | `config/<环境>/` 目录 | 覆盖第 3 步中同名的键 |
| 5 | 主题与模块自带的配置 | 合并进项目配置，**项目优先**；默认 `_merge = 'none'`，同名分类整体不参与合并 |
| 6 | 操作系统环境变量 `HUGO_*` | 优先级最高，覆盖以上所有来源 |

几个容易混淆的点：

- **环境**由 `--environment` 或 `HUGO_ENVIRONMENT` 决定；不指定时，`hugo`（构建）默认 `production`，`hugo server` 默认 `development`。这就是「本地预览好好的、一上线配置就变了」的原因。
- **第 3、4 步是覆盖，第 5 步是合并**。用 `--config` 或多份目录文件时，键冲突一律「后者赢」；而主题与模块的配置只在 `_merge` 放宽时才会逐层合并。
- **`_merge` 可以写在任意嵌套层级**，也可写在配置根级改变所有分区的默认行为。取值 `none` / `shallow` / `deep` 的语义见下文[合并策略](#合并策略)。

改完之后**唯一可靠的验证方式**是看生效结果，而不是看源文件：

```bash
hugo config            # 打印合并后的完整配置
hugo config mounts     # 只看文件挂载（mounts）
```

**你应当看到什么**：`hugo config` 的输出里应当能找到你刚写下的键和值，并且路径/环境相关的值（例如 `baseURL`、`publishDir`）与你当前构建环境一致。如果搜不到这个键，说明它没生效——回到上表逐层排查。

## 常见坑

配置类问题的共同特点是「构建成功、结果不对」，所以下表按**症状**入手：

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 改了配置文件，站点毫无变化 | 改的不是实际生效的那份：项目根同时存在 `hugo.toml` 与 `hugo.yaml`，而 `toml` 优先级更高 | 只保留一份配置文件；用 `hugo config` 确认 |
| `hugo server` 里有效，`hugo build` 里无效 | 值写进了 `config/development/`（server 的默认环境），生产构建读的是 `config/production/` | 公共值放 `config/_default/`，环境目录只留差异 |
| 键明明写了，输出里却没有 | 裸键写在了某个 `[表头]` **之后**，被 TOML 归入了那张表（例如 `weight` 变成了 `params.weight`） | 把所有裸键移到第一个表头之前 |
| 主题升级后行为突然变了 | 主题自带的配置被合并了进来（`_merge` 曾被放宽到 `shallow`/`deep`） | 用 `hugo config` 对照实际值；必要时把 `_merge` 收回 `none` |
| 构建直接报错，且指向配置文件 | 语法错误：TOML 少了引号、YAML 缩进不一致、JSON 多了逗号 | 按报错给出的文件与行号修；对照[配置简介](/configuration/introduction/)中的最小示例 |
| 报错看不懂 | 报错来自主题或模块的配置，而不是你的文件 | 用 `hugo config` 看合并结果，判断键来自哪一层 |

更多排查入口见[故障排查](/troubleshooting/)。

## 通用设置与配置分类

项目配置中的每个顶层键，要么是通用设置（general setting），要么是配置分类（configuration category）。

通用设置是单个值，例如 `baseURL` 或 `title`；配置分类把相关的嵌套设置归为一组，例如 `markup`、`menus` 或 `params`。

```toml
baseURL = 'https://example.org/'
title = 'My New Hugo Site'

[params]
subtitle = 'The Best Widgets on Earth'
```

上例中，`baseURL` 与 `title` 是通用设置，`params` 是配置分类。

## 合理的默认值

Hugo 的配置项很多，但默认值通常已经够用。新项目只需要这几个设置：

```toml
baseURL = 'https://example.org/'
locale = 'en-us'
title = 'My New Hugo Site'
```

只定义与默认值不同的设置。配置文件越小，越容易阅读、理解与排查问题。

> 最好的配置文件就是短配置文件。

## 配置文件

在项目根目录创建项目配置文件，命名为 `hugo.toml`、`hugo.yaml` 或 `hugo.json`，优先级也按此顺序。

```text
my-project/
└── hugo.toml
```

一个简单的例子：

```toml
baseURL = 'https://example.org/'
locale = 'en-us'
title = 'ABC Widgets, Inc.'

[params]
subtitle = 'The Best Widgets on Earth'

[params.contact]
email = 'info@example.org'
phone = '+1 202-555-1212'
```

构建时想改用别的配置文件，可以使用 `--config` 参数：

```bash
hugo build --config other.toml
```

也可以合并两个或多个配置文件，优先级从左到右：

```bash
hugo build --config a.toml,b.yaml,c.json
```

Hugo 按列出的顺序加载文件，后一个文件会递归覆盖前一个文件中同名的键；也就是说，键冲突时以最后列出的文件为准。

## 配置目录

除单个配置文件外，还可以按环境（environment）、配置分类与语言把配置拆分到 `config` 目录。Hugo 先加载 `_default` 目录，再加载当前环境对应的目录，因此键冲突时环境专属的值生效。例如：

```text
my-project/
└── config/
    ├── _default/
    │   ├── hugo.toml
    │   ├── menus.en.toml
    │   ├── menus.de.toml
    │   └── params.toml
    └── production/
        └── params.toml
```

配置分类指 `markup`、`menus`、`params`、`module`、`services`、`taxonomies` 这类分组，完整列表见官方文档的 All settings 页面。

### 省略或包含分类名

自 v0.162.0 起，按配置分类拆分时，组件文件中可以省略、也可以保留分类名。例如下面两种写法等价：

```toml
# config/_default/hugo.toml
[params]
foo = 'bar'
```

```toml
# config/_default/params.toml
foo = 'bar'
```

对 `menus` 这类「值为映射到切片」的键同样适用，`[[main]]` 与 `[[menus.main]]` 等价。而对 `cascade`、`permalinks` 这类纯切片类型的键，则必须写出分类名。

> 只有当分类名是文件中的唯一键，且与文件的基本名一致时，Hugo 才会把这一层「解包」。

### 递归解析

Hugo 会递归解析 `config` 目录，因此可以把配置文件放进子目录，例如 `config/_default/navigation/menus.en.toml`。

### 示例

```text
my-project/
└── config/
    ├── _default/
    │   └── hugo.toml
    ├── production/
    │   └── hugo.toml
    └── staging/
        └── hugo.toml
```

以 Google Analytics 为例，它要求在项目配置中填写 Google 标记 ID：

```toml
[services.googleAnalytics]
ID = 'G-XXXXXXXXX'
```

现在有两个需求：运行 `hugo server` 时不加载分析代码；生产环境与预发环境使用不同的标记 ID。可以这样配置：

1. `config/_default/hugo.toml`：不写 `services.googleAnalytics` 区段。运行 `hugo server` 时 `environment` 默认为 `development`，在没有 `config/development` 目录的情况下 Hugo 使用 `config/_default`。
2. `config/production/hugo.toml`：只写 `[services.googleAnalytics]` 与 `ID = 'G-PPPPPPPPP'`。运行 `hugo build` 时 `environment` 默认为 `production`。
3. `config/staging/hugo.toml`：只写 `[services.googleAnalytics]` 与 `ID = 'G-SSSSSSSSS'`，用 `hugo build --environment staging` 构建预发站点。

环境目录中的文件只需写出与环境相关的设置，Hugo 会用它们覆盖默认配置中的同名键。

## 合并配置设置

Hugo 会合并来自主题与模块的配置，并优先使用项目自身的设置。这与用 `--config` 合并多个文件、或把配置拆分到配置目录不同：后两者对同名键总是直接覆盖。

以两个主题的项目为例：

```text
project/
├── themes/
│   ├── theme-a/
│   │   └── hugo.toml
│   └── theme-b/
│       └── hugo.toml
└── hugo.toml
```

```toml
baseURL = 'https://example.org/'
locale = 'en-us'
title = 'My New Hugo Site'
theme = ['theme-a','theme-b']
```

Hugo 按以下顺序合并设置：项目配置、`theme-a` 配置、`theme-b` 配置。

### 合并策略

每个配置分类中的 `_merge` 设置决定合并_哪些_设置以及_如何_合并。`_merge` 可以写在分类的任意嵌套层级，而不限于顶层；合并嵌套表时，Hugo 使用该表自身的 `_merge`，没有设置则继承最近的祖先。

```toml
[markup.goldmark.extensions.typographer]
_merge = 'deep'
```

`_merge` 的取值可以是：

- `none`：不合并。
- `shallow`：只为新键添加值。
- `deep`：为新键添加值，并合并已有键的值。

### 根级合并策略

`_merge` 也可以写在项目配置的根级（任何配置分类之外），从而改变整个项目的行为：

```toml
_merge = 'none'
baseURL = 'https://example.org/'
locale = 'en-us'
title = 'My New Hugo Site'
theme = ['theme-a','theme-b']
```

根级 `_merge` 为 `none` 时，主题与模块的配置完全不合并，无论各配置分类上写了什么；根级 `_merge` 为 `shallow` 或 `deep` 时，则改变那些未自行指定 `_merge` 的分类的默认合并策略。

> Hugo 可以把模块与主题中的映射（map）类型配置值合并进项目配置，但无法合并切片（slice）类型的值。这既包括 `menus` 这类切片类型的配置分类，也包括 `outputs` 中按页面种类划分的格式列表这类「值为切片」的映射键。

### 安全影响

多数配置分类默认采用 `none` 合并策略，正是为了保护项目免受第三方主题与模块的影响。

> 把 `_merge` 设为 `shallow` 或 `deep` 会移除这层保护，无论它作用于 `markup`、`security` 这类安全敏感的键，还是写在配置根级改变所有键的默认策略。只有在你信任项目中的每一个主题与模块时，才对这些键使用宽松的 `_merge`。

## 环境变量

也可以用操作系统环境变量来配置设置：

```bash
export HUGO_BASEURL=https://example.org/
export HUGO_ENABLEGITINFO=true
hugo
```

上例会设置 `baseURL` 与 `enableGitInfo`，然后构建站点。

> 环境变量的优先级高于配置文件中的值。也就是说，同一个配置项既用环境变量设置、又写在配置文件里时，Hugo 采用环境变量的值。

环境变量名必须以 `HUGO_` 开头；设置自定义站点参数时，前缀为 `HUGO_PARAMS_`。

对于 snake_case 形式的变量名，标准的 `HUGO_` 前缀不能直接用。Hugo 会根据 `HUGO` 之后的第一个字符推断分隔符，因此也可以写成 `HUGOxPARAMSxAPI_KEY=abcdefgh` 这样的形式。

除常规设置外，环境变量还可以覆盖某些内部设置的默认值：

- `DART_SASS_BINARY`：Dart Sass 可执行文件的绝对路径。默认情况下 Hugo 依次在 `PATH` 环境变量的各个路径中查找。
- `HUGO_ENVIRONMENT`：构建环境。运行 `hugo build` 时默认是 `production`，运行 `hugo server` 时默认是 `development`。
- `HUGO_FILE_LOG_FORMAT`：报错或从短代码、Markdown 渲染钩子调用 `Position` 方法时，文件路径、行号与列号的格式字符串；可用标记为 `:file`、`:line`、`:col`，默认为 `:file::line::col`。
- `HUGO_MEMORYLIMIT`：渲染站点时 Hugo 可用的最大系统内存，单位为 GB，默认是系统总内存的 25%。这是「尽力而为」的设置，可以用 `hugo build --logLevel info` 观察 `dynacache` 标签了解实际行为。
- `HUGO_NUMWORKERMULTIPLIER`：并行处理使用的工作进程数，默认等于逻辑 CPU 数量。

## 查看当前配置

查看完整的项目配置：

```bash
hugo config
```

查看某一项配置：

```bash
hugo config | grep [key]
```

查看已配置的文件挂载：

```bash
hugo config mounts
```
