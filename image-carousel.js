// Carrossel de imagens
class ImageCarousel {
    constructor(carouselSelector) {
        this.carousel = document.querySelector(carouselSelector);
        if (!this.carousel) return; // Evita erros quando não há carrossel
        this.slides = this.carousel.querySelectorAll('.carousel-slide');
        this.currentIndex = 0;
        this.init();
    }

    init() {
        this.showSlide(this.currentIndex);
        this.setupNavigation();
    }

    showSlide(index) {
        this.slides.forEach((slide, i) => {
            slide.style.display = (i === index) ? 'block' : 'none';
        });
    }

    setupNavigation() {
        const nextButton = this.carousel.querySelector('.carousel-next');
        const prevButton = this.carousel.querySelector('.carousel-prev');

        nextButton.addEventListener('click', () => this.nextSlide());
        prevButton.addEventListener('click', () => this.prevSlide());
    }

    nextSlide() {
        this.currentIndex = (this.currentIndex + 1) % this.slides.length;
        this.showSlide(this.currentIndex);
    }

    prevSlide() {
        this.currentIndex = (this.currentIndex - 1 + this.slides.length) % this.slides.length;
        this.showSlide(this.currentIndex);
    }
}

// Inicializar carrossel quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    if (document.querySelector('.image-carousel')) {
        new ImageCarousel('.image-carousel');
    }
});

// Exemplo de uso
// <div class="image-carousel">
//     <div class="carousel-slide">Slide 1</div>
//     <div class="carousel-slide">Slide 2</div>
//     <div class="carousel-slide">Slide 3</div>
//     <button class="carousel-prev">❮</button>
//     <button class="carousel-next">❯</button>
// </div>
