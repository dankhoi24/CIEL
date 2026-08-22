(() => {
  const cfg = window.CIEL_CONFIG || {};
  const apiBase = String(cfg.progressApiBaseUrl || '').replace(/\/$/, '');
  if (!apiBase) return;

  async function request(path, options = {}) {
    const res = await fetch(`${apiBase}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    if (!res.ok) throw new Error(`Progress API ${res.status}`);
    return res.json();
  }

  function applyRemote(items) {
    if (!Array.isArray(items)) return;

    readModelIds.clear();
    readCaseIds.clear();

    for (const item of items) {
      if (!item || item.read !== true) continue;
      const id = String(item.id);
      if (item.type === 'model' && validModelIds.has(id)) readModelIds.add(id);
      if (item.type === 'usecase' && validCaseIds.has(id)) readCaseIds.add(id);
    }

    saveSet(MODEL_READ_KEY, readModelIds);
    saveSet(CASE_READ_KEY, readCaseIds);

    validModelIds.forEach(id => syncModelReadState(id));
    validCaseIds.forEach(id => syncCaseReadState(id));
    updateProgressLabels();
  }

  async function push(type, id, read) {
    try {
      await request('/progress', {
        method: 'POST',
        body: JSON.stringify({ type, id: String(id), read: Boolean(read) })
      });
    } catch (err) {
      console.warn('CIEL shared progress update failed; localStorage remains active.', err);
    }
  }

  const localSetModelRead = setModelRead;
  const localSetCaseRead = setCaseRead;

  setModelRead = function(id, checked) {
    localSetModelRead(id, checked);
    push('model', id, checked);
  };

  setCaseRead = function(id, checked) {
    localSetCaseRead(id, checked);
    push('usecase', id, checked);
  };

  request('/progress')
    .then(data => applyRemote(data.items || []))
    .catch(err => console.warn('CIEL shared progress unavailable; using localStorage.', err));
})();
