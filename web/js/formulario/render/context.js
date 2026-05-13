import { bySelector } from '../dom.js';

export function renderTimeline(summaryItems) {
  var summaryNode = bySelector("[data-context-summary]");
  if (!summaryNode) {
    return;
  }

  summaryNode.innerHTML = "";

  (summaryItems || []).forEach(function (item, idx) {
    var li = document.createElement("li");

    var marker = document.createElement("span");
    marker.className = "timeline-marker";
    marker.textContent = String(idx + 1);

    var content = document.createElement("div");
    content.textContent = item;

    li.appendChild(marker);
    li.appendChild(content);
    summaryNode.appendChild(li);
  });
}

export function wireContextPanel() {
  var source = bySelector("[data-context-source]");
  var rail = bySelector("[data-context-rail]");
  if (!source || !rail) {
    return;
  }

  var titleNode = bySelector("[data-context-title]");
  var typeNode = bySelector("[data-context-type]");
  var copyNode = bySelector("[data-context-copy]");
  var noteNode = bySelector("[data-context-note]");

  var defaultTitle = rail.getAttribute("data-default-title") || "Ayuda contextual";
  var defaultCopy = rail.getAttribute("data-default-copy") || "Enfoca un campo para ver sugerencias.";
  var defaultNote = rail.getAttribute("data-default-note") || "La ayuda cambia mientras navegas.";
  var defaultType = rail.getAttribute("data-default-type") || "Campo descriptivo";

  function render(field) {
    if (!field) {
      if (titleNode) {
        titleNode.textContent = defaultTitle;
      }
      if (typeNode) {
        typeNode.textContent = defaultType;
      }
      if (copyNode) {
        copyNode.textContent = defaultCopy;
      }
      if (noteNode) {
        noteNode.textContent = defaultNote;
      }
      source.querySelectorAll(".field-active").forEach(function (active) {
        active.classList.remove("field-active");
      });
      return;
    }

    if (titleNode) {
      titleNode.textContent = field.getAttribute("data-help-title") || defaultTitle;
    }
    if (typeNode) {
      typeNode.textContent = field.getAttribute("data-help-type") || defaultType;
    }
    if (copyNode) {
      copyNode.textContent = field.getAttribute("data-help-copy") || defaultCopy;
    }
    if (noteNode) {
      noteNode.textContent = field.getAttribute("data-help-note") || defaultNote;
    }

    source.querySelectorAll(".field-active").forEach(function (active) {
      active.classList.remove("field-active");
    });
    field.classList.add("field-active");
  }

  source.addEventListener("focusin", function (event) {
    if (event.target && event.target.matches("[data-help-title]")) {
      render(event.target);
    }
  });

  source.addEventListener("input", function (event) {
    if (event.target && event.target.matches("[data-help-title]")) {
      render(event.target);
    }
  });

  source.addEventListener("change", function (event) {
    if (event.target && event.target.matches("[data-help-title]")) {
      render(event.target);
    }
  });

  source.addEventListener("focusout", function () {
    window.setTimeout(function () {
      if (!source.contains(document.activeElement)) {
        render(null);
      }
    }, 0);
  });

  var firstField = source.querySelector("[data-help-title]");
  render(firstField || null);
}
