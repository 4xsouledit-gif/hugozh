+++
title = "安全配置"
linkTitle = "安全配置"
description = "用允许列表限制外部命令、远程通信与 Node.js 权限。"
date = 2026-10-01
weight = 260
source = "https://gohugo.io/configuration/security/"
+++

## 这一页解决什么问题

Hugo 用**允许列表（allowlist）**限制构建过程中能做的事情：能不能调用外部命令、能不能读某个环境变量、能不能请求某个 URL、Node.js 工具能读写哪些路径。默认收得很紧——**构建一旦碰到未放行的功能就失败**，并给出明确错误。

这一页要读的重点不是「怎么全部放开」，而是**报错说某个操作被拒绝时，该动哪个键**。放宽任何一条都等于削弱这道防线，`http.urls` 与 `exec.allow` 尤其如此。

## 什么时候需要这些设置

| 设置 | 什么时候需要 | 改错了会看到什么现象 |
| --- | --- | --- |
| `exec.allow` | 使用 `css.TailwindCSS`、`css.Sass`、`js.Build` 等需要外部可执行文件的函数 | 忘了放行 → 构建失败，报错里会出现被拒绝的程序名；放行过宽（如 `.*`）→ 构建期任何程序都可能被调用 |
| `funcs.getenv` | 模板里用 `os.Getenv` 读自定义环境变量（默认只允许 `^HUGO_` 与 `^CI$`） | 读未放行的变量 → **构建失败**，报错为 `access denied: "HOME" is not whitelisted in policy "security.funcs.getenv"`（实测 v0.167.0；上游也明确「未放行的功能会让构建失败并给出详细消息」）。要放行就把它加进 `allow` 清单，例如 `['^HUGO_', '^CI$', '^MY_']` |
| `http.urls` / `http.methods` | 用 `resources.GetRemote` 抓取远程资源 | 未放行的地址 → 构建失败；反过来，**一旦自定义 `http.urls`，默认那套「拒绝解析到回环/私有地址」的校验就关闭了**（上游明确） |
| `http.proxyFromEnvironment` | 需要通过 `HTTP_PROXY` / `HTTPS_PROXY` 走代理（国内网络环境常见） | 开启后 Hugo 连接的是代理而不是目标地址，`http.urls` 的地址校验不再适用 |
| `allowContent` | 想允许或拒绝某种内容格式被原样渲染 | 默认拒绝 `text/html` 与 `text/org`，因为它们会被原样渲染、可能执行任意 JavaScript；改动前先确认内容可信 |
| `enableInlineShortcodes` | 需要在内容里直接写内联短代码 | 开启后内容作者可以在页面中执行短代码，属于信任边界的扩大 |
| `node.permissions.*` | 使用 Tailwind 等 Node.js 工具 | `allowWrite` 默认为空（不允许写文件）；放行写权限等于允许构建过程改动文件系统 |

## 默认配置

Hugo 内置的安全策略通过允许列表（allowlist）来配置，用于限制对 `os/exec`、远程通信等操作的访问。默认情况下访问是受限的：如果某次构建试图使用允许列表中未包含的功能，构建就会失败，并给出详细的错误信息。

Hugo 的默认安全配置如下：

```toml
[security]
allowContent = ['! ^text/html$', '! ^text/org$']
enableInlineShortcodes = false

[security.exec]
allow = ['^(dart-)?sass$', '^go$', '^git$', '^node$', '^postcss$']
osEnv = ['(?i)^((HTTPS?|NO)_PROXY|PATH(EXT)?|APPDATA|TE?MP|TERM|GO\w+|(XDG_CONFIG_)?HOME|USERPROFILE|SSH_AUTH_SOCK|DISPLAY|LANG|SYSTEMDRIVE|PROGRAMDATA)$']

[security.funcs]
getenv = ['^HUGO_', '^CI$']

[security.http]
mediaTypes = []
methods = ['(?i)GET|POST']
proxyFromEnvironment = false
urls = ['(?i)^https?://[a-z0-9]', '! (?i)^https?://\d+\.', '! (?i)localhost', '! (?i)^https?://[^/?#]*@']

[security.node.permissions]
allowAddons = ['tailwindcss']
allowChildProcess = ['tailwindcss']
allowRead = ['.']
allowWorker = ['tailwindcss']
allowWrite = []
disable = false
```

