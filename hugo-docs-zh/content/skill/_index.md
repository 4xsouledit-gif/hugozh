+++
title = "Hugo 静态站点技能包"
linkTitle = "技能包"
description = "把建站经验打包给 AI 编码代理：一份可复用的 Hugo 技能包，含 26 个真实踩坑、SEO、多主题、日期与短代码的参考手册。"
date = 2026-10-01
weight = 5

[params.teach]
difficulty = "进阶"
time = "安装 2 分钟；通读约 20 分钟"
prereq = [
  "你要么在用某个 AI 编码代理（想要它别再犯 Hugo 的坑），要么自己在维护 Hugo 站点（想直接看踩坑清单）。",
  "不需要写代码——技能包就是一组 Markdown 文件。",
]
outcomes = [
  "把这个技能包装进 DSH 或任意 AI 编码代理，让它「加载后就知道该查什么、该避什么」；",
  "不用任何工具也能直接读：把 `references/` 当文档看，其中 G1–G24 逐条是「症状 → 真因 → 修法」；",
  "分清技能包里的断言哪些是「官方文档明文」、哪些是「实测观察」，知道该信到什么程度；",
  "自己写一条新的踩坑记录投稿：附最小复现与 `hugo version`，这比结论本身更有价值。",
]
next = ["/skill/SKILL.md", "/skill/references/gotchas.md", "/troubleshooting/"]
+++

{{< banner >}}

这个站点是靠一个 **AI 编码代理**建起来的——20 个章节、约 950 个文件、两个主题、SEO 与版本控制。过程中踩的坑、被文档静默坑过的地方、以及最后固化成规则的做法，全部打包成了这个技能包：**`hugo-static-site`**。

它不是教程，而是**给代理用的作业手册**：当有人要求「给这个 Hugo 站加一个短代码」「把页面时间做成中文」「为什么构建失败了」，代理加载它之后应当直接知道该查什么、该避什么。

## 安装

### 先说清楚哪部分是通用的

技能包**就是一组 Markdown 文件，没有依赖、没有可执行代码**。所以「安装」的实质只有一件事：

> **把 12 个文件按 `path` 落到「你的代理能读到技能的地方」，保证相对路径不变。**

`~/.dsh/skills/…` 这类写法是**DSH 的约定，不是通用规范**。不同代理的加载方式各不相同（用户级目录、项目级目录、会话内挂载、插件注册……），所以本站只固定三件与环境无关的事，其余交给你的代理或你按它自己的惯例决定：

| 与环境无关（本站固定） | 与环境相关（你按代理自己的规范决定） |
| --- | --- |
| `skill-manifest.json` 里的 `path`（含 `references/` 子目录）与 `sha256` | 文件放到哪个目录、用哪种注册方式 |
| 目录名必须是 `hugo-static-site` | 用用户级还是项目级安装 |
| 装完必须校验哈希，并让代理确认已加载 | 是否需要重启会话 / 重新扫描 |

### 一、通用方式：把清单交给你的代理

> 读取 <https://hugozh.cn/skill/skill-manifest.json>，把 `files[]` 里的每个 `path` 与 `sha256` 记下来。按你自己的技能/规则加载约定决定安装位置（**如果没有约定，就装到当前用户目录的 `skills/hugo-static-site/`**），把每个文件从 `url` 取回后按 `path` 原样落盘，保持相对路径与目录名 `hugo-static-site` 不变。落盘后用 `sha256` 逐个校验，报告校验结果；再读一遍 `SKILL.md` 的第一节，确认你能正常读到它。

这一段的写法有意留了余地：它**只规定可验证的结果**（相对路径、目录名、哈希一致、能被读到），不规定你用什么目录——那样才谈得上"适用于不同代理"。

### 二、DSH 用户

DSH 的约定是：技能目录在**会话启动时**扫描，装好后重开会话即可加载。

**项目内**（推荐，随仓库走，也让同事拿到同样的作业手册）：

```bash
mkdir -p .dsh/skills
git clone --depth 1 https://github.com/hencter/hugozh.git /tmp/hugozh
cp -r /tmp/hugozh/.dsh/skills/hugo-static-site .dsh/skills/
```

**用户目录**（全机器可用）：

