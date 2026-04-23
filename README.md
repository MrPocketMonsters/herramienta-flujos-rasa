# Herramienta de Flujos Rasa

Repositorio para diseñar flujos conversacionales en una planilla Excel, exportarlos a CSV y convertirlos después en archivos de configuración y snippets para Rasa.

La idea central es que personas sin preparación técnica en IT puedan aportar al diseño funcional del flujo usando lenguaje natural. Por eso, el workbook está pensado para ser diligenciado por negocio o por personal operativo, mientras que un administrador del sistema revisa y ajusta después los campos técnicos, las condiciones y los snippets generados.

## Propósito

Este proyecto separa dos momentos del trabajo:

1. Diseño funcional en Excel, con lenguaje natural y estructura guiada.
2. Exportación a CSV como insumo estable para el compilador.
3. Conversión a artefactos técnicos, donde un administrador revisa y normaliza lo necesario para Rasa.

Esto permite capturar intención de negocio sin exigir que el usuario conozca detalles de intents, slots, reglas o sintaxis YAML.

## Estructura del repositorio

```text
.
├── data/
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
│   └── xlsx_a_csv.py
├── build/
└── requirements.txt
```

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

Convertir el workbook Excel a CSV:

```bash
python tools/xlsx_a_csv.py --workbook data/flujo_conversacional.xlsx --output-dir data
```

Compilar los CSV en snippets para Rasa:

```bash
python tools/compilar_flujo_csv.py --csv-dir data --output-dir build
```

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
