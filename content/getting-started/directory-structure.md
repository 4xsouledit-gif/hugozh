+++
title = "目录结构"
linkTitle = "目录结构"
description = "Hugo 项目根目录中各目录的用途、一份文件该放哪里，以及统一文件系统（挂载）的工作方式。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/getting-started/directory-structure/"

[params.teach]
difficulty = "入门"
time = "15–20 分钟"
prereq = [
  "已经跑通过一次构建：读过[快速开始](/getting-started/quick-start/)或[基本用法](/getting-started/basic-usage/)",
  "手边有一个自己创建的项目目录，方便边读边对照",
]
outcomes = [
  "说出 `archetypes`、`assets`、`config`、`content`、`data`、`i18n`、`layouts`、`static`、`themes` 各自负责什么",
  "拿到一份文件（图片、CSS、模板、Markdown、验证文件）时，判断它该放进哪个目录",
  "认出 `public/` 与 `resources/` 是构建产物而非源码，知道为什么要把它们排除在 Git 之外",
  "用 `module.mounts` 把项目外的目录挂进站点，并知道自定义挂载会替换该组件的默认挂载",
]
next = ["/content-management/organization/", "/configuration/", "/templates/", "/troubleshooting/"]

+++

每个 Hugo 项目都是一个目录，其中的子目录分别参与内容、结构、行为与呈现。

**为什么值得先把这张地图记住**：Hugo 靠**文件所在的目录**判断「这是什么」。把该放 `assets/` 的 CSS 放进 `static/`、把模板放进 `content/`，通常**不会报错**——只是它不生效，或者被原样复制到 `public/` 里。新手说「我明明写了，站点里却没有」时，十有八九是位置放错了。

## 项目骨架（project skeleton）

创建新项目时，Hugo 会生成一份项目骨架。例如：

```bash
hugo new project my-project
```

会生成这样的目录结构：

```text
my-project/
├── archetypes/
│   └── default.md
├── assets/
├── content/
├── data/
├── i18n/
├── layouts/
├── static/
├── themes/
└── hugo.toml         <-- 项目配置文件
```

**验证标准**：命令结束后，`my-project/` 下应当同时有 `hugo.toml` 和上面列出的那些目录。接着进入目录构建一次：

```bash
cd my-project
hugo build
```

统计表里的 `Pages` 应当大于 0（骨架自带示例内容）。如果 `Pages` 接近 0，用 `hugo list all` 看内容清单——只打印一行表头，就说明当前目录下没有 `content/`，多半是 `cd` 没生效或路径不对。

两个实测细节：

- `hugo new project my-project` 的别名是 `hugo new site my-project`，两种写法效果相同（见本机 `hugo new project --help` 的 `Aliases` 一行）。旧教程里的 `hugo new site` 不算过时写法。完整参数见 [hugo new project](/commands/hugo-new-project/)。
- 目标目录非空时，该命令会拒绝在里面初始化，需要加 `-f`（`--force`）。把项目建在一个空目录里最省事。

如有需要，也可以把项目配置拆分到子目录中：

```text
my-project/
├── archetypes/
│   └── default.md
├── assets/
├── config/           <-- 项目配置
│   └── _default/
│       └── hugo.toml
├── content/
├── data/
├── i18n/
├── layouts/
├── static/
└── themes/
```

构建项目时，Hugo 会创建 `public` 目录，通常还会创建 `resources` 目录：

```text
my-project/
├── archetypes/
│   └── default.md
├── assets/
├── config/
│   └── _default/
│       └── hugo.toml
├── content/
├── data/
├── i18n/
├── layouts/
├── public/       <-- 构建项目时创建
├── resources/    <-- 构建项目时创建
├── static/
└── themes/
```

**这两个目录是产物，不是源码**：`public/` 是发布结果，`resources/` 是资源管道的缓存。两者都可以随时删除、由下一次构建重建，也应该写进 `.gitignore`，而不是提交进 Git。

## 目录说明

每个子目录都参与内容、结构、行为或呈现中的某一环。

