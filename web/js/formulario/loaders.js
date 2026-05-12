export function getConfigPath() {
  var params = new URLSearchParams(window.location.search);
  if (!params.has("config")) {
    throw new Error("No se especificó el parámetro 'config' en la URL. URL: " + window.location.href);
  }
  return "../config/" + params.get("config");
}

export function getFlowId() {
  var params = new URLSearchParams(window.location.search);
  if (!params.has("flujo")) {
    return "";
  }
  return params.get("flujo");
}

export async function loadText(url) {
  var response = await fetch(url);
  if (!response.ok) {
    throw new Error("No se pudo cargar el recurso local: " + url + " (" + response.status + " " + response.statusText + ")");
  }
  return response.text();
}

export async function loadDataText(relativePath, baseUrl) {
  try {
    var invoke = window.__TAURI__.core.invoke;
    return await invoke("read_data_file", { relativePath: relativePath });
  } catch (err) {
    throw new Error("Error leyendo archivo de datos via Tauri: " + (err && err.message ? err.message : String(err)));
  }
}
