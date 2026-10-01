+++
title = "全部设置"
linkTitle = "全部设置"
description = "按键名索引 Hugo 全部顶层配置项，含类型、默认值与分区说明。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/configuration/all/"
+++

本页是 Hugo 顶层配置键的索引，不是教程：它把项目配置中的每一个顶层键按名称字母序列出，并标注类型、默认值与一句话说明。请注意，这里的默认值只是上游文档在当前版本下的标注，**精确默认值会随 Hugo 版本变化**，请用 [`hugo config`](/commands/hugo-config/) 或 [`hugo config mounts`](/commands/hugo-config-mounts/) 核对你自己项目中实际生效的值。

每个顶层键要么是**通用设置**，即单个值，例如 `baseURL` 或 `title`；要么是**配置分类**，即把相关嵌套设置归为一组，例如 `markup`、`menus` 或 `params`。分类键的详情请见本站 `configuration` 章节下的对应页面（`/configuration/…`），没有单独页面的分类也在下表说明其用途。配置文件的基本写法与合并策略见[配置 Hugo](/configuration/)。

```toml
baseURL = 'https://example.org/'
title = '我的站点'

[params]
  subtitle = '示例站点'
```

## 设置

### 通用设置

下表按上游顺序（字母序）列出全部通用设置。目录类键都会受[模块挂载](/configuration/module/)影响。

