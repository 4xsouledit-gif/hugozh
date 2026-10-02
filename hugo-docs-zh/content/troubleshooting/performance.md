+++
title = "性能"
linkTitle = "性能"
description = "构建慢时怎么量、怎么调：先排除病毒扫描这类系统开销，再用模板指标找出最耗时的模板，决定哪些局部模板该缓存。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/troubleshooting/performance/"

[params.teach]
difficulty = "进阶"
time = "20–30 分钟"
prereq = [
  "站点能正常构建，并愿意先测量、后修改（不要凭感觉换模板写法）",
  "知道 `layouts/` 下哪些是局部模板（partial），以及它们被哪些页面调用",
]
outcomes = [
  "排除病毒扫描等系统级开销，把构建时间拉回真实水平",
  "读懂 `--templateMetrics` 输出的每一列，定位最耗时的模板",
  "判断某个局部模板该不该改用 `partialCached`，以及缓存会带来什么副作用",
  "用 `debug.Timer` 测量模板里某一小段代码的耗时",
]
next = ["/troubleshooting/inspection/", "/functions/partials/includecached/", "/functions/debug/timer/"]

+++

Hugo 本身很快，拖慢构建的往往是外部因素与低效的模板。下面从两个方向入手：减少构建过程中不必要的系统开销，以及减少模板的重复执行。

**顺序很重要：先量，再改。** 没有测量就换写法，最常见的结局是代码更复杂、速度没变化。

## 病毒扫描

病毒扫描软件是系统防护的必要组成部分，但对 Hugo 这类频繁读写磁盘的程序来说，性能影响可能非常严重。例如使用 Microsoft Defender Antivirus 时，某些站点的构建时间可能增加 400% 甚至更多。

构建站点之前，病毒扫描软件已经检查过项目目录中的文件，构建过程中再次扫描纯属多余。要改善性能，可以把 Hugo 的可执行文件加入病毒扫描软件的进程排除列表。

以 Microsoft Defender Antivirus 为例：

**开始** > **设置** > **隐私和安全性** > **Windows 安全中心** > **打开 Windows 安全中心** > **病毒和威胁防护** > **管理设置** > **添加或删除排除项** > **添加排除项** > **进程**

然后输入 `hugo.exe` 并点击「添加」按钮。

