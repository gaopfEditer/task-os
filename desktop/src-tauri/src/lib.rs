use keyring::Entry;
use tauri_plugin_notification::NotificationExt;

const KEYRING_SERVICE: &str = "com.taskos.desktop";
const KEYRING_USER: &str = "taskos.github_token";

fn keyring_entry() -> Result<Entry, String> {
    Entry::new(KEYRING_SERVICE, KEYRING_USER).map_err(|e| e.to_string())
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
fn show_price_alert(app: tauri::AppHandle, title: String, body: String) -> Result<(), String> {
    app.notification()
        .builder()
        .title(title)
        .body(body)
        .show()
        .map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .invoke_handler(tauri::generate_handler![
            load_github_token,
            save_github_token,
            show_price_alert
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
