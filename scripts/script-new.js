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
        documents: '/documents'
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
    // Support absolute endpoints (full URLs) or relative endpoints appended to baseUrl
    const url = (typeof endpoint === 'string' && (endpoint.startsWith('http://') || endpoint.startsWith('https://')))
        ? endpoint
        : `${API_CONFIG.baseUrl}${endpoint}`;
    console.log(`📡 Запрос к: ${url}`);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });

        // Попытаемся прочитать тело ответа как текст
        const rawText = await response.text();
        let parsed = null;
        try {
            parsed = rawText ? JSON.parse(rawText) : null;
        } catch (e) {
            parsed = rawText || null;
        }

        if (!response.ok) {
            const err = new Error(`HTTP ${response.status}: ${response.statusText}`);
            err.status = response.status;
            err.response = parsed;
            console.error(`❌ Ошибка запроса к ${url}:`, err.message, parsed);
            throw err;
        }

        const data = parsed;
        console.log(`✅ Данные получены: ${Array.isArray(data) ? data.length + ' элементов' : 'объект'}`);
        return data;

    } catch (error) {
        // Если ошибка была выброшена выше, она уже логирована — повторно логируем для уверенности
        console.error(`❌ Ошибка запроса к ${url}:`, error.message, error.response ? error.response : '');
        throw error;
    }
}

// Безопасная обработка текста
function safeText(text, fallback = '') {
    return text && text.trim() ? text.trim() : fallback;
}

// Храним текущий poll id после загрузки
let currentPollId = null;

// Загружает опросы и устанавливает текст в .text-1-1-2
async function loadPollPrompt() {
    try {
        const polls = await makeApiRequest('https://terlynedev.space/api/polls/', { method: 'GET' });
        if (!polls) return;

        // polls может быть массивом или объектом; выберем первый активный
        let poll = null;
        if (Array.isArray(polls)) {
            poll = polls.find(p => p.is_active === true) || polls[0] || null;
        } else if (typeof polls === 'object') {
            // Если сервер вернул объект с полем results
            if (Array.isArray(polls.results) && polls.results.length) {
                poll = polls.results.find(p => p.is_active === true) || polls.results[0];
            } else {
                poll = polls;
            }
        }

        if (!poll) return;

        // Попытка найти поле темы
        const theme = safeText(poll.theme || poll.title || poll.name || poll.question || '');
        currentPollId = poll.id || poll.pk || poll.poll_id || poll._id || null;

        const el = document.querySelector('.text-1-1-2');
        if (el) {
            el.textContent = `Пройди опрос на тему: ${theme}`;
        }
    } catch (err) {
        console.warn('⚠️ Не удалось загрузить данные опроса:', err);
    }
}

// ========================================
// ФУНКЦИИ ЗАГРУЗКИ ДАННЫХ
// ========================================

// Загрузка документов
async function loadDocuments() {
    console.log('📚 Загружаем документы...');

    try {
        const documents = await makeApiRequest(API_CONFIG.endpoints.documents);

        if (!Array.isArray(documents)) {
            console.warn('⚠️ Ожидался массив документов, получено:', documents);
            return;
        }

        // Найдём секцию с документами
        const docsSection = document.querySelector('[data-content="docs"]');
        if (!docsSection) {
            console.warn('⚠️ Секция документов (data-content="docs") не найдена');
            return;
        }

        // Внутри секции обычно есть .cved, а в нём .docs-copr-plash2
        const cved = docsSection.querySelector('.cved') || docsSection;
        let docsList = cved.querySelector('.docs-copr-plash2');
        if (!docsList) {
            // Если контейнера нет, создаём его и вставляем внутрь .cved
            docsList = document.createElement('div');
            docsList.className = 'docs-copr-plash2';
            cved.appendChild(docsList);
        }

        // Очистим текущие статические элементы — заменим их результатами API
        docsList.innerHTML = '';

        documents.forEach((doc, idx) => {
            const id = doc.id || doc._id || `doc-${idx}`;
            const title = safeText(doc.title || doc.name || doc.filename || `Документ ${idx + 1}`);
            const filePath = doc.file_url || doc.file || doc.path || doc.document_url || doc.url || doc.image_url;
            let fileUrl = '#';
            if (filePath) {
                fileUrl = String(filePath).startsWith('http') ? filePath : `${API_CONFIG.filesPath}${filePath}`;
            }

            // Создаём структуру, соответствующую существующей разметке
            const a = document.createElement('a');
            a.href = fileUrl;
            a.target = '_blank';
            a.rel = 'noopener';

            const card = document.createElement('div');
            card.className = 'docs-copr-plash-3';

            card.innerHTML = `
                <p>${title}</p>
                <div class="after-img">
                    <img src="./public/docs-2.svg" alt="">
                </div>
            `;

            // Вставляем и даём возможность обработать клик, если нужно дополнительное поведение
            a.appendChild(card);
            docsList.appendChild(a);
        });

        console.log(`✅ Документов загружено и отрендерено: ${documents.length}`);
    } catch (error) {
        console.error('❌ Ошибка загрузки документов:', error.message);
    }
}

