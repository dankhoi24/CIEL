const cases = (window.AI_CASES_PARTS || []).flat();
const glossary = window.AI_GLOSSARY || {};
const sources = window.AI_SOURCES || [];
const sourceLevels = window.AI_SOURCE_LEVELS || {};
const models = window.AI_MODELS || [];
const $ = s => document.querySelector(s);

function addOptions(sel, values) {
  values.forEach(v => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });
}
addOptions($('#domain'), [...new Set(cases.map(x => x.domain))].sort());
addOptions($('#task'), [...new Set(cases.map(x => x.task))].sort());
addOptions($('#learning'), [...new Set(cases.map(x => x.learning))].sort());

let interviewOnly = false;
let currentView = 'usecases';

const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({
  '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
}[m]));
const badges = arr => (arr || []).map(x => `<span class="badge">${esc(x)}</span>`).join('');
const asText = x => JSON.stringify(x).toLowerCase();
const caseText = x => asText(x);
const sourceText = x => asText(x);
const modelText = x => asText(x);

// -----------------------------------------------------------------------------
// Persistent reading progress (local to this browser)
// -----------------------------------------------------------------------------
const MODEL_READ_KEY = 'ciel:model-read:v1';
const CASE_READ_KEY = 'ciel:case-read:v1';
const validModelIds = new Set(models.map(m => m.id));
const validCaseIds = new Set(cases.map((_, i) => String(i)));

function loadSet(key, validIds) {
  try {
    const raw = JSON.parse(localStorage.getItem(key) || '[]');
    return new Set((Array.isArray(raw) ? raw : []).map(String).filter(id => validIds.has(id)));
  } catch (_) {
    return new Set();
  }
}
function saveSet(key, set) {
  try { localStorage.setItem(key, JSON.stringify([...set])); } catch (_) {}
}

let readModelIds = loadSet(MODEL_READ_KEY, validModelIds);
let readCaseIds = loadSet(CASE_READ_KEY, validCaseIds);

const modelReadCount = () => [...readModelIds].filter(id => validModelIds.has(id)).length;
const caseReadCount = () => [...readCaseIds].filter(id => validCaseIds.has(id)).length;
const isModelRead = id => readModelIds.has(String(id));
const isCaseRead = id => readCaseIds.has(String(id));

function setModelRead(id, checked) {
  id = String(id);
  if (!validModelIds.has(id)) return;
  checked ? readModelIds.add(id) : readModelIds.delete(id);
  saveSet(MODEL_READ_KEY, readModelIds);
  syncModelReadState(id);
  updateProgressLabels();
}
function setCaseRead(id, checked) {
  id = String(id);
  if (!validCaseIds.has(id)) return;
  checked ? readCaseIds.add(id) : readCaseIds.delete(id);
  saveSet(CASE_READ_KEY, readCaseIds);
  syncCaseReadState(id);
  updateProgressLabels();
}

function syncModelReadState(id) {
  const safe = CSS.escape(String(id));
  document.querySelectorAll(`.model-read-checkbox[data-model-id="${safe}"]`).forEach(cb => {
    cb.checked = isModelRead(id);
    const label = cb.closest('.read-control')?.querySelector('span');
    if (label) label.textContent = cb.checked ? 'Đã đọc' : 'Chưa đọc';
  });
  document.querySelectorAll(`.model-result-card[data-model-id="${safe}"]`).forEach(card => {
    card.classList.toggle('is-read', isModelRead(id));
  });
}
function syncCaseReadState(id) {
  const safe = CSS.escape(String(id));
  document.querySelectorAll(`.case-read-checkbox[data-case-id="${safe}"]`).forEach(cb => {
    cb.checked = isCaseRead(id);
    const label = cb.closest('.read-control')?.querySelector('span');
    if (label) label.textContent = cb.checked ? 'Đã đọc' : 'Chưa đọc';
  });
  document.querySelectorAll(`.usecase-card[data-case-id="${safe}"]`).forEach(card => {
    card.classList.toggle('is-read', isCaseRead(id));
  });
}
function updateProgressLabels() {
  document.querySelectorAll('[data-model-read-progress]').forEach(el => {
    el.innerHTML = `<b>${modelReadCount()}</b> / ${models.length} models đã đọc`;
  });
  document.querySelectorAll('[data-case-read-progress]').forEach(el => {
    el.innerHTML = `<b>${caseReadCount()}</b> / ${cases.length} use cases đã đọc`;
  });
}

