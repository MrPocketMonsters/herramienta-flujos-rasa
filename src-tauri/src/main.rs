use std::fs;
use std::path::{Component, Path, PathBuf};

#[tauri::command]
fn read_data_file(relative_path: String) -> Result<String, String> {
    let path = resolve_data_path(&relative_path)?;
    fs::read_to_string(&path).map_err(|error| format!("No se pudo leer {}: {}", path.display(), error))
}

#[tauri::command]
fn write_data_file(relative_path: String, content: String) -> Result<(), String> {
    let path = resolve_data_path(&relative_path)?;

    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)
            .map_err(|error| format!("No se pudo crear {}: {}", parent.display(), error))?;
    }

    fs::write(&path, content).map_err(|error| format!("No se pudo escribir {}: {}", path.display(), error))
}

#[tauri::command]
fn list_data_files() -> Result<Vec<String>, String> {
    let data_root = resolve_data_root()?;
    let mut files = Vec::new();

    collect_files(&data_root, &data_root, &mut files)?;
    files.sort();
    Ok(files)
}

fn resolve_data_root() -> Result<PathBuf, String> {
    let exe_dir = std::env::current_exe()
        .map_err(|error| format!("No se pudo obtener la ruta del ejecutable: {}", error))?
        .parent()
        .ok_or_else(|| "No se pudo obtener el directorio del ejecutable".to_string())?
        .to_path_buf();

    let packaged_data = exe_dir.join("data");
    if packaged_data.exists() {
        return Ok(packaged_data);
    }

    let dev_data = std::env::current_dir()
        .map_err(|error| format!("No se pudo obtener el directorio actual: {}", error))?
        .join("data");

    if dev_data.exists() {
        return Ok(dev_data);
    }

    Ok(packaged_data)
}

fn resolve_data_path(relative_path: &str) -> Result<PathBuf, String> {
    let relative = Path::new(relative_path);
    if relative.is_absolute() {
        return Err("La ruta debe ser relativa a data/".to_string());
    }

    for component in relative.components() {
        match component {
            Component::Normal(_) | Component::CurDir => {}
            _ => return Err("La ruta no puede salir de data/".to_string()),
        }
    }

    Ok(resolve_data_root()?.join(relative))
}

fn collect_files(root: &Path, current: &Path, files: &mut Vec<String>) -> Result<(), String> {
    for entry in fs::read_dir(current)
        .map_err(|error| format!("No se pudo leer {}: {}", current.display(), error))? {
        let entry = entry.map_err(|error| format!("No se pudo recorrer {}: {}", current.display(), error))?;
        let path = entry.path();

        if path.is_dir() {
            collect_files(root, &path, files)?;
            continue;
        }

        let relative = path
            .strip_prefix(root)
            .map_err(|error| format!("No se pudo calcular ruta relativa: {}", error))?;
        files.push(relative.to_string_lossy().replace('\\', "/"));
    }

    Ok(())
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![read_data_file, write_data_file, list_data_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
