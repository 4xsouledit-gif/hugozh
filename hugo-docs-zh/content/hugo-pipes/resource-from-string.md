+++
title = "从字符串创建资源"
linkTitle = "从字符串创建资源"
description = "用 resources.FromString 从字符串创建资源并发布到目标路径，适合 robots.txt、security.txt 这类内容来自配置的文件。"
date = 2026-10-01
weight = 80
source = "https://gohugo.io/hugo-pipes/resource-from-string/"

[params.teach]
difficulty = "参考"
time = "15–20 分钟"
prereq = [
  "读过[简介](/hugo-pipes/introduction/)，知道资源要经 `Publish` / `Permalink` / `RelPermalink` 才会被发布",
  "会在项目配置里写 `[params]`，并能在模板中读取 `site.Params`",
]
outcomes = [
  "用字符串生成一个真实文件（例如 `security.txt`）并发布到指定路径",
  "解释目标路径为什么同时决定发布位置与缓存键",
  "在字符串里含模板动作时，知道要用 `resources.ExecuteAsTemplate` 才会被执行",
]
next = ["/hugo-pipes/resource-from-template/", "/content-management/", "/functions/resources/fromstring/"]

+++

## 这一页解决什么问题

有些文件的**内容来自站点配置，而不是磁盘上的源文件**：`robots.txt` 里要写站点地图地址，`security.txt` 里要写联系人邮箱，结构化数据要拼进页面。为它们单独维护一份文件，就多了一处需要同步修改的地方。

`resources.FromString` 把一段字符串直接变成资源，于是这段内容可以「由模板算出来」，同时仍然享受资源的发布与缓存机制。

## 方法签名与用途

`resources.FromString` 从一个字符串创建资源，并以目标路径作为缓存键：

```text
resources.FromString TARGETPATH STRING
```

返回值类型是 `resource.Resource`，因此它可以继续参与管道，例如压缩或指纹。它适合生成那些内容来自配置或模板变量、而非来自磁盘文件的资源，典型的例子是 `security.txt` 与 `robots.txt`。

### 返回值与边界

| 情形 | 会怎样 |
| --- | --- |
| 正常 | 返回一个资源对象，可以 `Publish`、取 `Permalink` / `RelPermalink`、或继续管道 |
| 目标路径为空字符串 | 资源在内存中存在，但**没有发布路径**；这种写法只在上游另有 `ExecuteAsTemplate` 指定最终路径时才有意义 |
| 字符串为空 | 发布出去是个 0 字节文件——通常说明模板变量没取到值，值得当成错误来查 |
| 字符串含模板动作（`{{ ... }}`） | 会**原样输出**，不会被执行；需要执行时见下文「字符串中包含模板动作时」 |
| 同一个目标路径被写两次 | 缓存键相同，后一次调用会复用先前的结果，可能不是你想要的 |

## 基本用法

下面的例子根据站点配置里的邮箱生成一个 `security.txt`：

```go-html-template
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ with resources.FromString ".well-known/security.txt" $content }}
  {{ .Publish }}
{{ end }}
```

字符串中的换行需要显式写出，例如 `printf` 里的 `\n`；否则生成的文件内容会挤成一行。

## 在管道中发布

如果想保持在一条管道里，可以用发布函数作为收尾：

```go-html-template
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ resources.FromString ".well-known/security.txt" $content | resources.Publish }}
```

除了 `Publish`，`Permalink` 与 `RelPermalink` 方法同样会触发资源发布；如果只是想把内容写进当前页面而不生成文件，可以改用 `.Content`。

## 字符串中包含模板动作时

字符串里的模板动作不会被自动执行。遇到这种情况，可以先用 `resources.FromString` 把字符串变成资源，再用 `resources.ExecuteAsTemplate` 指定最终路径并执行其中的模板动作：

```go-html-template
{{ $string := `Contact: mailto:{{ site.Params.email }}
Expires: {{ (now.AddDate 1 0 0).UTC.Format "2006-01-02T15:04:05Z" }}
` }}
{{ $r := resources.FromString "" $string }}
{{ $r = $r | resources.ExecuteAsTemplate ".well-known/security.txt" . }}
{{ $r.Publish }}
```

这里先用空的目标路径把字符串包成资源，最终发布路径交由模板执行环节指定，这也是上游文档采用的写法。关于执行模板资源的完整说明，见[从模板创建资源](/hugo-pipes/resource-from-template/)。

**为什么不能一步到位**：`FromString` 只负责「字符串 → 资源」，不认识 Go 模板语法；负责执行模板的是 `ExecuteAsTemplate`，它同时接受一个新的目标路径。两步分开写，正是为了把「内容来源」与「发布位置」这两件事解耦。

## 完整可运行示例

这个示例生成并发布一个真实的 `security.txt`，同时页面上也引用同一份内容，方便你对照。

**① 建项目并进入目录**：

```bash
hugo new project string-demo
cd string-demo
```

**② 在项目配置 `hugo.toml` 末尾加上邮箱**：

```toml
[params]
email = 'webmaster@example.org'
```

**③ 新建首页模板** `layouts/home.html`：

