(() => {
  const originalShowCase = window.showCase;
  const originalShowModel = window.showModel;

  function markdownList(items) {
    return (items || []).map(x => `- ${x}`).join('\n');
  }

  function buildUseCaseContext(index) {
    const x = cases[index];
    if (!x) return '';
    const refs = typeof referencesForCase === 'function' ? referencesForCase(x) : [];
    const conceptLines = (x.concepts || []).map(c => {
      const explanation = glossary[c] || '';
      return `- ${c}${explanation ? `: ${explanation}` : ''}`;
    }).join('\n');
    const referenceLines = refs.map(r => `- ${r.title} — ${r.url}`).join('\n');

    return `# CIEL Use Case Context: ${x.title}\n\n` +
      `Type: Use Case\n` +
      `Domain: ${x.domain}\n` +
      `Learning paradigm: ${x.learning}\n` +
      `Task: ${x.task}\n\n` +
      `## Problem\n${x.problem}\n\n` +
      `## Input\n${x.input}\n\n` +
      `## Output\n${x.output}\n\n` +
      `## Candidate models / architectures\n${markdownList(x.models)}\n\n` +
      `## Why this model family / approach\n${x.why_model}\n\n` +
      `## End-to-end pipeline\n${(x.pipeline || []).map((p, i) => `${i + 1}. ${p}`).join('\n')}\n\n` +
      `## Concepts used in this use case\n${conceptLines}\n\n` +
      `## Metrics\n${markdownList(x.metrics)}\n\n` +
      `## Interview questions\n${markdownList(x.interview)}\n\n` +
      `## Suggested / canonical references\n${referenceLines || '- None mapped yet'}\n`;
  }

  function buildModelContext(id) {
    const m = models.find(x => x.id === id);
    if (!m) return '';
    const sourcesText = (m.sources || []).map(s => `- ${s.label}: ${s.url}`).join('\n');

    return `# CIEL Model Training Context: ${m.name}\n\n` +
      `Type: Model Training Recipe\n` +
      `Family: ${m.family}\n` +
      `Year: ${m.year}\n` +
      `Disclosure: ${m.disclosure}\n` +
      `Disclosure note: ${m.status}\n\n` +
      `## Goal\n${m.goal}\n\n` +
      `## Architecture\n${m.architecture}\n\n` +
      `## Training data\n${m.data}\n\n` +
      `## Tokenizer / representation\n${m.tokenizer}\n\n` +
      `## Learning paradigm\n${m.paradigm}\n\n` +
      `## Training objective\n${m.objective}\n\n` +
      `## Loss\n${m.loss}\n\n` +
      `## Optimizer\n${m.optimizer}\n\n` +
      `## Learning-rate / schedule\n${m.schedule}\n\n` +
      `## Batch / context / resolution\n${m.batch_context}\n\n` +
      `## Training stages\n${(m.stages || []).map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\n` +
      `## Hardware / compute\n${m.hardware}\n\n` +
      `## Evaluation\n${m.evaluation}\n\n` +
      `## Why this model mattered\n${m.importance}\n\n` +
      `## Limitations\n${m.limitations}\n\n` +
      `## Officially disclosed\n${markdownList(m.disclosed)}\n\n` +
      `## Not fully disclosed\n${markdownList(m.not_disclosed)}\n\n` +
      `## Concepts to connect\n${markdownList(m.concepts)}\n\n` +
      `## Primary / official sources\n${sourcesText || '- None mapped yet'}\n`;
  }

  async function copyText(text) {
    if (!text) throw new Error('No context available');
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    if (!ok) throw new Error('Copy failed');
  }

  function addCopyButton(type, id) {
    const actions = document.querySelector('#detail .detail-top-actions');
    if (!actions || actions.querySelector('.copy-context-btn')) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'copy-context-btn';
    btn.innerHTML = '<span class="copy-icon" aria-hidden="true">⧉</span><span>Copy context</span>';
    btn.title = 'Copy toàn bộ context dạng Markdown';
    btn.addEventListener('click', async () => {
      const original = btn.innerHTML;
      try {
        const text = type === 'case' ? buildUseCaseContext(Number(id)) : buildModelContext(String(id));
        await copyText(text);
        btn.classList.add('copied');
        btn.innerHTML = '<span aria-hidden="true">✓</span><span>Copied</span>';
      } catch (err) {
        btn.classList.add('copy-error');
        btn.innerHTML = '<span aria-hidden="true">!</span><span>Copy failed</span>';
      }
      window.setTimeout(() => {
        if (!btn.isConnected) return;
        btn.classList.remove('copied', 'copy-error');
        btn.innerHTML = original;
      }, 1500);
    });
    actions.prepend(btn);
  }

  if (typeof originalShowCase === 'function') {
    window.showCase = function(index) {
      originalShowCase(index);
      addCopyButton('case', index);
    };
  }

  if (typeof originalShowModel === 'function') {
    window.showModel = function(id) {
      originalShowModel(id);
      addCopyButton('model', id);
    };
  }

  // app.js renders use case 0 before this enhancement script loads.
  addCopyButton('case', 0);
})();
