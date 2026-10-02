+++
title = "评论"
linkTitle = "评论"
description = "通过局部模板在 Hugo 站点中接入第三方评论服务；含配置位置、验证方法与常见接入错误。"
date = 2026-10-01
weight = 220
source = "https://gohugo.io/content-management/comments/"

[params.teach]
difficulty = "入门"
time = "15–20 分钟"
prereq = [
  "会改项目配置，知道 `layouts/` 下模板的查找顺序。",
  "有一个已经注册好、拿到站点短名的第三方评论服务账号（Disqus 或其它）。",
]
outcomes = [
  "用内置的 `disqus.html` 局部模板给单页模板加上评论区；",
  "知道配置该写进 `[services.disqus]` 而不是 `[params]`，并能在产物里验证它生效了；",
  "在 Disqus 与 Giscus 类方案之间做出选择，并说清各自的代价；",
  "用 privacy 配置关掉内置评论组件，或只在需要的页面渲染它。",
]
next = ["/configuration/services/", "/templates/embedded/", "/content-management/"]

+++

## 这一页解决什么问题

Hugo 内置了对 Disqus 的支持。Disqus 是一项第三方服务，通过 JavaScript 为网站提供评论与社区功能。评论数据的存储、审核与展示都在服务端完成，Hugo 只负责在页面上输出**挂载代码**——静态站点本身没有数据库，也没有可以写入评论的服务端接口，所以「在 Hugo 里加评论」实际上就是把第三方提供的嵌入片段放进模板。

因此这一页要解决的是三件事，而不是「写什么代码」：

1. **配置写在哪**——Disqus 的短名写在项目配置的 `[services.disqus]` 下，**不是** `[params]`，也不是内容的前置元数据；
2. **代码插在哪**——在单页模板里调用内置局部模板 `disqus.html`；
3. **怎么确认生效**——构建后到产物 HTML 里搜评论服务的特征串。

**验证方法**：在单页模板里加上调用，构建站点，然后在产物里搜索：

```bash
hugo
```

**你应当看到什么**：产物中该页面的 `index.html` 里能搜到评论服务的特征串——Disqus 是 `disqus` 字样的容器与脚本引用（包含你配置的短名），Giscus 一类方案则有对应的 `<script>` 与 `<iframe>` 容器。**注意本地预览与正式构建的差异**：用 `hugo server` 在本地预览时，Hugo 会把 Disqus 组件替换为一句提示，说明本地预览默认不加载 Disqus 评论——所以「本地看不到评论框」不代表配置错了，要看产物 HTML 或部署后的真实页面。

**实测（Hugo 0.167）**：模板里直接读配置是最快的自检手段——在 `hugo.toml` 写 `[services.disqus] shortname = 'my-shortname'`，模板里输出 `{{ site.Config.Services.Disqus.Shortname }}`，结果就是 `my-shortname`。**你应当看到什么**：如果这里输出为空，说明配置没被读到（多半写错了表名或写进了 `[params]`），此时再谈产物里有没有评论组件就为时过早。

## 评论功能与 Hugo

Hugo 内置了对 Disqus 的支持。Disqus 是一项第三方服务，通过 JavaScript 为网站提供评论与社区功能。评论数据的存储、审核与展示都在服务端完成，Hugo 只负责在页面上输出**挂载代码**——静态站点本身没有数据库，也没有可以写入评论的服务端接口，所以「在 Hugo 里加评论」实际上就是把第三方提供的嵌入片段放进模板。

你的主题可能已经支持 Disqus；如果没有，借助 Hugo 内置的局部模板（partial）也很容易把它加进去。

## 添加 Disqus

