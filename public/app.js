const state = {
  role: 'Personal Support Worker (PSW)',
  province: 'AB',
  selectedTasks: new Map(),
  statusScore: 0
};

const jurisdictions = {
  AB:{name:'Alberta',wage:'$15/hour for most employees; special rules apply to live-in domestic employees',verified:'2026-08-28',url:'https://www.alberta.ca/minimum-wage'},
  BC:{name:'British Columbia',wage:'$18.25/hour',verified:'2026-08-28',url:'https://www2.gov.bc.ca/gov/content/employment-business/employment-standards-advice/employment-standards/wages/minimum-wage'},
  MB:{name:'Manitoba',wage:'$16.00/hour; scheduled to increase to $16.40 on Oct. 1, 2026',verified:'2026-08-28',url:'https://www.gov.mb.ca/labour/standards/index.html'},
  NB:{name:'New Brunswick',wage:'$15.90/hour',verified:'2026-08-28',url:'https://www.gnb.ca/en/topic/jobs-workplaces/labour-market-workforce/employment-standards/wage-pay.html'},
  NL:{name:'Newfoundland and Labrador',wage:'$16.35/hour',verified:'2026-08-28',url:'https://www.gov.nl.ca/releases/2026/government-services/0226n02/'},
  NS:{name:'Nova Scotia',wage:'$16.75/hour; scheduled to increase to $17.00 on Oct. 1, 2026',verified:'2026-08-28',url:'https://novascotia.ca/just/regulations/regs/lscmwgen.htm'},
  ON:{name:'Ontario',wage:'$17.60/hour; scheduled to increase to $17.95 on Oct. 1, 2026',verified:'2026-08-28',url:'https://www.ontario.ca/document/your-guide-employment-standards-act-0/minimum-wage'},
  PE:{name:'Prince Edward Island',wage:'$17.00/hour; scheduled to increase to $17.30 on Oct. 1, 2026',verified:'2026-08-28',url:'https://www.princeedwardisland.ca/en/information/workforce-and-advanced-learning/minimum-wage-order-board-and-lodging'},
  QC:{name:'Quebec',wage:'$16.60/hour',verified:'2026-08-28',url:'https://www.cnesst.gouv.qc.ca/en/working-conditions/wage-and-pay/wages/minimum-wage'},
  SK:{name:'Saskatchewan',wage:'$15.35/hour; scheduled to increase to $15.70 on Oct. 1, 2026',verified:'2026-08-28',url:'https://www.saskatchewan.ca/business/employment-standards/payment-of-wages-payroll-administration-benefits-and-time-sheets/minimum-wage-and-reporting-for-duty-pay'},
  NT:{name:'Northwest Territories',wage:'$16.95/hour; scheduled to increase to $17.20 on Sept. 1, 2026',verified:'2026-08-28',url:'https://www.ece.gov.nt.ca/en/minimum-wage'},
  NU:{name:'Nunavut',wage:'Check the official labour standards page before setting pay',verified:'2026-08-28',url:'https://www.gov.nu.ca/en/employment-labour-and-workplace-standards'},
  YT:{name:'Yukon',wage:'Check the current official minimum wage before setting pay',verified:'2026-08-28',url:'https://yukon.ca/en/employment/employment-standards/find-out-about-minimum-wage-under-employment-standards-act'}
};

