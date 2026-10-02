+++
title = "Menu 方法"
linkTitle = "Menu"
description = "在遍历菜单条目时使用这些方法：排序、反转、限量。"
date = 2026-10-02
weight = 20
source = "https://gohugo.io/methods/menu/"

[params.teach]
difficulty = "参考"
time = "10 分钟"
prereq = [
  "知道菜单条目从哪里来：项目配置里的 `[[menus.…]]`、页面前置元数据里的 `menus`，或页面自动加入菜单；不熟先看[菜单](/content-management/menus/)。",
  "会写最简的菜单循环：`{{ range site.Menus.main }}`；写法见[菜单模板](/templates/menu/)。",
]
outcomes = [
  "分清**菜单**（`site.Menus.main`，类型 `navigation.Menu`）与**菜单条目**（循环里的 `.`，类型 `navigation.MenuEntry`）；",
  "按名字排序用 `ByName`，按 weight 排序用 `ByWeight`（这正是菜单的默认顺序），倒序用 `Reverse`，只取前 N 个用 `Limit`；",
  "把方法链起来：`site.Menus.main.ByName.Reverse.Limit 3` 读作「按名字排 → 倒过来 → 取前 3 个」；",
  "知道条目自身的属性（`.Name`、`.URL`、`.Children`…）在 [Menu entry 方法](/methods/menu-entry/) 一章。",
]
next = ["/methods/menu-entry/", "/content-management/menus/", "/templates/menu/"]
+++

## 本章导读

菜单（menu）是「一组导航条目」的容器：项目配置里的 `[[menus.main]]`、页面前置元数据里的 `menus`、以及 Hugo 为页面自动生成的条目，最终都会汇进 `site.Menus.<菜单名>`。

这一章收录的是**作用在整个菜单上**的四个方法。它们都返回 `navigation.Menu`，所以可以链式串联：

| 方法 | 作用 |
| --- | --- |
| [`ByName`](/methods/menu/byname/) | 按条目的 `name` 排序（大小写不敏感） |
| [`ByWeight`](/methods/menu/byweight/) | 按 `weight` 升序，再按 `name`、`identifier`；这是菜单的默认顺序 |
| [`Reverse`](/methods/menu/reverse/) | 反转当前顺序 |
| [`Limit`](/methods/menu/limit/) | 只保留前 N 个条目 |

链式调用从左到右执行。`site.Menus.main.ByName.Reverse.Limit 3` 的含义是：取出 `main` 菜单 → 按名字排序 → 倒过来 → 留前三个。

## 阅读顺序

1. 先读 [`ByWeight`](/methods/menu/byweight/)，理解菜单的默认顺序（以及为什么「没写 `weight` 的条目排在最后」）；
2. 再读 [`ByName`](/methods/menu/byname/)，按显示名字重排；
3. 最后用 [`Reverse`](/methods/menu/reverse/) 与 [`Limit`](/methods/menu/limit/) 微调输出。

条目自身的属性（`Name`、`URL`、`Children`…）见 [Menu entry 方法](/methods/menu-entry/)；菜单条目怎么写、怎么自动生成，见[菜单](/content-management/menus/)与[菜单模板](/templates/menu/)。
