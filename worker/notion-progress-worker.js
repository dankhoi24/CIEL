export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '*';
    const cors = {
      'Access-Control-Allow-Origin': env.CIEL_ALLOWED_ORIGIN || origin,
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Vary': 'Origin'
    };

    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });

    try {
      const url = new URL(request.url);
      if (url.pathname !== '/progress') return json({ error: 'Not found' }, 404, cors);
      if (!env.NOTION_TOKEN || !env.NOTION_DATA_SOURCE_ID) {
        return json({ error: 'Missing NOTION_TOKEN or NOTION_DATA_SOURCE_ID' }, 500, cors);
      }

      if (request.method === 'GET') {
        const items = await readAllProgress(env);
        return json({ items }, 200, cors);
      }

      if (request.method === 'POST') {
        const body = await request.json();
        const type = body?.type;
        const id = String(body?.id ?? '');
        const read = Boolean(body?.read);
        if (!['model', 'usecase'].includes(type) || !id) {
          return json({ error: 'Expected {type:model|usecase,id,read}' }, 400, cors);
        }
        const result = await upsertProgress(env, { type, id, read });
        return json(result, 200, cors);
      }

      return json({ error: 'Method not allowed' }, 405, cors);
    } catch (err) {
      return json({ error: err?.message || 'Unknown error' }, 500, cors);
    }
  }
};

function notionHeaders(env) {
  return {
    'Authorization': `Bearer ${env.NOTION_TOKEN}`,
    'Notion-Version': '2025-09-03',
    'Content-Type': 'application/json'
  };
}

async function notion(env, path, options = {}) {
  const res = await fetch(`https://api.notion.com/v1${path}`, {
    ...options,
    headers: { ...notionHeaders(env), ...(options.headers || {}) }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.message || `Notion API ${res.status}`);
  return data;
}

function textValue(prop) {
  if (!prop) return '';
  if (prop.type === 'title') return (prop.title || []).map(x => x.plain_text || '').join('');
  if (prop.type === 'rich_text') return (prop.rich_text || []).map(x => x.plain_text || '').join('');
  return '';
}

function selectValue(prop) {
  return prop?.type === 'select' ? (prop.select?.name || '') : '';
}

function checkboxValue(prop) {
  return prop?.type === 'checkbox' ? Boolean(prop.checkbox) : false;
}

function pageToItem(page) {
  const p = page.properties || {};
  return {
    pageId: page.id,
    id: textValue(p['Item ID']),
    type: selectValue(p['Type']),
    read: checkboxValue(p['Read'])
  };
}

async function readAllProgress(env) {
  let cursor = undefined;
  const items = [];
  do {
    const body = cursor ? { start_cursor: cursor, page_size: 100 } : { page_size: 100 };
    const data = await notion(env, `/data_sources/${env.NOTION_DATA_SOURCE_ID}/query`, {
      method: 'POST',
      body: JSON.stringify(body)
    });
    for (const page of data.results || []) {
      const item = pageToItem(page);
      if (item.id && ['model', 'usecase'].includes(item.type)) items.push(item);
    }
    cursor = data.has_more ? data.next_cursor : undefined;
  } while (cursor);
  return items;
}

async function findPage(env, type, id) {
  const data = await notion(env, `/data_sources/${env.NOTION_DATA_SOURCE_ID}/query`, {
    method: 'POST',
    body: JSON.stringify({
      page_size: 1,
      filter: {
        and: [
          { property: 'Type', select: { equals: type } },
          { property: 'Item ID', rich_text: { equals: id } }
        ]
      }
    })
  });
  return data.results?.[0] || null;
}

async function upsertProgress(env, item) {
  const existing = await findPage(env, item.type, item.id);
  const properties = {
    'Name': { title: [{ text: { content: `${item.type}:${item.id}` } }] },
    'Type': { select: { name: item.type } },
    'Item ID': { rich_text: [{ text: { content: item.id } }] },
    'Read': { checkbox: item.read }
  };

  if (existing) {
    await notion(env, `/pages/${existing.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ properties })
    });
    return { ok: true, action: 'updated' };
  }

  await notion(env, '/pages', {
    method: 'POST',
    body: JSON.stringify({
      parent: { type: 'data_source_id', data_source_id: env.NOTION_DATA_SOURCE_ID },
      properties
    })
  });
  return { ok: true, action: 'created' };
}

function json(value, status, headers) {
  return new Response(JSON.stringify(value), {
    status,
    headers: { ...headers, 'Content-Type': 'application/json; charset=utf-8' }
  });
}
