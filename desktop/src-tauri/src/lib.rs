use keyring::Entry;
use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{Listener, Manager, PhysicalPosition, WebviewUrl, WebviewWindow, WebviewWindowBuilder, WindowEvent};
use tauri_utils::config::Color;
use tauri_plugin_autostart::ManagerExt;
use tauri_plugin_notification::NotificationExt;

const KEYRING_SERVICE: &str = "com.taskos.desktop";
const KEYRING_USER: &str = "taskos.github_token";
const WINDOW_POS_FILE: &str = "window-positions.json";

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
    win.show().map_err(|e| e.to_string())?;
    win.unminimize().map_err(|e| e.to_string())?;
    win.set_focus().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn show_price_alert(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())
}

fn bubble_url() -> Result<WebviewUrl, String> {
    if cfg!(debug_assertions) {
        "http://localhost:1420/price-bubble.html"
            .parse()
            .map(WebviewUrl::External)
            .map_err(|e| e.to_string())
    } else {
        Ok(WebviewUrl::App("price-bubble.html".into()))
    }
}

fn place_bubble_bottom_right(
    bubble: &tauri::WebviewWindow,
) -> Result<(), Box<dyn std::error::Error>> {
    let monitor = bubble
        .current_monitor()?
        .ok_or("no monitor")?;
    let size = monitor.size();
    let pos = monitor.position();
    let outer = bubble.outer_size()?;
    let x = pos.x + size.width as i32 - outer.width as i32 - 24;
    let y = pos.y + size.height as i32 - outer.height as i32 - 72;
    bubble.set_position(PhysicalPosition::new(x, y))?;
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
        .inner_size(132.0, 168.0)
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
    if saved.price_bubble.is_some() {
        apply_saved_position(&bubble, saved.price_bubble);
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
            ensure_price_bubble(app.handle())?;
            if let Err(err) = app.autolaunch().enable() {
                eprintln!("开机自启注册失败: {err}");
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            load_github_token,
            save_github_token,
            focus_main_window,
            focus_price_bubble,
            show_price_alert
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
