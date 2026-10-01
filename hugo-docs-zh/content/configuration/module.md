+++
title = "模块配置"
linkTitle = "模块配置"
description = "配置 Hugo 模块的导入、挂载与版本要求。"
date = 2026-10-01
weight = 160
source = "https://gohugo.io/configuration/module/"
+++

Hugo 模块是项目、主题与组件的组合单元，通过 `[module]` 配置。默认配置如下：

```toml
[module]
noProxy = 'none'
noVendor = ''
private = '*.*'
proxy = 'direct'
vendorClosest = false
workspace = 'off'
```

## 顶层设置

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `auth` | `string` | `''` | 自 v0.144.0 起可用。配置执行模块操作时 Go 命令的 `GOAUTH`，是以分号分隔的认证命令列表，用于 go-import 与 HTTPS 模块镜像交互，对私有仓库很有用。详见 `go help goauth`。 |
| `noProxy` | `string` | `'none'` | 以逗号分隔的 Glob 模式列表，匹配的路径不使用所配置的代理服务器。 |
| `noVendor` | `string` | `''` | 一个 Glob 模式，匹配在 vendor 时应当跳过的模块路径。 |
| `private` | `string` | `'*.*'` | 以逗号分隔的 Glob 模式列表，匹配应被视为私有的路径。 |
| `proxy` | `string` | `'direct'` | 下载远程模块所用的代理服务器。默认 `direct`，表示直接使用 `git clone` 之类的操作。 |
| `replacements` | `string` | — | 主要用于本地模块开发，是以逗号分隔的「模块路径 → 目录」映射。路径可以是绝对路径，也可以是相对于 `themesDir` 的路径。 |
| `vendorClosest` | `bool` | `false` | 是否选择离使用方最近的已 vendor 模块；默认行为是选择第一个。注意同一模块路径只能有一个依赖，一旦启用便无法重新定义。 |
| `workspace` | `string` | `'off'` | 要使用的 Go 工作区文件，可为绝对路径或相对于当前工作目录的路径。启用后进入 Go 工作区模式，需要 Go 1.18 或更高版本。 |

`replacements` 的写法：

```toml
[module]
replacements = 'github.com/bep/my-theme -> ../..,github.com/bep/shortcodes -> /some/path'
```

上述任何一项都可以改用环境变量设置：

```bash
export HUGO_MODULE_PROXY="https://proxy.example.org"
export HUGO_MODULE_REPLACEMENTS="github.com/bep/my-theme -> ../.."
export HUGO_MODULE_WORKSPACE="/my/hugo.work"
```

## Hugo 版本要求

可以在 `module` 段中声明模块所需的 Hugo 版本，用户的 Hugo 版本不兼容时会收到警告。默认配置为 `extended`、`max`、`min` 三者均为空值，全部可以省略：

```toml
[module]
[module.hugoVersion]
extended = false
max = ''
min = ''
```

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `extended` | `bool` | `false` | 自 v0.153.0 起弃用。是否要求 Hugo extended 版本，安装 extended 或 extended/deploy 版本均可满足。扩展版本检查在 v0.153.2 及之后的版本中已禁用。 |
| `max` | `string` | `''` | 支持的最高 Hugo 版本，例如 `0.153.0`。 |
| `min` | `string` | `''` | 支持的最低 Hugo 版本，例如 `0.102.0`。 |

历史上 WebP 编码与 LibSass 确实需要 extended 二进制。自 v0.153.0 起，WebP 编码在所有版本中都受支持，LibSass 也已弃用并推荐改用 Dart Sass，因此内部对扩展版本的强制检查已移除。

## 导入

