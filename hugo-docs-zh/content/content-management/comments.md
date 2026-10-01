+++
title = "评论"
linkTitle = "评论"
description = "介绍如何通过局部模板在 Hugo 站点中接入第三方评论服务。"
date = 2026-10-01
weight = 220
source = "https://gohugo.io/content-management/comments/"
+++

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

## 相关阅读

- [内容管理概览](/content-management/)
- [配置 Hugo](/configuration/)
- [构建选项](/content-management/build-options/)
