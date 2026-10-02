# 翻译作业手册（en → zh-cn）

- **来源（只读）**：`hugoDocs/content/en/<相对路径>` —— 禁止修改上游克隆。
- **目标**：`hugo-docs-zh/content/<相同相对路径>` —— 文件名、目录结构保持一致。
- 上游文档为 Apache-2.0（内容部分）；译文必须保留 `source` 字段指向原文。

---

## 一、会让整站构建失败的三条（违反即返工）

### 1. 上游短代码调用**不能照抄**

本站只有**主题自带的三个短代码**——`note`、`banner`、`quick-reference`（模板在 `themes/hugo-docs-theme/layouts/_shortcodes/`）——上游那些短代码在本站不存在，照抄会报
`failed to extract shortcode: template for shortcode "…" not found`，**整个站点**构建失败。必须改写：

| 上游写法 | 本站改写 |
| --- | --- |
| `{{< code-toggle file=hugo >}}…{{< /code-toggle >}}` | 普通围栏代码块，语言标 `toml`（或 `yaml`/`json`，按内容） |
| `{{< code-toggle file=content/x.md fm=true >}}…{{< /code-toggle >}}` | 围栏代码块，语言标 `toml` |
| `{{< new-in 0.146.0 >}}` / `{{< new-in 0.146.0 />}}` | 行内文字：**（0.146.0 新增）** |
| `{{< deprecated-in 0.144.0 >}}` | 行内文字：**（0.144.0 起弃用）** |
| `{{% include "/_common/xxx.md" %}}` | 打开 `hugoDocs/content/en/_common/xxx.md`，**翻译其内容并内联**到此处 |
| `{{< render-list-of-pages-in-section path=/functions >}}` | 一句话说明 + 链接该目录首页，或列出关键页；不要保留调用 |
| `{{% glossary-term foo %}}` | 中文词 + 链接 `/quick-reference/glossary/foo/` |
| `{{< eturl >}}` / `{{< chroma-lexers >}}` / `{{< per-lang-config-keys >}}` 等 | 转为等价文字或链接；**拿不准就用纯文字表述并省略该块** |
| `{{< img src="…" alt="…" >}}`（上游自定义） | 转成 Markdown 图片 `![alt](src)`；需要尺寸/类名时用原生 `<img>` |
| 任何其它 `{{< … >}}` / `{{% … %}}` 调用 | **一律改成纯 Markdown**，绝不留调用 |

**例外**：本站自有的 `note` 短代码可以用（标准记法）：
`{{< note type="warning" title="标题" >}}正文支持 Markdown{{< /note >}}`

### 2. 展示短代码写法时必须转义

正文里出现未转义的 `{{<` 或 `{{%` 会被 Hugo 在 Markdown **之前**提取。示例一律写成：

```text
{{</* name */>}}          显示为 {{< name >}}
{{%/* name */%}}          显示为 {{% name %}}
{{</*/* name */*/>}}      显示为 {{</* name */>}}（要展示转义写法本身时）
```

**围栏代码块不豁免**，行内代码也不豁免。

### 3. 不得出现字面串 `HAHAHUGOSHORTCODE`

它是 Hugo 短代码占位符前缀，出现会让该页渲染失败且报错**指向别处**。需要展示时写成
`H&#xfeff;AHAHUGOSHORTCODE`（`&#xfeff;` 实体必须写在代码 span **之外**，写在反引号里不会被解码）。

---

## 二、前置元数据契约（译文页统一六字段 + 可选的签名表）

必填六字段，顺序固定：`title`、`linkTitle`、`description`、`date`、`weight`、`source`。
**函数/方法页另需 `[params.functions_and_methods]` 表**（见本文末条第 12 点）——这不是「额外字段」，
而是参考页的核心信息，必须保留。

`weight` 口径（统一，避免兄弟目录并列）：
- **章节首页 `_index.md`**：由归属父目录下的**字母序**决定，第 n 个目录用 `10 × n`
  （例如 `functions/` 下 cast=10、collections=20、compare=30…）；父目录自身的 `_index.md` 固定 `10`。
  ⚠ 不要把一个父目录的全域序号写进子目录首页（那会让其它子目录全部排在它前面）。
- **叶子页**：在**自己所在目录内**按上游文件名顺序 `10、20、30…`，目录内不重复。
- `.translation/normalize-section-weights.ps1` 可机械校正章节首页 weight（幂等）。

```toml
+++
title = "中文标题"
linkTitle = "侧栏用短名"
description = "一句话中文导语，不要照抄英文原句"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/functions/strings/truncate/"
+++
```

- `weight`：同一目录内按上游文件名顺序，用 **10、20、30…** 递增，**不要重复**。
- `source`：`https://gohugo.io/` + 上游相对路径去掉 `.md`，**并全部转为小写**（Hugo 默认
  `disablePathToLower=false`，输出 URL 一律小写；这也是本站既有 200+ 页的写法），目录型页面以 `/` 结尾。
  例：`functions/collections/After.md` → `https://gohugo.io/functions/collections/after/`；
  `methods/page/TableOfContents.md` → `https://gohugo.io/methods/page/tableofcontents/`；
  `quick-reference/glossary/Page-Bundle.md` → `https://gohugo.io/quick-reference/glossary/page-bundle/`。