const roleConfigs = {
  'Personal Support Worker (PSW)': {
    needsTitle: 'Build the weekly estimate from personal-support tasks.',
    needsLead: 'Choose the personal-support tasks that apply, then adjust how often they happen and roughly how long each one takes.',
    schedule: 'Weekday mornings + 2 evenings',
    requirements: 'First Aid/CPR, references, vulnerable sector check, reliable transportation if travel is part of the role',
    tasks: [
      {id:'morning',name:'Morning personal care',frequency:7,minutes:45},
      {id:'bathing',name:'Bathing and grooming assistance',frequency:3,minutes:45},
      {id:'mobility',name:'Mobility or transfer assistance',frequency:7,minutes:20},
      {id:'toileting',name:'Toileting assistance',frequency:7,minutes:15},
      {id:'meals',name:'Meal preparation or eating support',frequency:7,minutes:40},
      {id:'meds',name:'Medication reminders',frequency:7,minutes:10},
      {id:'companionship',name:'Companionship',frequency:3,minutes:90},
      {id:'errands',name:'Appointments and errands',frequency:2,minutes:90}
    ]
  },
  'Housekeeper': {
    needsTitle: 'Build the weekly estimate from household tasks.',
    needsLead: 'Choose the household tasks you want help with, then adjust how often they happen and roughly how long each one takes.',
    schedule: '2–3 daytime visits per week',
    requirements: 'References, experience working in private homes, ability to use agreed household products, reliable transportation if errands are included',
    tasks: [
      {id:'cleaning',name:'General cleaning and tidying',frequency:2,minutes:120},
      {id:'kitchen',name:'Kitchen cleaning and dishes',frequency:3,minutes:45},
      {id:'bathrooms',name:'Bathroom cleaning',frequency:2,minutes:45},
      {id:'laundry',name:'Laundry and linens',frequency:2,minutes:75},
      {id:'floors',name:'Vacuuming and mopping',frequency:2,minutes:60},
      {id:'organizing',name:'Bed making and light organizing',frequency:3,minutes:30},
      {id:'householdErrands',name:'Grocery or household errands',frequency:1,minutes:90},
      {id:'mealPrep',name:'Meal preparation',frequency:3,minutes:45}
    ]
  },
  'Sitter / Companion': {
    needsTitle: 'Build the weekly estimate from companion-support tasks.',
    needsLead: 'Choose the companion and supervision tasks that apply, then adjust how often they happen and roughly how long each one takes.',
    schedule: 'Weekday afternoons + occasional evenings',
    requirements: 'References, vulnerable sector check if appropriate, First Aid/CPR preferred, reliable transportation if outings are included',
    tasks: [
      {id:'conversation',name:'Companionship and conversation',frequency:3,minutes:120},
      {id:'supervision',name:'Safety supervision or check-ins',frequency:3,minutes:120},
      {id:'snacks',name:'Meal or snack preparation',frequency:3,minutes:30},
      {id:'meds',name:'Medication reminders',frequency:7,minutes:10},
      {id:'walks',name:'Walks or light activities',frequency:3,minutes:45},
      {id:'errands',name:'Appointments and errands',frequency:1,minutes:120},
      {id:'lightHousekeeping',name:'Light housekeeping',frequency:2,minutes:30},
      {id:'respite',name:'Family respite or relief',frequency:2,minutes:180}
    ]
  },
  'Overnight Caregiver': {
    needsTitle: 'Build the weekly estimate from overnight-support tasks.',
    needsLead: 'Choose the overnight tasks that apply, then adjust the nights per week and time expected for each task.',
    schedule: '2–3 overnight shifts per week',
    requirements: 'References, vulnerable sector check, First Aid/CPR, experience with overnight support, reliable transportation if required',
    tasks: [
      {id:'overnightPresence',name:'Overnight presence',frequency:3,minutes:480},
      {id:'safetyChecks',name:'Scheduled safety checks',frequency:3,minutes:30},
      {id:'overnightToileting',name:'Toileting assistance overnight',frequency:3,minutes:30},
      {id:'overnightMobility',name:'Mobility assistance overnight',frequency:3,minutes:20},
      {id:'bedtime',name:'Bedtime routine support',frequency:3,minutes:45},
      {id:'morningRoutine',name:'Morning routine support',frequency:3,minutes:45},
      {id:'meds',name:'Medication reminders',frequency:3,minutes:10},
      {id:'overnightSnack',name:'Light meal or snack preparation',frequency:3,minutes:20}
    ]
  }
};

const $ = id => document.getElementById(id);
const qsa = selector => [...document.querySelectorAll(selector)];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}

function setStep(id) {
  qsa('.screen').forEach(section => section.classList.toggle('active', section.id === id));
  qsa('.navbtn').forEach(button => {
    const active = button.dataset.nav === id;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'step'); else button.removeAttribute('aria-current');
  });
  if (['job','interview','agreement'].includes(id)) generateDocuments();
  const heading = document.querySelector(`#${id} h1`);
  if (heading) {
    heading.tabIndex = -1;
    heading.focus({preventScroll:true});
  }
  window.scrollTo({top:0,behavior:'smooth'});
}

