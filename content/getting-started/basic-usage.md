+++
title = "基本用法"
linkTitle = "基本用法"
description = "构建、预览与发布 Hugo 站点的日常命令：每条命令给出验证方法与失败时的排查入口。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/getting-started/usage/"

[params.teach]
difficulty = "入门"
time = "20–30 分钟"
prereq = [
  "已安装 Hugo：`hugo version` 能打印版本号；没有的话先读[安装 Hugo](/installation/)",
  "有一个能构建的项目目录（即 `hugo.toml` 所在的那一层）；没有的话先做[快速开始](/getting-started/quick-start/)",
  "会打开终端、会用 `cd` 切换到项目目录",
]
outcomes = [
  "用 `hugo build` 把站点发布到 `public/`，并解释 `public/` 为什么不会自动清空、这会带来什么后果",
  "用 `hugo server` 起本地预览，知道它监视哪些目录、LiveReload 与 `--navigateToChanged` 各自解决什么问题",
  "用 `-D` / `-E` / `-F` 控制草稿、过期与将来内容是否参与构建，并能用「文件在不在 `public/` 里」验证",
  "区分发布（publish）与部署（deploy），并在出错时按现象找到对应的排查页",
]
next = ["/getting-started/directory-structure/", "/configuration/", "/commands/", "/troubleshooting/"]

+++

这一页是跑通[快速开始](/getting-started/quick-start/)之后的日常操作手册：**构建、预览、发布**三件事。每条命令后面都写了「你应当看到什么」，因为 Hugo 有一个很容易让人误判的特点——**命令成功不代表结果正确**。

先看全局，后面再逐条展开：

| 你想做什么 | 命令 | 产出 / 现象 |
| --- | --- | --- |
| 本地预览、边写边看 | `hugo server` | 终端给出本地网址（默认 `http://localhost:1313/`） |
| 发布成静态文件 | `hugo build` | 项目根目录下出现 `public/`，里面是完整成品 |
| 部署到线上 | 把 `public/` 上传到托管平台 | 见[托管与部署](/host-and-deploy/) |

## 测试安装

安装 Hugo 之后，先确认它能跑起来：

```bash
hugo version
```

你应当看到一行以 `hugo v` 开头的版本信息，例如：

```text
hugo v0.167.0+extended windows/amd64 BuildDate=2026-09-28T14:50:38Z VendorInfo=gohugoio
```

**为什么用这一条做判据**：`version` 子命令不需要项目目录，在任何位置都能运行。所以它失败时，问题一定在安装或环境变量上，与你的项目无关——这能帮你省掉一大段排查。

失败时的两种典型情况：

- 输出 `hugo: command not found`（macOS/Linux）或「'hugo' 不是内部或外部命令」（Windows）：可执行文件不在 `PATH` 里，按[安装 Hugo](/installation/)对应平台的小节重做；
- 版本号明显偏旧：本站示例以 **v0.167.0** 为准，旧版本缺哪些子命令、哪些配置键对不上，本页下面的「查看可用命令」会教你自己确认。

## 查看可用命令

查看全部可用命令与参数：

```bash
hugo help
```

查看某个子命令的帮助，使用 `--help` 参数：

```bash
hugo server --help
```

**为什么这一步值得养成习惯**：文档与教程都会过时，`hugo help` 不会——它打印的是你这台机器上真实存在的命令和默认值。`hugo help` 也可以写成 `hugo --help` 或 `hugo -h`。

你应当看到 `Available Commands` 下列出 `build`、`server`、`new`、`config`、`list`、`gen` 等子命令。**如果你的列表里没有教程中写的命令，不要照抄教程**，先以本机 `--help` 的输出为准；参数同理，`hugo server --help` 里会写明每个参数的默认值（例如端口默认 `1313`）。

## 构建站点

切换到项目目录后执行：

```bash
cd my-project
hugo build
```

你应当看到两类结果，**两类都满足才算构建成功**：

1. 终端打印一份统计表（`Pages`、`Static files`、`Total in … ms`），`Pages` 的数量与你的内容量相符；
2. 项目根目录下出现 `public/`，其中至少有 `index.html`。

在 Windows PowerShell 里验证第 2 条：

```powershell
Test-Path public/index.html
```

输出 `True` 才算成功。

`hugo build` 会构建项目，把文件发布到 `public` 目录。要发布到其他目录，可以使用 `--destination` 参数，或在项目配置中设置 `publishDir`。默认值可以直接问 Hugo：

```bash
hugo config | grep -i publishdir
```

```text
publishdir = 'public'
```

（Windows PowerShell 把管道后半段换成 `Select-String publishdir`。）

临时换目录用 `--destination`，长期固定用配置项 `publishDir`——否则每次构建都要记得多敲一个参数，迟早会忘。

> [!NOTE]
> Hugo 在构建前不会清空 `public` 目录：同名文件会被覆盖，但不会被删除。这样做是为了避免误删你在构建之后手动放入 `public` 目录的文件。
>
> 如有需要，你可以每次构建前手动清空 `public` 目录，或者使用 `--cleanDestinationDir` 命令行参数或 `cleanDestinationDir` 配置项，让 Hugo 自动清理陈旧文件。

