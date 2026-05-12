import { slugify } from '../../utils/strings.js';
import {
  bySelector,
  setText,
  asHelp,
  normalizeRows
} from '../dom.js';
import { createDropdown } from '../components/dropdown.js';

function createInputControl(field, value, fieldOptions) {
  var type = field.type || "text";
  var dataColumn = field.dataColumn || "";
  var label = field.label || dataColumn || "Campo";
  var fieldId = field.id || slugify(dataColumn || label);
  var initialValue = typeof field.value === "string" ? field.value : "";
  var controlValue = typeof value === "string" ? value : initialValue;
  var help = asHelp(field.help, label);

  var group = document.createElement("div");
  group.className = "input-group";

  var labelNode = document.createElement("label");
  labelNode.setAttribute("for", fieldId);
  labelNode.textContent = label;
  group.appendChild(labelNode);

  var control;
  var appendControlAtEnd = true;
  if (type === "textarea") {
    control = document.createElement("textarea");
    control.value = controlValue;
  } else if (type === "select") {
    var selectOptions = fieldOptions && Array.isArray(fieldOptions.options) ? fieldOptions.options : [];
    var allowCustom = Boolean(fieldOptions && fieldOptions.allowCustom);

    // Use reusable dropdown component for both editable and non-editable selects
    var comboElement = createDropdown(fieldId, selectOptions, allowCustom, controlValue);
    group.appendChild(comboElement);
    appendControlAtEnd = false;
    // get the internal input so we can attach meta attributes below
    control = group.querySelector("#" + fieldId);
  } else {
    control = document.createElement("input");
    control.type = type;
    control.value = controlValue;
  }

  control.id = fieldId;
  control.setAttribute("data-help-title", help.title);
  control.setAttribute("data-help-type", help.type);
  control.setAttribute("data-help-copy", help.copy);
  control.setAttribute("data-help-note", help.note);

  if (field.placeholder) {
    control.setAttribute("placeholder", field.placeholder);
  }

  if (appendControlAtEnd) {
    group.appendChild(control);
  }
  return group;
}

export function renderForm(config, fieldOptionsMap) {
  var formRowsContainer = bySelector("#form-rows");
  if (!formRowsContainer) {
    return;
  }

  formRowsContainer.innerHTML = "";

  var formConfig = config.formConfig || {};
  var rows = normalizeRows(formConfig.rows || []);

  rows.forEach(function (row, rowIndex) {
    var rowNode = document.createElement("div");
    rowNode.className = "row";
    if (rowIndex === 0) {
      rowNode.style.marginTop = "10px";
    }

    row.fields.forEach(function (field) {
      var fieldId = field.id || slugify(field.dataColumn || field.label || "campo");
      var fieldOptions = fieldOptionsMap && fieldOptionsMap[fieldId] ? fieldOptionsMap[fieldId] : { options: [] };
      rowNode.appendChild(createInputControl(field, "", fieldOptions));
    });

    formRowsContainer.appendChild(rowNode);
  });

  setText("[data-form-title]", formConfig.title || "Formulario");
  setText("[data-form-helper]", formConfig.helper || "Completa la informacion solicitada.");

  var actions = formConfig.actions || {};
  setText("[data-form-new]", actions.newLabel || "Nuevo registro");
  setText("[data-form-save]", actions.saveLabel || "Guardar registro");
}

export function loadFormByIndex(config, dataRows, index) {
  var formConfig = config.formConfig || {};
  var rows = normalizeRows(formConfig.rows || []);
  var safeIndex = Number.isFinite(index) ? Math.max(0, Math.min(index, dataRows.length - 1)) : 0;
  var sampleRow = dataRows[safeIndex] || {};

  rows.forEach(function (row) {
    (row.fields || []).forEach(function (field) {
      var dataColumn = field.dataColumn || "";
      var label = field.label || dataColumn || "Campo";
      var fieldId = field.id || slugify(dataColumn || label);
      var control = bySelector("#" + fieldId);

      if (control && dataColumn) {
        var value = sampleRow[dataColumn] || "";
        control.value = value;
      }
    });
  });
}