Hugo 自带了把 Disqus 载入模板所需的全部代码。在把 Disqus 加到站点之前，需要先[注册一个账号](https://disqus.com/profile/signup/)并取得站点短名（shortname）。

### 配置 Disqus

Disqus 只需要在项目配置中设置一个值：

```toml
# hugo.toml
[services.disqus]
shortname = 'your-disqus-shortname'
```

模板中可以用 `.Site.Config.Services.Disqus.Shortname` 读取这个值。

对多数网站来说，这些配置已经够用。此外还可以在单个内容文件的前置元数据（front matter）中设置以下参数：

```toml
+++
title = "我的文章"
[params]
disqus_identifier = 'unique-identifier'
disqus_title = '文章标题'
disqus_url = 'https://example.org/blog/my-post/'
+++
```

- `disqus_identifier`：该页讨论串的唯一标识。URL 发生变化时，靠它保住原有的评论。
- `disqus_title`：讨论串的标题。
- `disqus_url`：讨论串的规范 URL。同一份内容有多个地址时，用它覆盖 Disqus 识别讨论串所用的地址。

### 渲染局部模板

在希望评论出现的位置加入下面这行代码即可，通常写在单页模板里：

```go-html-template
{{ partial "disqus.html" . }}
```

`disqus.html` 是 Hugo 内置的局部模板，配置好短名之后，它就会输出评论容器与所需的脚本。如果内置模板不符合需要，可以把它的源码复制到 `layouts/_partials/` 下的同名文件里再作修改，模板查找顺序会优先使用你提供的版本。注意在本地预览站点时，Hugo 会把 Disqus 组件替换为一句提示，说明本地预览默认不加载 Disqus 评论。

## 替代方案

Disqus 之外还有很多选择，上游文档把它们分成商业与开源两类。

商业评论系统：

- [Commentix](https://www.commentix.com/)
- [Emote](https://emote.com/)
- [FastComments](https://fastcomments.com/commenting-system-for-hugo)
- [Graph Comment](https://graphcomment.com/)
- [Hyvor Talk](https://talk.hyvor.com/)
- [IntenseDebate](https://intensedebate.com/)
- [ReplyBox](https://getreplybox.com/)

开源评论系统：

- [Cactus Comments](https://cactus.chat/docs/integrations/hugo/)
- [Comentario](https://gitlab.com/comentario/comentario/)
- [Comma](https://github.com/Dieterbe/comma/)
- [Discourse](https://meta.discourse.org/t/embed-discourse-comments-on-another-website-via-javascript/31963)
- [Giscus](https://giscus.app/)
- [Isso](https://isso-comments.de/)
- [Remark42](https://remark42.com/)
- [Staticman](https://staticman.net/)
- [Talkyard](https://blog-comments.talkyard.io/)
- [Utterances](https://utteranc.es/)
- [Zoomment](https://zoomment.com/)

这些方案大多沿用同一套思路：由服务方提供一段 `<script>`，把它放进自己的局部模板，再按服务方的要求填写仓库、站点标识等参数。其中 Giscus、Utterances 把评论存进 GitHub 仓库的 Discussions 或 Issues，读者需要登录 GitHub 才能发言，适合开发者向的站点；Comentario、Isso、Remark42 一类自托管方案把数据留在自己的服务器上，代价是需要额外部署与维护。无论选哪一种，都应先确认它提供数据导出能力——服务下线或更换服务商时，历史评论往往无法迁移。

## 隐私设置

评论数据存放在第三方，涉及隐私与合规问题，Hugo 为内置模板提供了隐私（privacy）配置。以 Disqus 为例，可以在项目配置中关闭内置模板的输出：

```toml
[privacy]
  [privacy.disqus]
    disable = true
```

`disable` 的默认值是 `false`；设为 `true` 后 Hugo 便不再输出 Disqus 组件，是否改由自定义的局部模板手动加载由站点作者决定。请注意这些设置只作用于 Hugo 自带的模板，不影响主题或模块提供的模板。第三方脚本还会增加页面请求，影响加载性能，可以延迟加载，或只在真正需要评论的页面渲染。

## 什么时候用 Disqus、什么时候换别的

| 情形 | 建议 | 理由 |
| --- | --- | --- |
| 想尽快有评论区，不在意数据放在第三方 | 内置的 Disqus 局部模板 | 只需一个短名 + 一行 `partial`，是接入成本最低的方案 |
| 站点面向开发者、读者普遍有 GitHub 账号 | Giscus / Utterances | 评论存在你自己的 GitHub 仓库（Discussions / Issues），数据可控，无需自建服务 |
| 需要把评论数据留在自己的服务器、能接受运维成本 | Comentario / Isso / Remark42 | 自托管，数据自主；代价是额外部署与维护 |
| 只希望在部分页面显示评论 | 把 `partial` 调用放进条件判断或单独的布局 | 第三方脚本会增加请求、影响加载性能，不必全站加载 |
| **别用**：站点访问者主要在国内、且无法访问相关服务 | —— | 评论组件依赖境外域名，读者加载不出来会看到空白区域；先确认目标读者的网络可达性 |
| **别用**：把短名写在内容的前置元数据里 | —— | 短名属于站点级配置，应写在 `[services.disqus]`；前置元数据只放 `disqus_identifier` 等**单页**覆盖项 |

## 常见坑

| 类别 | 症状 | 真因 | 怎么修 |
| --- | --- | --- | --- |
| 没报错但结果不对 | 页面上完全没有评论区 | 短名写在了 `[params]` 或前置元数据里，`[services.disqus]` 里是空的；或单页模板里没有调用 `partial` | 把配置移到 `[services.disqus]`，并在单页模板加入 `{{ partial "disqus.html" . }}`；构建后在产物 HTML 里搜服务特征串 |
| 没报错但结果不对 | 本地预览看不到评论，部署后才出现 | 本地预览时 Hugo 会把 Disqus 组件替换成一句提示 | 属预期行为；要验证请检查产物 HTML 或部署后的页面 |
| 没报错但结果不对 | 换了 URL 之后历史评论全没了 | 讨论串由标识与 URL 决定，URL 变了就换了讨论串 | 在内容前置元数据里写 `disqus_identifier`（以及必要时 `disqus_url`）把它钉住 |
| 没报错但结果不对 | 配置改了，页面上还是旧的脚本 | 主题或模块提供了自己的评论模板，覆盖了内置模板 | 先确认主题是否已有评论模板；改内置行为需在 `layouts/_partials/` 下放同名文件覆盖 |
| 没报错但结果不对 | 输出里找不到评论组件，但 `disable` 没写 | 站点或主题的 privacy 配置把 `[privacy.disqus] disable` 设成了 `true` | 检查项目配置的 `[privacy]` 区段；注意 privacy 设置只影响 Hugo 自带模板 |
| 没报错但结果不对 | 页面很慢、第三方脚本报错 | 评论脚本在全站每个页面都加载 | 只在需要的页面调用 `partial`，或交给延迟加载策略 |
| 报错看不懂 | 构建报找不到 `disqus.html` | 用了自定义主题且该主题删掉了内置 partial，或写错了文件名 | 核对[内建模板](/templates/embedded/)清单里的名字，必要时自行提供同名文件 |

更多排查入口见[故障排查](/troubleshooting/)。

## 相关阅读

- [内容管理概览](/content-management/)
- [配置 Hugo](/configuration/)
- [构建选项](/content-management/build-options/)
