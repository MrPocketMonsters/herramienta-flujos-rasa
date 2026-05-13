import { bySelector, setText } from '../dom.js';
import { renderTimeline } from './context.js';
import { createAlert } from '../components/alert.js';

export function setPageInfo(config) {
  var page = config.page || {};
  var context = config.contextConfig || {};

  setText("[data-page-badge]", page.badge || "F");
  setText("[data-page-title]", page.title || "Formulario de modulo");
  setText("[data-page-subtitle]", page.subtitle || "Plantilla reutilizable para formularios de flujo.");

  var rail = bySelector("[data-context-rail]");
  if (rail) {
    rail.setAttribute("data-default-title", context.defaultTitle || "Ayuda contextual");
    rail.setAttribute("data-default-copy", context.defaultCopy || "Enfoca un campo para ver una sugerencia breve y precisa.");
    rail.setAttribute("data-default-note", context.defaultNote || "La ayuda cambia mientras el usuario navega entre los campos.");
    rail.setAttribute("data-default-type", context.defaultType || "Campo descriptivo");
  }

  setText("[data-context-eyebrow]", context.eyebrow || "Ayuda contextual");
  renderTimeline(context.summary || []);
}

export function setYear() {
  var node = bySelector("[data-year]");
  if (node) {
    node.textContent = String(new Date().getFullYear());
  }
}

export function showError(message, title) {
  const alert = createAlert(
    title || "No fue posible cargar el modulo",
    "error",
    message || "Revisa la ruta de configuracion e intenta nuevamente."
  );
  document.body.appendChild(alert);
}

export function showSuccess(message, title) {
  const alert = createAlert(
    title || "Operación exitosa",
    "success",
    message || "La operación se completó con éxito."
  );
  document.body.appendChild(alert);
}
