// Sistema de chamadas API para o blog
class BlogAPI {
    constructor(baseURL = 'https://jsonplaceholder.typicode.com') {
        this.baseURL = baseURL;
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 minutos em milissegundos
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const cacheKey = `${url}-${JSON.stringify(options)}`;
        
        // Verificar cache
        const cached = this.cache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
            return cached.data;
        }

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Armazenar em cache
            this.cache.set(cacheKey, {
                data,
                timestamp: Date.now()
            });

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async getNewsFromMaranhao(limit = 6, query = 'maranhão política') {
        try {
            const url = `/.netlify/functions/fetch-news?q=${encodeURIComponent(query)}&limit=${limit}`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Erro ao buscar notícias');
            }

            const articles = await response.json();
            if (Array.isArray(articles) && articles.length > 0) {
                return articles.slice(0, limit);
            }

            return this.getMaranhaoNewsFallback(limit);
        } catch (error) {
            console.error('Error fetching Maranhão news:', error);
            return this.getMaranhaoNewsFallback(limit);
        }
    }

    getMaranhaoImage() {
        const maranhaoImages = [
            'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1544984243-ec57ea16fe25?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&h=300&fit=crop'
        ];
        return maranhaoImages[Math.floor(Math.random() * maranhaoImages.length)];
    }

    getMaranhaoNewsFallback(limit) {
        const maranhaoNews = [
            {
                id: 1,
                title: 'Governo do Maranhão anuncia novos investimentos em infraestrutura',
                excerpt: 'O governador anunciou um pacote de investimentos para melhorar a infraestrutura do estado...',
                date: this.formatDate(new Date()),
                image: this.getMaranhaoImage(),
                url: '#',
                source: 'BlogPro Maranhão'
            },
            {
                id: 2,
                title: 'Assembleia Legislativa discute reforma tributária estadual',
                excerpt: 'Deputados estaduais debatem proposta de reforma do sistema tributário do Maranhão...',
                date: this.formatDate(new Date(Date.now() - 86400000)),
                image: this.getMaranhaoImage(),
                url: '#',
                source: 'BlogPro Maranhão'
            },
            {
                id: 3,
                title: 'Prefeitura de São Luís lança programa de urbanização',
                excerpt: 'Novo projeto visa melhorar a qualidade de vida nas periferias da capital maranhense...',
                date: this.formatDate(new Date(Date.now() - 172800000)),
                image: this.getMaranhaoImage(),
                url: '#',
                source: 'BlogPro Maranhão'
            },
            {
                id: 4,
                title: 'Maranhão registra crescimento econômico acima da média nacional',
                excerpt: 'Dados mostram que o estado teve desempenho positivo no último trimestre...',
                date: this.formatDate(new Date(Date.now() - 259200000)),
                image: this.getMaranhaoImage(),
                url: '#',
                source: 'BlogPro Maranhão'
            },
            {
                id: 5,
                title: 'Secretaria de Educação anuncia reforma em escolas estaduais',
                excerpt: 'Investimentos em educação: 50 escolas serão reformadas no próximo semestre...',
                date: this.formatDate(new Date(Date.now() - 345600000)),
                image: this.getMaranhaoImage(),
                url: '#',
                source: 'BlogPro Maranhão'
            },
            {
                id: 6,
                title: 'Turismo no Maranhão: Novos projetos para Lençóis Maranhenses',
                excerpt: 'Governo estadual anuncia planos para ampliar estrutura turística no parque nacional...',
                date: this.formatDate(new Date(Date.now() - 432000000)),
                image: this.getMaranhaoImage(),
                url: '#',
                source: 'BlogPro Maranhão'
            }
        ];
        return maranhaoNews.slice(0, limit);
    }

    async getPosts(limit = 10, query = 'maranhão política') {
        // Usar notícias reais quando implantado no Netlify; fallback local caso falhe
        return this.getNewsFromMaranhao(limit, query);
    }

    async getPostById(id) {
        try {
            const post = await this.request(`/posts/${id}`);
            const comments = await this.request(`/posts/${id}/comments`);
            
            return {
                ...post,
                comments: comments.slice(0, 5),
                date: this.formatDate(new Date()),
                image: this.getRandomImage(),
                author: 'Autor do Blog'
            };
        } catch (error) {
            console.error('Error fetching post:', error);
            return this.getFallbackPost(id);
        }
    }

    async getComments(postId, limit = 5) {
        try {
            const comments = await this.request(`/posts/${postId}/comments`);
            return comments.slice(0, limit);
        } catch (error) {
            console.error('Error fetching comments:', error);
            return this.getFallbackComments();
        }
    }

    async subscribeToNewsletter(email) {
        // Simulação de inscrição - substitua pela sua API real
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    success: true,
                    message: 'Inscrição realizada com sucesso!',
                    email: email
                });
            }, 1000);
        });
    }

    async submitContactForm(formData) {
        // Simulação de envio de formulário - substitua pela sua API real
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (Math.random() > 0.1) {
                    resolve({
                        success: true,
                        message: 'Mensagem enviada com sucesso!'
                    });
                } else {
                    reject(new Error('Erro ao enviar mensagem'));
                }
            }, 1500);
        });
    }

    // Métodos utilitários
    formatDate(date) {
        return new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }).format(date);
    }

    getRandomImage() {
        const images = [
            'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=400&h=300&fit=crop',
            'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=300&fit=crop'
        ];
        return images[Math.floor(Math.random() * images.length)];
    }

    getFallbackPosts(limit) {
        const fallbackPosts = [
            {
                id: 1,
                title: 'Como criar um blog profissional',
                excerpt: 'Aprenda os passos essenciais para criar um blog com design moderno e funcionalidades profissionais...',
                date: '23 Ago 2025',
                image: this.getRandomImage()
            },
            {
                id: 2,
                title: 'Dicas de design para web',
                excerpt: 'Descubra as melhores práticas de design web para criar interfaces atraentes e funcionais...',
                date: '22 Ago 2025',
                image: this.getRandomImage()
            }
        ];
        return fallbackPosts.slice(0, limit);
    }

    getFallbackPost(id) {
        return {
            id: id,
            title: 'Post de exemplo',
            body: 'Este é um conteúdo de exemplo para demonstração. Em uma implementação real, este conteúdo viria de uma API ou banco de dados.',
            date: this.formatDate(new Date()),
            image: this.getRandomImage(),
            author: 'Autor do Blog',
            comments: this.getFallbackComments()
        };
    }

    getFallbackComments() {
        return [
            {
                id: 1,
                name: 'João Silva',
                email: 'joao@email.com',
                body: 'Excelente post! Muito útil para iniciantes.'
            },
            {
                id: 2,
                name: 'Maria Santos',
                email: 'maria@email.com',
                body: 'Gostei muito das dicas, vou implementar no meu blog.'
            }
        ];
    }

    // Limpar cache
    clearCache() {
        this.cache.clear();
    }

    // Verificar status da API
    async checkHealth() {
        try {
            const response = await fetch(`${this.baseURL}/posts/1`);
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// Gerenciador de estado para o blog
class BlogStateManager {
    constructor() {
        this.api = new BlogAPI();
        this.currentPosts = [];
        this.currentQuery = 'maranhão política';
        this.searchTerm = '';
        this.init();
    }

    async init() {
        this.setupUI();
        await this.loadPosts();
        this.setupEventListeners();
    }

    async loadPosts() {
        try {
            this.showLoading();
            this.currentPosts = await this.api.getNewsFromMaranhao(6, this.currentQuery);
            this.renderPosts();
            this.renderFeatured();
            this.renderMostRead();
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError('Erro ao carregar posts');
        } finally {
            this.hideLoading();
        }
    }

    renderPosts() {
        const postsContainer = document.querySelector('.posts');
        if (!postsContainer) return;

        // Limpar posts existentes (exceto o título)
        const existingPosts = postsContainer.querySelectorAll('.post-card');
        existingPosts.forEach(post => post.remove());

        const posts = this.searchTerm
            ? this.currentPosts.filter(p => (p.title || '').toLowerCase().includes(this.searchTerm) || (p.excerpt || '').toLowerCase().includes(this.searchTerm))
            : this.currentPosts;

        posts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'post-card';
        article.innerHTML = `
            <div class="post-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy" decoding="async" width="400" height="300">
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-meta">
                    <span class="post-date">${post.date}</span>
                    <span class="post-source">${post.source}</span>
                    <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="read-more" data-post-id="${post.id}">Ler notícia completa</a>
                </div>
            </div>
        `;
        return article;
    }

    renderFeatured() {
        const grid = document.querySelector('.featured-grid');
        if (!grid) return;
        grid.innerHTML = '';
        const featured = this.currentPosts.slice(0, 3);
        featured.forEach(item => {
            const card = document.createElement('article');
            card.className = 'featured-card';
            card.innerHTML = `
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="featured-link" aria-label="Abrir notícia destaque: ${item.title}">
                    <div class="featured-media">
                        <img src="${item.image}" alt="${item.title}" loading="lazy" decoding="async" width="640" height="360" />
                        <span class="featured-badge">Destaque</span>
                    </div>
                    <div class="featured-info">
                        <h3 class="featured-title">${item.title}</h3>
                        <p class="featured-excerpt">${item.excerpt || ''}</p>
                        <div class="featured-meta">
                            <span>${item.source || ''}</span>
                            <span>${item.date || ''}</span>
                        </div>
                    </div>
                </a>
            `;
            grid.appendChild(card);
        });
    }

    renderMostRead() {
        const list = document.querySelector('#most-read-widget .most-read-list');
        if (!list) return;
        list.innerHTML = '';
        const items = this.currentPosts.slice(0, 5);
        items.forEach((item, idx) => {
            const li = document.createElement('li');
            li.className = 'most-read-item';
            li.innerHTML = `
                <a href="${item.url}" target="_blank" rel="noopener noreferrer" class="most-read-link">
                    <span class="most-read-rank">${idx + 1}</span>
                    <span class="most-read-title">${item.title}</span>
                </a>`;
            list.appendChild(li);
        });
    }

    setupUI() {
        const postsContainer = document.querySelector('.posts');
        if (!postsContainer) return;

        const titleEl = postsContainer.querySelector('.section-title');
        const wrapper = document.createElement('div');
        wrapper.className = 'posts-filters';
        wrapper.innerHTML = `
            <div class="filters-bar" role="region" aria-label="Filtros e busca">
                <div class="filters-categories" role="tablist" aria-label="Categorias">
                    <button type="button" class="filter-btn is-active" data-q="maranhão política">Todas</button>
                    <button type="button" class="filter-btn" data-q="maranhão política">Política</button>
                    <button type="button" class="filter-btn" data-q="maranhão economia OR infraestrutura">Economia</button>
                    <button type="button" class="filter-btn" data-q="maranhão cultura OR eventos">Cultura</button>
                </div>
                <div class="filters-search">
                    <label class="visually-hidden" for="search-posts">Pesquisar</label>
                    <input id="search-posts" type="search" class="search-input" placeholder="Pesquisar notícias..." autocomplete="off">
                </div>
            </div>
        `;

        if (titleEl) {
            titleEl.insertAdjacentElement('afterend', wrapper);
        } else {
            postsContainer.insertBefore(wrapper, postsContainer.firstChild);
        }

        this.filtersContainer = wrapper;
        this.searchInput = wrapper.querySelector('.search-input');
        this.categoryButtons = Array.from(wrapper.querySelectorAll('.filter-btn'));

        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => {
                this.searchTerm = String(e.target.value || '').toLowerCase();
                this.renderPosts();
            });
        }

        if (this.categoryButtons && this.categoryButtons.length) {
            this.categoryButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    this.categoryButtons.forEach(b => b.classList.remove('is-active'));
                    btn.classList.add('is-active');
                    const q = btn.getAttribute('data-q') || 'maranhão política';
                    this.currentQuery = q;
                    this.loadPosts();
                });
            });
        }
    }

    setupEventListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('read-more')) {
                e.preventDefault();
                const postUrl = e.target.href;
                if (postUrl && postUrl !== '#') {
                    window.open(postUrl, '_blank');
                } else {
                    this.showPostDetail(e.target.dataset.postId);
                }
            }
        });

        // Botão para atualizar notícias
        const refreshBtn = document.createElement('button');
        refreshBtn.textContent = '🔄 Atualizar Notícias';
        refreshBtn.className = 'refresh-news-btn';
        refreshBtn.addEventListener('click', () => this.loadPosts());
        
        const postsContainer = document.querySelector('.posts');
        if (postsContainer) {
            const filtersBar = postsContainer.querySelector('.posts-filters');
            const titleEl = postsContainer.querySelector('.section-title');
            if (filtersBar) {
                filtersBar.insertAdjacentElement('afterend', refreshBtn);
            } else if (titleEl && titleEl.parentNode === postsContainer) {
                titleEl.insertAdjacentElement('afterend', refreshBtn);
            } else {
                postsContainer.insertBefore(refreshBtn, postsContainer.firstChild);
            }
        }
    }

    async showPostDetail(postId) {
        // Modal simples para mostrar detalhes da notícia
        const post = this.currentPosts.find(p => p.id == postId);
        if (!post) return;

        const modal = document.createElement('div');
        modal.className = 'news-modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-label', post.title);

        modal.innerHTML = `
            <div>
                <h2>${post.title}</h2>
                <img src="${post.image}" alt="${post.title}">
                <p>${post.excerpt}</p>
                <div class="news-modal__footer">
                    <span>Fonte: ${post.source}</span>
                    <span>Data: ${post.date}</span>
                </div>
                <button class="news-modal__close">
                    Fechar
                </button>
            </div>
        `;

        const closeButton = modal.querySelector('button');
        const onClose = () => {
            document.body.removeChild(modal);
            document.removeEventListener('keydown', onEsc);
        };
        const onEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        closeButton.addEventListener('click', onClose);
        document.addEventListener('keydown', onEsc);
        closeButton.focus();

        document.body.appendChild(modal);
    }

    showLoading() {
        const postsContainer = document.querySelector('.posts');
        if (!postsContainer) return;
        postsContainer.setAttribute('aria-busy', 'true');

        // Remove skeletons anteriores
        postsContainer.querySelectorAll('.post-card').forEach(el => el.remove());

        // Inserir skeletons
        const skeletonCount = 3;
        for (let i = 0; i < skeletonCount; i++) {
            const sk = document.createElement('article');
            sk.className = 'post-card';
            sk.innerHTML = `
                <div class="post-image" style="background: linear-gradient(90deg, #f1f5f9, #e2e8f0, #f1f5f9); background-size: 200% 100%; animation: shimmer 1.2s infinite; height: 220px;"></div>
                <div class="post-content">
                    <div style="height: 22px; width: 70%; background: #e5e7eb; border-radius: 8px; margin-bottom: 12px; animation: shimmer 1.2s infinite;"></div>
                    <div style="height: 14px; width: 100%; background: #eef2f7; border-radius: 8px; margin-bottom: 8px; animation: shimmer 1.2s infinite;"></div>
                    <div style="height: 14px; width: 80%; background: #eef2f7; border-radius: 8px; margin-bottom: 16px; animation: shimmer 1.2s infinite;"></div>
                </div>`;
            postsContainer.appendChild(sk);
        }

        // Animação shimmer global (fallback inline)
        const styleId = 'shimmer-style';
        if (!document.getElementById(styleId)) {
            const style = document.createElement('style');
            style.id = styleId;
            style.textContent = `@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`;
            document.head.appendChild(style);
        }
    }

    hideLoading() {
        const postsContainer = document.querySelector('.posts');
        if (!postsContainer) return;
        postsContainer.removeAttribute('aria-busy');
    }

    showError(message) {
        // Implementar exibição de erro
        console.error('Error:', message);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    const blogManager = new BlogStateManager();
    window.blogAPI = new BlogAPI();
});

// Exportar para uso em outros arquivos
    // Remover as exportações para evitar erros
