// calendar-view.js
// Simple calendar rendering for appointments and work orders
export function renderCalendar(container, items, { dateKey = 'date', titleKey = 'title', onClick } = {}) {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  let html = '<table class="table table-bordered"><thead><tr>';
  ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d => html += `<th>${d}</th>`);
  html += '</tr></thead><tbody><tr>';
  let dayOfWeek = firstDay.getDay();
  for (let i = 0; i < dayOfWeek; i++) html += '<td></td>';
  for (let d = 1; d <= daysInMonth; d++) {
    if ((dayOfWeek + d - 1) % 7 === 0 && d !== 1) html += '</tr><tr>';
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    html += `<td data-date="${dateStr}"><div class="date-num">${d}</div>`;
    items.filter(i => i[dateKey] && i[dateKey].startsWith(dateStr)).forEach(i => {
      html += `<div class="calendar-item" data-id="${i.id}">${i[titleKey]}</div>`;
    });
    html += '</td>';
  }
  html += '</tr></tbody></table>';
  container.innerHTML = html;
  container.querySelectorAll('.calendar-item').forEach(el => {
    el.onclick = () => onClick && onClick(el.dataset.id);
  });
}