> [!NOTE]
> 病毒扫描排除项很常见，但更改这些设置时请务必谨慎，细节见 [Microsoft Defender Antivirus 文档](https://support.microsoft.com/en-us/topic/how-to-add-a-file-type-or-process-exclusion-to-windows-security-e524cbc2-3975-63c2-f9d1-7c2eb5331e53)。

其他病毒扫描软件也有类似的排除机制，可查阅各自的文档。

**怎么确认这一步有效**：在改设置前后各完整构建一次，比较 `hugo` 输出的总耗时（或 `Total in …` 那一行）。**同一台机器、同一份源码、清空缓存各跑两次取较快的一次**，这样比较才有意义。

## 模板指标

Hugo 很快，但低效的模板会拖累性能。打开模板指标，可以知道哪些模板最耗时，并发现可缓存的机会：

```bash
hugo build --templateMetrics --templateMetricsHints
```

输出形如下面这样（示例取自官方文档仓库，行数很多，建议先看排在前面的几行）：

```text
Template Metrics:

       cumulative       average       maximum      cache  percent  cached  total  
         duration      duration      duration  potential   cached   count  count  template
       ----------      --------      --------  ---------  -------  ------  -----  --------
         14.95  s      20.54 ms     278.74 ms          0        0       0    728  single.html
          3.20  s       4.03 ms      33.23 ms         99        0       0    793  _partials/layouts/header/header.html
          2.91  s       3.67 ms      29.58 ms         34        0       0    793  _partials/layouts/head/head.html
          1.82  s       2.30 ms      23.97 ms        100        0       0    793  _partials/layouts/head/head-js.html
          1.54  s     231.79 µs      23.49 ms          0        0       0   6632  _markup/render-link.html
          1.37  s       1.73 ms      19.99 ms         91        0       0    793  _partials/layouts/header/qr.html
        898.03 ms     338.24 µs      28.84 ms          0        0       0   2655  _markup/render-codeblock.html
        828.14 ms      13.15 ms      42.49 ms          0        0       0     63  list.html
        648.23 ms     817.44 µs      18.71 ms        100        0       0    793  _partials/layouts/footer.html
        624.87 ms     787.98 µs      18.88 ms         23        0       0    793  _partials/opengraph/opengraph.html
        515.61 ms       1.44 ms      23.17 ms          0        0       0    359  _shortcodes/code-toggle.html
        431.74 ms     544.44 µs      16.66 ms        100        0       0    793  _partials/layouts/search/input.html
        361.07 ms     227.66 µs       3.56 ms         58        0       0   1586  _partials/_inline/qr
        353.60 ms     445.90 µs      17.17 ms         18        0       0    793  _partials/schema.html
        292.99 ms     369.00 µs      18.63 ms         99        0       0    794  _partials/layouts/home/sponsors.html
        282.03 ms     355.64 µs      15.65 ms         28        0       0    793  _partials/twitter_cards.html
        279.74 ms     279.74 ms     279.74 ms        100        0       0      1  _partials/helpers/linkcss.html
        230.48 ms     642.01 µs       9.04 ms          0        0       0    359  _markup/render-blockquote.html
        227.22 ms     287.25 µs      12.19 ms         38        0       0    791  _partials/layouts/docsheader.html
        206.41 ms     260.29 µs      10.04 ms        100        0       0    793  _partials/layouts/header/mobilemenu.html
        202.75 ms     127.83 µs      15.57 ms         75        0       0   1586  _partials/helpers/linkjs.html
        152.33 ms     192.09 µs      16.63 ms        100        0       0    793  _partials/layouts/search/results.html
        137.02 ms     172.78 µs      10.88 ms        100        0       0    793  _partials/layouts/header/githubstars.html
        121.06 ms     152.66 µs       1.55 ms          0        0       0    793  _partials/opengraph/get-featured-image.html
        120.00 ms     165.07 µs       2.71 ms         15        0       0    727  _partials/layouts/in-this-section.html
        116.10 ms     607.86 µs      11.93 ms          0        0       0    191  _shortcodes/new-in.html
         84.77 ms      29.47 µs       5.92 ms        100        0       0   2876  _partials/inline/h-rh-l/validate-fragment.html
         71.97 ms      80.51 µs       2.81 ms          0        0       0    894  _partials/inline/h-rh-l/get-glossary-link-attributes.html
         70.27 ms      88.84 µs       5.66 ms         42        0       0    791  _partials/layouts/breadcrumbs.html
         53.72 ms       1.68 ms       8.50 ms          0        0       0     32  _shortcodes/img.html
         50.23 ms      63.34 µs       4.77 ms          0        0       0    793  _partials/layouts/hooks/body-main-start.html
         48.01 ms      48.01 ms      48.01 ms          0        0       0      1  home.html
         42.23 ms      42.23 ms      42.23 ms          0        0       0      1  404.html
         41.13 ms      56.50 µs       2.49 ms          5        0       0    728  _partials/layouts/toc.html
         39.26 ms      24.75 µs       1.28 ms         99        0       0   1586  _partials/_funcs/get-page-images.html
         24.70 ms      31.15 µs       1.09 ms        100        0       0    793  _partials/helpers/gtag.html
         23.87 ms       2.39 ms      10.01 ms          0        0       0     10  _markup/render-codeblock-goat.html
         22.62 ms      96.24 µs       2.12 ms         80        0       0    235  _partials/layouts/blocks/feature-state.html
         21.58 ms       9.07 µs       3.63 ms        100      100    2378   2380  _partials/helpers/funcs/get-github-info.html
         21.19 ms      29.10 µs     902.28 µs         97        0       0    728  _partials/layouts/page-edit.html
         20.03 ms      90.24 µs       1.49 ms          0        0       0    222  _shortcodes/include.html
         20.02 ms      27.50 µs     593.31 µs         97        0       0    728  _partials/layouts/related.html
         19.91 ms      19.91 ms      19.91 ms          0        0       0      1  /news/_content.gotmpl
         19.83 ms     450.58 µs       4.69 ms          0        0       0     44  _shortcodes/deprecated-in.html
         18.70 ms      18.70 ms      18.70 ms        100        0       0      1  _partials/helpers/funcs/get-remote-data.html
         17.03 ms      74.37 µs       1.80 ms          0        0       0    229  _markup/render-table.html
         10.61 ms      13.38 µs       2.29 ms         90        0       0    793  _partials/layouts/blocks/modal.html
         10.14 ms      12.79 µs       1.17 ms        100        0       0    793  _partials/layouts/header/mastodon.html
          9.57 ms       9.57 ms       9.57 ms          0        0       0      1  sitemap.xml
          9.35 ms      24.68 µs     637.73 µs         50        0       0    379  _partials/layouts/blocks/alert.html
          6.96 ms       8.77 µs     935.10 µs         99        0       0    794  _partials/layouts/search/button.html
          5.38 ms       2.69 ms       3.20 ms          0        0       0      2  _shortcodes/quick-reference.html
          5.32 ms       9.92 µs       1.03 ms         75        0       0    536  _partials/docs/functions-signatures.html
          5.13 ms       6.47 µs       1.36 ms        100        0       0    793  _partials/layouts/hooks/body-end.html
          5.02 ms     152.09 µs       1.22 ms          0        0       0     33  _shortcodes/glossary-term.html
          4.65 ms     132.78 µs       1.71 ms          2        0       0     35  _partials/inline/get-resource.html
          3.98 ms       1.99 ms       3.56 ms          0        0       0      2  _shortcodes/datatable.html
          3.89 ms     388.92 µs     929.41 µs          0        0       0     10  _shortcodes/render-list-of-pages-in-section.html
          3.80 ms       2.39 µs     963.41 µs        100        0       0   1586  _partials/layouts/header/theme.html
          3.44 ms       6.42 µs     795.02 µs         19        0       0    536  _partials/docs/functions-aliases.html
          3.10 ms       3.10 ms       3.10 ms          0        0       0      1  _shortcodes/glossary.html
          2.57 ms       4.80 µs     256.63 µs         88        0       0    536  _partials/docs/functions-return-type.html
          2.54 ms       2.54 ms       2.54 ms        100        0       0      1  _partials/layouts/home/opensource.html
          1.97 ms       2.48 µs     501.94 µs        100        0       0    793  _partials/layouts/icons.html
          1.85 ms      32.98 µs     178.18 µs          0        0       0     56  _shortcodes/eturl.html
          1.74 ms       1.74 ms       1.74 ms          0        0       0      1  home.redir
          1.70 ms     340.42 µs     596.87 µs          0        0       0      5  _shortcodes/qr.html
          1.65 ms     235.82 µs       1.03 ms          0        0       0      7  _markup/render-passthrough.html
          1.53 ms       1.53 ms       1.53 ms          0        0       0      1  _shortcodes/syntax-highlighting-styles.html
          1.51 ms       1.51 ms       1.51 ms          0        0       0      1  _shortcodes/root-configuration-keys.html
          1.45 ms       1.82 µs     839.08 µs        100        0       0    793  _partials/layouts/templates.html
          1.34 ms       1.34 ms       1.34 ms        100        0       0      1  _partials/helpers/validation/validate-keywords.html
          1.30 ms       1.30 ms       1.30 ms          0        0       0      1  _shortcodes/per-lang-config-keys.html
          1.18 ms      21.89 µs      76.24 µs          0        0       0     54  _markup/render-image.html
          1.15 ms       1.46 µs      36.50 µs        100        0       0    793  _partials/layouts/search/algolialogo.html
        775.57 µs     775.57 µs     775.57 µs        100        0       0      1  _partials/helpers/picture.html
        748.41 µs     374.21 µs     402.25 µs          0        0       0      2  list.rss.xml
        718.91 µs     718.91 µs     718.91 µs          0        0       0      1  _shortcodes/figure.html
        696.14 µs     232.04 µs     263.44 µs          0        0       0      3  _shortcodes/newtemplatesystem.html
        676.21 µs     852.00 ns      16.23 µs        100        0       0    793  _partials/layouts/head/speculationrules.html
        618.07 µs     618.07 µs     618.07 µs          0        0       0      1  _shortcodes/chroma-lexers.html
        605.82 µs     763.00 ns      29.52 µs        100        0       0    793  _partials/layouts/hooks/body-start.html
        444.33 µs     222.17 µs     342.78 µs          0        0       0      2  _shortcodes/highlight.html
        398.33 µs     398.33 µs     398.33 µs          0        0       0      1  _shortcodes/render-table-of-pages-in-section.html
        243.64 µs     121.82 µs     125.32 µs          0        0       0      2  _shortcodes/youtube.html
        235.46 µs      39.24 µs      66.03 µs          0        0       0      6  _shortcodes/current-go-version.html
        229.98 µs      12.78 µs      39.15 µs          0        0       0     18  _shortcodes/get-page-desc.html
        193.19 µs       8.05 µs      34.85 µs         52        0       0     24  _partials/layouts/date.html
        184.80 µs     184.80 µs     184.80 µs          0        0       0      1  _shortcodes/x.html
        125.61 µs     125.61 µs     125.61 µs          0        0       0      1  _shortcodes/details.html
        106.29 µs     106.29 µs     106.29 µs          0        0       0      1  _shortcodes/hl.html
         81.00 µs      81.00 µs      81.00 µs          0        0       0      1  _shortcodes/syntax-highlighting-styles-light-with-counterpart.html
         47.32 µs      23.66 µs      40.66 µs          0        0       0      2  _shortcodes/param.html
         42.67 µs      42.67 µs      42.67 µs        100        0       0      1  _partials/layouts/home/features.html
         37.00 µs      37.00 µs      37.00 µs          0        0       0      1  _shortcodes/instagram.html
         35.17 µs      35.17 µs      35.17 µs          0        0       0      1  _shortcodes/vimeo.html
          1.95 µs       1.95 µs       1.95 µs          0        0       0      1  home.headers
          1.81 µs     258.00 ns     977.00 ns          0        0       0      7  _shortcodes/module-mounts-note.html
```

从左到右各列的含义是：

累计时间
: 执行该模板所花费的累计时间。

平均时间
: 执行该模板所花费的平均时间。

最长用时
: 执行该模板所花费的最大时间。

缓存潜力
: 以百分比显示。缓存潜力为 100% 的局部模板，应当改用 [`partialCached`](/functions/partials/includecached/) 函数调用，而不是 [`partial`](/functions/partials/include/) 函数。见下文[缓存](#缓存)一节。

  > [!WARNING]
  > 100% 的缓存潜力，是把每次执行的渲染输出与首次执行的输出相比较得出的，因此它无法发现调用 [`warnf`](/functions/fmt/warnf/)、[`errorf`](/functions/fmt/errorf/) 之类的副作用，也无法发现执行顺序依赖，例如基于 [`IsHome`](/methods/page/ishome/) 的条件判断。一个不产生可见输出、但要执行校验、记录日志或依据上下文做条件判断的局部模板，也可能显示 100% 的缓存潜力，而缓存它会让除首次调用之外的所有调用都失去这些行为。改用 `partialCached` 之前，请先审阅该模板的逻辑。

已缓存百分比
: 渲染结果被缓存的次数除以模板被执行的次数。

缓存次数
: 渲染结果被缓存的次数。

总次数
: 模板被执行的次数。

模板
: 模板的路径，相对于 `layouts` 目录。

> [!NOTE]
> Hugo 会并行构建页面，多个页面同时生成。由于这种并行性，各模板「累计时间」之和通常大于构建站点的实际耗时。

**怎么读这张表**（把上面 100 多行变成可行动的三步）：

1. **先看累计时间排在前面的几行。** 输出已经按累计时间降序排列，改动第三行以后的收益通常很小；
2. **再看总次数。** 单次平均时间不高、但总次数成千上万的行（例如示例里的 `render-link.html`、`render-codeblock.html`），往往比一次性的 `home.html` 更值得优化；
3. **最后才看缓存潜力。** 只有「100% + 逻辑确实没有副作用」的局部模板才适合改用 `partialCached`，理由见上面的警告框。

只看前若干行时，可以用管道截断（Windows 用 `Select-Object`）：

```bash
hugo build --templateMetrics --templateMetricsHints | head -20
```

```powershell
hugo build --templateMetrics --templateMetricsHints | Select-Object -First 20
```

## 缓存

侧边栏、菜单一类的局部模板在一次站点构建中会被执行很多次。视模板内容与期望输出而定，缓存可以减少执行次数。`partialCached` 函数为局部模板提供缓存能力。

最简单的用法是只传上下文：

```go-html-template
{{ partialCached "footer.html" . }}
```

**边界与副作用**（决定「什么时候别用」）：

- 不带 `return` 语句时，`partialCached` 返回 `template.HTML` 类型的字符串；带 `return` 时，可以返回任意数据类型；
- 每个站点（或每种语言）有各自的缓存，因此每种语言会执行一次该局部模板；
- Hugo 并行渲染页面，并发调用 `partialCached` 时该模板仍可能被执行不止一次；一旦缓存建立，后续进入构建流水线的页面才会直接用缓存结果；
- 额外参数是**缓存键**，不会传给局部模板本身。例如按 `section` 区分变体，使同一 section 内只渲染一次：

  ```go-html-template {file="layouts/baseof.html"}
  {{ partialCached "footer.html" . .Section }}
  ```

- 参数可以是任意类型，需要多少键就传多少：

  ```go-html-template
  {{ partialCached "footer.html" . .Params.country .Params.province }}
  ```

> [!NOTE]
> 在初始上下文之外向 `partialCached` 传入额外参数，可以为同一个局部模板创建不同的缓存变体。详见 [`partialCached` 文档](/functions/partials/includecached/)。

**什么时候别用**：模板依赖页面上下文、会写日志、或有先后顺序依赖时不要缓存——第一次调用的结果会被复用，后面的调用不再产生副作用。这与「缓存潜力 100%」的警告是同一件事。

## 计时器

用 `debug.Timer` 函数测量一段代码的执行时间，适合在模板中寻找性能瓶颈。计时器在实例化时开始计时，调用它的 `Stop` 方法时停止：

```go-html-template
{{ $t := debug.Timer "TestSqrt" }}
{{ range 2000 }}
  {{ $f := math.Sqrt . }}
{{ end }}
{{ $t.Stop }}
```

计时结果在构建结束时打印到控制台，因此要配合 `--logLevel info` 使用：

```bash
hugo build --logLevel info
```

输出形如：

```text
INFO  timer:  name TestSqrt count 1002 duration 2.496017496s average 2.491035ms median 2.282291ms
```

计时器可以有任意多个；**没有手动 `Stop` 的计时器会在构建结束时自动停止**并打印，所以不用担心忘记写 `$t.Stop` 会丢数据。详见 [`debug.Timer`](/functions/debug/timer/)。

## 常见坑

**命令找不到**

- `--templateMetricsHints` 报未知标志：该标志必须与 `--templateMetrics` 同时使用，且要跟在 `hugo build` 之后；用 `hugo build --help` 核对当前版本；
- 管道里的 `head`（Windows）不可用：改用 `Select-Object -First 20`；
- `hugo server` 下看不到指标：模板指标是构建期输出，请在 `hugo build` 下观察。

**没有报错但结果不对**

- **改了写法却没变快**：先确认比较方法一致——同一台机器、同一份源码、加 `--ignoreCache`、各跑两次，否则病毒扫描和文件缓存会盖过模板优化的收益；
- **把「累计时间」当成构建总耗时**：并行渲染使各模板累计时间之和大于实际总时长，两者不是一回事；
- **缓存了带副作用的局部模板**：表现是「日志只出现一次」「只有第一个页面拿到了正确的值」，回看上文缓存潜力警告；
- **`debug.Timer` 没有输出**：多半是没加 `--logLevel info`，计时结果属于 INFO 级别。

**报错看不懂**

- `partialCached` 相关报错里出现找不到局部模板：检查路径是否相对 `layouts/_partials/`（或主题中的对应目录），以及变体参数是否被误当成模板参数使用；
- 构建提示某个局部模板未使用：用 `hugo build --printUnusedTemplates` 核对实际被调用的模板名，再决定优化顺序；
- 模板报错与性能无关却混在一起出现：先用[检查与调试](/troubleshooting/inspection/)确认输出正确，再谈速度——**先正确，后快**。
