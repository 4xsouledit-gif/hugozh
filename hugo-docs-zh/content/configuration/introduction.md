+++
title = "配置简介"
linkTitle = "配置简介"
description = "介绍配置文件、配置目录、环境变量与合并策略。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/configuration/introduction/"
+++

## 常规设置与配置分区

项目配置中的每个顶层键要么是**常规设置**，要么是**配置分区**。

常规设置是单个值，例如 `baseURL` 或 `title`。配置分区则把相关的嵌套设置归为一组，例如 `markup`、`menus` 或 `params`。

```toml
baseURL = 'https://example.org/'
title = 'My New Hugo Site'
[params]
subtitle = 'The Best Widgets on Earth'
```

上例中，`baseURL` 与 `title` 是常规设置，`params` 是配置分区。

## 合理的默认值

Hugo 提供了大量配置项，但默认值通常已经够用。一个新项目只需要以下设置：

```toml
baseURL = 'https://example.org/'
locale = 'en-us'
title = 'My New Hugo Site'
```

只定义与默认值不同的设置。配置文件越小，越容易阅读、理解和调试，请保持配置简洁。

> 最好的配置文件就是一份简短的配置文件。

## 配置文件

在项目根目录创建项目配置文件，命名为 `hugo.toml`、`hugo.yaml` 或 `hugo.json`，优先级也按此顺序。

```tree
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

构建时若想使用其他配置文件，请使用 `--config` 选项：

```bash
hugo build --config other.toml
```

也可以把两个或多个配置文件组合起来，优先级从左到右：

```bash
hugo build --config a.toml,b.yaml,c.json
```

Hugo 按列出的顺序加载文件，后一个文件会递归覆盖前面文件中同名的键。也就是说，遇到冲突的键时，最后列出的文件的值生效。

> 各文件格式的规范参见 TOML、YAML 与 JSON 的官方文档。

## 配置目录

除了单一的项目配置文件，还可以按环境、配置分区和语言把配置拆分开。Hugo 先加载 `_default` 目录，再加载当前环境对应的目录，因此冲突的键以环境专属值为准。例如：

```tree
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

配置分区包括 `build`、`caches`、`contentTypes`、`deployment`、`frontmatter`、`httpCache`、`imaging`、`languages`、`markup`、`mediaTypes`、`menus`、`minify`、`module`、`outputFormats`、`outputs`、`pagination`、`params`、`permalinks`、`privacy`、`related`、`security`、`segments`、`server`、`services`、`sitemap`、`taxonomies` 等。

### 省略或包含分区名

Hugo 0.162.0 及更高版本支持在按配置分区拆分配置时，选择省略或包含分区名。例如下面两种写法是等价的：

```toml
# config/_default/hugo.toml
[params]
foo = 'bar'
```

```toml
# config/_default/params.toml
foo = 'bar'
```

这也适用于值是「切片映射」的键，例如 `menus`。例如下面两种写法等价：

```toml
# config/_default/menus.toml
[[main]]
name = 'Home'
pageRef = '/'
weight = 10
```

```toml
# config/_default/menus.toml
[[menus.main]]
name = 'Home'
pageRef = '/'
weight = 10
```

而对于 `cascade`、`permalinks` 这类纯切片类型的键，则必须写出分区名：

```toml
# config/_default/cascade.toml
[[cascade]]
[cascade.params]
color = 'red'
[cascade.target]
path = '/articles/**'
```

> 只有当分区名是文件中的唯一键、且与文件基本名匹配时，Hugo 才会把它解包。

### 递归解析

Hugo 会递归解析 `config` 目录，因此你可以用子目录组织文件：

```tree
my-project/
└── config/
    └── _default/
        ├── navigation/
        │   ├── menus.de.toml
        │   └── menus.en.toml
        └── hugo.toml
```

### 示例

```tree
my-project/
└── config/
    ├── _default/
    │   ├── hugo.toml
    │   ├── menus.en.toml
    │   ├── menus.de.toml
    │   └── params.toml
    ├── production/
    │   ├── hugo.toml
    │   └── params.toml
    └── staging/
        ├── hugo.toml
        └── params.toml
```

针对上面的结构，运行 `hugo build --environment staging` 时，Hugo 会先采用 `config/_default` 中的全部设置，再用 `staging` 中的设置覆盖同名键。

举个具体例子。假设网站使用 Google Analytics，需要在项目配置中指定 Google 标记 ID：

```toml
[services.googleAnalytics]
ID = 'G-XXXXXXXXX'
```

现在考虑以下需求：

1. 运行 `hugo server` 时不加载统计代码。
2. 生产与预发环境使用不同的 Google 标记 ID，例如生产用 `G-PPPPPPPPP`，预发用 `G-SSSSSSSSS`。

可以这样配置：

1. `config/_default/hugo.toml`
    - 不写 `services.googleAnalytics` 分区，这样运行 `hugo server` 时就不会加载统计代码。
    - 运行 `hugo server` 时 Hugo 默认把 `environment` 设为 `development`；由于不存在 `config/development` 目录，Hugo 使用 `config/_default` 目录。
2. `config/production/hugo.toml`
    - 只包含以下分区：

      ```toml
      [services.googleAnalytics]
      ID = 'G-PPPPPPPPP'
      ```

    - 无需在文件中写其他参数，只写生产环境专属的参数即可，Hugo 会用它们覆盖默认配置。
    - 运行 `hugo build` 时 Hugo 默认把 `environment` 设为 `production`，统计代码使用 `G-PPPPPPPPP`。
3. `config/staging/hugo.toml`
    - 只包含以下分区：

      ```toml
      [services.googleAnalytics]
      ID = 'G-SSSSSSSSS'
      ```

    - 同样只写预发环境专属的参数。
    - 运行 `hugo build --environment staging` 构建预发站点，统计代码使用 `G-SSSSSSSSS`。

