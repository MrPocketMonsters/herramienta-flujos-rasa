# Guía Administrativa: Gestión de Datos y Flujos Conversacionales

_Documento de referencia operativa para coordinadores de área, gestores de información institucional y personal administrativo._

## Resumen

El asistente virtual (Chatbot de Postgrados) opera bajo un modelo de dependencia de datos. Su capacidad de resolución se basa **exclusivamente en la integridad y precisión de la información** suministrada por las áreas administrativas. Inconsistencias en los repositorios de origen (por ejemplo registros en la base de datos Oracle APEX o matrices de control) se traducen directamente en fallos de atención al usuario final.

**Objetivo de este documento:** Establecer los lineamientos para la administración del conocimiento subyacente al sistema, detallando el nivel de impacto de los datos, las responsabilidades de actualización y el procedimiento estándar para estructurar y solicitar la implementación de nuevos flujos conversacionales.

## Entendiendo la toma de decisiones del sistema

Para el diagnóstico de incidencias y el diseño de nuevos requerimientos, es imperativo distinguir entre los dos modelos de procesamiento que rigen el comportamiento del aplicativo:

### 1. Procesamiento Determinístico (Lógica Basada en Reglas)

- **Definición:** Respuestas y transiciones predefinidas que operan bajo condiciones exactas. La relación entre la solicitud y la respuesta es directa y sin ambigüedad.
- **Mecanismo aplicativo:** En RASA, este comportamiento se expresa principalmente mediante `rules` y condiciones explícitas de estado/slot. Por ejemplo, al seleccionar el programa "Maestría en Software" desde un menú estructurado, el sistema realiza una consulta directa a la base de datos para extraer los costos asociados de manera literal.
- **Responsabilidad administrativa:** Garantizar la precisión, formato y actualización oportuna de los registros primarios (nombres de programas, valores financieros, enlaces oficiales).

### 2. Procesamiento Probabilístico (Clasificación de Lenguaje Natural)

- **Definición:** Algoritmos de inferencia que evalúan consultas de texto libre para categorizarlas dentro de una intención previamente entrenada y extraer entidades relevantes.
- **Mecanismo aplicativo:** Expresiones heterogéneas como _"valor del semestre"_, _"precio de la carrera"_ o _"cuánto cuesta"_ son procesadas y agrupadas estocásticamente bajo la intención unificada **Consultar_Costos**.
- **Responsabilidad administrativa:** Suministrar un conjunto representativo de las variaciones lingüísticas utilizadas por los aspirantes, a fin de minimizar el margen de error (falsos positivos/negativos) en la clasificación.

La operación del asistente combina ambos modelos: la interpretación del mensaje del usuario (intención y entidades) es probabilística, mientras la ejecución del flujo (transiciones, validaciones y respuestas predefinidas) se define con lógica determinística mediante reglas y por secuencias guiadas por políticas entrenadas a partir de historias.

El sistema usa **"Inteligencia Artificial"** únicamente como una herramienta de interpretación de lenguaje natural, pero no genera ni modifica el conocimiento por sí mismo. La calidad de la interacción depende enteramente de la calidad y actualización de los datos que se le proporcionan.

## Inventario Estructural de Datos

El sistema actúa como una interfaz de representación; el conocimiento reside en las bases de datos transaccionales administradas por las unidades institucionales.

| Componente Funcional | Origen de los Datos | Propietario Funcional | Riesgo de Integridad (Impacto Operativo) |
|---|---|---|---|
| **Catálogo Académico** | BD Oracle (Tabla `POSTGRADOS`) | Coordinación Académica | Presentación de oferta educativa inactiva; omisión de programas recientes. |
| **Base de Conocimiento (FAQ)** | BD Oracle (Tabla `FAQ`) | Atención al Estudiante | Entrega de información desactualizada (ej. calendarios vencidos); aumento de fallos de interpretación (Fallback). |
| **Gestión de Excepciones** | Lineamientos Internos de SAC | Soporte Técnico / SAC | Generación de bucles conversacionales (loops) sin resolución ni derivación efectiva. |

## Metodología para la Estructuración de Nuevos Flujos

Toda solicitud de ampliación de la capacidad conversacional (ej. adición del proceso de *vinculación especial de docentes nuevos*) requiere radicar un diseño previo compatible con RASA. El gestor de información no debe diseñar el asistente para ejecutar el proceso, sino para _explicar cómo debe realizarse_; por tanto, debe describir también _cuándo_, _con qué condición_, _a partir de qué entidades_ y _desde qué fuente de verdad_ debe activarse cada respuesta informativa.

