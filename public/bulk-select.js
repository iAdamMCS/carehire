(() => {
  const picker = document.getElementById('taskPicker');
  if (!picker) return;

  function taskInputs() {
    return [...picker.querySelectorAll('[data-task]')];
  }

  function updateButton(button) {
    const inputs = taskInputs();
    const allSelected = inputs.length > 0 && inputs.every(input => input.checked);
    button.textContent = allSelected ? 'Clear all' : 'Select all';
    button.setAttribute('aria-pressed', allSelected ? 'true' : 'false');
    button.setAttribute('aria-label', allSelected ? 'Clear all tasks' : 'Select all tasks');
  }

  function ensureControl() {
    let row = picker.querySelector('.task-bulk-actions');
    if (!row) {
      row = document.createElement('div');
      row.className = 'task-bulk-actions';
      row.style.cssText = 'display:flex;justify-content:flex-end;margin:0 0 12px;';
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn secondary';
      button.addEventListener('click', () => {
        const inputs = taskInputs();
        const shouldSelect = !inputs.every(input => input.checked);
        inputs.forEach(input => {
          if (input.checked !== shouldSelect) {
            input.checked = shouldSelect;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
        updateButton(button);
      });
      row.append(button);
      const heading = picker.querySelector('h2');
      if (heading) heading.insertAdjacentElement('afterend', row);
      else picker.prepend(row);
    }
    const button = row.querySelector('button');
    if (button) updateButton(button);
  }

  picker.addEventListener('change', event => {
    if (event.target.matches('[data-task]')) {
      const button = picker.querySelector('.task-bulk-actions button');
      if (button) updateButton(button);
    }
  });

  const observer = new MutationObserver(() => ensureControl());
  observer.observe(picker, { childList: true });
  ensureControl();
})();
