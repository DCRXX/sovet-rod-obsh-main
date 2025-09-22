// ========================================
// КНОПКА "НАВЕРХ" - ОБЩАЯ ФУНКЦИЯ
// Относится к: все страницы - кнопка прокрутки вверх
// ========================================

// Функция инициализации кнопки "Наверх"
function initUpButton() {
    const upButton = document.querySelector('.up');
    if (upButton) {
        upButton.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    initUpButton();
});

// Дополнительная инициализация для динамически загруженного контента
document.addEventListener('click', (e) => {
    if (e.target && e.target.classList.contains('up')) {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }
});
