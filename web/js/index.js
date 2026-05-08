(function() {
  function setYear() {
    var yearNode = document.querySelector('[data-year]');
    if (yearNode) {
      yearNode.textContent = String(new Date().getFullYear());
    }
  }

  setYear();
})();
