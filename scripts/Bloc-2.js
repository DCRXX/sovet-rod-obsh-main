// ========================================
// БЛОК 2 - НАШИ ПРОЕКТЫ (Bloc-2.css)
// Относится к: index.html - секция "Наши проекты"
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const projectBody = document.querySelector('.project-body');
    if (projectBody) {
        projectBody.addEventListener('wheel', (event) => {
            // Разрешаем прокрутку карты колёсиком мыши
            if (event.target && typeof event.target.closest === 'function' && event.target.closest('#map')) return;
            event.preventDefault();
            projectBody.scrollLeft += event.deltaY * 3;
        }, { passive: false });
    }
});
