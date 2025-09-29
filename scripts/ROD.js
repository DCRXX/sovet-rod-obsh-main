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
});

// Горизонтальный скролл колесом мыши для .spis при узком экране на странице ROD
document.addEventListener('DOMContentLoaded', function () {
    const spis = document.querySelector('.spis');
    const SPIS_SCROLL_SPEED = 2; // множитель скорости
    if (spis) {
        spis.addEventListener('wheel', function(e) {
            if (window.innerWidth <= 1526 && e.deltaY !== 0) {
                e.preventDefault();
                spis.scrollLeft += e.deltaY * SPIS_SCROLL_SPEED;
            }
        }, { passive: false });
    }
});