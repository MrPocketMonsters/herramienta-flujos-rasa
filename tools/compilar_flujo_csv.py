"""Compila los CSV de un flujo conversacional en snippets para Rasa.

Uso:
python tools/compilar_flujo_csv.py [-h] [--csv-dir CSV_DIR] [--output-dir OUTPUT_DIR]

Valores por defecto:
--csv-dir: data
--output-dir: build
"""

from __future__ import annotations

import argparse
import csv
from collections import defaultdict
from pathlib import Path


TEMPLATE_FILES = {
    "resumen": "01_resumen_flujo.csv",
    "estados": "02_estados.csv",
    "intenciones": "03_intenciones.csv",
    "entidades": "04_entidades_slots.csv",
    "respuestas": "05_respuestas.csv",
    "reglas": "06_reglas.csv",
    "historias": "07_historias.csv",
    "fuentes": "08_fuentes_datos.csv",
    "checklist": "09_checklist_validacion.csv",
}


def normalize_value(value: object) -> str:
    if value is None:
        return ""
    if isinstance(value, float) and value.is_integer():
        return str(int(value))
    return str(value).strip()


def read_csv_sheet(csv_path: Path) -> list[dict[str, str]]:
    if not csv_path.exists():
        raise FileNotFoundError(f"No existe el CSV requerido: {csv_path}")

    with csv_path.open("r", encoding="utf-8-sig", newline="") as f:
        rows = list(csv.reader(f))

    if len(rows) < 3:
        return []

    # Estructura esperada del CSV exportado desde Excel:
    # fila 1: encabezados técnicos
    # fila 2: definición de columnas (se ignora)
    # fila 3+: datos reales
    headers = [normalize_value(h) for h in rows[0]]
    data_rows: list[dict[str, str]] = []

    for row in rows[2:]:
        values = [normalize_value(v) for v in row]
        item: dict[str, str] = {}
        has_data = False

        for idx, header in enumerate(headers):
            if not header:
                continue
            value = values[idx] if idx < len(values) else ""
            item[header] = value
            if value:
                has_data = True

        if has_data:
            data_rows.append(item)

    return data_rows


def ensure_dir(path: Path) -> None:
    path.mkdir(parents=True, exist_ok=True)


def yaml_quote(value: str) -> str:
    escaped = value.replace('"', "\\\"")
    return f'"{escaped}"'


def split_sequence(value: str, sep: str = ">") -> list[str]:
    return [item.strip() for item in value.split(sep) if item.strip()]


def parse_variants(value: str) -> list[str]:
    return [item.strip() for item in value.split("|") if item.strip()]


def required_fields(rows: list[dict[str, str]], fields: list[str], file_name: str) -> None:
    # En el CSV, los datos inician en la fila 3.
    for idx, row in enumerate(rows, start=3):
        for field in fields:
            if not row.get(field):
                raise ValueError(f"{file_name}: fila {idx} sin valor en columna obligatoria '{field}'")


def interleave_rule_steps(intents: list[str], actions: list[str]) -> list[tuple[str, str]]:
    """Intercala intents y actions por posicion: intent1, action1, intent2, action2..."""
    steps: list[tuple[str, str]] = []
    max_len = max(len(intents), len(actions))

    for idx in range(max_len):
        if idx < len(intents):
            steps.append(("intent", intents[idx]))
        if idx < len(actions):
            steps.append(("action", actions[idx]))

    return steps


def build_nlu(intents_rows: list[dict[str, str]]) -> str:
    grouped: dict[str, list[str]] = defaultdict(list)
    for row in intents_rows:
        intent = row["intent"]
        for col in ["ejemplo_1", "ejemplo_2", "ejemplo_3", "ejemplo_4", "ejemplo_5"]:
            ex = row.get(col, "")
            if ex:
                grouped[intent].append(ex)

    lines = ["version: \"3.1\"", "", "nlu:"]
    for intent, examples in grouped.items():
        lines.append(f"- intent: {intent}")
        lines.append("  examples: |")
        for ex in examples:
            lines.append(f"    - {ex}")
    lines.append("")
    return "\n".join(lines)


