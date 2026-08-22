const cases = (window.AI_CASES_PARTS || []).flat();
const glossary = window.AI_GLOSSARY || {};
const $ = s => document.querySelector(s);

function addOptions(sel, values) {
  values.forEach(v => {
    const o = document.createElement('option');
    o.value = v; o.textContent = v; sel.appendChild(o);
  });
}
addOptions($('#domain'), [...new Set(cases.map(x => x.domain))].sort());
addOptions($('#task'), [...new Set(cases.map(x => x.task))].sort());
addOptions($('#learning'), [...new Set(cases.map(x => x.learning))].sort());

let interviewOnly = false;
const esc = s => String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const badges = arr => arr.map(x => `<span class="badge">${esc(x)}</span>`).join('');

function render() {
  const q = $('#q').value.trim().toLowerCase();
  const d = $('#domain').value, t = $('#task').value, l = $('#learning').value;
  const filtered = cases.filter(x => {
    const hay = JSON.stringify(x).toLowerCase();
    return (!q || hay.includes(q)) && (!d || x.domain === d) && (!t || x.task === t) &&
           (!l || x.learning === l) && (!interviewOnly || x.interview?.length);
  });
  $('#stats').innerHTML = `<span><b>${filtered.length}</b> / ${cases.length} use cases</span><span>•</span>` +
    `<span><b>${new Set(filtered.map(x => x.domain)).size}</b> domain</span><span>•</span>` +
    `<span><b>${Object.keys(glossary).length}</b> concepts trong glossary</span>`;
  $('#cards').innerHTML = filtered.map(x => `
    <article class="card" data-id="${cases.indexOf(x)}">
      <h3>${esc(x.title)}</h3>
      <div class="meta">${esc(x.domain)} · ${esc(x.learning)} · ${esc(x.task)}</div>
      <div class="problem">${esc(x.problem)}</div>
      <div style="margin-top:8px">${badges(x.models.slice(0,3))}</div>
    </article>`).join('') || '<div class="empty">Không có use case phù hợp filter.</div>';
  document.querySelectorAll('.card').forEach(c => c.onclick = () => showCase(+c.dataset.id));
}

function showCase(i) {
  const x = cases[i];
  const pipe = x.pipeline.map((p,j) => `${j+1}. ${p}`).join('\n↓\n');
  $('#detail').innerHTML = `
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
    <h3>Câu interview nên tự trả lời</h3><ol>${x.interview.map(q => `<li>${esc(q)}</li>`).join('')}</ol>`;
  if (window.innerWidth < 1050) $('#detail').scrollIntoView({behavior:'smooth',block:'start'});
}

function showGlossary() {
  const entries = Object.entries(glossary).sort((a,b) => a[0].localeCompare(b[0]));
  $('#detail').innerHTML = `<h2>Concept Glossary</h2><div class="small">Click/search use case để xem concept được áp dụng trong ngữ cảnh thực tế.</div>` +
    entries.map(([k,v]) => `<div class="concept"><b>${esc(k)}</b><div>${esc(v)}</div></div>`).join('');
}

$('#q').oninput = render; $('#domain').onchange = render; $('#task').onchange = render; $('#learning').onchange = render;
$('#reset').onclick = () => { $('#q').value=''; $('#domain').value=''; $('#task').value=''; $('#learning').value=''; interviewOnly=false; $('#interviewMode').textContent='🎤 Chỉ use case có câu interview'; render(); };
$('#randomBtn').onclick = () => showCase(Math.floor(Math.random()*cases.length));
$('#allConcepts').onclick = showGlossary;
$('#interviewMode').onclick = () => { interviewOnly=!interviewOnly; $('#interviewMode').textContent=interviewOnly?'🎤 Interview filter: ON':'🎤 Chỉ use case có câu interview'; render(); };
render(); showCase(0);
