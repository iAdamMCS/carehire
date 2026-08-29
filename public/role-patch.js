(() => {
  const roleTasks = {
    'Personal Support Worker (PSW)': [
      {id:'morning',name:'Morning personal care',frequency:7,minutes:45},
      {id:'bathing',name:'Bathing and grooming assistance',frequency:3,minutes:45},
      {id:'mobility',name:'Mobility or transfer assistance',frequency:7,minutes:20},
      {id:'toileting',name:'Toileting assistance',frequency:7,minutes:15},
      {id:'meals',name:'Meal preparation or eating support',frequency:7,minutes:40},
      {id:'meds',name:'Medication reminders',frequency:7,minutes:10},
      {id:'companionship',name:'Companionship',frequency:3,minutes:90},
      {id:'errands',name:'Appointments and errands',frequency:2,minutes:90}
    ],
    'Housekeeper': [
      {id:'cleaning',name:'General cleaning and tidying',frequency:2,minutes:120},
      {id:'kitchen',name:'Kitchen cleaning and dishes',frequency:3,minutes:45},
      {id:'bathrooms',name:'Bathroom cleaning',frequency:2,minutes:45},
      {id:'laundry',name:'Laundry and linens',frequency:2,minutes:75},
      {id:'floors',name:'Vacuuming and mopping',frequency:2,minutes:60},
      {id:'organizing',name:'Bed making and light organizing',frequency:3,minutes:30},
      {id:'householdErrands',name:'Grocery or household errands',frequency:1,minutes:90},
      {id:'mealPrep',name:'Meal preparation',frequency:3,minutes:45}
    ],
    'Sitter / Companion': [
      {id:'conversation',name:'Companionship and conversation',frequency:3,minutes:120},
      {id:'supervision',name:'Safety supervision or check-ins',frequency:3,minutes:120},
      {id:'snacks',name:'Meal or snack preparation',frequency:3,minutes:30},
      {id:'meds',name:'Medication reminders',frequency:7,minutes:10},
      {id:'walks',name:'Walks or light activities',frequency:3,minutes:45},
      {id:'errands',name:'Appointments and errands',frequency:1,minutes:120},
      {id:'lightHousekeeping',name:'Light housekeeping',frequency:2,minutes:30},
      {id:'respite',name:'Family respite or relief',frequency:2,minutes:180}
    ],
    'Overnight Caregiver': [
      {id:'overnightPresence',name:'Overnight presence',frequency:3,minutes:480},
      {id:'safetyChecks',name:'Scheduled safety checks',frequency:3,minutes:30},
      {id:'overnightToileting',name:'Toileting assistance overnight',frequency:3,minutes:30},
      {id:'overnightMobility',name:'Mobility assistance overnight',frequency:3,minutes:20},
      {id:'bedtime',name:'Bedtime routine support',frequency:3,minutes:45},
      {id:'morningRoutine',name:'Morning routine support',frequency:3,minutes:45},
      {id:'meds',name:'Medication reminders',frequency:3,minutes:10},
      {id:'overnightSnack',name:'Light meal or snack preparation',frequency:3,minutes:20}
    ]
  };

  const roleCopy = {
    'Personal Support Worker (PSW)': { title:'Build the weekly estimate from personal-support tasks.', schedule:'Weekday mornings + 2 evenings', requirements:'First Aid/CPR, references, vulnerable sector check, reliable transportation if travel is part of the role' },
    'Housekeeper': { title:'Build the weekly estimate from household tasks.', schedule:'2–3 daytime visits per week', requirements:'References, experience working in private homes, ability to use agreed household products, reliable transportation if errands are included' },
    'Sitter / Companion': { title:'Build the weekly estimate from companion-support tasks.', schedule:'Weekday afternoons + occasional evenings', requirements:'References, vulnerable sector check if appropriate, First Aid/CPR preferred, reliable transportation if outings are included' },
    'Overnight Caregiver': { title:'Build the weekly estimate from overnight-support tasks.', schedule:'2–3 overnight shifts per week', requirements:'References, vulnerable sector check, First Aid/CPR, experience with overnight support, reliable transportation if required' }
  };

  function initRolePatch() {
    if (window.__carehireRolePatchReady) return;

    function renderRoleTasks(roleName) {
      const list = roleTasks[roleName] || roleTasks['Personal Support Worker (PSW)'];
      state.selectedTasks.clear();
      const picker = document.getElementById('taskPicker');
      if (!picker) return;
      picker.dataset.role = roleName;
      picker.innerHTML = '<h2>What help is needed?</h2>' + list.map(t => `<label class="checkrow"><input type="checkbox" data-role-task="${t.id}"> <span>${t.name}</span></label>`).join('');
      picker.querySelectorAll('[data-role-task]').forEach(input => input.addEventListener('change', () => {
        const t = list.find(x => x.id === input.dataset.roleTask);
        if (input.checked) state.selectedTasks.set(t.id,{...t}); else state.selectedTasks.delete(t.id);
        renderTaskEditor();
      }));
      document.getElementById('taskEditor').hidden = true;
      document.getElementById('taskRows').innerHTML = '';
      document.getElementById('supervisionHours').value = 0;
      document.getElementById('hours').value = '';
      document.getElementById('hoursResult').innerHTML = '';
      const copy = roleCopy[roleName];
      if (copy) {
        document.querySelector('#needs h1').textContent = copy.title;
        document.getElementById('schedule').value = copy.schedule;
        document.getElementById('requirements').value = copy.requirements;
      }
    }

    document.querySelectorAll('#roleChoices .choice').forEach(button => {
      button.addEventListener('click', () => renderRoleTasks(button.dataset.role));
    });

    const baseGo = go;
    go = function(id) {
      if (id === 'needs') {
        const picker = document.getElementById('taskPicker');
        if (picker?.dataset.role !== state.role) renderRoleTasks(state.role);
      }
      return baseGo(id);
    };

    const originalGenerate = generateDocuments;
    generateDocuments = function() {
      originalGenerate();
      const interview = document.getElementById('interviewDoc');
      if (state.role === 'Housekeeper') interview.innerHTML = `<h3>Experience & reliability</h3><ol><li>Tell me about your experience cleaning or maintaining private homes.</li><li>How do you plan your work when several household tasks need to be completed in one visit?</li><li>How do you handle a delay or missed visit?</li></ol><h3>Home preferences</h3><ol><li>How do you make sure you use the household's preferred products and methods?</li><li>How would you handle something that is damaged or unexpectedly needs extra attention?</li></ol><h3>Screening</h3><ol><li>Are you comfortable providing references that we may contact?</li><li>Are you comfortable with the schedule and duties listed in the posting?</li></ol>`;
      else if (state.role === 'Sitter / Companion') interview.innerHTML = `<h3>Experience & approach</h3><ol><li>Tell me about your experience providing companionship or supervision in a private home.</li><li>How do you get to know someone's preferences without taking over their routine?</li><li>What would you do if the person wanted something different from what the family expected?</li></ol><h3>Availability & reliability</h3><ol><li>Does the proposed schedule work consistently for you?</li><li>How do you handle unexpected lateness or a missed visit?</li></ol>`;
      else if (state.role === 'Overnight Caregiver') interview.innerHTML = `<h3>Overnight experience</h3><ol><li>Tell me about your experience providing overnight support in a private home.</li><li>How do you stay alert to agreed overnight needs while respecting privacy and rest?</li><li>What would you do if something changed unexpectedly during the night?</li></ol><h3>Availability & reliability</h3><ol><li>Can you consistently cover the proposed overnight schedule?</li><li>How would you handle being unable to attend an overnight shift?</li></ol>`;
    };

    renderRoleTasks(state.role);
    window.__carehireRolePatchReady = true;
    window.dispatchEvent(new CustomEvent('carehire:role-ready'));
  }

  if (document.readyState === 'complete') setTimeout(initRolePatch,0);
  else window.addEventListener('load', () => setTimeout(initRolePatch,0), { once:true });
})();