| 目录 | 用途 |
| --- | --- |
| `archetypes/` | 新内容的模板，即原型（archetype），见[原型](/content-management/archetypes/) |
| `assets/` | 通常经过资源管道（asset pipeline）处理的全局资源，例如图片、CSS、Sass、JavaScript、TypeScript |
| `config/` | 项目配置，可以拆分成多个子目录与文件；配置很少、或者不需要区分环境的项目，在根目录放一个 `hugo.toml` 就够了，详见[配置 Hugo](/configuration/) |
| `content/` | 构成项目内容的标记文件（通常是 Markdown）与页面资源 |
| `data/` | 补充内容、配置、本地化与导航的数据文件，支持 JSON、TOML、YAML 或 XML |
| `i18n/` | 多语言项目的翻译表，见[多语言](/content-management/multilingual/) |
| `layouts/` | 把内容、数据与资源转换为完整网站的模板 |
| `public/` | 发布后的网站，由 `hugo build` 或 `hugo server` 命令生成，Hugo 会按需重建，见[构建站点](/getting-started/basic-usage/) |
| `resources/` | Hugo 资源管道的缓存输出，由 `hugo build` 或 `hugo server` 命令生成，默认缓存 CSS 与图片，Hugo 会按需重建 |
| `static/` | 构建时原样复制到 `public` 目录的文件，例如 `favicon.ico`、`robots.txt` 与站点所有权验证文件；在[页面包](/content-management/page-bundles/)与资源管道出现之前，图片、CSS 与 JavaScript 也放在这里 |
| `themes/` | 一个或多个主题（theme），每个主题独占一个子目录 |

上表是「目录 → 用途」。实际排查时更常反过来问——**我手里这份文件该放哪儿**：

| 你手里的文件 | 放这里 | 为什么 |
| --- | --- | --- |
| 一篇 Markdown 文章 | `content/` | 只有 `content/` 下的文件才会成为页面 |
| 文章配图，且要跟文章一起移动 | 与文章同目录（[页面包](/content-management/page-bundles/)） | 相对路径引用最省事，资源随文章走 |
| 全站共用的 Logo、配图 | `assets/` | 走资源管道，可做缩放、格式转换、指纹化 |
| CSS / Sass / JavaScript / TypeScript | `assets/` | 需要管道处理（打包、压缩、指纹）；放 `static/` 会失去这些能力 |
| 不需要处理、原样送出的文件：`favicon.ico`、`robots.txt`、站点验证文件 | `static/` | 构建时被复制到 `public/` 根下 |
| 模板、局部模板、短代码模板 | `layouts/` | 只有模板会被执行 |
| 新文章的前置元数据模板 | `archetypes/` | `hugo new content` 时套用 |
| 站点配置 | 根目录 `hugo.toml`，或 `config/` 目录 | Hugo 启动时按固定顺序查找 |
| 结构化数据（作者、菜单来源等） | `data/` | 模板里用 `site.Data` 读取 |
| 界面文案的翻译表 | `i18n/` | 多语言站点用 |

> [!WARNING]
> 最容易踩的一条是**把内容文件放进 `static/`**。`static/` 里的文件会被原样复制到 `public/`，不经过 Markdown 渲染，也不进入页面列表——你在浏览器里只能下载到一个 `.md` 文件。判断口诀：**需要 Hugo 处理的放 `assets/`，要原样送出的放 `static/`**。

## 统一文件系统（unified file system）

Hugo 提供了统一文件系统，可以把两个或多个目录挂载（mount）到同一个位置。例如，主目录下有一个 Hugo 项目，另一个目录存放共享内容：

```text
home/
└── user/
    ├── my-project/
    │   ├── content/
    │   │   ├── books/
    │   │   │   ├── _index.md
    │   │   │   ├── book-1.md
    │   │   │   └── book-2.md
    │   │   └── _index.md
    │   ├── themes/
    │   │   └── my-theme/
    │   └── hugo.toml
    └── shared-content/
        └── films/
            ├── _index.md
            ├── film-1.md
            └── film-2.md
```

可以用挂载把共享内容包含进来，在项目配置中写入：

```toml
[[module.mounts]]
source = 'content'
target = 'content'

[[module.mounts]]
source = '/home/user/shared-content'
target = 'content'
```

**为什么要分成两条**：挂载解决的是「内容不在项目目录里，又不想复制一份」的问题——比如共用一份资料库，或者内容放在另一个 Git 仓库。注意第一条 `source = 'content'` 挂的是**项目自己的** `content` 目录，它不是多余的，原因见下面的警告。

> [!NOTE]
> 为某个组件（component）定义自定义挂载，会替换该组件的默认挂载。要把外部目录叠加在项目默认目录之上，必须把两者都显式挂载。
>
> Hugo 不跟随符号链接（symbolic link）。如果你需要符号链接提供的功能，请改用 Hugo 的统一文件系统。

**这条规则的实际后果**：只写第二条（外部目录）、漏掉第一条，项目 `content/` 里的页面就会从站点里**整体消失**，而且不会报错——因为「自定义挂载替换默认挂载」意味着 Hugo 不再自动使用项目自身的 `content`。反过来，如果你用符号链接（例如 `ln -s`）把外部目录接进 `content/`，Hugo 不会读取它，那些页面同样不会出现。

