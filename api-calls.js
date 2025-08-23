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

    async getNewsFromMaranhao(limit = 6) {
        try {
            // API de notícias do Brasil - substitua por uma API real se disponível
            const newsApiKey = 'sua_chave_api_aqui'; // Obtenha em https://newsapi.org
            const response = await fetch(`https://newsapi.org/v2/everything?q=maranhão+política&language=pt&sortBy=publishedAt&apiKey=demo_key`);
            
            if (!response.ok) {
                throw new Error('Erro ao buscar notícias');
            }

            const data = await response.json();
            
            if (data.articles && data.articles.length > 0) {
                return data.articles.slice(0, limit).map((article, index) => ({
                    id: index + 1,
                    title: article.title,
                    excerpt: article.description ? article.description.substring(0, 120) + '...' : 'Notícia sobre política do Maranhão...',
                    date: this.formatDate(new Date(article.publishedAt)),
                    image: article.urlToImage || this.getMaranhaoImage(),
                    url: article.url,
                    source: article.source.name
                }));
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

    async getPosts(limit = 10) {
        // Usar notícias do Maranhão em vez de posts genéricos
        return this.getMaranhaoNewsFallback(limit);
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
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.setupEventListeners();
    }

    async loadPosts() {
        try {
            this.showLoading();
            this.currentPosts = await this.api.getPosts(6);
            this.renderPosts();
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

        this.currentPosts.forEach(post => {
            const postElement = this.createPostElement(post);
            postsContainer.appendChild(postElement);
        });
    }

    createPostElement(post) {
        const article = document.createElement('article');
        article.className = 'post-card';
        article.innerHTML = `
            <div class="post-image">
                <img src="${post.image}" alt="${post.title}" loading="lazy">
            </div>
            <div class="post-content">
                <h3 class="post-title">${post.title}</h3>
                <p class="post-excerpt">${post.excerpt}</p>
                <div class="post-meta">
                    <span class="post-date">${post.date}</span>
                    <span class="post-source">${post.source}</span>
                    <a href="${post.url}" target="_blank" class="read-more" data-post-id="${post.id}">Ler notícia completa</a>
                </div>
            </div>
        `;
        return article;
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
        refreshBtn.style.cssText = `
            background: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: var(--border-radius);
            cursor: pointer;
            margin: 1rem 0;
            font-weight: 600;
        `;
        refreshBtn.addEventListener('click', () => this.loadPosts());
        
        const postsContainer = document.querySelector('.posts');
        if (postsContainer) {
            postsContainer.insertBefore(refreshBtn, postsContainer.firstChild.nextSibling);
        }
    }

    async showPostDetail(postId) {
        // Modal simples para mostrar detalhes da notícia
        const post = this.currentPosts.find(p => p.id == postId);
        if (!post) return;

        const modal = document.createElement('div');
        modal.className = 'news-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;

        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 8px; max-width: 600px; width: 90%; max-height: 80vh; overflow-y: auto;">
                <h2>${post.title}</h2>
                <img src="${post.image}" alt="${post.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 4px; margin: 1rem 0;">
                <p>${post.excerpt}</p>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                    <span>Fonte: ${post.source}</span>
                    <span>Data: ${post.date}</span>
                </div>
                <button style="background: var(--primary-color); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; margin-top: 1rem;">
                    Fechar
                </button>
            </div>
        `;

        modal.querySelector('button').addEventListener('click', () => {
            document.body.removeChild(modal);
        });

        document.body.appendChild(modal);
    }

    showLoading() {
        // Implementar indicador de carregamento
        console.log('Loading...');
    }

    hideLoading() {
        // Implementar ocultação do indicador de carregamento
        console.log('Loading complete');
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
