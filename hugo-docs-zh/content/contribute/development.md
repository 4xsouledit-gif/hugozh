+++
title = "参与开发"
linkTitle = "参与开发"
description = "从零到第一个拉取请求：环境准备、fork 与分支、四种构建方式、测试、提交信息约定，以及中文读者最容易踩的七个坑。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/contribute/development/"

[params.teach]
difficulty = "进阶"
time = "首次约 90–120 分钟（含安装 Go、首次构建与跑测试）"
prereq = [
  "会基本命令行操作：能 `cd` 到目录、能复制粘贴带参数的完整命令。",
  "有一个 GitHub 账号，并已在本机配置好 `git`（`git --version` 有输出）。",
  "准备从源码构建：需要装 [Go](https://go.dev/doc/install)（版本不低于当前 Hugo 所要求的版本）；构建扩展版还需要一个 C 编译器。",
  "了解 Go 与 Git 的基本概念会顺很多，但本页会把每一步该敲什么写出来。",
]
outcomes = [
  "把参与方式分成「不用写代码」与「要改源码」两类，并为每一类找到入口；",
  "区分标准版、deploy 版、扩展版、扩展 + deploy 版四种构建命令，知道自己该用哪一条；",
  "走完 fork → 建分支 → 改 → 构建 → 测试 → 提交 → push → 开 PR 的完整链路；",
  "按项目的约定写出规范的提交信息（摘要行、正文、Fixes/Closes）；",
  "用 `go env GOPATH`、`go test`、`git log --oneline -1` 三条命令验证自己每一步的结果。",
]
next = ["/contribute/documentation/", "/installation/", "/troubleshooting/"]
+++

## 这一页解决什么问题

这一页回答的是「我想给 Hugo 出点力（尤其是改代码），第一步该做什么」。上游原文把流程列成了十步，但默认你已经装好 Go、会建分支、也知道构建产物装去了哪里。这里补的正是这层空白：**每一步都写清在哪个目录执行、会看到什么、以及没看到时先查哪里。**

先分清一件事：**参与开发不等于改代码**。下面第一小节列的五件事里，有四件不需要写 Go。真正要动源码的部分从「从零到第一个 PR」开始，首次走完大约 90–120 分钟，其中大半花在装 Go、第一次构建和跑测试上（本机没有实测过这三个耗时，以你的网络与机器为准）。

> [!NOTE]
> 想改的是**本站的中文译文或教学层**，而不是 Hugo 源码？那属于[参与文档](/contribute/documentation/)，入口完全不同——本站的贡献口径见[参与贡献](/contribute/)首页。

## 不用写代码也能参与

参与 Hugo 项目有很多种方式，不限于写代码。你可以：

