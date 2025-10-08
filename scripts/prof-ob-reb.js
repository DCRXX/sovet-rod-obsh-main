document.addEventListener('DOMContentLoaded', function () {
    // --- Меню ---
    const spisItems = document.querySelectorAll('.spis-item');
    const contents = document.querySelectorAll('[data-content]');
    const spisContainer = document.querySelector('.spis');

    function setActive(name) {
        // Устанавливаем активный класс для пункта меню
        const topContents = document.querySelectorAll('.prof-ob-reb-1 > [data-content]');
        topContents.forEach(block => {
            // если выбрана годовая страница (напр. '2024'), показываем родительский arch
            if (/^\d{4}$/.test(name)) {
                block.style.display = (block.dataset.content === 'arch') ? 'flex' : 'none';
            } else {
                block.style.display = (block.dataset.content === name) ? 'flex' : 'none';
            }
        });

        // Если выбрана годовая страница — показать внутри архива только нужный год
        if (/^\d{4}$/.test(name)) {
            const yearBlocks = document.querySelectorAll('[data-content]');
            yearBlocks.forEach(b => {
                if (/^\d{4}$/.test(b.dataset.content)) {
                    b.style.display = (b.dataset.content === name) ? 'flex' : 'none';
                }
            });
        } else {
            // при выборе обычной страницы скрыть все вложенные годовые блоки
            const yearBlocks = document.querySelectorAll('[data-content]');
            yearBlocks.forEach(b => {
                if (/^\d{4}$/.test(b.dataset.content)) b.style.display = 'none';
            });
        }

        // Инициализация карусели для всех видимых каруселей
        initializeCarousels();
    }

    // Добавляем обработчики кликов для ссылок меню
    document.querySelectorAll('.spis a[data-spis]').forEach(link => {
        document.querySelectorAll('a[data-spis]').forEach(link => {
            link.addEventListener('click', function (e) {
                e.preventDefault();
                setActive(this.getAttribute('data-spis'));
            });
        });
    });

    // Прокрутка меню с помощью колесика мыши
    if (spisContainer) {
        spisContainer.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scrollAmount = e.deltaY * 2;
            spisContainer.scrollLeft += scrollAmount;
        });
    }

    // Устанавливаем начальное состояние (показываем "main")
    setActive('main');

    // Функция инициализации всех каруселей
    function initializeCarousels() {
        const carousels = document.querySelectorAll('.prof-ob-reb-3');
        carousels.forEach(carousel => {
            const inner = carousel.querySelector('.carousel-inner');
            const items = carousel.querySelectorAll('.prof-ob-reb-5-6, .prof-ob-reb-5-10'); // Поддержка обоих классов
            const dotsContainer = carousel.querySelector('.carousel-dots');
            if (!inner || !items.length || !dotsContainer) return;

            let currentIndex = 0;
            let isScrolling = false;

            // Очищаем и создаем точки
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

            // timeline-menu может быть внутри конкретного carousel
            const container = carousel.querySelector('.timeline-menu');
            if (container) {
                let scrollPosition = container.scrollLeft || 0;
                const scrollSpeed = 2;
                const maxScroll = () => Math.max(0, container.scrollWidth - container.clientWidth);

                container.addEventListener('wheel', (event) => {
                    // wheel должен быть не-пассивным чтобы preventDefault работал
                    event.preventDefault();
                    scrollPosition += event.deltaY * scrollSpeed;
                    // ограничиваем позицию в пределах
                    scrollPosition = Math.max(0, Math.min(scrollPosition, maxScroll()));
                    container.scrollLeft = scrollPosition;
                }, { passive: false });
            }

            // Синхронизация с ручным скроллом + авто-снап
            let scrollTimer;
            inner.addEventListener('scroll', () => {
                const idx = Math.round(inner.scrollLeft / width());
                if (idx !== currentIndex) {
                    currentIndex = clamp(idx, 0, items.length - 1);
                    updateDots();
                }
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(() => setIndex(currentIndex), 120);
            }, { passive: true });

            // Колесо мыши
            inner.addEventListener('wheel', (e) => {
                e.preventDefault();
                if (isScrolling) return;
                isScrolling = true;
                setTimeout(() => { isScrolling = false; }, 0);
                setIndex(currentIndex + (e.deltaY > 0 ? 1 : -1));
            }, { passive: false });

            // Свайп
            let sx = 0, sy = 0, moved = false;
            const TH = 30;
            inner.addEventListener('touchstart', (e) => {
                const t = e.touches && e.touches[0];
                if (!t) return;
                sx = t.clientX;
                sy = t.clientY;
                moved = false;
            }, { passive: true });

            inner.addEventListener('touchmove', (e) => {
                const t = e.touches && e.touches[0];
                if (!t) return;
                const dx = t.clientX - sx;
                const dy = t.clientY - sy;
                if (Math.abs(dx) > Math.abs(dy)) {
                    e.preventDefault();
                    moved = true;
                }
            }, { passive: false });

            inner.addEventListener('touchend', (e) => {
                if (!moved) return;
                const c = e.changedTouches && e.changedTouches[0];
                if (!c) return;
                const dx = c.clientX - sx;
                if (Math.abs(dx) >= TH) setIndex(currentIndex + (dx < 0 ? 1 : -1));
            }, { passive: true });
        });
    }
});