+++
title = "使用模块"
linkTitle = "使用模块"
description = "模块的前置条件、导入与覆盖顺序，以及更新、整理、缓存与本地开发。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/hugo-modules/use-modules/"
+++

> **注意**：要与模块打交道，必须安装 [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) 与 [Go](https://go.dev/doc/install) 1.18 或更高版本。

## 模块概览

模块（module）是 Hugo 的基本组织单位，使用时需要了解几条规则：

- 模块可以按任意组合与顺序导入。
- 模块导入是递归的：导入模块 A 可能连带触发对模块 B 的导入，依此类推。
- 模块可以提供配置文件与目录，但要遵守配置合并相关的约束。
- 外部目录——包括来自非 Hugo 项目的目录——可以挂载进来，从而形成统一的文件系统。

## 导入模块

要导入模块，先要把项目本身初始化为模块。例如：

```bash
hugo mod init github.com/user/project
```

这条命令会在项目根目录生成一个 `go.mod` 文件。

> **注意**：模块名只是一个唯一标识，并不是托管要求。写成 `github.com/user/project` 是常见惯例，但并不意味着你必须使用 Git 或把代码托管到 GitHub。如果你不打算让别人把你的项目当作模块导入，用什么名字都可以；例如初始化时可以简单地写成 `my-project`。

随后在项目配置中声明一个或多个导入。下面这个示例导入了三个模块，每个模块都提供了自定义短代码：

```toml
[module]
  [[module.imports]]
    path = 'shortcodes-a'
  [[module.imports]]
    path = 'shortcodes-b'
  [[module.imports]]
    path = 'github.com/user/shortcodes-c'
```

导入的优先级自上而下。例如 `shortcodes-a`、`shortcodes-b` 与 `shortcodes-c` 都定义了 `image` 短代码时，生效的是 `shortcodes-a` 中的那一个。

> **注意**：如果多个模块含有路径相同的数据文件或翻译表，数据会按自上而下的优先级深度合并。

构建项目时，Hugo 会依次完成三件事：

1. 下载模块。
2. 把它们缓存起来以备后用。
3. 在项目根目录生成 `go.sum` 文件。

## 更新与整理

导入模块后，Hugo 会在项目根目录留下 `go.mod` 与 `go.sum`，用来记录版本与校验和信息。清空模块缓存后重新构建，Hugo 会按 `go.mod` 中的记录重新下载原本导入的那个版本，从而保证构建一致；需要换版本时再显式更新。

把某个模块更新到最新版本：

```bash
hugo mod get -u github.com/user/shortcodes-c
```

更新到指定版本：

```bash
hugo mod get -u github.com/user/shortcodes-c@v0.42.0
```

把所有模块更新到最新版本，或递归更新全部模块：

```bash
hugo mod get -u
hugo mod get -u ./...
```

要从 `go.mod` 与 `go.sum` 中移除不再使用的条目：

```bash
hugo mod tidy
```

## 缓存与 vendor

Hugo 会缓存模块，避免每次构建都重复下载。默认情况下，这些文件存放在 `cacheDir` 下的 `modules` 目录中。清理当前项目的模块缓存，或清理所有项目的模块缓存：

```bash
hugo mod clean
hugo mod clean --all
```

`hugo mod vendor` 会把导入的模块复制到项目内的 `_vendor` 目录，供后续构建使用，同时也便于在本地查看模块的各个组件：

```bash
hugo mod vendor
```

使用该命令时需要注意：

- `hugo mod vendor` 可以在模块树的任意层级运行。
- `themes` 目录中的模块不会被 vendor。
- `--ignoreVendorPaths` 选项可以按 Glob 模式，把匹配的已 vendor 模块从特定命令中排除。

> **重要**：不要直接修改 `_vendor` 目录里的文件。正确的做法是在项目根目录下创建相对路径相同的对应文件来覆盖它们。要移除已 vendor 的模块，删除 `_vendor` 目录即可。

## 本地开发

做本地模块开发时，可以在 `go.mod` 里用 `replace` 指令指向本地目录：

```text
replace github.com/user/module => ../module
```

在 `hugo server` 运行期间做这样的改动，会触发配置重新加载，并把该本地目录加入监视列表。另一种做法是在项目配置中设置 `replacements` 参数来声明替换关系。

工作区（workspace）能进一步简化「站点 + 模块」的本地开发。创建一个 `.work` 文件来定义工作区，再通过配置项 `workspace` 或环境变量 `HUGO_MODULE_WORKSPACE` 启用它。`.work` 文件的例子：

```text
go 1.27

use .
use ../my-hugo-module
```

用 `use` 指令列出各个模块路径，其中也包括主项目（`.`）。启用工作区后启动服务器：

```bash
HUGO_MODULE_WORKSPACE=hugo.work hugo server --ignoreVendorPaths "**"
```

这里的 `--ignoreVendorPaths` 用于忽略已 vendor 的依赖（如果存在），这样才能让工作区内本地修改的热重载生效。

要在目标模块目录中生成依赖图，包括 vendor 情况、模块替换与已停用模块的信息，可以执行 `hugo mod graph`。例如：

```bash
hugo mod graph
```

输出会逐行列出模块之间的依赖关系，被停用的依赖会以 `DISABLED` 开头。

## 私有模块

如果模块位于私有仓库，需要让 Go 工具链知道哪些模块路径不该经过公共代理、也不该做校验和检查。这由 Go 自身的环境变量控制，其中 `GOPRIVATE` 是最常用的一个，可以按逗号分隔的模式列出私有路径：

```bash
export GOPRIVATE=github.com/your-org/*
```

除了 `GOPRIVATE`，还可以按需设置 `GONOPROXY`、`GONOSUMDB`、`GONOSUMCHECK` 等变量，或者直接设置 `GOFLAGS`、`GOPROXY` 来调整模块下载方式。这些变量属于 Go 模块工具链的配置，Hugo 只是复用同一套机制：只要 `go` 能取到该模块，`hugo mod get` 与模块下载就能正常工作。

## 模块挂载

导入的模块会自动把自己的组件目录挂载到 Hugo 的统一文件系统中。除此之外，你也可以手动把任意目录——同样包括来自非 Hugo 项目的目录——挂载到对应的组件目录上，配置方式见模块配置中的 `mounts` 参数。

## 其他模块配置

除了 `imports` 与 `mounts`，`[module]` 区段中还有一组与依赖获取相关的参数，可以在项目配置中按需设置：

- `hugoVersion`：声明项目要求的 Hugo 版本范围，供模块与项目之间核对。
- `proxy`：指定获取模块时使用的代理。
- `noVendor`：用于把某些模块路径排除在 vendor 之外。
- `replacements`：声明模块路径的替换关系，便于本地开发。
- `workspace`：指定要启用的工作区文件。

这些参数的具体取值与默认行为，以配置参考中模块部分的说明为准。本章只说明它们各自的用途，实际使用时请对照项目所安装的 Hugo 版本确认。

## 相关页面

- [简介](/hugo-modules/introduction/)：模块的基本概念。
- [主题组件](/hugo-modules/theme-components/)：多个主题组合时的优先级规则。
- [Node.js 依赖](/hugo-modules/nodejs-dependencies/)：模块中的前端依赖如何合并。
- [模块相关命令](/commands/)：`hugo mod` 及其各子命令。
- [配置 Hugo](/configuration/)：项目配置文件的位置与写法。
