#!/bin/bash

help() {
  echo "Construye el proyecto Tauri y trae los binarios resultantes a la raíz del proyecto."
  echo "Uso: $0 [opciones]"
  echo "Opciones:"
  echo "  -h  Mostrar este mensaje de ayuda y salir"
  echo "  -r  Construir en modo release"
}

main() {
  set -e # Salir inmediatamente si un comando falla
  local RELEASE=false # Variable para indicar si se debe construir en modo release

  # Procesar opciones de línea de comandos
  while getopts ":hr" opt; do
    case $opt in
      h) help; exit 0 ;;
      r) RELEASE=true ;;
      \?) echo "Opción inválida: -$OPTARG" >&2; help; exit 1 ;;
    esac
  done

  # Verificar que Cargo esté instalado
  if ! command -v cargo &> /dev/null; then
    echo "Cargo no está instalado. Por favor, instala Rust y Cargo para continuar."
    exit 1
  fi

  # Determinar la ruta del binario generado por Cargo
  cd src-tauri
  local file_path=""
  if [ "$RELEASE" = true ]; then
    file_path="target/release/herramienta-flujos-rasa"
  else
    file_path="target/debug/herramienta-flujos-rasa"
  fi

  # Eliminar el binario existente en la raíz del proyecto si existe
  rm $file_path* 2> /dev/null || true

  # Construir el proyecto Tauri
  if [ "$RELEASE" = true ]; then
    cargo build --release
  else
    cargo build
  fi

  # Verificar si el binario se generó como .exe (en Windows) o sin extensión (en Unix)
  if [ -f "$file_path.exe" ]; then
    file_path="$file_path.exe"
  elif [ ! -f "$file_path" ]; then
    echo "Error: No se encontró el binario en $file_path"
    exit 1
  fi

  cp "$file_path" ../$(basename "$file_path")
  echo "Binario copiado a la raíz del proyecto: $(basename "$file_path")"

  ../$(basename "$file_path") # Ejecutar el binario copiado
}

main "$@"
