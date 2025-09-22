// ========================================
// БЛОК 1 - КАРУСЕЛЬ (Bloc-1.css)
// Относится к: index.html - секция с каруселью слайдов
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Получение всех слайдов карусели
    const slides = document.querySelectorAll('.carousel-slide');
    // Получение контейнера для точек навигации
    const dotsContainer = document.querySelector('.dots-container');
    // Получение кнопок "назад" и "вперёд"
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    // Индекс текущего слайда
    let currentIndex = 0;

    // Создание точек для навигации по слайдам
    slides.forEach((_, index) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (index === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });
    
    // Получение всех точек навигации
    const dots = document.querySelectorAll('.dot');

    // Функции карусели
    function goToSlide(index) {
        currentIndex = index;
        document.querySelector('.carousel-slides').style.transform = `translateX(-${currentIndex * 100}%)`;
        updateDots();
    }
    
    function updateDots() {
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    }

    // Обработчики кнопок карусели
    prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        goToSlide(currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % slides.length;
        goToSlide(currentIndex);
    });
});
