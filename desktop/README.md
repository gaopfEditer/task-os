# Task OS 桌面版（Tauri）

本目录将仓库根目录的网页看板（`../index.html`）打包为原生桌面窗口。**数据仍来自 GitHub**（`raw.githubusercontent.com` 读取、`api.github.com` 写入），与 [线上看板](https://gaopfediter.github.io/task-os/) 共用同一仓库内容；在「设置」里粘贴的细粒度 PAT 与网页版相同。

## 前置依赖

按 [Tauri 官方前置条件](https://tauri.app/start/prerequisites/) 安装：

| 平台 | 要点 |
|------|------|
| **Windows** | Microsoft C++ Build Tools、WebView2（Win10/11 通常已带） |
| **macOS** | Xcode Command Line Tools |
| **Linux** | `webkit2gtk`、 `rsvg2` 等（见官方文档） |

还需：

- [Rust](https://rustup.rs/)（stable，建议 ≥ 1.85；本目录含 `rust-toolchain.toml`）
- Node.js 18+ 与 npm

## 开发与构建

```bash
cd desktop
npm install
npm run tauri:dev      # 开发：同步根目录 index.html → dist/，本地静态服务 + 桌面窗口
npm run tauri:build    # 发布：产物在 src-tauri/target/release/bundle/
```

`npm run sync-board` 会把仓库根的 `index.html`、`favicon.svg` 复制到 `desktop/dist/`（不打包整个仓库，避免把 `tasks/` 等打进安装包）。改根目录看板后重新 dev/build 即可同步。

### 自定义图标（可选）

```bash
cd desktop
npm run tauri icon ../favicon.svg
```

会重新生成 `src-tauri/icons/*`。

## 令牌存储

- 网页：仅 `localStorage` 键 `taskos.github_token`。
- 桌面：保存/清除时写入 **系统钥匙串**（服务名 `com.taskos.desktop`），并同步到同名 `localStorage`，看板逻辑无需分叉。
- 启动时若钥匙串有令牌而 localStorage 为空，会自动灌入。

## 桌面专属：行情与价格提醒

仅 Tauri 打包的 `dist/index.html` 会注入 `board-extras/` 脚本，**GitHub Pages 上的根 `index.html` 不含此功能**。

- **关注列表**：顶栏「关注 / 提醒」面板，逗号分隔输入（如 `BTC,ETH,SOL`），默认 `BTC,ETH,SOL`；保存后通过 Binance 公开 WebSocket（`miniTicker`）推送现价，失败时降级为 REST 轮询。
- **价格提醒**：为指定币种设置目标价与方向（涨到 ≥ / 跌到 ≤），触达后发送**系统桌面通知**（一次性，可在列表中删除）。
- **本地持久化**：`localStorage` 键 `taskos.desktop.watchlist`、`taskos.desktop.alerts`，**不同步**到 GitHub 任务文件。

## 与 GitHub Pages 的关系

- **不会**改动 Pages 发布方式；站点仍只发布仓库根目录静态文件。
- 桌面壳在 `desktop/`，业务 UI 仍是根 `index.html` 的单文件 SPA。

## 云 CI / 本机构建说明

在缺少 WebView 系统库的环境（例如部分 Linux CI）上可能无法完成 `tauri build` 链接步骤；结构与本 README 仍可在本地 Windows / macOS / 完整 Linux 桌面环境按上文命令构建。
