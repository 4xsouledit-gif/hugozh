+++
title = "从其他系统迁移"
linkTitle = "从其他系统迁移"
description = "把现有博客或 CMS 内容迁移到 Hugo 的工具。"
date = 2026-10-01
weight = 30
source = "https://gohugo.io/tools/migrations/"
+++

## 简介

本节汇总一些与 Hugo 相关的独立开发项目。这些工具用于扩展功能，或者帮你更快上手。

如果你现在用的是 Jekyll、WordPress 一类的其他博客工具，但打算改用 Hugo，可以看看下面这份迁移工具清单。它们能帮你把内容导出成对 Hugo 友好的格式。

## Jekyll

另一种做法是使用 Hugo 内置的 [Jekyll 导入命令](/commands/hugo-import-jekyll/)。

[JekyllToHugo][]
: 一个把 Jekyll 博客文章转换为 Hugo 站点的小脚本。

[ConvertToHugo][]
: 把博客从 Jekyll 转换到 Hugo。

## Octopress

[octohug][]
: Octopress 到 Hugo 的迁移工具。

## DokuWiki

[dokuwiki-to-hugo][]
: 把 DokuWiki 源页面从 [DokuWiki 语法][DokuWiki syntax]迁移为 Hugo 的 Markdown 语法。它还包含 TODO 插件一类的额外处理。用 Python 3 编写，注重可扩展性。同时会为每个页面生成 TOML 头部。设计目标是让你把 wiki 目录直接复制粘贴进 `content` 目录。

## WordPress

[wordpress-to-hugo-exporter][]
: 一个一键式 WordPress 插件，把所有文章、页面、分类法、元数据与设置转换为 Markdown 和 YAML，可直接放进 Hugo。（注意：如果你在使用该插件时遇到问题，可以[把站点导出为 Jekyll 格式][export your site for Jekyll]，再使用前面提到的 Hugo 内置 Jekyll 转换器。）

[blog2md][]
: 适用于你的免费 YOUR-TLD.wordpress.com 网站导出的 [xml 文件](https://en.support.wordpress.com/export/)。它还会把已批准的评论连同文章一起保存到 `YOUR-POST-NAME-comments.md` 文件中。

[wordhugopress][]
: 一个用 Java 编写的小工具，从数据库中导出整个 WordPress 站点，以及存放在本地或远端的资源（例如图片）文件。因此也可以从备份文件进行迁移。支持把多个 WordPress 站点合并为一个 Hugo 站点。

[wp2hugo][]
: 一个基于 Go 的命令行工具，用于把 WordPress 网站迁移到 Hugo。它会保留原始 URL、GUID、图片 URL、代码高亮、目录以及 WordPress 导航分类。它可以迁移 WordPress 的自定义文章类型、自定义分类法、自定义字段与页面层级。它支持通过 Polylang 或 WPML 翻译的 WordPress 博客。它会导入 WordPress 媒体库数据库及其原始标题与日期。该工具可以下载全部媒体，也可以只下载插入到页面中的媒体。它会把 WordPress 短代码与 Gutenberg 区块转换为 Hugo 短代码，包括图库、图片、音频、YouTube 嵌入、Gist 与 Google Maps。

## Medium

[medium2md][]
: 一个简单的 Medium 到 Hugo 的导出器，一条命令即可导入文章，包括前置字段。

[medium-to-hugo][]
: 一个用 Go 编写的命令行工具，把 Medium 文章导出为与 Hugo 兼容的 Markdown 格式。会包含标签与图片。所有图片都会下载到本地并正确链接。

## Tumblr

[tumblr-importr][]
: 一个导入器，使用 Tumblr API 生成 Hugo 静态站点。

[tumblr2hugomarkdown][]
: 把所有 Tumblr 内容导出为 Hugo Markdown 文件，并保留原始格式。

[Tumblr to Hugo][]
: 一个迁移工具，把你的每篇 Tumblr 文章转换为带正确标题与路径的内容文件。它还会生成一个 CSV 文件，帮助你设置 URL 重定向。

## Drupal

[drupal2hugo][]
: 把 Drupal 站点转换为 Hugo。

## Joomla

[hugojoomla][]
: 这个用 Java 编写的工具读取 Joomla 数据库，把全部内容转换为 Markdown 文件。它会把 Joomla 内部格式的 URL 改为合适的形式。

## Blogger

[blogimport][]
: 把 Blogger 文章导入 Hugo 的工具。

[blogger-to-hugo][]
: 另一个把 Blogger 文章导入 Hugo 的工具。它还会下载内嵌图片，把它们保存到本地。

[blog2md][]
: 适用于你的 YOUR-TLD.blogspot.com 网站导出的 [xml 文件](https://support.google.com/blogger/answer/41387?hl=en)。它还会把评论连同文章一起保存到 `YOUR-POST-NAME-comments.md` 文件中。

[BloggerToHugo][]
: 又一个把 Blogger 文章导入 Hugo 的工具。仅限 Windows 平台，且需要 .NET Framework 4.5。使用前请先阅读 README.md。

[blogger2hugo][]
: 把来自 [Google Takeout][] 的 Blogger 备份文件（`.atom`）转换为 Markdown（`.md`）文件。该工具生成的输出与 Hugo 的 `content/` 结构兼容。

## Contentful

[contentful-hugo][]
: 一个根据 [Contentful][] 上的内容为 Hugo 生成内容文件的工具。

## BlogML

[BlogML2Hugo][]
: 一个帮你把 BlogML xml 文件转换为 Hugo Markdown 文件的工具。附件与图片的链接需要用户自行处理。它能让导出 BlogML 文件的博客（例如 BlogEngine.NET）更容易转换为 Hugo 站点。

[BlogML2Hugo]: https://github.com/jijiechen/BlogML2Hugo
[BloggerToHugo]: https://github.com/huanlin/blogger-to-hugo
[Contentful]: https://www.contentful.com/
[ConvertToHugo]: https://github.com/coderzh/ConvertToHugo
[DokuWiki syntax]: https://www.dokuwiki.org/wiki:syntax
[Google Takeout]: https://takeout.google.com/takeout/custom/blogger?hl=en
[JekyllToHugo]: https://github.com/fredrikloch/JekyllToHugo
[Tumblr to Hugo]: https://github.com/jipiboily/tumblr-to-hugo
[blog2md]: https://github.com/palaniraja/blog2md
[blogger-to-hugo]: https://pypi.org/project/blogger-to-hugo/
[blogger2hugo]: https://github.com/noorkhafidzin/blogger2hugo
[blogimport]: https://github.com/natefinch/blogimport
[contentful-hugo]: https://github.com/ModiiMedia/contentful-hugo
[dokuwiki-to-hugo]: https://github.com/wgroeneveld/dokuwiki-to-hugo
[drupal2hugo]: https://github.com/danapsimer/drupal2hugo
[export your site for Jekyll]: https://wordpress.org/plugins/jekyll-exporter/
[hugojoomla]: https://github.com/davetcc/hugojoomla
[medium-to-hugo]: https://github.com/bgadrian/medium-to-hugo
[medium2md]: https://github.com/gautamdhameja/medium-2-md
[octohug]: https://github.com/codebrane/octohug
[tumblr-importr]: https://github.com/carlmjohnson/tumblr-importr
[tumblr2hugomarkdown]: https://github.com/Wysie/tumblr2hugomarkdown
[wordhugopress]: https://github.com/nantipov/wordhugopress
[wordpress-to-hugo-exporter]: https://github.com/SchumacherFM/wordpress-to-hugo-exporter
[wp2hugo]: https://github.com/ashishb/wp2hugo