**这条提醒对新手尤其重要**：`public/` 里装的是**上一次构建的残留**。你删掉一篇文章、或者把它改成草稿，`public/` 里对应的旧 HTML 仍然在，上传后线上依旧能访问到它。所以判断标准是**看 `public/` 里的实际文件**，而不是只看命令有没有报错。

> [!WARNING]
> 实测：在一个既没有 `hugo.toml`、也没有 `content/` 的目录里执行 `hugo build --renderToMemory`，Hugo 的**退出码是 0**，只打印 `WARN found no layout file …`，构建出的页面数接近 0。这正是「没报错但结果不对」的典型场景——请把统计表的 `Pages` 数量和 `public/index.html` 一起看。

## 草稿、将来与过期内容

你可以在内容的[前置元数据](/content-management/front-matter/)中设置 `draft`、`date`、`publishDate` 与 `expiryDate`。默认情况下，满足以下任一条件的内容不会被发布：

- `draft` 为 `true`
- `date` 位于将来
- `publishDate` 位于将来
- `expiryDate` 已经过去

> [!NOTE]
> Hugo 会发布草稿、将来与过期页面的后代页面，其中也包括 section（内容区块）页面。要阻止这些后代页面发布，可以用 `cascade` 前置元数据字段把[构建选项](/content-management/build-options/)级联给它们。

**为什么这条容易踩**：你只挡住了父页面，它下面挂着的子页面照样会出现在站点里，而且**不报任何错**。子页面成批出现「不该出现的内容」时，先回头检查父页面的状态与 `cascade`。

运行 `hugo build` 或 `hugo server` 时，可以用命令行参数覆盖默认行为：

```bash
hugo build --buildDrafts    # 或 -D
hugo build --buildExpired   # 或 -E
hugo build --buildFuture    # 或 -F
```

虽然也可以把这些值写进项目配置，但除非所有内容作者都清楚这些设置，否则可能带来意料之外的结果。

**验证标准**（用一篇草稿亲手试一次，比读十遍规则有用）：

1. 新建 `content/posts/draft-demo.md`，前置元数据里写 `draft = true`；
2. 执行 `hugo build`，`public/posts/draft-demo/index.html` **不存在**；
3. 执行 `hugo build -D`，同一个文件**存在**。

两条都对，说明草稿规则与 `-D` 都按预期工作。`-D` 是 `--buildDrafts` 的简写，`-E`、`-F` 同理。

> [!TIP]
> 想测试定时发布（`publishDate` 设在将来）不必真的等到那个时刻：`--clock` 参数可以固定构建时使用的「现在」，例如 `hugo build --clock 2026-01-01T00:00:00+08:00`。`--clock` 是本机版本 `hugo build --help` 里列出的参数，写法和取值以你本机输出为准。

> [!NOTE]
> 如前所述，Hugo 在构建前不会清空 `public` 目录。根据上面四个条件在_当次_构建中的判定结果，构建后的 `public` 目录里可能残留上一次构建产生的多余文件。
>
> 常见做法是在每次构建前手动清空 `public` 目录，以移除草稿、过期与将来内容，或者使用 `--cleanDestinationDir` 参数或 `cleanDestinationDir` 配置项让 Hugo 自动清理陈旧文件。

## 开发与测试站点

在开发模板或撰写内容时预览站点，切换到项目目录后执行：

```bash
hugo server
```

`hugo server` 会构建站点，并用一个精简的 HTTP 服务器提供页面。运行时会显示本地站点地址：

```text
Web Server is available at http://localhost:1313/
```

服务器运行期间会监视项目目录中资源（assets）、配置（configuration）、内容（content）、数据（data）、模板（layouts）、翻译（translations）与静态文件（static files）的变化，一旦检测到改动就重建站点，并通过实时重载（LiveReload）刷新浏览器。

多数 Hugo 构建都非常快，除非你正盯着浏览器，否则可能感觉不到这次变化。

**你应当看到什么**：

- 终端里打印 `Web Server is available at …`，把浏览器打开到这个地址能看到首页；
- 回到编辑器改一个字并保存，浏览器**不手动刷新也会自己变**；
- 在终端按 `Ctrl + C` 可以停止服务器（终端会回到命令提示符）。

三个常见疑问：

- **改了文件却没反应**：监视范围只包括项目目录下的上述几个目录。文件放在项目外面（例如另一个文件夹里的草稿），改了不会触发重建；改的是 `public/` 里的产物也不会——那是输出，不是源码。
- **端口 1313 被占用**：用 `hugo server --port 1414`（或 `-p 1414`）换一个端口。注意以**终端实际打印的地址**为准，别照抄教程里的 1313。
- **手机或另一台电脑打不开**：默认只监听 `127.0.0.1`（本机回环地址），局域网内其他设备访问不到；确实需要时用 `hugo server --bind 0.0.0.0`，并配合 `--baseURL` 让页面里生成的链接指向可访问的地址。

