+++
title = "性能"
linkTitle = "性能"
description = "评估构建耗时，并通过减少系统开销与模板重复执行来提速。"
date = 2026-10-01
weight = 60
source = "https://gohugo.io/troubleshooting/performance/"
+++

Hugo 本身很快，拖慢构建的往往是外部因素与低效的模板。下面从两个方向入手：减少构建过程中不必要的系统开销，以及减少模板的重复执行。

## 病毒扫描

病毒扫描软件是系统防护的必要组成部分，但对 Hugo 这类频繁读写磁盘的程序来说，性能影响可能非常严重。例如使用 Microsoft Defender Antivirus 时，某些站点的构建时间可能增加 400% 甚至更多。

构建站点之前，病毒扫描软件已经检查过项目目录中的文件，构建过程中再次扫描纯属多余。要改善性能，可以把 Hugo 的可执行文件加入病毒扫描软件的进程排除列表。

以 Microsoft Defender Antivirus 为例：

**开始** > **设置** > **隐私和安全性** > **Windows 安全中心** > **打开 Windows 安全中心** > **病毒和威胁防护** > **管理设置** > **添加或删除排除项** > **添加排除项** > **进程**

然后输入 `hugo.exe` 并点击「添加」按钮。

> **说明**
> 病毒扫描排除项很常见，但更改这些设置时请务必谨慎，细节见 [Microsoft Defender Antivirus 文档](https://support.microsoft.com/en-us/topic/how-to-add-a-file-type-or-process-exclusion-to-windows-security-e524cbc2-3975-63c2-f9d1-7c2eb5331e53)。

其他病毒扫描软件也有类似的排除机制，可查阅各自的文档。

## 模板指标

Hugo 很快，但低效的模板会拖累性能。打开模板指标，可以知道哪些模板最耗时，并发现可缓存的机会：

```bash
hugo build --templateMetrics --templateMetricsHints
```

输出形如下面这样（节选）：

```text
Template Metrics:

       cumulative       average       maximum      cache  percent  cached  total  
         duration      duration      duration  potential   cached   count  count  template
       ----------      --------      --------  ---------  -------  ------  -----  --------
         14.95  s      20.54 ms     278.74 ms          0        0       0    728  single.html
          3.20  s       4.03 ms      33.23 ms         99        0       0    793  _partials/layouts/header/header.html
          1.54  s     231.79 µs      23.49 ms          0        0       0   6632  _markup/render-link.html
        828.14 ms      13.15 ms      42.49 ms          0        0       0     63  list.html
          9.57 ms       9.57 ms       9.57 ms          0        0       0      1  sitemap.xml
```

从左到右各列的含义是：

累计时间
: 执行该模板所花费的累计时间。

平均时间
: 执行该模板所花费的平均时间。

最长用时
: 执行该模板所花费的最大时间。

缓存潜力
: 以百分比显示。缓存潜力为 100% 的局部模板，应当改用 `partialCached` 函数调用，而不是 `partial` 函数。

  > **警告**
  > 100% 的缓存潜力，是把每次执行的渲染输出与首次执行的输出相比较得出的，因此它无法发现调用 `warnf`、`errorf` 之类的副作用，也无法发现执行顺序依赖，例如基于 `IsHome` 的条件判断。一个不产生可见输出、但要执行校验、记录日志或依据上下文做条件判断的局部模板，也可能显示 100% 的缓存潜力，而缓存它会让除首次调用之外的所有调用都失去这些行为。改用 `partialCached` 之前，请先审阅该模板的逻辑。

已缓存百分比
: 渲染结果被缓存的次数除以模板被执行的次数。

缓存次数
: 渲染结果被缓存的次数。

总次数
: 模板被执行的次数。

模板
: 模板的路径，相对于 `layouts` 目录。

> **说明**
> Hugo 会并行构建页面，多个页面同时生成。由于这种并行性，各模板「累计时间」之和通常大于构建站点的实际耗时。

## 缓存

侧边栏、菜单一类的局部模板在一次站点构建中会被执行很多次。视模板内容与期望输出而定，缓存可以减少执行次数。`partialCached` 函数为局部模板提供缓存能力。

> **说明**
> 在初始上下文之外向 `partialCached` 传入额外参数，可以为同一个局部模板创建不同的缓存变体。

## 计时器

用 `debug.Timer` 函数测量一段代码的执行时间，适合在模板中寻找性能瓶颈。
