+++
title = "局部模板装饰器（partial decorator）"
linkTitle = "局部模板装饰器"
description = "充当包装组件的特殊局部模板。"
date = 2026-10-02
weight = 960
source = "https://gohugo.io/quick-reference/glossary/partial-decorator/"
+++

局部模板装饰器（partial decorator）是一种特定类型的 [partial template](g)，充当 [wrapper component](g)。普通的局部模板只是在固定模板中渲染数据，而装饰器使用组合来包裹整块内容。它借助 [`templates.Inner`][] 函数作为占位符，精确指定外部内容应注入到包装布局中的哪个位置。

[`templates.Inner`]: /functions/templates/inner/

参见：[局部模板装饰器](/templates/partial-decorators/)