def build_responses(respuestas_rows: list[dict[str, str]]) -> str:
    grouped: dict[str, list[str]] = defaultdict(list)
    for row in respuestas_rows:
        rid = row["respuesta_id"]
        base = row.get("texto_base", "")
        variants = parse_variants(row.get("variantes_1_3", ""))
        if base:
            grouped[rid].append(base)
        grouped[rid].extend(variants)

    lines = ["version: \"3.1\"", "", "responses:"]
    for rid, texts in grouped.items():
        lines.append(f"  {rid}:")
        for text in texts:
            lines.append(f"    - text: {yaml_quote(text)}")
    lines.append("")
    return "\n".join(lines)


def build_rules(reglas_rows: list[dict[str, str]]) -> str:
    lines = ["version: \"3.1\"", "", "rules:"]
    for row in reglas_rows:
        rule_name = row["rule_name"]
        condition = row.get("condicion", "")
        conditions = split_sequence(condition) if condition else []
        intents = split_sequence(row.get("steps_intents", ""))
        actions = split_sequence(row.get("steps_actions", ""))
        steps = interleave_rule_steps(intents, actions)

        lines.append(f"- rule: {rule_name}")
        if conditions:
            lines.append("  condition:")
            for cond in conditions:
                lines.append(f"  - {cond}")
        lines.append("  steps:")
        for step_type, value in steps:
            lines.append(f"  - {step_type}: {value}")
        if not steps:
            lines.append("  - intent: TODO")
            lines.append("  - action: TODO")
    lines.append("")
    return "\n".join(lines)


def build_stories(historias_rows: list[dict[str, str]]) -> str:
    lines = ["version: \"3.1\"", "", "stories:"]
    for row in historias_rows:
        story_name = row["story_name"]
        sequence = split_sequence(row.get("secuencia", ""))
        lines.append(f"- story: {story_name}")
        lines.append("  steps:")
        for step in sequence:
            if step.startswith("intent:"):
                lines.append(f"  - intent: {step.split(':', 1)[1].strip()}")
            elif step.startswith("action:"):
                lines.append(f"  - action: {step.split(':', 1)[1].strip()}")
        if not sequence:
            lines.append("  - intent: TODO")
            lines.append("  - action: TODO")
    lines.append("")
    return "\n".join(lines)


def build_fuentes_md(rows: list[dict[str, str]]) -> str:
    lines = [
        "# Trazabilidad de Fuentes",
        "",
        "| Dato | Fuente Tipo | Ubicacion | Campo/Tabla | Vigencia | Responsable | Contingencia |",
        "|---|---|---|---|---|---|---|",
    ]
    for row in rows:
        lines.append(
            "| {dato} | {tipo} | {ubic} | {campo} | {vig} | {resp} | {cont} |".format(
                dato=row.get("dato", ""),
                tipo=row.get("fuente_tipo", ""),
                ubic=row.get("fuente_ubicacion", ""),
                campo=row.get("campo_tabla", ""),
                vig=row.get("criterio_vigencia", ""),
                resp=row.get("responsable", ""),
                cont=row.get("accion_si_no_disponible", ""),
            )
        )
    lines.append("")
    return "\n".join(lines)