function modelReadControl(m, compact = false) {
  return `<label class="read-control model-read-control ${compact ? 'compact' : ''}" title="Lưu trạng thái trên browser này">
    <input class="model-read-checkbox" data-model-id="${esc(m.id)}" type="checkbox" ${isModelRead(m.id) ? 'checked' : ''}>
    <span>${isModelRead(m.id) ? 'Đã đọc' : 'Chưa đọc'}</span>
  </label>`;
}
function caseReadControl(index, compact = false) {
  return `<label class="read-control case-read-control ${compact ? 'compact' : ''}" title="Lưu trạng thái trên browser này">
    <input class="case-read-checkbox" data-case-id="${index}" type="checkbox" ${isCaseRead(index) ? 'checked' : ''}>
    <span>${isCaseRead(index) ? 'Đã đọc' : 'Chưa đọc'}</span>
  </label>`;
}

document.addEventListener('click', e => {
  if (e.target.closest('.read-control')) e.stopPropagation();
}, true);
document.addEventListener('change', e => {
  const modelCb = e.target.closest('.model-read-checkbox');
  if (modelCb) {
    setModelRead(modelCb.dataset.modelId, modelCb.checked);
    return;
  }
  const caseCb = e.target.closest('.case-read-checkbox');
  if (caseCb) setCaseRead(caseCb.dataset.caseId, caseCb.checked);
});

// -----------------------------------------------------------------------------
// View navigation
// -----------------------------------------------------------------------------
function installUseCasesButton() {
  if ($('#useCasesView')) return;
  const btn = document.createElement('button');
  btn.id = 'useCasesView';
  btn.textContent = '📚 Use Cases';
  const modelBtn = $('#modelLab');
  modelBtn.parentNode.insertBefore(btn, modelBtn);
  btn.onclick = showUseCasesView;
}
function setActiveView(view) {
  currentView = view;
  $('#useCasesView')?.classList.toggle('active-view', view === 'usecases');
  $('#modelLab')?.classList.toggle('active-view', view === 'models');
  // Domain/task/learning filters apply to use cases, so visually mute them in model mode.
  ['#domain', '#task', '#learning', '#interviewMode'].forEach(sel => {
    const el = $(sel);
    if (el) el.classList.toggle('view-disabled', view === 'models');
  });
}
function showUseCasesView() {
  setActiveView('usecases');
  renderUseCases();
  $('#detail').innerHTML = `<h2>📚 Use Cases</h2>
    <div class="concept"><b>Cách dùng</b><div>Chọn một use case để xem problem → input/output → learning paradigm → model → pipeline → metric → references.</div></div>
    <div class="stats progress-summary"><span data-case-read-progress></span><span>•</span><span data-model-read-progress></span></div>`;
  updateProgressLabels();
}
function backToUseCasesButton() {
  return `<button class="inline-back" onclick="showUseCasesView()">← Quay lại Use Cases</button>`;
}
window.showUseCasesView = showUseCasesView;

