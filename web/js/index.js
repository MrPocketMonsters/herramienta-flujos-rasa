(function() {
  function setYear() {
    var yearNode = document.querySelector('[data-year]');
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  }

  setYear();
})();

function goToFormulario() {
  var textInput = document.querySelector('#text-test-formulario');
  if (textInput) {
    window.location.href = `html/formulario.html?${encodeURIComponent(textInput.value)}`;
  }
}
