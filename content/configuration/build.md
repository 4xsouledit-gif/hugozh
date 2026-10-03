+++
title = "构建配置"
linkTitle = "构建配置"
description = "配置构建统计、缓存失效与目标目录清理等全局构建选项。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/configuration/build/"
+++

## 这一页解决什么问题

`[build]` 分区管的是「构建过程本身」，而不是站点内容：缓存什么时候失效、`publishDir` 要不要清理、要不要产出 `hugo_stats.json` 给 CSS 摇树工具用。绝大多数站点不需要改这里；需要改的时候，**典型后果是构建变慢、产物缺文件，或者手工放进去的文件被误删**，所以每一项都先弄清楚它删什么、留什么。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `buildStats` | 用 Tailwind / PostCSS 做「未使用 CSS 清除」，需要一份产物里真实用到的 class / id / 标签清单 | 没开 → 摇树工具把手写类名当成未使用而删掉，页面样式大面积缺失；`disable*` 误设 → 统计项不全，同样误删样式 |
| `cacheBusters` | 改了 PostCSS / Tailwind 配置文件后，CSS 没有重新生成 | `source` 正则没匹配到你的配置文件名 → 改了配置文件、产出的 CSS 还是旧的，**构建不报错** |
| `cleanDestinationDir` | 经常删除或重命名内容，`public/` 里堆了访问不到的旧页面 | `enable = true` 但没配 `keepDirs` / `keepFiles` → `CNAME`、`_redirects` 等手工放进 `publishDir` 的文件被一起删除 |
| `noJSConfigInAssets` | 不想让 `js.Build` 在 `assets/` 下写 `jsconfig.json` | 开启后编辑器失去跳转与智能提示（站点功能正常，只是开发体验下降） |
| `useResourceCacheWhen` | Sass 转 CSS 的缓存行为不符合预期（例如改了被 `@import` 的文件却没重新编译） | 设为 `always` 而依赖来自网络 → 上游样式更新不会反映到产物里 |

## 默认配置

`[build]` 分区用于控制全局构建行为，默认配置如下：

```toml
[build]
noJSConfigInAssets = false
useResourceCacheWhen = 'fallback'

[build.buildStats]
enable = false
disableIDs = false
disableTags = false
disableClasses = false

[build.cleanDestinationDir]
enable = false
keepDirs = ['{**/,}.*']
keepFiles = ['{**/,}.{git,gitignore,gitattributes}']

[[build.cacheBusters]]
source = '(postcss|tailwind)\.config\.(js|mjs|cjs)'
target = '(css|styles|scss|sass)'
```

