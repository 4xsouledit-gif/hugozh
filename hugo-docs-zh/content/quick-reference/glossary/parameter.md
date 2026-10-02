+++
title = "参数（parameter）"
linkTitle = "参数"
description = "通常指站点或页面级的用户自定义键值对，也可指配置项或实参。"
date = 2026-10-02
weight = 950
source = "https://gohugo.io/quick-reference/glossary/parameter/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["分清站点参数与页面参数该写在哪、该用哪个方法读取，并在取到空值时知道先查什么"]
next = ["/configuration/params/"]
+++

参数（parameter）通常指站点级或页面级的用户自定义键值对，但也可以指某个配置设置或一个 [argument](g)。

## 为什么重要

站点参数写在项目配置的 `[params]` 下、用 `site.Params` 读，页面参数写在该页的前置元数据里、用 `.Params` 读；两套来源不同，写错位置时模板取到的是空值，而且不会报错。
另一个常见混淆是 `.Param` 与 `.Params`：前者在页面没写时会回退到站点参数，后者只读页面自己的前置元数据，选哪个取决于你希望「页面没写时」发生什么。
取不到值时先用 `hugo config` 看生效的配置，确认键名没写错、层级（`[params.contact]` 与 `[params] contact.email`）符合预期。

延伸阅读：[参数配置](/configuration/params/) · [Params 方法](/methods/page/params/)