// -----------------------------------------------------------------------------
// References
// -----------------------------------------------------------------------------
function sourceScore(src, x) {
  const hay = caseText(x);
  let score = 0;
  (src.tags || []).forEach(t => { if (hay.includes(String(t).toLowerCase())) score += 3; });
  (src.useFor || []).forEach(t => { if (hay.includes(String(t).toLowerCase())) score += 2; });
  if (src.id === 'google-problem-framing') score += 2;
  if (src.id === 'ml-design-patterns') score += 1;
  if (src.id === 'designing-ml-systems' && !hay.includes('foundation model') && !hay.includes('llm')) score += 1;
  if (src.id === 'ai-engineering' && (hay.includes('llm') || hay.includes('foundation model') || hay.includes('rag') || hay.includes('generative'))) score += 4;
  if (src.id === 'hf-tasks') score += 1;
  return score;
}
function referencesForCase(x) {
  return sources.map(s => ({s, score: sourceScore(s, x)}))
    .filter(z => z.score > 1)
    .sort((a, b) => b.score - a.score || (a.s.tier > b.s.tier ? 1 : -1))
    .slice(0, 7)
    .map(z => z.s);
}
function sourceCard(s) {
  return `<div class="source-card tier-${esc(s.tier)}">
    <div class="source-head"><span class="source-tier">Tier ${esc(s.tier)}</span><span class="meta">${esc(s.type)} · ${esc(s.year)}</span></div>
    <a class="source-title" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>
    <div class="small">${esc(s.author)}</div>
    <div class="source-role">${esc(s.role)}</div>
    <div>${badges((s.useFor || []).slice(0, 6))}</div>
  </div>`;
}
function sourceResultCard(s) {
  return `<article class="card source-result-card" data-source-id="${esc(s.id)}">
    <div class="meta">REFERENCE MATCH · Tier ${esc(s.tier)} · ${esc(s.type)}</div>
    <h3>${esc(s.title)}</h3>
    <div class="problem">${esc(s.role)}</div>
    <div style="margin-top:8px">${badges((s.tags || []).slice(0, 4))}</div>
  </article>`;
}

// -----------------------------------------------------------------------------
// Cards
// -----------------------------------------------------------------------------
function useCaseCard(x, index) {
  return `<article class="card usecase-card ${isCaseRead(index) ? 'is-read' : ''}" data-id="${index}" data-case-id="${index}">
    <div class="card-top-row">
      <div class="meta">${esc(x.domain)} · ${esc(x.learning)} · ${esc(x.task)}</div>
      ${caseReadControl(index, true)}
    </div>
    <h3>${esc(x.title)}</h3>
    <div class="problem">${esc(x.problem)}</div>
    <div style="margin-top:8px">${badges(x.models.slice(0, 3))}</div>
  </article>`;
}
function modelResultCard(m) {
  return `<article class="card model-result-card ${isModelRead(m.id) ? 'is-read' : ''}" data-model-id="${esc(m.id)}">
    <div class="card-top-row">
      <div class="meta">MODEL TRAINING LAB · ${esc(m.year)} · Disclosure ${esc(m.disclosure)}</div>
      ${modelReadControl(m, true)}
    </div>
    <h3>${esc(m.name)}</h3>
    <div class="problem">${esc(m.family)} — ${esc(m.goal)}</div>
    <div style="margin-top:8px">${badges((m.concepts || []).slice(0, 4))}</div>
  </article>`;
}

function bindCardHandlers() {
  document.querySelectorAll('.usecase-card[data-id]').forEach(c => c.onclick = () => showCase(+c.dataset.id));
  document.querySelectorAll('.source-result-card').forEach(c => c.onclick = () => showSource(c.dataset.sourceId));
  document.querySelectorAll('.model-result-card').forEach(c => c.onclick = () => showModel(c.dataset.modelId));
}

