import { slugify } from '../../utils/strings.js';
import {
  bySelector,
  setText,
  setAction,
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

export function renderForm(config, fieldOptionsMap, onSaveRow) {
  var formRowsContainer = bySelector("#form-rows");
  if (!formRowsContainer) {
    return;
  }

  formRowsContainer.innerHTML = "";

  var formConfig = config.formConfig || {};
  var rows = normalizeRows(formConfig.rows || []);
  var flujoId = "";

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
  setAction("[data-form-new]", () => renderForm(config, fieldOptionsMap, onSaveRow));
  setText("[data-form-save]", actions.createLabel || "Guardar nuevo registro");
  setAction("[data-form-save]", () => onSaveRow(Number.POSITIVE_INFINITY, loadObjectFromForm(flujoId, rows)));
}

export function loadFormByIndex(config, dataRows, index, onSaveRow, fieldOptionsMap) {
  var formConfig = config.formConfig || {};
  var rows = normalizeRows(formConfig.rows || []);
  var safeIndex = Number.isFinite(index) ? Math.max(0, Math.min(index, dataRows.length - 1)) : 0;
  var sampleRow = dataRows[safeIndex] || {};
  var flujoId = sampleRow.flujo_id || "";

  rows.forEach(function (row) {
    (row.fields || []).forEach(function (field) {
      var dataColumn = field.dataColumn || "";
      var label = field.label || dataColumn || "Campo";
      var fieldId = field.id || slugify(dataColumn || label);
      var control = bySelector("#" + fieldId);

      if (control && dataColumn) {
        var value = sampleRow[dataColumn] || "";
        // If there are fieldOptions available, and the control uses option objects, map stored value -> visible label
        var fieldOptions = fieldOptionsMap && fieldOptionsMap[fieldId] ? fieldOptionsMap[fieldId] : null;
        if (fieldOptions && Array.isArray(fieldOptions.options)) {
          var opt = fieldOptions.options.find(function (o) { return o && o.value ? String(o.value) === String(value) : String(o) === String(value); });
          if (opt) {
            control.dataset.realValue = String(value);
            control.value = opt.label || String(value);
            return;
          }
        }
        // default: set raw value
        control.value = value;
      }
    });
  });
  var actions = formConfig.actions || {};
  setText("[data-form-save]", actions.updateLabel || "Actualizar registro");
  setAction("[data-form-save]", () => onSaveRow(safeIndex, loadObjectFromForm(flujoId, rows)));
}

function loadObjectFromForm(flujoId, rows) {
  var obj = {};
  rows.forEach(function (row) {
    (row.fields || []).forEach(function (field) {
      var dataColumn = field.dataColumn || "";
      var label = field.label || dataColumn || "Campo";
      var fieldId = field.id || slugify(dataColumn || label);
      var control = bySelector("#" + fieldId);
      if (control) {
        var raw = control.dataset && control.dataset.realValue ? control.dataset.realValue : control.value;
        var value = raw || "";
        value = typeof value === "string" ? value.trim() : value;
        obj[dataColumn] = value;
      }
    })
  });
  obj.flujo_id = flujoId;
  return obj;
}
