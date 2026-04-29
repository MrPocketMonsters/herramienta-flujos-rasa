// Archivo de maquetas: solo microinteracciones visuales sin persistencia ni reglas reales.
(function () {
  function showToast(message) {
    var oldToast = document.querySelector('.toast');
    if (oldToast) {
      oldToast.remove();
    }

    var toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    window.setTimeout(function () {
      toast.remove();
    }, 2600);
  }

  function wireDemoActions() {
    var actionButtons = document.querySelectorAll('[data-demo-action]');
    actionButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var action = button.getAttribute('data-demo-action') || 'accion';
        showToast('Accion de ejemplo: ' + action);
      });
    });
  }

  function wireContextPanels() {
    var sources = document.querySelectorAll('[data-context-source]');

    sources.forEach(function (source) {
      var rail = source.parentElement ? source.parentElement.querySelector('[data-context-rail]') : null;
      if (!rail) {
        return;
      }

      var titleNode = rail.querySelector('[data-context-title]');
      var typeNode = rail.querySelector('[data-context-type]');
      var copyNode = rail.querySelector('[data-context-copy]');
      var noteNode = rail.querySelector('[data-context-note]');

      var defaultTitle = rail.getAttribute('data-default-title') || 'Ayuda contextual';
      var defaultCopy = rail.getAttribute('data-default-copy') || 'Enfoca un campo para ver una sugerencia breve y precisa.';
      var defaultNote = rail.getAttribute('data-default-note') || 'La ayuda cambia mientras el usuario escribe o navega entre campos.';

      function render(field) {
        if (!field) {
          if (titleNode) {
            titleNode.textContent = defaultTitle;
          }
          if (copyNode) {
            copyNode.textContent = defaultCopy;
          }
          if (typeNode) {
            typeNode.textContent = rail.getAttribute('data-default-type') || 'Campo descriptivo';
          }
          if (noteNode) {
            noteNode.textContent = defaultNote;
          }
          source.querySelectorAll('.field-active').forEach(function (activeField) {
            activeField.classList.remove('field-active');
          });
          return;
        }

        if (titleNode) {
          var fallbackTitle = 'Campo activo';
          if (field.labels && field.labels[0]) {
            fallbackTitle = field.labels[0].textContent;
          }
          titleNode.textContent = field.getAttribute('data-help-title') || fallbackTitle;
        }
        if (copyNode) {
          copyNode.textContent = field.getAttribute('data-help-copy') || defaultCopy;
        }
        if (typeNode) {
          typeNode.textContent = field.getAttribute('data-help-type') || 'Campo descriptivo';
        }
        if (noteNode) {
          noteNode.textContent = field.getAttribute('data-help-note') || defaultNote;
        }

        source.querySelectorAll('.field-active').forEach(function (activeField) {
          activeField.classList.remove('field-active');
        });
        field.classList.add('field-active');
      }

      source.addEventListener('focusin', function (event) {
        var target = event.target;
        if (target && target.matches('[data-help-title]')) {
          render(target);
        }
      });

      source.addEventListener('input', function (event) {
        var target = event.target;
        if (target && target.matches('[data-help-title]')) {
          render(target);
        }
      });

      source.addEventListener('change', function (event) {
        var target = event.target;
        if (target && target.matches('[data-help-title]')) {
          render(target);
        }
      });

      source.addEventListener('focusout', function () {
        window.setTimeout(function () {
          if (!source.contains(document.activeElement)) {
            render(null);
          }
        }, 0);
      });

      var firstField = source.querySelector('[data-help-title]');
      if (firstField) {
        render(firstField);
      } else {
        render(null);
      }
    });
  }

  function wireTogglePanels() {
    var toggles = document.querySelectorAll('[data-toggle-target]');
    toggles.forEach(function (button) {
      button.addEventListener('click', function () {
        var targetId = button.getAttribute('data-toggle-target');
        var panel = document.getElementById(targetId);
        if (!panel) {
          return;
        }

        var hidden = panel.hasAttribute('hidden');
        if (hidden) {
          panel.removeAttribute('hidden');
          button.textContent = 'Ocultar vista';
        } else {
          panel.setAttribute('hidden', 'hidden');
          button.textContent = 'Mostrar vista';
        }
      });
    });
  }

  function setYear() {
    var yearNode = document.querySelector('[data-year]');
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  }

  wireDemoActions();
  wireTogglePanels();
  wireContextPanels();
  setYear();
})();
