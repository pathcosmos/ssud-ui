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
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(1)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
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

function renderNavigation() {
  const navigation = byId('navigation');
  navigation.replaceChildren();
  if (showingResults || !currentFolder) return;
  const parent = currentFolder.split('/').slice(0, -1).join('/');
  for (const [label, destination] of [['⌂ Home', ''], ['↑ Up one level', parent]]) {
    const cell = navigation.insertRow().insertCell();
    cell.colSpan = 4;
    cell.append(button(label, () => browse(destination)));
  }
}

function browse(folder, highlight = null) {
  currentFolder = folder;
  target = highlight;
  showingResults = false;
  scroll.scrollTop = 0;
  render();
}

function openLocation(item) {
  if (showingResults) resultOrigin = { top: scroll.scrollTop, item, sort: { ...sort } };
  browse(item.parent, item);
  byId('files').querySelector('.target .file-name')?.focus();
}

function renderItem(item) {
  const row = byId('files').insertRow();
  row.classList.toggle('target', target === item);
  const name = row.insertCell();
  const nameButton = button('', (event) => {
    if (item.folder) {
      if (showingResults) resultOrigin = { top: scroll.scrollTop, item, sort: { ...sort } };
      browse(pathOf(item));
      scroll.focus();
      return;
    }
    openTransfer('download', [item], item.parent, event.currentTarget);
  }, 'file-name');
  const icon = document.createElement('span');
  icon.className = 'file-icon';
  icon.setAttribute('aria-hidden', 'true');
  icon.textContent = item.folder ? '▪' : '▫';
  const label = document.createElement('span');
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
  row.insertCell().textContent = item.modified;
  const actions = row.insertCell();
  if (!item.folder) actions.append(button('Download',
    (event) => openTransfer('download', [item], item.parent, event.currentTarget)));
  return row;
}

function render() {
  const items = [...folderEntries, ...entries];
  const visible = showingResults ? resultItems(items) : items.filter(({ parent }) => parent === currentFolder);
  const direction = sort.ascending ? 1 : -1;
  visible.sort((a, b) => direction * (sort.column === 'size'
    ? sizeOf(a) - sizeOf(b)
    : collator.compare(a.name, b.name)));
  byId('files').replaceChildren();
  let resultButton;
  for (const item of visible) {
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
  text('result-info', `${visible.length} ${showingResults ? 'results' : 'items'}`);
  text('home-size', formatSize(entries.reduce((total, file) => total + file.size, 0)));
  text('index-count', `${items.length} indexed`);
  renderBreadcrumb();
  renderNavigation();
  return resultButton;
}

function applySearch() {
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
  const { top, sort: previousSort } = resultOrigin;
  showingResults = true;
  sort = previousSort;
  target = null;
  const resultButton = render();
  resultOrigin = null;
  scroll.scrollTop = top;
  (resultButton ?? search).focus({ preventScroll: true });
});
for (const column of ['name', 'size']) {
  byId(`sort-${column}`).addEventListener('click', () => {
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
