document.addEventListener('DOMContentLoaded', function () {
    // --- Меню ---
    const spisItems = document.querySelectorAll('.spis-item');
    const contents = document.querySelectorAll('[data-content]');
    const spisContainer = document.querySelector('.spis');

    function setActive(name) {
        // Устанавливаем активный класс для пункта меню
        spisItems.forEach(item => item.classList.toggle('active', item.id === 'spis-' + name));
        // Показываем/скрываем содержимое
        contents.forEach(block => {
            block.style.display = (block.dataset.content === name) ? 'flex' : 'none';
        });
        // Инициализация карусели только для вкладки "otz"
        if (name === 'otz') {
            initializeCarousel();
        }
    }

    // Добавляем обработчики кликов для ссылок меню
    document.querySelectorAll('.spis a[data-spis]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            setActive(this.getAttribute('data-spis'));
        });
    });

    // Прокрутка меню с помощью колесика мыши
    if (spisContainer) {
        spisContainer.addEventListener('wheel', (e) => {
            e.preventDefault(); // Предотвращаем стандартную вертикальную прокрутку
            const scrollAmount = e.deltaY * 2; // Умножаем для более заметной прокрутки
            spisContainer.scrollLeft += scrollAmount; // Изменяем горизонтальную прокрутку
        });
    }

    // Устанавливаем начальное состояние (показываем "main")
    setActive('main');

    // Функция инициализации карусели
    function initializeCarousel() {
        const carousel = document.querySelector('.prof-ob-reb-3[data-content="otz"]');
        if (!carousel) return; // Проверяем, существует ли элемент

        const inner = carousel.querySelector('.carousel-inner');
        const items = carousel.querySelectorAll('.prof-ob-reb-5-6');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        let currentIndex = 0;
        let isScrolling = false;

        // Очищаем предыдущие точки, если они были созданы
        dotsContainer.innerHTML = '';

        // Создаем точки
        items.forEach((_, index) => {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (index === 0) dot.classList.add('active');
            dotsContainer.appendChild(dot);
        });

        const dots = carousel.querySelectorAll('.carousel-dot');

        // Обновление позиции карусели
        function updateCarousel() {
            inner.style.transform = `translateX(-${currentIndex * 100}%)`;
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        // Обработка кликов по точкам
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentIndex = index;
                updateCarousel();
            });
        });

        // Обработка прокрутки колесика мыши для карусели
        carousel.addEventListener('wheel', (e) => {
            if (isScrolling) return;
            isScrolling = true;
            setTimeout(() => {
                isScrolling = false;
            }, 500);

            if (e.deltaY > 0) {
                currentIndex = Math.min(currentIndex + 1, items.length - 1);
            } else {
                currentIndex = Math.max(currentIndex - 1, 0);
            }
            updateCarousel();
        });
    }
});