- 上游前置元数据里的别名/分类等**不要照搬**；只保留上述六字段（可另加上游已有的 `aliases`，如确有需要）。

---

## 三、正文约定

1. 正文**从 `##` 开始**，绝不出现一级标题。
2. **站内链接一律根相对**：`[截断](/functions/strings/truncate/)`。只有 `source` 字段写外链。
3. **上游的 `[术语](g)` 写法原样保留，且括号里的链接文字写英文原词**（如 `[resource getter](g)`）：
   本站的术语表索引以**术语页文件名（英文 slug）**为键，写成中文会匹配不上、退化为纯文本。
   句子里需要中文时写成「[resource getter](g)（资源获取器）」或直接在正文用中文，链接文字保持英文。
   **不要**改写成 `[术语](/quick-reference/glossary/…)`（slug 容易写错）。
4. 代码、标识符、函数名、键名、CLI 参数、文件名**不译**；代码块保留原语言标记。
5. 原文的 `> [!NOTE]` / `> [!TIP]` 等 callout 语法保持原样。
6. 表格、列表结构保持；不要为了「好看」改动结构。
7. 上游的 `_index.md` 往往是短索引页，照译即可，不要额外扩写。
8. 术语表页（`quick-reference/glossary/*.md`）上游前置元数据里的 `reference` 字段是「参见主文档页」，
   请把它转成正文末尾的一行：`参见：[中文标题](/对应站内路径/)`。
