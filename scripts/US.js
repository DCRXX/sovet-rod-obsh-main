document.addEventListener('DOMContentLoaded', function () {
    // --- Меню ---
    const spisItems = document.querySelectorAll('.spis-item');
    const contents = document.querySelectorAll('[data-content]');
    const spisContainer = document.querySelector('.spis');

    function setActive(name) {
        // Устанавливаем активный класс для пункта меню
        spisItems.forEach(item => item.classList.toggle('active', item.id === 'spis-' + name));
        // Показываем/скрываем содержимое
        contents.forEach(block => {
            block.style.display = (block.dataset.content === name) ? 'flex' : 'none';
        });
        // Инициализация карусели только для вкладки "otz"
        if (name === 'otz') {
            initializeCarousel();
        }
    }

    // Добавляем обработчики кликов для ссылок меню
    document.querySelectorAll('.spis a[data-spis]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            setActive(this.getAttribute('data-spis'));
        });
    });

    // Прокрутка меню с помощью колесика мыши
    if (spisContainer) {
        spisContainer.addEventListener('wheel', (e) => {
            e.preventDefault(); // Предотвращаем стандартную вертикальную прокрутку
            const scrollAmount = e.deltaY * 2; // Умножаем для более заметной прокрутки
            spisContainer.scrollLeft += scrollAmount; // Изменяем горизонтальную прокрутку
        });
    }

    // Устанавливаем начальное состояние (показываем "main")
    setActive('main');

    // --- Календарь с модалками выбора месяца и года (поддержка нескольких .Kalen) ---
    const kalens = Array.from(document.querySelectorAll('.Kalen'));
    if (!kalens.length) return;

    // Получаем или создаём модальные окна, если их нет на странице
    function ensureModals() {
        let modalMonth = document.getElementById('modal-month');
        let modalYear = document.getElementById('modal-year');
        if (!modalMonth) {
            modalMonth = document.createElement('div');
            modalMonth.id = 'modal-month';
            modalMonth.className = 'modal-select';
            modalMonth.style.display = 'none';
            modalMonth.innerHTML = '<div class="modal-content"><div id="modal-month-list"></div></div>';
            document.body.appendChild(modalMonth);
        }
        if (!modalYear) {
            modalYear = document.createElement('div');
            modalYear.id = 'modal-year';
            modalYear.className = 'modal-select';
            modalYear.style.display = 'none';
            modalYear.innerHTML = '<div class="modal-content"><div id="modal-year-list"></div></div>';
            document.body.appendChild(modalYear);
        }
        return {
            modalMonth,
            modalYear,
            monthList: modalMonth.querySelector('#modal-month-list'),
            yearList: modalYear.querySelector('#modal-year-list')
        };
    }

    const { modalMonth, modalYear, monthList, yearList } = ensureModals();
    const months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    const now = new Date();
    const years = Array.from({ length: 11 }, (_, i) => now.getFullYear() - 5 + i);

    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    function renderList(list, items, selectedIdx, itemClass, onSelect) {
        list.innerHTML = '';
        items.forEach((val, i) => {
            const div = document.createElement('div');
            div.className = itemClass + (i === selectedIdx ? ' selected' : '');
            div.textContent = val;
            div.addEventListener('click', () => onSelect(i, val));
            list.appendChild(div);
        });
    }

    function initCalendar(kalenEl) {
        const mBtn = kalenEl.querySelector('.m');
        const nBtn = kalenEl.querySelector('.n');
        if (!mBtn || !nBtn) return; // некорректная разметка
        const mText = mBtn.querySelector('p');
        const nText = nBtn.querySelector('p');
        const daysContainer = kalenEl.querySelector('.cisl');
        let selectedMonth = 8, selectedYear = 2025;

        const updateDisplays = () => {
            if (mText) mText.textContent = months[selectedMonth];
            if (nText) nText.textContent = selectedYear;
        };
        function renderDays(year, month) {
            const days = getDaysInMonth(year, month);
            const datas = Array.from(daysContainer.querySelectorAll('.data'));
            if (datas.length) {
                for (let i = 0; i < days; i++) {
                    if (datas[i]) {
                        datas[i].innerHTML = `<div class=\"calendar-day\" data-day=\"${i+1}\">${i+1}</div>`;
                    } else {
                        const div = document.createElement('div');
                        div.className = 'data';
                        div.innerHTML = `<div class=\"calendar-day\" data-day=\"${i+1}\">${i+1}</div>`;
                        daysContainer.appendChild(div);
                    }
                }
                for (let i = days; i < datas.length; i++) {
                    datas[i].innerHTML = '';
                }
            } else {
                daysContainer.innerHTML = Array.from({length:days}, (_,d) => `<div class=\"calendar-day\" data-day=\"${d+1}\">${d+1}</div>`).join('');
            }
        }
        function findTablForCalendar() {
            // ищем ближайший следующий элемент .tabl после kalenEl
            let node = kalenEl.nextElementSibling;
            while (node) {
                if (node.classList && node.classList.contains('tabl')) return node;
                node = node.nextElementSibling;
            }
            return null;
        }
        function renderTabsForCalendar(events) {
            const tabl = findTablForCalendar();
            if (!tabl) return;
            tabl.innerHTML = '';
            if (!events || !events.length) {
                for (let i = 0; i < 5; i++) {
                    const div = document.createElement('div');
                    div.className = 'tab';
                    div.textContent = 'Мероприятий нет';
                    tabl.appendChild(div);
                }
            } else {
                events.forEach(ev => {
                    const div = document.createElement('div');
                    div.className = 'tab';
                    div.textContent = ev;
                    tabl.appendChild(div);
                });
            }
        }

        mBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            renderList(monthList, months, selectedMonth, 'modal-month-item', (i) => {
                selectedMonth = i;
                updateDisplays();
                renderDays(selectedYear, selectedMonth);
                modalMonth.style.display = 'none';
            });
            modalMonth.style.display = 'flex';
        });
        nBtn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            renderList(yearList, years, years.indexOf(selectedYear), 'modal-year-item', (_, val) => {
                selectedYear = val;
                updateDisplays();
                renderDays(selectedYear, selectedMonth);
                modalYear.style.display = 'none';
            });
            modalYear.style.display = 'flex';
        });
        daysContainer.addEventListener('click', function(e) {
            if (e.target.classList.contains('calendar-day')) {
                daysContainer.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('selected'));
                e.target.classList.add('selected');
            }
            const dataEl = e.target.closest('.data');
            if (dataEl) {
                daysContainer.querySelectorAll('.data').forEach(d => d.classList.remove('selected'));
                dataEl.classList.add('selected');
                renderTabsForCalendar([]);
            }
        });

        // Горизонтальный скролл колесом мыши для конкретного .cisl
        const SCROLL_SPEED = 4;
        if (daysContainer) {
            daysContainer.addEventListener('wheel', function(e) {
                if (e.deltaY !== 0) {
                    e.preventDefault();
                    daysContainer.scrollLeft += e.deltaY * SCROLL_SPEED;
                }
            }, { passive: false });
        }

        updateDisplays();
        renderDays(selectedYear, selectedMonth);
    }

    // Глобальные обработчики закрытия модалок
    window.addEventListener('click', (e) => {
        const clickedOnM = !!e.target.closest('.m');
        const clickedOnN = !!e.target.closest('.n');
        if (modalMonth.style.display === 'flex' && !modalMonth.querySelector('.modal-content').contains(e.target) && !clickedOnM) {
            modalMonth.style.display = 'none';
        }
        if (modalYear.style.display === 'flex' && !modalYear.querySelector('.modal-content').contains(e.target) && !clickedOnN) {
            modalYear.style.display = 'none';
        }
    });

    kalens.forEach(initCalendar);

    // Горизонтальный скролл колесом мыши для .spis при узком экране
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
