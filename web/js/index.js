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
      "02_estados.formulario.json",
    ];

    configFiles.forEach(file => {
      const option = document.createElement('option');
      option.value = file;
      option.textContent = file;
      select.appendChild(option);
    });
  }

  setYear();
  setSelectTestFormularioOptions();
})();

function goToFormulario() {
  var value = document.querySelector('#select-test-formulario').value;
  if (value) {
    window.location.href = `html/formulario.html?config=${encodeURIComponent(value)}`;
  }
}
