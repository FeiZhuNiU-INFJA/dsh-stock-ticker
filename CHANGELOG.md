# Changelog

本项目的所有值得一提的变更都会记录在此文件。格式遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/)，版本号遵循 [SemVer](https://semver.org/lang/zh-CN/)。

## [0.1.0] - 2026-08-21

### Added

- 作为 DSH bundle 安装：`dsh.bundle.patch` 指向 `cordis.patch.yml`，可经 `dsh plugin add` 安装。
- Host 入口 `lib/index.js` 注册同源路由 `/dsh-stock-ticker/quotes`，经 `shell` + `curl` 抓取腾讯行情并返回无损 JSON。
- Client bundle `lib/client.js` 渲染悬浮行情小窗，每 5 秒轮询一次。
- 悬浮窗口可拖拽、可收起；背景跟随 DSH 主题色（80% 透明度），红涨绿跌。
- 显示四只指数：上证指数（000001）、创业板指（399006）、科创50（000688）、恒生科技（HSTECH）。

### Fixed

- 修复负零（`-0`）导致 JSON 序列化被拒的问题。
