document.addEventListener('DOMContentLoaded', () => {
    // ========================================
    // ОБРАБОТКА ТЕЛЕФОНА - ОБЩАЯ ФУНКЦИЯ
    // ========================================
    const phoneElement = document.querySelector('.phone');
    const notification = document.getElementById('copyNotification');

    function isMobileOrTablet() {
        return window.innerWidth <= 1024;
    }

    if (phoneElement) {
        phoneElement.addEventListener('click', function() {
            if (!isMobileOrTablet()) {
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
                window.location.href = 'tel:+89166939530';
            }
        });
    }
});

// ========================================
// КОНФИГУРАЦИЯ API
// ========================================
const API_CONFIG = {
    baseUrl: 'https://terlynedev.space/api',
    filesPath: 'https://terlynedev.space/api/files/', // путь к файлам баннеров и новостей
    endpoints: {
        banners: '/banners/',
        projects: '/projects',
        news: '/news',
        feedbacks: '/feedbacks'
    },
    timeout: 5000 // 10 секунд
};

// ========================================
// УТИЛИТЫ ДЛЯ API
// ========================================

// Проверка подключения к API
async function checkApiConnection() {
    console.log('🔍 Проверяем подключение к API...');
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
        
        const response = await fetch(API_CONFIG.baseUrl, {
            method: 'HEAD',
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok || response.status === 404) { // 404 тоже означает что сервер доступен
            console.log('✅ API доступен');
            return true;
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('❌ Ошибка подключения к API:', error.message);
        return false;
    }
}

// Показать ошибку подключения пользователю
function showConnectionError() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'api-connection-error';
    errorDiv.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: #f8d7da;
        color: #721c24;
        padding: 15px;
        text-align: center;
        border-bottom: 2px solid #f5c6cb;
        z-index: 9999;
        font-family: Arial, sans-serif;
        font-size: 14px;
    `;
    errorDiv.innerHTML = `
        <strong>⚠️ Ошибка подключения к серверу</strong><br>
        <small>Проверьте интернет-соединение или попробуйте обновить страницу</small>
    `;
    
    document.body.insertBefore(errorDiv, document.body.firstChild);
    
    // Сдвигаем контент вниз
    document.body.style.paddingTop = '70px';
}

// Общая функция для API запросов
async function makeApiRequest(endpoint, options = {}) {
    const url = `${API_CONFIG.baseUrl}${endpoint}`;
    console.log(`📡 Запрос к: ${url}`);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`✅ Данные получены: ${Array.isArray(data) ? data.length + ' элементов' : 'объект'}`);
        return data;
        
    } catch (error) {
        console.error(`❌ Ошибка запроса к ${url}:`, error.message);
        throw error;
    }
}

// Безопасная обработка текста
function safeText(text, fallback = '') {
    return text && text.trim() ? text.trim() : fallback;
}

// ========================================
// ФУНКЦИИ ЗАГРУЗКИ ДАННЫХ
// ========================================

// Загрузка баннеров
async function loadBanners() {
    console.log('🎯 Загружаем баннеры...');
    
    try {
        const banners = await makeApiRequest(API_CONFIG.endpoints.banners);
        
        // Фильтрация и сортировка
        const activeBanners = banners
            .filter(banner => banner.is_active === true)
            .sort((a, b) => {
                const orderA = a.count_order || 999;
                const orderB = b.count_order || 999;
                return orderA !== orderB ? orderA - orderB : a.id.localeCompare(b.id);
            });
        
        console.log(`📊 Активных баннеров: ${activeBanners.length}`);
        
        const carouselSlides = document.querySelector('.carousel-slides');
        if (!carouselSlides) {
            console.warn('⚠️ Контейнер для баннеров не найден');
            return;
        }
        
        carouselSlides.innerHTML = '';
        
        if (activeBanners.length === 0) {
            createDefaultSlide(carouselSlides);
        } else {
            activeBanners.forEach((banner, index) => createBannerSlide(banner, index, carouselSlides));
        }
        
        // Инициализация карусели
        if (typeof window.initCarousel === 'function') {
            window.initCarousel();
        }
        
        console.log('✅ Баннеры загружены успешно');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки баннеров:', error.message);
        const carouselSlides = document.querySelector('.carousel-slides');
        if (carouselSlides) {
            createDefaultSlide(carouselSlides);
        }
    }
}



// Создание слайда баннера
function createBannerSlide(banner, index, container) {
    const slide = document.createElement('div');
    slide.className = index === 0 ? 'carousel-slide active' : 'carousel-slide';

    const title = safeText(banner.title);
    const description = safeText(banner.description);
        let imageUrl = banner.image_url ? `${API_CONFIG.filesPath}${banner.image_url}` : null;
    const url = safeText(banner.redirect_url, '#');

    // Особая обработка для баннера с id '0993290b-ca49-4167-9ac8-0b36fd69a4f9'
    let imgTag = '';
        if (imageUrl) {
            imgTag = `<img src="${imageUrl}" alt="${title || 'Banner'}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">`;
            imgTag += `<div class="banner-img-error" style="display:none; color:red; background:#ffe6e6; padding:8px; text-align:center;">❌ Ошибка загрузки изображения баннера</div>`;
        } else {
            imgTag = `<div class="banner-img-error" style="color:red; background:#ffe6e6; padding:8px; text-align:center;">❌ Изображение баннера не указано</div>`;
        }

    slide.innerHTML = `
        ${imgTag}
        ${title || description ? `
            <div class="text-overlay">
                ${title ? `<div class="text-block1">${title}</div>` : ''}
                ${description ? `<div class="text-block2">${description}</div>` : ''}
            </div>
        ` : ''}
    `;

    container.appendChild(slide);
}

// Загрузка проектов
async function loadProjects() {
    console.log('📋 Загружаем проекты...');
    
    try {
        const projects = await makeApiRequest(API_CONFIG.endpoints.projects);
        
        const container = document.querySelector('.project-body');
        if (!container) {
            console.warn('⚠️ Контейнер для проектов не найден');
            return;
        }
        
        console.log(`📊 Проектов получено: ${projects.length}`);
        
        projects.forEach(project => createProjectCard(project, container));
        
        console.log('✅ Проекты загружены успешно');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки проектов:', error.message);
    }
}

// Создание карточки проекта
function createProjectCard(project, container) {
    const title = safeText(project.title, 'Проект без названия');
    const body = safeText(project.body, 'Описание отсутствует');
    const url = safeText(project.redirect_url, '#');
    const shortText = body.length > 100 ? body.substring(0, 100) + '...' : body;
    const card = document.createElement('div');
    card.className = 'project-card';

    // Формируем URL для изображения
    const imageUrl = project.image_url ?
        `${API_CONFIG.filesPath}${project.image_url}` :
        './public/glavnaya.svg';

    // Устанавливаем background-image через CSS
    card.style.backgroundImage = `url('${imageUrl}')`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';
    card.style.backgroundRepeat = 'no-repeat';

    card.innerHTML = `
        <div class="project-card-content">
            <p class="project-title">${title}</p>
            <div class="project-card-down">
                <p class="project-text" data-full-text="${body}" onclick="toggleText(this)">
                    ${shortText}
                </p>
                <a href="${url}" class="project-body-button">
                    <p>Подробнее</p>
                </a>
            </div>
        </div>
    `;
    
    container.appendChild(card);
}

// Загрузка новостей
async function loadNews() {
    console.log('📰 Загружаем новости...');
    
    try {
        const news = await makeApiRequest(API_CONFIG.endpoints.news);
        
        const container = document.querySelector('.NOV .KAR-NOV');
        if (!container) {
            console.warn('⚠️ Контейнер для новостей не найден');
            return;
        }
        
        container.innerHTML = '';
        console.log(`📊 Новостей получено: ${news.length}`);
        
        news.forEach(newsItem => createNewsCard(newsItem, container));
        
        console.log('✅ Новости загружены успешно');
        
    } catch (error) {
        console.error('❌ Ошибка загрузки новостей:', error.message);
    }
}

// Создание карточки новости
function createNewsCard(newsItem, container) {
    const title = safeText(newsItem.title, 'Новость без заголовка');
    const fullText = safeText(newsItem.min_text, 'Описание отсутствует');
    const url = safeText(newsItem.redirect_url, '#');
    const date = newsItem.news_date ? 
        new Date(newsItem.news_date).toLocaleDateString() : 
        'Дата не указана';
    const imageUrl = newsItem.image_url ? 
        `${API_CONFIG.filesPath}${newsItem.image_url}`  
            : './public/news-placeholder.svg';
    const shortText = fullText.length > 100 ? fullText.substring(0, 100) + '...' : fullText;
    const card = document.createElement('div');
    card.className = 'Bloc-b';
    card.innerHTML = `
        <img src="${imageUrl}" draggable="false" onerror="this.src='./public/news-placeholder.svg';">
        <div class="text">
            <p>${date}</p>
            <h2>${title}</h2>
            <p class="p2" data-full-text="${fullText}" onclick="toggleText(this)">${shortText}</p>
        </div>
        <a href="${url}" class="button-nov">
            <button>
                <p class="p1">Читать полностью</p>
            </button>
        </a>
    `;
    
    container.appendChild(card);
}

// Отправка обратной связи
function submitFeedback() {
    const formData = {
        first_name: document.getElementById('fb-firstname')?.value || '',
        middle_name: document.getElementById('fb-middlename')?.value || '',
        last_name: document.getElementById('fb-lastname')?.value || '',
        email: document.getElementById('fb-email')?.value || '',
        message: document.getElementById('fb-message')?.value || ''
    };
    
    makeApiRequest(API_CONFIG.endpoints.feedbacks, {
        method: 'POST',
        body: JSON.stringify(formData)
    })
    .then(() => {
        alert('Спасибо за ваш отзыв!');
        // Очистка формы
        Object.keys(formData).forEach(key => {
            const element = document.getElementById(`fb-${key.replace('_', '')}`);
            if (element) element.value = '';
        });
    })
    .catch(error => {
        console.error('❌ Ошибка отправки формы:', error.message);
        alert('Произошла ошибка при отправке. Попробуйте позже.');
    });
}

// ========================================
// ЗАГРУЗКА HTML КОМПОНЕНТОВ
// ========================================
function includeHTML(id, url, callback) {
    fetch(url)
        .then(response => response.text())
        .then(data => {
            document.getElementById(id).innerHTML = data;
            if (typeof callback === 'function') callback();
        })
        .catch(error => console.error(`Ошибка загрузки ${url}:`, error));
}

// ========================================
// ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ
// ========================================
async function initApp() {
    console.log('🚀 Инициализация приложения...');
    
    // Загружаем HTML компоненты
    includeHTML('header', 'header.html', () => {
        if (typeof initHamburgerMenu === 'function') initHamburgerMenu();
        if (typeof initHeaderSearch === 'function') initHeaderSearch();
    });
    
    includeHTML('footer', 'footer.html', () => {
        if (typeof initUpButton === 'function') initUpButton();
    });
    
    // Проверяем подключение к API
    const isConnected = await checkApiConnection();
    
    if (!isConnected) {
        showConnectionError();
        console.error('🛑 Загрузка данных остановлена из-за проблем с подключением');
        return;
    }
    
    // Загружаем данные с небольшой задержкой для полной загрузки HTML
    setTimeout(async () => {
        try {
            await Promise.all([
                loadBanners(),
                loadProjects(),
                loadNews()
            ]);
            console.log('🎉 Все данные загружены успешно!');
        } catch (error) {
            console.error('❌ Ошибка при загрузке данных:', error);
        }
    }, 100);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
