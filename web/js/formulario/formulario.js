import { parseCsv, toObjects } from '../utils/csv.js';
import { getConfigPath, loadText, loadDataText } from './loaders.js';
import { renderForm, renderTable, renderNavigation, setPageInfo, wireContextPanel, setYear, showError } from './render/render.js';

// Plantilla dinamica para renderizar formularios configurables desde JSON + CSV.
(function () {
  async function bootstrap() {
    try {
      setYear();

      var configPath = getConfigPath();
      var configUrl = new URL(configPath, window.location.href);
      var configText = await loadText(configUrl.href);
      if (!(configText?.startsWith("{"))) {
        throw new Error(`El archivo de configuracion ${configUrl.href} no es un JSON valido.`);
      }
      var config = JSON.parse(configText);

      var dataPath = config.dataPath;
      if (!dataPath) {
        throw new Error("La configuracion no incluye dataPath.");
      }

      var csvText = await loadDataText(dataPath, configUrl.href);
      var dataRows = toObjects(parseCsv(csvText));

      setPageInfo(config);
      renderForm(config, dataRows);
      renderTable(config, dataRows);
      renderNavigation(config);
      wireContextPanel();
    } catch (error) {
      showError(error && error.message ? error.message : "Error desconocido al cargar el modulo.");
      console.error(error);
    }
  }

  bootstrap();
})();

function navigateTo(href) {
  if (href && href.length > 0 && href !== "#") {
    window.location.href = href;
  }
}

window.navigateTo = navigateTo;
