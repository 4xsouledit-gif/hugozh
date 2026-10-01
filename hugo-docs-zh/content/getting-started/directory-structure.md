+++
title = "目录结构"
linkTitle = "目录结构"
description = "Hugo 项目根目录中各目录的用途，以及内容与页面的组织方式。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/getting-started/directory-structure/"
+++

每个 Hugo 项目都是一个目录，其中的子目录分别参与内容、结构、行为与呈现。

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

> 为某个组件（component）定义自定义挂载，会替换该组件的默认挂载。要把外部目录叠加在项目默认目录之上，必须把两者都显式挂载。
>
> Hugo 不跟随符号链接（symbolic link）。如果你需要符号链接提供的功能，请改用 Hugo 的统一文件系统。

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

可以挂载的目录包括 `archetypes`、`assets`、`content`、`data`、`i18n`、`layouts` 与 `static`。此外，还可以通过模块（module）挂载 Git 仓库中的目录。

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

借助上面介绍的统一文件系统，Hugo 会把这些目录挂载到项目中对应的位置。两个文件路径相同时，项目目录中的文件优先；因此你可以把同名模板放进项目目录的相同位置，覆盖主题中的模板。

如果同时使用两个或多个主题或模块中的组件，并且出现路径冲突，则第一个挂载优先。
