(() => {
  const configs = {
    'Personal Support Worker (PSW)': {
      nav: '2. Care needs', kicker: 'Care needs', title: 'What personal support is needed in a typical week?',
      lead: 'Choose what applies. We’ll estimate a starting range that you can adjust.',
      placeholder: 'Optional notes about the routine. Keep health details general.', presence: true,
      requirements: 'First Aid/CPR, references, vulnerable sector check, reliable transportation if travel is part of the role',
      schedule: 'Weekday mornings + 2 evenings',
      tasks: [
        ['Morning personal care','Morning personal care',3,5],['Bathing and grooming assistance','Bathing & grooming assistance',2,4],
        ['Mobility or transfer assistance','Mobility / transfer assistance',2,4],['Toileting assistance','Toileting assistance',2,4],
        ['Meal preparation or eating support','Meal preparation / eating support',3,5],['Medication reminders','Medication reminders',1,2],
        ['Companionship','Companionship',2,4],['Appointments and errands','Appointments & errands',2,5]
      ]
    },
    'Housekeeper': {
      nav: '2. Household needs', kicker: 'Household needs', title: 'What household help is needed in a typical week?',
      lead: 'Choose the household tasks you want help with. We’ll estimate a starting range that you can adjust.',
      placeholder: 'Optional notes about the home, cleaning routine, products, pets, or access.', presence: false,
      requirements: 'References, experience working in private homes, ability to use agreed household products, reliable transportation if errands are included',
      schedule: '2–3 daytime visits per week',
      tasks: [
        ['General cleaning and tidying','General cleaning & tidying',2,5],['Kitchen cleaning and dishes','Kitchen cleaning & dishes',2,4],
        ['Bathroom cleaning','Bathroom cleaning',1,3],['Laundry and linens','Laundry & linens',2,4],
        ['Vacuuming and mopping','Vacuuming & mopping',2,4],['Bed making and light organizing','Bed making & light organizing',1,3],
        ['Grocery or household errands','Grocery / household errands',1,4],['Meal preparation','Meal preparation',2,4]
      ]
    },
    'Sitter / Companion': {
      nav: '2. Support needs', kicker: 'Support needs', title: 'What companion support is needed in a typical week?',
      lead: 'Choose what would make visits useful and reassuring. We’ll estimate a starting range that you can adjust.',
      placeholder: 'Optional notes about routines, interests, preferred activities, or visit expectations.', presence: true,
      requirements: 'References, vulnerable sector check if appropriate, First Aid/CPR preferred, reliable transportation if outings are included',
      schedule: 'Weekday afternoons + occasional evenings',
      tasks: [
        ['Companionship and conversation','Companionship & conversation',3,7],['Safety supervision or check-ins','Safety supervision / check-ins',2,8],
        ['Meal or snack preparation','Meal / snack preparation',2,4],['Medication reminders','Medication reminders',1,2],
        ['Walks or light activities','Walks / light activities',2,4],['Appointments and errands','Appointments & errands',2,5],
        ['Light housekeeping','Light housekeeping',1,3],['Family respite or relief','Family respite / relief',3,8]
      ]
    },
    'Overnight Caregiver': {
      nav: '2. Overnight needs', kicker: 'Overnight needs', title: 'What support is needed overnight?',
      lead: 'Choose what applies during an overnight shift. The estimate is only a starting point and should be adjusted to the real schedule.',
      placeholder: 'Optional notes about bedtime, overnight routines, and what the worker should do if help is needed.', presence: false,
      requirements: 'References, vulnerable sector check, First Aid/CPR, experience with overnight support, reliable transportation if required',
      schedule: '2–3 overnight shifts per week',
      tasks: [
        ['Overnight presence','Overnight presence',8,40],['Scheduled safety checks','Scheduled safety checks',1,4],
        ['Toileting assistance overnight','Toileting assistance',1,4],['Mobility assistance overnight','Mobility assistance',1,4],
        ['Bedtime routine support','Bedtime routine support',2,4],['Morning routine support','Morning routine support',2,4],
        ['Medication reminders','Medication reminders',1,2],['Light meal or snack preparation','Light meal / snack preparation',1,3]
      ]
    }
  };

  const needsSection = document.getElementById('needs');
  const checks = needsSection?.querySelector('.checks');
  const presence = document.getElementById('presence');
  const presenceField = presence?.closest('.field');
  const needsNav = document.querySelector('.navbtn[data-nav="needs"]');
  const requirements = document.getElementById('requirements');
  const schedule = document.getElementById('schedule');
  const needNotes = document.getElementById('needNotes');
  const hoursResult = document.getElementById('hoursResult');
  let selectAllButton;

  function updateSelectAllButton() {
    if (!selectAllButton || !checks) return;
    const inputs = [...checks.querySelectorAll('.need')];
    const allSelected = inputs.length > 0 && inputs.every(input => input.checked);
    selectAllButton.textContent = allSelected ? 'Clear all' : 'Select all';
    selectAllButton.setAttribute('aria-pressed', allSelected ? 'true' : 'false');
    selectAllButton.setAttribute('aria-label', allSelected ? 'Clear all tasks' : 'Select all tasks');
  }

  function ensureSelectAllButton() {
    if (!checks || selectAllButton) return;
    const row = document.createElement('div');
    row.className = 'needs-bulk-actions';
    row.style.cssText = 'display:flex;justify-content:flex-end;margin:0 0 12px;';
    selectAllButton = document.createElement('button');
    selectAllButton.type = 'button';
    selectAllButton.className = 'btn secondary';
    selectAllButton.textContent = 'Select all';
    selectAllButton.setAttribute('aria-pressed', 'false');
    row.append(selectAllButton);
    checks.parentNode.insertBefore(row, checks);

    selectAllButton.addEventListener('click', () => {
      const inputs = [...checks.querySelectorAll('.need')];
      const shouldSelect = !inputs.every(input => input.checked);
      inputs.forEach(input => { input.checked = shouldSelect; });
      if (!shouldSelect && typeof selectedNeeds !== 'undefined') selectedNeeds = [];
      if (hoursResult) hoursResult.style.display = 'none';
      updateSelectAllButton();
    });

    checks.addEventListener('change', event => {
      if (event.target.matches('.need')) updateSelectAllButton();
    });
  }

  function renderNeedsForRole(roleName) {
    const config = configs[roleName] || configs['Personal Support Worker (PSW)'];
    if (!checks || !needsSection) return;
    const kicker = needsSection.querySelector('.kicker');
    const title = needsSection.querySelector('h1');
    const lead = needsSection.querySelector('.lead');
    if (kicker) kicker.textContent = config.kicker;
    if (title) title.textContent = config.title;
    if (lead) lead.textContent = config.lead;
    if (needNotes) needNotes.placeholder = config.placeholder;
    if (needsNav) needsNav.innerHTML = `${config.nav}<small>Estimate hours</small>`;
    checks.innerHTML = config.tasks.map(([value,label,min,max]) => `<label class="check"><input type="checkbox" class="need" data-min="${min}" data-max="${max}" value="${value}"> ${label}</label>`).join('');
    if (presence) presence.value = '0';
    if (presenceField) presenceField.style.display = config.presence ? '' : 'none';
    if (hoursResult) hoursResult.style.display = 'none';
    if (typeof selectedNeeds !== 'undefined') selectedNeeds = [];
    if (requirements) requirements.value = config.requirements;
    if (schedule) schedule.value = config.schedule;
    updateSelectAllButton();
  }

  const originalPickRole = window.pickRole;
  window.pickRole = function(el) {
    if (typeof originalPickRole === 'function') originalPickRole(el);
    renderNeedsForRole(el?.dataset?.role || 'Personal Support Worker (PSW)');
  };

  const originalGenerateAll = window.generateAll;
  window.generateAll = function() {
    if (typeof originalGenerateAll === 'function') originalGenerateAll();
    const interviewDoc = document.getElementById('interviewDoc');
    if (!interviewDoc) return;
    const roleName = typeof role !== 'undefined' ? role : 'Personal Support Worker (PSW)';
    if (roleName === 'Housekeeper') interviewDoc.innerHTML = `<h3>Experience & reliability</h3><ol><li>Tell me about your experience cleaning or maintaining private homes.</li><li>How do you plan your work when several household tasks need to be completed in one visit?</li><li>How do you handle a delay or missed visit?</li></ol><h3>Home preferences</h3><ol><li>How do you make sure you use the household's preferred products and methods?</li><li>How would you handle something that is damaged or unexpectedly needs extra attention?</li></ol><h3>Screening</h3><ol><li>Are you comfortable providing references that we may contact?</li><li>Are you comfortable with the schedule, duties, and any agreed checks listed in the posting?</li></ol>`;
    else if (roleName === 'Sitter / Companion') interviewDoc.innerHTML = `<h3>Experience & approach</h3><ol><li>Tell me about your experience providing companionship or supervision in a private home.</li><li>How do you get to know someone's preferences without taking over their routine?</li><li>What would you do if the person wanted something different from what the family expected?</li></ol><h3>Availability & reliability</h3><ol><li>Does the proposed schedule work consistently for you?</li><li>How do you handle unexpected lateness or a missed visit?</li></ol><h3>Screening</h3><ol><li>Are you comfortable providing references that we may contact?</li><li>Are you comfortable completing the checks listed in the posting?</li></ol>`;
    else if (roleName === 'Overnight Caregiver') interviewDoc.innerHTML = `<h3>Overnight experience</h3><ol><li>Tell me about your experience providing overnight support in a private home.</li><li>How do you stay alert to agreed overnight needs while still respecting privacy and rest?</li><li>What would you do if something changed unexpectedly during the night?</li></ol><h3>Availability & reliability</h3><ol><li>Can you consistently cover the proposed overnight schedule?</li><li>How would you handle being unable to attend an overnight shift?</li></ol><h3>Screening</h3><ol><li>Are you comfortable providing references that we may contact?</li><li>What training or certifications do you currently hold that are relevant to this role?</li></ol>`;
  };

  ensureSelectAllButton();
  renderNeedsForRole(document.querySelector('#roleChoices .choice.selected')?.dataset?.role || 'Personal Support Worker (PSW)');
})();
