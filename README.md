# Herramienta de Flujos Rasa

Repositorio destinado al diseño de flujos conversacionales a partir de un workbook Excel, su exportación a CSV y la conversión posterior en archivos de configuración y snippets para Rasa.

Además, se provee una aplicación web portable: la interfaz se abre localmente sin servidor y el empaquetado de escritorio actúa únicamente como medio de distribución.

Se pretende que personas sin formación técnica en IT aporten al diseño funcional del flujo mediante lenguaje natural. Para ello, el workbook está concebido para ser diligenciado por personal de negocio u operativo; posteriormente, un administrador del sistema realiza la revisión y normalización de los campos técnicos, condiciones y snippets generados.

## Propósito

El proyecto separa dos momentos del trabajo:

1. Diseño funcional en Excel, utilizando lenguaje natural y estructura guiada.
2. Exportación a CSV como insumo estable para el compilador.
3. Conversión a artefactos técnicos, con revisión y normalización por parte del administrador.

Se aplica este flujo con el fin de capturar intención funcional sin exigir conocimiento técnico sobre intents, slots, reglas o sintaxis YAML.

El objetivo de la aplicación web es reducir la fricción asociada a la plantilla Excel (que requiere gestión por filas), al transformar dicha plantilla en una interfaz más comprensible y utilizable por personal no técnico.

## Estructura del repositorio

```text
.
├── index.html                 # Landing page
├── formulario.html            # Interfaz de formulario/tabla
├── web/                       # [GENERADO POR PREPARAR_TAURI.PY, EN REPO]
│   ├── css/                   # Estilos
│   ├── html/                  # Partiales HTML
│   └── js/                    # Scripts frontend (formulario.js, etc.)
├── data/                      # [NO EN REPO, EXTERNO]
│   ├── flujo_conversacional.xlsx
│   ├── 00_introduccion_libro.csv
│   ├── 01_resumen_flujo.csv
│   ├── 02_estados.csv
│   ├── 03_intenciones.csv
│   ├── 04_entidades_slots.csv
│   ├── 05_respuestas.csv
│   ├── 06_reglas.csv
│   ├── 07_historias.csv
│   ├── 08_fuentes_datos.csv
│   ├── 09_checklist_validacion.csv
│   └── README.md
├── tools/
│   ├── compilar_flujo_csv.py
│   ├── xlsx_a_csv.py
├── build/                     # Resultado de compilación de snippets
├── src-tauri/                 # Código Rust y Tauri config
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   ├── build.rs
│   └── src/main.rs
├── docs/
│   ├── MANUAL_FLUJOS_ADM.md   # Referencia sobre procesamiento de datos en Rasa
│   ├── TAURI_BUILD.md         # Instrucciones para compilar la app de escritorio
│   └── TAURI_EXTERNAL_DATA.md # Referencia para manejo de archivos externos en Tauri
├── .gitignore
├── requirements.txt
└── README.md (este archivo)
```

### Carpetas principales y versionado

| Carpeta | Versión Git | Propósito |
| --- | --- | --- |
| `web/` | ✅ SÍ | Código fuente de la interfaz web. Se empaqueta dentro de la app compilada. |
| `data/` | ❌ NO | CSV y Excel del flujo. Gestionado por aplicación en tiempo de ejecución |
| `src-tauri/` | ✅ SÍ | Código Rust y configuración de Tauri. |
| `build/` | ❌ NO | Artefactos de salida del compilador Rasa. |
| `tools/` | ✅ SÍ | Scripts Python de desarrollo (conversión XLSX→CSV, compilación). |

## Modelo de distribución

Al distribuirse la aplicación compilada se entregan los siguientes elementos:

```
herramienta-flujos-rasa      (ejecutable)
data/                        (carpeta con CSV)
```

Los CSV contenidos en `data/` pueden ser modificados mediante la interfaz web integrada. Como resultado, la carpeta `data/` con los CSV actualizados queda disponible para alimentar el sistema Rasa; en iteraciones futuras se podrá admitir la exportación a XLSX.

## Cómo funciona

El archivo principal de edición es [data/flujo_conversacional.xlsx](data/flujo_conversacional.xlsx). Cada hoja representa una parte del flujo:

- resumen del flujo
- estados
- intenciones
- entidades y slots
- respuestas
- reglas
- historias
- fuentes de datos
- checklist de validación

Las hojas incluyen una primera fila descriptiva para ayudar a quien las diligencia. Luego el script de conversión exporta los datos a CSV en [data/](data/) y el compilador usa esos CSV para generar snippets.

El detalle de cada CSV y su hoja correspondiente está documentado en [data/README.md](data/README.md).

## Tecnologías

- Python 3.12
- `openpyxl` para leer el workbook Excel
- `pandas` para validaciones y comparaciones entre CSV y Excel
- Tauri para empaquetar la interfaz como app portable de escritorio

Las dependencias están en [requirements.txt](requirements.txt).