### Matriz de Definición Funcional

1. **Objetivo del Flujo:** Definición concreta del proceso de atención a explicar (ej. informar si el docente para vinculación especial es antiguo, indicar el número y tipo de docentes requeridos para el semestre, describir cómo se valida el presupuesto o explicar cómo se gestionan observaciones de documentos). El objetivo debe ser verificable y acotado; un flujo no debe intentar resolver varias necesidades no relacionadas.

2. **Máquina de Estados del Flujo:** Descripción de la secuencia lógica de estados por los que pasará la conversación. Cada estado debe indicar:

   - Estado de entrada.
   - Condición de permanencia.
   - Condición de salida.
   - Estado siguiente.

   Ejemplo: *consulta inicial* → *explicación del paso correspondiente* → *indicar qué debe remitir el proyecto curricular* → *explicar validación presupuestal* → *explicar revisión documental* → *cierre informativo*.

3. **Intenciones de Transición:** Identificación de las intenciones que mueven el flujo entre estados. Deben separarse las intenciones de entrada, continuidad, confirmación, corrección y salida. Para cada intención se deben incluir al menos 5 ejemplos de redacción realista del usuario, usando la misma lógica del proceso de vinculación. Ejemplos de transición: "cómo se sabe si el docente es antiguo", "qué debe hacer el proyecto curricular", "qué tipo y número de docentes se informa", "cómo se valida el presupuesto", "qué pasa si los documentos no cumplen".

4. **Entidades y Variables de Contexto:** El flujo debe declarar qué entidades extrae RASA de cada mensaje y qué slots o variables de contexto se llenarán con ellas. Para este proceso, los ejemplos deben estar alineados con el trabajo real: tipo de docente (HCP, HCH, MTO, TCO), nivel (pregrado o posgrado), número de docentes, fechas de actividad, número de horas, materia, presupuesto, estado de documentación y dependencia responsable. Si una entidad no puede extraerse con claridad, se debe definir el comportamiento de repregunta.

5. **Reglas e Historias:** El diseño debe indicar qué partes del comportamiento serán regidas por `rules` (comportamientos determinísticos y repetibles) y cuáles por `stories` (secuencias conversacionales con variaciones). Un flujo de aprobación simple puede resolverse con reglas; un flujo con variación o acumulación de contexto requiere historias bien descritas.

6. **Respuestas Predefinidas:** Cada estado debe tener una respuesta bot definida o una familia de respuestas equivalentes. La respuesta debe especificar tono, longitud, contenido obligatorio, campos variables y mensajes de repregunta o de fallback. Los textos deben explicar el procedimiento: indicar si el docente es antiguo, explicar qué debe diligenciar el proyecto curricular, describir cómo se valida el presupuesto, aclarar qué documentos deben cargarse, explicar qué se revisa y cerrar con la orientación u observación correspondiente. No basta con indicar el tema general; se debe entregar el texto utilizable o la plantilla concreta.

7. **Fuentes de Información:** Debe indicarse de dónde se obtendrá cada dato del flujo: oficio por correo electrónico, Excel compartido en OneDrive, plantilla presupuestal, plataforma de resoluciones, registro de cálculos presupuestales, validación del profesional financiero, verificación del proyecto curricular o respuesta de talento humano. La fuente debe ser activa, trazable y tener un responsable funcional. Si el dato proviene de una tabla, se debe indicar su nombre, campo relevante y criterio de vigencia.

8. **Dependencias de Datos (Componente Determinístico):** Aseguramiento del registro actualizado en la base Oracle correspondiente o en la fuente operativa definida por el proceso (fechas habilitadas, enlaces a instructivos validados, Excel de proyectos curriculares, presupuestos, documentos cargados y resoluciones expedidas). Cuando el flujo dependa de una fuente externa, se debe definir qué ocurre si la fuente está ausente, desactualizada o no autorizada.

9. **Cierre del Flujo:** Criterio de resolución para terminar la interacción. Debe especificar si el cierre ocurre por confirmación del usuario, resolución total, derivación a mesa de ayuda o activación de fallback.

10. **Condición de Cierre Operativo:** Se debe indicar cómo se valida que el flujo funcionó correctamente: confirmación de utilidad, registro de interacción, derivación correcta o finalización sin bucles.

### Plantilla Mínima para Solicitar un Flujo

Antes de enviar un requerimiento al equipo técnico, el gestor de información debe entregar, como mínimo, los siguientes elementos:

