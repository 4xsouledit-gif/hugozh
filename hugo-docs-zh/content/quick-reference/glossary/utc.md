+++
title = "协调世界时（UTC）"
linkTitle = "UTC"
description = "全球用于规范时钟与时间的首要时间标准，也是民用时间与时区的基础。"
date = 2026-10-02
weight = 1490
source = "https://gohugo.io/quick-reference/glossary/utc/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = [
  "判断日期显示差一天、或页面根本没进构建，是不是时区与日期字段造成的",
]
next = ["/functions/time/astime/"]
+++

_UTC_ 是协调世界时（Coordinated Universal Time）的缩写，是全球用于规范时钟与时间的首要时间标准。它是全球民用时间与时区的基础。

参见：[协调世界时（维基百科）](https://en.wikipedia.org/wiki/Coordinated_Universal_Time)

## 为什么重要

前置元数据里不带时区的日期，Hugo 会按项目配置的 `timeZone` 解析，未配置时落到 `Etc/UTC`；而模板输出又保留值本身带有的偏移量。于是同一篇内容在不同机器、不同时区下可能显示成不同的日期，甚至因 `date` 被判定在未来而整页不进构建（`hugo list future` 可查，加 `--buildFuture` 才构建）。要稳定输出，就给日期写明确的 [IANA](g) 时区名或偏移量，机器可读的时间再用固定布局输出。

延伸阅读：[解析日期与时间](/functions/time/astime/)、[日期格式](/functions/time/format/)
