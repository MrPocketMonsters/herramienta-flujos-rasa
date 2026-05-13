export function parseCsv(text) {
  var rows = [];
  var currentRow = [];
  var currentField = "";
  var inQuotes = false;

  for (var i = 0; i < text.length; i += 1) {
    var char = text[i];
    var nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      currentRow.push(currentField);
      currentField = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && nextChar === "\n") {
        i += 1;
      }
      currentRow.push(currentField);
      currentField = "";
      if (currentRow.length > 1 || currentRow[0] !== "") {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  return rows;
}

export function toObjects(csvRows) {
  if (!csvRows || csvRows.length < 3) {
    return [];
  }

  var headers = csvRows[0].map(function (item) {
    return String(item || "").trim();
  });
  var dataRows = csvRows.slice(1);

  return [
    dataRows
      .map(function (row) {
        var item = {};
        var hasData = false;

        headers.forEach(function (header, idx) {
          if (!header) {
            return;
          }
          var value = idx < row.length ? String(row[idx] || "").trim() : "";
          item[header] = value;
          if (value !== "") {
            hasData = true;
          }
        });

        return hasData ? item : null;
      })
      .filter(function (item) {
        return item !== null;
      }),
    headers
  ];
}

export function toCsv(objects, headers) {
  var csvRows = [];
  csvRows.push(headers.join(","));

  objects.forEach((obj) =>
    csvRows.push(
      headers.map(function (header) {
        var value = String(obj[header] || "").replace(/"/g, '""');
        if (value.indexOf(",") !== -1
            || value.indexOf('"') !== -1
            || value.indexOf("\n") !== -1)
          value = '"' + value + '"';
          
        return value;
      })
      .join(",")
    )
  );

  return csvRows.join("\n");
}
