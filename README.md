# 🧩 dsh-stock-ticker

> DeepSeek Harness 的一个悬浮行情插件：在页面右上角显示一个可拖拽、可收起的半透明小窗，实时展示 A 股与港股核心指数。

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/badge/license-MIT-2563eb?style=flat-square" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/topic-dsh--plugin-7c3aed?style=flat-square" alt="dsh-plugin">
</p>

## ✨ 功能

- 悬浮窗口，**可拖拽**、**可收起**
- 深色近实色背景，红涨绿跌、锐利配色
- 每 5 秒自动刷新
- 每个指数只显示两项：**当前点位 + 涨跌幅**

显示的指数：

| 指数 | 代码 |
| --- | --- |
| 上证指数 | 000001 |
| 创业板指 | 399006 |
| 科创50 | 000688 |
| 恒生科技 | HSTECH |

## 🚀 快速开始（动态插件）

这是当前验证可用的安装方式：作为一个 **DeepSeek Harness 动态 Cordis 插件**载入。

1. 打开 DSH，让 agent 用动态插件工具创建插件（`cordis_define`）：

   - `code.host` 填 [`host.js`](./host.js) 的整段内容
   - `code.client` 填 [`client.js`](./client.js) 的整段内容

2. 然后 `cordis_run` 激活。客户端首次运行需要你在审批卡片里点「允许」。

3. 刷新页面后，右上角即出现悬浮行情窗。

> 两个文件里的代码就是 `cordis_define` 的 `code.host` / `code.client` 函数体，直接整段复制即可，无需修改。

## 🗂️ 代码结构

```
dsh-stock-ticker/
├── host.js        # Host 半区：curl 抓取腾讯行情接口并解析
├── client.js      # Client 半区：悬浮窗 UI + 5s 轮询
├── package.json   # 包清单（keywords 含 dsh-plugin）
├── cordis.patch.yml  # 持久化安装用的组合 patch 层（可选）
├── LICENSE
└── README.md
```

## 🔌 数据源

- 接口：`https://qt.gtimg.cn/q=sh000001,sz399006,sh000688,hkHSTECH`
- 免费、无需鉴权，返回纯文本的 `~` 分隔行
- Host 侧通过 `shell` 服务执行 `curl` 抓取（DSH 默认部署未注册 `web` fetch provider，因此不走 `web.fetch`）

## 📦 持久化安装（可选）

当前 `package.json` / `cordis.patch.yml` 已按社区 `dsh-plugin` 约定预留了包结构。要作为常驻插件（随 DSH 启动自动加载）还需要：

1. 把 Host 半区改写成 DSH 包入口（`export function apply(ctx)`），并把 Host→Client 通信从动态插件的 `harness.handle`/`host.call` 迁移到 DSH 的 remote / projection 机制；
2. 用标准工具链构建客户端 bundle（`dsh.client` → `./client`）；
3. 发布 npm 后通过 `dsh plugin --profile <profile> add dsh-stock-ticker@0.1.0` 安装。

欢迎 PR 补齐这一步。

## 📄 License

[MIT](./LICENSE)
