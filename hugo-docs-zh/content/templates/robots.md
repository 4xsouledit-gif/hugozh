+++
title = "robots.txt"
linkTitle = "robots.txt"
description = "用模板生成自定义 robots.txt，控制搜索引擎的抓取范围。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/templates/robots/"
+++

## 启用 robots.txt 生成

要让 Hugo 从模板生成 `robots.txt`，先修改项目配置：

```toml {file="hugo.toml"}
enableRobotsTXT = true
```

开启之后，Hugo 会在站点根目录输出 `robots.txt`，默认内容来自内建模板，只有一行：

```text
User-agent: *
```

遵守 Robots 排除标准（Robots Exclusion Protocol）的搜索引擎会把这一行理解为「允许抓取站点上的全部内容」。也就是说，默认行为是**完全开放**，只有当你需要限制抓取时才有必要自定义。

## 模板查找顺序

可以用自定义模板覆盖内建模板。Hugo 按下面的顺序查找 `robots.txt` 模板，使用第一个找到的文件：

1. `/layouts/robots.txt`
1. `/themes/<THEME>/layouts/robots.txt`

项目自己的 `layouts` 目录优先级高于主题目录，因此覆盖主题的写法不需要改动主题文件，把同名文件放进项目 `layouts` 根目录即可。

## 模板示例

模板可以访问常规的页面集合与站点对象，因此能按页面动态生成规则。下面这个模板为站点上的每个页面各生成一条 `Disallow` 指令：

```text {file="layouts/robots.txt"}
User-agent: *
{{ range .Pages }}
Disallow: {{ .RelPermalink }}
{{ end }}
```

上面这份模板输出的 `robots.txt` 会给每个页面都加上一条 `Disallow` 指令，其效果是**禁止**搜索引擎抓取站点上的任何页面。实际使用时通常反过来：只对草稿目录、内部搜索页或临时页面输出 `Disallow`，其余内容保持开放。模板里也可以写 `Allow` 指令、`Sitemap` 声明以及针对特定爬虫的 `User-agent` 分组，这些都属于 robots.txt 本身的语法，与模板写法无关。

> [!NOTE]
> 如果不想用模板，也可以把 `robots.txt` 当作静态文件处理：
>
> 1. 在项目配置中把 `enableRobotsTXT` 设为 `false`；
> 1. 在 `static` 目录下创建 `robots.txt` 文件。
>
> 注意构建时 Hugo 会把 `static` 目录中的所有内容原样复制到 `publishDir`（通常是 `public`）的根目录，所以静态文件会出现在与模板生成结果相同的位置。
