# Compilación y empaquetado con Tauri

Este documento recoge las instrucciones para preparar la máquina y compilar la aplicación de escritorio usando el scaffold en `src-tauri/`.

Importante: En tiempo de compilación, Tauri incrusta los archivos en `web/` en el binario. No incrusta `data/`, porque esa carpeta **se gestiona en tiempo de ejecución** mediante comandos Rust en `src-tauri/src/main.rs`.

1) Instalación de Rust (cuando no esté presente):

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source "$HOME/.cargo/env"
rustup default stable
```

2) Dependencias de sistema (ejemplo para Debian/Ubuntu):

```bash
sudo apt update
# paquetes de compilación y pkg-config
sudo apt install -y build-essential pkg-config curl
# librerías necesarias por wry/webview en Linux
sudo apt install -y libssl-dev libglib2.0-dev libgtk-3-dev libgdk-pixbuf2.0-dev libcairo2-dev libpango1.0-dev libatk1.0-dev libwebkit2gtk-4.0-dev
```

En otras distribuciones deberá utilizarse el gestor de paquetes correspondiente (Fedora: `dnf`, Arch: `pacman`, etc.). En Windows deberán instalarse Visual Studio Build Tools y el WebView2 runtime; en macOS deberán instalarse Xcode Command Line Tools y las librerías GUI necesarias.

2b) Compilación en Windows:

```powershell
# Instalar Rust con rustup si todavía no lo tienes
winget install --id Rustlang.Rustup -e
rustup default stable

# Preparar el frontend local para Tauri
python tools/preparar_tauri.py --source . --target web

# Validar y compilar desde PowerShell o Developer Command Prompt for VS
cargo metadata --no-deps --manifest-path src-tauri/Cargo.toml
cd src-tauri
cargo build
cargo build --release
```

Para Windows, la máquina debe tener Visual Studio Build Tools con el workload de C++ instalado y WebView2 Runtime disponible. Si se emplea PowerShell, deberá comprobarse que `cargo` estén en `PATH`.

Si las bibliotecas están instaladas en rutas no estándar, deberá asegurarse que `PKG_CONFIG_PATH` incluya el directorio que contiene los .pc (por ejemplo: `/usr/lib/pkgconfig` o `/usr/local/lib/pkgconfig`).

3) (Opcional) herramientas adicionales de Tauri:

```bash
# opción A: instalar la CLI de Tauri en Rust
cargo install tauri-cli --locked

# opción B: usar @tauri-apps/cli vía npm (útil si trabajas con Node toolchain)
# npm install -g @tauri-apps/cli
```

4) Validar manifest y compilar

```bash
# desde la raíz del repo
cargo metadata --no-deps --manifest-path src-tauri/Cargo.toml
cd src-tauri
cargo build

# Para crear binarios de release
cargo build --release
```

En Linux, el ejecutable queda en `src-tauri/target/release/herramienta-flujos-rasa`. En Windows, el resultado equivalente será `src-tauri\target\release\herramienta-flujos-rasa.exe`.

5) Problemas comunes

- Si `cargo build` falla por falta de librerías del sistema, revisa que `libwebkit2gtk-4.0-dev` y `libssl-dev` estén instalados (Linux).  
- En Windows asegúrate de que WebView2 esté instalado y las Build Tools de MSVC disponibles.  
- Si el error menciona crates faltantes, ejecuta `cargo update` y vuelve a intentar.

6) Notas finales

- El binario resultante se encontrará en `src-tauri/target/debug/` o `src-tauri/target/release/` según el modo de compilación.
- El empaquetado final (instaladores) puede requerir `tauri-bundler` y pasos adicionales que dependen de la plataforma; consulta la documentación oficial de Tauri para crear instaladores cross-platform.
- Si necesitas distribuir a usuarios de Windows, compila en Windows o en un runner Windows de CI para obtener el `.exe` y, si se habilita bundling, el instalador correspondiente.
