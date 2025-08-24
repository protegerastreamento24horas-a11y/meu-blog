(function() {
    // Validação de formulário para newsletter
    class FormValidator {
        constructor(formSelector) {
            this.form = document.querySelector(formSelector);
            this.input = this.form.querySelector('input[type="email"]');
            this.button = this.form.querySelector('button[type="submit"]');
            this.init();
        }

        init() {
            this.form.addEventListener('submit', (e) => this.handleSubmit(e));
            this.input.addEventListener('input', () => this.validateInput());
            this.input.addEventListener('blur', () => this.validateInput());
        }

        validateInput() {
            const email = this.input.value.trim();
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (email === '') {
                this.setError('Por favor, digite seu email');
                return false;
            }

            if (!emailRegex.test(email)) {
                this.setError('Por favor, digite um email válido');
                return false;
            }

            this.clearMessages();
            return true;
        }

        setError(message) {
            this.clearMessages();
            
            const errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            errorElement.style.cssText = `
                color: #dc2626;
                font-size: 0.875rem;
                margin-top: 0.5rem;
                padding: 0.5rem;
                background: #fef2f2;
                border: 1px solid #fecaca;
                border-radius: 4px;
            `;
            errorElement.textContent = message;
            
            this.input.style.borderColor = '#dc2626';
            this.form.appendChild(errorElement);
        }

        clearMessages() {
            // Remover todas as mensagens de erro e sucesso
            const existingError = this.form.querySelector('.error-message');
            const existingSuccess = this.form.querySelector('.success-message');
            
            if (existingError) {
                existingError.remove();
            }
            if (existingSuccess) {
                existingSuccess.remove();
            }
            
            this.input.style.borderColor = '';
        }

        clearError() {
            const existingError = this.form.querySelector('.error-message');
            if (existingError) {
                existingError.remove();
            }
            this.input.style.borderColor = '';
        }

        clearSuccess() {
            const existingSuccess = this.form.querySelector('.success-message');
            if (existingSuccess) {
                existingSuccess.remove();
            }
        }

        async handleSubmit(e) {
            e.preventDefault();
            
            if (!this.validateInput()) {
                return;
            }

            // Mostrar estado de carregamento
            const originalText = this.button.textContent;
            this.button.textContent = 'Enviando...';
            this.button.disabled = true;

            try {
                // Para Netlify Forms: permitir envio real após validação
                this.form.submit();
            } catch (error) {
                this.setError('Erro ao realizar inscrição. Tente novamente.');
                this.button.textContent = originalText;
                this.button.disabled = false;
            }
        }

        async subscribeToNewsletter(email) {
            // Simulação de chamada API - Netlify Forms cuidará do envio real
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    // Simular sucesso 90% das vezes para demonstração
                    if (Math.random() > 0.1) {
                        resolve();
                    } else {
                        reject(new Error('Erro de servidor'));
                    }
                }, 1500);
            });
        }

        showSuccess(message) {
            this.clearMessages();
            
            const successElement = document.createElement('div');
            successElement.className = 'success-message';
            successElement.style.cssText = `
                color: #059669;
                font-size: 0.875rem;
                margin-top: 0.5rem;
                padding: 0.5rem;
                background: #f0fdf4;
                border: 1px solid #bbf7d0;
                border-radius: 4px;
            `;
            successElement.textContent = message;
            
            this.form.appendChild(successElement);
            
            // Remover mensagem após 5 segundos
            setTimeout(() => {
                this.clearSuccess();
            }, 5000);
        }
    }

    // Inicializar validação quando o DOM estiver carregado
    document.addEventListener('DOMContentLoaded', function() {
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            new FormValidator('.newsletter-form');
        }
    });
})();
