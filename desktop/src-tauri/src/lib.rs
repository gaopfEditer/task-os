use keyring::Entry;
use serde::{Deserialize, Serialize};
use std::fs;
use std::net::{SocketAddr, TcpStream};
use std::path::PathBuf;
use std::time::Duration;
use tauri::{
    LogicalSize, Manager, PhysicalPosition, Url, WebviewUrl, WebviewWindow, WebviewWindowBuilder,
    WindowEvent,
};
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_notification::NotificationExt;
use tauri_utils::config::Color;

const KEYRING_SERVICE: &str = "com.taskos.desktop";
const KEYRING_USER: &str = "taskos.github_token";
/// Priority relay base URL + secret, shared by every webview origin of this app.
const PRIORITY_KEYRING_USER: &str = "taskos.priority_config";
const WINDOW_POS_FILE: &str = "window-positions.json";
const DEV_STATIC_PORT: u16 = 1420;

/// `tauri dev` 会起本地静态服；开机自启或双击 debug exe 时通常没有该服务，需改走内嵌 dist。
fn dev_static_server_available() -> bool {
    let Ok(addr) = format!("127.0.0.1:{DEV_STATIC_PORT}").parse::<SocketAddr>() else {
        return false;
    };
    TcpStream::connect_timeout(&addr, Duration::from_millis(250)).is_ok()
}

