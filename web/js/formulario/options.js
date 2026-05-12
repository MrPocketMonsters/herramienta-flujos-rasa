import { parseCsv, toObjects } from '../utils/csv.js';
import { slugify } from '../utils/strings.js';
import { normalizeRows } from './dom.js';
import { loadDataText } from './loaders.js';

function getFieldKey(field) {
  var dataColumn = field.dataColumn || "";
  var label = field.label || dataColumn || "campo";
  return field.id || slugify(dataColumn || label);
}

function uniquePush(target, value) {
  var normalized = String(value || "").trim();
  if (!normalized) {
    return;
  }

  if (target.indexOf(normalized) === -1) {
    target.push(normalized);
  }
}

function getOptionDefinition(field) {
  var definition = field.options || {};
  return definition && typeof definition === "object" && !Array.isArray(definition) ? definition : null;
}

async function loadDynamicRows(dataPath, configBaseUrl, mainDataPath, mainDataRows, csvCache) {
  var normalizedDataPath = String(dataPath || "").trim();
  if (!normalizedDataPath) {
    throw new Error("Una definición dinámica de opciones no incluye dataPath.");
  }

  if (String(normalizedDataPath) === String(mainDataPath || "")) {
    return mainDataRows;
  }

  if (csvCache[normalizedDataPath]) {
    return csvCache[normalizedDataPath];
  }

  var csvText = await loadDataText(normalizedDataPath, configBaseUrl);
  var rows = toObjects(parseCsv(csvText));
  csvCache[normalizedDataPath] = rows;
  return rows;
}

export async function resolveFieldOptions(config, mainDataRows, configBaseUrl) {
  var formConfig = config.formConfig || {};
  var rows = normalizeRows(formConfig.rows || []);
  var csvCache = {};
  var optionMap = {};

  for (var i = 0; i < rows.length; i += 1) {
    var row = rows[i];
    var fields = row.fields || [];

    for (var j = 0; j < fields.length; j += 1) {
      var field = fields[j];
      if ((field.type || "text") !== "select") {
        continue;
      }

      var definition = getOptionDefinition(field);
      var staticValues = definition && Array.isArray(definition.staticValues) ? definition.staticValues : [];
      var dynamicValues = definition && Array.isArray(definition.dynamicValues) ? definition.dynamicValues : [];
      var allowCustom = Boolean(definition && definition.allowCustom);

      if (!staticValues.length && !dynamicValues.length && !allowCustom) {
        throw new Error("El campo '" + (field.label || field.dataColumn || getFieldKey(field)) + "' no define staticValues, dynamicValues ni allowCustom.");
      }

      var resolvedOptions = [];
      staticValues.forEach(function (value) {
        uniquePush(resolvedOptions, value);
      });

      for (var k = 0; k < dynamicValues.length; k += 1) {
        var source = dynamicValues[k] || {};
        var sourceRows = await loadDynamicRows(source.dataPath, configBaseUrl, config.dataPath, mainDataRows, csvCache);
        var valueColumn = source.valueColumn || "";

        if (!valueColumn) {
          throw new Error("La definición dinámica de opciones para '" + (field.label || field.dataColumn || getFieldKey(field)) + "' no incluye valueColumn.");
        }

        sourceRows.forEach(function (rowItem) {
          uniquePush(resolvedOptions, rowItem[valueColumn]);
        });
      }

      optionMap[getFieldKey(field)] = {
        allowCustom: allowCustom,
        options: resolvedOptions
      };
    }
  }

  return optionMap;
}