9. **代码围栏的属性写法原样保留**：```go-html-template {file="layouts/x.html"}、{linenos=inline} 等。
   主题已有代码块渲染钩子（`layouts/_markup/render-codeblock.html`），会把 `file` 渲染成文件名标题，
   不会漏成非法 HTML 属性。
10. **块级属性独立一行原样保留**（如表格后的 `{.no-wrap-first-col}`）：本站已按上游开启
    `markup.goldmark.parser.attribute.block = true`；删掉反而与英文原文不一致。
11. `> [!NOTE]` / `> [!TIP]` / `> [!WARNING]` / `> [!IMPORTANT]` / `> [!CAUTION]` **原样保留**：
    主题已有引用块渲染钩子（`layouts/_markup/render-blockquote.html`），会渲染成带中文标签的警示框。
12. **函数/方法页必须保留签名信息**。上游前置元数据里的 `params.functions_and_methods`
    （`signatures` / `returnType` / `aliases`）是参考页最核心的内容，请转成 TOML 表放在前置元数据末尾：

    ```toml
    [params.functions_and_methods]
    signatures = ["strings.Chomp STRING"]
    returnType = "any"
    aliases = ["chomp"]
    ```

    缺哪项就省略哪项（`aliases: []` 视为缺项）。主题的 `partials/function-meta.html` 会把它渲染成
    「签名 / 返回类型 / 别名」一行。**若已漏掉也不必返工**：`.translation/backfill-signatures.ps1`
    会从上游机械回填（幂等）。

## 四、翻译风格

- 忠实、简洁、可操作；**不扩写、不删减技术细节**，不添加原文没有的结论。
- 专有名词首次出现写「中文（english）」，其后沿用中文；下文术语表优先。
- 函数/方法的**签名与返回值**必须与原文一致；`→` 示例结果保持原样。
- 拿不准的技术表述，宁可保留英文原词，也不要臆造中文说法。

---

## 四之二、教学层（本地化增补，与上游直译的区别所在）

上游文档刻意克制：默认读者懂命令行、能自己补齐上下文、遇到报错会自己查。**本站要补的正是这一层**——让没有 AI 辅助的普通读者也能照着做完。做法是「**正文增补 + 可选的前置元数据教学块**」，而不是另起一套页面。

### 4.2.1 什么时候增补

按页面角色决定力度（**只增不删**：上游的技术细节、命令、签名、默认值一律保留）：

| 页面角色 | 例子 | 增补要求 |
| --- | --- | --- |
| **教程 / 上手页** | `getting-started/*`、`installation/*` | **必须**：目标、前置、分步、每步验证标准、常见坑表、下一步 |
| **流程型章节页** | `templates/*`、`render-hooks/*`、`hugo-pipes/*`、`host-and-deploy/*` | 每个小节要有「这段在解决什么问题」+ 可运行的最小示例 + 结果的样子 |
| **参考页**（API） | `functions/*`、`methods/*`、`commands/*` | 忠实翻译为主；**补「什么时候用 / 什么时候别用」与一个完整可用示例**，并说明返回值边界（空、nil、类型不符时） |
| **术语 / 速查** | `quick-reference/*` | 保持条目化，不扩写 |
| **章节首页 `_index.md`** | 各章 | 必须有「读完本章你应该能够」+ 阅读顺序（范例见 `getting-started/_index.md`） |

### 4.2.2 正文增补的写法

- **解释「为什么」**：上游只写「不要用 Windows PowerShell」，本地化要写出**原因与后果**（实测：Windows PowerShell 5.1 的 `echo … >>` 会写 UTF-16LE+BOM，Hugo 报 `toml: invalid character at start of key: U+00FF`）。范例见 `getting-started/quick-start.md`。
- **给验证标准**：每个关键步骤之后写「你应当看到什么」。**能被检验的断言才有教学价值**。
- **给失败路径**：至少覆盖「命令找不到 / 没有报错但结果不对 / 报错看不懂」三类，并链接到 `/troubleshooting/`。
- **标明实测与文档的分界**：上游没写、由本站实测得出的结论，写成「实测：……」；**不得把推断写成官方结论**。
- **命令块保持原样**：语言标记、`{file=…}` 属性、转义写法都不动（见第一、三节）。
- **中文读者视角**：Windows/macOS/Linux 三平台差异、国内网络环境（代理、镜像源、`GOPROXY`）该写就写。

### 4.2.3 前置元数据的 `[params.teach]` 表（可选）

教程/上手/流程型页面**建议**加，参考页可不加。

> ⚠ **TOML 作用域铁律**：`[表头]` 之后的裸键会归入该表。所以**六个标量字段必须写在所有表头之前**，
> 表头只能出现在 `+++` 块的尾部。把 `source` 写在 `[params.teach]` 之后，它就变成
> `params.teach.source`——六字段契约断了，页脚也不再有原文链接（Hugo 不报错，只静默丢失）。
> 正确顺序：`title / linkTitle / description / date / weight / source` → `[params.teach]` →
> `[params.functions_and_methods]`。

```toml
+++
title = "中文标题"
linkTitle = "侧栏短名"
description = "一句话中文导语"
date = 2026-10-02
weight = 10
source = "https://gohugo.io/getting-started/quick-start/"

[params.teach]
difficulty = "入门"          # 入门 / 进阶 / 参考
time = "15–20 分钟"          # 字符串；不要写成纯数字（TOML 会解析成整数/Epoch）
prereq = ["…", "…"]          # 读者开始前需要具备什么（支持 Markdown）
outcomes = ["…", "…"]        # 读完之后能做到什么（支持 Markdown）
next = ["/installation/", "/getting-started/basic-usage/"]  # 站内路径
+++
```

- 五个键**全部可选**，都缺就整块不渲染（旧页面因此不受影响）；
- 渲染出口：HTML 由 `partials/teach-box.html` 输出正文开头的面板，Markdown 出口由 `partials/teach-md.html` 输出同源引用块——**两者读同一份数据，人类与 AI 不会看到分叉的事实**；
- 条目句末**不要**再写分号/句号，模板会自己加列表符号；
- 早期页面若写成顶层 `[teach]` 表，模板仍兼容；`readAfter` 是 `next` 的旧名，也仍兼容；
- 只用 `write`/`edit` 工具改文件，**不要用 PowerShell 重定向写内容文件**（会引入 BOM/编码风险）。

### 4.2.4 术语表（沿用本站既有译法）

| 英文 | 译法 |
| --- | --- |
| front matter | 前置元数据（front matter） |
| page bundle / branch / leaf | 页面包 / 分支包 / 叶子包 |
| shortcode | 短代码（shortcode） |
| partial | 局部模板（partial） |
| render hook | 渲染钩子（render hook） |
| taxonomy | 分类法（taxonomy） |
| section | section（内容区块） |
| template / context | 模板 / 上下文 |
| layout / publish | 布局 / 发布 |
| nil | nil（不译） |

---

## 五、自检（提交前必须做）

> ⚠ **必须在 `hugo-docs-zh/` 目录下执行**。在工作区根目录跑 `hugo` 会构建一个**空站点**并返回
> `exit=0`——这是假阳性，不能作为自检证据。

```powershell
# 只校验语法与渲染，不写 public/，避免与其它代理并发冲突
hugo --ignoreCache --renderToMemory --quiet
```

- 退出码必须是 **0**；
- 若报错指向**你批次之外**的文件，可能是别的代理正在写，忽略即可；**指向你批次内的必须修**；
- 用搜索工具确认你批次内**没有**未转义的 `{{<` / `{{%`（除 `note` 调用外）与字面串 `HAHAHUGOSHORTCODE`；
- 不要运行 `hugo server`，不要运行不带 `--renderToMemory` / `--destination` 的 `hugo`（会与其它代理抢 `public/`）。

## 六、汇报格式

```
批次：<目录>
完成：<n>/<m> 页
自检：exit=0，未转义短代码 0，HAHAHUGOSHORTCODE 0
改写：<列出你把哪些上游短代码改成了什么>（没有就写「无」）
疑难：<拿不准的术语/段落，列原文位置>
```
