+++
title = "配置简介"
linkTitle = "配置简介"
description = "配置文件与配置目录怎么选、Hugo 按什么顺序读取与合并、环境变量怎么用；含验证方法与「改了没生效」的排查路径。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/configuration/introduction/"

[params.teach]
difficulty = "入门"
time = "15–20 分钟"
prereq = [
  "有一个能构建的站点（在站点根目录运行 `hugo`，退出码为 0）。",
  "会用文本编辑器打开 `hugo.toml`；不需要写模板。",
]
outcomes = [
  "说清「单个配置文件」与「`config/` 目录」两种组织方式分别适合什么场景；",
  "按环境拆分配置，并用 `hugo build --environment staging` 验证覆盖是否生效；",
  "用 `hugo config` 判断某个键最终取值，并识破「在错误目录里执行」的假象；",
  "说出 `_merge` 三个取值的效果，以及放宽合并的安全代价。",
]
next = ["/configuration/all/", "/configuration/markup/", "/troubleshooting/"]
+++

## 这一页解决什么问题

这一页回答四个具体问题：配置**写在哪**（单个文件还是 `config/` 目录）、Hugo **从哪读**、同名键**谁覆盖谁**、以及怎么**确认改对了**。它是整个配置章节的起点；某个具体键的含义，再去[所有设置](/configuration/all/)里查。

只想改一两个键？读完「合理的默认值」与「配置文件」两节就能动手。要按环境（本地 / 预发 / 生产）区分配置，再往下读「配置目录」；配置来自主题或模块、需要判断合并行为时，读「合并配置设置」。

> [!TIP]
> 配置改完只有两种结局：生效，或者**静默不生效**（不报错）。所以每改一处，都用本页末尾的 `hugo config` 对照一次，别攒到最后一起查。

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

### 什么时候需要多份配置文件

- **同一份配置按用途拆开、长期共存**（`params` 一份、菜单一份）→ 用下面的配置目录，不要用 `--config`。
- **某次构建要用另一套配置**（临时换 `baseURL`、只渲染一部分内容）→ 用 `hugo build --config other.toml`。
- **叠加覆盖**（公共一份 + 覆盖一份）→ 用逗号组合，记住**右侧赢**。

### 改错了会看到什么现象

| 现象 | 真因 | 怎么修 |
| --- | --- | --- |
| 站点标题、样式全部变回默认（像换了个站点） | `--config` 指向的文件名拼错了。**实测（Hugo 0.167）**：`hugo config --config nope.toml` 不报「找不到配置文件」，而是直接输出一份默认配置（`baseurl = 'https://example.org/'`、无主题）；随后构建才因为找不到主题提供的短代码而失败 | 核对文件名与相对路径；在站点根目录下执行，并用 `hugo config` 确认第一行 `baseurl` 是不是你的地址 |
| 覆盖没生效，页面用的还是公共值 | 逗号组合的顺序反了（把被覆盖的文件写在了后面） | 调整为「先公共、后覆盖」：`hugo build --config base.toml,override.toml` |
| 改了 `hugo.yaml` 却毫无变化 | 项目根同时存在 `hugo.toml`；取用时 `toml` 优先于 `yaml` | 每个项目只保留一份配置文件 |

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

### 什么时候需要拆到配置目录

- **同一个键在不同环境取值不同**（`baseURL`、统计代码 ID、`minify`）→ 拆目录，而不是构建前手改文件；
- **配置变长、多人协作** → 按分区拆成 `params.toml`、`menus.toml` 等，各自的改动互不冲突；
- **多语言站点** → 用 `menus.en.toml` / `menus.de.toml` 这类语言后缀。

**环境怎么选**：`hugo server` 默认 `development`，`hugo`（构建）默认 `production`，也可以用 `--environment` 或 `HUGO_ENVIRONMENT` 明确指定。当前处于哪个环境，`hugo config` 的输出里有 `environment` 这一行。

**改错了会看到什么现象**：把公共值写进 `config/production/`，本地 `hugo server` 就看不到它——因为 server 读的是 `development`，没有该目录时只用 `_default`；症状是「上线才对、本地一直不对」（或反过来）。**实测（Hugo 0.167）**：`hugo config --environment staging` 输出中的 `environment` 会变成 `staging`，这是判断环境有没有选对的最快方式。

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

### 改错了会看到什么现象

| 现象 | 真因 | 怎么修 |
| --- | --- | --- |
| 主题升级后，站点行为变了但自己的配置没动过 | 主题自带的配置被合并了进来（`_merge` 被放宽到 `shallow` 或 `deep`） | 用 `hugo config` 对照实际生效值，确认哪些键来自主题；不需要合并就把 `_merge` 收回 `none` |
| 换了主题，自己的 `params` 反而丢了 | 在配置根级写了 `_merge = 'none'`，这会禁用所有分区的合并 | 只在确实需要的分区上写 `_merge`，不要写在根级 |
| 合并「看起来生效了」，但列表项被整段替换 | 合并只对**映射（map）**类型有效；切片（slice）类型无法合并，例如 `menus`、`outputs` 中按页面种类划分的格式列表 | 把需要保留的条目在项目配置里写全，不要指望与主题合并 |

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

**你应当看到什么**：`hugo config` 输出的是一份**合并之后**的完整配置，键名全部小写（`baseurl`、`enablegitinfo`、`publishdir`）。判断某个设置有没有生效，看这里比看源文件可靠。

- 输出里搜不到你写的键 → 这个键没有生效：文件位置不对、被后面的来源覆盖、或者被某个 `[表头]` 吞掉了。
- 输出的 `baseurl` 是 `https://example.org/`、且没有 `theme` → **实测（Hugo 0.167）**：你很可能不在站点根目录，或 `--config` 指向了不存在的文件。这两种情况下 Hugo **不报错**，只是默默地用全套默认值。
- 想查某个键却总是搜不到：键名是小写的，大小写敏感的搜索（例如 `grep baseURL`）匹配不到任何内容；`hugo config | grep -i baseurl` 才可靠。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 配置改了，构建成功但毫无变化 | 改的文件不是实际读取的那份；或键被放进了某个 `[表头]` 之后 | 用 `hugo config` 确认生效值；把所有裸键移到第一个表头之前 |
| 本地预览正常，生产构建不同 | 值写在 `config/development/` 而不是 `config/_default/` | 公共值放 `_default`，环境目录只留差异 |
| `hugo config` 的输出像一份陌生站点的配置 | 当前目录不是站点根目录，或 `--config` 文件名写错；**Hugo 不会为此报错** | 先 `cd` 到含 `hugo.toml` 的目录；核对 `--config` 的路径 |
| 搜索配置键总是搜不到 | `hugo config` 输出的键名是小写的 | 用小写搜索，或忽略大小写 |
| 构建报 TOML/YAML 语法错误 | 配置文件格式写坏（缺引号、缩进不一致、多余逗号） | 按报错给出的文件与行号修；对照本页的最小示例 |
| 报错看不懂、且指向主题或模块 | 报错来自合并后的配置，不是你的文件 | 用 `hugo config` 定位该键来自哪一层 |

更多排查入口见[故障排查](/troubleshooting/)。
