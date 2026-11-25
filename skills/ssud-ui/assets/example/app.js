const byId = (id) => document.getElementById(id);
const folders = ['Reports', 'Reports/2026', 'Photos', 'Archive'];
const entries = [
  { parent: 'Reports/2026', name: 'Final report 2026.pdf', size: 19_200_000 },
  { parent: 'Reports/2026', name: '회의록 2026.txt', size: 184_000 },
  { parent: 'Reports', name: 'Final report 2025.docx', size: 620_000 },
  { parent: 'Reports', name: '일정과 검토 내용을 포함한 프로젝트 진행 현황 보고서.txt', size: 74_000 },
  { parent: 'Photos', name: '작업실 전경.jpg', size: 32_400_000 },
  { parent: 'Archive', name: 'Budget 2025.xlsx', size: 440_000 },
  { parent: '', name: 'README.txt', size: 2_400 },
  { parent: '', name: 'Project brief.pdf', size: 820_000 },
].map((entry) => ({ ...entry, modified: '2026-10-14' }));
const folderEntries = folders.map((path) => ({
  parent: path.split('/').slice(0, -1).join('/'),
  name: path.split('/').at(-1),
  modified: '2026-10-14',
  folder: true,
}));

const categories = {
  pdf: 'document', docx: 'document', txt: 'document',
  jpg: 'image', jpeg: 'image', png: 'image', xlsx: 'spreadsheet', csv: 'spreadsheet',
};

const search = byId('query');
const kind = byId('kind');
const extensions = byId('extensions');
const scroll = byId('table-scroll');
const transfer = byId('transfer');
const collator = new Intl.Collator(undefined, { numeric: true });

const pageSize = 5;
const rowMenu = byId('row-menu');
let menuTrigger = null;
rowMenu.addEventListener('beforetoggle', (event) => {
  menuTrigger?.setAttribute('aria-expanded', String(event.newState === 'open'));
});
let page = 0;
let currentFolder = '';
let showingResults = false;
let resultOrigin = null;
let sort = { column: 'name', ascending: true };
let target = null;
let transferAction = null;

const pathOf = ({ parent, name }) => [parent, name].filter(Boolean).join('/');
const displayPath = (folder) => ['/Studio', folder].filter(Boolean).join('/');
const searchText = (value) => value.normalize('NFC').toLowerCase();
const extensionOf = (name) => name.lastIndexOf('.') > 0 ? searchText(name.split('.').at(-1)) : '';
const text = (id, value) => { byId(id).textContent = value; };

function button(label, action, className = 'text-button') {
  const element = document.createElement('button');
  element.type = 'button';
  element.className = className;
  element.textContent = label;
  element.addEventListener('click', action);
  return element;
}

function formatSize(bytes) {
  if (bytes < 1000) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB', 'PB'];
  let amount = bytes / 1000;
  let unit = 0;
  while (amount >= 1000 && unit < units.length - 1) {
    amount /= 1000;
    unit += 1;
  }
  return `${amount.toFixed(1)} ${units[unit]}`;
}

function sizeOf(entry) {
  if (!entry.folder) return entry.size;
  const prefix = pathOf(entry);
  return entries
    .filter(({ parent }) => parent === prefix || parent.startsWith(`${prefix}/`))
    .reduce((total, file) => total + file.size, 0);
}

function resultItems(items) {
  const words = Array.from(searchText(search.value).matchAll(/"([^"]+)"|([^\s"]+)/g),
    ([, phrase, word]) => phrase ?? word);
  const allowed = searchText(extensions.value).split(/[\s,]+/)
    .map((part) => part.replace(/^\./, '')).filter(Boolean);
  return items.filter((item) => {
    const extension = extensionOf(item.name);
    const type = item.folder ? 'folder' : (categories[extension] ?? 'other');
    return (!kind.value || kind.value === type)
      && (!allowed.length || (!item.folder && allowed.includes(extension)))
      && words.every((word) => searchText(item.name).includes(word));
  });
}

function renderBreadcrumb() {
  const breadcrumb = byId('breadcrumbs');
  breadcrumb.replaceChildren();
  if (showingResults) {
    breadcrumb.textContent = 'Search results';
    return;
  }
  breadcrumb.append(button('Home', () => browse('')));
  let path = '';
  for (const part of currentFolder.split('/').filter(Boolean)) {
    const destination = path ? `${path}/${part}` : part;
    breadcrumb.append(' / ', button(part, () => browse(destination)));
    path = destination;
  }
}

const compactList = matchMedia('(max-width: 650px)');

function fitNavigationRows() {
  for (const cell of byId('navigation').querySelectorAll('td')) {
    cell.colSpan = compactList.matches ? 3 : 4;
  }
}

compactList.addEventListener('change', fitNavigationRows);