def build_summary_md(resumen: dict[str, str], estados_rows: list[dict[str, str]]) -> str:
    lines = [
        "# Resumen de Flujo",
        "",
        f"- Flujo ID: {resumen.get('flujo_id', '')}",
        f"- Objetivo: {resumen.get('objetivo', '')}",
        f"- Alcance: {resumen.get('alcance', '')}",
        f"- In scope: {resumen.get('in_scope', '')}",
        f"- Out of scope: {resumen.get('out_scope', '')}",
        f"- Criterio de cierre: {resumen.get('criterio_cierre', '')}",
        f"- Cierre operativo: {resumen.get('criterio_cierre_operativo', '')}",
        "",
        "## Estados",
        "",
        "| Orden | Estado | Entrada | Salida | Siguiente |",
        "|---|---|---|---|---|",
    ]

    for row in sorted(estados_rows, key=lambda r: int(r.get("orden") or 9999)):
        lines.append(
            "| {orden} | {estado} | {entrada} | {salida} | {sig} |".format(
                orden=row.get("orden", ""),
                estado=row.get("estado_id", ""),
                entrada=row.get("condicion_entrada", ""),
                salida=row.get("condicion_salida", ""),
                sig=row.get("siguiente_estado", ""),
            )
        )
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="Compila CSV de flujo conversacional en snippets Rasa")
    parser.add_argument(
        "--csv-dir",
        required=False,
        default="data",
        help="Directorio con los CSV exportados desde el workbook",
    )
    parser.add_argument(
        "--output-dir",
        required=False,
        default="build",
        help="Directorio de salida",
    )
    args = parser.parse_args()

    csv_root = Path(args.csv_dir)
    output_root = Path(args.output_dir)

    resumen_rows = read_csv_sheet(csv_root / TEMPLATE_FILES["resumen"])
    estados_rows = read_csv_sheet(csv_root / TEMPLATE_FILES["estados"])
    intents_rows = read_csv_sheet(csv_root / TEMPLATE_FILES["intenciones"])
    entidades_rows = read_csv_sheet(csv_root / TEMPLATE_FILES["entidades"])
    respuestas_rows = read_csv_sheet(csv_root / TEMPLATE_FILES["respuestas"])
    reglas_rows = read_csv_sheet(csv_root / TEMPLATE_FILES["reglas"])
    historias_rows = read_csv_sheet(csv_root / TEMPLATE_FILES["historias"])
    fuentes_rows = read_csv_sheet(csv_root / TEMPLATE_FILES["fuentes"])

    required_fields(resumen_rows, ["flujo_id", "objetivo"], TEMPLATE_FILES["resumen"])
    required_fields(estados_rows, ["flujo_id", "orden", "estado_id"], TEMPLATE_FILES["estados"])
    required_fields(intents_rows, ["flujo_id", "intent", "ejemplo_1"], TEMPLATE_FILES["intenciones"])
    required_fields(entidades_rows, ["flujo_id", "entidad", "slot"], TEMPLATE_FILES["entidades"])
    required_fields(respuestas_rows, ["flujo_id", "respuesta_id", "texto_base"], TEMPLATE_FILES["respuestas"])
    required_fields(reglas_rows, ["flujo_id", "rule_name"], TEMPLATE_FILES["reglas"])
    required_fields(historias_rows, ["flujo_id", "story_name"], TEMPLATE_FILES["historias"])

    by_flow = defaultdict(lambda: {
        "resumen": None,
        "estados": [],
        "intents": [],
        "entidades": [],
        "respuestas": [],
        "reglas": [],
        "historias": [],
        "fuentes": [],
    })

    for row in resumen_rows:
        by_flow[row["flujo_id"]]["resumen"] = row
    for row in estados_rows:
        by_flow[row["flujo_id"]]["estados"].append(row)
    for row in intents_rows:
        by_flow[row["flujo_id"]]["intents"].append(row)
    for row in entidades_rows:
        by_flow[row["flujo_id"]]["entidades"].append(row)
    for row in respuestas_rows:
        by_flow[row["flujo_id"]]["respuestas"].append(row)
    for row in reglas_rows:
        by_flow[row["flujo_id"]]["reglas"].append(row)
    for row in historias_rows:
        by_flow[row["flujo_id"]]["historias"].append(row)
    for row in fuentes_rows:
        by_flow[row["flujo_id"]]["fuentes"].append(row)

    ensure_dir(output_root)

    for flow_id, data in by_flow.items():
        if not data["resumen"]:
            raise ValueError(f"Flujo '{flow_id}' no tiene fila en {TEMPLATE_FILES['resumen']}")

        flow_out = output_root / flow_id
        ensure_dir(flow_out)

        (flow_out / "nlu_snippet.yml").write_text(
            build_nlu(data["intents"]), encoding="utf-8"
        )
        (flow_out / "responses_snippet.yml").write_text(
            build_responses(data["respuestas"]), encoding="utf-8"
        )
        (flow_out / "rules_snippet.yml").write_text(
            build_rules(data["reglas"]), encoding="utf-8"
        )
        (flow_out / "stories_snippet.yml").write_text(
            build_stories(data["historias"]), encoding="utf-8"
        )
        (flow_out / "trazabilidad_fuentes.md").write_text(
            build_fuentes_md(data["fuentes"]), encoding="utf-8"
        )
        (flow_out / "resumen_flujo.md").write_text(
            build_summary_md(data["resumen"], data["estados"]), encoding="utf-8"
        )

    print(f"OK: artefactos generados en {output_root}")
    print(f"Flujos procesados: {', '.join(sorted(by_flow.keys()))}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
