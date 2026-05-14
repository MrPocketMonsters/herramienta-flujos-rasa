import { parseCsv, toObjects, toCsv } from '../utils/csv.js';
import { getConfigPath, getFlowId, loadText, loadDataText } from './loaders.js';
import { saveDataText } from './savers.js';
import {
  renderForm,
  renderTable,
  renderNavigation,
  setPageInfo,
  wireContextPanel,
  setYear,
  showError,
  showSuccess,
  loadFormByIndex
} from './render/render.js';
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

      setPageInfo(config);
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

    if (!validate(formData, index))
      return;

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
    showSuccess("Los datos se han guardado correctamente.", "Guardado exitoso");
  }

  function validate(formData, index) {
    for (var key in formData)
      if (!validateColumn(key, index, formData[key]))
        return false;

    return true;
  }

  function validateColumn(dataColumn, index, newValue) {
    try {
      checkUnique(dataColumn, index, newValue);
      checkRegex(dataColumn, newValue);
      checkLimits(dataColumn, newValue);
      return true;
    } catch (error) {
      showError(error && error.message ? error.message : "Error desconocido al validar el campo.");
      console.error(error);
      return false;
    }
  }

  function findFieldConfig(dataColumn, configParam) {
    return config.formConfig.rows.reduce((acc, row) =>
          acc.concat(row.fields || []),
          []
        )
        .find((f) => f.dataColumn === dataColumn && f[configParam]);
  }

  function checkLimits(dataColumn, newValue) {
    var field = findFieldConfig(dataColumn, "limits");
    if (!field)
      return;

    var limits = field.limits || {};

    var min = parseFloat(limits.min) || Number.NEGATIVE_INFINITY;
    if (min !== null && isNaN(min))
      throw new Error(`El valor '${min}' para el límite mínimo del campo '${field.label}' no es un número válido.`);

    var max = parseFloat(limits.max) || Number.POSITIVE_INFINITY;
    if (max !== null && isNaN(max))
      throw new Error(`El valor '${max}' para el límite máximo del campo '${field.label}' no es un número válido.`);

    var numericValue = parseFloat(newValue);
    if (isNaN(numericValue))
      throw new Error(`El valor '${newValue}' para el campo '${field.label}' no es un número válido.`);

    if (min !== null && numericValue < min)
      throw new Error(`El valor '${newValue}' para el campo '${field.label}' es menor al mínimo permitido (${min}).`);

    if (max !== null && numericValue > max)
      throw new Error(`El valor '${newValue}' para el campo '${field.label}' es mayor al máximo permitido (${max}).`);
  }

  function checkRegex(dataColumn, newValue) {
    var field = findFieldConfig(dataColumn, "regex");
    if (!field)
      return;

    var regexPattern = field.regex;
    var regex = new RegExp(regexPattern);
    if (!regex.test(newValue)) {
      throw new Error(`El valor '${newValue}' para el campo '${field.label}' no cumple con el formato requerido.`);
    }
  }

  function checkUnique(dataColumn, index, newValue) {
    var field = findFieldConfig(dataColumn, "unique");
    if (!field)
      return;

    var rows = flowId ? dataRows.filter((row) => row.flujo_id === flowId) : dataRows;
    const isValueDuplicate = rows
        .filter((row) => row[dataColumn])
        .map((row) => String(row[dataColumn]))
        .some((value, idx) =>
          value === String(newValue) && idx !== index
        );

    if (isValueDuplicate)
      throw new Error(
        `El valor '${newValue}' para el campo '${field.label}' no es único. Por favor, ingresa un valor diferente.`
      );
  }

  bootstrap();
})();

function navigateTo(href) {
  if (href && href.length > 0 && href !== "#") {
    window.location.href = href;
  }
}

window.navigateTo = navigateTo;