```bash
mkdir -p ~/.dsh/skills
git clone --depth 1 https://github.com/hencter/hugozh.git /tmp/hugozh
cp -r /tmp/hugozh/.dsh/skills/hugo-static-site ~/.dsh/skills/
```

也可以让 DSH 直接指向技能包所在目录（`~/.dsh/profiles/<profile>/cordis.patch.yml`）：

```yaml
- id: skill-filesystem
  name: "@deepseek-ai/dsh-skill-filesystem"
  config:
    customSkillDirs:
      - <技能包所在目录>
```

### 三、校验安装结果（别只看命令退出码）

三条都满足才算装好：

1. **文件数与哈希对得上**：清单里是 **12 个文件**（`SKILL.md`、`README.md` 与 `references/` 下 10 个）。逐个比对 `sha256`，不要只看"下载成功"；
2. **相对路径没走样**：`references/gotchas.md` 必须在 `<技能目录>/references/gotchas.md`，而不是被拍平到根目录；
3. **代理真的能读到**：让它复述 `SKILL.md` 的第一条铁律（正文里但凡出现**未转义的短代码定界符**，就会让**整站**构建失败）。答不上来就说明没加载——此时重启会话或检查技能目录配置。

> 顺带一提：上面那句话我原本写成了行内代码里的裸定界符，结果**这一页自己构建失败**了。这条铁律对行内代码与围栏代码块都不豁免；要展示短代码语法，必须写成 `{{</* name */>}}` 这种转义形式。这条经验本身也记录在 [`references/gotchas.md`](/skill/references/gotchas.md) 的 G1。

> 用 `git clone` 装的话，`git` 会**转换行尾**。若你的平台是 Windows，克隆后哈希可能与清单不一致；这种情况下用清单里的 `url` 逐个取回（那才是「原样」），或直接以 `git clone` 的结果为准——差异只在 CRLF/LF，不影响技能内容。
>
> 说清楚校验的边界：清单里的 `sha256` 对应的是**本站发布的字节**（UTF-8 无 BOM、LF 行尾）。它验证的是「你拿到的与发布的一致」，**不验证**「这个技能包适合你的项目」——后者得靠你或代理读内容判断。

### 四、完全不用代理也能读

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
| `references/gotchas.md` | **G1–G26** 逐条「症状 → 真因 → 修法」，并标注 documented / observed / not documented |
| `references/seo.md` | 逐标签清单、结构化数据的 `jsonify` 陷阱、robots/sitemap、性能 |
| `references/shortcodes.md` | 短代码撰写：两种记法与渲染顺序、方法清单、嵌套、与 render hook 的分工 |
| `references/dates.md` | 三个日期字段与回退链、时区、本地化格式与相对时间 |
| `references/i18n.md` | **可选**：多语言结构、切换器、字符串表与占位符 |
| `references/versioning.md` | Git 该跟踪什么、`enableGitInfo`、提交驱动的「最后更新」 |
| `references/site-structure.md` | 主题分层、前置元数据契约、导航与多语言约定 |
| `references/versions.md` | 0.140 → 0.167 的逐版本改名与默认值变化 |
| `references/commands.md` | 命令笔记：只列工作流用到的标志，完整参考交给 `hugo gen doc` |
| `references/teaching-layer.md` | 人机同源的教学层契约：教学块字段、两个出口共用一份数据、覆盖度审计 |

## 它刻意不做的事

- **不写脚本**：能由 Hugo 自己回答的（`--printPathWarnings`、`hugo config`、`hugo list`、`hugo gen doc`）就不另造工具，避免与二进制跑偏；
- **不转抄可生成的内容**：CLI 手册、设置清单、高亮样式分别交给 `hugo gen doc`、`hugo config`、`hugo gen chromastyles`；
- **不把推断当文档**：无法指到来源的结论会标注为「实测」或「未记载」。

## 许可与贡献

技能包采用 **MIT** 许可，可自由取用、修改、再分发（本仓库的译文部分另有其许可，见[许可说明](/about/license/)）。

发现新的坑、或想补充某一类清单，欢迎提 Issue / PR——请尽量附上**可复现的最小例子**与 `hugo version`，这比结论本身更有价值。
