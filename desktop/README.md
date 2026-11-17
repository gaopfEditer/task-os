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
npm run tauri:dev      # 开发：先 sync-board，再从 desktop/dist 内嵌加载（不依赖 localhost）
npm run tauri:build    # 发布：产物在 src-tauri/target/release/bundle/
```

`npm run sync-board` 会把仓库根的 `index.html`、`favicon.svg` 及 `board-extras/` 复制到 `desktop/dist/`。**桌面壳默认始终读 `dist/`**，即使未单独启动 `npm run dev:web`，窗口也有内容。改根目录看板后重新 `tauri:dev` / `tauri:build` 即可同步。

可选：另开终端 `npm run dev:web` 在浏览器预览 `http://localhost:1420`（与桌面内嵌页同源内容，非必须）。

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

- **关注列表**：顶栏「关注 / 提醒」面板，逗号分隔输入（如 `BTC,ETH,SOL`），默认 **`BTC,ETH,SOL`**；仅 **CoinGecko / Binance** 交易所公开 REST，每 **3 分钟**刷新。
- **独立悬浮窗**：额外原生小窗（无边框；顶栏拖动），与主窗口共用同一份关注列表；悬停点 ↗ 可聚焦主窗口。
- **开机自启**：首次启动后会在 Windows「登录时启动项」注册 **Task OS**（开发模式 `tauri dev` 注册的是当前 debug 可执行文件；正式安装包用 `tauri:build` 产物）。
- **价格提醒**：为指定币种设置目标价与方向（涨到 ≥ / 跌到 ≤），触达后发送**系统桌面通知**（一次性，可在列表中删除）。
- **本地持久化**：`localStorage` 键 `taskos.desktop.watchlist`、`taskos.desktop.alerts`，**不同步**到 GitHub 任务文件。

## 行情气泡：优先消息页脚

悬浮窗圆形行情核仍是 **132×168**。圆下方有一条优先消息页脚，是 [msg-relay-service](https://github.com/gaopfEditer/msg-relay-service) 优先队列的桌面端，不另起协议。当前来源只有 **胖猫社区**（`pangmao`）；`GET /queue/priority/sources` 以后如果返回更多来源，页脚会逐行显示。

每一行依次是：**名称**、**消息数**（当前拉到的该来源消息）、**新交易卡片数**（带 `symbol` / `direction` / `yield`，或 `meta.via` 为 `ocr` / `text`，且还没在列表里打开过）。名称是来源显示标签，灰色、只读，不能在设置里改名。双击某一行或页脚，打开完整列表（时间、来源、币种、方向、收益、短文、`meta.via`）。打开后这些交易卡片不再算「新」，已读 id 记在本机。

连接方式与中转站相同：

- `GET {base}/queue/priority/sources`
- `GET {base}/queue/priority?source=pangmao&limit=200`（服务端默认 50、最多 200，从旧到新；列表展示这批最近记录）
- `WS {base 换成 ws/wss}/ws/priority?token=...`（不回放历史，只接之后的 `priority_card`）

HTTP 使用 `Authorization: Bearer <secret>` 和 `X-Relay-Secret`。失败或 WebSocket 断开只在控制台记一行并退避重试，**不影响**行情轮询。

msg-relay 不返回 CORS 头，气泡页面直接 `fetch` 带密钥会被 WebView 拦住。桌面壳因此用命令 `priority_http_get` 代发**同一个** GET，并且只允许路径以 `/queue/priority` 或 `/queue/priority/sources` 结尾。WebSocket 仍由气泡页面连接。若在普通浏览器里打开 `price-bubble.html`，需要中转站自己允许跨域，否则只能看到「未配置」或一直重试。

### 本机设置

主窗口「关注 / 提醒」面板，或气泡页脚齿轮 / 列表里的「连接设置」，保存：

| localStorage 键 | 内容 |
|-----------------|------|
| `taskos.desktop.priority.baseUrl` | 中转根地址。未保存时使用 `https://op.g.ezcoin.ink`，已保存的自定义地址不会被覆盖 |
| `taskos.desktop.priority.secret` | 中转密钥，仅本机，由用户自己填写 |
| `taskos.desktop.priority.seen` | 已打开的交易卡片 id |

来源名称（默认 **胖猫社区**）在页脚和两处设置里都是灰色只读，服务器来源列表还没到时仍显示这个默认名。

未保存地址、但本机已经有密钥时，启动后会按 `https://op.g.ezcoin.ink` 连接优先队列的 WebSocket。没有密钥时不发起连接，页脚保留「胖猫社区」，计数为 0，并标「未配置」。不要把真实密钥写进仓库。

窗口变高之后，若上次保存的位置会超出屏幕，会夹回当前显示器，放不下时退回右下角。

### CSP

`src-tauri/tauri.conf.json` 的 `connect-src` 在打包时写死，不能按用户刚保存的地址再收紧。因此除原有行情主机外，还允许 `http:` / `https:` / `ws:` / `wss:`，这样本机填写的中转地址可以连上。已知公网主机 `op.g.ezcoin.ink`（本仓库日记里的 `https://op.g.ezcoin.ink`，msg-relay 部署目录也在这台主机上）另外写明。密钥不会出现在 CSP 里。优先使用 `https` / `wss`；从应用页面连明文 `http` 中转时，个别 WebView 可能按混合内容拦截。

## 与 GitHub Pages 的关系

- **不会**改动 Pages 发布方式；站点仍只发布仓库根目录静态文件。
- 桌面壳在 `desktop/`，业务 UI 仍是根 `index.html` 的单文件 SPA。

## 云 CI / 本机构建说明

在缺少 WebView 系统库的环境（例如部分 Linux CI）上可能无法完成 `tauri build` 链接步骤；结构与本 README 仍可在本地 Windows / macOS / 完整 Linux 桌面环境按上文命令构建。
