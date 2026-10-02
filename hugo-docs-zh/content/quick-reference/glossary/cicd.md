+++
title = "CI/CD"
linkTitle = "CI/CD"
description = "持续集成与持续交付或持续部署的缩写，以及常用于 Hugo 站点的平台。"
date = 2026-10-02
weight = 180
source = "https://gohugo.io/quick-reference/glossary/cicd/"

[params.teach]
difficulty = "参考"
prereq = ["在文档里遇到不认识的 Hugo 术语时查阅"]
outcomes = ["判断本地能构建、CI 上失败时该先比对哪两项环境差异"]
next = ["/host-and-deploy/"]
+++

## CI/CD

_CI/CD_ 这一术语是持续集成（Continuous Integration）与持续交付（Continuous Delivery）或持续部署（Continuous Deployment）的缩写，具体指哪一个取决于语境。

用于构建和部署 Hugo 站点的常见 _CI/CD_ 平台包括 [Cloudflare][]、[GitHub Pages][]、[GitLab Pages][]、[Netlify][]、[Render][] 与 [Vercel][]。

参见：[CI/CD（维基百科）](https://en.wikipedia.org/wiki/CI/CD)

## 为什么重要

CI/CD 决定你每次推送之后站点怎么自动更新：平台拉代码、跑 `hugo`、把产物部署出去。Hugo 是单个二进制、没有运行时依赖，流程本身很少出问题，坑多在环境——平台预装的 Hugo 版本偏旧，或主题、子模块没被拉下来，构建出的页面就缺样式。本地能过、CI 上失败时，先对比两边的 `hugo version` 与子模块开关。

延伸阅读：[部署概览](/host-and-deploy/) · [GitHub Pages](/host-and-deploy/host-on-github-pages/)

[Cloudflare]: /host-and-deploy/host-on-cloudflare/
[GitHub Pages]: /host-and-deploy/host-on-github-pages/
[GitLab Pages]: /host-and-deploy/host-on-gitlab-pages/
[Netlify]: /host-and-deploy/host-on-netlify/
[Render]: /host-and-deploy/host-on-render/
[Vercel]: /host-and-deploy/host-on-vercel/
