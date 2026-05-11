import { slugify } from '../../utils/strings.js';
import {
  bySelector,
  setText,
  asHelp,
  normalizeRows,
  getColumnOptions
} from '../dom.js';

function createInputControl(field, sampleRow, optionsMap) {
  var type = field.type || "text";
  var dataColumn = field.dataColumn || "";
  var label = field.label || dataColumn || "Campo";
  var fieldId = field.id || slugify(dataColumn || label);
  var valueFromData = sampleRow && dataColumn ? sampleRow[dataColumn] : "";
  var value = typeof field.value === "string" ? field.value : (valueFromData || "");
  var help = asHelp(field.help, label);

  var group = document.createElement("div");
  group.className = "input-group";

  var labelNode = document.createElement("label");
  labelNode.setAttribute("for", fieldId);
  labelNode.textContent = label;
  group.appendChild(labelNode);

  var control;
  if (type === "textarea") {
    control = document.createElement("textarea");
    control.value = value;
  } else if (type === "select") {
    control = document.createElement("select");
    var options = Array.isArray(field.options) && field.options.length > 0
      ? field.options
      : (optionsMap[dataColumn] || []);

    options.forEach(function (optionValue) {
      var option = document.createElement("option");
      option.value = optionValue;
      option.textContent = optionValue;
      if (String(optionValue) === String(value)) {
        option.selected = true;
      }
      control.appendChild(option);
    });
  } else {
    control = document.createElement("input");
    control.type = type;
    control.value = value;
  }

  control.id = fieldId;
  control.setAttribute("data-help-title", help.title);
  control.setAttribute("data-help-type", help.type);
  control.setAttribute("data-help-copy", help.copy);
  control.setAttribute("data-help-note", help.note);

  if (field.placeholder) {
    control.setAttribute("placeholder", field.placeholder);
  }

  group.appendChild(control);
  return group;
}

export function renderForm(config, dataRows) {
  var formRowsContainer = bySelector("#form-rows");
  if (!formRowsContainer) {
    return;
  }

  formRowsContainer.innerHTML = "";

  var formConfig = config.formConfig || {};
  var rows = normalizeRows(formConfig.rows || []);
  var index = 0;
  var safeIndex = Number.isFinite(index) ? Math.max(0, Math.min(index, dataRows.length - 1)) : 0;
  var sampleRow = dataRows[safeIndex] || {};
  var allFields = [];

  rows.forEach(function (row) {
    (row.fields || []).forEach(function (field) {
      allFields.push(field);
    });
  });

  var optionsMap = getColumnOptions(dataRows, allFields);

  rows.forEach(function (row, rowIndex) {
    var rowNode = document.createElement("div");
    rowNode.className = "row";
    if (rowIndex === 0) {
      rowNode.style.marginTop = "10px";
    }

    row.fields.forEach(function (field) {
      rowNode.appendChild(createInputControl(field, sampleRow, optionsMap));
    });

    formRowsContainer.appendChild(rowNode);
  });

  setText("[data-form-title]", formConfig.title || "Formulario");
  setText("[data-form-helper]", formConfig.helper || "Completa la informacion solicitada.");

  var actions = formConfig.actions || {};
  setText("[data-form-new]", actions.newLabel || "Nuevo registro");
  setText("[data-form-save]", actions.saveLabel || "Guardar registro");
}
