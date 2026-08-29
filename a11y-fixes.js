(() => {
  // Connect visible labels to their form controls for assistive technology.
  document.querySelectorAll('.field').forEach((field, index) => {
    const label = field.querySelector(':scope > label');
    const control = field.querySelector('input:not([type="hidden"]), select, textarea');
    if (!label || !control) return;
    if (!control.id) control.id = `carehire-field-${index + 1}`;
    label.setAttribute('for', control.id);
  });

  const roleChoices = document.getElementById('roleChoices');
  if (roleChoices) {
    roleChoices.setAttribute('role', 'group');
    roleChoices.setAttribute('aria-label', 'Type of worker');
  }

  const needsChecks = document.querySelector('#needs .checks');
  if (needsChecks) {
    needsChecks.setAttribute('role', 'group');
    needsChecks.setAttribute('aria-label', 'Tasks and support needed');
  }

  const hoursResult = document.getElementById('hoursResult');
  if (hoursResult) hoursResult.setAttribute('aria-live', 'polite');

  const originalGo = window.go;
  if (typeof originalGo === 'function') {
    window.go = function(id) {
      originalGo(id);
      document.querySelectorAll('.navbtn').forEach(button => {
        if (button.dataset.nav === id) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      const heading = document.querySelector(`#${id} h1`);
      if (heading) {
        if (!heading.hasAttribute('tabindex')) heading.setAttribute('tabindex', '-1');
        heading.focus({ preventScroll: true });
      }
    };
  }
})();
