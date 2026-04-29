# Lectura y Escritura de Data Externa en Tauri

## Contexto Arquitectónico

Se emplea un modelo de datos externo y portable:

- `web/` contiene los archivos HTML, CSS y JS de las maquetas; dichos archivos son empaquetados dentro de la aplicación.
- `data/` contiene los CSV y otros archivos modificables; estos archivos no se incrustan en la aplicación compilada y su acceso se resuelve respecto a la carpeta `data/` en tiempo de ejecución.

La lectura y escritura de archivos se implementa en [src-tauri/src/main.rs](../src-tauri/src/main.rs) mediante tres comandos internos:

- `read_data_file`
- `write_data_file`
- `list_data_files`

**No se realiza acceso directo al disco desde el frontend.** Las operaciones de lectura y escritura son ejecutadas por los comandos internos implementados en Rust dentro del binario.

## Cómo usarlo desde JavaScript

### En una página HTML simple


Puesto que las rutas se resuelven relativamente a `data/`, el frontend debe proporcionar únicamente el nombre de archivo o la ruta relativa dentro de `data/`. Tauri resuelve la ubicación correspondiente en el sistema de archivos.

Como [src-tauri/tauri.conf.json](../src-tauri/tauri.conf.json) activa `withGlobalTauri`, los comandos pueden ser invocados desde HTML/JS empaquetado de la forma siguiente:

```javascript
const { invoke } = window.__TAURI__.core;

async function leerArchivo(relativo) {
  return await invoke('read_data_file', { relativePath: relativo });
}

async function guardarArchivo(relativo, content) {
  await invoke('write_data_file', { relativePath: relativo, content });
}

async function listarArchivos() {
  return await invoke('list_data_files');
}
```

## Funcionalidad de `main.rs`

El código Rust se empaqueta dentro del binario compilado; no obstante, las operaciones de lectura y escritura se ejecutan en tiempo de ejecución sobre archivos externos a la aplicación.

Durante la ejecución de la aplicación (ya sea en modo desarrollo con `cargo tauri dev` o en la aplicación compilada), se sigue el flujo descrito a continuación:

1. La ventana principal de la aplicación se abre.
2. La interfaz web carga los recursos HTML/JS empaquetados.
3. Al requerirse la lectura o escritura de un CSV, el frontend invoca un comando mediante `invoke(...)`.
4. La invocación es despachada a `main.rs`.
5. `main.rs` resuelve la ruta en `data/` y realiza la operación de E/S correspondiente.

## Resolución de rutas

La resolución de rutas sigue las reglas siguientes:

- En distribución compilada, se busca primero la carpeta `data/` ubicada junto al ejecutable.
- En entorno de desarrollo, si no existe la carpeta anterior, se utiliza `./data/` relativa al directorio actual del proyecto.
- Las rutas proporcionadas por el frontend deben ser relativas a `data/`.

Ejemplos válidos:

- `02_estados.csv`
- `config/flujo.json`
- `subcarpeta/archivo.csv`

Ejemplos no válidos:

- `/etc/passwd`
- `../archivo.csv`
- `C:\\algo\\archivo.csv`

## Configuración necesaria en Tauri


La ventana principal queda habilitada para invocar los comandos internos.

Puntos clave:

- `withGlobalTauri: true` permite el uso de `window.__TAURI__.core.invoke` desde HTML/JS simple.
- La capability `main-window-data-access` habilita a la ventana principal para invocar los comandos internos.
- No es necesario que Rust esté instalado en la máquina del usuario final.
- No se requiere un plugin externo de filesystem para este flujo, dado que la lectura y escritura se realizan mediante `std::fs` en Rust.

## Distribución esperada

Cuando entregues la app compilada al usuario:

```text
herramienta-flujos-rasa
├── herramienta-flujos-rasa o herramienta-flujos-rasa.exe
└── data/
    ├── 00_introduccion_libro.csv
    ├── 01_resumen_flujo.csv
    ├── 02_estados.csv
    └── ...
```

El usuario abre la aplicación, modifica los formularios y guarda cambios. La app escribe los CSV en `data/` mientras se ejecuta.

## Notas para desarrollo futuro

- [tools/xlsx_a_csv.py](../tools/xlsx_a_csv.py) y [tools/compilar_flujo_csv.py](../tools/compilar_flujo_csv.py) siguen trabajando sobre `data/` en el repositorio de desarrollo.
- [tools/preparar_tauri.py](../tools/preparar_tauri.py) copia solo la interfaz web a `web/`; no copia `data/`.
- La lógica de lectura y escritura ya no depende de documentación pendiente: está implementada en Rust y expuesta al frontend.

## Referencias rápidas

- [src-tauri/src/main.rs](../src-tauri/src/main.rs)
- [src-tauri/tauri.conf.json](../src-tauri/tauri.conf.json)
- [docs/TAURI_BUILD.md](TAURI_BUILD.md)
