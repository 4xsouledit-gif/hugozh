+++
title = "页面集合"
linkTitle = "页面集合"
description = "Hugo 页面集合速查：取得、筛选、排序与分组页面列表。"
date = 2026-10-02
weight = 130
source = "https://gohugo.io/quick-reference/page-collections/"
+++

## Page

在 [section 页](g)、[分类法页](g)、[术语页](g) 与首页渲染列表时，使用下列 `Page` 方法：

- [`PAGE.Pages`](/methods/page/pages/)
- [`PAGE.RegularPages`](/methods/page/regularpages/)
- [`PAGE.RegularPagesRecursive`](/methods/page/regularpagesrecursive/)
- [`PAGE.Sections`](/methods/page/sections/)

## Site

在任何页面上渲染列表时，使用下列 `Site` 方法：

- [`SITE.AllPages`](/methods/site/allpages/)
- [`SITE.Pages`](/methods/site/pages/)
- [`SITE.RegularPages`](/methods/site/regularpages/)
- [`SITE.Sections`](/methods/site/sections/)

## 筛选

用 [`where`](/functions/collections/where/) 函数筛选页面集合。

## 排序

[默认排序顺序](g) 决定了不显式指定时的排列方式。以下方法按不同依据排序：

- [`PAGES.ByDate`](/methods/pages/bydate/)
- [`PAGES.ByExpiryDate`](/methods/pages/byexpirydate/)
- [`PAGES.ByLanguage`](/methods/pages/bylanguage/)
- [`PAGES.ByLastmod`](/methods/pages/bylastmod/)
- [`PAGES.ByLength`](/methods/pages/bylength/)
- [`PAGES.ByLinkTitle`](/methods/pages/bylinktitle/)
- [`PAGES.ByParam`](/methods/pages/byparam/)
- [`PAGES.ByPublishDate`](/methods/pages/bypublishdate/)
- [`PAGES.ByTitle`](/methods/pages/bytitle/)
- [`PAGES.ByWeight`](/methods/pages/byweight/)
- [`PAGES.Reverse`](/methods/pages/reverse/)

## 分组

- [`PAGES.GroupBy`](/methods/pages/groupby/)
- [`PAGES.GroupByDate`](/methods/pages/groupbydate/)
- [`PAGES.GroupByExpiryDate`](/methods/pages/groupbyexpirydate/)
- [`PAGES.GroupByLastmod`](/methods/pages/groupbylastmod/)
- [`PAGES.GroupByParam`](/methods/pages/groupbyparam/)
- [`PAGES.GroupByParamDate`](/methods/pages/groupbyparamdate/)
- [`PAGES.GroupByPublishDate`](/methods/pages/groupbypublishdate/)