## 合并配置设置

Hugo 会合并来自主题和模块的配置设置，并优先采用项目自身的设置。这与用 `--config` 组合多个配置文件、或把配置拆分到配置目录不同：后两者总是覆盖同名键。给定下面这个包含两个主题的简化项目结构：

```tree
project/
├── themes/
│   ├── theme-a/
│   │   └── hugo.toml
│   └── theme-b/
│       └── hugo.toml
└── hugo.toml
```

以及这样的项目级配置：

```toml
baseURL = 'https://example.org/'
locale = 'en-us'
title = 'My New Hugo Site'
theme = ['theme-a','theme-b']
```

Hugo 按以下顺序合并设置：

1. 项目配置（项目根目录下的 `hugo.toml`）
2. `theme-a` 的配置
3. `theme-b` 的配置

### 合并策略

每个配置分区内的 `_merge` 设置决定**合并哪些**设置以及**如何合并**。

`_merge` 可以写在分区内的任意嵌套层级，而不只是顶层。合并嵌套表时，Hugo 优先使用该表自身设置的 `_merge` 值，否则从最近的祖先继承。例如，只修改某个 Goldmark 扩展的合并策略，而不影响 `markup` 分区的其余部分：

```toml
[markup.goldmark.extensions.typographer]
_merge = 'deep'
```

`_merge` 的取值可以是：

`none`
: 不合并。

`shallow`
: 只为新键添加值。

`deep`
: 为新键添加值，并合并已存在键的值。

你不需要像下面的默认配置那样写得那么啰嗦：上层设置好的 `_merge` 会被下层继承。

```toml
_merge = 'deep'

[markup]
_merge = 'deep'

[security]
_merge = 'none'
```

### 根级合并策略

也可以在项目配置的根级、即任何配置分区之外设置 `_merge`，从而改变整个项目的合并行为：

```toml
_merge = 'none'
baseURL = 'https://example.org/'
locale = 'en-us'
title = 'My New Hugo Site'
theme = ['theme-a','theme-b']
```

根级 `_merge` 设为 `none` 会完全禁用主题与模块配置的合并，无论各个配置分区上设置了什么 `_merge` 值；根级 `_merge` 设为 `shallow` 或 `deep` 则会改变那些未自行指定 `_merge` 的配置分区的默认合并策略。

> Hugo 可以把模块和主题中的映射类型配置值合并进项目配置，但无法合并切片类型的值。这既包括 `menus` 这类切片类型的配置分区，也包括值本身是切片的映射键，例如 `outputs` 中按页面类型划分的格式列表。

### 安全影响

多数配置分区默认采用 `none` 合并策略，正是为了保护你的项目免受第三方主题和模块影响。

> 把 `_merge` 设为 `shallow` 或 `deep` 会消除这层保护，无论它是直接作用于 `markup`、`security` 这类安全敏感的键，还是写在配置根级以改变所有键的默认行为。只有在完全信任项目中所有主题和模块时，才为这些键使用宽松的 `_merge` 值。

## 环境变量

也可以用操作系统环境变量来配置：

```bash
export HUGO_BASEURL=https://example.org/
export HUGO_ENABLEGITINFO=true
hugo
```

上面的命令设置了 `baseURL` 与 `enableGitInfo`，然后构建站点。

> 环境变量的优先级高于配置文件中的值。也就是说，如果同一个配置值既通过环境变量设置、又写在配置文件里，Hugo 会采用环境变量的值。

环境变量让 CI/CD 平台的配置更简单：可以直接在平台自身的配置与工作流文件中设值。

> 环境变量名必须以 `HUGO_` 为前缀。
>
> 要设置自定义站点参数，请用 `HUGO_PARAMS_` 作为前缀。

对于 snake_case 形式的变量名，标准的 `HUGO_` 前缀并不适用。Hugo 会根据 `HUGO` 之后的第一个字符推断分隔符，因此也可以写成 `HUGOxPARAMSxAPI_KEY=abcdefgh`，其中 `x` 可以是任何允许的分隔符。

除了配置常规设置，环境变量还可以覆盖某些内部设置的默认值：

`DART_SASS_BINARY`
: （`string`）Dart Sass 可执行文件的绝对路径。默认情况下，Hugo 会在 `PATH` 环境变量中的各个路径里查找该可执行文件。

`HUGO_ENVIRONMENT`
: （`string`）构建环境。运行 `hugo build` 时默认为 `production`，运行 `hugo server` 时默认为 `development`。

`HUGO_FILE_LOG_FORMAT`
: （`string`）报错时、或从短代码与 Markdown 渲染钩子调用 `Position` 方法时，显示文件路径、行号与列号的格式字符串。可用标记为 `:file`、`:line` 和 `:col`，默认为 `:file::line::col`。

`HUGO_MEMORYLIMIT`
: （`int`）Hugo 渲染站点时最多可使用的系统内存，单位为 GB。默认是系统总内存的 25%。注意 `HUGO_MEMORYLIMIT` 只是「尽力而为」的设置，不要指望仅用 1 GB 内存就能构建上百万个页面。想了解构建过程中的实际表现，可以运行 `hugo build --logLevel info`，并查看 `dynacache` 标签。

`HUGO_NUMWORKERMULTIPLIER`
: （`int`）并行处理时使用的工作进程数乘数。默认是逻辑 CPU 的数量。

## 查看当前配置

查看完整的项目配置：

```bash
hugo config
```

查看某一项配置：

```bash
hugo config | grep [key]
```

查看已配置文件挂载（mounts）：

```bash
hugo config mounts
```
