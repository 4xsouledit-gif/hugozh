+++
title = "常见问题"
linkTitle = "常见问题"
description = "新用户最常遇到的问题：页面不显示、首页 404、局部模板不渲染、构建输出不一致等，每个都给出原因、确认方法和修法。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/troubleshooting/faq/"

[params.teach]
difficulty = "入门"
time = "10 分钟（按症状跳读）"
prereq = [
  "手头有一个能构建、或能复现问题的 Hugo 项目",
  "知道项目根目录在哪里，也能打开终端",
]
outcomes = [
  "用「症状 → 小节」的方式快速命中自己的问题，而不是从头读到尾",
  "独立解决页面不发布、首页 404、局部模板不渲染这三类高频问题",
  "知道每个「为什么」要链到哪一页去看完整规则",
]
next = ["/troubleshooting/inspection/", "/troubleshooting/logging/", "/troubleshooting/"]

+++

Hugo 的[论坛](https://discourse.gohugo.io)是活跃的用户与开发者社区，两万多个主题中往往已经有人回答过你的问题；中文提问请用官方论坛的[中文分类](https://discourse.gohugo.io/c/chinese/42)。提问之前，请先阅读论坛的[求助指南](https://discourse.gohugo.io/t/requesting-help/9132)。下面列出新用户最常问到的若干问题。

## 先按症状分诊

| 你看到的 | 先读哪一节 |
| --- | --- |
| 报错说某个功能不可用 | [提示某个功能不可用](#提示某个功能不可用) |
| 打开首页是「Page Not Found」 | [访问首页时显示「Page Not Found」](#访问首页时显示page-not-found) |
| 写好的文章在站点里找不到 | [某个页面没有被发布](#某个页面没有被发布) |
| 某个栏目下看不到子页面 | [看不到某个页面的下级页面](#看不到某个页面的下级页面) |
| 分部模板 / 局部模板输出不对 | [局部模板没有按预期渲染](#局部模板没有按预期渲染) |
| 同一个页面出现两份、或输出每次不一样 | [每次构建的输出为什么不一致](#每次构建的输出为什么不一致) |
| 改了文件但 `hugo server` 没反应 | [开发服务器为什么检测不到文件变化](#开发服务器为什么检测不到文件变化) |
| 短代码、分页、变量赋值的写法拿不准 | 见下文对应小节 |

下面每条都按「为什么 → 怎么确认 → 怎么修」写。

## 提示某个功能不可用

当你在所安装的版本（edition）中使用它并不提供的功能时，Hugo 会抛出这个错误：

```text
this feature is not available in this edition of Hugo
```

**为什么**：Hugo 有多个版本（edition），例如标准版与 extended 版，某些功能只在其中一部分版本里编译进去。这不是配置写错，而是二进制本身没有这个能力。

**怎么确认**：先看版本行里有没有 `extended` 字样：

```bash
hugo version
```

```text
hugo v0.167.0+extended windows/amd64 ...
```

**怎么修**：安装另一个版本，详见[安装](/installation/)。

## 访问首页时显示「Page Not Found」

请检查 `content/_index.md` 文件：

- `draft` 是否被设为 `true`？
- `date` 是否在未来？
- `publishDate` 是否在未来？
- `expiryDate` 是否已经过去？

**为什么**：首页也是一个普通页面，同样受这组字段约束；只要有一项命中，Hugo 就按「不发布」处理，而不是报错。

**怎么确认**：

```bash
hugo list all     # 列出 Hugo 实际认到的所有内容文件
hugo list drafts  # 只列草稿
hugo list future  # 只列日期还在未来的页面
hugo list expired # 只列已经过期的页面
```

**怎么修**：只要有一项答案为「是」，就修改字段值，或使用 `--buildDrafts`、`--buildFuture`、`--buildExpired` 中的一个命令行标志。字段的完整规则见[基本用法](/getting-started/basic-usage/)。

## 某个页面没有被发布

请检查 `content/section/page.md` 或 `content/section/page/index.md` 文件，判断标准与上一个问题相同：`draft`、`date`、`publishDate`、`expiryDate`。

**怎么确认**：`hugo list all` 里能查到它，说明 Hugo 读到了文件、只是被规则拦下；若 `hugo list all` 里也没有它，问题不在发布时间，而在**文件位置或文件名**（例如放进了 `content/` 之外，或后缀不是 `.md`）。

**怎么修**：同样，修改字段值，或使用 `--buildDrafts`、`--buildFuture`、`--buildExpired`。

## 看不到某个页面的下级页面

你可能用了 `index.md`，而这里应当是 `_index.md`。

**为什么**：含 `index.md` 的目录是[leaf bundle](g)（叶子包），它自己不向下公开子页面；含 `_index.md` 的目录是[branch bundle](g)（分支包），才能承载子页面列表。详见[页面包](/content-management/page-bundles/)。

**怎么确认**：列出该目录的文件名，确认是 `index.md` 还是 `_index.md`；再对照 `hugo list all` 的输出，缺的页面通常就是这一层。

## `index.md` 与 `_index.md` 有什么区别

含 `index.md` 的目录是[leaf bundle](g)，含 `_index.md` 的目录是[branch bundle](g)。详见[页面包](/content-management/page-bundles/)。

简单记法：**叶子包放一篇内容和它的资源，分支包放一组页面**。

## 局部模板没有按预期渲染

调用局部模板（partial）时，可能忘记传入所需的上下文。例如：

```go-html-template
{{/* incorrect */}}
{{ partial "pagination.html" }}

{{/* correct */}}
{{ partial "pagination.html" . }}
```

**为什么**：局部模板不会自动继承调用者的[context](g)（上下文），第二个参数就是它拿到的「`.`」。不传时，模板内部的 `.Paginator` 一类字段全部取不到值。

**怎么确认**：把调用临时改成 `{{ printf "%T" . }}` 之类，或在局部模板首行加一句 `<pre>{{ debug.Dump . }}</pre>` 打印实际拿到的数据，做法见[检查与调试](/troubleshooting/inspection/)。若模板内部报「nil pointer」或输出空白，基本就是这个原因。

**怎么修**：补上第二个参数；需要传递附加数据时用字典：

```go-html-template
{{ partial "pagination.html" (dict "page" . "size" 5) }}
```

## 给变量赋值时 `:=` 与 `=` 有什么区别

用 `:=` 初始化变量，用 `=` 给此前已经初始化的变量赋值。详见 [text/template 关于变量的说明](https://pkg.go.dev/text/template#hdr-Variables)。

**为什么**：`:=` 声明并赋值，`=` 只赋值。对没有声明过的变量用 `=` 会直接报错，而不是静默失败——这条报错信息通常很直白，看到 `undefined variable` 就往这里想。

## 列表页分页后页面集合没有按条件过滤

很可能在同一页面上多次调用了 [`Paginate`](/methods/page/paginate/) 或 [`Paginator`](/methods/page/paginator/) 方法。详见[分页](/templates/pagination/)。

**为什么**：分页状态与「当前这次分页的页面集合」绑定。同一页面第二次调用会拿到另一套状态，导致分页结果和过滤条件对不上。

**怎么修**：把分页结果先赋给一个变量，后续复用这个变量：

```go-html-template
{{ $paginator := .Paginate (where .Pages "Section" "posts") }}
{{ range $paginator.Pages }}{{ .Title }}{{ end }}
```

## 为什么短代码有两种调用方式

如果短代码模板本身，或开始与结束标签之间的内容包含 Markdown，使用 `{{%/* shortcode */%}}` 写法；否则使用 `{{</* shortcode */>}}` 写法。详见[短代码的写法](/shortcodes/#两种定界符)。

**为什么**：两种写法决定了执行顺序。Markdown 写法（`{{%/* … */%}}`）在 Markdown 渲染器**之前**执行，因此它的 `.Inner` 是原始 Markdown，里面的标题也会进目录；标准写法（`{{</* … */>}}`）在 Markdown 渲染器**之后**执行，`.Inner` 是未渲染的文本，需要手动 `markdownify`，其中的标题不会进目录。

**怎么确认**：如果短代码里的 Markdown 原样显示成一堆符号，说明用了标准写法；如果短代码里的 HTML 被转义成可见标签，说明用了 Markdown 写法。

## 可以用环境变量控制配置吗

可以。详见[配置](/configuration/introduction/#环境变量)。

**怎么确认**：用 `hugo config` 查看合并后的最终结果，确认环境变量是否真的生效。

## 每次构建的输出为什么不一致

最常见的原因是页面冲突（两个页面发布到同一路径）以及并发带来的影响。用 `--printPathWarnings` 命令行标志检查页面冲突；如果怀疑是并发问题，请在[论坛](https://discourse.gohugo.io)发帖说明。

**怎么确认**：

```bash
hugo --ignoreCache --printPathWarnings
```

输出里出现重复目标路径的行，就是冲突点。两个页面发布到同一路径时，谁后写谁留下，于是「同一份源码、两次构建、不同结果」。

**怎么修**：把冲突的两个源文件改成不同路径（常见于 `content/a/b.md` 与 `content/a/b/index.md` 并存），或删掉多余的那一个。

## 开发服务器为什么检测不到文件变化

在默认配置下，以下情形中 Hugo 的文件监视器可能无法检测到文件变化：

- 在 Windows Subsystem for Linux（WSL/WSL2）中运行 Hugo，而项目文件位于 Windows 分区；
- 在本地运行 Hugo，而项目文件位于可移动驱动器；
- 在本地运行 Hugo，而项目文件位于通过 NFS、SMB 或 CIFS 协议访问的存储服务器。

**为什么**：默认方案依赖操作系统提供的原生文件系统事件；跨分区、跨网络的挂载点往往不产生这些事件，或者事件不能跨边界传回 Hugo。

**怎么修**：这些情况下请改用 `--poll` 命令行标志，以轮询代替原生文件系统事件。例如每 700 毫秒轮询一次项目文件：`--poll 700ms`。

```bash
hugo server --poll 700ms
```

**你应当看到什么**：改一个内容文件并保存，终端应在 1 秒内出现重新构建的日志；页面自动刷新。若仍无反应，先确认编辑的是项目目录内的文件，再逐步减小轮询间隔。

## 页面的 Store 里为什么缺少某个值

[`Store`](/methods/page/store/) 方法为该页面建立持久的数据结构，用于存放和操作键值数据。这些值通常在短代码模板、由短代码调用的局部模板或渲染钩子模板中设置；在 Hugo 渲染页面内容之前，它们都不是确定值。

**为什么**：父模板先于页面内容渲染。父模板去取 `Store` 里的值时，短代码可能还没执行，键自然还不存在。

如果需要从父模板访问已存储的值，而父模板尚未渲染页面内容，可以把返回值赋给一个无用的 [noop](g) 变量，以此触发内容渲染：

```go-html-template
{{ $noop := .Content }}
{{ .Store.Get "mykey" }}
```

用其他方法同样可以触发内容渲染，见下一个问题。

## 哪些页面方法会触发内容渲染

`Page` 对象上的以下方法会触发内容渲染：`Content`、`ContentWithoutSummary`、`FuzzyWordCount`、`Len`、`Plain`、`PlainWords`、`ReadingTime`、`Summary`、`Truncated`、`WordCount`。

**怎么用**：把不需要的返回值赋给 `$noop`，只为触发渲染，例如：

```go-html-template
{{ $noop := .WordCount }}
{{ .Store.Get "mykey" }}
```

## 常见坑

**命令找不到**

- 照抄了含 `grep` / `which` 的命令却在 Windows PowerShell 里执行：改用 `Select-String`、`Get-Command`；
- `hugo list …` 报未知命令：旧版本可能没有该子命令，用 `hugo --help` 对照；
- 在 WSL 里 `hugo: command not found`：WSL 是独立环境，需要单独安装 Hugo。

**没有报错但结果不对**

- **不在项目根目录执行**：Hugo 会构建出一个空站点并正常退出，页面数为 0 却不报错。先确认当前目录下有 `hugo.toml`；
- **只看了页面、没看列表**：`hugo list all` 是判断「Hugo 到底有没有读到这个文件」最省事的办法；
- **改了配置没生效**：确认改的是项目根目录下的配置文件，再用 `hugo config` 看合并后的结果；
- **开发服务器在看旧文件**：`hugo server` 有缓存，怀疑结果不对时用 `hugo --ignoreCache` 重新构建一次。

**报错看不懂**

- 报错指向的文件里没有短代码，却提示短代码相关问题：检查正文里有没有**未转义的短代码分隔符**，展示时要写成 `{{</* name */>}}`；
- `toml: invalid character at start of key: U+00FF`：配置文件被写成了 UTF-16LE 带 BOM（Windows PowerShell 5.1 的 `>` / `>>` 重定向会这样），另存为 UTF-8 即可；
- 完全看不懂的报错：把完整输出与最小复现项目发到[论坛](https://discourse.gohugo.io)，先用[故障排查](/troubleshooting/)分诊；模板层面的中间值用[检查与调试](/troubleshooting/inspection/)打印出来看。

> [!NOTE]
> 其他问题请访问[论坛](https://discourse.gohugo.io)。两万多个主题中往往已经有人回答过你的问题；提问之前请先阅读[求助指南](https://discourse.gohugo.io/t/requesting-help/9132)。
