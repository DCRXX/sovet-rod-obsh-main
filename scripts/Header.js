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

  // Проверяем, что все необходимые элементы найдены
  if (!searchBtn || !navBtns || !searchInput || !headerSecond) {
      console.error('Не все элементы для поиска найдены');
      return;
  }

  // Ищем textarea вместо input
  var searchField = searchInput.querySelector('.tex');

  if (!searchField) {
      console.error('Поле поиска (.tex) не найдено');
      return;
  }

  searchBtn.addEventListener('click', function () {
      navBtns.style.display = 'none';
      searchBtn.style.display = 'none';
      searchInput.style.display = 'flex';
      searchField.focus(); // Теперь фокусируемся на textarea
      headerSecond.classList.add('align-left');
  });

  if (closeBtn) {
      closeBtn.addEventListener('click', function () {
          navBtns.style.display = '';
          searchBtn.style.display = '';
          searchInput.style.display = 'none';
          searchField.value = ''; // Очищаем textarea
          headerSecond.classList.remove('align-left');
      });
  }
}

// Инициализация hamburger меню
function initHamburgerMenu() {
  // Ждем немного, чтобы HTML успел загрузиться
  setTimeout(() => {
      const hamburgerIcon = document.querySelector('.hamburger img');
      const hamburgerNav = document.querySelector('.hamburger-nav');

      // Проверяем, что элементы найдены
      if (!hamburgerIcon || !hamburgerNav) {
          console.error('Hamburger elements not found');
          return;
      }

      // Функция для переключения меню
      function toggleHamburgerMenu() {
          hamburgerNav.classList.toggle('active');
      }

      // Добавляем обработчик события на иконку
      hamburgerIcon.addEventListener('click', function (e) {
          e.preventDefault();
          toggleHamburgerMenu();
      });

      // Закрытие меню при клике вне его
      document.addEventListener('click', function (e) {
          if (!e.target.closest('.hamburger')) {
              hamburgerNav.classList.remove('active');
          }
      });

      // Закрытие меню при клике на ссылки внутри меню
      const navLinks = hamburgerNav.querySelectorAll('.nav-button');
      navLinks.forEach(link => {
          link.addEventListener('click', function () {
              hamburgerNav.classList.remove('active');
          });
      });

      console.log('Hamburger menu initialized successfully');
  }, 100);
}

function includeHTML(id, url, callback) {
  fetch(url)
      .then(response => response.text())
      .then(data => {
          document.getElementById(id).innerHTML = data;
          if (typeof callback === 'function') {
              callback();
          }
      })
      .catch(error => {
          console.error('Ошибка загрузки HTML:', error);
      });
}
initHamburgerMenu();