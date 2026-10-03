+++
title = "片段配置"
linkTitle = "片段配置"
description = "通过 segments 配置按片段渲染站点，加快构建速度。"
date = 2026-10-01
weight = 270
source = "https://gohugo.io/configuration/segments/"
+++

## 这一页解决什么问题

`[segments]` 用于**分段渲染**：把站点切成若干片段，每次只渲染其中一部分。大型站点可以借此把「每小时重建首页与新闻」和「每周重建整站」拆开，也可以只产出某个输出格式（例如给搜索索引用 JSON）。

**注意范围**：上游明确它只控制「内容何时被渲染」，**不会**限制模板中对象图的可用性——模板里依然能访问全部站点与页面。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `segments.<名>.includes` | 指定某片段渲染哪些页面或格式 | 过滤器不匹配任何页面 → 该片段渲染出空站点，**不报错** |
| `segments.<名>.excludes` | 排除某些页面或格式 | 上游明确 `excludes` 拥有绝对优先权：只要命中就排除，即使同时命中 `includes` |
| 条件字段 `path` / `kind` / `output` / `sites` | 精确定位片段范围 | 同一过滤器内的条件是 **AND**，多个过滤器之间是 **OR**；按「或」的预期写多个条件会得到空集合 |
| `renderSegments` / `--renderSegments` | 选择本次构建哪些片段 | 名称拼错 → 构建出的内容与预期不同；多个片段用逗号分隔 |
| 用 `excludes` 表达「除了这个格式」 | 性能：排除整组时 Hugo 可跳过成组页面求值 | 改用 `includes` 表达同一意图会逐页检查，大站点明显更慢（上游给出的正是这组对比） |

**什么时候别用**：站点规模不大时不必引入分段——它把「站点由哪几次构建组成」变成一份需要长期维护的约定，多一次构建就多一处可能不一致的地方。

`[segments]` 只作用于分段渲染。它控制内容何时被渲染，但并不会限制 Hugo 模板中完整的对象图（站点与页面）的可用性，模板里依然可以访问全部站点与页面。

分段渲染带来几点好处：

- 构建更快：更高效地处理大型站点。
- 开发更快：只渲染站点的一部分，缩短迭代时间。
- 定时重建：按不同频率重建指定分区，例如首页与新闻每小时重建、整站每周重建。
- 定向输出：只生成特定输出格式，例如用于搜索索引的 JSON。

## 片段定义

每个片段由 `includes` 与 `excludes` 两个键定义，二者都接受一个过滤器数组。

**过滤器**是一组或多组条件的集合，对应配置数组中的一项；**条件**则把页面的某个字段与 glob 模式做比较。

### 求值规则

求值逻辑遵循三条规则：

- 单个过滤器内的所有条件必须同时匹配，该过滤器才为真，即条件之间是 AND 关系。
- 如果 `includes` 或 `excludes` 数组包含多个过滤器，只要其中一个为真，整个数组即匹配，即过滤器之间是 OR 关系。
- `excludes` 数组拥有绝对优先权。只要页面匹配 `excludes` 中的任意过滤器，无论它是否匹配 `includes`，Hugo 都会把它排除在该片段之外。

### 性能优化

用 `excludes` 数组排除整个站点或输出格式，可以让 Hugo 在求值时跳过成组的页面，而不必逐页检查，这在大型项目中能显著提升性能。

例如，排除不需要的输出格式更快：

```toml
[segments]
  [segments.segment1]
    [[segments.segment1.excludes]]
      output = '! json'
```

只包含需要的输出格式则更慢：

```toml
[segments]
  [segments.segment1]
    [[segments.segment1.includes]]
      output = 'json'
```

