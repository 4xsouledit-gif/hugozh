+++
title = "权重（weight）"
linkTitle = "权重"
description = "用于在已排序集合中定位元素的数值，较轻的项排在前面。"
date = 2026-10-02
weight = 1550
source = "https://gohugo.io/quick-reference/glossary/weight/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断侧栏、菜单或上一页／下一页的顺序与预期不符时，权重该怎么排",
]
next = ["/methods/pages/byweight/"]
+++

_权重_（weight）是用于在已排序的 [_collection_](g) 中定位元素的数值。使用非零整数分配权重。较轻的项浮到顶部，较重的项沉到底部。未加权或权重为零的元素放在集合末尾。权重通常分配给页面、菜单项、语言、[_roles_](g)、版本和输出格式。

## 为什么重要

排序是「看起来没坏、就是不对」的重灾区：权重相同时，集合会退回到默认排序顺序（`date` 降序、再 `linkTitle`／`title`），侧栏与上一页／下一页跟着变；权重为零或未加权的元素则被排到末尾，而不是开头。给 section 首页、页面、菜单项分配权重时，最好一次规划一套互不重复的数字（例如 10、20、30），别用连续整数又中途插入。改完顺手看一眼实际输出的顺序，比盯着配置文件可靠。

延伸阅读：[按权重排序](/methods/pages/byweight/)、[菜单](/content-management/menus/)