## 设置项

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `allowContent` | `[]string` | `['! ^text/html$', '! ^text/org$']` | （自 v0.162.0 起）匹配 `content` 目录中允许的[内容格式](/content-management/content-formats/)之媒体类型的正则表达式切片。默认拒绝两种格式：Emacs Org Mode（`text/org`）与 HTML（`text/html`），因为 Hugo 会原样渲染其内容，可能允许任意 JavaScript 执行。 |
| `enableInlineShortcodes` | `bool` | `false` | 是否启用[内联短代码](/shortcodes/)。 |
| `exec.allow` | `[]string` | 见默认配置 | 匹配允许 Hugo 运行的外部可执行文件名的正则表达式切片。 |
| `exec.osEnv` | `[]string` | 见默认配置 | 匹配允许 Hugo 访问的操作系统环境变量名的正则表达式切片。 |
| `funcs.getenv` | `[]string` | `['^HUGO_', '^CI$']` | 匹配允许 `os.Getenv` 函数访问的操作系统环境变量名的正则表达式切片。 |
| `http.methods` | `[]string` | 允许 `GET` 与 `POST`（不区分大小写） | 匹配 `resources.GetRemote` 函数允许使用的 HTTP 方法的正则表达式切片。 |
| `http.mediaTypes` | `[]string` | 空 | 仅适用于 `resources.GetRemote` 函数：匹配 Hugo 信任的 HTTP 响应 `Content-Type` 的正则表达式切片，命中时跳过用于媒体类型检测的文件内容分析。 |
| `http.proxyFromEnvironment` | `bool` | `false` | （自 v0.166.0 起）`resources.GetRemote` 函数是否遵循 `HTTP_PROXY`、`HTTPS_PROXY` 与 `NO_PROXY` 环境变量。使用代理时 Hugo 连接的是代理而不是目标地址，因此 `http.urls` 所述的解析地址校验不再适用。 |
| `http.urls` | `[]string` | 见默认配置 | 匹配 `resources.GetRemote` 函数允许访问的 URL 的正则表达式切片。默认允许列表拒绝主机名为 IP 地址或 `localhost` 的 URL，并在连接时校验解析出的地址，拒绝回环、私有、链路本地等非公网地址（例如解析到云元数据端点的主机名）。一旦覆盖 `http.urls`，这项校验即关闭，因为新列表可能有意允许访问本地网络中的主机，例如开发服务器。 |
| `node.permissions.disable` | `bool` | `false` | （自 v0.161.0 起）是否禁用 Node.js 的权限模型。为 `false` 时，Hugo 会带 `--permission` 标志运行 Node.js 工具，把它们的文件系统与资源访问限制在下面显式允许的范围内。 |
| `node.permissions.allowAddons` | `[]string` | `['tailwindcss']` | （自 v0.161.0 起）允许加载原生插件的 Node.js 工具名切片，对应 `--allow-addons`。 |
| `node.permissions.allowChildProcess` | `[]string` | `['tailwindcss']` | （自 v0.161.0 起）允许派生（spawn）子进程的 Node.js 工具名切片，对应 `--allow-child-process`。 |
| `node.permissions.allowRead` | `[]string` | `['.']` | （自 v0.161.0 起）允许 Node.js 工具读取的文件系统路径切片，对应 `--allow-fs-read`。路径相对于工作目录，`"."` 表示工作目录本身，`"*"` 表示允许所有路径。同一组路径也限制 `js.Build`、`js.Batch`、`css.Build` 与 `css.Sass` 能从 `assets` 目录之外（例如 `node_modules`）导入什么，且该限制与 `node.permissions.disable` 无关。Node.js 会跟随指向允许路径之外的符号链接，因此允许路径中若存在目标落在集合之外的链接，Hugo 会让构建失败；把链接目标加入列表即可放行。该检查每次构建只运行一次；若同时给某个允许路径授予写权限，Node.js 工具可能在构建期创建绕过检查的链接。 |
| `node.permissions.allowWorker` | `[]string` | `['tailwindcss']` | （自 v0.161.0 起）允许派生工作线程的 Node.js 工具名切片，对应 `--allow-worker`。 |
| `node.permissions.allowWrite` | `[]string` | 空 | （自 v0.161.0 起）允许 Node.js 工具写入的文件系统路径切片，对应 `--allow-fs-write`。路径相对于工作目录，`"."` 表示工作目录本身，使用 `"*"` 表示允许所有路径。 |

## 否定规则

> 否定规则自 v0.161.0 起可用。

允许列表中的任何模式都可以通过在开头加上感叹号（`!`）和一个空格来取反，从而变成一条拒绝规则。拒绝规则优先于允许规则。如果一份允许列表完全由拒绝规则组成，它就隐式允许所有未被拒绝的内容；而空允许列表会拒绝一切。

例如，要允许所有 URL，只拒绝指向 `evil.example.org` 的那些：

```toml
[security.http]
urls = ['.*', '! ^https?://evil\.example\.org']
```

把某份允许列表设为字符串 `none`，会彻底禁用与之关联的功能。

## 环境变量

除了配置文件，你也可以用环境变量覆盖项目配置。例如，要禁止 `resources.GetRemote` 访问任何 URL：

```bash
export HUGO_SECURITY_HTTP_URLS=none
```

## 示例

下面的配置缩小了远程访问范围：只允许抓取 `example.org`，其余 URL 一律拒绝，同时明确限制 `http.urls` 带来的地址校验豁免范围。

```toml
[security]
allowContent = ['! ^text/html$', '! ^text/org$']

[security.http]
methods = ['(?i)GET']
mediaTypes = ['^application/json$']
urls = ['^https://example\.org/']
```

## 延伸阅读

- [配置](/configuration/)
- [内容格式](/content-management/content-formats/)
- [短代码](/shortcodes/)

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| 构建失败，提示某个可执行文件被拒绝 | 该程序不在 `exec.allow` 中 | 按报错里的程序名加一条精确正则（例如 `^tailwindcss$`），不要直接写 `.*` |
| 模板里读环境变量总是空 | `os.Getenv` 只放行 `funcs.getenv` 匹配到的变量名（默认 `^HUGO_`、`^CI$`） | 给变量名加 `HUGO_` 前缀，或显式放行；这两条都可先用 `hugo config` 核对 |
| `resources.GetRemote` 报 URL 被拒绝 | 该地址不在 `http.urls` 允许列表内 | 加一条精确规则；注意自定义后原有的私网地址校验会关闭 |
| 想彻底关掉某项功能 | —— | 把对应允许列表设为字符串 `none`（上游说明），例如 `HUGO_SECURITY_HTTP_URLS=none` |
| 否定规则看起来没生效 | 拒绝规则优先于允许规则；完全由否定规则组成的列表会隐式允许其余内容，空列表则拒绝一切 | 检查 `! ` 前缀与列表组成 |
| 报错看不懂 | 报错会点名被拒绝的操作，但不会替你决定该放宽哪一条 | 见[故障排查](/troubleshooting/)；放宽前先评估信任边界 |

更多排查入口见[故障排查](/troubleshooting/)。
