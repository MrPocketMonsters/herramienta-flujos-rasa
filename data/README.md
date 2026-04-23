# Plantilla de Flujos Conversacionales (Ofimática + Python)

Esta carpeta implementa un esquema simple para levantar nuevos flujos sin tocar codigo directamente.

## Objetivo

Permitir que el gestor de informacion diligencie un unico archivo Excel con una hoja por seccion, exportar esas hojas a CSV y luego convertir ese contenido en artefactos listos para implementar en Rasa.

## Ventajas del enfoque

- Distribucion simple: enviar esta carpeta por correo, OneDrive o Teams.
- Sin despliegues: solo un archivo Excel y un script Python.
- Sin software especializado: basta ofimatica para diligenciar.
- Trazabilidad: cada respuesta y transición se conecta con su fuente de datos.

## Archivo principal

- `flujo_conversacional.xlsx` (fuente de edicion con 1 hoja por cada seccion del flujo)
- Los CSV de esta carpeta son la salida intermedia que consume el compilador.

## Hojas del workbook y CSV asociados

| # | Hoja Excel | CSV asociado | Procesada por compilador | Descripcion |
|---|---|---|---|---|
| 0 | `00_introduccion_libro` | `00_introduccion_libro.csv` | No | Contexto general del libro de trabajo y uso recomendado para diligenciamiento. |
| 1 | `01_resumen_flujo` | `01_resumen_flujo.csv` | Si | Resume el objetivo y los limites del flujo para alinear alcance funcional y criterio de cierre. |
| 2 | `02_estados` | `02_estados.csv` | Si | Define la maquina de estados del flujo y las transiciones esperadas entre etapas. |
| 3 | `03_intenciones` | `03_intenciones.csv` | Si | Registra intents y ejemplos de lenguaje real que disparan transiciones del flujo. |
| 4 | `04_entidades_slots` | `04_entidades_slots.csv` | Si | Distingue entre entidades (dato detectado en el mensaje) y slots (variable de memoria del bot). |
| 5 | `05_respuestas` | `05_respuestas.csv` | Si | Define respuestas por estado incluyendo tono, longitud esperada y variaciones del mensaje. |
| 6 | `06_reglas` | `06_reglas.csv` | Si | Define reglas deterministicas del flujo. |
| 7 | `07_historias` | `07_historias.csv` | Si | Define historias de entrenamiento para variaciones conversacionales del flujo y posibles recorridos. |
| 8 | `08_fuentes_datos` | `08_fuentes_datos.csv` | Si | Mapea cada dato del flujo a su fuente oficial para garantizar trazabilidad y vigencia. |
| 9 | `09_checklist_validacion` | `09_checklist_validacion.csv` | Si | Lista de control para validar calidad y completitud antes de compilar el flujo. |

## Estructura por hoja

- Fila 1: descripcion de la hoja (contexto para el administrativo).
- Fila 2: encabezados tecnicos (usados por el compilador).
- Fila 3: definicion de cada columna (ayuda de diligenciamiento).
- Fila 4 en adelante: datos reales del flujo.

El exportador `tools/xlsx_a_csv.py` omite la fila 1 descriptiva y deja la fila 2 como encabezado y la fila 3 como definicion de columnas.
El compilador `tools/compilar_flujo_csv.py` lee los CSV de esta carpeta, ignora la fila de definicion de columnas y procesa los datos desde la tercera fila del CSV.

## Convenciones

- `flujo_id`: identificador corto en snake_case. Ejemplo: `vinculacion_especial_docentes`.
- En `04_entidades_slots`: `entidad` es el dato que se extrae del mensaje del usuario y `slot` es la variable donde el bot guarda ese dato para usarlo despues.
- `entidad` y `slot` pueden llamarse distinto; no tienen que ser iguales.
- En la hoja `03_intenciones`, diligenciar al menos 5 ejemplos por intent.
- En la hoja `06_reglas`, usar separador `>` para secuencia de intents/actions.
  - Ejemplo intents: `solicitar_vinculacion > confirmar_vinculacion`
  - Ejemplo actions: `utter_inicio_vinculacion > action_validar_requisitos`
  - El compilador intercalara por posicion: `intent1 > intent2` con `action1 > action2` se vuelve `intent1 -> action1 -> intent2 -> action2`.
  - En `condicion` tambien puedes usar `>` para multiples condiciones en la misma regla.
- En la hoja `07_historias`, usar separador `>` en `secuencia` con formato:
  - `intent:greet > action:action_saludo_mejorado > intent:solicitar_vinculacion > action:utter_inicio_vinculacion`

## Flujo de trabajo recomendado

1. Diligenciar las 9 hojas del workbook.
2. Validar internamente con el checklist.
3. Exportar el workbook a CSV:

```bash
python3 tools/xlsx_a_csv.py --workbook data/flujo_conversacional.xlsx --output-dir data
```

4. Ejecutar el compilador sobre CSV:

```bash
python3 tools/compilar_flujo_csv.py --csv-dir data --output-dir build
```

5. Revisar salida en `build/<flujo_id>/`.
6. Trasladar snippets a:
   - `data/nlu.yml`
   - `data/rules.yml`
   - `data/stories.yml`
   - `domain.yml` (intents/responses/slots si aplica)

## Salidas generadas

- `nlu_snippet.yml`
- `rules_snippet.yml`
- `stories_snippet.yml`
- `responses_snippet.yml`
- `trazabilidad_fuentes.md`
- `resumen_flujo.md`

## Nota operativa

Este esquema está pensado para integración semiautomática: un operador humano puede revisar y copiar los snippets, o un proceso posterior puede automatizar la inserción total en los archivos YAML del bot.
