+++
title = "Hugo 静态站点技能包"
linkTitle = "技能包"
description = "把建站经验打包给 AI 编码代理：一份可复用的 Hugo 技能包，含 22 个真实踩坑、SEO、多主题、日期与短代码的参考手册。"
date = 2026-10-01
weight = 5
+++

这个站点是靠一个 **AI 编码代理**建起来的——20 个章节、约 950 个文件、两个主题、SEO 与版本控制。过程中踩的坑、被文档静默坑过的地方、以及最后固化成规则的做法，全部打包成了这个技能包：**`hugo-static-site`**。

它不是教程，而是**给代理用的作业手册**：当有人要求「给这个 Hugo 站加一个短代码」「把页面时间做成中文」「为什么构建失败了」，代理加载它之后应当直接知道该查什么、该避什么。

## 快速安装

**一、给 DSH 用户（一行命令）**

```bash
git clone --depth 1 https://github.com/hencter/hugozh.git /tmp/hugozh \
  && mkdir -p ~/.dsh/skills \
  && cp -r /tmp/hugozh/.dsh/skills/hugo-static-site ~/.dsh/skills/
```

也可以放进**项目内**（随仓库走，推荐）：把技能包目录放到 `<你的项目>/.dsh/skills/hugo-static-site/`。装好后**重开一个会话**即可——技能目录是在会话启动时扫描的。

**二、给任意 AI 编码代理（无需 git，按清单逐文件取用）**

本站已把技能包 11 个文件原样发布在 `/skill/` 下，并附一份机器可读清单（含每个文件的站内地址与 sha256）：

> 请安装技能包 `hugo-static-site`：读取 <https://hugozh.cn/skill/skill-manifest.json>，把 `files[].url` 指向的每个文件按 `files[].path` 写入 `~/.dsh/skills/hugo-static-site/`，落盘后用 `files[].sha256` 校验；目录名必须是 `hugo-static-site`。

**三、不用 DSH 也能读**

技能包就是 Markdown：直接看本站镜像 [`SKILL.md`](/skill/SKILL.md) 与 [`references/gotchas.md`](/skill/references/gotchas.md)（其余文件同在 `/skill/` 下），或下载仓库 ZIP：<https://codeload.github.com/hencter/hugozh/zip/refs/heads/main>。

## 它解决的真实问题

技能包里的每一条都来自真实故障，而不是转述文档。举三个：

| 现象 | 真因 | 为什么难查 |
| --- | --- | --- |
| 一个**没有任何花括号**的页面报「短代码未闭合」，重写整页也无效 | 正文里出现了字面串 H&#xfeff;AHAHUGOSHORTCODE（Hugo 短代码占位符前缀） | 错误被归因到该页面，但字符串看起来只是普通文字；上游文档用零宽字符 `H&#xfeff;AHAHUGOSHORTCODE` 绕开它 |
| `theme` 明明写在配置里，却报「找不到任何 kind 的模板」，页面数从 226 掉到 21 | TOML 作用域：`[table]` 之后的裸键会归入该表，`theme` 变成了 `frontmatter.theme` | 配置语法完全合法，Hugo 不报错 |
| 中文站的日期显示成 `October 1, 2026` | Hugo 的 `:date_*` 本地化 token 数据不覆盖 `zh`，静默回退英文 | 同一模板下德语正常，配置看起来毫无问题 |

## 里面有什么

| 文件 | 内容 |
| --- | --- |
| `SKILL.md` | 铁律与工作流：什么会让**整站**构建失败、无 shell 时怎么降级、快速迭代循环 |
| `references/gotchas.md` | **G1–G22** 逐条「症状 → 真因 → 修法」，并标注 documented / observed / not documented |
| `references/seo.md` | 逐标签清单、结构化数据的 `jsonify` 陷阱、robots/sitemap、性能 |
| `references/shortcodes.md` | 短代码撰写：两种记法与渲染顺序、方法清单、嵌套、与 render hook 的分工 |
| `references/dates.md` | 三个日期字段与回退链、时区、本地化格式与相对时间 |
| `references/i18n.md` | **可选**：多语言结构、切换器、字符串表与占位符 |
| `references/versioning.md` | Git 该跟踪什么、`enableGitInfo`、提交驱动的「最后更新」 |
| `references/site-structure.md` | 主题分层、前置元数据契约、导航与多语言约定 |
| `references/versions.md` | 0.140 → 0.167 的逐版本改名与默认值变化 |
| `references/commands.md` | 命令笔记：只列工作流用到的标志，完整参考交给 `hugo gen doc` |

## 怎么获取

技能包在仓库的 `.dsh/skills/hugo-static-site/`（MIT 许可）。三种用法：

**一、放进项目里**（推荐，随仓库走）：

```text
<你的项目>/.dsh/skills/hugo-static-site/
```

**二、放进用户目录，全机器可用**：

```text
~/.dsh/skills/hugo-static-site/
```

**三、给 DSH 指定目录**（在 `~/.dsh/profiles/<profile>/cordis.patch.yml` 中）：

```yaml
- id: skill-filesystem
  name: "@deepseek-ai/dsh-skill-filesystem"
  config:
    customSkillDirs:
      - <技能包所在目录>
```

技能目录在会话启动时扫描；新装后重开一个会话即可看到 `hugo-static-site`。

## 不用 DSH 也能读

它不是代码，是 Markdown：把 `references/` 当文档看完全成立——那些坑和清单与 Hugo 版本无关地成立，`SKILL.md` 里也写明了每条断言是「文档明文」还是「实测观察」。

## 它刻意不做的事

- **不写脚本**：能由 Hugo 自己回答的（`--printPathWarnings`、`hugo config`、`hugo list`、`hugo gen doc`）就不另造工具，避免与二进制跑偏；
- **不转抄可生成的内容**：CLI 手册、设置清单、高亮样式分别交给 `hugo gen doc`、`hugo config`、`hugo gen chromastyles`；
- **不把推断当文档**：无法指到来源的结论会标注为「实测」或「未记载」。

## 许可与贡献

技能包采用 **MIT** 许可，可自由取用、修改、再分发（本仓库的译文部分另有其许可，见[许可说明](/about/license/)）。

发现新的坑、或想补充某一类清单，欢迎提 Issue / PR——请尽量附上**可复现的最小例子**与 `hugo version`，这比结论本身更有价值。