- Objetivo del flujo.
- Lista de estados de la máquina de estados.
- Intenciones de entrada y de transición.
- Entidades necesarias y variables de contexto asociadas.
- Reglas e historias donde aplique.
- Respuestas predefinidas por cada estado.
- Fuentes de información con responsable y vigencia.
- Condición de cierre y criterio de validación.

### Criterios de Calidad para el Flujo

- El flujo debe poder leerse como una secuencia de estados, no como una lista suelta de temas.
- Cada transición debe estar justificada por una intención observable del usuario o por una condición interna del sistema.
- Toda respuesta debe estar conectada a una fuente de verdad verificable.
- Si el flujo usa entidades, debe quedar claro qué dato se captura, cómo se valida y qué pasa si el valor no aparece.
- Si el flujo mezcla reglas e historias, se debe indicar en qué punto termina la lógica determinística y comienza la secuencia conversacional.

## Control de Calidad y Diagnóstico Inicial

### Matriz de Diagnóstico y Resolución

| Incidencia Reportada (Síntoma) | Diagnóstico Operativo | Acción Correctiva Preventiva |
|---|---|---|
| *El sistema entrega información de admisiones al consultar por costos.* | **Colisión Probabilística.** Solapamiento léxico en la base de entrenamiento para las respectivas intenciones (ejemplos demasiado parecidos). | Incrementar la diferenciación en el conjunto de ejemplos, reportando frases específicas al área técnica. |
| *El sistema expone valores financieros de la vigencia anterior.* | **Fallo Determinístico.** Desactualización del registro estático en la fuente de verdad. | Ejecutar la modificación inmediata del valor en la tabla correspondiente de Oracle APEX. |
| *Devolución excesiva de la respuesta "No comprendo su consulta".* | **Déficit de Cobertura.** Empleo de terminología, derivaciones, jerga, o consultas no contempladas en el entrenamiento base. | Recopilar registros fallidos del historial transaccional, clasificarlos e indexarlos para futura carga de base de conocimiento. |

### Chequeo de Viabilidad de Datos

- [ ] **Síntesis:** La longitud de la respuesta se ciñe a parámetros de legibilidad en interfaces de mensajería instantánea (evitar bloques de texto monolíticos).
- [ ] **Saturación:** Se ha proporcionado un espectro amplio de consultas de entrada de muestra para cada intención.
- [ ] **Trazabilidad:** La información direcciona a recursos institucionales activos y autorizados.
- [ ] **Delimitación:** El nuevo flujo interfiere con directrices de flujos preexistentes de manera controlada.

## Consideraciones Funcionales y de Adopción

- **Impacto Operativo:** La gobernanza inicial sobre la base de conocimiento exige asimilación de protocolos de carga; no obstante, el rédito institucional es la mitigación sistémica (superior al 60%) del volumen de consultas repetitivas de primer nivel.

- **Responsabilidad sobre la Información:** La arquitectura del sistema es un mero vector de transmisión. Cualquier discrepancia o incorrección en la información suministrada por el asistente recae en el cumplimiento de los estándares de actualización de la base de datos de origen (Oracle APEX).

- **Modelos de Actualización:** No se requiere pericia en codificación para la mejora continua del sistema. El personal administrativo interviene aportando "ejemplos cualificados" y "respuestas verificadas". La compilación y re-entrenamiento del motor subyacente es responsabilidad exclusiva de los subsistemas tecnológicos.

## Glosario Técnico de Referencia

Para estandarizar la comunicación durante mesas de trabajo con los responsables de desarrollo, utilícese la siguiente nomenclatura:

- **Intención (Intent):** El requerimiento subyacente del usuario, independientemente de las palabras usadas (ej. _Consultar_Duracion_).
- **Entidad (Entity):** Variables precisas extraíbles de una consulta (ej. la identificación de una _Maestría Específica_ dentro de una oración estructurada).
- **Regla (Rule):** Definición determinística de comportamiento para casos repetibles y de baja ambigüedad (ej. ante una confirmación explícita, emitir una respuesta concreta y pasar al estado siguiente).
- **Historia (Story):** Ejemplo de secuencia conversacional usado para entrenar políticas de diálogo en escenarios con variaciones de ruta. La historia no es una respuesta aleatoria; define trayectorias posibles para que el modelo aprenda continuidad contextual.
- **Paracaídas (Fallback):** Mecanismo de contingencia que se activa cuando el índice de certidumbre (confidence score) en la clasificación probabilística no supera el umbral establecido (o sea, respuesta "No comprendo su consulta").
- **Flujo Conversacional:** La secuencia estructurada y lógica de interacciones diseñadas para informar y orientar una consulta, implementada mediante combinación de reglas, historias, estados, intenciones y entidades.
