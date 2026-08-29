(() => {
  function enhanceRoleCards() {
    const cards = [...document.querySelectorAll('#roleChoices .choice')];
    cards.forEach(card => {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.setAttribute('aria-pressed', card.classList.contains('selected') ? 'true' : 'false');
      card.addEventListener('keydown', event => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          card.click();
        }
      });
      card.addEventListener('click', () => {
        cards.forEach(x => x.setAttribute('aria-pressed', x === card ? 'true' : 'false'));
      });
    });
  }

  function setupNeedsValidation() {
    const needs = document.getElementById('needs');
    if (!needs) return;
    const buttons = [...needs.querySelectorAll('.actions .btn')];
    const calculate = buttons.find(b => b.textContent.includes('Calculate estimate'));
    const useEstimate = buttons.find(b => b.textContent.includes('Use estimate'));
    const result = document.getElementById('hoursResult');

    const hasTasks = () => document.querySelectorAll('#needs .need:checked').length > 0;
    const showRequired = () => {
      if (!result) return;
      result.style.display = 'block';
      result.innerHTML = '<strong>Choose at least one task first.</strong><br>Select the help you need, then calculate the estimate.';
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };

    if (calculate) {
      calculate.removeAttribute('onclick');
      calculate.addEventListener('click', () => {
        if (!hasTasks()) return showRequired();
        window.calcHours();
      });
    }
    if (useEstimate) {
      useEstimate.removeAttribute('onclick');
      useEstimate.addEventListener('click', () => {
        if (!hasTasks()) return showRequired();
        window.calcHours();
        window.go('details');
      });
    }
  }

  function setupStartOver() {
    const button = document.querySelector('header .secondary');
    if (!button) return;
    button.removeAttribute('onclick');
    button.addEventListener('click', () => {
      const psw = document.querySelector('.choice[data-role="Personal Support Worker (PSW)"]');
      if (psw) psw.click();
      const province = document.getElementById('province');
      if (province) province.selectedIndex = 0;
      document.querySelectorAll('#needs .need').forEach(x => x.checked = false);
      const presence = document.getElementById('presence');
      if (presence) presence.value = '0';
      const fields = {
        needNotes: '',
        hours: '20',
        pay: '',
        notes: 'Respectful, dependable support in a family home. Clear communication with the family is important.'
      };
      Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.value = value;
      });
      const pay = document.getElementById('pay');
      if (pay) pay.placeholder = 'Enter the rate you are considering';
      const result = document.getElementById('hoursResult');
      if (result) result.style.display = 'none';
      if (typeof window.selectedNeeds !== 'undefined') window.selectedNeeds = [];
      window.go('home');
    });
  }

  function setupPayHandling() {
    const pay = document.getElementById('pay');
    if (!pay) return;
    if (pay.value.trim() === '$24/hour') pay.value = '';
    pay.placeholder = 'Enter the rate you are considering';

    const currentGenerateAll = window.generateAll;
    if (typeof currentGenerateAll !== 'function') return;
    window.generateAll = function() {
      const wasBlank = !pay.value.trim();
      if (wasBlank) pay.value = 'To be agreed';
      try {
        return currentGenerateAll();
      } finally {
        if (wasBlank) pay.value = '';
      }
    };
  }

  enhanceRoleCards();
  setupNeedsValidation();
  setupStartOver();
  setupPayHandling();
})();
