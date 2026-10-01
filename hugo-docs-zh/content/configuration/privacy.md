+++
title = "隐私配置"
linkTitle = "隐私配置"
description = "配置内嵌模板以帮助满足各地区的隐私法规。"
date = 2026-10-01
weight = 230
source = "https://gohugo.io/configuration/privacy/"
+++

## 责任划分

站点作者有责任确保站点符合所在地区的隐私法规，包括但不限于：

- **GDPR**（通用数据保护条例）：适用于欧盟与欧洲经济区内的个人。
- **CCPA**（加州消费者隐私法案）：适用于加利福尼亚州居民。
- **CPRA**（加州隐私权法案）：在 CCPA 的基础上扩展，提供更强的消费者隐私保护。
- **CDPA**（弗吉尼亚州消费者数据保护法）：适用于收集、处理或出售弗吉尼亚州居民个人数据的企业。

Hugo 的隐私设置可以协助你履行合规义务，但最终责任仍在站点作者。

## 内嵌模板

Hugo 提供内嵌模板来简化项目与内容的创建，其中一些模板会与外部服务交互。例如 `youtube` 短代码会连接 YouTube 的服务器，以便把视频嵌入页面。

这些模板中有一些带有增强隐私的设置，下面列出 Hugo 内嵌模板的默认隐私配置。

## 默认配置

> 这些设置只影响 Hugo 部分内嵌模板的行为，未必影响第三方模块或主题所提供的模板。

```toml
[privacy]
  [privacy.disqus]
    disable = false
  [privacy.googleAnalytics]
    disable = false
    respectDoNotTrack = true
  [privacy.instagram]
    disable = false
    simple = false
  [privacy.vimeo]
    disable = false
    enableDNT = false
    simple = false
  [privacy.x]
    disable = false
    enableDNT = false
    simple = false
  [privacy.youTube]
    disable = false
    privacyEnhanced = false
```

## 设置项

| 键名 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `privacy.disqus.disable` | `bool` | `false` | 是否禁用 Disqus 内嵌模板。 |
| `privacy.googleAnalytics.disable` | `bool` | `false` | 是否禁用 Google Analytics 内嵌模板。 |
| `privacy.googleAnalytics.respectDoNotTrack` | `bool` | `true` | 是否尊重浏览器的「请勿跟踪」（Do Not Track）设置。 |
| `privacy.instagram.disable` | `bool` | `false` | 是否禁用 Instagram 短代码。 |
| `privacy.instagram.simple` | `bool` | `false` | 是否启用简单模式以生成图片卡片。设为 `true` 时 Hugo 生成不含 JavaScript 的静态卡片，该模式只支持图片卡片，图片直接从 Instagram 服务器获取。 |
| `privacy.vimeo.disable` | `bool` | `false` | 是否禁用 Vimeo 短代码。 |
| `privacy.vimeo.enableDNT` | `bool` | `false` | 是否阻止 Vimeo 播放器跟踪会话数据与分析数据。 |
| `privacy.vimeo.simple` | `bool` | `false` | 是否启用简单模式。设为 `true` 时缩略图从 Vimeo 获取并叠加播放按钮，点击后在新标签页打开视频。 |
| `privacy.x.disable` | `bool` | `false` | 是否禁用 X 短代码。 |
| `privacy.x.enableDNT` | `bool` | `false` | 是否阻止 X 把帖子和嵌入页面的数据用于个性化推荐与广告。 |
| `privacy.x.simple` | `bool` | `false` | 是否启用简单模式。设为 `true` 时 Hugo 构建不含 JavaScript 的帖子静态版本。 |
| `privacy.youTube.disable` | `bool` | `false` | 是否禁用 YouTube 短代码。 |
| `privacy.youTube.privacyEnhanced` | `bool` | `false` | 是否阻止 YouTube 在访问者播放嵌入视频之前存储其信息。 |

所有开关的默认值都是 `false`，也就是说内嵌模板默认可用、默认不启用增强隐私的变体。禁用某个模板后，Hugo 在渲染时不会再连接对应的外部服务。

## 示例

下面的配置保留 Google Analytics 与 Vimeo、YouTube，但要求它们使用隐私友好的变体，同时彻底禁用 Instagram 与 X：

```toml
[privacy]
  [privacy.googleAnalytics]
    disable = false
    respectDoNotTrack = true
  [privacy.instagram]
    disable = true
  [privacy.vimeo]
    disable = false
    enableDNT = true
    simple = true
  [privacy.x]
    disable = true
  [privacy.youTube]
    disable = false
    privacyEnhanced = true
```

## 延伸阅读

- [配置](/configuration/)
- [评论](/content-management/comments/)
- [短代码](/shortcodes/)