// Привязка обработчиков для секции тест (red-plash и red-plash-1)
function attachTestFormHandlers() {
    // feedback (red-plash) -> POST /feedbacks
    const red = document.querySelector('.red-plash');
    if (red) {
        const inputs = red.querySelectorAll('input.polaya');
        const textarea = red.querySelector('textarea.polaya');
        const btn = red.querySelector('.button-1');

        if (btn) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const name = inputs[0] ? inputs[0].value.trim() : '';
                const phone = inputs[1] ? inputs[1].value.trim() : '';
                const email = inputs[2] ? inputs[2].value.trim() : '';
                const message = textarea ? textarea.value.trim() : '';

                const payload = {
                    name,
                    phone,
                    email,
                    message,
                    source: 'index_red_plash'
                };

                try {
                    btn.classList.add('disabled');
                    btn.querySelector && (btn.querySelector('p') ? btn.querySelector('p').textContent = 'Отправляю...' : null);
                    await makeApiRequest('/feedbacks', {
                        method: 'POST',
                        body: JSON.stringify(payload)
                    });
                    console.log('✅ Feedback отправлен');
                    // небольшой визуальный отклик
                    if (btn.querySelector && btn.querySelector('p')) btn.querySelector('p').textContent = 'Отправлено';
                    setTimeout(() => {
                        if (btn.querySelector && btn.querySelector('p')) btn.querySelector('p').textContent = 'Отправить';
                        btn.classList.remove('disabled');
                    }, 2500);
                } catch (err) {
                    const formatted = formatApiError(err.response);
                    console.error('❌ Ошибка отправки feedback:', err, err.response ? err.response : '');
                    alert('Ошибка отправки.' + (formatted ? '\n' + formatted : '\nПопробуйте позже.'));
                    btn.classList.remove('disabled');
                    if (btn.querySelector && btn.querySelector('p')) btn.querySelector('p').textContent = 'Отправить';
                }
            });
        }
    }

    // poll (red-plash-1) -> POST /polls (assume poll_id = 2 as requested)
    const red1 = document.querySelector('.red-plash-1');
    if (red1) {
        const textarea = red1.querySelector('textarea.polaya-1');
        const btn = red1.querySelector('.button-1-2');

        if (btn) {
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                const answer = textarea ? textarea.value.trim() : '';
                if (!answer) {
                    alert('Пожалуйста, введите ответ');
                    return;
                }

                // Отправляем ответ на конкретный poll: POST https://terlynedev.space/api/polls/{poll_id}/answer/
                if (!currentPollId) {
                    alert('Опрос не загружен. Попробуйте обновить страницу.');
                    return;
                }

                const answerUrl = `https://terlynedev.space/api/polls/${encodeURIComponent(currentPollId)}/answers/`;

                try {
                    btn.classList.add('disabled');
                    btn.querySelector && (btn.querySelector('p') ? btn.querySelector('p').textContent = 'Отправляю...' : null);
                    await makeApiRequest(answerUrl, {
                        method: 'POST',
                        body: JSON.stringify({ answer_text: answer })
                    });
                    console.log('✅ Poll ответ отправлен');
                    if (btn.querySelector && btn.querySelector('p')) btn.querySelector('p').textContent = 'Отправлено';
                    setTimeout(() => {
                        if (btn.querySelector && btn.querySelector('p')) btn.querySelector('p').textContent = 'Отправить';
                        btn.classList.remove('disabled');
                        if (textarea) textarea.value = '';
                    }, 2500);
                } catch (err) {
                    const formatted = formatApiError(err.response);
                    console.error('❌ Ошибка отправки poll:', err, err.response ? err.response : '');
                    alert('Ошибка отправки.' + (formatted ? '\n' + formatted : '\nПопробуйте позже.'));
                    btn.classList.remove('disabled');
                    if (btn.querySelector && btn.querySelector('p')) btn.querySelector('p').textContent = 'Отправить';
                }
            });
        }
    }
}



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
    const min_text = safeText(project.min_text, 'Описание отсутствует');
    const project_url = safeText(project.project_url, '#');
    const shortText = min_text.length > 100 ? min_text.substring(0, 100) + '...' : min_text;
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
        <div class="project-card-content" >
            <p class="project-title">${title}</p>
            <div class="project-card-down">
                <p class="project-text" data-full-text="${min_text}" onclick="toggleText(this)">
                    ${min_text}
                </p>
                <a href="${project_url}" class="project-body-button">
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
    const news_url = safeText(newsItem.news_url, '#');
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
        <a href="${news_url}" class="button-nov">
            <button>
                <p class="p1">Читать полностью</p>
            </button>
        </a>
    `;
    
    container.appendChild(card);
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

    // Привязываем обработчики тестовой секции (если элементы уже в DOM)
    // Небольшая задержка чтобы includeHTML успел вставить содержимое
    setTimeout(() => {
        try {
            attachTestFormHandlers();
            // попытка заранее загрузить информацию об опросе
            loadPollPrompt();
        } catch (err) {
            console.warn('⚠️ Ошибка при привязке обработчиков тестовой секции:', err);
        }
    }, 200);
    
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
                loadNews(),
                loadDocuments()
            ]);
            console.log('🎉 Все данные загружены успешно!');
        } catch (error) {
            console.error('❌ Ошибка при загрузке данных:', error);
        }
    }, 100);
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', initApp);
