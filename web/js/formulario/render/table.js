import { applyCountTemplate } from '../../utils/strings.js';
import { bySelector } from '../dom.js';

export function renderTable(config, dataRows) {
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

  body.innerHTML = "";
  dataRows.forEach(function (row) {
    var tr = document.createElement("tr");
    columns.forEach(function (column) {
      var td = document.createElement("td");
      var value = row[column.dataColumn] || "";
      td.textContent = value;
      tr.appendChild(td);
    });
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
