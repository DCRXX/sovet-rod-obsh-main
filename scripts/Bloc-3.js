// ========================================
// БЛОК 3 - РАЗВОРАЧИВАНИЕ ТЕКСТА (Bloc-3.css)
// Относится к: index.html - элементы .p2 в блоках .Bloc-b
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const p2Elements = document.querySelectorAll('.Bloc-b .p2');
    p2Elements.forEach(p2 => {
        p2.addEventListener('click', () => {
            p2.classList.toggle('expanded');
        });
    });
});

// ========================================
// ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ ТЕКСТА - БЛОК 3
// Относится к: index.html - элементы с onclick="toggleText(this)"
// ========================================
function toggleText(textElement) {
    const isExpanded = textElement.classList.contains('expanded');
    if (isExpanded) {
        textElement.classList.remove('expanded');
        textElement.textContent = textElement.textContent.substring(0, 100) + '...';
    } else {
        textElement.classList.add('expanded');
        textElement.textContent = textElement.getAttribute('data-full-text');
    }
}
// ========================================
// БЛОК 4 - ГОРИЗОНТАЛЬНАЯ ПРОКРУТКА (Bloc-4.css)
// Относится к: index.html - блок .KAR-NOV
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    const karNov = document.querySelector('.KAR-NOV', '.project-body');
    if (karNov) {
        karNov.addEventListener('wheel', function(e) {
            e.preventDefault();
            karNov.scrollLeft += e.deltaY;
        });
    }
});

