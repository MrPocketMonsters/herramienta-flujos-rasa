# Herramienta de Flujos Rasa

Repositorio destinado al diseño de flujos conversacionales a partir de un workbook Excel, su exportación a CSV y la conversión posterior en archivos de configuración y snippets para Rasa.

Además, se provee una aplicación web portable: la interfaz se abre localmente sin servidor y el empaquetado de escritorio actúa únicamente como medio de distribución.

Se pretende que personas sin formación técnica en IT aporten al diseño funcional del flujo mediante lenguaje natural. Para ello, el workbook está concebido para ser diligenciado por personal de negocio u operativo; posteriormente, un administrador del sistema realiza la revisión y normalización de los campos técnicos, condiciones y snippets generados.

## Enfoque de diseño

El proyecto separa dos momentos del trabajo:

1. Diseño funcional en Excel, utilizando lenguaje natural y estructura guiada.
2. Exportación a CSV como insumo estable para el compilador.
3. Conversión a artefactos técnicos, con revisión y normalización por parte del administrador.

Se aplica este flujo con el fin de capturar intención funcional sin exigir conocimiento técnico sobre intents, slots, reglas o sintaxis YAML.

El objetivo de la aplicación web es reducir los tiempos de desarrollo iterativo donde un ingeniero traduce requisitos funcionales a formato técnico, permitiendo que el equipo de negocio pueda ajustar y validar los flujos directamente sobre los CSV, con una interfaz amigable que abstrae la complejidad técnica.

## Estructura del repositorio

```text
.
├── index.html                 # Landing page
├── formulario.html            # Interfaz de formulario/tabla
├── web/                       # Código estático de la interfaz web (empaquetado en la app)
│   ├── css/                   # Estilos (incluye `app.css`, ajustes recientes para el formulario)
│   ├── html/                  # Partiales HTML (p. ej. `estados.html`, `intentenciones.html`, `formulario.html`)
│   ├── js/                    # Scripts frontend
│   │   ├── formulario/        # Módulos del formulario dinámico (DOM, render, loaders, savers, options, components)
│   │   └── utils/             # Utilidades (csv, strings, etc.)
│   └── config/                # Configuraciones de formularios (p. ej. `02_estados.formulario.json`)
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

```text
herramienta-flujos-rasa[.exe] (ejecutable)
data/                         (carpeta con CSV)
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
- Tauri para empaquetar la interfaz como app portable de escritorio
- Rust y Cargo para compilar la app de escritorio
- Javascript para el frontend, con enfoque modular y componentes reutilizables.

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

Si es claro lo que está sucediendo, para pruebas rápidas se puede usar el script `build-and-run.sh` que compila la app, la mueve a la raíz del proyecto y la ejecuta:

```bash
./build-and-run.sh
```

Esto permite realizar modificaciones rápidas en el código Rust o en la interfaz web y probarlas sin salir del entorno de desarrollo.

### Para usuarios finales

1. Descarga la carpeta de distribución (contiene `herramienta-flujos-rasa` + `data/`).
2. Abre el ejecutable `herramienta-flujos-rasa` (o `herramienta-flujos-rasa.exe` en Windows).
3. Modifica los flujos conversacionales usando la interfaz web.
4. La app guarda los cambios en los CSV dentro de `data/`, que luego se pueden usar para alimentar el sistema Rasa.

Para detalles sobre cómo se cargan los CSV en tiempo de ejecución, ver [docs/TAURI_EXTERNAL_DATA.md](docs/TAURI_EXTERNAL_DATA.md).

La app de escritorio se compila desde `src-tauri/` y toma los archivos estáticos desde `web/`.

Consulta [docs/TAURI_BUILD.md](docs/TAURI_BUILD.md) para instrucciones detalladas por plataforma, dependencias del sistema y resolución de problemas.

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

## Flujo recomendado para usuarios no técnicos

1. Abrir [data/flujo_conversacional.xlsx](data/flujo_conversacional.xlsx).
2. Diligenciar cada hoja con lenguaje natural y ejemplos reales.
3. Completar campos como condiciones, tipos de slot, validaciones y repreguntas usando la mejor descripción funcional posible, no sintaxis técnica.
4. Validar el checklist.
5. Ejecutar `tools/xlsx_a_csv.py` para actualizar los CSV en [data/](data/).
6. Ejecutar `tools/compilar_flujo_csv.py` para generar los snippets técnicos.
7. El administrador del sistema revisa los CSV y los snippets generados, y ajusta los nombres técnicos, reglas, slots y respuestas finales.

## Salida generada

El resultado del proceso de compilación puede incluir:

- `nlu_snippet.yml`
- `responses_snippet.yml`
- `rules_snippet.yml`
- `stories_snippet.yml`
- `resumen_flujo.md`
- `trazabilidad_fuentes.md`

## Siguientes pasos

### Corto plazo

- Eliminar mocks usados para guiar diseño.
  - ./web/index-mock.html
  - ./web/js/mockups.js
  - ./web/html/estados.html
  - ./web/html/intentenciones.html
- Remodelar página principal para llevar a documentación o a selector de flujos.
- Generar documentación embebida en la interfaz web para guiar a los usuarios en el proceso de diseño y edición de flujos.

### Mediano plazo

- Actualmente, un gran generador de fricción para el diseño de los flujos por parte del gestor del conocimiento está en las tablas 06_reglas.csv y 07_historias.csv, que requieren un conocimiento medianamente técnico para ser diligenciadas. En el futuro, la interacción entre 02_estados.csv, 03_intenciones.csv, 04_entidades_slots.csv y 05_respuestas.csv debería ser suficiente para generar automáticamente las reglas e historias básicas en su formato mixto con lenguaje natural para que el ingeniero encargado sólo se encargue de normalizar y ajustar lengual técnico, sin necesidad de escribir reglas o historias desde cero.

- Una funcionalidad que ha quedado sin implementación es la de los mensajes de repregunta. Se permite definirlos por parte del usuario, pero no se han incluido en la generación de snippets. En iteraciones futuras se podría incluir esta funcionalidad, que es clave para mejorar la experiencia conversacional y reducir los casos de fallback.