## 字段

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `kind` | `string` | 无 | 匹配页面类型的 glob 模式，例如 `{taxonomy,term}`。 |
| `lang` | `string` | 无 | 已弃用（0.153.0），请改用 `sites`。 |
| `output` | `string` | 无 | 匹配页面输出格式的 glob 模式，例如 `{html,json}`。 |
| `path` | `string` | 无 | 匹配页面逻辑路径的 glob 模式，例如 `{/books,/books/**}`。 |
| `sites` | `map` | 无 | 用于定义站点矩阵的映射。0.153.0 版本新增。 |

## 指定要构建的片段

要指定 Hugo 构建哪些片段，在项目配置中加入 `renderSegments` 设置：

```toml
renderSegments = ['segment1','segment2']
```

也可以在构建时把片段名直接传给命令行参数 `--renderSegments`：

```sh
hugo build --renderSegments segment1
```

用逗号分隔可以提供多个片段：

```sh
hugo build --renderSegments segment1,segment2
```

## 示例

假设项目的内容结构如下：

```text
content/
├── books/
│   ├── _index.en.md
│   ├── _index.nb.md
│   ├── _index.nn.md
│   ├── book-1.en.md
│   ├── book-1.nb.md
│   └── book-1.nn.md
├── films/
│   ├── _index.en.md
│   ├── _index.nb.md
│   ├── _index.nn.md
│   ├── film-1.en.md
│   ├── film-1.nb.md
│   └── film-1.nn.md
├── _index.en.md
├── _index.nb.md
└── _index.nn.md
```

项目配置如下：

```toml
baseURL                        = 'https://example.org/'
title                          = 'Segmentation'
defaultContentLanguage         = 'en'
defaultContentLanguageInSubdir = true

[languages.en]
  direction = 'ltr'
  label     = 'English'
  locale    = 'en-US'
  weight    = 1

[languages.nb]
  locale    = 'nb-NO'
  direction = 'ltr'
  label     = 'Bokmål'
  weight    = 2

[languages.nn]
  locale    = 'nn-NO'
  direction = 'ltr'
  label     = 'Norsk'
  weight    = 3

[segments]
  [segments.segment1]
    [[segments.segment1.excludes]]
      [segments.segment1.excludes.sites.matrix]
        languages = ['n*']
    [[segments.segment1.excludes]]
      output = 'rss'
      [segments.segment1.excludes.sites.matrix]
        languages = ['en']
    [[segments.segment1.includes]]
      kind = '{home,term,taxonomy}'
    [[segments.segment1.includes]]
      path = '{/books,/books/**}'

[taxonomies]
  tag = 'tags'
```

执行以下命令：

```sh
hugo build --renderSegments segment1
```

发布结果的结构为：

```text
public/
├── en/
│   ├── books/
│   │   ├── book-1/
│   │   │   └── index.html
│   │   └── index.html
│   ├── tags/
│   │   ├── tag-a/
│   │   │   └── index.html
│   │   ├── tag-b/
│   │   │   └── index.html
│   │   └── index.html
│   └── index.html
└── index.html
```

关于站点范围内的配置项，例如 `renderSegments`，请参阅[配置](/configuration/)。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 渲染出来几乎什么都没有 | `includes` 没匹配到页面（glob 写法或字段用错） | 先用最宽的条件验证片段能产出内容，再逐步收紧 |
| 明明写在 `includes` 里却被排除 | `excludes` 的优先级绝对高于 `includes`（上游明确） | 检查 `excludes` 是否覆盖了目标页面 |
| 多个条件被当成「或」使用 | 同一过滤器内的条件之间是 AND，过滤器之间才是 OR | 想表达「或」就把条件拆成多个过滤器 |
| 大站点分段后没有变快 | 用 `includes` 表达「除了某格式」这类意图，需要逐页求值 | 改到 `excludes` 中表达，可跳过成组页面 |
| 构建结果与预期结构不同 | 片段名拼错，或 `renderSegments` 与 `--renderSegments` 写的名称不一致 | 逐字核对两处的片段名 |
| 报错看不懂 | 分段配置多数不报错，症状是「内容缺失」 | 见[故障排查](/troubleshooting/) |

更多排查入口见[故障排查](/troubleshooting/)。
