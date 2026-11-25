const byId = (id) => document.getElementById(id);
for (const sample of document.querySelectorAll('.sample')) {
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = 'Copy HTML';
  const source = document.createElement('textarea');
  source.className = 'snippet';
  source.readOnly = true;
  source.rows = 5;
  source.setAttribute('aria-label', 'Copyable example HTML');
  const lines = sample.innerHTML.replace(/^\s*\n/, '').trimEnd().split('\n');
  const indent = Math.min(...lines.filter((line) => line.trim()).map((line) => line.search(/\S/)));
  source.value = lines.map((line) => line.slice(indent)).join('\n');
  const select = document.createElement('button');
  select.type = 'button';
  select.className = 'text-button';
  select.textContent = 'Select HTML';
  select.addEventListener('click', () => { source.focus(); source.select(); });
  details.append(summary, select, source);
  sample.after(details);
}

for (const button of document.querySelectorAll('[data-preview]')) {
  button.addEventListener('click', () => { byId('button-status').textContent = button.dataset.preview; });
}

const tabs = [...document.querySelectorAll('[role="tab"]')];
function chooseTab(active) {
  for (const tab of tabs) {
    const selected = tab === active;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    byId(tab.getAttribute('aria-controls')).hidden = !selected;
  }
  active.focus();
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => chooseTab(tab));
  tab.addEventListener('keydown', (event) => {
    const position = {
      ArrowLeft: (index + tabs.length - 1) % tabs.length,
      ArrowRight: (index + 1) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[event.key];
    if (position === undefined) return;
    event.preventDefault();
    chooseTab(tabs[position]);
  });
});

const search = byId('sample-search');
const rows = [...document.querySelectorAll('.listing tbody tr')];
const previous = byId('sample-prev');
const next = byId('sample-next');
const heading = byId('sample-sort-heading');
const sort = byId('sample-sort');
const result = byId('sample-result');
let page = 0;
let ascending = true;

function updateTable() {
  const query = search.elements.query.value.trim().normalize().toLowerCase();
  const type = search.elements.type.value;
  const visible = rows.filter((row) => row.cells[0].textContent.normalize().toLowerCase().includes(query)
    && (!type || row.cells[1].textContent === type));
  visible.sort((a, b) => a.cells[0].textContent.localeCompare(b.cells[0].textContent) * (ascending ? 1 : -1));
  const active = visible.slice(page * 2, page * 2 + 2);
  for (const row of rows) row.hidden = !active.includes(row);
  if (active.length) active[0].parentElement.append(...active);
  previous.disabled = page === 0;
  next.disabled = (page + 1) * 2 >= visible.length;
  result.textContent = visible.length ? `${visible.length} results · Page ${page + 1}` : 'No matching files.';
}

search.addEventListener('submit', (event) => {
  event.preventDefault();
  page = 0;
  updateTable();
});
sort.addEventListener('click', () => {
  ascending = !ascending;
  page = 0;
  heading.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
  sort.textContent = ascending ? 'Name ↑' : 'Name ↓';
  updateTable();
});
for (const [button, step] of [[previous, -1], [next, 1]]) {
  button.addEventListener('click', () => {
    page += step;
    updateTable();
    if (button.disabled) (step > 0 ? previous : next).focus();
  });
}
for (const button of document.querySelectorAll('[data-row-action]')) {
  button.addEventListener('click', () => {
    const details = button.closest('details');
    result.textContent = `Selected ${details.closest('tr').cells[0].textContent}.`;
    details.open = false;
    details.querySelector('summary').focus();
  });
}
updateTable();

const opener = byId('sample-open');
const files = byId('sample-files');
const dialog = byId('sample-dialog');
opener.addEventListener('click', () => {
  dialog.returnValue = '';
  const count = files.files.length;
  byId('sample-destination').textContent = count
    ? `Destination /Studio · ${count} selected ${count === 1 ? 'file' : 'files'}`
    : 'Destination /Studio · 1 sample file';
  dialog.showModal();
});
dialog.addEventListener('close', () => {
  if (dialog.returnValue === 'start') byId('sample-upload-status').textContent = 'Example upload confirmed.';
  opener.focus();
});
