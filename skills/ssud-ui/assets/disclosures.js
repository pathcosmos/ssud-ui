// Each toggle owns one in-flow panel. Layout changes never rebuild its contents.
for (const toggle of document.querySelectorAll('button[data-disclosure]')) {
  const panel = document.getElementById(toggle.getAttribute('aria-controls'));
  const compact = matchMedia(`(max-width: ${Number(toggle.dataset.disclosure)}px)`);
  const wide = toggle.dataset.expandAt
    ? matchMedia(`(min-width: ${Number(toggle.dataset.expandAt)}px)`)
    : null;
  let preference;

  function update() {
    const expanded = !compact.matches || (preference ?? (wide?.matches || false));
    if (compact.matches) toggle.hidden = false;
    if (!expanded && panel.contains(document.activeElement)) toggle.focus();
    toggle.setAttribute('aria-expanded', String(expanded));
    panel.hidden = !expanded;
    if (!compact.matches && document.activeElement === toggle) {
      panel.querySelector('button, select, input, a[href]')?.focus({ preventScroll: true });
    }
    toggle.hidden = !compact.matches;
  }

  toggle.addEventListener('click', () => {
    preference = panel.hidden;
    update();
  });
  compact.addEventListener('change', update);
  wide?.addEventListener('change', update);
  update();
}
