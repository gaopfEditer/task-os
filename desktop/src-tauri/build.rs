fn main() {
    let dist_index = std::path::Path::new("..").join("dist").join("index.html");
    if !dist_index.exists() {
        println!(
            "cargo:warning=desktop/dist/index.html 不存在，请先运行: cd desktop && npm run build:frontend"
        );
    }
    tauri_build::build()
}
