// ========================================
// ФУНКЦИИ ХЕДЕРА - ОБЩИЕ ФУНКЦИИ
// Относится к: все страницы - header.html
// ========================================
	function initHeaderSearch() {
		const headerSecond = document.querySelector('.header-second');
		if (!headerSecond || headerSecond.dataset.searchInited === '1') {
			return;
		}

		const searchBtn = document.getElementById('search-button');
		const navBtns = document.getElementById('nav-buttons');
		const searchInput = document.getElementById('search-input-container');
		const closeBtn = document.getElementById('close-search');
		const humBtn = document.getElementById('hum');

    if (!searchBtn || !navBtns || !searchInput || !headerSecond) {
        console.error('Не все элементы для поиска найдены');
        return;
    }

		const searchField = searchInput.querySelector('.tex');
    if (!searchField) {
        console.error('Поле поиска (.tex) не найдено');
        return;
    }

    searchBtn.addEventListener('click', () => {
        navBtns.style.display = 'none';
        searchBtn.style.display = 'none';
        searchInput.style.display = 'flex';
        searchField.focus();
        headerSecond.classList.add('align-left');
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            navBtns.style.display = '';
            searchBtn.style.display = '';
            searchInput.style.display = 'none';
            searchField.value = '';
            headerSecond.classList.remove('align-left');
        });
    }

		if (humBtn) {
        humBtn.addEventListener('click', () => {
            navBtns.style.display = '';
            searchBtn.style.display = '';
            searchInput.style.display = 'none';
            searchField.value = '';
            headerSecond.classList.remove('align-left');
        });
    }

		headerSecond.dataset.searchInited = '1';
}

// Инициализация hamburger меню
	function initHamburgerMenu() {
		const hamburgerRoot = document.querySelector('.hamburger');
		if (!hamburgerRoot || hamburgerRoot.dataset.hamburgerInited === '1') {
			return;
		}

		const hamburgerIcon = hamburgerRoot.querySelector('img');
		const hamburgerNav = hamburgerRoot.querySelector('.hamburger-nav');

		if (!hamburgerIcon || !hamburgerNav) {
			console.error('Hamburger elements not found');
			return;
		}

    function toggleHamburgerMenu() {
        console.log('Toggling hamburger menu'); // Лог для отладки
        hamburgerNav.classList.toggle('active');
        hamburgerIcon.classList.toggle('active'); // Добавляем/удаляем класс active для иконки
    }

    // Обработчики для click и touchstart
		['click', 'touchstart'].forEach(event => {
        hamburgerIcon.addEventListener(event, (e) => {
				e.preventDefault();
				e.stopPropagation();
            console.log(`${event} event triggered on hamburger icon`); // Лог для отладки
            toggleHamburgerMenu();
        });
    });

    // Закрытие меню при клике вне его
    document.addEventListener('click', (e) => {
        // Исключаем клики по элементам карусели и другим интерактивным элементам
        if (!e.target.closest('.hamburger') && 
            !e.target.closest('.hamburger-nav') &&
            !e.target.closest('.carousel-btn') &&
            !e.target.closest('.carousel-container') &&
            !e.target.closest('.dot')) {
            console.log('Click outside hamburger, closing menu'); // Лог для отладки
            hamburgerNav.classList.remove('active');
            hamburgerIcon.classList.remove('active');
        }
    });

    // Закрытие меню при клике на ссылки внутри меню
		const navLinks = hamburgerNav.querySelectorAll('.nav-button');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            console.log('Nav link clicked, closing menu'); // Лог для отладки
            hamburgerNav.classList.remove('active');
            hamburgerIcon.classList.remove('active');
        });
    });

    console.log('Hamburger menu initialized successfully');
		hamburgerRoot.dataset.hamburgerInited = '1';
}
// Инициализация происходит из scripts/script.js после includeHTML('header', ...)