| 键 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `_merge` | `string` | `none` | 主题与模块配置的合并策略：none、shallow、deep。 |
| `archetypeDir` | `string` | `archetypes` | 原型文件目录。 |
| `assetDir` | `string` | `assets` | 全局资源目录，供资源管道读取。 |
| `baseURL` | `string` | `https://example.org/` | 站点发布后的绝对 URL，需带结尾斜杠。 |
| `buildDrafts` | `bool` | `false` | 构建时是否包含草稿内容。 |
| `buildExpired` | `bool` | `false` | 构建时是否包含已过期内容。 |
| `buildFuture` | `bool` | `false` | 构建时是否包含未来日期的内容。 |
| `cacheDir` | `string` | `—` | 缓存目录，取值规则见下文「缓存目录」。 |
| `canonifyURLs` | `bool` | `false` | 是否把相对 URL 规范化为绝对 URL。 |
| `capitalizeListTitles` | `bool` | `true` | 是否自动大写分区、分类与术语列表标题。 |
| `cleanDestinationDir` | `—` | `—` | 已于 0.167.0 弃用，改由 build 分区控制。 |
| `contentDir` | `string` | `content` | 内容文件目录。 |
| `copyright` | `string` | `—` | 站点版权声明，通常显示在页脚。 |
| `dataDir` | `string` | `data` | 数据文件目录。 |
| `defaultContentLanguage` | `string` | `—` | 默认语言，须与已定义的语言键匹配。 |
| `defaultContentLanguageInSubdir` | `bool` | `false` | 是否把默认语言发布到同名子目录。 |
| `defaultContentRole` | `string` | `—` | 默认内容角色（0.153.0 新增）。 |
| `defaultContentRoleInSubdir` | `bool` | `false` | 是否把默认角色发布到同名子目录。 |
| `defaultContentVersion` | `string` | `—` | 默认内容版本（0.153.0 新增）。 |
| `defaultContentVersionInSubdir` | `bool` | `false` | 是否把默认版本发布到同名子目录。 |
| `defaultOutputFormat` | `string` | `—` | 默认输出格式，未设置时取首个可用格式。 |
| `disableAliases` | `bool` | `false` | 是否禁止为别名生成跳转文件。 |
| `disableDefaultLanguageRedirect` | `bool` | `false` | 是否禁止默认语言的重定向别名。 |
| `disableDefaultSiteRedirect` | `bool` | `false` | 是否禁止指向默认站点的重定向别名。 |
| `disableHugoGeneratorInject` | `bool` | `false` | 是否禁止向首页注入 generator 元标签。 |
| `disableKinds` | `[]string` | `—` | 构建时禁用的页面类型列表。 |
| `disableLanguages` | `[]string` | `—` | 构建时禁用的语言键列表。 |
| `disableLiveReload` | `bool` | `false` | 是否禁用浏览器自动实时重载。 |
| `disablePathToLower` | `bool` | `false` | 是否禁止把页面 URL 转为小写。 |
| `enableEmoji` | `bool` | `false` | 是否允许在 Markdown 中使用表情符号。 |
| `enableGitInfo` | `bool` | `false` | 是否读取 Git 提交信息供模板使用。 |
| `enableMissingTranslationPlaceholders` | `bool` | `false` | 缺少译文时是否显示占位符。 |
| `enableRobotsTXT` | `bool` | `false` | 是否生成 robots.txt 文件。 |
| `hasCJKLanguage` | `bool` | `false` | 是否自动识别中日韩语言以统计字数。 |
| `i18nDir` | `string` | `i18n` | 翻译表文件目录。 |
| `ignoreCache` | `bool` | `false` | 是否忽略已配置的文件缓存。 |
| `ignoreFiles` | `[]string` | `—` | 用于排除文件的正则表达式列表。 |
| `ignoreLogs` | `[]string` | `—` | 需要屏蔽的警告与错误消息标识列表。 |
| `ignoreVendorPaths` | `string` | `—` | 排除出 `_vendor` 目录的模块路径通配符。 |
| `languageCode` | `—` | `—` | 已于 0.158.0 弃用，请改用 `locale`。 |
| `layoutDir` | `string` | `layouts` | 模板文件目录。 |
| `locale` | `string` | `—` | RFC 5646 语言标签，用于翻译与本地化格式。 |
| `mainSections` | `string` 或 `[]string` | `—` | 站点主要分区，供 `MainSections` 使用。 |
| `newContentEditor` | `string` | `—` | 新建内容时调用的编辑器。 |
| `noBuildLock` | `bool` | `false` | 是否禁止创建 `.hugo_build.lock` 文件。 |
| `noChmod` | `bool` | `false` | 是否禁止同步文件权限模式。 |
| `noTimes` | `bool` | `false` | 是否禁止同步文件修改时间。 |
| `panicOnWarning` | `bool` | `false` | 是否在出现首个警告时中断构建。 |
| `pluralizeListTitles` | `bool` | `true` | 是否自动把分区列表标题变为复数。 |
| `printI18nWarnings` | `bool` | `false` | 是否逐条记录缺失翻译的警告。 |
| `printPathWarnings` | `bool` | `false` | 多个文件写入同一路径时是否告警。 |
| `printUnusedTemplates` | `bool` | `false` | 是否为未使用的模板输出警告。 |
| `publishDir` | `string` | `public` | 站点发布目录。 |
| `refLinksErrorLevel` | `string` | `ERROR` | `ref`、`relref` 无法解析时的日志级别。 |
| `refLinksNotFoundURL` | `string` | `—` | `ref`、`relref` 无法解析时返回的 URL。 |
| `relativeURLs` | `bool` | `false` | 是否把站点 URL 转为相对路径。 |
| `removePathAccents` | `bool` | `false` | 是否移除内容路径中的组合字符重音。 |
| `renderSegments` | `[]string` | `—` | 需要渲染的片段，省略则全部渲染。 |
| `resourceDir` | `string` | `resources` | 资源管道输出缓存目录。 |
| `sectionPagesMenu` | `string` | `—` | 指定菜单名，自动加入全部顶层分区。 |
| `staticDir` | `string` | `static` | 静态文件目录。 |
| `summaryLength` | `int` | `70` | 自动摘要的最小词数。 |
| `templateMetrics` | `bool` | `false` | 是否在控制台输出模板执行指标。 |
| `templateMetricsHints` | `bool` | `false` | 是否输出模板执行优化提示。 |
| `theme` | `string` 或 `[]string` | `—` | 所用主题，多个主题按从左到右优先。 |
| `themesDir` | `string` | `themes` | 主题目录。 |
| `timeout` | `string` | `60s` | 生成页面内容的超时时间。 |
| `timeZone` | `string` | `—` | 解析无时区日期时使用的时区。 |
| `title` | `string` | `—` | 站点标题。 |
| `titleCaseStyle` | `string` | `ap` | 自动标题的大小写规则，见下文。 |

### 配置分类

下表列出全部分类键。它们本身没有类型与默认值，其下的嵌套键请见对应的独立页面。