挂载之后，统一文件系统的结构如下：

```text
home/
└── user/
    └── my-project/
        ├── content/
        │   ├── books/
        │   │   ├── _index.md
        │   │   ├── book-1.md
        │   │   └── book-2.md
        │   ├── films/
        │   │   ├── _index.md
        │   │   ├── film-1.md
        │   │   └── film-2.md
        │   └── _index.md
        ├── themes/
        │   └── my-theme/
        └── hugo.toml
```

当两个或多个文件的路径相同时，层级最高的版本优先。上例中，如果 `shared-content` 目录里也有 `books/book-1.md`，它会被忽略，因为项目的 `content` 目录是第一层（最高层）挂载。

**验证标准**：配置完成后执行 `hugo list all`，列表里应当**同时**出现 `books/` 与 `films/` 两组页面。只出现其中一组，就是漏挂了对应的目录。也可以换成 `hugo server`，在浏览器里分别访问两个 section。

可以挂载的目录包括 `archetypes`、`assets`、`content`、`data`、`i18n`、`layouts` 与 `static`。此外，还可以通过模块（module）挂载 Git 仓库中的目录。挂载的完整配置项见[模块配置](/configuration/module/)，模块用法见 [Hugo 模块](/hugo-modules/)。

## 主题骨架（theme skeleton）

创建新主题时，Hugo 会生成一份可用的主题骨架。例如：

```bash
hugo new theme my-theme
```

会生成如下结构（未展开子目录）：

```text
my-theme/
├── archetypes/
├── assets/
├── content/
├── data/
├── i18n/
├── layouts/
├── static/
└── hugo.toml
```

**为什么用命令生成、而不是手敲目录**：`hugo new theme` 会连同默认模板与原型一起生成，手敲的空目录既不会报错也不会起作用，容易误判成「主题装好了」。

借助上面介绍的统一文件系统，Hugo 会把这些目录挂载到项目中对应的位置。两个文件路径相同时，项目目录中的文件优先；因此你可以把同名模板放进项目目录的相同位置，覆盖主题中的模板。

**覆盖模板的正确姿势**：不要在 `themes/my-theme/` 里直接改。把文件按**相同的相对路径**复制到项目的 `layouts/` 下（例如主题的 `layouts/_default/single.html` 对应项目的 `layouts/_default/single.html`），项目目录优先级更高。直接改主题目录的文件，在主题升级或重新拉取时会丢失，而且换主题后没人知道改过什么。

如果同时使用两个或多个主题或模块中的组件，并且出现路径冲突，则第一个挂载优先（即配置里写在最前面的那个）。

## 常见坑速查

| 现象 | 属于哪一类 | 先做什么 |
| --- | --- | --- |
| `hugo: command not found` / 不是内部或外部命令 | 命令找不到 | Hugo 没装好或没进 `PATH` → [安装 Hugo](/installation/) |
| `hugo new project` 提示目录非空、拒绝初始化 | 报错看不懂 | 目标目录里已有文件；换空目录，或加 `-f`（`--force`） |
| 命令退出码 0，但 `Pages` 数接近 0 | 没报错但结果不对 | 不在项目根目录，或 `content/` 里确实没有内容 → `hugo list all` 对账 |
| 内容文件能在浏览器里下载，但不是一个页面 | 没报错但结果不对 | 文件放进了 `static/`，应移到 `content/` |
| CSS / JS 改了没生效，或没经过打包压缩 | 没报错但结果不对 | 文件在 `static/`，应移到 `assets/` 并由模板引用 |
| 模板写好了却没被使用 | 没报错但结果不对 | 文件名或路径与[模板查找顺序](/templates/lookup-order/)不匹配；对照主题里的同名文件 |
| 挂载之后项目原有页面全部消失 | 没报错但结果不对 | 自定义挂载替换了默认挂载，补上 `source = 'content'` 那条 |
| 公共模板放对了，但主题内容没更新 | 没报错但结果不对 | 不要直接改 `themes/` 下的文件，改为在项目 `layouts/` 里覆盖 |

更多排查手段见[故障排查](/troubleshooting/)；内容该怎么组织（section、页面包、分类法）见[内容组织](/content-management/organization/)。

## 下一步

- 想搞清 `content/` 内部的页面组织方式 → [内容组织](/content-management/organization/) 与[页面包](/content-management/page-bundles/)；
- 想给 `static/` 之外的资源做压缩、转换 → [资源管道](/hugo-pipes/introduction/)；
- 想拆分配置、按环境覆盖 → [配置 Hugo](/configuration/)；
- 想接手一个主题、或自己写模板 → [模板](/templates/)。
