import { bySelector } from '../dom.js';

var MODULE_CARDS = [
  {
    title: "2) Estados",
    helper: "Secuencia de estados, entradas, salidas y repreguntas.",
    config: "02_estados.formulario.json"
  },
  {
    title: "3) Intenciones",
    helper: "Intenciones con ejemplos de lenguaje real del usuario.",
    config: "03_intenciones.formulario.json"
  },
  {
    title: "4) Entidades y Slots",
    helper: "Entidades y datos que puede capturar el sistema.",
    config: "04_entidades_slots.formulario.json"
  },
  {
    title: "5) Respuestas",
    helper: "Mensajes que el sistema puede entregar al usuario.",
    config: "05_respuestas.formulario.json"
  },
  {
    title: "6) Reglas",
    helper: "Reglas que guían el comportamiento del flujo.",
    config: "06_reglas.formulario.json"
  },
  {
    title: "7) Historias",
    helper: "Ejemplos de recorridos conversacionales completos.",
    config: "07_historias.formulario.json"
  },
  {
    title: "8) Fuentes de Información",
    helper: "Origen de los datos y plan de contingencia.",
    config: "08_fuentes_datos.formulario.json"
  },
];

function buildModuleHref(configFile, flowId) {
  return "./formulario.html?config=" + encodeURIComponent(configFile)
      + "&flujo=" + encodeURIComponent(flowId);
}

function createModuleCard(item, flowId) {
  var card = document.createElement("article");
  card.className = "card";

  var heading = document.createElement("h3");
  heading.textContent = item.title;
  card.appendChild(heading);

  var helper = document.createElement("p");
  helper.className = "helper";
  helper.textContent = item.helper;
  card.appendChild(helper);

  var row = document.createElement("div");
  row.className = "row";
  row.style.justifyContent = "space-between";
  row.style.marginTop = "8px";

  var badge = document.createElement("span");
  badge.className = "pill info";
  badge.textContent = "Módulo";
  row.appendChild(badge);

  var link = document.createElement("a");
  link.className = "btn btn-primary";
  link.textContent = "Abrir módulo";
  link.href = buildModuleHref(item.config, flowId);
  row.appendChild(link);

  card.appendChild(row);
  return card;
}

export function renderCarousel(config, flowId) {
  var section = bySelector("[data-view1-carousel]");
  var container = bySelector("[data-view1-carousel-items]");

  if (!section || !container) {
    return;
  }

  var dataPath = String((config && config.dataPath) || "").trim();
  section.hidden = false;
  container.innerHTML = "";
  MODULE_CARDS.forEach(function (item) {
    container.appendChild(createModuleCard(item, flowId));
  });
}
