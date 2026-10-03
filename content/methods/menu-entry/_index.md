+++
title = "Menu entry 方法"
linkTitle = "Menu entry"
description = "在菜单模板中使用这些方法：名字、链接、层级与装饰。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/methods/menu-entry/"

[params.teach]
difficulty = "参考"
time = "15 分钟"
prereq = [
  "读过 [Menu 方法](/methods/menu/) 一章，知道 `site.Menus.main` 是菜单、循环里的 `.` 是条目。",
  "知道菜单条目可以在项目配置、页面前置元数据里定义，也可以由页面自动生成；不熟先看[菜单](/content-management/menus/)。",
]
outcomes = [
  "在菜单模板里取对值：显示名用 `.Name`，链接用 `.URL`，页面对象用 `.Page`；",
  "按分组找到需要的方法，而不是一个个翻：文字与标识 / 链接与页面 / 层级 / 顺序与自定义数据 / 装饰；",
  "判断哪个方法可能拿不到值（`.Page` 可能是 `nil`、`.Identifier` 可能是空字符串），并用 `with` 包住；",
  "用 `.HasChildren` 加 `.Children` 渲染二级菜单，用 `.Params` 给条目挂自定义数据。",
]
next = ["/methods/menu/", "/templates/menu/", "/content-management/menus/"]
+++

## 本章导读

菜单条目（menu entry，就是菜单循环里的 `.`）是菜单模板的主角。一次 `{{ range site.Menus.main }}` 里，`.Name` 是显示文字、`.URL` 是填进 `href` 的地址、`.Page` 是它指向的页面对象。

条目从哪里来不影响取法——项目配置里的 `[[menus.main]]`、页面前置元数据里的 `menus`、Hugo 自动生成的条目，暴露的是同一组方法；差别只在「属性没写时回退到什么」，每张叶子页都会写清楚。

| 分类 | 方法 |
| --- | --- |
| 文字与标识 | [`Name`](/methods/menu-entry/name/)、[`Title`](/methods/menu-entry/title/)、[`Identifier`](/methods/menu-entry/identifier/)、[`KeyName`](/methods/menu-entry/keyname/)、[`Menu`](/methods/menu-entry/menu/) |
| 链接与页面 | [`URL`](/methods/menu-entry/url/)、[`Page`](/methods/menu-entry/page/)、[`PageRef`](/methods/menu-entry/pageref/) |
| 层级 | [`Children`](/methods/menu-entry/children/)、[`HasChildren`](/methods/menu-entry/haschildren/)、[`Parent`](/methods/menu-entry/parent/) |
| 顺序与自定义数据 | [`Weight`](/methods/menu-entry/weight/)、[`Params`](/methods/menu-entry/params/) |
| 装饰 | [`Pre`](/methods/menu-entry/pre/)、[`Post`](/methods/menu-entry/post/) |

## 阅读顺序

先读 [`URL`](/methods/menu-entry/url/) 和 [`Name`](/methods/menu-entry/name/)——菜单模板里最常用的两个；再读 [`Page`](/methods/menu-entry/page/)，分清「指向页面的条目」与「外链条目」；然后读 [`HasChildren`](/methods/menu-entry/haschildren/) 与 [`Children`](/methods/menu-entry/children/) 做嵌套菜单。`Identifier` 与 `KeyName` 主要服务多语言翻译表，可以最后看。

完整可复制的菜单模板见[菜单模板](/templates/menu/)。