// -----------------------------------------------------------------------------
// Use-case view / global search
// -----------------------------------------------------------------------------
function getFilteredCases() {
  const q = $('#q').value.trim().toLowerCase();
  const d = $('#domain').value;
  const t = $('#task').value;
  const l = $('#learning').value;
  return cases.map((x, index) => ({x, index})).filter(({x}) =>
    (!q || caseText(x).includes(q)) &&
    (!d || x.domain === d) &&
    (!t || x.task === t) &&
    (!l || x.learning === l) &&
    (!interviewOnly || x.interview?.length)
  );
}
function renderUseCases() {
  setActiveView('usecases');
  const q = $('#q').value.trim().toLowerCase();
  const filtered = getFilteredCases();
  const modelMatches = q ? models.filter(m => modelText(m).includes(q)) : [];
  const sourceHits = q ? sources.filter(s => sourceText(s).includes(q)) : [];

  $('#stats').innerHTML = `
    <span><b>${filtered.length}</b> / ${cases.length} use cases</span><span>•</span>
    <span data-case-read-progress></span><span>•</span>
    <span data-model-read-progress></span><span>•</span>
    <span><b>${Object.keys(glossary).length}</b> concepts</span><span>•</span>
    <span><b>${sources.length}</b> verified references</span>
    ${q ? `<span>•</span><span><b>${modelMatches.length}</b> model matches</span><span>•</span><span><b>${sourceHits.length}</b> source matches</span>` : ''}`;

  // Search is global: exact model/source hits are shown first, while use cases remain strict.
  const modelHtml = q ? modelMatches.map(modelResultCard).join('') : '';
  const sourceHtml = q ? sourceHits.map(sourceResultCard).join('') : '';
  const caseHtml = filtered.map(({x, index}) => useCaseCard(x, index)).join('');
  $('#cards').innerHTML = (modelHtml + sourceHtml + caseHtml) || '<div class="empty">Không có model, use case hoặc reference phù hợp.</div>';
  bindCardHandlers();
  updateProgressLabels();
}

function showCase(i) {
  const x = cases[i];
  if (!x) return;
  const pipe = x.pipeline.map((p, j) => `${j + 1}. ${p}`).join('\n↓\n');
  const refs = referencesForCase(x);
  $('#detail').innerHTML = `
    <div class="detail-top-actions">${caseReadControl(i)}</div>
    <h2>${esc(x.title)}</h2><div class="meta">${esc(x.domain)}</div>
    <div class="kv"><b>Problem</b><span>${esc(x.problem)}</span></div>
    <div class="kv"><b>Input</b><span>${esc(x.input)}</span></div>
    <div class="kv"><b>Output</b><span>${esc(x.output)}</span></div>
    <div class="kv"><b>Learning</b><span>${esc(x.learning)}</span></div>
    <div class="kv"><b>Task</b><span>${esc(x.task)}</span></div>
    <h3>Model / architecture có thể dùng</h3><div>${badges(x.models)}</div>
    <div class="concept"><b>Tại sao chọn kiểu model này?</b><div>${esc(x.why_model)}</div></div>
    <h3>Pipeline end-to-end</h3><div class="pipeline">${esc(pipe)}</div>
    <h3>Khái niệm đóng góp vào use case này</h3>
    ${x.concepts.map(c => `<div class="concept"><b>${esc(c)}</b><div class="small">${esc(glossary[c] || 'Khái niệm này là một phần của pipeline/model trong use case.')}</div></div>`).join('')}
    <h3>Metrics</h3><div>${badges(x.metrics)}</div>
    <h3>Canonical / suggested references</h3><div class="small source-note">Tier A dùng để verify method/architecture. Tier B dùng cho framing, design pattern và system thinking.</div>
    ${refs.map(sourceCard).join('')}
    <h3>Câu interview nên tự trả lời</h3><ol>${x.interview.map(q => `<li>${esc(q)}</li>`).join('')}</ol>`;
  syncCaseReadState(i);
  if (window.innerWidth < 1050) $('#detail').scrollIntoView({behavior:'smooth', block:'start'});
}