| 键 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `build` | `—` | `—` | 构建与发布相关设置。 |
| `caches` | `—` | `—` | 各类文件缓存的配置。 |
| `cascade` | `—` | `—` | 级联前置元数据的配置。 |
| `deployment` | `—` | `—` | 部署目标与部署命令的配置。 |
| `frontmatter` | `—` | `—` | 前置元数据格式，见[前置元数据配置](/configuration/front-matter/)。 |
| `HTTPCache` | `—` | `—` | HTTP 缓存策略，见 [HTTP 缓存配置](/configuration/http-cache/)。 |
| `imaging` | `—` | `—` | 图像处理选项，见[图像处理配置](/configuration/imaging/)。 |
| `languages` | `—` | `—` | 多语言与本地化，见[语言配置](/configuration/languages/)。 |
| `markup` | `—` | `—` | Markdown 与语法高亮，见[标记配置](/configuration/markup/)。 |
| `mediaTypes` | `—` | `—` | 媒体类型定义。 |
| `menus` | `—` | `—` | 菜单定义，见[菜单配置](/configuration/menus/)。 |
| `minify` | `—` | `—` | 输出压缩，见[压缩配置](/configuration/minify/)。 |
| `module` | `—` | `—` | 模块与挂载，见[模块配置](/configuration/module/)。 |
| `outputFormats` | `—` | `—` | 输出格式定义，见[输出格式配置](/configuration/output-formats/)。 |
| `outputs` | `—` | `—` | 各类页面可用的输出格式映射。 |
| `page` | `—` | `—` | 页面级默认设置。 |
| `pagination` | `—` | `—` | 分页行为，见[分页配置](/configuration/pagination/)。 |
| `params` | `—` | `—` | 自定义站点参数，见[参数配置](/configuration/params/)。 |
| `permalinks` | `—` | `—` | URL 结构，见[永久链接配置](/configuration/permalinks/)。 |
| `privacy` | `—` | `—` | 第三方服务的隐私策略。 |
| `related` | `—` | `—` | 相关内容推荐规则。 |
| `roles` | `—` | `—` | 内容角色定义。 |
| `security` | `—` | `—` | 构建安全策略。 |
| `segments` | `—` | `—` | 构建片段，见[片段配置](/configuration/segments/)。 |
| `server` | `—` | `—` | 开发服务器，见[服务器配置](/configuration/server/)。 |
| `services` | `—` | `—` | 第三方服务，见[服务配置](/configuration/services/)。 |
| `sitemap` | `—` | `—` | 站点地图，见[站点地图配置](/configuration/sitemap/)。 |
| `taxonomies` | `—` | `—` | 分类法定义，见[分类法](/content-management/taxonomies/)。 |
| `uglyurls` | `—` | `—` | 是否使用不带目录的「丑陋」URL。 |
| `versions` | `—` | `—` | 内容版本定义。 |

## 缓存目录

缓存目录由 `cacheDir` 设置或环境变量 `HUGO_CACHEDIR` 决定。两者都未设置时，Hugo 按以下顺序择一使用：在 Netlify 上运行时用 `/opt/build/cache/hugo_cache/`，这样配置为 `:cacheDir` 的缓存能在下次构建时恢复；否则用操作系统用户缓存目录下的 `hugo_cache` 目录（Unix 为 `$XDG_CACHE_HOME` 或 `$HOME/.cache`，macOS 为 `$HOME/Library/Caches`，Windows 为 `%LocalAppData%`）；再否则用系统临时目录下的 `hugo_cache_$USER` 目录。查看当前生效的 `cacheDir`：

```bash
hugo config | grep cachedir
```

## 标题大小写风格

`titleCaseStyle` 控制自动生成的列表标题以及 `strings.Title` 函数的大小写规则，默认采用美联社写作风格手册的规则。

| 取值 | 说明 |
| --- | --- |
| `ap` | 默认值，遵循美联社写作风格手册。 |
| `chicago` | 遵循芝加哥格式手册。 |
| `go` | 每个单词的首字母都大写。 |
| `firstupper` | 仅首个单词的首字母大写。 |
| `none` | 不做任何转换，便于手动控制标题大小写。 |

## 本地化设置

`menus`、`params` 等设置可以针对每种语言分别定义，见[语言配置](/configuration/languages/)。

## 相关页面

- [配置 Hugo](/configuration/)
- [`hugo config`](/commands/hugo-config/) 与 [`hugo config mounts`](/commands/hugo-config-mounts/)
- [标记配置](/configuration/markup/)、[图像处理配置](/configuration/imaging/)、[语言配置](/configuration/languages/)
- [菜单配置](/configuration/menus/)、[分页配置](/configuration/pagination/)、[参数配置](/configuration/params/)
- [永久链接配置](/configuration/permalinks/)、[输出格式配置](/configuration/output-formats/)
- [片段配置](/configuration/segments/)、[服务器配置](/configuration/server/)、[服务配置](/configuration/services/)
- [站点地图配置](/configuration/sitemap/)、[压缩配置](/configuration/minify/)、[模块配置](/configuration/module/)
- [前置元数据配置](/configuration/front-matter/)、[HTTP 缓存配置](/configuration/http-cache/)
- [分类法](/content-management/taxonomies/)、[URL 管理](/content-management/urls/)、[性能调优](/troubleshooting/performance/)