function setupNavigation() {
  qsa('[data-next]').forEach(button => button.addEventListener('click', () => setStep(button.dataset.next)));
  qsa('.navbtn').forEach(button => button.addEventListener('click', () => setStep(button.dataset.nav)));
}

function setupRoles() {
  qsa('#roleChoices .choice').forEach(button => button.addEventListener('click', () => {
    qsa('#roleChoices .choice').forEach(x => x.classList.remove('selected'));
    button.classList.add('selected');
    state.role = button.dataset.role;
    renderRoleTasks({clear:true});
  }));
}

function setupJurisdictions() {
  const select = $('province');
  select.innerHTML = '';
  Object.entries(jurisdictions).forEach(([code,j]) => {
    const option = document.createElement('option');
    option.value = code;
    option.textContent = j.name;
    select.append(option);
  });
  select.value = state.province;
  select.addEventListener('change', () => {
    state.province = select.value;
    renderProvinceRule();
  });
  renderProvinceRule();
}

function renderProvinceRule() {
  const j = jurisdictions[state.province];
  $('provinceRule').innerHTML = `<strong>${escapeHtml(j.name)} reference:</strong> ${escapeHtml(j.wage)}. <a href="${j.url}" target="_blank" rel="noopener">Verify on the official government site</a>. <small>Reference checked ${j.verified}; special rules and exemptions may apply.</small>`;
}

function renderRoleTasks({clear = false} = {}) {
  const config = roleConfigs[state.role];
  if (clear) state.selectedTasks.clear();
  $('needs-title').textContent = config.needsTitle;
  document.querySelector('#needs .lead').textContent = `${config.needsLead} CareHire only does the arithmetic—it is not a clinical assessment.`;
  $('schedule').value = config.schedule;
  $('requirements').value = config.requirements;
  const picker = $('taskPicker');
  picker.innerHTML = '<h2>What help is needed?</h2>' + config.tasks.map(task => {
    const selected = state.selectedTasks.has(task.id) ? ' checked' : '';
    return `<label class="checkrow"><input type="checkbox" data-task="${task.id}"${selected}> <span>${escapeHtml(task.name)}</span></label>`;
  }).join('');
  picker.querySelectorAll('[data-task]').forEach(input => input.addEventListener('change', () => {
    const task = config.tasks.find(x => x.id === input.dataset.task);
    if (input.checked) state.selectedTasks.set(task.id,{...task}); else state.selectedTasks.delete(task.id);
    renderTaskEditor();
  }));
  renderTaskEditor();
}

function renderTaskEditor() {
  const editor = $('taskEditor');
  editor.hidden = state.selectedTasks.size === 0;
  const body = $('taskRows');
  body.innerHTML = '';
  for (const task of state.selectedTasks.values()) {
    const row = document.createElement('tr');
    row.innerHTML = `<td>${escapeHtml(task.name)}</td><td><input aria-label="Times per week for ${escapeHtml(task.name)}" type="number" min="0" max="35" step="1" value="${task.frequency}" data-frequency="${task.id}"></td><td><input aria-label="Minutes each for ${escapeHtml(task.name)}" type="number" min="0" max="480" step="5" value="${task.minutes}" data-minutes="${task.id}"></td><td data-total="${task.id}"></td>`;
    body.append(row);
  }
  body.querySelectorAll('input').forEach(input => input.addEventListener('input', event => {
    const id = event.target.dataset.frequency || event.target.dataset.minutes;
    const task = state.selectedTasks.get(id);
    if (!task) return;
    if (event.target.dataset.frequency) task.frequency = Number(event.target.value || 0);
    if (event.target.dataset.minutes) task.minutes = Number(event.target.value || 0);
    calculateHours();
  }));
  calculateHours();
}