// -----------------------------------------------------------------------------
// Model Training Lab
// -----------------------------------------------------------------------------
function disclosureClass(level) {
  const v = String(level).toLowerCase();
  if (v.includes('high') && !v.includes('medium')) return 'disclosure-high';
  if (v.includes('medium')) return 'disclosure-medium';
  return 'disclosure-low';
}
function modelField(label, value) {
  return `<div class="model-field"><b>${esc(label)}</b><div>${esc(value || 'Not disclosed')}</div></div>`;
}
function listBlock(title, items, cls = '') {
  if (!items || !items.length) return '';
  return `<h3>${esc(title)}</h3><ul class="model-list ${cls}">${items.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
}
function showModel(id) {
  const m = models.find(x => x.id === id);
  if (!m) return;
  const stageText = (m.stages || []).map((s, i) => `${i + 1}. ${s}`).join('\n↓\n');
  const links = (m.sources || []).map(s => `<a class="source-title" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.label)} ↗</a>`).join('<br>');
  $('#detail').innerHTML = `
    ${backToUseCasesButton()}
    <div class="model-title-row"><div><h2>${esc(m.name)}</h2><div class="meta">${esc(m.family)} · ${esc(m.year)}</div></div><span class="disclosure ${disclosureClass(m.disclosure)}">Disclosure: ${esc(m.disclosure)}</span></div>
    <div class="detail-top-actions">${modelReadControl(m)}</div>
    <div class="model-status">${esc(m.status)}</div>
    ${modelField('Goal', m.goal)}
    ${modelField('Architecture', m.architecture)}
    ${modelField('Training data', m.data)}
    ${modelField('Tokenizer / representation', m.tokenizer)}
    ${modelField('Learning paradigm', m.paradigm)}
    ${modelField('Training objective', m.objective)}
    ${modelField('Loss', m.loss)}
    ${modelField('Optimizer', m.optimizer)}
    ${modelField('LR / schedule', m.schedule)}
    ${modelField('Batch / context / resolution', m.batch_context)}
    <h3>Training stages</h3><div class="pipeline model-pipeline">${esc(stageText)}</div>
    ${modelField('Hardware / compute', m.hardware)}
    ${modelField('Evaluation', m.evaluation)}
    ${modelField('Why this model mattered', m.importance)}
    ${modelField('Limitations', m.limitations)}
    ${listBlock('✅ Officially disclosed', m.disclosed, 'disclosed-list')}
    ${listBlock('❌ Not fully disclosed', m.not_disclosed, 'undisclosed-list')}
    <h3>Concepts to connect</h3><div>${badges(m.concepts || [])}</div>
    <h3>Primary / official sources</h3><div class="source-card tier-A">${links}</div>`;
  syncModelReadState(id);
  if (window.innerWidth < 1050) $('#detail').scrollIntoView({behavior:'smooth', block:'start'});
}
function showModelLab() {
  setActiveView('models');
  const q = $('#q').value.trim().toLowerCase();
  const list = [...models].filter(m => !q || modelText(m).includes(q)).sort((a, b) => b.year - a.year || a.name.localeCompare(b.name));

  $('#stats').innerHTML = `
    <span><b>${list.length}</b> / ${models.length} models</span><span>•</span>
    <span data-model-read-progress></span><span>•</span>
    <span data-case-read-progress></span>`;
  $('#cards').innerHTML = list.map(modelResultCard).join('') || '<div class="empty">Không có model phù hợp search.</div>';
  bindCardHandlers();
  $('#detail').innerHTML = `
    ${backToUseCasesButton()}
    <h2>🧪 Model Training Lab</h2>
    <div class="concept"><b>Mục tiêu</b><div>Học cách các model nổi tiếng thực sự được train: data → representation → objective/loss → backprop → optimizer → schedule → post-training → evaluation.</div></div>
    <div class="source-legend"><div><b>Disclosure High</b> — paper/report công bố phần lớn recipe cốt lõi.</div><div><b>Medium-High</b> — method rõ nhưng data/infrastructure hoặc một số hyperparameter không đủ để replay chính xác.</div></div>
    <div class="small source-note">CIEL không điền các field chưa công bố bằng suy đoán. Mỗi model có mục <b>Officially disclosed</b> và <b>Not fully disclosed</b>.</div>`;
  updateProgressLabels();
}

// -----------------------------------------------------------------------------
// Glossary / sources
// -----------------------------------------------------------------------------
function showSource(id) {
  const s = sources.find(x => x.id === id);
  if (!s) return;
  $('#detail').innerHTML = `<h2>${esc(s.title)}</h2><div class="meta">Tier ${esc(s.tier)} · ${esc(s.type)} · ${esc(s.year)}</div>
    <div class="kv"><b>Author</b><span>${esc(s.author)}</span></div>
    <h3>CIEL dùng nguồn này để làm gì?</h3><div class="concept"><div>${esc(s.role)}</div></div>
    <h3>Áp dụng cho</h3><div>${badges(s.useFor || [])}</div>
    <h3>Tags</h3><div>${badges(s.tags || [])}</div>
    <h3>Source</h3><div class="source-card tier-${esc(s.tier)}"><a class="source-title" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Mở nguồn gốc ↗</a></div>`;
  if (window.innerWidth < 1050) $('#detail').scrollIntoView({behavior:'smooth', block:'start'});
}
function showGlossary() {
  const entries = Object.entries(glossary).sort((a, b) => a[0].localeCompare(b[0]));
  $('#detail').innerHTML = `<h2>Concept Glossary</h2><div class="small">Search/chọn use case để xem concept được áp dụng trong ngữ cảnh thực tế.</div>` + entries.map(([k, v]) => `<div class="concept"><b>${esc(k)}</b><div>${esc(v)}</div></div>`).join('');
}
function showSources() {
  const q = $('#q').value.trim().toLowerCase();
  const tierOrder = {A:0, B:1, C:2};
  const sorted = [...sources].filter(s => !q || sourceText(s).includes(q)).sort((a, b) => (tierOrder[a.tier] ?? 9) - (tierOrder[b.tier] ?? 9) || b.year - a.year);
  $('#detail').innerHTML = `<h2>Source Library</h2><div class="source-legend">${Object.entries(sourceLevels).map(([k, v]) => `<div><b>Tier ${esc(k)}</b> — ${esc(v)}</div>`).join('')}</div><div class="small source-note">${q ? `Đang lọc source theo: <b>${esc(q)}</b>. ` : ''}CIEL lưu metadata, vai trò và link nguồn; không sao chép nội dung sách/paper.</div>${sorted.length ? sorted.map(sourceCard).join('') : '<div class="empty">Không có source phù hợp.</div>'}`;
}

function renderActiveView() {
  if (currentView === 'models') showModelLab(); else renderUseCases();
}

// -----------------------------------------------------------------------------
// Events / startup
// -----------------------------------------------------------------------------
installUseCasesButton();
$('#q').oninput = renderActiveView;
$('#domain').onchange = () => { if (currentView !== 'usecases') showUseCasesView(); else renderUseCases(); };
$('#task').onchange = () => { if (currentView !== 'usecases') showUseCasesView(); else renderUseCases(); };
$('#learning').onchange = () => { if (currentView !== 'usecases') showUseCasesView(); else renderUseCases(); };
$('#reset').onclick = () => {
  $('#q').value = '';
  $('#domain').value = '';
  $('#task').value = '';
  $('#learning').value = '';
  interviewOnly = false;
  $('#interviewMode').textContent = '🎤 Chỉ use case có câu interview';
  renderActiveView();
};
$('#randomBtn').onclick = () => {
  if (currentView !== 'usecases') showUseCasesView();
  showCase(Math.floor(Math.random() * cases.length));
};
$('#allConcepts').onclick = showGlossary;
$('#sourceLibrary').onclick = showSources;
$('#modelLab').onclick = showModelLab;
$('#interviewMode').onclick = () => {
  if (currentView !== 'usecases') showUseCasesView();
  interviewOnly = !interviewOnly;
  $('#interviewMode').textContent = interviewOnly ? '🎤 Interview filter: ON' : '🎤 Chỉ use case có câu interview';
  renderUseCases();
};

setActiveView('usecases');
renderUseCases();
showCase(0);
