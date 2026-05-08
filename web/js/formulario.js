// Plantilla dinamica para renderizar formularios configurables desde JSON + CSV.
(function() {
  function setYear() {
    var node = document.querySelector('[data-year]');
    if (node) {
      node.textContent = String(new Date().getFullYear());
    }
  }

  function setFormHelper() {
    var node = document.querySelector('[data-form-helper]');
    if (node) {
      node.textContent = "Vienes desde la URL: " + window.location.href;
    }
  }

  setYear();
  setFormHelper();
})();