function calculateHours() {
  let minutes = 0;
  for (const task of state.selectedTasks.values()) {
    const taskHours = task.frequency * task.minutes / 60;
    minutes += task.frequency * task.minutes;
    const cell = document.querySelector(`[data-total="${task.id}"]`);
    if (cell) cell.textContent = `${taskHours.toFixed(1)} h`;
  }
  const supervision = Number($('supervisionHours').value || 0);
  const hours = Math.round((minutes / 60 + supervision) * 2) / 2;
  $('hours').value = hours || '';
  $('hoursResult').innerHTML = state.selectedTasks.size
    ? `<div class="big-number">${hours.toFixed(1)} hrs/week</div><div>Task time + supervision/presence entered above. Adjust anything that does not fit the real routine.</div>`
    : '<strong>Select at least one task to build the estimate.</strong>';
}

function roleInterviewHtml(duties) {
  if (state.role === 'Housekeeper') return `<h3>Experience & reliability</h3><ol><li>Tell me about your experience cleaning or maintaining private homes.</li><li>How do you plan your work when several household tasks need to be completed in one visit?</li><li>How do you handle a delay or missed visit?</li></ol><h3>Home preferences</h3><ol><li>How do you make sure you use the household's preferred products and methods?</li><li>How would you handle something that is damaged or unexpectedly needs extra attention?</li></ol><h3>Screening</h3><ol><li>Are you comfortable providing references that we may contact?</li><li>Are you comfortable with the schedule and duties listed in the posting?</li></ol>`;
  if (state.role === 'Sitter / Companion') return `<h3>Experience & approach</h3><ol><li>Tell me about your experience providing companionship or supervision in a private home.</li><li>How do you get to know someone's preferences without taking over their routine?</li><li>What would you do if the person wanted something different from what the family expected?</li></ol><h3>Availability & reliability</h3><ol><li>Does the proposed schedule work consistently for you?</li><li>How do you handle unexpected lateness or a missed visit?</li></ol><h3>Screening</h3><ol><li>Are you comfortable providing references that we may contact?</li><li>Are you comfortable completing the checks listed in the posting?</li></ol>`;
  if (state.role === 'Overnight Caregiver') return `<h3>Overnight experience</h3><ol><li>Tell me about your experience providing overnight support in a private home.</li><li>How do you stay alert to agreed overnight needs while respecting privacy and rest?</li><li>What would you do if something changed unexpectedly during the night?</li></ol><h3>Availability & reliability</h3><ol><li>Can you consistently cover the proposed overnight schedule?</li><li>How would you handle being unable to attend an overnight shift?</li></ol><h3>Screening</h3><ol><li>Are you comfortable providing references that we may contact?</li><li>What training or certifications do you currently hold that are relevant to this role?</li></ol>`;
  const mobility = duties.some(x => /mobility|bathing|transfer/i.test(x));
  return `<h3>Experience & qualifications</h3><ol><li>Tell me about your experience providing support similar to this role.</li><li>What training or certifications do you currently hold?</li>${mobility ? '<li>What training and experience do you have with safe mobility or transfer assistance?</li>' : ''}</ol><h3>Availability & reliability</h3><ol><li>Does the proposed schedule work consistently for you?</li><li>How do you handle unexpected lateness or a missed shift?</li></ol><h3>Approach to care</h3><ol><li>How do you support someone while respecting their independence, privacy and choices?</li><li>Tell me about a time you adapted when a routine did not go as planned.</li></ol><h3>Screening</h3><ol><li>Are you comfortable providing references that we may contact?</li><li>Are you comfortable completing the checks or certifications listed in the posting?</li></ol>`;
}

