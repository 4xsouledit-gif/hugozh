+++
title = "审计"
linkTitle = "审计"
description = "发布前检查站点输出，发现构建阶段不会报错的问题。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/troubleshooting/audit/"
+++

## 为什么要做审计

有些问题不会在构建时报错，却会出现在正式发布的站点上。因此在最终构建之前，应当先对输出目录做一次审计。先以「保留注释 + 显示缺失翻译占位符」的方式构建，再扫描发布目录：

```bash
HUGO_MINIFY_TDEWOLFF_HTML_KEEPCOMMENTS=true HUGO_ENABLEMISSINGTRANSLATIONPLACEHOLDERS=true hugo
grep -inorE "raw HTML omitted|ZgotmplZ|\[i18n\]|\(<nil>\)|(&lt;nil&gt;)|hahahugo" public/
```

第二条命令在 GNU Bash 5.1 与 GNU grep 3.7 下测试通过；命中时以 `文件路径:行号:匹配片段` 的形式逐行输出。

## 示例输出

官方文档以终端截图展示运行结果。命中的位置会逐行列出，可以直接跳到对应文件核对。下方各项说明了这些命中分别意味着什么。

## 环境变量

`HUGO_MINIFY_TDEWOLFF_HTML_KEEPCOMMENTS=true`
: 即使启用了压缩，也保留 HTML 注释。该变量的优先级高于项目配置中的 `minify.tdewolff.html.keepComments`。如果审计时开启压缩却没有保留 HTML 注释，就无法发现被省略的原始 HTML。

`HUGO_ENABLEMISSINGTRANSLATIONPLACEHOLDERS=true`
: 翻译缺失时显示占位符，而不是默认值或空字符串。该变量的优先级高于项目配置中的 `enableMissingTranslationPlaceholders`。

## grep 选项

`-i, --ignore-case`
: 在匹配模式与输入数据中忽略大小写差异，只有大小写不同的字符视为相同。

`-n, --line-number`
: 在输出的每一行前面加上该行在其输入文件中的行号，行号从 1 开始。

`-o, --only-matching`
: 只输出匹配行中被匹配到的部分，每个匹配片段占单独一行。

`-r, --recursive`
: 递归读取每个目录下的所有文件，仅当符号链接出现在命令行上时才跟随。

`-E, --extended-regexp`
: 把匹配模式解释为扩展正则表达式。

## 匹配模式

`raw HTML omitted`
: 命中被剥离的原始 HTML：默认情况下，Hugo 会在渲染之前从 Markdown 中剥离原始 HTML，并在原处留下一条包含这段文字的注释。

`ZgotmplZ`
: 一个特殊值，表示运行时有内容以不安全的方式进入了 CSS 或 URL 上下文。

`[i18n]`
: 翻译缺失时，替代默认值或空字符串而产生的占位符。

`(<nil>)`
: 把 `nil` 值传给 `printf` 函数时，会出现在渲染结果 HTML 中的字符串。

`(&lt;nil&gt;)`
: 同上，但 `printf` 函数的返回值没有经过 `safe.HTML` 处理。

`HAHAHUGO`
: 在某些情况下，渲染后的短代码可能包含 H&#xfeff;AHAHUGOSHORTCODE 字符串的全部或一部分，大小写不定。这种情形很难在所有场合都被检测到，但对输出做一次不分大小写的 `HAHAHUGO` 搜索，通常能捕获其中的大多数，而且不容易产生误报。

## 其他检查手段

除上述扫描之外，构建时还可以打开几项检查，它们输出的都是警告，不会中断构建：

```bash
# 打印重复的目标路径等警告
hugo build --printPathWarnings

# 打印未被使用的模板
hugo build --printUnusedTemplates

# 显示模板执行的统计信息
hugo build --templateMetrics
```

`hugo config` 用来查看默认配置与自定义配置合并后的结果，便于确认某个配置项是否真的生效；`hugo env` 用来显示版本与环境信息，适合附在问题报告里。所有选项见[命令](/commands/)，与配置项的对应关系见[配置](/configuration/)，模板耗时的解读见[性能](/troubleshooting/performance/)。
