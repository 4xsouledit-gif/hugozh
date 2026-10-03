+++
title = "Glob 切片（glob slice）"
linkTitle = "Glob 切片"
description = "由 glob 模式组成的切片，可用 `!` 加一个空格取反。"
date = 2026-10-02
weight = 490
source = "https://gohugo.io/quick-reference/glossary/glob-slice/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["能读懂取反写法的作用范围，并解释某组语言或版本为什么整组不出现在产物里"]
next = ["/quick-reference/glob-patterns/"]
+++

Glob 切片（glob slice）是由[glob patterns](g)组成的[slice](g)。在切片中，模式前加上一个感叹号（`!`）和一个空格即可将其取反。取反模式一旦命中，切片中其余模式的求值就会短路，因此适合用于早期的粗粒度排除。

下面的示例演示如何用 Glob 切片在项目配置中定义[sites matrix](g)：

```toml
[sites.matrix]
languages = [ "! no", "**" ]
versions = [ "! v1.2.3", "v1.*.*", "v2.*.*" ]
roles = [ "{member, guest}" ]
```

上面的 `versions` 示例求值结果为：`(not v1.2.3) AND (v1.*.* OR v2.*.*)`。

## 为什么重要

取反是「排除」而不是「兜底」，而且一旦命中就短路后面的模式，所以顺序写反会把本该包含的内容整组排掉：把 `"! v1.2.3"` 与 `"**"` 换个位置，结论就完全不同。这类错误的表现是构建成功、但某些语言/版本/角色的页面整体消失，日志里没有任何提示，只能回到矩阵表达式逐条核算。注意感叹号后必须有一个空格，漏掉空格时它会被当成模式的一部分而不是取反标记。

延伸阅读：[Glob 模式](/quick-reference/glob-patterns/)、[全部设置](/configuration/all/)
