+++
title = "Hugo 中文文档"
description = "Hugo 官方文档 948 页的社区简体中文翻译（非官方），附教学层与英文原文链接，便于对照阅读。"
date = 2026-10-01
+++

本站是社区维护的 [Hugo](https://gohugo.io/) 官方文档简体中文翻译（**非官方**，站点 <https://hugozh.cn/>），覆盖上游**全部 19 个一级章节**——从入门、安装、配置，到内容管理、模板、渲染钩子、短代码、资源管道、模块、托管部署、命令、故障排查与速查。每一页都对应官方英文站点的一页，页面底部保留原文链接，便于随时对照核实。

与单纯直译不同，本站给学习成本最高的页面补了一层**教学层**（难度、预计用时、前置条件、读完之后能做到什么），并为 313 个函数、268 个方法与 158 条术语补上「什么时候用、怎么用、边界在哪」。这些内容的取用方式见[技能包](/skill/)与[面向 AI 代理的出口](/llms.txt)。

> 译文由 [亦幸](https://github.com/hencter) 和 [DeepSeek Harness](https://www.deepseek.com/) 整理，仅供学习参考。Hugo 迭代较快，如与官方英文原文有出入，请以官方文档为准。

## 完成度与范围

上游的全部一级章节均已翻译，并与上游页面 **1:1 对应**：313 页函数参考、268 页方法参考、159 条术语表，以及速查、命令、配置等各章。未纳入正文的只有上游 `news/`（其索引页已译，无 news 正文）与 `_common/` 文档片段目录（片段内容已随引用它的页面内联译出）。

个别页面上游的**默认值由 `code-toggle` 等数据块提供**，本站以文字说明为主；需要精确默认值时请看该页 `source` 指向的官网页面。

## 遇到问题去哪儿

- **构建报错或页面不符合预期** → [故障排查](/troubleshooting/) 按症状分诊；
- **命令行参数不清楚** → [命令](/commands/)；
- **提问与交流** → [Hugo 官方论坛](https://discourse.gohugo.io)（设有中文分类，可在分类列表中查找）。提问前请先读[求助指南](https://discourse.gohugo.io/t/requesting-help/9132)，并附上 `hugo env` 输出与最小复现示例。

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

## 构建本站源码

本站是一个自包含的 Hugo 项目：**无需外部主题、无需联网**即可构建（要求 Hugo 0.147+，标准版即可）。完整说明见仓库中的 [README](https://github.com/hencter/hugozh/blob/main/hugo-docs-zh/README.md)。

```bash
# 在 hugo-docs-zh 目录下执行
hugo server          # 本地预览，默认 http://localhost:1313/
hugo server -D       # 连同草稿一起预览
hugo                 # 生成静态站点到 public/
```

## 版权与免责

- 原文版权归 Hugo 项目及其文档贡献者所有，原文仓库为 [gohugoio/hugoDocs](https://github.com/gohugoio/hugoDocs)。
- 本站译文仅用于学习与交流，不构成对官方文档的替代。
- 如果你是文档作者并希望调整或移除某处译文，请以官方文档为准并联系本站维护者处理。