function generateDocuments() {
  const province = jurisdictions[$('province').value];
  const duties = [...state.selectedTasks.values()].map(task => task.name);
  const hours = $('hours').value || '___';
  const pay = $('pay').value.trim() || 'To be agreed';
  const schedule = $('schedule').value.trim() || 'To be agreed';
  const arrangement = $('live').value;
  const requirements = $('requirements').value.trim() || 'References and qualifications appropriate to the role';
  const notes = $('notes').value.trim() || 'Respectful, dependable support and clear communication with the family';
  const items = (duties.length ? duties : ['Duties to be confirmed with the family']).map(x => `<li>${escapeHtml(x)}</li>`).join('');
  $('jobDoc').innerHTML = `<h2>${escapeHtml(state.role)} — Family Home</h2><p><strong>Province/territory:</strong> ${province.name}<br><strong>Arrangement:</strong> ${escapeHtml(arrangement)}<br><strong>Hours:</strong> About ${escapeHtml(hours)} per week</p><h3>About the role</h3><p>We are looking for a dependable and respectful ${escapeHtml(state.role.toLowerCase())} to provide practical support in a family home.</p><h3>What you will help with</h3><ul>${items}</ul><h3>Schedule and pay</h3><p>${escapeHtml(schedule)}. Proposed compensation: ${escapeHtml(pay)}.</p><h3>What we are looking for</h3><p>${escapeHtml(requirements)}.</p><h3>Home and work expectations</h3><p>${escapeHtml(notes)}.</p><hr><small>Keep public postings general. Share private health information only when it is necessary and appropriate after a candidate is being considered.</small>`;
  $('interviewDoc').innerHTML = roleInterviewHtml(duties);
  $('agreementDoc').innerHTML = `<h2>Work Agreement Draft</h2><p>This agreement is between <strong>____________________</strong> (“the family/hirer”) and <strong>____________________</strong> (“the worker”).</p><h3>1. Role and duties</h3><p>The worker will provide support as a ${escapeHtml(state.role)}. Expected duties include ${escapeHtml(duties.join(', ') || 'duties agreed by the parties')}. Major changes to duties should be discussed and agreed before they become regular expectations.</p><h3>2. Schedule</h3><p>Expected schedule: ${escapeHtml(schedule)}, approximately ${escapeHtml(hours)} hours per week. The parties will discuss changes as early as reasonably possible.</p><h3>3. Pay</h3><p>Agreed rate: ${escapeHtml(pay)}. Payment frequency: ____________________.</p><h3>4. Expenses</h3><p>Pre-approved work-related expenses will be reimbursed when reasonable documentation is provided.</p><h3>5. Privacy, dignity and home expectations</h3><p>The worker will respect the privacy, dignity, home, belongings and personal information of the person receiving support and the family.</p><h3>6. Ending the arrangement</h3><p>Either party may end the working arrangement subject to any minimum notice, termination pay or other requirements that apply under ${province.name} law and the actual employment relationship.</p><h3>7. Employment status and legal requirements</h3><p>The parties understand that employment status depends on the actual working relationship. The family/hirer will review current federal and ${province.name} requirements before signing.</p><h3>8. Changes to this agreement</h3><p>Changes should be recorded in writing and agreed by both parties.</p><h3>Signatures</h3><p>Family/Hirer: ____________________ &nbsp; Date: __________</p><p>Worker: _________________________ &nbsp; Date: __________</p><hr><small>CareHire provides general drafting and informational support only. It does not provide legal advice. Review current official requirements or obtain professional advice before finalizing an agreement.</small>`;
}

function setupStatusCheck() {
  qsa('[data-status-weight]').forEach(input => input.addEventListener('change', renderStatus));
  renderStatus();
}

function renderStatus() {
  state.statusScore = qsa('[data-status-weight]:checked').reduce((sum,input) => sum + Number(input.dataset.statusWeight), 0);
  const result = $('statusResult');
  if (state.statusScore >= 2) result.innerHTML = '<strong>This arrangement may look more like employment.</strong><br>That can involve payroll deductions, CPP/EI and other employer obligations. Review CRA and provincial guidance before hiring.';
  else if (state.statusScore <= -1) result.innerHTML = '<strong>This arrangement may have features of an independent business relationship.</strong><br>Employment status still depends on the full facts, not the label in a contract.';
  else result.innerHTML = '<strong>The answer is not clear from these questions alone.</strong><br>Review the CRA guidance or obtain advice before deciding how to structure the relationship.';
}

