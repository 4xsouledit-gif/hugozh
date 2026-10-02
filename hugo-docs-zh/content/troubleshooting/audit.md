+++
title = "审计"
linkTitle = "审计"
description = "部署前对站点输出做一次体检：保留注释、显示缺失翻译占位符后构建，再扫描 public/，抓出构建阶段不报错、却会出现在线上站点的问题。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/troubleshooting/audit/"

[params.teach]
difficulty = "进阶"
time = "10–15 分钟"
prereq = [
  "站点能正常构建，`hugo` 退出码为 0",
  "能在项目根目录执行命令；Windows 用户需要下面给出的 PowerShell 等价写法（系统里没有 `grep`）",
]
outcomes = [
  "用两条命令扫描整个 `public/`，并读懂每一类命中的含义",
  "知道两个环境变量分别关闭了哪一层「美化」，为什么审计时必须打开",
  "分清哪些命中必须修、哪些只是提醒，并知道接着去查哪一页",
]
next = ["/troubleshooting/inspection/", "/troubleshooting/performance/"]

+++

有些问题**不会在构建时报错，却会出现在正式发布的站点上**：被剥离的原始 HTML、缺失的翻译、被打印出来的 `nil`、残留的短代码占位符。默认构建不会为此停下，扫描 `public/` 也不在 Hugo 的职责范围内。因此，在最终构建之前，应当专门做一次审计。

审计的思路很简单：**先用「不美化输出」的方式构建，再扫描产物**。只要把注释和占位符都保留下来，问题就会以字符串的形式留在 HTML 里，可以被搜索到。

## 第 1 步：以审计模式构建并扫描

官方给出的是一条组合命令：

```sh {copy=true}
HUGO_MINIFY_TDEWOLFF_HTML_KEEPCOMMENTS=true HUGO_ENABLEMISSINGTRANSLATIONPLACEHOLDERS=true hugo && grep -inorE "<\!-- raw HTML omitted -->|ZgotmplZ|\[i18n\]|\(<nil>\)|(&lt;nil&gt;)|hahahugo" public/
```

实测：GNU Bash 5.1 与 GNU grep 3.7 下可直接执行。拆成两步更好读，效果完全相同：

```bash
# 1) 以审计模式构建
HUGO_MINIFY_TDEWOLFF_HTML_KEEPCOMMENTS=true HUGO_ENABLEMISSINGTRANSLATIONPLACEHOLDERS=true hugo

# 2) 扫描产物
grep -inorE "raw HTML omitted|ZgotmplZ|\[i18n\]|\(<nil>\)|(&lt;nil&gt;)|hahahugo" public/
```

### Windows 用户的等价写法

Windows 自带的 PowerShell 里没有 `grep`。用 `Select-String` 代替，正则写法一致：

```powershell
$env:HUGO_MINIFY_TDEWOLFF_HTML_KEEPCOMMENTS = 'true'
$env:HUGO_ENABLEMISSINGTRANSLATIONPLACEHOLDERS = 'true'
hugo

Get-ChildItem -Recurse -File public |
  Select-String -Pattern 'raw HTML omitted|ZgotmplZ|\[i18n\]|\(<nil>\)|(&lt;nil&gt;)|hahahugo'
```

`$env:` 赋值只对当前这个终端会话有效，关掉窗口即失效；下次审计要重新设置。若在 WSL 里执行，`grep` 可用，但要确认 WSL 里也装了 Hugo（见[症状 A：命令找不到](/troubleshooting/#症状-a命令找不到)）。

### 你应当看到什么

- **没有任何输出**：扫描通过，产物里没有上述任何一种问题。这是正常结果，不是失败——`grep` 在无匹配时退出码为 **1**；
- **有输出**：每行形如 `public/section/page/index.html:123:匹配片段`，含义是「文件路径 : 行号 : 命中的片段」。按路径打开那个文件核对即可。`Select-String` 的格式类似，字段顺序为 `文件:行号:整行内容`。

如果第一步构建就失败了，那属于另一种问题，请先回到[故障排查](/troubleshooting/)分诊，不要带着失败的构建跑审计。

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
: 命中被剥离的原始 HTML：默认情况下，Hugo 会在渲染之前从 Markdown 中剥离原始 HTML，并在原处留下一条包含这段文字的注释。原始写法是一个 HTML 注释（`<!-- raw HTML omitted -->`）。

`ZgotmplZ`
: 一个特殊值，表示运行时有内容以不安全的方式进入了 CSS 或 URL 上下文。

`[i18n]`
: 翻译缺失时，替代默认值或空字符串而产生的占位符。

`(<nil>)`
: 把 `nil` 值传给 `printf` 函数时，会出现在渲染结果 HTML 中的字符串。

`(&lt;nil&gt;)`
: 同上，但 `printf` 函数的返回值没有经过 [`safe.HTML`](/functions/safe/html/) 函数处理。

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

## 常见坑

**命令找不到**

- 在 Windows PowerShell 里执行含 `grep` 的命令，会看到 `The term 'grep' is not recognized`。改用上面的 `Select-String` 写法；
- `grep: public/: No such file or directory`：说明 `public/` 还不存在，先执行一次 `hugo`（审计构建）再扫描；
- 在 WSL 里 `hugo: command not found`：WSL 与 Windows 的工具链互相独立，需要各自安装。

**没有报错但结果不对**

- **忘了带两个环境变量**：压缩开启后 HTML 注释被删除，`raw HTML omitted` 会永远扫不到，看着「干净」其实是白扫。这是最常见的一种假阴性；
- **扫错了目录**：在项目根目录而不是 `public/` 上扫描，或者 `public/` 是上一次构建留下的旧产物。审计构建之后立刻扫描，不要隔一会儿；
- **`grep` 的退出码**：无匹配时退出码为 1。若把它接在 `set -e` 的脚本里，会被当作失败而中断。

**报错看不懂**

- `grep` 报 `Invalid regular expression`：通常是模式里的反斜杠在复制时丢了一层，`\(<nil>\)` 里的括号必须转义；
- `Select-String` 的输出格式与 `grep` 不同（整行输出，`-o` 那种只显示片段的行为没有对应项），不要拿两边输出逐字对比；
- 扫描到大量 `ZgotmplZ` 时不要只改一处：它意味着某个模板在 URL 或 CSS 上下文里拼了不安全的内容，需要回到该模板查明数据来源。

审计只是「发布前体检」的一环。若某项命中看不懂，用[检查与调试](/troubleshooting/inspection/)把上下文数据打印出来，再决定是改数据还是改模板。
