const form = document.querySelector('#settings');
const workspace = document.querySelector('#workspace-name');
const pageSize = document.querySelector('#page-size');
const summary = document.querySelector('#error-summary');
const errors = document.querySelector('#error-links');
const saved = document.querySelector('#saved');

function showErrors() {
  const fields = [
    { field: workspace, error: 'workspace-error', message: workspace.value.trim() ? '' : 'Enter a workspace name.' },
    { field: pageSize, error: 'page-size-error', hint: 'page-size-hint', message: pageSize.validity.valid ? '' : 'Enter a whole number from 5 to 100.' },
  ];
  errors.replaceChildren();
  for (const { field, error, hint, message } of fields) {
    document.getElementById(error).textContent = message;
    if (message) field.setAttribute('aria-invalid', 'true');
    else field.removeAttribute('aria-invalid');
    const description = [hint, message && error].filter(Boolean).join(' ');
    if (description) field.setAttribute('aria-describedby', description);
    else field.removeAttribute('aria-describedby');
    if (!message) continue;
    const item = document.createElement('li');
    const link = document.createElement('a');
    link.href = `#${field.id}`;
    link.textContent = message;
    link.addEventListener('click', (event) => {
      event.preventDefault();
      field.focus();
    });
    item.append(link);
    errors.append(item);
  }
  summary.hidden = !errors.children.length;
  return !summary.hidden;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  saved.textContent = '';
  if (showErrors()) {
    summary.focus();
    return;
  }
  saved.textContent = `Example settings saved for ${workspace.value.trim()}.`;
});
form.addEventListener('input', () => { saved.textContent = ''; });
