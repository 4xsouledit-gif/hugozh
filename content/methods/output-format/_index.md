+++
title = "Output format 方法"
linkTitle = "Output format"
description = "在 OutputFormat 对象上使用这些方法。"
date = 2026-10-02
weight = 40
source = "https://gohugo.io/methods/output-format/"
+++

## 这一页解决什么问题

模板里只要出现「同一份内容还要以另一种形式发布」——RSS feed、JSON 索引、纯文本出口——就会用到 [output format](g)（输出格式）。渲染 RSS 自动发现的 `<link>` 标签、给页面加 `rel="canonical"`、判断某份输出叫什么名字、是什么媒体类型，靠的都是 `OutputFormat` 对象上的这几个方法。

上游这几页原来是「签名 + 一句话 + 一个小例子」，本站为每页补上了「什么时候用 / 什么时候别用」「一个可直接粘贴的实测示例」与「返回值边界（空值、取不到、类型不符）」三部分。

## 读完本章你应该能够

- 先用 [`OutputFormats.Get`](/methods/page/outputformats/#get) 或 [`OutputFormats.Canonical`](/methods/page/outputformats/#canonical) 拿到一个 `OutputFormat` 对象，再调用本章的方法；
- 分清 [`Permalink`](/methods/output-format/permalink/)（含协议与域名的绝对地址）与 [`RelPermalink`](/methods/output-format/relpermalink/)（根相对地址），并知道站点部署在子路径时两者都会带上子路径；
- 用 [`Rel`](/methods/output-format/rel/) 加 [`MediaType`](/methods/output-format/mediatype/) 拼出正确的 `<link rel=… type=… href=…>`；
- 知道 `Get` 取不到时得到的是**空值**：`with`/`if` 判为假，各方法返回空串，**不报错**——所以漏写判断的模板会静默生成 `href=""`。

## 建议阅读顺序

1. **先拿到对象**：[methods/page/outputformats](/methods/page/outputformats/)（`Get`、`Canonical`）；
2. **再取地址**：[Permalink](/methods/output-format/permalink/) → [RelPermalink](/methods/output-format/relpermalink/)；
3. **补齐 `link` 元素的另外两个属性**：[Rel](/methods/output-format/rel/) → [MediaType](/methods/output-format/mediatype/)；
4. **名字与配置对照**：[Name](/methods/output-format/name/)。

输出格式本身怎么配置（`[outputFormats]`、`[outputs]`、`[mediaTypes]`）见[输出格式](/configuration/output-formats/)。
