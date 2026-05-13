export async function saveDataText(relativePath, content) {
  try {
    var invoke = window.__TAURI__.core.invoke;
    return await invoke("write_data_file", { relativePath, content });
  } catch (error) {
    throw new Error("Error guardando archivo de datos via Tauri: " + (error && error.message ? error.message : String(error)));
  }
}
