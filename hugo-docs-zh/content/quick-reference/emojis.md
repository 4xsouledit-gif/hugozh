+++
title = "Emoji"
linkTitle = "Emoji"
description = "在内容中使用 Emoji 短名，以及开启方式与常用名称。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/quick-reference/emojis/"
+++

## 启用 Emoji 处理

Hugo 内置了对 Emoji 短名（emoji shortcode）的支持：在 Markdown 里写 `:wave:` 这样的短名，渲染时会被替换成对应的 Unicode 字符。这一功能默认关闭，需要在站点配置中开启——它是一个根级配置键，不隶属于 Goldmark 或任何其他渲染器区段：

```toml
# hugo.toml
enableEmoji = true
```

开启之后，下面这段 Markdown：

```md
Hello! :wave:
```

会被渲染为：

```html
Hello! &#x1f44b;
```

在浏览器中看到的就是「Hello! 👋」。把 `enableEmoji` 设为 `false` 或直接去掉该键，内容里的短名就会原样输出为纯文本。

`enableEmoji` 位于站点配置的根一级。如果项目按环境拆分配置文件，把它写在哪个文件里，就决定了哪种构建会开启 Emoji 处理。

## 在模板中处理 Emoji

模板里的字符串不会自动经过 Markdown 渲染，需要显式调用 `emojify` 函数，或者把字符串交给页面（`Page`）对象的 `RenderString` 方法：

```go-html-template
{{ "Hello! :wave:" | .RenderString }}
```

```go-html-template
{{ "Hello! :wave:" | emojify }}
```

`RenderString` 会先按 Markdown 处理字符串再做 Emoji 替换，适合片段中还混有 Markdown 标记的场景；`emojify` 只做 Emoji 替换。两者的替换规则与内容渲染一致。页面的 SEO 描述、RSS 摘要一类不走 Markdown 的字段需要 Emoji 时，就可以在模板中用它们补做替换。

Emoji 替换在构建时完成，不需要联网，也不会引入任何前端脚本或额外图片：替换结果就是一个 Unicode 字符，与直接在内容里粘贴该字符的效果完全相同。

## 短名的来源

短名集合来自上游维护的 Emoji 对照表，该表由 [ikatyang/emoji-cheat-sheet](https://github.com/ikatyang/emoji-cheat-sheet/) 项目生成，数据取自 [GitHub Emoji API](https://api.github.com/emojis) 与 [Unicode 全量 Emoji 列表](https://unicode.org/emoji/charts/full-emoji-list.html)。

需要特别说明的是：GitHub 的自定义 Emoji（custom emoji）**不受支持**。`:octocat:`、`:shipit:` 这类只在 GitHub 上生效的短名，Hugo 不会替换。

## 可用的短名

短名按 Unicode 的 Emoji 分组组织，常见分组与示例如下：

| 分组 | 示例短名 |
| --- | --- |
| Smileys & Emotion（表情与情感） | `:smile:` `:joy:` `:heart:` |
| People & Body（人物与身体） | `:wave:` `:+1:` `:clap:` |
| Animals & Nature（动物与自然） | `:dog:` `:cat:` `:sunflower:` |
| Food & Drink（食物与饮料） | `:apple:` `:pizza:` `:coffee:` |
| Travel & Places（旅行与地点） | `:rocket:` `:fire:` `:house:` |
| Activities（活动） | `:tada:` `:soccer:` |
| Objects（物品） | `:bulb:` `:computer:` |
| Symbols（符号） | `:warning:` `:100:` |
| Flags（旗帜） | `:cn:` `:us:` |

同一个字符可能存在多个短名（别名），例如 `:laughing:` 与 `:satisfied:` 等价、`:+1:` 与 `:thumbsup:` 等价，写哪个都可以。上游对照表里还有一个单独的 GitHub 自定义 Emoji 分组，仅供识别，Hugo 不会处理它们。上游页面按 Unicode 分组逐项列出了全部可用短名，本站不复制这份长表，遇到不确定的写法时可以到上游对照表中检索。

下面是一些在文档与博客里出现频率较高的写法：

| 短名 | 字符 | 常见用途 |
| --- | --- | --- |
| `:smile:` | 😄 | 表达轻松、友好的语气 |
| `:heart:` | ❤️ | 强调喜爱或推荐 |
| `:tada:` | 🎉 | 庆祝发布与里程碑 |
| `:rocket:` | 🚀 | 表示发布上线、性能提升 |
| `:warning:` | ⚠️ | 提示注意事项 |
| `:bulb:` | 💡 | 提示技巧与思路 |
| `:+1:` | 👍 | 表示赞同或已完成 |
| `:fire:` | 🔥 | 表示热门、亮点 |

## 注意事项

- 短名两侧的冒号都要写全：`:wave:` 有效，`:wave` 与 `wave:` 都不会被替换。
- 替换发生在 Markdown 渲染阶段，围栏代码块与行内代码中的短名会原样保留，可以放心用它们演示语法。
- 前置元数据（front matter）中的普通字符串不经过 Markdown 渲染，标题一类字段里想放 Emoji，直接粘贴字符即可。
- 短名与 Hugo 的短代码（shortcode）是两回事：Emoji 由 Markdown 渲染器处理，不使用短代码定界符，也不能接收参数，无需在 `layouts/` 下准备任何模板文件。
- 替换后的 Emoji 就是普通字符，会随页面一起写入输出文件，不影响页面资源（page resource）与页面包（page bundle）的组织方式。

## 相关阅读

- [内容管理概览](/content-management/)
- [配置 Hugo](/configuration/)
- [评论](/content-management/comments/)
