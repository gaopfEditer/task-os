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
npm run build:frontend   # 编译静态前端 → desktop/dist（必须先跑，否则壳里空白）
npm run tauri:dev        # 开发：build:frontend + 本地静态服(1420) + 桌面窗口
npm run tauri:build      # 发布：内嵌 dist，产物在 src-tauri/target/release/bundle/
```

`build:frontend`（同 `sync-board`）把根目录 `index.html`、`favicon.svg` 与 `board-extras/` 打入 `desktop/dist/`。**没有 Vite/webpack**，看板是单文件 HTML，靠 sync 即「编译」。`tauri dev` 会通过 `beforeDevCommand` 自动 build 并启动 `serve dist`；**不要**直接双击 `target/debug/*.exe` 而不开 1420 端口。

发布版 `tauri build` 将 dist 打进安装包，不依赖本地服务。

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

- **关注列表**：顶栏「配置」弹窗，逗号分隔输入（如 `BTC,ETH,SOL`），默认 **`BTC,ETH,SOL`**；仅 **CoinGecko / Binance** 交易所公开 REST，每 **1 分钟**刷新。
- **独立悬浮窗**：额外原生小窗（无边框；顶栏拖动），与主窗口共用同一份关注列表；悬停点 ↗ 可聚焦主窗口。
- **开机自启**：首次启动后会在 Windows「登录时启动项」注册当前运行的 **Task OS** 可执行文件。**不依赖**后台 `serve`：若本机没有 `127.0.0.1:1420`（开机、直接双击 exe），会自动加载**内嵌的 `dist`**。日常开发仍用 `npm run tauri:dev`（会起 1420）。长期开机自用建议 `npm run tauri:build` 安装**正式发布包**再开自启。
- **价格提醒**：为指定币种设置目标价与方向（涨到 ≥ / 跌到 ≤），触达后发送**系统桌面通知**（一次性，可在列表中删除）。
- **本地持久化**：`localStorage` 键 `taskos.desktop.watchlist`、`taskos.desktop.alerts`，**不同步**到 GitHub 任务文件。

## 行情气泡：优先消息页脚

悬浮窗圆形行情核仍是 **132×168**。圆下方有一条优先消息页脚，是 [msg-relay-service](https://github.com/gaopfEditer/msg-relay-service) 优先队列的桌面端，不另起协议。当前来源只有 **胖猫社区**（`pangmao`）；`GET /queue/priority/sources` 以后如果返回更多来源，页脚会逐行显示。

每一行依次是：**名称**、**消息数**（当前拉到的该来源消息）、**新交易卡片数**（带 `symbol` / `direction` / `yield`，或 `meta.via` 为 `ocr` / `text`，且还没在列表里打开过）、**特别提醒数**。名称是来源显示标签，灰色、只读，不能在设置里改名。双击某一行或页脚，打开完整列表（时间、来源、币种、方向、收益、短文、`meta.via`）。打开后这些交易卡片不再算「新」，已读 id 记在本机。「特别」是这些新卡里币种落在观察列表上的张数，不是另一套历史总数；已读后和新卡一起下降。新卡为 0 时仍显示「新卡 0」，特别同样始终显示（空列表时为「特别 0」）。

观察列表默认空，不预置币种。两处配置，本机键优先：

- 代码钩子：`board-extras/priority-footer.js` 的 `SPECIAL_SYMBOLS`（默认 `[]`）。改完后重新同步前端。
- 本机覆盖：`localStorage` 键 `taskos.desktop.priority.specialSymbols`。键存在时替换代码列表（空字符串表示没有特别命中）；键不存在时用 `SPECIAL_SYMBOLS`。逗号、分号或空白分隔。`BTC`、`BTCUSDT`、`btc/usdt`、`BTC.P` 视为同一币种。

临时确认：在气泡页执行 `localStorage.setItem('taskos.desktop.priority.specialSymbols', 'BTC')` 后重新加载。该频道里尚未打开过的 BTC 新交易卡会让「特别」加一，且不会大于「新卡」。`localStorage.removeItem('taskos.desktop.priority.specialSymbols')` 后回到代码列表。

连接方式与中转站相同：

- `GET {base}/queue/priority/sources`
- `GET {base}/queue/priority?source=pangmao&limit=200`（服务端默认 50、最多 200，从旧到新；列表展示这批最近记录）
- `WS {base 换成 ws/wss}/ws/priority?token=...`（不回放历史，只接之后的 `priority_card`）

HTTP 使用 `Authorization: Bearer <secret>` 和 `X-Relay-Secret`。失败或 WebSocket 断开只在控制台记一行并退避重试，**不影响**行情轮询。

msg-relay 不返回 CORS 头，气泡页面直接 `fetch` 带密钥会被 WebView 拦住。桌面壳因此用命令 `priority_http_get` 代发**同一个** GET，并且只允许路径以 `/queue/priority` 或 `/queue/priority/sources` 结尾。WebSocket 仍由气泡页面连接。若在普通浏览器里打开 `price-bubble.html`，需要中转站自己允许跨域，否则只能看到「未配置」或一直重试。

### 本机设置

主窗口「价格提醒」面板和气泡页脚的「连接设置」读写同一份配置。地址与密钥放在系统钥匙串（服务名 `com.taskos.desktop`，账户 `taskos.priority_config`），所以 `tauri dev` 和安装包看到的是同一条记录。`localStorage` 仍是缓存：钥匙串还没有记录时，会把本页已有的地址或密钥迁进去；钥匙串里已经有记录时（包括用户清空密钥）以钥匙串为准。

| localStorage 键 | 内容 |
|-----------------|------|
| `taskos.desktop.priority.baseUrl` | 中转根地址的缓存。未保存时使用 `https://op.g.ezcoin.ink`，已保存的自定义地址不会被覆盖 |
| `taskos.desktop.priority.secret` | 中转密钥的缓存，仅本机，由用户自己填写 |
| `taskos.desktop.priority.notify` | `0` 关闭新卡片系统通知；缺省或其它值表示开启 |
| `taskos.desktop.priority.seen` | 已打开的交易卡片 id |
| `taskos.desktop.priority.specialSymbols` | 特别提醒观察列表。键存在时替换代码里的 `SPECIAL_SYMBOLS`；不写这个键则用代码列表（默认空） |

来源名称（默认 **胖猫社区**）在页脚和两处设置里都是灰色只读，服务器来源列表还没到时仍显示这个默认名。

未保存地址、但本机已经有密钥时，启动后会按 `https://op.g.ezcoin.ink` 连接优先队列的 WebSocket。没有密钥时不发起连接，页脚保留「胖猫社区」，计数为 0，并标「未配置」。不要把真实密钥写进仓库。

实时 WebSocket 帧 `priority_card` 在卡片第一次出现、且不在已读列表里时，会发一条系统通知（macOS 通知中心横幅、Windows 通知）。启动时的 HTTP 快照和历史回填不通知。标题用来源显示名，正文在有币种、方向时带上它们。通知正文不含密钥。设置里的「新卡片系统通知」默认勾选。第一次通知前若系统权限还没授予，会先请求权限。

窗口变高之后，若上次保存的位置会超出屏幕，会夹回当前显示器，放不下时退回右下角。

### CSP

`src-tauri/tauri.conf.json` 的 `connect-src` 在打包时写死，不能按用户刚保存的地址再收紧。因此除原有行情主机外，还允许 `http:` / `https:` / `ws:` / `wss:`，这样本机填写的中转地址可以连上。已知公网主机 `op.g.ezcoin.ink`（本仓库日记里的 `https://op.g.ezcoin.ink`，msg-relay 部署目录也在这台主机上）另外写明。密钥不会出现在 CSP 里。优先使用 `https` / `wss`；从应用页面连明文 `http` 中转时，个别 WebView 可能按混合内容拦截。

## 与 GitHub Pages 的关系

- **不会**改动 Pages 发布方式；站点仍只发布仓库根目录静态文件。
- 桌面壳在 `desktop/`，业务 UI 仍是根 `index.html` 的单文件 SPA。

## 云 CI / 本机构建说明

在缺少 WebView 系统库的环境（例如部分 Linux CI）上可能无法完成 `tauri build` 链接步骤；结构与本 README 仍可在本地 Windows / macOS / 完整 Linux 桌面环境按上文命令构建。
