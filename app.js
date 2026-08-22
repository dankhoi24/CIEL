const cases = (window.AI_CASES_PARTS || []).flat();
const glossary = window.AI_GLOSSARY || {};
const sources = window.AI_SOURCES || [];
const sourceLevels = window.AI_SOURCE_LEVELS || {};
const $ = s => document.querySelector(s);

function addOptions(sel, values) {
  values.forEach(v => { const o=document.createElement('option'); o.value=v; o.textContent=v; sel.appendChild(o); });
}
addOptions($('#domain'), [...new Set(cases.map(x=>x.domain))].sort());
addOptions($('#task'), [...new Set(cases.map(x=>x.task))].sort());
addOptions($('#learning'), [...new Set(cases.map(x=>x.learning))].sort());

let interviewOnly=false;
const esc=s=>String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const badges=arr=>arr.map(x=>`<span class="badge">${esc(x)}</span>`).join('');

function caseText(x){ return JSON.stringify(x).toLowerCase(); }
function sourceText(s){ return JSON.stringify(s).toLowerCase(); }
function sourceScore(src,x){
  const hay=caseText(x); let score=0;
  (src.tags||[]).forEach(t=>{ if(hay.includes(String(t).toLowerCase())) score+=3; });
  (src.useFor||[]).forEach(t=>{ if(hay.includes(String(t).toLowerCase())) score+=2; });
  if(src.id==='google-problem-framing') score+=2;
  if(src.id==='ml-design-patterns') score+=1;
  if(src.id==='designing-ml-systems' && !hay.includes('foundation model') && !hay.includes('llm')) score+=1;
  if(src.id==='ai-engineering' && (hay.includes('llm')||hay.includes('foundation model')||hay.includes('rag')||hay.includes('generative'))) score+=4;
  if(src.id==='hf-tasks') score+=1;
  return score;
}
function referencesForCase(x){
  return sources.map(s=>({s,score:sourceScore(s,x)})).filter(z=>z.score>1).sort((a,b)=>b.score-a.score || (a.s.tier>b.s.tier?1:-1)).slice(0,7).map(z=>z.s);
}
function sourceCard(s){
  return `<div class="source-card tier-${esc(s.tier)}">
    <div class="source-head"><span class="source-tier">Tier ${esc(s.tier)}</span><span class="meta">${esc(s.type)} · ${esc(s.year)}</span></div>
    <a class="source-title" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.title)}</a>
    <div class="small">${esc(s.author)}</div>
    <div class="source-role">${esc(s.role)}</div>
    <div>${badges((s.useFor||[]).slice(0,6))}</div>
  </div>`;
}
function sourceResultCard(s){
  return `<article class="card source-result-card" data-source-id="${esc(s.id)}">
    <div class="meta">REFERENCE MATCH · Tier ${esc(s.tier)} · ${esc(s.type)}</div>
    <h3>${esc(s.title)}</h3>
    <div class="problem">${esc(s.role)}</div>
    <div style="margin-top:8px">${badges((s.tags||[]).slice(0,4))}</div>
  </article>`;
}

function render(){
  const q=$('#q').value.trim().toLowerCase(); const d=$('#domain').value,t=$('#task').value,l=$('#learning').value;

  // Important: use-case search is STRICT. A source/paper match must not pull loosely-related
  // use cases into the result set. References are shown as their own result type instead.
  const filtered=cases.filter(x=>(!q||caseText(x).includes(q))&&(!d||x.domain===d)&&(!t||x.task===t)&&(!l||x.learning===l)&&(!interviewOnly||x.interview?.length));
  const sourceHits=q ? sources.filter(s=>sourceText(s).includes(q)) : [];

  $('#stats').innerHTML=`<span><b>${filtered.length}</b> / ${cases.length} use cases</span><span>•</span><span><b>${new Set(filtered.map(x=>x.domain)).size}</b> domain</span><span>•</span><span><b>${Object.keys(glossary).length}</b> concepts</span><span>•</span><span><b>${sources.length}</b> verified references</span>${q?`<span>•</span><span><b>${sourceHits.length}</b> direct source matches</span>`:''}`;

  const sourceHtml=sourceHits.map(sourceResultCard).join('');
  const caseHtml=filtered.map(x=>`<article class="card" data-id="${cases.indexOf(x)}"><h3>${esc(x.title)}</h3><div class="meta">${esc(x.domain)} · ${esc(x.learning)} · ${esc(x.task)}</div><div class="problem">${esc(x.problem)}</div><div style="margin-top:8px">${badges(x.models.slice(0,3))}</div></article>`).join('');

  $('#cards').innerHTML=(sourceHtml+caseHtml) || '<div class="empty">Không có use case hoặc reference phù hợp filter.</div>';
  document.querySelectorAll('.card[data-id]').forEach(c=>c.onclick=()=>showCase(+c.dataset.id));
  document.querySelectorAll('.source-result-card').forEach(c=>c.onclick=()=>showSource(c.dataset.sourceId));
}

