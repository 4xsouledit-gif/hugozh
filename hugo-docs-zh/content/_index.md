+++
title = "Hugo 中文文档"
description = "Hugo 官方文档全部 19 个一级章节、948 页的社区简体中文翻译（非官方），附英文原文链接，便于对照阅读。"
date = 2026-10-01
+++

本站是社区维护的 [Hugo](https://gohugo.io/) 官方文档简体中文翻译（**非官方**，站点 <https://hugozh.cn/>），覆盖上游**全部 19 个一级章节**（含函数与方法参考、术语表）：从入门、安装、配置，到内容管理、模板、渲染钩子、短代码、资源管道、模块、托管部署、命令、故障排查与速查。每一页都对应官方英文站点的一页，页面底部保留原文链接，方便随时对照核实。

> 译文由 [亦幸](https://github.com/hencter) 和 [DeepSeek Harness](https://www.deepseek.com/) 整理，仅供学习参考。Hugo 迭代较快，如与官方英文原文有出入，请以官方文档为准。

**遇到问题？** 文档之外，Hugo 官方论坛的[中文分类](https://discourse.gohugo.io/c/chinese/42)是中文提问与交流的落点；提问前请先读[求助指南](https://discourse.gohugo.io/t/requesting-help/9132)，并附上 `hugo env` 输出与最小复现示例。中文区之外，[官方论坛](https://discourse.gohugo.io)其余分类也有两万多个主题可直接搜索。

## 本站包含哪些内容

| 章节 | 内容 |
| --- | --- |
| [入门](/getting-started/) | 快速开始、基本用法、目录结构 |
| [安装](/installation/) | 发行版差异、各平台安装方式、源码构建 |
| [配置](/configuration/) | 配置文件与配置目录、级联、Markup、图像、安全等 33 个配置分区 |
| [内容管理](/content-management/) | 内容格式、前置元数据、页面包、分类法、菜单、短代码等 |
| [模板](/templates/) | 模板查找顺序、新版模板系统、分页、RSS、站点地图、内建模板 |
| [渲染钩子](/render-hooks/) | 链接、图片、标题、代码块、引用块、表格、原样透传 |
| [短代码](/shortcodes/) | 短代码机制与全部内置短代码 |
| [Hugo Pipes](/hugo-pipes/) | 资源管道：Sass、PostCSS、JS 构建、打包、压缩、指纹 |
| [Hugo 模块](/hugo-modules/) | 模块、主题组件、Node.js 依赖 |
| [托管与部署](/host-and-deploy/) | `hugo deploy`、rclone、rsync 与 11 个托管平台 |
| [命令](/commands/) | 全部 44 个 CLI 命令与选项 |
| [故障排查](/troubleshooting/) | 常见问题、审计、弃用、日志、性能 |
| [速查](/quick-reference/) | Glob 模式、Emoji 等速查内容 |
| [工具](/tools/) | 编辑器、可视化 CMS、站内搜索、迁移工具 |
| [关于](/about/) | 简介、特性、许可、安全模型 |
| [参与贡献](/contribute/) | 参与开发、文档与主题的方式 |

> **完成度**：截至本版，上游文档的**全部一级章节均已翻译，并与上游页面 1:1 对应**——包含 313 页函数参考、268 页方法参考、159 条术语表，以及速查、命令、配置等各章。未纳入正文的只有上游 `news/`（其索引页已译，无 news 正文）与 `_common/` 文档片段目录（片段内容已随引用它的页面内联译出）。

## 阅读建议

1. 完全没接触过 Hugo，从「[快速开始](/getting-started/quick-start/)」开始，十几分钟就能跑出一个站点。
2. 已经在用 Hugo，可以直接跳到「[配置](/configuration/)」和「[内容管理](/content-management/)」。
3. 遇到命令行参数不清楚时，查「[命令](/commands/)」；写模板时查「[模板](/templates/)」与「[渲染钩子](/render-hooks/)」。
4. 「[目录结构](/getting-started/directory-structure/)」解释了 `content/`、`layouts/`、`assets/` 等目录各自的职责，是排查「文件放错位置」类问题的第一站。
5. 构建报错或页面不符合预期时，先看「[故障排查](/troubleshooting/)」。

## 翻译与术语约定

专有名词首次出现时以「中文（english）」形式标注，其后沿用同一译法，以保证全站一致。主要约定如下：

| 英文 | 本站译法 | 说明 |
| --- | --- | --- |
| front matter | 前置元数据（front matter） | 文件顶部用 `+++`/`---` 包裹的元数据块，正文中亦直接写作 front matter |
| page bundle | 页面包 | 把页面与其资源放在同一目录的组织方式 |
| branch bundle | 分支包 | 以 `_index.md` 为入口的页面包 |
| leaf bundle | 叶子包 | 以 `index.md` 为入口的页面包 |
| shortcode | 短代码（shortcode） | 在内容中调用模板的函数式标记 |
| archetype | 原型（archetype） | `hugo new content` 生成新文件时套用的模板 |
| partial | 局部模板（partial） | 可被其他模板复用的模板片段 |
| render hook | 渲染钩子（render hook） | 覆盖 Markdown 元素默认渲染方式的模板 |
| taxonomy | 分类法（taxonomy） | 标签、分类等结构化归类机制 |
| section | section（内容区块） | `content/` 下的顶层目录，保留英文以免与「章节」混淆 |

## 如何构建本站

本站是一个自包含的 Hugo 项目：**无需安装外部主题、无需联网**，所有版式都在项目的 `layouts/` 与 `assets/` 目录中。

要求 Hugo 0.158 或更高版本（标准版即可，不需要 extended 版）。配置里使用的是 0.158 起生效的 `locale` 键；若你停留在更早的版本，请把 `hugo.toml` 中的 `locale` 改回 `languageCode`。

```bash
# 在项目根目录（即本文件所在的 hugo-docs-zh 目录）执行
hugo server          # 本地预览，默认地址 http://localhost:1313/
hugo server -D       # 连同草稿一起预览
hugo                 # 生成静态站点到 public/ 目录
hugo --minify        # 生成时压缩输出
```

> 部署到子路径（例如 `https://hugozh.cn/docs/`）时，请先修改 `hugo.toml` 中的 `baseURL`，否则站内绝对链接会指向错误位置。

## 版权与免责

- 原文版权归 Hugo 项目及其文档贡献者所有，原文仓库为 [gohugoio/hugoDocs](https://github.com/gohugoio/hugoDocs)。
- 本站译文仅用于学习与交流，不构成对官方文档的替代。
- 如果你是文档作者并希望调整或移除某处译文，请以官方文档为准并联系本站维护者处理。
