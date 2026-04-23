# Resumen de Flujo

- Flujo ID: vinculacion_especial_docentes
- Objetivo: Orientar el proceso administrativo de vinculacion especial de docentes
- Alcance: Flujo informativo paso a paso desde consulta inicial hasta cierre con orientacion final
- In scope: Identificacion de tipo docente y validaciones de presupuesto/documentos
- Out of scope: No incluye radicacion en sistemas externos ni aprobaciones automaticas
- Criterio de cierre: Usuario confirma que comprendio el procedimiento o solicita derivacion
- Cierre operativo: Interaccion registrada sin bucles y con respuesta final emitida

## Estados

| Orden | Estado | Entrada | Salida | Siguiente |
|---|---|---|---|---|
| 1 | consulta_inicial | Intent de entrada identificado | Usuario confirma continuidad | explicar_tipo_docente |
| 2 | explicar_tipo_docente | Entidad tipo_docente disponible | Usuario pide siguiente paso | explicar_reporte_necesidades |
| 3 | explicar_reporte_necesidades | Nivel y numero_docentes disponibles | Usuario confirma que tiene datos | explicar_validacion_presupuesto |
| 4 | explicar_validacion_presupuesto | Presupuesto reportado | Usuario solicita cierre o siguiente paso | explicar_revision_documental |
| 5 | explicar_revision_documental | Documentos cargados o estado_documentacion | Usuario confirma comprension | cierre_informativo |
| 6 | cierre_informativo | Flujo completado | Confirmacion final o derivacion | END |
