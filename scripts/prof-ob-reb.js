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
        if (!carousel) return;

        const inner = carousel.querySelector('.carousel-inner');
        const items = carousel.querySelectorAll('.prof-ob-reb-5-6');
        const dotsContainer = carousel.querySelector('.carousel-dots');
        let currentIndex = 0;
        let isScrolling = false;

        // Точки
        dotsContainer.innerHTML = '';
        const frag = document.createDocumentFragment();
        for (let i = 0; i < items.length; i++) {
            const dot = document.createElement('div');
            dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
            dot.addEventListener('click', () => setIndex(i));
            frag.appendChild(dot);
        }
        dotsContainer.appendChild(frag);
        const dots = carousel.querySelectorAll('.carousel-dot');

        const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
        const width = () => inner.clientWidth;
        const updateDots = () => dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
        const setIndex = (i) => {
            currentIndex = clamp(i, 0, items.length - 1);
            inner.scrollTo({ left: width() * currentIndex, behavior: 'smooth' });
            updateDots();
        };

        // Синхронизация с ручным скроллом + авто-снап
        let scrollTimer;
        inner.addEventListener('scroll', () => {
            const idx = Math.round(inner.scrollLeft / width());
            if (idx !== currentIndex) { currentIndex = clamp(idx, 0, items.length - 1); updateDots(); }
            clearTimeout(scrollTimer);
            scrollTimer = setTimeout(() => setIndex(currentIndex), 120);
        }, { passive: true });

        // Колесо мыши
        inner.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (isScrolling) return;
            isScrolling = true;
            setTimeout(() => { isScrolling = false; }, 220);
            setIndex(currentIndex + (e.deltaY > 0 ? 1 : -1));
        }, { passive: false });

        // Свайп
        let sx = 0, sy = 0, moved = false;
        const TH = 30;
        inner.addEventListener('touchstart', (e) => {
            const t = e.touches && e.touches[0]; if (!t) return;
            sx = t.clientX; sy = t.clientY; moved = false;
        }, { passive: true });
        inner.addEventListener('touchmove', (e) => {
            const t = e.touches && e.touches[0]; if (!t) return;
            const dx = t.clientX - sx; const dy = t.clientY - sy;
            if (Math.abs(dx) > Math.abs(dy)) { e.preventDefault(); moved = true; }
        }, { passive: false });
        inner.addEventListener('touchend', (e) => {
            if (!moved) return;
            const c = e.changedTouches && e.changedTouches[0]; if (!c) return;
            const dx = c.clientX - sx;
            if (Math.abs(dx) >= TH) setIndex(currentIndex + (dx < 0 ? 1 : -1));
        }, { passive: true });
    }
});