## Instalación

Crear y activar el entorno virtual:

```bash
python -m venv .venv
source .venv/bin/activate
```

Instalar dependencias:

```bash
pip install -r requirements.txt
```

## Ejecución

### Para desarrolladores (workflow local)

Convertir el workbook Excel a CSV:

```bash
python tools/xlsx_a_csv.py --workbook data/flujo_conversacional.xlsx --output-dir data
```

Compilar los CSV en snippets para Rasa:

```bash
python tools/compilar_flujo_csv.py --csv-dir data --output-dir build
```

### Para empaquetar y compilar la app

Ver instrucciones completas en [docs/TAURI_BUILD.md](docs/TAURI_BUILD.md).

Resumen rápido:

```bash
# Compilar la app
cd src-tauri
cargo tauri dev        # Modo desarrollo (hot-reload)
cargo tauri build      # Modo release (ejecutable final)
```

El binario final estará en `src-tauri/target/release/herramienta-flujos-rasa` (Linux) o `.exe` (Windows).

### Para usuarios finales

1. Descarga la carpeta de distribución (contiene `herramienta-flujos-rasa` + `data/`).
2. Abre el ejecutable `herramienta-flujos-rasa` (o `herramienta-flujos-rasa.exe` en Windows).
3. Modifica los flujos conversacionales usando la interfaz web.
4. La app guarda los cambios en los CSV dentro de `data/`, que luego se pueden usar para alimentar el sistema Rasa.

Para detalles sobre cómo se cargan los CSV en tiempo de ejecución, ver [docs/TAURI_EXTERNAL_DATA.md](docs/TAURI_EXTERNAL_DATA.md).

La app de escritorio se compila desde `src-tauri/` y toma los archivos estáticos desde `web/`.

Consulta [docs/TAURI_BUILD.md](docs/TAURI_BUILD.md) para instrucciones detalladas por plataforma, dependencias del sistema y resolución de problemas.

## Flujo recomendado para usuarios no técnicos

1. Abrir [data/flujo_conversacional.xlsx](data/flujo_conversacional.xlsx).
2. Diligenciar cada hoja con lenguaje natural y ejemplos reales.
3. Completar campos como condiciones, tipos de slot, validaciones y repreguntas usando la mejor descripción funcional posible, no sintaxis técnica.
4. Validar el checklist.
5. Ejecutar `tools/xlsx_a_csv.py` para actualizar los CSV en [data/](data/).
6. Ejecutar `tools/compilar_flujo_csv.py` para generar los snippets técnicos.
7. El administrador del sistema revisa los CSV y los snippets generados, y ajusta los nombres técnicos, reglas, slots y respuestas finales.

## Criterio de diseño

Este repositorio no busca que la persona que diseña el flujo conozca IT, Rasa o YAML.

La expectativa es que esa persona aporte:

- objetivos del flujo
- estados o pasos del proceso
- ejemplos de intentos o preguntas frecuentes del usuario
- entidades o datos esperados en lenguaje natural
- condiciones funcionales
- respuestas esperadas
- fuentes de datos

Después, una persona administradora traduce y normaliza esos insumos al formato técnico que el sistema necesita.

## Referencia administrativa clave

Este repositorio se apoya en la guía [MANUAL_FLUJOS_ADM.md](docs/MANUAL_FLUJOS_ADM.md), que define el marco operativo para áreas no técnicas y para el equipo administrador del sistema.

Puntos clave que aporta el manual:

- Diferencia explícita entre procesamiento determinístico (`rules`, validaciones, transiciones por estado) y probabilístico (clasificación de lenguaje natural e identificación de entidades).
- Responsabilidad funcional sobre la calidad de datos: el asistente no inventa conocimiento; la precisión depende de las fuentes institucionales actualizadas.
- Matriz de definición funcional para nuevos flujos: objetivo acotado, máquina de estados, intenciones de transición, entidades/slots, reglas e historias, respuestas, fuentes de información y criterios de cierre.
- Criterios de calidad: trazabilidad, cobertura de ejemplos, delimitación del alcance y manejo de contingencias/fallback.

Recomendación de uso del manual junto con este repo:

1. Usar el manual para diseñar y validar el flujo en lenguaje natural desde negocio.
2. Diligenciar [data/flujo_conversacional.xlsx](data/flujo_conversacional.xlsx) con esa definición.
3. Exportar a CSV y compilar snippets.
4. Ejecutar la revisión técnica final por parte del administrador.

## Salida generada

El resultado del proceso de compilación puede incluir:

- `nlu_snippet.yml`
- `responses_snippet.yml`
- `rules_snippet.yml`
- `stories_snippet.yml`
- `resumen_flujo.md`
- `trazabilidad_fuentes.md`

## Notas

- La hoja `00_introduccion_libro` funciona como contexto general del workbook.
- La primera fila descriptiva de cada hoja no forma parte del CSV exportado.
