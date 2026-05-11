export function bySelector(selector) {
  return document.querySelector(selector);
}

export function setText(selector, value) {
  var node = bySelector(selector);
  if (node && typeof value === "string" && value.length > 0) {
    node.textContent = value;
  }
}

export function asHelp(helpValue, label) {
  if (typeof helpValue === "string") {
    return {
      title: label,
      type: "Campo descriptivo",
      copy: helpValue,
      note: "Completa este campo con informacion valida para el proceso."
    };
  }

  var help = helpValue || {};
  return {
    title: help.title || label,
    type: help.type || "Campo descriptivo",
    copy: help.copy || "Completa este campo con informacion del flujo.",
    note: help.note || "Asegura que el dato sea claro y consistente."
  };
}

export function normalizeRows(formRows) {
  if (!Array.isArray(formRows)) {
    return [];
  }

  return formRows.map(function (row) {
    if (Array.isArray(row.fields)) {
      return row;
    }
    return { fields: [row] };
  });
}

export function getColumnOptions(rows, columns) {
  var maps = {};
  columns.forEach(function (column) {
    if (!column || !column.dataColumn) {
      return;
    }
    maps[column.dataColumn] = [];
  });

  rows.forEach(function (row) {
    Object.keys(maps).forEach(function (column) {
      var value = row[column];
      if (!value) {
        return;
      }
      if (maps[column].indexOf(value) === -1) {
        maps[column].push(value);
      }
    });
  });

  return maps;
}