- 在[论坛](https://discourse.gohugo.io)回答问题（中文交流见[中文分类](https://discourse.gohugo.io/c/chinese/42)）；
- 改进[文档](https://github.com/gohugoio/hugoDocs)；
- 关注[议题队列](https://github.com/gohugoio/hugo/issues)；
- 创建或改进[主题](https://themes.gohugo.io/)；
- 修复[缺陷](https://github.com/gohugoio/hugo/issues?q=is%3Aopen+is%3Aissue+label%3ABug)。

文档相关的议题与拉取请求请提交到文档仓库。完整的贡献指南见 [CONTRIBUTING.md](https://github.com/gohugoio/hugo/blob/master/CONTRIBUTING.md)。

## 功能提案

如果你有改进或新功能的想法，请先在论坛的 Feature 分类发起新话题。这样做有助于：

- 确认该能力是否已经存在；
- 衡量社区的兴趣；
- 打磨概念。

如果兴趣足够，再[提交提案](https://github.com/gohugoio/hugo/issues/new?labels=Proposal%2C+NeedsTriage&template=feature_request.md)。在项目负责人接受提案之前，请不要提交拉取请求。

**为什么必须先提案**：Hugo 的功能面很宽，同一件事往往已经有函数、方法或配置项能做；先讨论能避免你把一个周末花在一个「已有更好做法」或「与项目方向不符」的实现上。提案被接受之后，PR 才有明确的验收标准。

## 从零到第一个 PR：环境准备

沿上游要求，从源码构建 Hugo 必须先安装两样东西：

1. 安装 [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)；
2. 安装 [Go](https://go.dev/doc/install)，版本不低于**当前 Hugo 所要求的 Go 版本**。

关于第二步的版本，有两个容易踩的点：

- 上游这一句里的版本号是**随发布变化的占位值**，本站不写死一个数字。看当前 Hugo 用哪个 Go 版本构建，最可靠的方法是运行 `hugo env` 并读 `GOVERSION` 一行：
  ```bash
  hugo env | grep GOVERSION     # macOS / Linux
  hugo env | Select-String GOVERSION   # Windows PowerShell
  ```

  **实测**（条件：Hugo v0.167.0+extended，windows/amd64，2026-10-03）：`hugo env` 的 `GOVERSION` 为 `go1.27.1`，即官方用它构建该版本。**注意这只是参考下限的粗略依据**——`GOVERSION` 告诉你的是「官方构建这些二进制时用的 Go」，官方对外宣称的最低要求以官网为准。
- 构建**扩展版**还需要一个 C 编译器，例如 [GCC](https://gcc.gnu.org/) 或 [Clang](https://clang.llvm.org/)。只用标准版不需要。

### 环境准备的三条验证标准

在继续之前，逐条确认。任何一条没有通过，都不要往下走：

| 检查 | 命令 | 你应当看到什么 |
| --- | --- | --- |
| Git 可用 | `git --version` | 形如 `git version 2.51.0` 的一行 |
| Go 可用 | `go version` | 形如 `go version go1.27.1 windows/amd64` 的一行 |
| Go 的下载通道可用 | `go env GOPROXY` | 有输出即可；国内网络下若 `go install` 长时间卡住，把它改成自己信任的代理，例如 `go env -w GOPROXY=<你的代理地址>` |

**为什么要在这一步就检查 `GOPROXY`**：`go install` 与 `go test` 都要下载依赖。网络受限时它们表现为「卡住不动、最后超时」，而不是给出一个明确的错误——先确认通道可用，后面出问题时就少一类可能。

## 从零到第一个 PR：完整步骤

### 第 1 步：派生并克隆

1. 派生（fork）[项目仓库](https://github.com/gohugoio/hugo/)。
2. 克隆你的派生仓库，然后进入仓库目录：

   ```bash
   git clone https://github.com/<你的用户名>/hugo.git
   cd hugo
   ```

   **你应当看到什么**：`git clone` 结束时不报错，`cd hugo` 之后 `ls`（Windows 用 `dir`）能看到 `go.mod` 等文件，`git remote -v` 里的地址是**你自己的 GitHub 用户名**。仓库不小，克隆比一般项目慢是正常的。

   > [!TIP]
   > 第 2 步的 URL 一定要用**你 fork 出来的地址**（`<你的用户名>/hugo.git`），不是上游地址。克隆成上游地址的话，第 8 步的 `git push` 会因为没权限而失败。

### 第 2 步：新建分支

3. 新建一个分支，分支名要有描述性，并包含对应的议题编号。新增功能时：

   ```bash
   git checkout -b feat/implement-some-feature-99999
   ```

   修复缺陷时：

   ```bash
   git checkout -b fix/fix-some-bug-99999
   ```

   **你应当看到什么**：`git branch --show-current` 打印出你刚建的分支名。提交前再用一次这条命令确认自己没有在 `master` 上改——这是新手最常见的一类返工。

### 第 3 步：修改代码

4. 修改代码。改动尽量小：一个 PR 只解决一件事，审查通过的速度会快很多。

### 第 4 步：构建并安装

5. 构建并安装。构建标准版本：

   ```bash
   CGO_ENABLED=0 go install
   ```

   构建 deploy 版本（自 v0.159.2 起）：

   ```bash
   CGO_ENABLED=0 go install -tags withdeploy
   ```

   构建扩展（extended）版本，需要先安装 C 编译器，例如 [GCC](https://gcc.gnu.org/) 或 [Clang](https://clang.llvm.org/)：

   ```bash
   CGO_ENABLED=1 go install -tags extended
   ```

   构建扩展版加 deploy 版本，同样需要 C 编译器：

   ```bash
   CGO_ENABLED=1 go install -tags extended,withdeploy
   ```

   四条命令怎么选，看你要验证的是哪部分行为：

   | 场景 | 命令 | 说明 |
   | --- | --- | --- |
   | 日常改模板、函数、CLI 逻辑 | `CGO_ENABLED=0 go install` | 最快，不需要 C 编译器 |
   | 验证 `hugo deploy` 相关行为 | `CGO_ENABLED=0 go install -tags withdeploy` | 上游标注自 v0.159.2 起可用 |
   | 验证扩展版才有的能力（例如把 Sass/SCSS 编译成 CSS） | `CGO_ENABLED=1 go install -tags extended` | 必须先有 C 编译器 |
   | 同时要 deploy 与扩展能力 | `CGO_ENABLED=1 go install -tags extended,withdeploy` | 同上 |

   **你应当看到什么**：命令在几分钟内结束且不打印 `FAIL`。构建完成后，`go install` 把二进制写进 Go 的 bin 目录——用 `go env GOPATH` 查它的位置，其下的 `bin` 就是目标目录；这个目录默认不在 `PATH` 里。

   **验证你装的确实是刚构建的版本**：

   ```bash
   go env GOPATH          # 记下输出，例如 C:\Users\you\go
   $(go env GOPATH)/bin/hugo version    # macOS / Linux
   & "$(go env GOPATH)\bin\hugo.exe" version   # Windows PowerShell
   ```

   **你应当看到什么**：输出版本号与你所在的提交大致同期；**扩展版**的输出里还带 `+extended` 字样。看不到 `+extended` 说明你装的是标准版——先别慌，这是选择问题，不是错误。

   > [!WARNING]
   > 如果你的机器上**已经装过** Hugo（例如用包管理器安装的），请优先用上面的绝对路径调用刚构建的二进制。直接敲 `hugo` 调到的可能是旧的那一份，于是你会以为「改动没生效」。

### 第 5 步：测试

6. 测试你的改动：

   ```bash
   go test ./...
   ```

   **你应当看到什么**：结尾是 `ok` 或 `no test files` 的逐包清单，最后一行没有 `FAIL`。Hugo 仓库的测试量不小，第一次跑要下载依赖并编译测试二进制，耗时会明显长于后续几次。

   **只想知道自己改的包有没有问题**，可以只跑相关的包——把 `<包目录>` 换成你实际改动的那个目录，写法是 `./` 加上它在仓库里的相对路径：

   ```bash
   go test ./<包目录>/
   ```

   **什么时候必须跑全量**：改动跨包（例如同时动了 `tpl/` 与 `common/`）、或动了构建与配置加载这类底层逻辑时。局部测试通过但全量失败，是跨包改动的典型表现。

### 第 6 步：提交

7. 提交改动，并写清楚提交信息（约定见下一节）。

   ```bash
   git add -A
   git commit -m "tpl/strings: Create wrap function

   The strings.Wrap function wraps a string into one or more lines,
   splitting the string after the given number of characters, but not
   splitting in the middle of a word.

   Fixes #99998
   Closes #99999"
   ```

   **你应当看到什么**：`git log --oneline -1` 打印出一行形如 `a1b2c3d tpl/strings: Create wrap function`。冒号前的包名与冒号后的说明都在，就说明格式对了。

### 第 7–10 步：推送、开 PR、等审查

8. 把新分支推送到你的派生仓库：

   ```bash
   git push -u origin feat/implement-some-feature-99999
   ```

   **你应当看到什么**：终端给出一个 `Create a pull request` 的 GitHub 链接，以及类似 `* [new branch] feat/... -> feat/...` 的一行。

9. 访问[项目仓库](https://github.com/gohugoio/hugo/)，创建拉取请求（PR）。正文里写清：解决哪个议题、怎么复现、怎么验证。
10. 项目维护者会审查你的 PR，可能会要求修改。维护者合并 PR 之后，你可以删除该分支。

> [!TIP]
> 维护者要求修改时，**不要关掉 PR 再开一个**。在同一条分支上继续 `git add` + `git commit` + `git push`，PR 会自动更新——审查历史也会保持完整。

### 提交信息约定

- 第一行是摘要，通常不超过 50 个字符，之后空一行。摘要以包名开头，后接冒号、空格，以及以大写字母开头的简短说明；使用祈使句的现在时态，具体要求见[提交信息指南](https://github.com/gohugoio/hugo/blob/master/CONTRIBUTING.md#git-commit-message-guidelines)。
- 可选地提供详细描述，每行不超过 72 个字符，之后空一行。
- 添加一行或多行 `Fixes`、`Closes` 关键字，各自单独成行，并引用本次改动解决的[议题](https://github.com/gohugoio/hugo/issues)。

例如：

```bash
git commit -m "tpl/strings: Create wrap function

The strings.Wrap function wraps a string into one or more lines,
splitting the string after the given number of characters, but not
splitting in the middle of a word.

Fixes #99998
Closes #99999"
```

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| `go: command not found` / 「不是内部或外部命令」 | Go 没装，或装了但没重开终端 | 装好 Go 后**重开终端**，用 `go version` 验证 |
| `go install` 长时间卡住、最后超时 | 模块代理不可达 | 用 `go env GOPROXY` 看当前值，改成可用的代理（`go env -w GOPROXY=<地址>`）；先确认通道再重试 |
| 构建成功，但敲 `hugo` 跑的还是旧行为 | `go install` 的 `bin` 目录不在 `PATH`，`hugo` 命中的是另一份安装 | 用 `go env GOPATH` 找到新二进制，用完整路径调用；确认输出里有 `+extended`（如果你构建的是扩展版） |
| 改完代码，`hugo` 的行为没有任何变化 | 同上的「调用了另一份二进制」，或忘了重新 `go install` | 每次改完都重新 `go install`，再用完整路径调用 |
| `go test ./...` 出现 `FAIL`，但你的包单独测是过的 | 改动跨包，影响到了别处 | 读 `FAIL` 那一行的包路径，定位到真正受影响的包；这正是要跑全量的原因 |
| `git push` 报权限错误 | 第 2 步克隆的是上游地址而不是自己的 fork | `git remote -v` 检查；把 `origin` 指到自己的 fork，或改用 fork 的 URL 重新克隆 |
| 在默认分支上直接改并提交了 | 忘了第 2 步建分支 | 先建分支再把这一个提交搬过去：`git branch fix/描述-编号` → `git reset --hard origin/master` → `git checkout fix/描述-编号`（**`reset --hard` 会丢弃工作区未提交的改动，执行前先 `git status` 确认干净**） |
| 模板/短代码相关的改动一构建就整站报错 | 改的是模板或内容里的短代码定界符写法 | 见[故障排查](/troubleshooting/)；本站内容里展示短代码语法必须转义，写法见[参与文档](/contribute/documentation/#转义与短代码) |
| 改了 Hugo 源码却不确定从哪验证 | 没有可复现的最小站点 | 用[快速开始](/getting-started/quick-start/)三分钟建一个最小站点，把改动前后的输出对比一遍 |

## 本站（中文文档站）与上游的区别

- **本文以上游口径为准**：仓库地址、分支命名、构建命令、提交信息约定都指向上游 Hugo 项目。改 Hugo 源码请提到上游。
- **要改的是本站的中文译文、教学层、模板或样式**，入口是[参与文档](/contribute/documentation/)与[参与贡献](/contribute/)首页；本站的源码仓库、验收脚本与自查清单都写在那两页。
- **不变的一点**：无论改上游还是改本站，「在本地构建并通过测试」都是提交前的必要条件。提交一个构建不过的 PR，只会让审查者先帮你修环境问题。

## 卡住时从哪里查

- 报错看不懂、命令找不到 → [故障排查](/troubleshooting/) 按现象查；
- 环境与安装的完整说明（含各平台）→ [安装 Hugo](/installation/)；
- 想知道某条命令有哪些参数 → [命令](/commands/)。