function renderNavigation() {
  const navigation = byId('navigation');
  navigation.replaceChildren();
  if (showingResults || !currentFolder) return;
  const parent = currentFolder.split('/').slice(0, -1).join('/');
  for (const [label, destination] of [['⌂ Home', ''], ['↑ Up one level', parent]]) {
    const cell = navigation.insertRow().insertCell();
    cell.append(button(label, () => browse(destination)));
  }
  fitNavigationRows();
}

function browse(folder, highlight = null) {
  currentFolder = folder;
  page = highlight ? -1 : 0;
  target = highlight;
  showingResults = false;
  scroll.scrollTop = 0;
  render();
}

function rememberResults(item) {
  if (showingResults) {
    resultOrigin = { top: scroll.scrollTop, item, page, folder: currentFolder, sort: { ...sort } };
  }
}

function openLocation(item) {
  rememberResults(item);
  browse(item.parent, item);
  byId('files').querySelector('.target .file-name')?.focus();
}

function renderItem(item) {
  const row = byId('files').insertRow();
  row.classList.toggle('target', target === item);
  const name = row.insertCell();
  const nameButton = button('', (event) => {
    if (item.folder) {
      openFolder(item);
      return;
    }
    openTransfer('download', [item], item.parent, event.currentTarget);
  }, 'file-name');
  const icon = document.createElement('span');
  icon.className = 'file-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = item.folder ? '▪' : '▫';
  const label = document.createElement('span');
  label.className = 'row-title';
  label.textContent = item.name;
  nameButton.title = item.name;
  nameButton.append(icon, label);
  name.append(nameButton);
  if (showingResults) {
    const location = button(displayPath(item.parent), () => openLocation(item), 'text-button file-path');
    location.title = displayPath(item.parent);
    location.setAttribute('aria-label', `Go to location of ${item.name}`);
    name.append(location);
  }
  row.insertCell().textContent = formatSize(sizeOf(item));
  const modified = row.insertCell();
  modified.className = 'optional-column';
  modified.textContent = item.modified;
  const actions = row.insertCell();
  const trigger = button('⋯', (event) => openRowMenu(item, event.currentTarget), 'secondary icon-button');
  trigger.setAttribute('aria-label', `Actions for ${item.name}`);
  trigger.setAttribute('aria-controls', rowMenu.id);
  trigger.setAttribute('aria-expanded', 'false');
  actions.append(trigger);
  return row;
}

function openRowMenu(item, trigger) {
  if (rowMenu.matches(':popover-open')) rowMenu.hidePopover();
  menuTrigger = trigger;
  const action = button(item.folder ? 'Open folder' : 'Download', () => {
    rowMenu.hidePopover();
    if (!item.folder) openTransfer('download', [item], item.parent, trigger);
    else openFolder(item);
  }, 'text-button');
  const locate = button('Go to location', () => {
    rowMenu.hidePopover();
    openLocation(item);
  }, 'text-button');
  const details = document.createElement('div');
  details.className = 'row-details';
  const title = document.createElement('strong');
  title.textContent = item.name;
  const metadata = document.createElement('span');
  metadata.textContent = `${formatSize(sizeOf(item))} · Modified ${item.modified}`;
  const parent = document.createElement('div');
  parent.textContent = displayPath(item.parent);
  details.append(title, parent, metadata);
  rowMenu.replaceChildren(details, action, locate);
  rowMenu.showPopover({ source: trigger });
  positionRowMenu();
  action.focus();
}

function positionRowMenu() {
  if (!rowMenu.matches(':popover-open')) return;
  const anchor = menuTrigger.getBoundingClientRect();
  const width = rowMenu.offsetWidth;
  const height = rowMenu.offsetHeight;
  rowMenu.style.inset = 'auto';
  rowMenu.style.left = `${Math.max(8, Math.min(anchor.right - width, innerWidth - width - 8))}px`;
  rowMenu.style.top = `${Math.max(8, anchor.bottom + height + 4 < innerHeight
    ? anchor.bottom + 4 : anchor.top - height - 4)}px`;
}

window.addEventListener('resize', positionRowMenu);
scroll.addEventListener('scroll', positionRowMenu);

function openFolder(item) {
  rememberResults(item);
  browse(pathOf(item));
  scroll.focus();
}