## 顶层设置

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `buildStats` | `map` | 见下文 | 构建统计，详见[构建统计](#构建统计)一节。 |
| `cacheBusters` | `[]map` | 见下文 | 缓存失效规则，详见[缓存失效](#缓存失效)一节。 |
| `cleanDestinationDir` | `map` | 见下文 | 目标目录清理，详见[清理目标目录](#清理目标目录)一节。 |
| `noJSConfigInAssets` | `bool` | `false` | 是否禁止在 `assets` 目录下写出记录 `js.Build` 导入映射的 `jsconfig.json`。该文件用于在 VS Code 等代码编辑器中提供智能提示与跳转；如果你没有使用 `js.Build`，则不会写出该文件。 |
| `useResourceCacheWhen` | `string` | `fallback` | 何时使用资源文件缓存，取值为 `never`、`fallback` 或 `always` 之一。适用于把 Sass 转译为 CSS 的场景。 |

## 构建统计

```toml
[build.buildStats]
enable = false
disableIDs = false
disableTags = false
disableClasses = false
```

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enable` | `bool` | `false` | 是否在项目根目录生成 `hugo_stats.json` 文件。该文件包含已发布站点中每个 HTML 元素的 `class` 属性、`id` 属性与标签名的数组，可作为数据源用于移除未使用的 CSS。这一过程也称为修剪、清除或摇树。 |
| `disableIDs` | `bool` | `false` | 是否排除 `id` 属性。 |
| `disableTags` | `bool` | `false` | 是否排除元素标签名。 |
| `disableClasses` | `bool` | `false` | 是否排除 `class` 属性。 |

> 由于 CSS 清除通常只在生产构建时进行，建议把 `buildStats` 对象放在 `config/production` 目录下。
>
> 出于性能考虑，解析已发布站点时可能出现「误报」，例如把并非 HTML 元素的片段识别为元素。这类误报很少，且影响不大。

受局部服务器增量构建机制影响，服务器运行期间新增的 HTML 实体会被记录，但旧值要等到你重启服务器或运行 `hugo build` 后才会被移除。

## 缓存失效

用 `build.cacheBusters` 可以在被监视的源文件发生变化时，让资源缓存中的特定键过期，从而触发 CSS 等依赖资源的重新构建。例如使用 `css.TailwindCSS` 函数时可以采用下面的配置：

```toml
[build]
  [build.buildStats]
    enable = true
  [[build.cacheBusters]]
    source = 'assets/notwatching/hugo_stats\.json'
    target = 'css'
  [[build.cacheBusters]]
    source = '(postcss|tailwind)\.config\.js'
    target = 'css'
[module]
  [[module.mounts]]
    source = 'assets'
    target = 'assets'
  [[module.mounts]]
    disableWatch = true
    source = 'hugo_stats.json'
    target = 'assets/notwatching/hugo_stats.json'
[security]
  [security.exec]
    allow = ['^(dart-)?sass$', '^go$', '^git$', '^node$', '^postcss$', '^tailwindcss$']
```

启用 `buildStats` 后，Hugo 每次构建都会写出 `hugo_stats.json`，其中包含渲染结果里用到的类、ID 与标签。该文件一旦变化就会触发 CSS 重新构建。

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `source` | `string` | `'(postcss\|tailwind)\.config\.(js\|mjs\|cjs)'` | 正则表达式，匹配相对于 Hugo 某个虚拟组件目录（通常是 `assets/...`）的文件。 |
| `target` | `string` | `'(css\|styles\|scss\|sass)'` | 正则表达式，匹配资源缓存中应在 `source` 变化时过期的键。可以在表达式中使用 `source` 的捕获组，例如 `$1`。 |

## 清理目标目录

Hugo 在构建项目之前不会清空 `publishDir`：已存在的文件会被覆盖，但不会被删除。这种行为是有意为之，可以避免误删你在构建后手动放入 `publishDir` 的文件。

但这也意味着 `publishDir` 会随着时间积累陈旧文件。例如删除或重命名某个内容文件后，对应的渲染页面仍会残留；草稿、已过期和未来时间的内容在不再符合发布条件后也可能残留。启用 `cleanDestinationDir` 后，Hugo 会在每次构建时自动删除这些陈旧文件。

```toml
[build.cleanDestinationDir]
enable = false
keepDirs = ['{**/,}.*']
keepFiles = ['{**/,}.{git,gitignore,gitattributes}']
```

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `enable` | `bool` | `false` | 是否在渲染站点前清理 `publishDir`。Hugo 会删除 `publishDir` 中所有没有对应静态文件的文件与目录，无论该静态文件来自 `staticDir`、模块挂载还是主题。这既会删除陈旧文件（如旧的渲染页面和已删除的静态资源），也会删除你自己放进 `publishDir` 的文件（如 `CNAME` 或 `_redirects`）。可以用 `keepDirs` 与 `keepFiles` 保留特定目录和文件。即使项目没有静态文件，该清理也会执行。可在单次构建时用 `--cleanDestinationDir` 命令行选项覆盖此设置。Hugo 0.167.0 及更高版本可用。 |
| `keepDirs` | `[]string` | `['{**/,}.*']` | glob 切片，匹配相对于 `publishDir` 的目录，清理目标目录时予以保留。在多语言多主机项目中，模式相对于 `publishDir` 下各语言的子目录。匹配到的目录连同其下所有内容（包括子目录及其内容）一并保留。默认值匹配名称以点开头的目录，无论它出现在目录树的哪一层。你设置的值会替换默认值而不是追加，因此若想继续保留这些目录，请把默认模式一并写入。Hugo 0.167.0 及更高版本可用。 |
| `keepFiles` | `[]string` | `['{**/,}.{git,gitignore,gitattributes}']` | glob 切片，匹配相对于 `publishDir` 的文件，清理目标目录时予以保留。在多语言多主机项目中，模式相对于 `publishDir` 下各语言的子目录。默认值匹配 `.git`、`.gitignore` 与 `.gitattributes` 文件，无论它出现在目录树的哪一层。你设置的值会替换默认值而不是追加，因此若想继续保留这些文件，请把默认模式一并写入。Hugo 0.167.0 及更高版本可用。 |

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 删掉的页面线上仍能访问 | Hugo 默认**不清空** `publishDir`：已存在的文件被覆盖，但不会删除 | 开启 `cleanDestinationDir`，同时用 `keepDirs` / `keepFiles` 保住需要保留的文件 |
| `CNAME` / `_redirects` 在构建后消失 | `cleanDestinationDir` 把它们视为「没有对应静态文件」而删除 | 写进 `keepFiles`；注意你设置的值会**替换**默认值，要连默认模式一起写 |
| 改了 Tailwind / PostCSS 配置，CSS 没更新 | 资源缓存未失效，`cacheBusters` 未覆盖该配置文件 | 检查 `source` 是否匹配到配置文件名，`target` 是否匹配到 `css` 等缓存键 |
| `hugo_stats.json` 的实体只增不减 | 开发服务器的增量构建会追加新实体，旧值要等重启或正式构建才清掉 | 重启 `hugo server`，或跑一次 `hugo build`；生产用量建议把 `buildStats` 放进 `config/production` |
| 构建报 `exec` 权限相关错误（Tailwind 场景） | 安全策略没放行需要调用的外部命令 | 参照本页 Tailwind 示例中的 `security.exec.allow`，详见[配置安全](/configuration/security/) |

更多排查入口见[故障排查](/troubleshooting/)。
