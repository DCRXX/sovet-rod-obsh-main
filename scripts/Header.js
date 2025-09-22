// ========================================
// ФУНКЦИИ ХЕДЕРА - ОБЩИЕ ФУНКЦИИ
// Относится к: все страницы - header.html
// ========================================

function initHeaderSearch() {
    var searchBtn = document.getElementById('search-button');
    var navBtns = document.getElementById('nav-buttons');
    var searchInput = document.getElementById('search-input-container');
    var closeBtn = document.getElementById('close-search');
    var headerSecond = document.querySelector('.header-second');
  
    if (searchBtn && navBtns && searchInput && headerSecond) {
      searchBtn.addEventListener('click', function() {
        navBtns.style.display = 'none';
        searchBtn.style.display = 'none';
        searchInput.style.display = 'flex';
        searchInput.querySelector('input').focus();
        headerSecond.classList.add('align-left');
      });
    }
    if (closeBtn && navBtns && searchBtn && searchInput && headerSecond) {
      closeBtn.addEventListener('click', function() {
        navBtns.style.display = '';
        searchBtn.style.display = '';
        searchInput.style.display = 'none';
        searchInput.querySelector('input').value = '';
        headerSecond.classList.remove('align-left');
      });
    }
}