function showCase(i){
  const x=cases[i]; const pipe=x.pipeline.map((p,j)=>`${j+1}. ${p}`).join('\n↓\n'); const refs=referencesForCase(x);
  $('#detail').innerHTML=`<h2>${esc(x.title)}</h2><div class="meta">${esc(x.domain)}</div>
    <div class="kv"><b>Problem</b><span>${esc(x.problem)}</span></div><div class="kv"><b>Input</b><span>${esc(x.input)}</span></div><div class="kv"><b>Output</b><span>${esc(x.output)}</span></div><div class="kv"><b>Learning</b><span>${esc(x.learning)}</span></div><div class="kv"><b>Task</b><span>${esc(x.task)}</span></div>
    <h3>Model / architecture có thể dùng</h3><div>${badges(x.models)}</div><div class="concept"><b>Tại sao chọn kiểu model này?</b><div>${esc(x.why_model)}</div></div>
    <h3>Pipeline end-to-end</h3><div class="pipeline">${esc(pipe)}</div>
    <h3>Khái niệm đóng góp vào use case này</h3>${x.concepts.map(c=>`<div class="concept"><b>${esc(c)}</b><div class="small">${esc(glossary[c]||'Khái niệm này là một phần của pipeline/model trong use case.')}</div></div>`).join('')}
    <h3>Metrics</h3><div>${badges(x.metrics)}</div>
    <h3>Canonical / suggested references</h3><div class="small source-note">Tier A dùng để verify method/architecture. Tier B dùng cho framing, design pattern và system thinking. Matching dựa trên task/model/concept của use case.</div>${refs.map(sourceCard).join('')}
    <h3>Câu interview nên tự trả lời</h3><ol>${x.interview.map(q=>`<li>${esc(q)}</li>`).join('')}</ol>`;
  if(window.innerWidth<1050) $('#detail').scrollIntoView({behavior:'smooth',block:'start'});
}

function showSource(id){
  const s=sources.find(x=>x.id===id); if(!s) return;
  $('#detail').innerHTML=`<h2>${esc(s.title)}</h2><div class="meta">Tier ${esc(s.tier)} · ${esc(s.type)} · ${esc(s.year)}</div>
    <div class="kv"><b>Author</b><span>${esc(s.author)}</span></div>
    <h3>CIEL dùng nguồn này để làm gì?</h3><div class="concept"><div>${esc(s.role)}</div></div>
    <h3>Áp dụng cho</h3><div>${badges(s.useFor||[])}</div>
    <h3>Tags</h3><div>${badges(s.tags||[])}</div>
    <h3>Source</h3><div class="source-card tier-${esc(s.tier)}"><a class="source-title" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">Mở nguồn gốc ↗</a></div>
    <div class="small source-note">Nguồn này không tự động kéo các use case chỉ vì có tag gần nhau. Quan hệ model ↔ use case sẽ chỉ được hiển thị khi CIEL có mapping rõ ràng.</div>`;
  if(window.innerWidth<1050) $('#detail').scrollIntoView({behavior:'smooth',block:'start'});
}

function showGlossary(){
  const entries=Object.entries(glossary).sort((a,b)=>a[0].localeCompare(b[0]));
  $('#detail').innerHTML=`<h2>Concept Glossary</h2><div class="small">Search/chọn use case để xem concept được áp dụng trong ngữ cảnh thực tế.</div>`+entries.map(([k,v])=>`<div class="concept"><b>${esc(k)}</b><div>${esc(v)}</div></div>`).join('');
}
function showSources(){
  const q=$('#q').value.trim().toLowerCase();
  const tierOrder={A:0,B:1,C:2};
  const sorted=[...sources].filter(s=>!q||sourceText(s).includes(q)).sort((a,b)=>(tierOrder[a.tier]??9)-(tierOrder[b.tier]??9)||b.year-a.year);
  $('#detail').innerHTML=`<h2>Source Library</h2><div class="source-legend">${Object.entries(sourceLevels).map(([k,v])=>`<div><b>Tier ${esc(k)}</b> — ${esc(v)}</div>`).join('')}</div><div class="small source-note">${q?`Đang lọc source theo: <b>${esc(q)}</b>. `:''}CIEL lưu metadata, vai trò và link nguồn; không sao chép nội dung sách/paper.</div>${sorted.length?sorted.map(sourceCard).join(''):'<div class="empty">Không có source phù hợp.</div>'}`;
}

$('#q').oninput=render; $('#domain').onchange=render; $('#task').onchange=render; $('#learning').onchange=render;
$('#reset').onclick=()=>{$('#q').value='';$('#domain').value='';$('#task').value='';$('#learning').value='';interviewOnly=false;$('#interviewMode').textContent='🎤 Chỉ use case có câu interview';render();};
$('#randomBtn').onclick=()=>showCase(Math.floor(Math.random()*cases.length));
$('#allConcepts').onclick=showGlossary; $('#sourceLibrary').onclick=showSources;
$('#interviewMode').onclick=()=>{interviewOnly=!interviewOnly;$('#interviewMode').textContent=interviewOnly?'🎤 Interview filter: ON':'🎤 Chỉ use case có câu interview';render();};
render(); showCase(0);
