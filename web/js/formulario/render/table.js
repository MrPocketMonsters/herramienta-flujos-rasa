import { applyCountTemplate } from '../../utils/strings.js';
import { bySelector } from '../dom.js';

function applyColumnWidth(element, widthConfig) {
  if (!widthConfig) {
    return;
  }

  var type = widthConfig.type || "fixed";
  var value = widthConfig.value || 0;

  if (value <= 0) {
    return;
  }

  var cssValue = value + "px";

  if (type === "fixed") {
    element.style.width = cssValue;
  } else if (type === "min") {
    element.style.minWidth = cssValue;
  } else if (type === "max") {
    element.style.maxWidth = cssValue;
  }
}

function applyColumnStyle(element, styleConfig) {
  if (!styleConfig || typeof styleConfig !== "object") {
    return;
  }

  Object.keys(styleConfig).forEach(function (key) {
    var value = styleConfig[key];
    if (typeof value === "string" || typeof value === "number") {
      element.style[key] = value;
    }
  });
}

function applyColumnWrap(element, wrapConfig) {
  var shouldWrap = wrapConfig !== false;

  if (shouldWrap) {
    element.style.overflowWrap = "break-word";
    element.style.wordWrap = "break-word";
    element.style.wordBreak = "break-word";
    element.style.hyphens = "auto";
  }
}

export function renderTable(config, dataRows, onLoadRow, onSaveRow) {
  var headerRow = bySelector("[data-table-header-row]");
  var body = bySelector("[data-table-body]");
  if (!headerRow || !body) {
    return;
  }

  var tableConfig = config.tableConfig || {};
  var columns = Array.isArray(tableConfig.columns) ? tableConfig.columns : [];

  var table = headerRow.closest("table");
  if (table) {
    var hasFixedWidth = columns.some(function (col) {
      return col.width && col.width.type === "fixed";
    });
    if (hasFixedWidth) {
      table.style.tableLayout = "fixed";
    }
  }

  headerRow.innerHTML = "";
  columns.forEach(function (column) {
    var th = document.createElement("th");
    th.textContent = column.label || column.dataColumn || "Columna";

    applyColumnWidth(th, column.width);
    applyColumnStyle(th, column.style);

    headerRow.appendChild(th);
  });

  var th = document.createElement("th");
  th.textContent = "Acción";
  headerRow.appendChild(th);

  body.innerHTML = "";
  dataRows.forEach(function (row, rowIndex) {
    var tr = document.createElement("tr");
    columns.forEach(function (column) {
      var td = document.createElement("td");
      var value = row[column.dataColumn] || "";
      td.textContent = value;

      applyColumnWidth(td, column.width);
      applyColumnStyle(td, column.style);
      applyColumnWrap(td, column.wordWrap);

      tr.appendChild(td);
    });

    var actionTd = document.createElement("td");
    var button = document.createElement("button");
    button.type = "button";
    button.className = "btn btn-soft";
    button.textContent = "Cargar";
    button.addEventListener("click", function () {
      if (typeof onLoadRow === "function") {
        onLoadRow(rowIndex);
      }
    });
    actionTd.appendChild(button);
    tr.appendChild(actionTd);

    body.appendChild(tr);
  });

  var tableTitle = tableConfig.title || "Registros ({count})";
  setText("[data-table-title]", applyCountTemplate(tableTitle, dataRows.length));
}

function setText(selector, value) {
  var node = bySelector(selector);
  if (node && typeof value === "string" && value.length > 0) {
    node.textContent = value;
  }
}