```go-html-template {file="layouts/home.html"}
{{ $content := printf "Contact: mailto:%s\n" site.Params.email }}
{{ resources.FromString ".well-known/security.txt" $content | resources.Publish }}
<!doctype html>
<html lang="zh-cn">
  <head>
    <meta charset="utf-8">
    <title>FromString 演示</title>
  </head>
  <body>
    <h1>已生成 .well-known/security.txt</h1>
    <pre>{{ $content }}</pre>
  </body>
</html>
```

**④ 构建**：

```bash
hugo
```

### 你应当看到什么

- 终端没有 `ERROR`；
- 磁盘上出现 `public/.well-known/security.txt`，内容只有一行：

  ```text
  Contact: mailto:webmaster@example.org
  ```

- 用编辑器打开它，文件末尾**有一个换行**（这是 `printf` 里 `\n` 的作用）。把 `\n` 删掉再构建一次，文件内容挤成一行且没有结尾换行——这能直观看出「换行必须显式写出来」；
- 浏览器打开首页，`<pre>` 里显示的文本与文件内容一致。

> [!NOTE]
> `resources.FromString` 生成的文件**只有在被引用或发布后**才会写入 `public/`。把这一行删掉，构建依旧成功、页面上也看不出异常，但 `public/.well-known/` 目录不会出现——这是本节最典型的「没报错但结果不对」。

生成一个机器人协议文件也是同样的写法：

```go-html-template
{{ $robots := printf "User-agent: *\nSitemap: %s\n" (absURL "sitemap.xml") }}
{{ resources.FromString "robots.txt" $robots | resources.Publish }}
```

## 缓存与 --gc

因为缓存键是目标路径，同一目标路径的字符串资源在一次构建中会被复用；建议让一个目标路径只承载一种内容，避免不同内容之间相互覆盖或命中旧结果。

构建时可用 `hugo build --gc` 在构建后清理未使用的缓存文件，参数说明见[命令](/commands/)。

## 什么时候用 / 什么时候别用

**该用的时候**

- 内容要**根据配置或站点数据算出来**（邮箱、域名、日期、版本号）；
- 生成**小体积、纯文本**的文件：`robots.txt`、`security.txt`、`ads.txt`、小的 JSON；
- 想把内容**内联进页面**而不产生文件：在模板里取 `.Content` 即可，不必经过 `static/`。

**别用的时候**

- 内容**固定不变**：直接放进 `static/`，Hugo 原样复制，少一段模板逻辑；
- 内容**篇幅大**（成百上千行）：把它作为文件放进 `assets/`，再用 `resources.Get` 取回，便于编辑器语法高亮与版本管理；
- 需要**执行模板动作**：不要指望 `FromString` 会执行，配合 `resources.ExecuteAsTemplate` 或改用[从模板创建资源](/hugo-pipes/resource-from-template/)；
- 需要**动态路由**（内容取决于访问者）：Hugo 是静态站点生成器，这类需求属于服务端/前端职责。

## 常见坑

**① 命令找不到（命令类）**

- `hugo: command not found`：见[安装 Hugo](/installation/)；
- 本函数不调用任何外部命令，因此这一步不会出现「缺某个可执行文件」的报错。若报错里有外部工具名，问题在上游管道（`css.Sass`、`css.PostCSS` 等）。

**② 没报错但结果不对（静默失败类）**

| 现象 | 原因 | 怎么确认 |
| --- | --- | --- |
| 构建成功，`public/` 里没有目标文件 | 结果没有被 `Publish` / `Permalink` / `RelPermalink` 引用 | 检查模板里是否真的调用了发布方法 |
| 文件里少了内容或挤成一行 | 换行符没写（`\n` 缺失） | 用编辑器看文件末尾是否有换行 |
| 生成了空文件 | `site.Params.email` 一类变量没取到值 | 在页面上临时打印该变量，或核对配置段名 |
| 字符串里的 `{{ ... }}` 原样出现 | `FromString` 不执行模板动作 | 改为 `FromString` + `ExecuteAsTemplate` 两步 |
| 改了内容，输出没变 | 目标路径缓存键未失效或构建缓存未失效 | 确认字符串确实变了；必要时 `hugo --ignoreCache` |
| CI 上文件缺失，本机正常 | CI 没有执行发布（缺少模板、或构建输出目录被清理） | 看 CI 的构建命令与发布目录 |

**③ 报错看不懂（报错类）**

- 报错说参数数量不对：`resources.FromString` 需要**两个**参数（目标路径、字符串），顺序写反时提示通常不直观；
- 报错出现 `can't evaluate field Publish` 一类「无法取值」：说明上游返回了 `nil`，用 `with` 包住再调用发布方法；
- 发布出来的文件在服务器上 404：文件确实生成了，但服务器配置不提供该路径（`.well-known/` 这类目录常需要额外配置），先确认 `public/` 里存在、再看托管配置；
- 报错指向的文件与你改的无关：渲染期问题常这样出现，见[故障排查](/troubleshooting/)。

排查顺序：**字符串内容对不对 → 有没有真的发布 → 发布路径是否是预期的那个 → 服务器是否提供该路径**。

## 相关页面

- [resources.FromString](/functions/resources/fromstring/)
- [resources.Publish](/functions/resources/publish/)
- [从模板创建资源](/hugo-pipes/resource-from-template/)
- [资源压缩](/hugo-pipes/minification/)
- [故障排查](/troubleshooting/)
