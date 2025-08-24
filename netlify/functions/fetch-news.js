// Netlify Function to fetch news from external APIs
const fetch = require('node-fetch');

exports.handler = async (event, context) => {
    // Set CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    try {
        const { q = 'Maranhão', limit = 10 } = event.queryStringParameters || {};
        
        // Try multiple news sources
        const newsAPIs = [
            {
                name: 'NewsAPI',
                url: `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&language=pt&sortBy=publishedAt&pageSize=${limit}&apiKey=${process.env.NEWS_API_KEY}`,
                transform: (data) => data.articles?.map(article => ({
                    id: `newsapi-${Date.now()}-${Math.random()}`,
                    title: article.title,
                    excerpt: article.description || article.content?.substring(0, 150) + '...',
                    content: article.content,
                    image: article.urlToImage || getPlaceholderImage(),
                    url: article.url,
                    source: article.source.name,
                    author: article.author,
                    publishedAt: article.publishedAt,
                    category: inferCategory(article.title + ' ' + (article.description || ''))
                })) || []
            },
            {
                name: 'GNews',
                url: `https://gnews.io/api/v4/search?q=${encodeURIComponent(q)}&lang=pt&country=br&max=${limit}&apikey=${process.env.GNEWS_API_KEY}`,
                transform: (data) => data.articles?.map(article => ({
                    id: `gnews-${Date.now()}-${Math.random()}`,
                    title: article.title,
                    excerpt: article.description || article.content?.substring(0, 150) + '...',
                    content: article.content,
                    image: article.image || getPlaceholderImage(),
                    url: article.url,
                    source: article.source.name,
                    author: 'Redação',
                    publishedAt: article.publishedAt,
                    category: inferCategory(article.title + ' ' + (article.description || ''))
                })) || []
            }
        ];

        let allNews = [];

        // Try each API
        for (const api of newsAPIs) {
            try {
                const response = await fetch(api.url, {
                    headers: {
                        'User-Agent': 'MaranhaoNews/1.0'
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    const transformedNews = api.transform(data);
                    allNews = allNews.concat(transformedNews);
                    
                    if (allNews.length >= limit) {
                        break;
                    }
                }
            } catch (error) {
                console.error(`Error fetching from ${api.name}:`, error);
                continue;
            }
        }

        // If no news found, return fallback
        if (allNews.length === 0) {
            allNews = getFallbackNews(limit);
        }

        // Sort by date and limit results
        allNews.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
        allNews = allNews.slice(0, limit);

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(allNews)
        };

    } catch (error) {
        console.error('Function error:', error);
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify(getFallbackNews(10))
        };
    }
};

function getPlaceholderImage() {
    const images = [
        'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=400&h=300&fit=crop',
        'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop'
    ];
    
    return images[Math.floor(Math.random() * images.length)];
}

function inferCategory(text) {
    const categories = {
        politics: ['política', 'governo', 'prefeito', 'deputado', 'senador', 'eleição', 'assembleia'],
        economy: ['economia', 'investimento', 'empresa', 'negócio', 'mercado', 'emprego', 'desenvolvimento'],
        sports: ['esporte', 'futebol', 'jogo', 'campeonato', 'time', 'atleta', 'sampaio', 'moto club'],
        culture: ['cultura', 'festa', 'arte', 'música', 'teatro', 'tradi��ão', 'bumba meu boi', 'são joão']
    };

    const lowerText = text.toLowerCase();
    
    for (const [category, keywords] of Object.entries(categories)) {
        if (keywords.some(keyword => lowerText.includes(keyword))) {
            return category;
        }
    }
    
    return 'general';
}

