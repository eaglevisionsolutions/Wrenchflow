// export-utils.js
// Advanced print/export helpers for WrenchFlow

export function exportTableToCSV(tableId, filename = 'export.csv') {
  const table = document.getElementById(tableId).querySelector('table');
  let csv = [];
  for (let row of table.rows) {
    let rowData = [];
    for (let cell of row.cells) {
      rowData.push('"' + (cell.innerText || '').replace(/"/g, '""') + '"');
    }
    csv.push(rowData.join(','));
  }
  const blob = new Blob([csv.join('\n')], { type: 'text/csv' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportTableToExcel(tableId, filename = 'export.xls') {
  const table = document.getElementById(tableId).querySelector('table');
  let html = table.outerHTML.replace(/ /g, '%20');
  const uri = 'data:application/vnd.ms-excel,';
  const link = document.createElement('a');
  link.href = uri + html;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function printElement(elementId, title = '') {
  const printContents = document.getElementById(elementId).innerHTML;
  const win = window.open('', '', 'width=900,height=700');
  win.document.write('<html><head><title>' + title + '</title>');
  win.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">');
  win.document.write('<style>body{background:#fff;}@media print{.no-print{display:none!important;}}</style>');
  win.document.write('</head><body>');
  win.document.write(printContents);
  win.document.write('</body></html>');
  win.document.close();
  win.print();
}
