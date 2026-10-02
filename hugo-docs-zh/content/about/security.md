+++
title = "安全模型"
linkTitle = "安全模型"
description = "Hugo 的安全边界、运行时与依赖安全，以及模板信任模型；附本机实测的默认策略核对方法。"
date = 2026-10-01
weight = 40
source = "https://gohugo.io/about/security/"

[params.teach]
difficulty = "进阶"
time = "15–20 分钟"
prereq = [
  "跑通过一次构建，能看懂终端报错（`hugo --renderToMemory` 退出码为 0）。",
  "知道模板放在 `layouts/`、内容放在 `content/`，以及前置元数据的作用。",
]
outcomes = [
  "说出 Hugo 的信任边界：哪些输入可信、哪些不可信，以及「内联短代码」为什么是那个例外；",
  "用 `hugo config --printZero` 打印自己站点实际生效的默认安全策略，并核对某项设置到底有没有生效；",
  "遇到 `access denied` 一类报错时，知道该改哪个键、放宽它的代价是什么；",
  "判断什么时候可以用 `safe` 系列函数、什么时候绝对不要用。",
]
next = ["/configuration/security/", "/about/license/", "/troubleshooting/"]
+++

## 这一页解决什么问题

这一页回答一个具体的问题：**把构建流程交给 Hugo，边界画在哪里**。上游文档把答案拆成四块——安全边界、运行时安全、依赖安全、Web 应用安全——本页保留这四块，并补上一节可自己复现的实测：把「模板可信、内容不可信」这类原则对应到具体的配置键，你就能验证自己站点上到底有没有这道防线。

