+++
title = "transform.Emojify"
linkTitle = "Emojify"
description = "返回把 emoji 短代码替换为对应 emoji 字符后的给定字符串。"
date = 2026-10-02
weight = 30
source = "https://gohugo.io/functions/transform/emojify/"

[params.functions_and_methods]
signatures = ["transform.Emojify INPUT"]
returnType = "template.HTML"
aliases = ["emojify"]
+++

可用的表情符号见 [emoji 短代码][]清单。

`emojify` 函数可以在模板中调用，但默认不能直接用在内容文件里。要在内容文件中使用 emoji，请在项目配置中把 [`enableEmoji`][] 设为 `true`；此后就可以把 emoji 简写直接写进内容文件：

```md
I :heart: Hugo!
```

I :heart: Hugo!

[`enableEmoji`]: /configuration/all/
[emoji 短代码]: /quick-reference/emojis/
