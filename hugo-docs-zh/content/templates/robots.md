+++
title = "robots.txt"
linkTitle = "robots.txt"
description = "用模板生成自定义 robots.txt，控制搜索引擎的抓取范围：开关、查找顺序、安全的最小示例与验证方法。"
date = 2026-10-01
weight = 20
source = "https://gohugo.io/templates/robots/"

[params.teach]
difficulty = "入门"
time = "10 分钟"
prereq = [
  "站点能正常构建：`hugo --renderToMemory` 退出码为 0。",
  "知道项目配置文件的路径（通常是项目根目录的 `hugo.toml`）。",
]
outcomes = [
  "打开 robots.txt 生成，并确认 `public/robots.txt` 的内容与预期一致；",
  "写出「只屏蔽个别目录、其余开放」的模板，而不是把整站 Disallow 掉；",
  "知道模板查找顺序，能在不修改主题的前提下覆盖主题的同名模板；",
  "在没有模板的情况下改用 `static/robots.txt` 静态文件。",
]
next = ["/templates/sitemap/", "/host-and-deploy/"]

+++

## 这一页解决什么问题

`robots.txt` 是放在站点根目录、给爬虫看的「访问须知」：它声明哪些路径允许抓、哪些不允许。Hugo 可以从模板生成这份文件，好处是**规则可以跟着内容走**——比如按页面集合生成、按环境生成，而不是手写一份静态清单。

这一页要弄清三件事：怎么打开开关、默认内容是什么、以及模板写错时后果有多严重（一条 `Disallow: /` 就能让整站从搜索结果里消失）。

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

> [!NOTE]
> `enableRobotsTXT` 是**顶层配置键**。在 TOML 里，顶层裸键必须写在任何 `[table]`（如 `[params]`、`[markup]`）之前；写在表头之后会被解析成 `params.enableRobotsTXT` 一类的键而被静默忽略，现象就是「配置改了却不生效」。

### 最小可运行示例与验证

打开开关后直接构建：

```bash
hugo
```

你应当看到 `public/robots.txt` 出现，内容为：

```text
User-agent: *
```

用本地服务器验证更直观（改配置后记得重启 `hugo server`，它是启动时读取配置的）：

```bash
hugo server
```

浏览器访问 `http://localhost:1313/robots.txt`，应当直接显示上面两行文本，**而不是站点的 404 页面**。如果显示的是 404 页面，说明配置文件里 `enableRobotsTXT` 没生效（多半是写错了位置或拼写）。

## 模板查找顺序

可以用自定义模板覆盖内建模板。Hugo 按下面的顺序查找 `robots.txt` 模板，使用第一个找到的文件：

1. `/layouts/robots.txt`
1. `/themes/<THEME>/layouts/robots.txt`

项目自己的 `layouts` 目录优先级高于主题目录，因此覆盖主题的写法不需要改动主题文件，把同名文件放进项目 `layouts` 根目录即可。这也意味着**升级主题不会冲掉你的定制**，而把改动写进主题目录则会在下次更新时丢失。

## 模板示例

模板可以访问常规的页面集合与站点对象，因此能按页面动态生成规则。下面这个模板为站点上的每个页面各生成一条 `Disallow` 指令：

```text {file="layouts/robots.txt"}
User-agent: *
{{ range .Pages }}
Disallow: {{ .RelPermalink }}
{{ end }}
```

上面这份模板输出的 `robots.txt` 会给每个页面都加上一条 `Disallow` 指令，其效果是**禁止**搜索引擎抓取站点上的任何页面。它准确地演示了「模板能做什么」，但不要原样用于生产站点。

### 结果长什么样

上面的模板渲染出来是这样（节选）：

```text
User-agent: *
Disallow: /
Disallow: /templates/
Disallow: /templates/404/
Disallow: /functions/
...
```

也就是说，除根路径以外，站点上的每个页面都被逐条点名屏蔽了，文件会随着页面数量线性变长。**能跑通 ≠ 该这么用**：真实站点通常只屏蔽少数路径。

### 只屏蔽个别目录（推荐写法）

下面的模板反过来用：整站开放，只挡住后台、搜索结果页这类不该被收录的路径，同时声明站点地图的位置。

```text {file="layouts/robots.txt"}
User-agent: *
Disallow: /admin/
Disallow: /search/

Sitemap: {{ "sitemap.xml" | absURL }}
```

你应当看到 `public/robots.txt` 的内容与模板一一对应，其中 `Sitemap:` 一行是**绝对地址**（例如 `https://example.org/sitemap.xml`）。用 `absURL` 而不是手写域名，站点换域名时这份文件不用改。

模板里也可以写 `Allow` 指令以及针对特定爬虫的 `User-agent` 分组，这些都属于 robots.txt 本身的语法，与模板写法无关。值得注意的是：`Disallow` 只是「请求不要抓取」的约定，**不能阻止别人访问**，真正的访问控制要靠服务器鉴权。

## 改用静态文件

> [!NOTE]
> 如果不想用模板，也可以把 `robots.txt` 当作静态文件处理：
>
> 1. 在项目配置中把 `enableRobotsTXT` 设为 `false`；
> 1. 在 `static` 目录下创建 `robots.txt` 文件。
>
> 注意构建时 Hugo 会把 `static` 目录中的所有内容原样复制到 `publishDir`（通常是 `public`）的根目录，所以静态文件会出现在与模板生成结果相同的位置。

两者的取舍：静态文件更简单、所见即所得，适合规则基本不变的中小站点；模板适合规则需要跟随内容变化（例如按分类、按语言、按环境开关）的站点。**两处同时存在时会互相干扰**，只保留一种。

## 常见坑

| 类别 | 现象 | 原因与处理 |
| --- | --- | --- |
| 命令找不到 | `hugo: command not found` / 「不是内部或外部命令」 | Hugo 没装或没进 `PATH` → [安装 Hugo](/installation/) |
| 没报错但结果不对 | 配置里明明写了 `enableRobotsTXT = true`，就是没有 `public/robots.txt` | 键写在了 `[params]`、`[markup]` 等表头之后，被当成该表的子键 → 把它移到所有 `[table]` 之前，重新构建 |
| 没报错但结果不对 | 文件生成了，但内容是旧规则 | 同时存在模板与 `static/robots.txt`，或浏览器/爬虫缓存了旧文件 → 只保留一处来源，用无痕窗口访问 `/robots.txt` 复核 |
| 没报错但结果不对 | 站点突然从搜索结果里消失 | 模板照抄了「逐页 Disallow」的示例，等于全站禁止收录 → 改用「只屏蔽个别目录」的写法 |
| 报错看不懂 | 构建时报模板执行失败，行号指向 `layouts/robots.txt` | 模板里的动作写错（少 `end`、变量名拼错）→ 按报错行号定位；本文件是纯文本模板，注意冒号后必须留一个空格（`Disallow: /admin/`） |

更多排查入口见[故障排查](/troubleshooting/)。
