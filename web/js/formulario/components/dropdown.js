export function createDropdown(fieldId, selectOptions, allowCustom, initialValue) {
  var combo = document.createElement("div");
  combo.className = "custom-combo";

  var input = document.createElement("input");
  input.type = "text";
  input.id = fieldId;
  input.value = typeof initialValue === "string" ? initialValue : "";
  input.setAttribute("autocomplete", "off");
  if (!allowCustom) {
    input.setAttribute("readonly", "");
  }

  // single visual element: caret inside the combo (keeps visual parity)
  var toggleButton = document.createElement("span");
  toggleButton.className = "custom-combo-toggle";
  toggleButton.setAttribute("aria-hidden", "true");
  toggleButton.textContent = "▾";

  var menu = document.createElement("div");
  menu.className = "custom-combo-menu";
  menu.hidden = true;
  // detach menu to body to avoid overflow/stacking issues
  menu.style.position = "absolute";
  menu.style.zIndex = 9999;

  function buildEmpty() {
    var emptyState = document.createElement("div");
    emptyState.className = "custom-combo-empty";
    emptyState.textContent = "Sin opciones disponibles";
    menu.appendChild(emptyState);
  }

  if (!Array.isArray(selectOptions) || selectOptions.length === 0) {
    buildEmpty();
  } else {
    selectOptions.forEach(function (optionValue) {
      var optionButton = document.createElement("button");
      optionButton.type = "button";
      optionButton.className = "custom-combo-option";
      optionButton.textContent = optionValue;
      optionButton.addEventListener("click", function () {
        input.value = optionValue;
        hideMenu();
        input.focus();
      });
      menu.appendChild(optionButton);
    });
  }

  function positionMenu() {
    var rect = combo.getBoundingClientRect();
    // getBoundingClientRect is relative to the viewport; when menu is appended to body
    // we must add the current scroll offsets to position it relative to the document
    var scrollX = window.scrollX || window.pageXOffset || 0;
    var scrollY = window.scrollY || window.pageYOffset || 0;
    menu.style.left = (rect.left + scrollX) + "px";
    menu.style.top = (rect.bottom + scrollY + 6) + "px";
    // ensure menu width matches combo
    menu.style.width = rect.width + "px";
  }

  function showMenu() {
    if (!document.body.contains(menu)) document.body.appendChild(menu);
    positionMenu();
    menu.hidden = false;
    // keep focus on the input so the field retains the same focus glow as native controls
    input.focus();
    window.addEventListener("resize", positionMenu);
    window.addEventListener("scroll", positionMenu, true);
  }

  function hideMenu() {
    menu.hidden = true;
    // keep menu in DOM but hidden; remove listeners
    window.removeEventListener("resize", positionMenu);
    window.removeEventListener("scroll", positionMenu, true);
  }

  // Open menu when interacting with the input/box (not only icon)
  input.addEventListener("focus", function () {
    showMenu();
  });

  input.addEventListener("click", function (e) {
    e.stopPropagation();
    if (menu.hidden) showMenu();
  });

  // open on ArrowDown for keyboard users
  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      showMenu();
    }
  });

  // Close menu when clicking outside or on Escape
  function onDocClick(e) {
    if (!combo.contains(e.target) && !menu.contains(e.target)) {
      hideMenu();
    }
  }

  // Use pointerdown in capture phase to avoid other handlers stopping propagation
  function onDocPointerDown(e) {
    if (!combo.contains(e.target) && !menu.contains(e.target)) {
      hideMenu();
    }
  }

  function onKeyDown(e) {
    if (e.key === "Escape") {
      hideMenu();
    }
  }

  document.addEventListener("click", onDocClick);
  document.addEventListener("keydown", onKeyDown);

  // capture pointerdown to reliably detect outside interactions
  document.addEventListener("pointerdown", onDocPointerDown, true);

  // hide menu when focus leaves both the combo and the menu
  combo.addEventListener("focusout", function (e) {
    var rt = e.relatedTarget;
    if (!rt || (!combo.contains(rt) && !menu.contains(rt))) {
      hideMenu();
    }
  });

  // expose a destroy method for cleanup if needed in the future
  combo._destroy = function () {
    document.removeEventListener("click", onDocClick);
    document.removeEventListener("keydown", onKeyDown);
    window.removeEventListener("resize", positionMenu);
    window.removeEventListener("scroll", positionMenu, true);
    document.removeEventListener("pointerdown", onDocPointerDown, true);
    if (document.body.contains(menu)) document.body.removeChild(menu);
  };

  // append input and caret inside the same element so it appears as a single control
  combo.appendChild(input);
  combo.appendChild(toggleButton);
  // menu is appended to body when shown to avoid clipping

  // ensure the menu can receive focus events for focusout handling
  menu.setAttribute('tabindex', '-1');

  // hide when focus leaves the menu itself
  menu.addEventListener('focusout', function (e) {
    var rt = e.relatedTarget;
    if (!rt || (!combo.contains(rt) && !menu.contains(rt))) {
      hideMenu();
    }
  });

  // keep clicks inside the menu from stealing focus from the input
  menu.addEventListener("mousedown", function (e) {
    e.preventDefault();
  });

  return combo;
}

export default createDropdown;
