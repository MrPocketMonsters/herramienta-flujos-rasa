import { parseCsv, toObjects, toCsv } from '../utils/csv.js';
import { getConfigPath, getFlowId, loadText, loadDataText } from './loaders.js';
import { saveDataText } from './savers.js';
import { renderForm, renderTable, renderNavigation, setPageInfo, wireContextPanel, setYear, showError, loadFormByIndex } from './render/render.js';
import { filterRowsByFlow, resolveFieldOptions } from './options.js';

// Plantilla dinamica para renderizar formularios configurables desde JSON + CSV.
(function () {
  var currentGlobalIndex = null;
  var config = null;
  var configUrl = null;
  var dataPath = null;
  var flowId = null;
  var dataRows = [];
  var descRow = {};
  var headers = [];
  var flowEntries = [];
  var visibleRows = [];
  var fieldOptions = {};

  async function bootstrap() {
    try {
      setYear();

      var configPath = getConfigPath();
      flowId = getFlowId();
      configUrl = new URL(configPath, window.location.href);
      var configText = await loadText(configUrl.href);
      if (!(configText && configText.startsWith("{"))) {
        throw new Error(`El archivo de configuracion ${configUrl.href} no es un JSON valido.`);
      }
      config = JSON.parse(configText);

      dataPath = config.dataPath;
      if (!dataPath) {
        throw new Error("La configuracion no incluye dataPath.");
      }

      await reloadState(null);
      renderNavigation(config);
      wireContextPanel();
    } catch (error) {
      showError(error && error.message ? error.message : "Error desconocido al cargar el modulo.");
      console.error(error);
    }
  }

  async function reloadState(selectedGlobalIndex) {
    var csvText = await loadDataText(dataPath, configUrl.href);
    var parsed = toObjects(parseCsv(csvText));
    dataRows = parsed[0] || [];
    descRow = dataRows.shift() || {};
    headers = parsed[1] || [];

    flowEntries = filterRowsByFlow(dataRows, flowId, { strict: false });
    visibleRows = flowEntries.map(function (entry) {
      return entry.row;
    });

    fieldOptions = await resolveFieldOptions(config, dataRows, configUrl.href, flowId);

    renderForm(config, fieldOptions, saveRow);
    renderTable(config, visibleRows, loadRow, saveRow);

    if (Number.isFinite(selectedGlobalIndex)) {
      currentGlobalIndex = selectedGlobalIndex;
      loadFormByIndex(config, dataRows, selectedGlobalIndex, saveRow);
    } else {
      currentGlobalIndex = null;
    }
  }

  function loadRow(index) {
    var selectedEntry = flowEntries[index] || { globalIndex: index };
    currentGlobalIndex = selectedEntry.globalIndex;
    loadFormByIndex(config, dataRows, selectedEntry.globalIndex, saveRow);
  }

  async function saveRow(index, formData) {
    if (flowId)
      formData.flujo_id = flowId;

    if (index === Number.POSITIVE_INFINITY) {
      dataRows.push(formData);
      currentGlobalIndex = dataRows.length - 1;
    } else if (Number.isFinite(index)) {
      dataRows[index] = formData;
      currentGlobalIndex = index;
    }

    dataRows.unshift(descRow);
    await saveDataText(dataPath, toCsv(dataRows, headers));
    await reloadState(currentGlobalIndex);
  }

  bootstrap();
})();

function navigateTo(href) {
  if (href && href.length > 0 && href !== "#") {
    window.location.href = href;
  }
}

window.navigateTo = navigateTo;
