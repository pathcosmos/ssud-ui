const fileInput = document.querySelector('#files');
const dropZone = document.querySelector('#drop-zone');
const addSample = document.querySelector('#add-sample');
const dialog = document.querySelector('#confirm');
const selection = document.querySelector('#selection');
const queue = document.querySelector('#queue');
const status = document.querySelector('#queue-status');
let pending = [];
let opener = addSample;

function prepare(names, trigger) {
  if (!names.length) return;
  pending = names;
  opener = trigger;
  selection.replaceChildren(...names.map((name) => {
    const item = document.createElement('li');
    item.textContent = name;
    return item;
  }));
  dialog.returnValue = '';
  dialog.showModal();
}

function addTransfer(name) {
  document.querySelector('#queue-empty').hidden = true;
  const row = document.createElement('li');
  const info = document.createElement('div');
  const filename = document.createElement('strong');
  filename.textContent = name;
  const state = document.createElement('span');
  state.className = 'muted';
  state.tabIndex = -1;
  const detail = document.createElement('p');
  detail.className = 'queue-item-error error-text';
  const retry = document.createElement('button');
  retry.type = 'button';
  retry.className = 'secondary';
  retry.textContent = 'Retry';
  retry.setAttribute('aria-label', `Retry ${name}`);
  const progress = document.createElement('progress');
  progress.max = 100;
  progress.setAttribute('aria-label', `Transfer progress for ${name}`);
  info.append(filename, state);
  row.append(info, retry, progress, detail);
  queue.append(row);

  function run(retrying) {
    state.textContent = retrying ? 'Retrying…' : 'Uploading…';
    if (document.activeElement === retry) state.focus();
    retry.hidden = true;
    detail.hidden = true;
    progress.hidden = false;
    progress.value = 0;
    const timer = setInterval(() => {
      progress.value += 25;
      if (progress.value < (retrying ? 100 : 50)) return;
      clearInterval(timer);
      if (retrying) {
        state.textContent = 'Complete';
        status.textContent = `Transfer complete for ${name}.`;
        return;
      }
      progress.hidden = true;
      state.textContent = 'Failed';
      detail.textContent = 'The example interrupted this transfer. Retry to finish.';
      detail.hidden = false;
      retry.hidden = false;
      status.textContent = `Transfer failed for ${name}. Retry is available.`;
    }, 180);
  }
  retry.addEventListener('click', () => run(true));
  run(false);
}

addSample.addEventListener('click', () => prepare(['프로젝트 진행 현황 및 다음 단계 검토를 위한 회의록 2026.txt'], addSample));
fileInput.addEventListener('change', () => {
  prepare(Array.from(fileInput.files, (file) => file.name), fileInput);
  fileInput.value = '';
});
dropZone.addEventListener('dragover', (event) => event.preventDefault());
dropZone.addEventListener('drop', (event) => {
  event.preventDefault();
  prepare(Array.from(event.dataTransfer.files, (file) => file.name), fileInput);
});
function finish(confirmed) {
  dialog.close();
  if (confirmed) pending.forEach(addTransfer);
  pending = [];
  opener.focus();
}

dialog.querySelector('form').addEventListener('submit', (event) => {
  event.preventDefault();
  finish(event.submitter?.value === 'start');
});
dialog.addEventListener('cancel', (event) => {
  event.preventDefault();
  finish(false);
});
