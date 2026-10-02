+++
title = "简介"
linkTitle = "简介"
description = "Hugo 是用 Go 编写的静态站点生成器，以速度与灵活性为核心：本页说明它做什么、不做什么，并给出确认本机安装可用的实测方法。"
date = 2026-10-01
weight = 10
source = "https://gohugo.io/about/introduction/"

[params.teach]
difficulty = "入门"
time = "5–10 分钟"
prereq = [
  "不需要安装 Hugo，也不需要写模板——本页是说明性内容。",
  "想顺手验证的话，准备好终端；安装方法见[安装](/installation/)。",
]
outcomes = [
  "向别人解释 Hugo 是什么、它产出什么，以及它和「带后台的 CMS」的核心差别；",
  "用 `hugo version`、`hugo env` 确认本机安装是否可用、是不是 extended 版，并读懂输出的关键字段；",
  "判断一个需求（用户登录、表单提交、在线编辑）是否属于 Hugo 的职责范围。",
]
next = ["/about/features/", "/getting-started/quick-start/", "/installation/"]
+++

## 这一页解决什么问题

这一页回答「Hugo 是什么、它把哪些事变简单了、拿到手之后你会看到什么」。它不带你建站——动手的完整流程在[快速开始](/getting-started/quick-start/)。先读完这一页，你会知道后面那些命令分别在做什么。

判断自己读懂了没有，标准很简单：**能向同事解释清楚「为什么用它」以及「它不负责什么」**，而不是只会说「Hugo 很快」。

## Hugo 是什么

Hugo 是用 [Go](https://go.dev) 编写的[静态站点生成器](https://en.wikipedia.org/wiki/Static_site_generator)，针对速度做了优化，并以灵活性为设计目标。它提供先进的模板系统和快速的资源管道，渲染一个完整站点通常只需数秒，很多时候还要更短。

由于框架灵活、原生支持多语言，并具备强大的分类系统，Hugo 被广泛用于创建以下类型的站点：

- 企业、政府、非营利组织、教育、新闻、活动和项目站点
- 文档站点
- 图片作品集
- 落地页
- 商业、专业和个人博客
- 简历与 CV

这些用途覆盖了从内容发布到项目展示的多数场景；多语言支持与分类系统让同一套站点结构可以同时服务于不同语言、不同维度的内容组织。

## 开发与部署

在开发过程中，可以使用 Hugo 内置的 Web 服务器，即时查看内容、结构、行为和呈现方式的变化。完成之后，把站点部署到自己的主机即可；也可以把改动推送到 Git 服务商，由它执行自动化构建与部署。

## 分享与复用

借助模块（modules），你可以通过公开或私有 Git 仓库，与其他项目共享内容、资源、数据、翻译、主题、模板和配置。模块既可以是新项目的起点，也可以用来增强已有项目。

## 先确认你手上的 Hugo 能用（实测）

本页讲的是概念，但「我装的这份到底行不行」是可以当场验证的。两条命令：

```bash
hugo version
hugo env
```

实测 v0.167.0（windows/amd64，extended，BuildDate=2026-09-28）执行 `hugo version` 的第一行是：

```text
hugo v0.167.0-3fff6fb5c267dacb26280c78dbe8c344054249c8+extended windows/amd64 BuildDate=2026-09-28T14:50:38Z VendorInfo=gohugoio
```

**你应当看到什么**

- 输出里有版本号（形如 `v0.167.0`）→ 命令已经装好、可以直接用；
- 版本号后面**有没有 `+extended`** → 装的是不是扩展版。扩展版额外带 LibSass 等能力，部分主题与 Sass 相关功能依赖它，见[特性](/about/features/)；
- 提示 `hugo: command not found` 或 Windows 的「不是内部或外部命令」→ 没装好，或安装目录不在 `PATH` 里，见[安装](/installation/)与[故障排查](/troubleshooting/)。

`hugo env` 会在版本行之后列出构建时链接进来的库。实测输出中有 `GOOS="windows"`、`GOARCH="amd64"`、`GOVERSION="go1.27.1"`，以及 `github.com/sass/libsass="3.6.6"` 一类条目。向别人求助时把这份输出整段贴上，对方能据此判断一大半兼容性问题。

**版本对不上怎么办**：本页与本章描述的是当前文档对应的行为。你的版本更旧时，个别命令、配置键可能不存在。用 `hugo version` 报出的版本号对照[安装](/installation/)中的版本要求；升级带来的变化见[弃用说明](/troubleshooting/deprecation/)。

## Hugo 不做什么

Hugo 只做一件事：**在构建时把源文件（内容、模板、资源）渲染成静态文件**。由此可以推出几条边界，选型时比「它能做什么」更值得先确认：

- 构建完成后没有常驻进程。上游文档明确说明 Hugo 没有线上生产服务器，也就是说没有「Hugo 服务」跑在你的域名后面（见[安全模型](/about/security/)）；
- 没有内置的在线编辑后台，内容仍以文件形式存在、由 Git 或你选择的流程管理；需要可视化编辑时，那是另一类工具与 Hugo 配合，见[前端工具](/tools/front-ends/)；
- 登录、表单提交、个性化推荐、实时搜索索引这类需要服务端运行时的功能不在它的职责范围内，要由托管平台或第三方服务提供。

## 常见坑

| 症状 | 真因 | 怎么修 |
| --- | --- | --- |
| `hugo: command not found` / 「不是内部或外部命令」 | 没安装，或安装目录没进 `PATH` | 按[安装](/installation/)对应平台重装；改完 `PATH` 必须**重开终端**才会生效 → [故障排查](/troubleshooting/) |
| 自己能在浏览器里打开 `hugo server` 的地址，同事用你的 IP 打不开 | 开发服务器默认只绑定本机回环地址 | 实测 v0.167.0：`hugo server --help` 显示 `--bind` 默认 `127.0.0.1`、`--port` 默认 `1313`。要给别人看，显式指定 `hugo server --bind 0.0.0.0 --baseURL http://<你的IP>:1313/`；这仍是**本地开发**用途，别拿它当线上服务器 |
| 本地预览一切正常，部署上线后样式与站内链接错乱 | `baseURL` 还是本地地址，绝对地址生成错了 | 把配置里的 `baseURL` 改成最终域名后重新构建，见[部署](/host-and-deploy/) |
| 文档说「数秒渲染完整站点」，自己的站点却要几分钟 | 官方描述的是典型情况；图片处理、抓取远程数据、模板复杂度都会拉长构建时间 | 先量再调：`hugo --templateMetrics --logLevel info` 看哪些模板最耗时，思路见[性能](/troubleshooting/performance/) |

本章其余页面见[特性](/about/features/)、[许可](/about/license/)、[安全模型](/about/security/)；命令找不到、构建报错一类问题统一到[故障排查](/troubleshooting/)按症状查。

## 延伸阅读

本章还介绍了 Hugo 的[特性](/about/features/)、隐私保护与[安全模型](/about/security/)。官方另提供了一段介绍视频：[Introduction to Hugo](https://www.youtube.com/watch?v=0RKpf3rK57I)。
