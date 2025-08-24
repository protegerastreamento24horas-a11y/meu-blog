# MaranhãoNews - Portal Profissional de Notícias

Um portal de notícias moderno e profissional focado no estado do Maranhão, com atualizações automáticas, integração com APIs de notícias reais, clima em tempo real e funcionalidades avançadas.

## 🚀 Características

### ✨ Design Profissional
- Layout moderno e responsivo
- Cores profissionais (vermelho, azul, dourado)
- Animações suaves e transições
- Otimizado para todos os dispositivos

### 📰 Notícias em Tempo Real
- Integração com NewsAPI e GNews
- Atualizações automáticas a cada 5 minutos
- Categorização inteligente de notícias
- Sistema de cache para performance

### 🌤️ Clima em Tempo Real
- Integração com OpenWeatherMap
- Informações detalhadas do clima de São Luís
- Atualização automática

### 📱 Funcionalidades Avançadas
- Service Worker para funcionamento offline
- Progressive Web App (PWA)
- Busca em tempo real
- Newsletter integrada
- Vídeos ao vivo
- Trending topics
- Sistema de notificações

### 🔧 Tecnologias
- HTML5 semântico
- CSS3 moderno com variáveis CSS
- JavaScript ES6+ vanilla
- Netlify Functions para backend
- Service Worker para PWA
- APIs externas integradas

## 🛠️ Configuração

### 1. APIs Necessárias

Para funcionalidade completa, você precisará das seguintes chaves de API:

#### NewsAPI (Notícias)
1. Acesse [NewsAPI.org](https://newsapi.org/)
2. Crie uma conta gratuita
3. Obtenha sua API key

#### GNews (Notícias alternativas)
1. Acesse [GNews.io](https://gnews.io/)
2. Crie uma conta gratuita
3. Obtenha sua API key

#### OpenWeatherMap (Clima)
1. Acesse [OpenWeatherMap](https://openweathermap.org/api)
2. Crie uma conta gratuita
3. Obtenha sua API key

### 2. Configuração no Netlify

1. Faça deploy do projeto no Netlify
2. Vá para Site Settings > Environment Variables
3. Adicione as seguintes variáveis:

```
NEWS_API_KEY = sua_chave_newsapi
GNEWS_API_KEY = sua_chave_gnews
WEATHER_API_KEY = sua_chave_openweather
```

### 3. Configuração Local

Para desenvolvimento local, você pode:

1. Instalar Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Executar localmente:
```bash
netlify dev
```

3. Criar arquivo `.env` (não commitado):
```
NEWS_API_KEY=sua_chave_newsapi
GNEWS_API_KEY=sua_chave_gnews
WEATHER_API_KEY=sua_chave_openweather
```

## 📁 Estrutura do Projeto

```
maranhaonews/
├── index.html              # Página principal
├─�� style.css              # Estilos CSS
├── api-calls.js           # JavaScript principal
├── smooth-scrolling.js    # Navegação suave
├── form-validation.js     # Validação de formulários
├── sw.js                  # Service Worker
├── netlify.toml          # Configuração Netlify
├── netlify/
│   └── functions/
│       └── fetch-news.js  # Função para buscar notícias
└── README.md             # Este arquivo
```

## 🎨 Personalização

### Cores
As cores principais podem ser alteradas no arquivo `style.css`:

```css
:root {
    --primary-red: #dc2626;
    --secondary-blue: #1e40af;
    --accent-gold: #f59e0b;
}
```

### Conteúdo
- Edite `index.html` para alterar textos e estrutura
- Modifique `api-calls.js` para ajustar fontes de notícias
- Personalize `getFallbackNews()` com notícias locais

## 📊 Performance

O site é otimizado para:
- ⚡ Carregamento rápido (< 3s)
- 📱 Mobile-first design
- 🔍 SEO otimizado
- ♿ Acessibilidade (WCAG 2.1)
- 🌐 PWA completo

## 🚀 Deploy

### Netlify (Recomendado)
1. Conecte seu repositório GitHub ao Netlify
2. Configure as variáveis de ambiente
3. Deploy automático a cada commit

### Outros Provedores
O site funciona em qualquer provedor que suporte:
- Arquivos estáticos
- Netlify Functions (ou equivalente)
- HTTPS

## 🔧 Manutenção

### Atualizações Automáticas
- Notícias: A cada 5 minutos
- Clima: A cada 5 minutos
- Cache: Limpo automaticamente

### Monitoramento
- Console do navegador para logs
- Netlify Analytics para métricas
- Service Worker para status offline

## 📝 Licença

Este projeto é open source e está disponível sob a [Licença MIT](LICENSE).

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📞 Suporte

Para suporte ou dúvidas:
- 📧 Email: contato@maranhaonews.com.br
- 🐛 Issues: GitHub Issues
- 📱 WhatsApp: (98) 99999-9999

## 🎯 Roadmap

### Próximas Funcionalidades
- [ ] Sistema de comentários
- [ ] Notificações push
- [ ] App mobile nativo
- [ ] Dashboard administrativo
- [ ] Sistema de usuários
- [ ] Monetização com anúncios
- [ ] Integração com redes sociais
- [ ] Análise de sentimento das notícias

---

**MaranhãoNews** - Mantendo você informado sobre o que acontece no Maranhão! 🏛️📰