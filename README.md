# Hugo 中文布道站

把 Hugo 带到中文世界：一份**持续维护的简体中文文档镜像**，一个**面向 AI 编码代理的技能包**，以及一套**来自真实项目的踩坑记录**。

| | |
| --- | --- |
| 站点源码 | [`hugo-docs-zh/`](hugo-docs-zh/) — 20 个章节、948 个 Markdown 文件（上游 19 章 1:1 翻译 + 1 个原创技能包章节） |
| 技能包 | [`.dsh/skills/hugo-static-site/`](.dsh/skills/hugo-static-site/) — MIT 许可，可单独取用 |
| 许可 | 译文 [Apache-2.0](LICENSE-APACHE)（演绎自上游文档）· 代码与技能包 [MIT](LICENSE) · 署名见 [NOTICE](NOTICE) |

## 为什么做这件事

Hugo 极快、极稳，但中文世界的入门资料零散；而真正卡住人的往往不是概念，是**那些文档里没写、报错又指向别处**的坑——比如一个没有任何花括号的页面报「短代码未闭合」，真因是正文里出现了字面串 `HAHAHUGOSHORTCODE`。

这个仓库因此做三件事：把官方文档译成中文并保持与上游 1:1 对应；把踩过的坑固化成可检索的清单；把这两样都交给 AI 编码代理，让它下次直接避开。

## 本地构建

```bash
cd hugo-docs-zh

hugo server -D                 # 本地预览，默认 http://localhost:1313/
hugo --ignoreCache             # 一次性构建到 public/
hugo --cleanDestinationDir --ignoreCache \
     --printPathWarnings --printUnusedTemplates --printI18nWarnings   # 严格构建
```

要求 **Hugo 0.158+**（标准版即可）。配置里使用 0.158 起生效的 `locale` 键；若停留在更早版本，请把 `hugo.toml` 中的 `locale` 改回 `languageCode`。

## 目录结构

```text
.
├── hugo-docs-zh/
│   ├── content/                 # 中文译文 + /skill/ 技能包介绍页
│   ├── layouts/_default/        # 跨主题共用的骨架约束（baseof.html）
│   ├── themes/
│   │   ├── hugo-docs-theme/     # 版式基础层：模板、样式、SEO、JSON-LD、短代码
│   │   └── hugo-docs-theme-zh/  # 中文叠加层：CJK 字体与行距、中文日期格式
│   ├── README.md                # 站点细节（主题分层、SEO、版本控制、短代码…）
│   └── hugo.toml                # 多主题、SEO、gitInfo、frontmatter 日期映射
├── .dsh/skills/hugo-static-site/  # 技能包：SKILL.md + 9 个 references
├── LICENSE  LICENSE-APACHE  NOTICE
└── CONTRIBUTING.md
```

主题组合方式（`hugo-docs-zh/hugo.toml`）：

```toml
theme = ["hugo-docs-theme-zh", "hugo-docs-theme"]   # 左优先；项目自身永远优先于所有主题
```

## 技能包

`hugo-static-site` 是给 AI 编码代理用的作业手册：铁律（哪些改动会让**整站**构建失败）、G1–G22 症状→真因→修法、SEO 清单、短代码撰写、日期与多语言、版本控制与 Git 联动日期。**不是代码，是 Markdown**，不用 DSH 也能当文档读。

安装（三选一）：

```text
1) <你的项目>/.dsh/skills/hugo-static-site/     # 随项目走
2) ~/.dsh/skills/hugo-static-site/              # 全机器可用
3) 在 ~/.dsh/profiles/<profile>/cordis.patch.yml 里给 skill-filesystem 指定 customSkillDirs
```

站点上也有一页面向中文读者的介绍：<https://example.org/skill/>（部署后替换为真实域名）。

## 公开部署前必做的一步

`hugo-docs-zh/hugo.toml` 里的 `baseURL` 目前是占位符 `https://example.org/`。canonical、Open Graph、`hreflang`、`sitemap.xml` 全部基于它，**公开部署前必须改成真实域名**，否则搜索引擎与社交平台拿到的都是错地址。

```toml
baseURL = "https://your-domain.example/"
```

## 首次推送到远端

```bash
git remote add origin git@github.com:<你的账号>/<仓库名>.git
git push -u origin main --tags
```

（本仓库目前没有远端；`main` 分支与 `v1.0.0`/`v1.1.0` 标签已在本地就绪。）

## 贡献

见 [CONTRIBUTING.md](CONTRIBUTING.md)。最欢迎的两类：**可复现的踩坑**（附 `hugo version` 与最小例子），以及**译文的修正**（请一并给出上游原文链接）。
