// MaranhãoNews - Professional News Portal JavaScript
class NewsPortal {
    constructor() {
        this.newsCache = new Map();
        this.weatherCache = null;
        this.updateInterval = 5 * 60 * 1000; // 5 minutes
        this.currentCategory = 'all';
        this.newsOffset = 0;
        this.newsPerPage = 10;
        this.isLoading = false;
        
        // API Keys (In production, these should be environment variables)
        this.newsAPIKey = 'demo'; // Replace with actual API key
        this.weatherAPIKey = 'demo'; // Replace with actual API key
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.showLoadingOverlay();
        
        try {
            await Promise.all([
                this.loadBreakingNews(),
                this.loadFeaturedNews(),
                this.loadNews(),
                this.loadWeather(),
                this.loadTrendingTopics()
            ]);
            
            this.startAutoUpdate();
            this.updateStats();
        } catch (error) {
            console.error('Error initializing portal:', error);
            this.showError('Erro ao carregar o portal. Tentando novamente...');
            setTimeout(() => this.init(), 5000);
        } finally {
            this.hideLoadingOverlay();
        }
    }

    setupEventListeners() {
        // Search functionality
        const searchToggle = document.querySelector('.search-toggle');
        const searchOverlay = document.getElementById('search-overlay');
        const searchClose = document.querySelector('.search-close');
        const searchInput = document.querySelector('.search-input');

        searchToggle?.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            searchInput.focus();
        });

        searchClose?.addEventListener('click', () => {
            searchOverlay.classList.remove('active');
        });

        searchInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.performSearch(e.target.value);
                searchOverlay.classList.remove('active');
            }
        });

        // Category filters
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.currentCategory = btn.dataset.category;
                this.newsOffset = 0;
                this.loadNews();
            });
        });

        // Load more button
        const loadMoreBtn = document.getElementById('load-more');
        loadMoreBtn?.addEventListener('click', () => {
            this.newsOffset += this.newsPerPage;
            this.loadNews(true);
        });

        // Refresh buttons
        document.getElementById('refresh-featured')?.addEventListener('click', () => {
            this.loadFeaturedNews();
        });

        // Newsletter form
        const newsletterForm = document.getElementById('newsletter-form');
        newsletterForm?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.subscribeNewsletter(new FormData(e.target));
        });

        // Back to top button
        const backToTop = document.getElementById('back-to-top');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop?.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        // Mobile menu toggle
        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const navMenu = document.querySelector('.nav-menu');
        
        mobileToggle?.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        // Close search on escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                searchOverlay.classList.remove('active');
            }
        });
    }

    async loadBreakingNews() {
        try {
            const news = await this.fetchNews('breaking', 1);
            const breakingText = document.getElementById('breaking-text');
            
            if (news.length > 0) {
                breakingText.textContent = news[0].title;
            } else {
                breakingText.textContent = 'Acompanhe as últimas notícias do Maranhão em tempo real';
            }
        } catch (error) {
            console.error('Error loading breaking news:', error);
            document.getElementById('breaking-text').textContent = 'Erro ao carregar notícias urgentes';
        }
    }

    async loadFeaturedNews() {
        try {
            const news = await this.fetchNews('featured', 6);
            this.renderFeaturedNews(news);
        } catch (error) {
            console.error('Error loading featured news:', error);
            this.renderFeaturedNews(this.getFallbackNews(6));
        }
    }

    async loadNews(append = false) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        const loadMoreBtn = document.getElementById('load-more');
        
        try {
            if (!append) {
                this.showNewsLoading();
            } else {
                loadMoreBtn.textContent = 'Carregando...';
                loadMoreBtn.disabled = true;
            }

            const news = await this.fetchNews(this.currentCategory, this.newsPerPage, this.newsOffset);
            this.renderNews(news, append);
            
        } catch (error) {
            console.error('Error loading news:', error);
            if (!append) {
                this.renderNews(this.getFallbackNews(this.newsPerPage), false);
            }
        } finally {
            this.isLoading = false;
            loadMoreBtn.textContent = 'Carregar mais notícias';
            loadMoreBtn.disabled = false;
            this.hideNewsLoading();
        }
    }

    async fetchNews(category = 'all', limit = 10, offset = 0) {
        const cacheKey = `${category}-${limit}-${offset}`;
        
        // Check cache first
        if (this.newsCache.has(cacheKey)) {
            const cached = this.newsCache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.updateInterval) {
                return cached.data;
            }
        }

        try {
            // Try to fetch from NewsAPI
            const query = this.getCategoryQuery(category);
            const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=pt&sortBy=publishedAt&pageSize=${limit}&page=${Math.floor(offset / limit) + 1}&apiKey=${this.newsAPIKey}`);
            
            if (response.ok) {
                const data = await response.json();
                const processedNews = this.processNewsData(data.articles);
                
                // Cache the result
                this.newsCache.set(cacheKey, {
                    data: processedNews,
                    timestamp: Date.now()
                });
                
                return processedNews;
            }
        } catch (error) {
            console.error('NewsAPI error:', error);
        }

        // Fallback to local news
        return this.getFallbackNews(limit, category);
    }

    getCategoryQuery(category) {
        const queries = {
            all: 'Maranhão OR "São Luís" OR "Imperatriz" OR "Caxias"',
            politics: 'Maranhão política OR governador OR assembleia legislativa',
            economy: 'Maranhão economia OR desenvolvimento OR investimento',
            sports: 'Maranhão esporte OR futebol OR "Sampaio Corrêa" OR "Moto Club"',
            culture: 'Maranhão cultura OR festa OR tradição OR "bumba meu boi"',
            breaking: 'Maranhão urgente OR última hora'
        };
        
        return queries[category] || queries.all;
    }

    processNewsData(articles) {
        return articles.map((article, index) => ({
            id: `news-${Date.now()}-${index}`,
            title: article.title,
            excerpt: article.description || article.content?.substring(0, 150) + '...',
            content: article.content,
            image: article.urlToImage || this.getPlaceholderImage(),
            url: article.url,
            source: article.source.name,
            author: article.author,
            publishedAt: new Date(article.publishedAt),
            category: this.inferCategory(article.title + ' ' + article.description)
        }));
    }

    inferCategory(text) {
        const categories = {
            politics: ['política', 'governo', 'prefeito', 'deputado', 'senador', 'eleição'],
            economy: ['economia', 'investimento', 'empresa', 'negócio', 'mercado', 'emprego'],
            sports: ['esporte', 'futebol', 'jogo', 'campeonato', 'time', 'atleta'],
            culture: ['cultura', 'festa', 'arte', 'música', 'teatro', 'tradição']
        };

        const lowerText = text.toLowerCase();
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => lowerText.includes(keyword))) {
                return category;
            }
        }
        
        return 'general';
    }

    getFallbackNews(limit, category = 'all') {
        const fallbackNews = [
            {
                id: 'fallback-1',
                title: 'Governo do Maranhão anuncia novos investimentos em infraestrutura',
                excerpt: 'O governador anunciou um pacote de investimentos de R$ 500 milhões para melhorar a infraestrutura do estado, incluindo rodovias, pontes e saneamento básico.',
                image: 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=300&fit=crop',
                url: '#',
                source: 'MaranhãoNews',
                publishedAt: new Date(),
                category: 'politics'
            },
            {
                id: 'fallback-2',
                title: 'São Luís recebe investimento de R$ 200 milhões em turismo',
                excerpt: 'A capital maranhense será contemplada com novos projetos turísticos que prometem gerar milhares de empregos e atrair mais visitantes.',
                image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
                url: '#',
                source: 'MaranhãoNews',
                publishedAt: new Date(Date.now() - 3600000),
                category: 'economy'
            },
            {
                id: 'fallback-3',
                title: 'Lençóis Maranhenses bate recorde de visitantes em 2024',
                excerpt: 'O parque nacional registrou mais de 300 mil visitantes este ano, superando todas as expectativas e consolidando o Maranhão como destino turístico.',
                image: 'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=400&h=300&fit=crop',
                url: '#',
                source: 'MaranhãoNews',
                publishedAt: new Date(Date.now() - 7200000),
                category: 'culture'
            },
            {
                id: 'fallback-4',
                title: 'Sampaio Corrêa se prepara para nova temporada',
                excerpt: 'O time maranhense anunciou a contratação de novos jogadores e promete uma temporada competitiva no campeonato estadual.',
                image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
                url: '#',
                source: 'MaranhãoNews',
                publishedAt: new Date(Date.now() - 10800000),
                category: 'sports'
            },
            {
                id: 'fallback-5',
                title: 'Festival de Inverno de Bonito movimenta economia local',
                excerpt: 'O evento cultural atraiu milhares de pessoas e gerou uma receita estimada em R$ 5 milhões para a região.',
                image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop',
                url: '#',
                source: 'MaranhãoNews',
                publishedAt: new Date(Date.now() - 14400000),
                category: 'culture'
            },
            {
                id: 'fallback-6',
                title: 'Maranhão lidera ranking de energias renováveis no Nordeste',
                excerpt: 'O estado se destaca na produção de energia eólica e solar, contribuindo significativamente para a matriz energética nacional.',
                image: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=400&h=300&fit=crop',
                url: '#',
                source: 'MaranhãoNews',
                publishedAt: new Date(Date.now() - 18000000),
                category: 'economy'
            }
        ];

        let filteredNews = fallbackNews;
        
        if (category !== 'all') {
            filteredNews = fallbackNews.filter(news => news.category === category);
        }
        
        return filteredNews.slice(0, limit);
    }

    getPlaceholderImage() {
        const images = [
            'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop'
        ];
        
        return images[Math.floor(Math.random() * images.length)];
    }

    renderFeaturedNews(news) {
        const grid = document.getElementById('featured-grid');
        if (!grid) return;

        grid.innerHTML = '';
        
        news.slice(0, 6).forEach(item => {
            const card = document.createElement('article');
            card.className = 'featured-card';
            card.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="featured-image" loading="lazy">
                <div class="featured-content">
                    <span class="featured-category">${this.getCategoryName(item.category)}</span>
                    <h3 class="featured-title">
                        <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                    </h3>
                    <p class="featured-excerpt">${item.excerpt}</p>
                    <div class="featured-meta">
                        <span class="featured-source">${item.source}</span>
                        <time class="featured-time" datetime="${item.publishedAt.toISOString()}">
                            ${this.formatTimeAgo(item.publishedAt)}
                        </time>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    renderNews(news, append = false) {
        const container = document.getElementById('news-items');
        if (!container) return;

        if (!append) {
            container.innerHTML = '';
        }

        news.forEach(item => {
            const article = document.createElement('article');
            article.className = 'news-item';
            article.innerHTML = `
                <img src="${item.image}" alt="${item.title}" class="news-image" loading="lazy">
                <div class="news-content">
                    <span class="news-category">${this.getCategoryName(item.category)}</span>
                    <h3 class="news-title">
                        <a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a>
                    </h3>
                    <p class="news-excerpt">${item.excerpt}</p>
                    <div class="news-meta">
                        <span class="news-source">${item.source}</span>
                        <time class="news-time" datetime="${item.publishedAt.toISOString()}">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12,6 12,12 16,14"></polyline>
                            </svg>
                            ${this.formatTimeAgo(item.publishedAt)}
                        </time>
                    </div>
                </div>
            `;
            container.appendChild(article);
        });
    }

    async loadWeather() {
        try {
            // Try to get weather from cache first
            if (this.weatherCache && Date.now() - this.weatherCache.timestamp < this.updateInterval) {
                this.renderWeather(this.weatherCache.data);
                return;
            }

            // Try OpenWeatherMap API
            const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=São Luís,BR&appid=${this.weatherAPIKey}&units=metric&lang=pt`);
            
            if (response.ok) {
                const data = await response.json();
                const weatherData = {
                    temp: Math.round(data.main.temp),
                    feelsLike: Math.round(data.main.feels_like),
                    humidity: data.main.humidity,
                    windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
                    description: data.weather[0].description,
                    icon: data.weather[0].icon
                };
                
                this.weatherCache = {
                    data: weatherData,
                    timestamp: Date.now()
                };
                
                this.renderWeather(weatherData);
            } else {
                throw new Error('Weather API failed');
            }
        } catch (error) {
            console.error('Error loading weather:', error);
            this.renderWeather(this.getFallbackWeather());
        }
    }

    getFallbackWeather() {
        return {
            temp: 28,
            feelsLike: 32,
            humidity: 75,
            windSpeed: 15,
            description: 'parcialmente nublado',
            icon: '02d'
        };
    }

    renderWeather(weather) {
        // Header weather
        const headerTemp = document.querySelector('.weather-temp');
        if (headerTemp) {
            headerTemp.textContent = `${weather.temp}°C`;
        }

        // Sidebar weather
        const tempLarge = document.getElementById('temp-large');
        const weatherDesc = document.getElementById('weather-desc');
        const feelsLike = document.getElementById('feels-like');
        const humidity = document.getElementById('humidity');
        const windSpeed = document.getElementById('wind-speed');

        if (tempLarge) tempLarge.textContent = `${weather.temp}°C`;
        if (weatherDesc) weatherDesc.textContent = weather.description;
        if (feelsLike) feelsLike.textContent = `${weather.feelsLike}°C`;
        if (humidity) humidity.textContent = `${weather.humidity}%`;
        if (windSpeed) windSpeed.textContent = `${weather.windSpeed} km/h`;
    }

    async loadTrendingTopics() {
        try {
            const trending = [
                { title: 'Eleições 2024', rank: 1 },
                { title: 'Lençóis Maranhenses', rank: 2 },
                { title: 'São Luís Centro Histórico', rank: 3 },
                { title: 'Bumba Meu Boi', rank: 4 },
                { title: 'Porto do Itaqui', rank: 5 }
            ];
            
            this.renderTrending(trending);
        } catch (error) {
            console.error('Error loading trending topics:', error);
        }
    }

    renderTrending(trending) {
        const container = document.getElementById('trending-list');
        if (!container) return;

        container.innerHTML = '';
        
        trending.forEach(item => {
            const div = document.createElement('div');
            div.className = 'trending-item';
            div.innerHTML = `
                <span class="trending-rank">${item.rank}</span>
                <span class="trending-title">${item.title}</span>
            `;
            container.appendChild(div);
        });
    }

    async performSearch(query) {
        if (!query.trim()) return;
        
        this.showLoadingOverlay();
        
        try {
            const searchResults = await this.fetchNews('all', 20);
            const filteredResults = searchResults.filter(news => 
                news.title.toLowerCase().includes(query.toLowerCase()) ||
                news.excerpt.toLowerCase().includes(query.toLowerCase())
            );
            
            this.renderNews(filteredResults, false);
            
            // Update page title
            document.querySelector('#news-list-title .title-icon').textContent = '🔍';
            document.querySelector('#news-list-title').innerHTML = `
                <span class="title-icon">🔍</span>
                Resultados para "${query}"
            `;
            
        } catch (error) {
            console.error('Search error:', error);
            this.showError('Erro ao realizar busca');
        } finally {
            this.hideLoadingOverlay();
        }
    }

    async subscribeNewsletter(formData) {
        const email = formData.get('email');
        const btn = document.querySelector('.newsletter-btn');
        
        if (!email) return;
        
        btn.classList.add('loading');
        
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            this.showSuccess('Email cadastrado com sucesso!');
            document.getElementById('newsletter-form').reset();
            
        } catch (error) {
            console.error('Newsletter subscription error:', error);
            this.showError('Erro ao cadastrar email');
        } finally {
            btn.classList.remove('loading');
        }
    }

    startAutoUpdate() {
        setInterval(() => {
            this.loadBreakingNews();
            this.loadWeather();
            this.updateStats();
        }, this.updateInterval);
    }

    updateStats() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        
        // Update time displays
        document.getElementById('update-time').textContent = timeString;
        document.getElementById('footer-update-time').textContent = timeString;
        
        // Update news count (simulate)
        const newsCount = Math.floor(Math.random() * 50) + 100;
        document.getElementById('news-count').textContent = newsCount;
        document.getElementById('footer-news-count').textContent = newsCount;
    }

    getCategoryName(category) {
        const names = {
            politics: 'Política',
            economy: 'Economia',
            sports: 'Esportes',
            culture: 'Cultura',
            general: 'Geral'
        };
        
        return names[category] || 'Notícias';
    }

    formatTimeAgo(date) {
        const now = new Date();
        const diff = now - date;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Agora';
        if (minutes < 60) return `${minutes}min`;
        if (hours < 24) return `${hours}h`;
        if (days < 7) return `${days}d`;
        
        return date.toLocaleDateString('pt-BR');
    }

    showLoadingOverlay() {
        document.getElementById('loading-overlay').classList.add('active');
    }

    hideLoadingOverlay() {
        document.getElementById('loading-overlay').classList.remove('active');
    }

    showNewsLoading() {
        const container = document.getElementById('news-items');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Create skeleton loaders
        for (let i = 0; i < 5; i++) {
            const skeleton = document.createElement('div');
            skeleton.className = 'news-item skeleton';
            skeleton.innerHTML = `
                <div class="skeleton-image"></div>
                <div class="news-content">
                    <div class="skeleton-category"></div>
                    <div class="skeleton-title"></div>
                    <div class="skeleton-excerpt"></div>
                    <div class="skeleton-meta"></div>
                </div>
            `;
            container.appendChild(skeleton);
        }
        
        // Add skeleton styles
        if (!document.getElementById('skeleton-styles')) {
            const style = document.createElement('style');
            style.id = 'skeleton-styles';
            style.textContent = `
                .skeleton {
                    pointer-events: none;
                }
                .skeleton-image,
                .skeleton-category,
                .skeleton-title,
                .skeleton-excerpt,
                .skeleton-meta {
                    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                    background-size: 200% 100%;
                    animation: loading 1.5s infinite;
                    border-radius: 4px;
                }
                .skeleton-image {
                    width: 200px;
                    height: 150px;
                }
                .skeleton-category {
                    width: 80px;
                    height: 20px;
                    margin-bottom: 8px;
                }
                .skeleton-title {
                    width: 100%;
                    height: 24px;
                    margin-bottom: 8px;
                }
                .skeleton-excerpt {
                    width: 90%;
                    height: 16px;
                    margin-bottom: 16px;
                }
                .skeleton-meta {
                    width: 60%;
                    height: 14px;
                }
                @keyframes loading {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    hideNewsLoading() {
        const skeletons = document.querySelectorAll('.skeleton');
        skeletons.forEach(skeleton => skeleton.remove());
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add notification styles if not present
        if (!document.getElementById('notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    padding: 1rem 1.5rem;
                    border-radius: 8px;
                    color: white;
                    font-weight: 500;
                    z-index: 10000;
                    animation: slideIn 0.3s ease-out;
                }
                .notification-success { background: #10b981; }
                .notification-error { background: #ef4444; }
                .notification-info { background: #3b82f6; }
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Live Video Functionality
function playLiveVideo() {
    const videoContainer = document.getElementById('live-video');
    if (!videoContainer) return;
    
    // Replace with actual live stream embed
    videoContainer.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/live_stream?channel=UC_x5XG1OV2P6uZZ5FSM9Ttw&autoplay=1" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
}

// Initialize the portal when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.newsPortal = new NewsPortal();
});

// Service Worker Registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = NewsPortal;
}