function getFallbackNews(limit) {
    const fallbackNews = [
        {
            id: 'fallback-1',
            title: 'Governo do Maranhão anuncia novos investimentos em infraestrutura',
            excerpt: 'O governador anunciou um pacote de investimentos de R$ 500 milhões para melhorar a infraestrutura do estado, incluindo rodovias, pontes e saneamento básico.',
            image: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=300&fit=crop',
            url: '#',
            source: 'MaranhãoNews',
            author: 'Redação',
            publishedAt: new Date().toISOString(),
            category: 'politics'
        },
        {
            id: 'fallback-2',
            title: 'São Luís recebe investimento de R$ 200 milhões em turismo',
            excerpt: 'A capital maranhense será contemplada com novos projetos turísticos que prometem gerar milhares de empregos e atrair mais visitantes.',
            image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            url: '#',
            source: 'MaranhãoNews',
            author: 'Redação',
            publishedAt: new Date(Date.now() - 3600000).toISOString(),
            category: 'economy'
        },
        {
            id: 'fallback-3',
            title: 'Lençóis Maranhenses bate recorde de visitantes em 2024',
            excerpt: 'O parque nacional registrou mais de 300 mil visitantes este ano, superando todas as expectativas e consolidando o Maranhão como destino turístico.',
            image: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=400&h=300&fit=crop',
            url: '#',
            source: 'MaranhãoNews',
            author: 'Redação',
            publishedAt: new Date(Date.now() - 7200000).toISOString(),
            category: 'culture'
        },
        {
            id: 'fallback-4',
            title: 'Sampaio Corrêa se prepara para nova temporada',
            excerpt: 'O time maranhense anunciou a contratação de novos jogadores e promete uma temporada competitiva no campeonato estadual.',
            image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
            url: '#',
            source: 'MaranhãoNews',
            author: 'Redação',
            publishedAt: new Date(Date.now() - 10800000).toISOString(),
            category: 'sports'
        },
        {
            id: 'fallback-5',
            title: 'Festival de Inverno de Bonito movimenta economia local',
            excerpt: 'O evento cultural atraiu milhares de pessoas e gerou uma receita estimada em R$ 5 milhões para a região.',
            image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
            url: '#',
            source: 'MaranhãoNews',
            author: 'Redação',
            publishedAt: new Date(Date.now() - 14400000).toISOString(),
            category: 'culture'
        },
        {
            id: 'fallback-6',
            title: 'Maranhão lidera ranking de energias renováveis no Nordeste',
            excerpt: 'O estado se destaca na produção de energia eólica e solar, contribuindo significativamente para a matriz energética nacional.',
            image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
            url: '#',
            source: 'MaranhãoNews',
            author: 'Redação',
            publishedAt: new Date(Date.now() - 18000000).toISOString(),
            category: 'economy'
        },
        {
            id: 'fallback-7',
            title: 'Assembleia Legislativa aprova novo projeto de lei ambiental',
            excerpt: 'A nova legislação visa proteger os recursos naturais do estado e promover o desenvolvimento sustentável.',
            image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=300&fit=crop',
            url: '#',
            source: 'MaranhãoNews',
            author: 'Redação',
            publishedAt: new Date(Date.now() - 21600000).toISOString(),
            category: 'politics'
        },
        {
            id: 'fallback-8',
            title: 'Porto do Itaqui registra crescimento de 15% na movimentação',
            excerpt: 'O porto maranhense se consolida como um dos principais do país, movimentando milhões de toneladas de carga.',
            image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=400&h=300&fit=crop',
            url: '#',
            source: 'MaranhãoNews',
            author: 'Redação',
            publishedAt: new Date(Date.now() - 25200000).toISOString(),
            category: 'economy'
        },
        {
            id: 'fallback-9',
            title: 'Universidade Federal do Maranhão lança novo curso de tecnologia',
            excerpt: 'A UFMA amplia sua oferta de cursos com foco em inovação e desenvolvimento tecnológico.',
            image: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=300&fit=crop',
            url: '#',
            source: 'MaranhãoNews',
            author: 'Redação',
            publishedAt: new Date(Date.now() - 28800000).toISOString(),
            category: 'general'
        },
        {
            id: 'fallback-10',
            title: 'Carnaval de São Luís promete ser o maior dos últimos anos',
            excerpt: 'A prefeitura anuncia investimentos recordes na festa, com shows de grandes artistas nacionais.',
            image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400&h=300&fit=crop',
            url: '#',
            source: 'MaranhãoNews',
            author: 'Redação',
            publishedAt: new Date(Date.now() - 32400000).toISOString(),
            category: 'culture'
        }
    ];

    return fallbackNews.slice(0, limit);
}