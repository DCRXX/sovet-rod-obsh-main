document.addEventListener('DOMContentLoaded', () => {
    // ========================================
    // ОБРАБОТКА ТЕЛЕФОНА - ОБЩАЯ ФУНКЦИЯ
    // Относится к: все страницы - элементы с классом .phone
    // ========================================
    const phoneElement = document.querySelector('.phone');
    const notification = document.getElementById('copyNotification');

    // Функция проверки, является ли устройство мобильным или планшетом
    function isMobileOrTablet() {
        return window.innerWidth <= 1024;
    }

    // Обработчик клика по номеру телефона
    if (phoneElement) {
        phoneElement.addEventListener('click', function() {
            if (!isMobileOrTablet()) {
                // Копирование номера телефона на десктопе
                const phone = this.getAttribute('data-phone');
                notification.classList.remove('show', 'hide');
                notification.style.display = 'none';

                navigator.clipboard.writeText(phone).then(() => {
                    notification.style.display = 'block';
                    notification.classList.add('show');
                    setTimeout(() => {
                        notification.classList.remove('show');
                        notification.classList.add('hide');
                        setTimeout(() => {
                            notification.style.display = 'none';
                        }, 300);
                    }, 4000);
                }).catch(err => {
                    console.error('Ошибка копирования: ', err);
                });
            } else {
                // Переход к звонку на мобильных устройствах
                window.location.href = 'tel:+89166939530';
            }
        });
    }

    

});


// ========================================
// ФУНКЦИЯ ЗАГРУЗКИ HTML - ОБЩАЯ ФУНКЦИЯ
// Относится к: все страницы - загрузка header.html и footer.html
// ========================================
function includeHTML(id, url, callback) {
    fetch(url)
      .then(response => response.text())
      .then(data => {
        document.getElementById(id).innerHTML = data;
        if (typeof callback === 'function') callback();
      });
}

// Загрузка хедера и футера на всех страницах
includeHTML('header', 'header.html', () => {
    // Инициализация функций хедера после загрузки
    if (typeof initHamburgerMenu === 'function') {
        initHamburgerMenu();
    }
    if (typeof initHeaderSearch === 'function') {
        initHeaderSearch();
    }
});
includeHTML('footer', 'footer.html', () => {
    // Инициализация функций футера после загрузки
    if (typeof initUpButton === 'function') {
        initUpButton();
    }
});