function render() {
  if (rowMenu.matches(':popover-open')) rowMenu.hidePopover();
  const items = [...folderEntries, ...entries];
  const visible = showingResults ? resultItems(items) : items.filter(({ parent }) => parent === currentFolder);
  const direction = sort.ascending ? 1 : -1;
  visible.sort((a, b) => direction * (sort.column === 'size'
    ? sizeOf(a) - sizeOf(b)
    : collator.compare(a.name, b.name)));
  byId('files').replaceChildren();
  const lastPage = Math.max(0, Math.ceil(visible.length / pageSize) - 1);
  if (page < 0) page = Math.max(0, Math.floor(visible.indexOf(target) / pageSize));
  page = Math.min(page, lastPage);
  byId('previous').disabled = page <= 0;
  byId('next').disabled = page >= lastPage;
  let resultButton;
  for (const item of visible.slice(page * pageSize, (page + 1) * pageSize)) {
    const row = renderItem(item);
    if (item === resultOrigin?.item) resultButton = row.querySelector('.file-path');
  }
  ['name', 'size'].forEach((column) => {
    const heading = byId(`${column}-heading`);
    if (sort.column === column) heading.setAttribute('aria-sort', sort.ascending ? 'ascending' : 'descending');
    else heading.removeAttribute('aria-sort');
  });
  byId('back').hidden = !resultOrigin || showingResults;
  byId('empty').hidden = Boolean(visible.length);
  text('result-info', `${visible.length} ${showingResults ? 'results' : 'items'} · Page ${page + 1} of ${lastPage + 1}`);
  const filterCount = [kind.value, extensions.value.trim()].filter(Boolean).length;
  text('filter-count', filterCount ? ` (${filterCount})` : '');
  text('home-size', formatSize(entries.reduce((total, file) => total + file.size, 0)));
  text('index-count', `${items.length} indexed`);
  renderBreadcrumb();
  renderNavigation();
  return resultButton;
}

function applySearch() {
  page = 0;
  resultOrigin = null;
  target = null;
  showingResults = [search, kind, extensions].some((field) => field.value.trim());
  scroll.scrollTop = 0;
  render();
}

function openTransfer(type, files, folder, opener) {
  const uploading = type === 'upload';
  transferAction = { type, files, folder, opener };
  text('transfer-title', uploading ? 'Confirm upload' : 'Confirm download');
  text('transfer-scope', uploading ? 'Destination' : 'Source');
  text('transfer-path', displayPath(folder));
  text('confirm', uploading ? 'Start upload' : 'Start download');
  const selection = byId('transfer-selection');
  selection.replaceChildren(...files.map(({ name, size }) => {
    const item = document.createElement('li');
    item.textContent = `${name} · ${formatSize(size)}`;
    return item;
  }));
  transfer.returnValue = '';
  transfer.showModal();
}

function addMockUploads(files, folder) {
  let added = 0;
  for (const { name, size } of files) {
    if ([...entries, ...folderEntries].some((item) =>
      item.parent === folder && searchText(item.name) === searchText(name))) continue;
    entries.push({ parent: folder, name, size, modified: new Date().toISOString().slice(0, 10) });
    added += 1;
  }
  return added;
}

byId('search-form').addEventListener('submit', (event) => {
  event.preventDefault();
  applySearch();
});
search.addEventListener('input', (event) => {
  if (!event.isComposing) applySearch();
});
search.addEventListener('compositionend', applySearch);
kind.addEventListener('change', applySearch);
extensions.addEventListener('change', applySearch);
byId('clear').addEventListener('click', () => {
  byId('search-form').reset();
  applySearch();
  search.focus();
});
byId('home').addEventListener('click', () => {
  byId('search-form').reset();
  resultOrigin = null;
  browse('');
});
byId('back').addEventListener('click', () => {
  if (!resultOrigin) return;
  const { top, page: previousPage, sort: previousSort } = resultOrigin;
  currentFolder = resultOrigin.folder;
  page = previousPage;
  showingResults = true;
  sort = previousSort;
  target = null;
  const resultButton = render();
  resultOrigin = null;
  scroll.scrollTop = top;
  (resultButton ?? search).focus({ preventScroll: true });
});
for (const [control, direction] of [['previous', -1], ['next', 1]]) {
  byId(control).addEventListener('click', () => {
    page += direction;
    scroll.scrollTop = 0;
    render();
    if (byId(control).disabled) scroll.focus();
  });
}

for (const column of ['name', 'size']) {
  byId(`sort-${column}`).addEventListener('click', () => {
    page = 0;
    sort = { column, ascending: sort.column === column ? !sort.ascending : column === 'name' };
    render();
  });
}

byId('update').addEventListener('click', () => {
  const state = byId('index-state');
  text('index-state', 'Updating');
  state.classList.add('running');
  byId('index-progress').hidden = false;
  byId('update').disabled = true;
  window.setTimeout(() => {
    text('index-state', 'Ready');
    state.classList.remove('running');
    byId('index-progress').hidden = true;
    byId('update').disabled = false;
  }, 2500);
});

const upload = byId('upload-files');
byId('upload').addEventListener('click', () => upload.click());
upload.addEventListener('change', () => {
  const files = [...upload.files];
  upload.value = '';
  if (files.length) openTransfer('upload', files, currentFolder, byId('upload'));
});
transfer.addEventListener('close', () => {
  const { type, files, folder, opener } = transferAction;
  transferAction = null;
  if (transfer.returnValue === 'confirm') {
    if (type === 'upload') {
      const added = addMockUploads(files, folder);
      text('notice', `Upload simulated. Added ${added} of ${files.length} selected to the example.`);
      render();
    } else {
      text('notice', `Download simulated for ${files[0].name}.`);
    }
  }
  opener.focus();
});

render();
