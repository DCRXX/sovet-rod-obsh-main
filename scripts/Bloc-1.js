// ========================================
// БЛОК 1 - КАРУСЕЛЬ (Bloc-1.css)
// Относится к: index.html - секция с каруселью слайдов
// ========================================

// Глобальная функция инициализации карусели
window.initCarousel = function() {
    // Получение всех слайдов карусели
    const slides = document.querySelectorAll('.carousel-slide');
    // Получение контейнера для точек навигации
    const dotsContainer = document.querySelector('.dots-container');
    // Получение кнопок "назад" и "вперёд"
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    // Индекс текущего слайда
    let currentIndex = 0;

    // Очищаем контейнер точек перед добавлением новых
    dotsContainer.innerHTML = '';

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

    // Удаляем старые обработчики событий если они есть
    const newPrevBtn = prevBtn.cloneNode(true);
    const newNextBtn = nextBtn.cloneNode(true);
    prevBtn.parentNode.replaceChild(newPrevBtn, prevBtn);
    nextBtn.parentNode.replaceChild(newNextBtn, nextBtn);

    // Обработчики кнопок карусели с предотвращением всплытия
    newPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex - 1 + slides.length) % slides.length;
        goToSlide(currentIndex);
    });

    newNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        currentIndex = (currentIndex + 1) % slides.length;
        goToSlide(currentIndex);
    });


};

// Инициализация при загрузке страницы (для случаев когда API не отвечает)
document.addEventListener('DOMContentLoaded', () => {
    // Ждем немного, чтобы дать время API загрузиться
    setTimeout(() => {
        const slides = document.querySelectorAll('.carousel-slide');
        if (slides.length > 0) {
            window.initCarousel();
        }
    }, 1000);
});
