(function() {
  function setYear() {
    var yearNode = document.querySelector('[data-year]');
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  }

  function setSelectTestFormularioOptions() {
    var select = document.querySelector('#select-test-formulario');
    if (!select) return;

    var configFiles = [
      "01_resumen_flujo.formulario.json",
      "02_estados.formulario.json",
      "03_intenciones.formulario.json",
      "04_entidades_slots.formulario.json",
      "05_respuestas.formulario.json",
      "06_reglas.formulario.json",
      "07_historias.formulario.json",
      "08_fuentes_datos.formulario.json",
    ];

    select.innerHTML = '';

    configFiles.forEach(function (file) {
      var option = document.createElement('option');
      option.value = file;
      option.textContent = file;
      select.appendChild(option);
    });

    if (!select.value && configFiles.length > 0) {
      select.value = configFiles[0];
    }
  }

  function setSelectTestFlujoOptions() {
    var select = document.querySelector('#select-test-flujo');
    if (!select) return;

    var flowIds = [
      "vinculacion_especial_docentes",
      "",
    ];

    select.innerHTML = '';

    flowIds.forEach(function (flowId) {
      var option = document.createElement('option');
      option.value = flowId;
      option.textContent = flowId || "Todos los flujos";
      select.appendChild(option);
    });

    if (!select.value) {
      select.value = "";
    }
  }

  setYear();
  setSelectTestFormularioOptions();
  setSelectTestFlujoOptions();
})();

function goToFormulario() {
  var value = document.querySelector('#select-test-formulario').value;
  var flujo = document.querySelector('#select-test-flujo').value;
  if (value) {
    var href = `html/formulario.html?config=${encodeURIComponent(value)}`;
    if (flujo) {
      href += `&flujo=${encodeURIComponent(flujo)}`;
    }
    window.location.href = href;
  }
}
