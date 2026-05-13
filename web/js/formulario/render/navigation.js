import { capitalize } from '../../utils/strings.js';
import { bySelector } from '../dom.js';

export function resolveRoute(config, routeKey, direction) {
  var routes = config.routes || {};

  if (typeof routeKey === "object" && routeKey !== null) {
    return {
      label: routeKey.label || (direction === "prev" ? "Anterior" : "Siguiente"),
      href: routeKey.href || "#"
    };
  }

  if (typeof routeKey === "string" && routeKey.length > 0) {
    if (routes[routeKey]) {
      return {
        label: routes[routeKey].label || (direction === "prev" ? "Anterior" : "Siguiente"),
        href: routes[routeKey].href || "#"
      };
    }

    return {
      label: (direction === "prev" ? "Anterior: " : "Siguiente: ") + capitalize(routeKey),
      href: "#"
    };
  }

  return {
    label: direction === "prev" ? "Anterior" : "Siguiente",
    href: "#"
  };
}

export function renderNavigation(config) {
  var prev = resolveRoute(config, config.prev, "prev");
  var next = resolveRoute(config, config.next, "next");

  var prevNode = bySelector("[data-nav-prev]");
  var nextNode = bySelector("[data-nav-next]");

  if (prevNode) {
    prevNode.textContent = prev.label;
    prevNode.setAttribute("data-href", prev.href);
  }

  if (nextNode) {
    nextNode.textContent = next.label;
    nextNode.setAttribute("data-href", next.href);
  }
}