fn dev_static_server_available_with_retry() -> bool {
    for _ in 0..40 {
        if dev_static_server_available() {
            return true;
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    false
}

fn bundled_asset_url(path: &str) -> Result<Url, String> {
    let path = path.trim_start_matches('/');
    Url::parse(&format!("http://tauri.localhost/{path}")).map_err(|e| e.to_string())
}

fn switch_main_to_bundled_frontend(app: &tauri::AppHandle) -> Result<(), String> {
    if dev_static_server_available() {
        return Ok(());
    }
    let main = app
        .get_webview_window("main")
        .ok_or_else(|| "main window not found".to_string())?;
    main.navigate(bundled_asset_url("index.html")?)
        .map_err(|e| e.to_string())
}

/// Circle stays 132×168. Extra width/height is the priority footer under it.
const BUBBLE_COMPACT_W: f64 = 248.0;
const BUBBLE_COMPACT_H: f64 = 464.0;
const BUBBLE_LIST_W: f64 = 420.0;
const BUBBLE_LIST_H: f64 = 600.0;
const BUBBLE_SETTINGS_W: f64 = 360.0;
const BUBBLE_SETTINGS_H: f64 = 500.0;

/// Keep the top-left inside the monitor that contains it.
/// `None` means the window cannot fit that monitor.
fn clamp_point(
    x: i32,
    y: i32,
    win_w: i32,
    win_h: i32,
    mon_x: i32,
    mon_y: i32,
    mon_w: i32,
    mon_h: i32,
) -> Option<(i32, i32)> {
    if win_w <= 0 || win_h <= 0 || mon_w <= 0 || mon_h <= 0 {
        return None;
    }
    if win_w > mon_w || win_h > mon_h {
        return None;
    }
    let max_x = mon_x + mon_w - win_w;
    let max_y = mon_y + mon_h - win_h;
    Some((x.clamp(mon_x, max_x), y.clamp(mon_y, max_y)))
}

#[derive(Clone, Copy, Serialize, Deserialize)]
struct PosEntry {
    x: i32,
    y: i32,
}

#[derive(Default, Serialize, Deserialize)]
struct WindowPositions {
    main: Option<PosEntry>,
    #[serde(rename = "price-bubble")]
    price_bubble: Option<PosEntry>,
}

fn keyring_entry() -> Result<Entry, String> {
    Entry::new(KEYRING_SERVICE, KEYRING_USER).map_err(|e| e.to_string())
}

fn priority_entry() -> Result<Entry, String> {
    Entry::new(KEYRING_SERVICE, PRIORITY_KEYRING_USER).map_err(|e| e.to_string())
}

fn default_notify_on() -> bool {
    true
}

/// OS-keychain copy of the priority relay settings. `present` is false only when
/// nothing has been saved yet, so a later localStorage migration can run once.
#[derive(Clone, Debug, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PrioritySharedConfig {
    #[serde(default)]
    base_url: String,
    #[serde(default)]
    secret: String,
    #[serde(default = "default_notify_on")]
    notify: bool,
    #[serde(default)]
    present: bool,
}

fn empty_priority_store() -> PrioritySharedConfig {
    PrioritySharedConfig {
        base_url: String::new(),
        secret: String::new(),
        notify: true,
        present: false,
    }
}

fn priority_store_to_save(base_url: &str, secret: &str, notify: bool) -> PrioritySharedConfig {
    PrioritySharedConfig {
        base_url: base_url.trim().to_string(),
        secret: secret.trim().to_string(),
        notify,
        present: true,
    }
}

fn encode_priority_store(config: &PrioritySharedConfig) -> Result<String, String> {
    serde_json::to_string(config).map_err(|e| e.to_string())
}

fn parse_priority_store(raw: &str) -> Result<PrioritySharedConfig, String> {
    let mut config: PrioritySharedConfig = serde_json::from_str(raw).map_err(|e| e.to_string())?;
    config.base_url = config.base_url.trim().to_string();
    config.secret = config.secret.trim().to_string();
    // A readable keychain entry is authoritative, even when the secret was cleared.
    config.present = true;
    Ok(config)
}

fn positions_path(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_local_data_dir()
        .map(|p| p.join(WINDOW_POS_FILE))
        .map_err(|e| e.to_string())
}

fn read_positions(app: &tauri::AppHandle) -> WindowPositions {
    let path = match positions_path(app) {
        Ok(p) => p,
        Err(_) => return WindowPositions::default(),
    };
    fs::read_to_string(path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

fn write_positions(app: &tauri::AppHandle, positions: &WindowPositions) -> Result<(), String> {
    let path = positions_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    let body = serde_json::to_string_pretty(positions).map_err(|e| e.to_string())?;
    fs::write(path, body).map_err(|e| e.to_string())
}

fn save_window_position(app: &tauri::AppHandle, label: &str, x: i32, y: i32) {
    let mut all = read_positions(app);
    let entry = PosEntry { x, y };
    match label {
        "main" => all.main = Some(entry),
        "price-bubble" => all.price_bubble = Some(entry),
        _ => return,
    }
    let _ = write_positions(app, &all);
}

fn apply_saved_position(win: &WebviewWindow, entry: Option<PosEntry>) {
    if let Some(PosEntry { x, y }) = entry {
        let _ = win.set_position(PhysicalPosition::new(x, y));
    }
}

fn track_window_position(win: WebviewWindow) {
    let label = win.label().to_string();
    let app = win.app_handle().clone();
    let win_for_close = win.clone();
    win.on_window_event(move |event| match event {
        WindowEvent::Moved(pos) => save_window_position(&app, &label, pos.x, pos.y),
        WindowEvent::CloseRequested { .. } => {
            if let Ok(pos) = win_for_close.outer_position() {
                save_window_position(&app, &label, pos.x, pos.y);
            }
        }
        _ => {}
    });
}

#[tauri::command]
fn load_github_token() -> Result<String, String> {
    let entry = keyring_entry()?;
    match entry.get_password() {
        Ok(value) => Ok(value),
        Err(keyring::Error::NoEntry) => Ok(String::new()),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
fn save_github_token(token: String) -> Result<(), String> {
    let entry = keyring_entry()?;
    let trimmed = token.trim();
    if trimmed.is_empty() {
        let _ = entry.delete_credential();
        return Ok(());
    }
    entry.set_password(trimmed).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_priority_config() -> Result<PrioritySharedConfig, String> {
    let entry = priority_entry()?;
    match entry.get_password() {
        Ok(raw) => parse_priority_store(&raw),
        Err(keyring::Error::NoEntry) => Ok(empty_priority_store()),
        Err(err) => Err(err.to_string()),
    }
}

#[tauri::command]
fn save_priority_config(base_url: String, secret: String, notify: bool) -> Result<(), String> {
    let entry = priority_entry()?;
    let config = priority_store_to_save(&base_url, &secret, notify);
    let raw = encode_priority_store(&config)?;
    entry.set_password(&raw).map_err(|e| e.to_string())
}

fn needs_notification_permission(state: tauri_plugin_notification::PermissionState) -> bool {
    !matches!(state, tauri_plugin_notification::PermissionState::Granted)
}

#[tauri::command]
fn focus_main_window(app: tauri::AppHandle) -> Result<(), String> {
    let win = app
        .get_webview_window("main")
        .ok_or_else(|| "main window not found".to_string())?;
    win.show().map_err(|e| e.to_string())?;
    win.unminimize().map_err(|e| e.to_string())?;
    win.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn focus_price_bubble(app: tauri::AppHandle) -> Result<(), String> {
    ensure_price_bubble(&app)?;
    let win = app
        .get_webview_window("price-bubble")
        .ok_or_else(|| "price bubble not found".to_string())?;
    if dev_static_server_available() {
        if let Ok(url) = bubble_dev_page_url() {
            let _ = win.navigate(url);
        }
    }
    win.show().map_err(|e| e.to_string())?;
    win.unminimize().map_err(|e| e.to_string())?;
    win.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn show_price_alert(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    let notifications = app.notification();
    let state = notifications
        .permission_state()
        .map_err(|e| e.to_string())?;
    if needs_notification_permission(state) {
        let next = notifications
            .request_permission()
            .map_err(|e| e.to_string())?;
        if needs_notification_permission(next) {
            return Err("notification permission denied".into());
        }
    }
    notifications
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())
}

fn bubble_dev_page_url() -> Result<Url, String> {
    format!("http://127.0.0.1:{DEV_STATIC_PORT}/price-bubble.html")
        .parse::<Url>()
        .map_err(|e| e.to_string())
}

fn bubble_url() -> Result<WebviewUrl, String> {
    if dev_static_server_available_with_retry() {
        bubble_dev_page_url().map(WebviewUrl::External)
    } else {
        Ok(WebviewUrl::App("price-bubble.html".into()))
    }
}

fn place_bubble_bottom_right(
    bubble: &tauri::WebviewWindow,
) -> Result<(), Box<dyn std::error::Error>> {
    let monitor = bubble.current_monitor()?.ok_or("no monitor")?;
    let size = monitor.size();
    let pos = monitor.position();
    let outer = bubble.outer_size()?;
    let mut x = pos.x + size.width as i32 - outer.width as i32 - 24;
    let mut y = pos.y + size.height as i32 - outer.height as i32 - 72;
    if x < pos.x {
        x = pos.x;
    }
    if y < pos.y {
        y = pos.y;
    }
    bubble.set_position(PhysicalPosition::new(x, y))?;
    Ok(())
}

fn monitor_for_point(win: &WebviewWindow, x: i32, y: i32) -> Option<tauri::Monitor> {
    let monitors = win.available_monitors().ok()?;
    if let Some(found) = monitors.iter().find(|monitor| {
        let origin = monitor.position();
        let size = monitor.size();
        x >= origin.x
            && y >= origin.y
            && x < origin.x + size.width as i32
            && y < origin.y + size.height as i32
    }) {
        return Some(found.clone());
    }
    monitors.into_iter().next()
}

fn clamp_xy(win: &WebviewWindow, x: i32, y: i32, logical_w: f64, logical_h: f64) {
    let scale = match win.scale_factor() {
        Ok(value) if value.is_finite() && value > 0.0 => value,
        _ => 1.0,
    };
    let win_w = (logical_w * scale).round() as i32;
    let win_h = (logical_h * scale).round() as i32;
    let Some(monitor) = monitor_for_point(win, x, y) else {
        return;
    };
    let origin = monitor.position();
    let size = monitor.size();
    match clamp_point(
        x,
        y,
        win_w,
        win_h,
        origin.x,
        origin.y,
        size.width as i32,
        size.height as i32,
    ) {
        Some((next_x, next_y)) => {
            if next_x != x || next_y != y {
                let _ = win.set_position(PhysicalPosition::new(next_x, next_y));
            }
        }
        None => {
            let _ = place_bubble_bottom_right(win);
        }
    }
}

fn clamp_bubble_window(win: &WebviewWindow, logical_w: f64, logical_h: f64) {
    let Ok(pos) = win.outer_position() else {
        return;
    };
    clamp_xy(win, pos.x, pos.y, logical_w, logical_h);
}

fn validate_priority_get_url(raw: &str) -> Result<reqwest::Url, String> {
    let url = reqwest::Url::parse(raw.trim()).map_err(|_| "invalid priority url".to_string())?;
    if url.scheme() != "http" && url.scheme() != "https" {
        return Err("invalid priority url".into());
    }
    if !url.username().is_empty() || url.password().is_some() {
        return Err("invalid priority url".into());
    }
    if url.host_str().unwrap_or("").is_empty() {
        return Err("invalid priority url".into());
    }
    let path = url.path().trim_end_matches('/');
    let allowed = path == "/queue/priority"
        || path == "/queue/priority/sources"
        || path.ends_with("/queue/priority")
        || path.ends_with("/queue/priority/sources");
    if !allowed {
        return Err("invalid priority url".into());
    }
    Ok(url)
}

#[derive(Serialize)]
struct PriorityHttpResponse {
    status: u16,
    body: String,
}

/// Clash 等本地 HTTP 代理端口可能轮换，按序尝试。
const LOCAL_HTTP_PROXY_PORTS: [u16; 4] = [7890, 7891, 7892, 7893];

#[derive(Clone, Copy)]
enum HttpClientProxyMode {
    /// 尊重 HTTP_PROXY / 系统代理（与浏览器一致）。
    System,
    /// 不经代理直连。
    Direct,
    /// 127.0.0.1 上显式端口。
    Local(u16),
}

fn build_blocking_http_client(mode: HttpClientProxyMode) -> Result<reqwest::blocking::Client, String> {
    let mut builder = reqwest::blocking::Client::builder().timeout(Duration::from_secs(12));
    match mode {
        HttpClientProxyMode::System => {}
        HttpClientProxyMode::Direct => {
            builder = builder.no_proxy();
        }
        HttpClientProxyMode::Local(port) => {
            let proxy = reqwest::Proxy::all(format!("http://127.0.0.1:{port}"))
                .map_err(|err| err.to_string())?;
            builder = builder.proxy(proxy);
        }
    }
    builder.build().map_err(|err| err.to_string())
}

fn http_status_retry_via_local_proxy(status: u16) -> bool {
    matches!(status, 403 | 451 | 502 | 503 | 520 | 521 | 522 | 523 | 524)
}

fn blocking_get_with_local_proxy_fallback<F>(
    url: reqwest::Url,
    err_label: &str,
    apply: F,
) -> Result<PriorityHttpResponse, String>
where
    F: Fn(reqwest::blocking::Client, reqwest::Url) -> Result<reqwest::blocking::Response, reqwest::Error>,
{
    let mut plan: Vec<HttpClientProxyMode> = Vec::with_capacity(2 + LOCAL_HTTP_PROXY_PORTS.len());
    plan.push(HttpClientProxyMode::System);
    plan.push(HttpClientProxyMode::Direct);
    plan.extend(
        LOCAL_HTTP_PROXY_PORTS
            .iter()
            .copied()
            .map(HttpClientProxyMode::Local),
    );

    let mut last_err = String::new();
    for (idx, proxy_mode) in plan.iter().copied().enumerate() {
        let client = build_blocking_http_client(proxy_mode)?;
        match apply(client, url.clone()) {
            Ok(response) => {
                let status = response.status().as_u16();
                let body = response.text().map_err(|err| err.to_string())?;
                if body.len() > 1_048_576 {
                    return Err(format!("{err_label} response too large"));
                }
                if idx < 2 && http_status_retry_via_local_proxy(status) {
                    last_err = format!("{err_label} HTTP {status}");
                    continue;
                }
                return Ok(PriorityHttpResponse { status, body });
            }
            Err(err) => {
                last_err = format!("{err_label} {err}");
            }
        }
    }
    Err(last_err)
}

fn perform_priority_get(url: reqwest::Url, secret: String) -> Result<PriorityHttpResponse, String> {
    blocking_get_with_local_proxy_fallback(url, "priority", |client, url| {
        client
            .get(url)
            .header("Authorization", format!("Bearer {secret}"))
            .header("X-Relay-Secret", secret.as_str())
            .header("Accept", "application/json")
            .send()
    })
}

#[tauri::command]
async fn priority_http_get(url: String, secret: String) -> Result<PriorityHttpResponse, String> {
    let parsed = validate_priority_get_url(&url)?;
    let secret = secret.trim().to_string();
    if secret.is_empty() {
        return Err("missing secret".into());
    }
    tauri::async_runtime::spawn_blocking(move || perform_priority_get(parsed, secret))
        .await
        .map_err(|err| err.to_string())?
}

fn validate_oi_report_queue_url(raw: &str) -> Result<reqwest::Url, String> {
    let url = reqwest::Url::parse(raw.trim()).map_err(|_| "invalid oi report-queue url".to_string())?;
    if url.scheme() != "http" && url.scheme() != "https" {
        return Err("invalid oi report-queue url".into());
    }
    if !url.username().is_empty() || url.password().is_some() {
        return Err("invalid oi report-queue url".into());
    }
    let host = url.host_str().unwrap_or("");
    let port = url.port();
    let allowed_host = matches!(
        (host, port),
        ("127.0.0.1" | "localhost", Some(8765)) | ("45.207.196.71", Some(39134))
    );
    if !allowed_host {
        return Err("invalid oi report-queue url".into());
    }
    let path = url.path().trim_end_matches('/');
    if path != "/api/report-queue" {
        return Err("invalid oi report-queue url".into());
    }
    Ok(url)
}

fn perform_oi_report_queue_get(url: reqwest::Url) -> Result<PriorityHttpResponse, String> {
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(12))
        .no_proxy()
        .build()
        .map_err(|err| err.to_string())?;
    let response = client
        .get(url)
        .header("Accept", "application/json")
        .send()
        .map_err(|err| format!("oi report-queue HTTP {err}"))?;
    let status = response.status().as_u16();
    let body = response.text().map_err(|err| err.to_string())?;
    if body.len() > 1_048_576 {
        return Err("oi report-queue response too large".into());
    }
    Ok(PriorityHttpResponse { status, body })
}

#[tauri::command]
async fn oi_report_queue_get(url: String) -> Result<PriorityHttpResponse, String> {
    let parsed = validate_oi_report_queue_url(&url)?;
    tauri::async_runtime::spawn_blocking(move || perform_oi_report_queue_get(parsed))
        .await
        .map_err(|err| err.to_string())?
}

fn validate_autoscript_live_feed_url(raw: &str) -> Result<reqwest::Url, String> {
    let url = reqwest::Url::parse(raw.trim()).map_err(|_| "invalid autoscript feed url".to_string())?;
    if url.scheme() != "http" && url.scheme() != "https" {
        return Err("invalid autoscript feed url".into());
    }
    if !url.username().is_empty() || url.password().is_some() {
        return Err("invalid autoscript feed url".into());
    }
    let host = url.host_str().unwrap_or("");
    let port = url.port();
    let allowed_host = matches!(
        (host, port),
        ("127.0.0.1" | "localhost", Some(3852)) | ("45.207.196.71", Some(39137))
    );
    if !allowed_host {
        return Err("invalid autoscript feed url".into());
    }
    let path = url.path().trim_end_matches('/');
    let allowed = path == "/queue/priority" || path == "/queue/priority/sources";
    if !allowed {
        return Err("invalid autoscript feed url".into());
    }
    Ok(url)
}

fn perform_autoscript_live_feed_get(url: reqwest::Url, secret: String) -> Result<PriorityHttpResponse, String> {
    let client = reqwest::blocking::Client::builder()
        .timeout(std::time::Duration::from_secs(12))
        .no_proxy()
        .build()
        .map_err(|err| err.to_string())?;
    let mut request = client.get(url).header("Accept", "application/json");
    if !secret.is_empty() {
        request = request
            .header("Authorization", format!("Bearer {secret}"))
            .header("X-Relay-Secret", secret);
    }
    let response = request
        .send()
        .map_err(|err| format!("autoscript feed HTTP {err}"))?;
    let status = response.status().as_u16();
    let body = response.text().map_err(|err| err.to_string())?;
    if body.len() > 1_048_576 {
        return Err("autoscript feed response too large".into());
    }
    Ok(PriorityHttpResponse { status, body })
}

#[tauri::command]
async fn autoscript_live_feed_get(url: String, secret: String) -> Result<PriorityHttpResponse, String> {
    let parsed = validate_autoscript_live_feed_url(&url)?;
    tauri::async_runtime::spawn_blocking(move || perform_autoscript_live_feed_get(parsed, secret))
        .await
        .map_err(|err| err.to_string())?
}

fn market_host_allowed(host: &str) -> bool {
    matches!(
        host,
        "fapi.binance.com"
            | "api.binance.com"
            | "data-api.binance.vision"
            | "api.gateio.ws"
            | "api.coingecko.com"
            | "push2.eastmoney.com"
    )
}

fn validate_market_get_url(raw: &str) -> Result<reqwest::Url, String> {
    let url = reqwest::Url::parse(raw.trim()).map_err(|_| "invalid market url".to_string())?;
    if url.scheme() != "https" {
        return Err("invalid market url".into());
    }
    if !url.username().is_empty() || url.password().is_some() {
        return Err("invalid market url".into());
    }
    let host = url.host_str().unwrap_or("");
    if !market_host_allowed(host) {
        return Err("invalid market url".into());
    }
    Ok(url)
}

fn perform_market_get(url: reqwest::Url) -> Result<PriorityHttpResponse, String> {
    blocking_get_with_local_proxy_fallback(url, "market", |client, url| {
        client
            .get(url)
            .header("Accept", "application/json")
            .header("User-Agent", "task-os-desktop")
            .send()
    })
}

#[tauri::command]
async fn market_http_get(url: String) -> Result<PriorityHttpResponse, String> {
    let parsed = validate_market_get_url(&url)?;
    tauri::async_runtime::spawn_blocking(move || perform_market_get(parsed))
        .await
        .map_err(|err| err.to_string())?
}

#[tauri::command]
fn set_price_bubble_layout(app: tauri::AppHandle, mode: String) -> Result<(), String> {
    let win = app
        .get_webview_window("price-bubble")
        .ok_or_else(|| "price bubble not found".to_string())?;
    let (width, height) = match mode.as_str() {
        "list" => (BUBBLE_LIST_W, BUBBLE_LIST_H),
        "settings" => (BUBBLE_SETTINGS_W, BUBBLE_SETTINGS_H),
        _ => (BUBBLE_COMPACT_W, BUBBLE_COMPACT_H),
    };
    win.set_size(LogicalSize::new(width, height))
        .map_err(|e| e.to_string())?;
    clamp_bubble_window(&win, width, height);
    Ok(())
}

fn ensure_price_bubble(app: &tauri::AppHandle) -> Result<(), String> {
    if app.get_webview_window("price-bubble").is_some() {
        return Ok(());
    }
    let saved = read_positions(app);
    let url = bubble_url()?;
    let bubble = WebviewWindowBuilder::new(app, "price-bubble", url)
        .title("行情")
        .inner_size(BUBBLE_COMPACT_W, BUBBLE_COMPACT_H)
        .decorations(false)
        .transparent(true)
        .shadow(false)
        .background_color(Color(0, 0, 0, 0))
        .always_on_top(false)
        .skip_taskbar(false)
        .resizable(false)
        .visible(true)
        .focused(false)
        .build()
        .map_err(|e| e.to_string())?;
    if let Some(entry) = saved.price_bubble {
        apply_saved_position(&bubble, Some(entry));
        clamp_xy(
            &bubble,
            entry.x,
            entry.y,
            BUBBLE_COMPACT_W,
            BUBBLE_COMPACT_H,
        );
    } else {
        let _ = place_bubble_bottom_right(&bubble);
    }
    track_window_position(bubble);
    Ok(())
}

fn restore_main_window(app: &tauri::AppHandle) {
    let Some(main) = app.get_webview_window("main") else {
        return;
    };
    let saved = read_positions(app);
    apply_saved_position(&main, saved.main);
    track_window_position(main);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_autostart::Builder::new()
                .app_name("Task OS")
                .build(),
        )
        .setup(|app| {
            restore_main_window(app.handle());
            if let Err(err) = switch_main_to_bundled_frontend(app.handle()) {
                eprintln!("主窗口切到内嵌前端失败: {err}");
            }
            ensure_price_bubble(app.handle())?;
            // 开发版自启会注册 debug exe，现已可无 1420 自举；正式环境建议用 release 安装包并自启。
            if let Err(err) = app.autolaunch().enable() {
                eprintln!("开机自启注册失败: {err}");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_github_token,
            save_github_token,
            load_priority_config,
            save_priority_config,
            focus_main_window,
            focus_price_bubble,
            show_price_alert,
            set_price_bubble_layout,
            priority_http_get,
            oi_report_queue_get,
            autoscript_live_feed_get,
            market_http_get
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::clamp_point;

    #[test]
    fn keeps_position_inside_monitor() {
        assert_eq!(clamp_point(10, 10, 100, 80, 0, 0, 200, 200), Some((10, 10)));
    }

    #[test]
    fn pulls_grown_window_back_onto_screen() {
        assert_eq!(
            clamp_point(180, 190, 100, 80, 0, 0, 200, 200),
            Some((100, 120))
        );
    }

    #[test]
    fn falls_back_when_window_cannot_fit() {
        assert_eq!(clamp_point(0, 0, 300, 80, 0, 0, 200, 200), None);
    }

    #[test]
    fn local_proxy_ports_cover_clash_style_range() {
        assert_eq!(super::LOCAL_HTTP_PROXY_PORTS, [7890, 7891, 7892, 7893]);
        assert!(super::http_status_retry_via_local_proxy(451));
        assert!(!super::http_status_retry_via_local_proxy(200));
        assert!(!super::http_status_retry_via_local_proxy(404));
    }

    #[test]
    fn market_gate_xau_url_is_whitelisted() {
        let url = super::validate_market_get_url(
            "https://api.gateio.ws/api/v4/futures/usdt/tickers?contract=XAU_USDT",
        )
        .unwrap();
        assert_eq!(url.host_str(), Some("api.gateio.ws"));
    }

    #[test]
    fn priority_get_url_allows_queue_paths_only() {
        let page = super::validate_priority_get_url(
            "https://op.g.ezcoin.ink/queue/priority?source=pangmao&limit=200",
        )
        .unwrap();
        assert_eq!(page.path(), "/queue/priority");
        assert!(super::validate_priority_get_url(
            "https://example.com/relay/queue/priority/sources"
        )
        .is_ok());
        assert!(super::validate_priority_get_url("https://example.com/admin").is_err());
        assert!(super::validate_priority_get_url("javascript:alert(1)").is_err());
        assert!(
            super::validate_priority_get_url("https://user:secret@example.com/queue/priority")
                .is_err()
        );
    }

    #[test]
    fn oi_report_queue_url_allows_local_8765_only() {
        assert!(super::validate_oi_report_queue_url("http://127.0.0.1:8765/api/report-queue").is_ok());
        assert!(super::validate_oi_report_queue_url(
            "http://localhost:8765/api/report-queue?limit=50"
        )
        .is_ok());
        assert!(super::validate_oi_report_queue_url(
            "http://127.0.0.1:8765/api/report-queue?kind=st_pop_short&symbols=BTCUSDT,ETHUSDT"
        )
        .is_ok());
        assert!(super::validate_oi_report_queue_url(
            "http://127.0.0.1:8765/api/report-queue?kind=st_vol_wick&symbols=BTCUSDT,ETHUSDT"
        )
        .is_ok());
        assert!(super::validate_oi_report_queue_url("http://127.0.0.1:8765/api/health").is_err());
        assert!(super::validate_oi_report_queue_url("http://127.0.0.1/api/report-queue").is_err());
        assert!(super::validate_oi_report_queue_url("https://example.com/api/report-queue").is_err());
        assert!(super::validate_oi_report_queue_url(
            "http://45.207.196.71:39134/api/report-queue?kind=st_vol_wick&symbols=BTCUSDT,ETHUSDT"
        )
        .is_ok());
        assert!(super::validate_oi_report_queue_url("http://45.207.196.71:39137/api/report-queue").is_err());
    }

    #[test]
    fn autoscript_feed_url_allows_local_3852_queue_only() {
        assert!(super::validate_autoscript_live_feed_url(
            "http://127.0.0.1:3852/queue/priority?source=autoscript_cards&limit=200"
        )
        .is_ok());
        assert!(super::validate_autoscript_live_feed_url(
            "http://localhost:3852/queue/priority/sources"
        )
        .is_ok());
        assert!(super::validate_autoscript_live_feed_url("http://127.0.0.1:3852/health").is_err());
        assert!(super::validate_autoscript_live_feed_url("http://127.0.0.1:8765/queue/priority").is_err());
        assert!(super::validate_autoscript_live_feed_url("https://example.com/queue/priority").is_err());
        assert!(super::validate_autoscript_live_feed_url(
            "http://45.207.196.71:39137/queue/priority/sources"
        )
        .is_ok());
        assert!(super::validate_autoscript_live_feed_url(
            "http://45.207.196.71:39137/queue/priority?source=autoscript_cards&limit=200"
        )
        .is_ok());
        assert!(super::validate_autoscript_live_feed_url("http://45.207.196.71:39134/queue/priority").is_err());
    }

    #[test]
    fn priority_store_round_trip_trims_and_keeps_notify_off() {
        let config =
            super::priority_store_to_save(" https://example.com/relay ", " local-secret ", false);
        assert_eq!(config.base_url, "https://example.com/relay");
        assert_eq!(config.secret, "local-secret");
        assert!(!config.notify);
        assert!(config.present);
        let raw = super::encode_priority_store(&config).unwrap();
        let parsed = super::parse_priority_store(&raw).unwrap();
        assert_eq!(parsed.base_url, config.base_url);
        assert_eq!(parsed.secret, config.secret);
        assert!(!parsed.notify);
        assert!(parsed.present);
    }

    #[test]
    fn priority_store_defaults_notify_on_and_marks_present() {
        let parsed =
            super::parse_priority_store(r#"{"baseUrl":"","secret":"local-secret"}"#).unwrap();
        assert!(parsed.notify);
        assert!(parsed.present);
        assert_eq!(parsed.secret, "local-secret");
        assert!(parsed.base_url.is_empty());
    }

    #[test]
    fn missing_priority_store_is_not_present() {
        let config = super::empty_priority_store();
        assert!(!config.present);
        assert!(config.notify);
        assert!(config.secret.is_empty());
        assert!(config.base_url.is_empty());
    }

    #[test]
    fn notification_permission_is_requested_until_granted() {
        use tauri_plugin_notification::PermissionState;
        assert!(!super::needs_notification_permission(
            PermissionState::Granted
        ));
        assert!(super::needs_notification_permission(
            PermissionState::Denied
        ));
        assert!(super::needs_notification_permission(
            PermissionState::Prompt
        ));
        assert!(super::needs_notification_permission(
            PermissionState::PromptWithRationale
        ));
    }
}