### 实时重载（LiveReload）

服务器运行时，Hugo 会向生成的 HTML 页面注入 JavaScript。LiveReload 脚本通过 WebSocket 在浏览器与服务器之间建立连接，你不需要安装任何软件或浏览器插件，也不需要做任何配置。

如果浏览器没有自动刷新，先检查它有没有禁用 JavaScript、或者有没有插件拦截了本地页面的脚本。

### 自动跳转

编辑内容时，如果希望浏览器自动跳转到你最后修改的页面，可以运行：

```bash
hugo server --navigateToChanged
```

## 部署站点

先分清两个词：**发布（publish）**是把源码渲染成 `public/` 里的静态文件，**部署（deploy）**是把这些文件送到服务器或托管平台。本节讲发布，部署见[托管与部署](/host-and-deploy/)。

> [!NOTE]
> 如前所述，Hugo 在构建前不会清空 `public` 目录。请在每次构建前手动清空它，以移除草稿、过期与将来内容，或者使用 `--cleanDestinationDir` 参数或 `cleanDestinationDir` 配置项让 Hugo 自动清理陈旧文件。

准备好部署时执行：

```bash
hugo
```

不带子命令的 `hugo` 与 `hugo build` 都是构建命令；本页统一写 `hugo build`，方便和后面的参数一起读。

这条命令会构建站点，把文件发布到 `public` 目录，目录结构大致如下：

```text
public/
├── categories/
│   ├── index.html
│   └── index.xml  <-- 该 section 的 RSS 订阅
├── posts/
│   ├── my-first-post/
│   │   └── index.html
│   ├── index.html
│   └── index.xml  <-- 该 section 的 RSS 订阅
├── tags/
│   ├── index.html
│   └── index.xml  <-- 该 section 的 RSS 订阅
├── index.html
├── index.xml      <-- 站点级 RSS 订阅
└── sitemap.xml
```

**发布完成的验证标准**：

- `public/index.html` 存在；
- `public/sitemap.xml` 存在；
- 再跑一次 `hugo build --cleanDestinationDir`，你手动塞进 `public/` 的测试文件会被清掉（统计表里 `Cleaned` 一行的计数大于 0）。

在简单的托管环境中，通常用 `ftp`、`rsync` 或 `scp` 把文件上传到虚拟主机的根目录，此时 `public` 目录中的内容就是全部所需文件。

多数用户会把站点部署到 CI/CD（持续集成与持续交付）平台：向远程 Git 仓库推送后触发构建与部署。Git 仓库通常包含整个项目目录，但会排除 `public` 目录，因为站点是在推送_之后_才构建的。

**上传之后最常见的两种情况**：

- **页面能打开，但没有样式**：最常见的原因是 `baseURL` 还是默认值（`https://example.org/` 之类），于是主题引用的 CSS/JS 变成了指向错误域名的绝对地址。把 `baseURL` 改成正式地址后重新构建，见[配置 Hugo](/configuration/)。
- **删掉的文章线上还能访问**：构建不会删除 `public/` 里的旧文件。用 `--cleanDestinationDir`，或者先手动清空再上传。

## 常见坑速查

按「现象」查，比按命令查快：

| 现象 | 属于哪一类 | 先做什么 |
| --- | --- | --- |
| `hugo: command not found` / 不是内部或外部命令 | 命令找不到 | `PATH` 没配好 → [安装 Hugo](/installation/) |
| 命令退出码是 0，但 `Pages` 数接近 0，或终端只有 `WARN found no layout file` | 没报错但结果不对 | 多半不在项目根目录（`hugo.toml` 所在层）；用 `hugo list all` 看内容清单是否只有表头 |
| 草稿文章在浏览器里看不到 | 没报错但结果不对 | 用 `hugo server -D`，或把 `draft` 改成 `false` |
| 删掉的文章上线后还能访问 | 没报错但结果不对 | `public/` 里有旧文件 → `--cleanDestinationDir` |
| 页面都能打开，但完全没有样式 | 没报错但结果不对 | `baseURL` 没改成正式地址 → [配置 Hugo](/configuration/) |
| 报错里出现 `toml: invalid character at start of key: U+00FF` | 报错看不懂 | 配置文件被写成了 UTF-16 编码 → 见[快速开始](/getting-started/quick-start/)的「Windows 用户的坑」 |
| 报错提到某个短代码或模板找不到，但你觉得自己没写 | 报错看不懂 | 见[故障排查](/troubleshooting/)中关于短代码与模板查找的条目 |

更系统的排查手段（日志、性能、站点审计）在[故障排查](/troubleshooting/)。

## 下一步

- 想知道 `public/` 之外那些目录各自做什么、文件该放哪儿 → [目录结构](/getting-started/directory-structure/)；
- 想改站点标题、语言、菜单、输出格式 → [配置 Hugo](/configuration/)；
- 想查某个子命令的完整参数与默认值 → [命令](/commands/)；
- 想真正把站点放上线 → [托管与部署](/host-and-deploy/)。