如果你是站点作者，本页的实用部分是[你这一版实际生效的默认策略](#你这一版实际生效的默认策略实测)与[常见坑](#常见坑)；如果你要写主题或收别人的内容，前四节值得从头读。

## 安全边界

- `layouts` 中的模板是可信的。
- `archetypes`、`assets`、`resources`、`data`、`i18n` 和 `static` 中的资源是可信的。
- `content` 中的内容，以及由内容适配器在 `content` 中生成的内容，是不可信的；唯一例外是启用内联短代码时。对于内容适配器，这一范围仅限于适配器的输出结果。
- 开发服务器 `hugo server` 及其 livereload 脚本是可信的，仅用于**本地**开发。
- Hugo 没有线上生产服务器；任何导致构建失败的畸形输入（例如格式错误的内容前置元数据）都不被定义为拒绝服务（DoS）。这也包括触发运行时错误的输入，例如 `fatal error: stack overflow`；这类问题请作为[缺陷](https://github.com/gohugoio/hugo/issues)报告。

**怎么看这几条**：可信 = 你写的模板与配置可以调用任意能力；不可信 = 内容里的东西默认不获得这些能力。所以「内容作者能做什么」取决于你开了哪些例外，而不是取决于内容本身写了什么。

## 运行时安全

Hugo 生成的是静态网站：最终输出直接在浏览器中运行，并与所集成的各类 API 交互。但在开发和构建站点期间，`hugo` 可执行文件本身就是运行时环境。

保障运行时安全是一项复杂的任务。Hugo 通过稳健的沙箱方案和带默认保护的严格安全策略来应对，主要特性包括：

- 虚拟文件系统：Hugo 使用虚拟文件系统限制文件访问。只有主项目（而非外部组件）可以访问项目根目录之外的文件或目录。
- 只读访问：用户自定义组件对文件系统只有只读权限，防止意外修改。
- 受控的外部二进制文件：Hugo 会为 Asciidoctor 支持等功能使用外部二进制文件，但这些文件经过严格预定义并带有特定参数，且默认禁用。安全策略中说明了这些限制。
- 不执行任意命令：为降低风险，Hugo 有意不实现那些允许用户执行任意操作系统命令的通用函数。
- 务实的默认值：默认安全策略旨在平衡安全性与可用性，让常见工作流开箱即用，同时把更敏感的能力留作显式启用。这些默认值可能在今后的版本中收紧，但每个项目最终有责任审阅策略，并按自身的信任模型与需求进行调整。

沙箱与严格默认值的这种组合，有效降低了 Hugo 构建过程中潜在的安全漏洞。

## 你这一版实际生效的默认策略（实测）

上面五条不是口号，它们就是配置项。把默认值打印出来自己核对一遍：

```bash
hugo config --printZero | grep -A 20 '^\[security\]'    # macOS / Linux
```

```powershell
hugo config --printZero | Select-String '^\[security\]' -Context 0,20   # Windows PowerShell
```

**实测环境**：Hugo v0.167.0（windows/amd64，extended），站点配置未覆盖任何 `security.*` 键，因此下表的值就是内置默认值。

| 配置键 | 实测默认值 | 它实际挡住什么 |
| --- | --- | --- |
| `security.enableInlineShortcodes` | `false` | 内容里的内联短代码不执行——「内容不可信」的唯一例外默认关闭 |
| `security.exec.allow` | `^(dart-)?sass$`、`^go$`、`^git$`、`^node$`、`^postcss$` | 只有这几个外部程序能被调用；AsciiDoc、Pandoc、reStructuredText、Tailwind CSS CLI 不在清单里，用到就构建失败 |
| `security.funcs.getenv` | `^HUGO_`、`^CI$` | 模板只能读 `HUGO_*` 与 `CI` 两类环境变量，其它一律拒绝 |
| `security.http.methods` | `GET`、`POST` | `resources.GetRemote` 只能用这两类 HTTP 方法 |
| `security.http.urls` | 放行非 IP 主机名的 `https?://` 地址，拒绝 IP 主机、`localhost`、URL 里带凭据的地址 | 不能抓本机、内网与裸 IP 地址；连接时还会拒绝解析到回环、私有、链路本地地址的主机 |
| `security.http.proxyFromEnvironment` | `false` | `HTTP_PROXY` / `HTTPS_PROXY` 默认不生效（该键 0.166.0 新增） |
| `security.node.permissions.allowWrite` | `[]`（空） | Node.js 工具对文件系统只读——「只读访问」这条在配置里直接看得到 |
| `security.allowContent` | 拒绝 `text/html` 与 `text/org` | 放进 `content/` 的 `.html`、`.org` 文件默认不被接受，因为这类内容会被原样渲染，可能执行任意 JavaScript |

**你应当看到什么**

- 输出里有 `[security]` 分区，键值形如上表；你项目里改过的项会显示成你写的值——这正是核对「配置到底生效没有」的办法；
- 实测：不带 `--printZero` 时，`hugo config` 只印出空的 `[security]` 表头，看不到任何默认值，很容易误判成「没配置」；
- 被策略拒绝时**不是静默跳过，而是构建失败**，并把当前生效的整份安全配置打印在报错里（上游说明见[配置安全](/configuration/security/)）。

## 依赖安全

Hugo 使用 Go 模块管理依赖，并编译为静态二进制文件。Go 模块会生成 `go.sum` 文件，这是一项关键的安全特性：该文件像数据库一样，存储所有依赖（包括间接引入的传递依赖）的预期加密校验和。

扩展 Go 模块功能的 Hugo 模块同样会生成 `go.sum` 文件。为确保依赖完整性，请把这个 `go.sum` 文件提交到版本控制中。如果 Hugo 在构建过程中检测到校验和不匹配，构建就会失败，这表明可能存在篡改项目依赖的尝试。

**这对你意味着什么**：`go.sum` 记录的是所有依赖（含间接引入的传递依赖）的预期校验和，是判断「依赖有没有在中间被换过」的依据，所以别把它写进 `.gitignore`。

## Web 应用安全

Hugo 的安全理念植根于既有安全标准，主要对齐 OWASP 定义的威胁。对于 HTML 输出，Hugo 遵循明确的信任模型：假设模板与配置的作者（即开发者）可信，而提供给这些模板的数据则被视为不可信。这一区分对理解 Hugo 如何处理潜在安全风险至关重要。

为避免开发者确知安全的数据被意外转义，Hugo 提供 `safe` 系列函数，例如 `safe.HTML`。这些函数允许开发者显式把数据标记为可信，从而绕过默认的转义机制；当数据由可靠来源生成或取得时，这一点很重要。但存在一个例外：启用内联短代码后，您即隐含地信任了短代码中的逻辑，以及内容文件中包含的数据。

需要记住的是，Hugo 是静态站点生成器。这一架构选择消除了动态用户输入带来的复杂性与漏洞，从而显著缩小攻击面：与动态网站不同，Hugo 生成静态 HTML 文件，降低了实时攻击的风险。在内容方面，Hugo 默认的 Markdown 渲染器已配置为净化潜在不安全的内容，可移除或转义潜在恶意的代码或脚本；如果您对内容来源的安全性有很高信心，也可以重新配置这一设置。

本质上，Hugo 通过在开发者与数据之间建立清晰的信任边界来优先保证输出安全：默认情况下偏向谨慎，净化潜在不安全的内容并转义数据；开发者可以通过 `safe` 系列函数和配置设置调整这些默认行为，但必须清楚理解由此带来的安全影响。Hugo 的静态站点生成模式消除了动态漏洞，进一步强化了它的安全态势。

## 你需要做什么

- **站点作者与内容编辑**：通常什么都不用改。默认策略就是为这个场景调的；只有用到被拒的功能时，报错会指出缺哪一项。
- **模板与主题作者**：谨慎使用 [`safe`](/functions/safe/) 系列函数（例如 [`safe.HTML`](/functions/safe/html/)）。它们等于向 Hugo 声明「这段数据可信」，用错位置就是自己拆掉转义防线。
- **内容来源不完全可信时**：保持 `enableInlineShortcodes = false`，并让 `markup.goldmark.renderer.unsafe` 留在默认的 `false`。要开启任何一项，先想清楚「谁有权往 `content/` 里写文件」。
- **做安全评估时**：本页说明的是**构建期**的信任模型。产物是静态文件，最终风险主要取决于托管环境，以及页面里引入的第三方脚本。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 构建失败，报错含 `access denied: "HOME" is not whitelisted in policy "security.funcs.getenv"`，后面还跟着整份 `[security]` 配置 | `os.Getenv` 只能读放行清单里的环境变量，默认只有 `^HUGO_`、`^CI$`。实测 v0.167.0：**直接构建失败，不是返回空字符串** | 把变量名改成 `HUGO_` 前缀；确需读其它变量，按 [os.Getenv](/functions/os/getenv/) 的例子加入 `security.funcs.getenv` |
| 内容里写的原始 HTML 没出现在页面上，产物里是 `<!-- raw HTML omitted -->` | `markup.goldmark.renderer.unsafe` 默认为 `false`，Markdown 中的原始 HTML 被替换为注释。实测 v0.167.0：**构建成功、退出码 0**，所以很容易漏看 | 确认 `content/` 内容可信后再开启；本站自己的 `hugo.toml` 设了 `unsafe = true`（翻译正文需要透传原始 HTML），这与上游默认值不同，别照抄。说明见[配置 Markdown](/configuration/markup/) |
| `resources.GetRemote` 抓本机开发服务器或内网地址失败 | 默认 `security.http.urls` 拒绝 IP 主机与 `localhost`，并在连接时拒绝解析到回环、私有、链路本地地址的目标 | 确实需要时按[配置安全](/configuration/security/)覆盖 `http.urls`。上游明确：**覆盖之后那套地址校验会关闭**，因此只放行你信任的地址 |
| 设置了 `HTTPS_PROXY`，`resources.GetRemote` 依然不通 | `security.http.proxyFromEnvironment` 默认 `false`（实测 v0.167.0） | 显式设为 `true`。开启后 Hugo 连接的是代理而不是目标地址，`http.urls` 的地址校验不再适用 |
| AsciiDoc / Pandoc / reStructuredText 内容构建失败 | 这三种内容格式要调用外部程序，默认不在 `security.exec.allow` 里 | 先装对应程序，再把名字加入清单，见[内容格式](/content-management/formats/) |
| 把 `.html` 文件放进 `content/` 后构建失败 | 默认 `security.allowContent` 拒绝 `text/html` 与 `text/org`，因为这类内容会被原样渲染，可执行任意 JavaScript | 换用其它内容格式；确需开启时先确认内容全程可信，见[配置安全](/configuration/security/) |
| 模板里用了 `safe.HTML`，页面上出现了不该出现的脚本 | `safe` 系列显式绕过转义，等价于声明数据可信 | 只对可信来源使用；不要用 `safe` 系列去「修好」内容里的报错 |
| 构建偶发 `fatal error: stack overflow` | 上游明确把这类触发运行时错误的畸形输入排除在 DoS 定义之外，按缺陷处理 | 带最小复现项目和 `hugo env` 输出提交到 <https://github.com/gohugoio/hugo/issues> |

更多排查入口见[故障排查](/troubleshooting/)；想在上线前给整站做一次体检，见[审计](/troubleshooting/audit/)。

## 配置

上述安全策略集中在 `security` 配置分区中，例如外部二进制文件在何种条件下可以被调用。上游文档把详细设置放在 `/configuration/security/` 页面；本站配置相关的入门内容见[配置 Hugo](/configuration/)。

改这些键时要记住两件事：**放宽一条就是削掉一道防线**，而且**改完可以用 `hugo config --printZero` 当场确认它生效了**（方法见上文[你这一版实际生效的默认策略](#你这一版实际生效的默认策略实测)）。
