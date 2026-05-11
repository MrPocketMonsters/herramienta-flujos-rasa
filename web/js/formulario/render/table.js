import { applyCountTemplate } from '../../utils/strings.js';
import { bySelector } from '../dom.js';

export function renderTable(config, dataRows, onLoadRow) {
  var headerRow = bySelector("[data-table-header-row]");
  var body = bySelector("[data-table-body]");
  if (!headerRow || !body) {
    return;
  }

  var tableConfig = config.tableConfig || {};
  var columns = Array.isArray(tableConfig.columns) ? tableConfig.columns : [];

  headerRow.innerHTML = "";
  columns.forEach(function (column) {
    var th = document.createElement("th");
    th.textContent = column.label || column.dataColumn || "Columna";
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
