+++
title = "依赖内置（vendor）"
linkTitle = "vendor"
description = "把第三方依赖的源代码直接纳入自己项目的代码库，而不是运行时从外部包管理器下载。"
date = 2026-10-02
weight = 1510
source = "https://gohugo.io/quick-reference/glossary/vendor/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断构建在 CI 上拉不到模块时，是不是依赖没有内置进仓库",
]
next = ["/commands/hugo-mod-vendor/"]
+++

在软件语境中，_依赖内置_（vendor，动词）是指把第三方依赖的源代码直接纳入自己项目的代码库，而不是从外部包管理器即时下载。

当有人要求你「vendor the dependencies into the project root」时，意思是把这些外部库从临时缓存移到一个会提交到版本控制系统的专用文件夹中。

## 为什么重要

Hugo 站点依赖 [module](g)（主题、外部内容等）时，`hugo mod vendor` 会把依赖源码写进项目根目录的 `_vendor`，此后构建只从 `_vendor` 里找依赖、不再联网。这件事在 CI 上后果最直接：本地能构建、流水线报拉不到模块，往往就是因为依赖没有内置进仓库，而构建环境访问不了模块仓库或代理。反过来说，`_vendor` 提交之后升级依赖要记得重新执行 vendor，否则跑的还是旧副本。

延伸阅读：[hugo mod vendor](/commands/hugo-mod-vendor/)、[使用模块](/hugo-modules/use-modules/)
