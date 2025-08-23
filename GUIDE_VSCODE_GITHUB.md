# 🖥️ Guia Prático: Como Salvar do VSCode para GitHub

## 📋 Pré-requisitos
1. Ter o Git instalado ([baixar aqui](https://git-scm.com/))
2. Ter conta no GitHub ([criar aqui](https://github.com/signup))
3. VSCode aberto com seu projeto

## 🚀 Passo a Passo Direto no VSCode

### 1. Abrir Terminal no VSCode
- Menu: `Terminal` → `New Terminal` (ou `Ctrl + ``)

### 2. Inicializar Git (se não tiver feito)
```bash
git init
```

### 3. Verificar Status dos Arquivos
```bash
git status
```
Deve mostrar todos seus arquivos como "untracked"

### 4. Adicionar TODOS os Arquivos
```bash
git add .
```

### 5. Fazer Primeiro Commit
```bash
git commit -m "Primeiro commit: Blog profissional completo"
```

### 6. Criar Repositório no GitHub
1. Acesse [github.com](https://github.com)
2. Clique em "+" → "New repository"
3. Nome: `meu-blog` (ou o que preferir)
4. **IMPORTANTE**: NÃO marque "Initialize with README"
5. Clique "Create repository"

### 7. Copiar URL do Repositório
No GitHub, após criar, copie a URL:
```
https://github.com/seu-usuario/meu-blog.git
```

### 8. Conectar com GitHub (no VSCode Terminal)
```bash
git remote add origin https://github.com/seu-usuario/meu-blog.git
```

### 9. Enviar para GitHub
```bash
git branch -M main
git push -u origin main
```

### 10. Digitar Credenciais
- Vai pedir usuário e senha do GitHub
- Se usar autenticação de dois fatores, pode precisar criar token

## 🔐 Como Criar Token de Acesso (se precisar)

1. No GitHub: Settings → Developer settings → Personal access tokens
2. Clique "Generate new token"
3. Marque "repo" (acesso completo aos repositórios)
4. Copie o token gerado
5. Use o token como senha quando pedir

## ✅ Verificação Final

1. Atualize a página do seu repositório no GitHub
2. Todos os arquivos devem aparecer:
   - index.html
   - style.css  
   - form-validation.js
   - smooth-scrolling.js
   - netlify.toml
   - etc.

## 🆘 Solução de Problemas Comuns

### Erro de Autenticação
```bash
# Se der erro, use token no lugar da senha
git push -u origin main
# Quando pedir senha: cole o token
```

### Arquivos Não Aparecem
```bash
# Verificar se adicionou tudo
git status

# Se faltar arquivos:
git add nome-do-arquivo
git commit -m "Adicionar arquivo faltante"
git push
```

### Já Tem Repositório com README
```bash
# Se acidentalmente criou com README:
git pull origin main --allow-unrelated-histories
git push -u origin main
```

## 📦 Extensão Útil do VSCode

Instale a extensão "GitHub Pull Requests and Issues" para gerenciar tudo direto pelo VSCode.

## 🎉 Pronto!

Seu projeto agora está no GitHub e pronto para conectar com Netlify! 

**Próximo passo**: Siga o guia `DEPLOY_NETLIFY.md` para fazer deploy automático.
