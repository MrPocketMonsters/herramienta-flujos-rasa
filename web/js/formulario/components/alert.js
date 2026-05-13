/**
 * Crea un componente de alerta con título, tipo y mensaje.
 * @param {string} title - Título de la alerta
 * @param {string} type - Tipo de alerta: 'success', 'error', 'info'
 * @param {string} message - Mensaje de la alerta
 * @returns {HTMLElement} Elemento de alerta
 */
export function createAlert(title, type, message) {
  // Crear el overlay/backdrop
  const backdrop = document.createElement("div");
  backdrop.className = "alert-backdrop";

  const section = document.createElement("section");
  section.className = "card alert-container";
  section.setAttribute("role", "alert");
  section.setAttribute("aria-live", "polite");

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "alert-close";
  closeButton.setAttribute("aria-label", "Cerrar alerta");
  closeButton.innerHTML = "×";
  
  function closeAlert() {
    section.remove();
    backdrop.remove();
  }
  
  closeButton.addEventListener("click", closeAlert);
  backdrop.addEventListener("click", closeAlert);

  const headerDiv = document.createElement("div");
  headerDiv.className = "alert-header";

  const iconSpan = document.createElement("span");
  iconSpan.className = "alert-icon";
  iconSpan.setAttribute("aria-hidden", "true");

  // Iconos según el tipo de alerta
  const icons = {
    success: "✓",
    error: "✕",
    info: "ⓘ"
  };

  iconSpan.textContent = icons[type] || "•";
  iconSpan.setAttribute("data-alert-type", type);

  const titleElement = document.createElement("h2");
  titleElement.className = "alert-title";
  titleElement.textContent = title;

  headerDiv.appendChild(iconSpan);
  headerDiv.appendChild(titleElement);
  headerDiv.appendChild(closeButton);

  const messageElement = document.createElement("p");
  messageElement.className = "alert-message";
  messageElement.textContent = message;

  section.appendChild(headerDiv);
  section.appendChild(messageElement);
  section.setAttribute("data-alert-type", type);

  document.body.appendChild(backdrop);
  document.body.appendChild(section);

  return section;
}
