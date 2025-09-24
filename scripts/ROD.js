document.addEventListener('DOMContentLoaded', function () {
    // --- Меню ---
    const spisItems = document.querySelectorAll('.spis-item');
    const contents = document.querySelectorAll('.Rod-body');
    function setActive(name) {
        spisItems.forEach(item => item.classList.toggle('active', item.id === 'spis-' + name));
        contents.forEach(block => block.style.display = (block.dataset.content === name ? '' : 'none'));
    }
    document.querySelectorAll('.spis a[data-spis]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            setActive(this.getAttribute('data-spis'));
        });
    });
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