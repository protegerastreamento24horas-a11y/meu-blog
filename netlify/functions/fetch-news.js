/*
 Netlify Function: fetch-news
 - Usa NewsAPI (se NEWSAPI_KEY estiver configurada) para buscar notícias reais
 - Fallback: Google News RSS (sem chave), com parser simples de XML
 - Retorna uma lista padronizada de artigos para o front-end
*/

const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
];

function getFallbackImage() {
  return FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
}

function cleanCDATA(text = '') {
  return text.replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '').trim();
}

function formatDateBR(dateStr) {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function mapNewsAPIArticle(article, idx) {
  return {
    id: idx + 1,
    title: article.title || 'Sem título',
    excerpt: article.description ? `${article.description.substring(0, 120)}...` : 'Notícia sobre política do Maranhão...',
    date: formatDateBR(article.publishedAt || Date.now()),
    image: article.urlToImage || getFallbackImage(),
    url: article.url || '#',
    source: (article.source && article.source.name) ? article.source.name : 'Agência de Notícias'
  };
}

function parseGoogleNewsRSS(xml, limit = 6) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null && items.length < limit) {
    const itemXml = match[1];
    const title = cleanCDATA((itemXml.match(/<title>([\s\S]*?)<\/title>/) || [,''])[1]);
    const link = cleanCDATA((itemXml.match(/<link>([\s\S]*?)<\/link>/) || [,''])[1]);
    const pubDate = cleanCDATA((itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/) || [,''])[1]);
    const description = cleanCDATA((itemXml.match(/<description>([\s\S]*?)<\/description>/) || [,''])[1]);

    items.push({
      id: items.length + 1,
      title: title || 'Sem título',
      excerpt: description ? `${description.substring(0, 120)}...` : 'Notícia sobre política do Maranhão...',
      date: formatDateBR(pubDate || Date.now()),
      image: getFallbackImage(),
      url: link || '#',
      source: 'Google News'
    });
  }
  return items;
}

exports.handler = async (event) => {
  const headers = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  };

  try {
    const params = event.queryStringParameters || {};
    const q = params.q || 'maranhão política';
    const limit = Math.max(1, Math.min(parseInt(params.limit || '6', 10), 20));

    const newsApiKey = process.env.NEWSAPI_KEY || process.env.NEWS_API_KEY || '';

    // 1) NewsAPI se houver chave
    if (newsApiKey) {
      const url = new URL('https://newsapi.org/v2/everything');
      url.searchParams.set('q', q);
      url.searchParams.set('language', 'pt');
      url.searchParams.set('sortBy', 'publishedAt');
      url.searchParams.set('pageSize', String(limit));
      url.searchParams.set('apiKey', newsApiKey);

      const resp = await fetch(url.toString());
      if (!resp.ok) throw new Error(`NewsAPI HTTP ${resp.status}`);
      const data = await resp.json();

      if (Array.isArray(data.articles) && data.articles.length) {
        const mapped = data.articles.slice(0, limit).map(mapNewsAPIArticle);
        return { statusCode: 200, headers, body: JSON.stringify(mapped) };
      }
    }

    // 2) Fallback: Google News RSS
    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(q)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;
    const rssResp = await fetch(rssUrl);
    if (!rssResp.ok) throw new Error(`Google News RSS HTTP ${rssResp.status}`);
    const xml = await rssResp.text();
    const parsed = parseGoogleNewsRSS(xml, limit);

    return { statusCode: 200, headers, body: JSON.stringify(parsed) };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Falha ao obter notícias', detail: err.message })
    };
  }
};