async function startVoice(targetId, button) {
  const status = document.querySelector(`[data-voice-status="${targetId}"]`);
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    status.textContent = 'Voice recording is not supported in this browser. Please type your answer.';
    return;
  }
  try {
    status.textContent = 'Listening… press Stop when finished.';
    button.textContent = '■ Stop recording';
    button.classList.add('recording');
    const stream = await navigator.mediaDevices.getUserMedia({audio:true});
    const chunks = [];
    const recorder = new MediaRecorder(stream);
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    recorder.onstop = async () => {
      stream.getTracks().forEach(track => track.stop());
      button.textContent = '🎙 Speak instead';
      button.classList.remove('recording');
      status.textContent = 'Transcribing…';
      const blob = new Blob(chunks,{type:recorder.mimeType || 'audio/webm'});
      if (blob.size > 6 * 1024 * 1024) {
        status.textContent = 'That recording was too long. Please try a shorter answer.';
        return;
      }
      try {
        const audioBase64 = await blobToBase64(blob);
        const response = await fetch('/api/voice/transcribe',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({audioBase64,mimeType:blob.type,languageHint:'en-CA'})});
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Transcription failed');
        const target = $(targetId);
        target.value = [target.value.trim(),data.transcript].filter(Boolean).join(target.value.trim() ? ' ' : '');
        target.dispatchEvent(new Event('input',{bubbles:true}));
        status.textContent = 'Added from voice. Please review the text before continuing.';
      } catch (error) {
        status.textContent = `${error.message}. You can continue by typing.`;
      }
    };
    button._carehireRecorder = recorder;
    recorder.start(250);
  } catch {
    button.textContent = '🎙 Speak instead';
    button.classList.remove('recording');
    status.textContent = 'Microphone access was not available. You can continue by typing.';
  }
}

function setupVoice() {
  qsa('[data-voice-target]').forEach(button => button.addEventListener('click', () => {
    if (button._carehireRecorder?.state === 'recording') button._carehireRecorder.stop();
    else startVoice(button.dataset.voiceTarget,button);
  }));
  qsa('[data-speak]').forEach(button => button.addEventListener('click', () => {
    if (!window.speechSynthesis) return;
    speechSynthesis.cancel();
    speechSynthesis.speak(new SpeechSynthesisUtterance($(button.dataset.speak).innerText));
  }));
}

function blobToBase64(blob) {
  return new Promise((resolve,reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function collectDraft() {
  return {role:state.role,province:state.province,tasks:[...state.selectedTasks.values()],supervisionHours:$('supervisionHours').value,needNotes:$('needNotes').value,hours:$('hours').value,pay:$('pay').value,schedule:$('schedule').value,live:$('live').value,requirements:$('requirements').value,notes:$('notes').value};
}

function restoreDraft() {
  const raw = localStorage.getItem('carehire.draft.v1');
  if (!raw) return;
  try {
    const draft = JSON.parse(raw);
    if (roleConfigs[draft.role]) state.role = draft.role;
    if (jurisdictions[draft.province]) state.province = draft.province;
    qsa('#roleChoices .choice').forEach(button => button.classList.toggle('selected', button.dataset.role === state.role));
    $('province').value = state.province;
    renderProvinceRule();
    state.selectedTasks.clear();
    for (const task of Array.isArray(draft.tasks) ? draft.tasks : []) state.selectedTasks.set(task.id,task);
    renderRoleTasks();
    const values = {supervisionHours:draft.supervisionHours,needNotes:draft.needNotes,hours:draft.hours,pay:draft.pay,schedule:draft.schedule,live:draft.live,requirements:draft.requirements,notes:draft.notes};
    Object.entries(values).forEach(([id,value]) => { if ($(id) && value != null) $(id).value = value; });
    renderTaskEditor();
  } catch {
    localStorage.removeItem('carehire.draft.v1');
  }
}

function setupUtilities() {
  qsa('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    await navigator.clipboard.writeText($(button.dataset.copy).innerText);
    const old = button.textContent;
    button.textContent = 'Copied';
    setTimeout(() => button.textContent = old,1400);
  }));
  $('printAgreement').addEventListener('click', () => window.print());
  $('saveDraft').addEventListener('click', () => {
    localStorage.setItem('carehire.draft.v1',JSON.stringify(collectDraft()));
    $('saveDraft').textContent = 'Saved on this device';
  });
  $('clearLocal').addEventListener('click', () => {
    localStorage.removeItem('carehire.draft.v1');
    alert('Saved CareHire draft removed from this browser.');
  });
}

function init() {
  setupNavigation();
  setupRoles();
  setupJurisdictions();
  $('supervisionHours').addEventListener('input',calculateHours);
  renderRoleTasks({clear:true});
  setupStatusCheck();
  setupVoice();
  setupUtilities();
  restoreDraft();
}

init();