```toml
[[module.imports]]
disable = false
ignoreConfig = false
ignoreImports = false
path = 'github.com/gohugoio/hugoTestModules1_linux/modh1_2_1v'
[[module.imports]]
path = 'my-shortcodes'
```

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `path` | `string` | — | 模块路径：合法的 Go 模块路径（如 `github.com/gohugoio/myShortcodes`），或存放在 `themesDir` 中的目录名。 |
| `disable` | `bool` | `false` | 是否禁用该模块，但在 `go.*` 文件中保留版本信息。 |
| `ignoreConfig` | `bool` | `false` | 是否忽略模块的配置文件（例如 `hugo.toml`）。这同时会阻止加载任何传递性模块依赖。 |
| `ignoreImports` | `bool` | `false` | 是否忽略该模块的导入。 |
| `noMounts` | `bool` | `false` | 是否禁用该导入的目录挂载。 |
| `noVendor` | `bool` | `false` | 是否禁用该导入的 vendoring。此设置仅限主项目使用。 |
| `usePackageJSON` | `string` | `auto` | 自 v0.159.0 起可用。是否在 `hugo mod npm pack` 中使用该导入的 npm 依赖，取值为 `auto`、`always` 或 `never`。设为 `auto` 时，只要模块根目录存在 Hugo 配置文件（如 `hugo.toml`）或 `package.hugo.json`，Hugo 就会启用它。 |
| `version` | `string` | — | 自 v0.150.0 起可用。若设为版本查询表达式，该导入将成为直接依赖，而非由 Go 模块管理的依赖。 |

## 挂载

挂载把文件系统的某个路径映射到 Hugo 统一文件系统中的组件路径。

> **重要提示**：如果你定义了把一个或多个文件系统路径映射到组件路径的挂载，就不要再使用这些旧式配置项：`archetypeDir`、`assetDir`、`contentDir`、`dataDir`、`i18nDir`、`layoutDir` 或 `staticDir`。

### 默认挂载

在项目配置中为某个组件定义挂载，会移除该组件的默认挂载；在模块配置中为某个组件定义挂载，则会移除该模块的全部默认挂载。如果仍需要默认挂载，必须显式地把它们与新挂载一起写出。

默认挂载的 `source` 与 `target` 依次为：`content`、`data`、`layouts`、`i18n`、`archetypes`、`assets`、`static`，即每个组件目录映射到同名组件路径。

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `source` | `string` | — | 挂载的源目录。对主项目可以是项目相对路径或绝对路径；对其他模块必须是项目相对路径。 |
| `target` | `string` | — | 挂载在 Hugo 统一文件系统中的位置，必须以组件目录开头：`archetypes`、`assets`、`content`、`data`、`i18n`、`layouts` 或 `static`，例如 `content/blog`。 |
| `disableWatch` | `bool` | `false` | 是否在监听模式下禁用对该挂载的监听。 |
| `files` | `[]string` | — | 自 v0.153.0 起可用。定义要包含或排除的文件的 Glob 切片。 |
| `excludeFiles` | — | — | 自 v0.153.0 起弃用，请改用 `files`。 |
| `includeFiles` | — | — | 自 v0.153.0 起弃用，请改用 `files`。 |
| `sites` | `map` | — | 自 v0.153.0 起可用。为挂载定义站点矩阵与站点补集。对 `content` 与 `layouts` 挂载以及多主机模式下的 `static` 挂载有意义；对 `static` 和 `layouts` 只支持 `matrix` 关键字。 |
| `lang` | — | — | 自 v0.153.0 起弃用，请改用 `sites`。 |

### 示例

把 Markdown 之外的静态资源挂载到 `assets`，并排除文档目录：

```toml
[module]
[[module.mounts]]
source = 'content'
target = 'content'
files = ['! docs/*']
[[module.mounts]]
source = 'node_modules'
target = 'assets'
[[module.mounts]]
source = 'assets'
target = 'assets'
```

注意第三段挂载：因为一旦为 `assets` 定义了挂载，默认挂载就会被移除，所以要显式地把项目自身的 `assets` 目录重新挂回去，否则项目里的资源将无法被处理。
