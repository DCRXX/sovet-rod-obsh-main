document.addEventListener('DOMContentLoaded', function () {
    // --- Меню ---
    const spisItems = document.querySelectorAll('.spis-item');
    const contents = document.querySelectorAll('.us-content');
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

    // --- Календарь с модалками выбора месяца и года ---
    const kalen = document.querySelector('.Kalen');
    if (!kalen) return;
    const mBtn = kalen.querySelector('.m');
    const nBtn = kalen.querySelector('.n');
    const mText = mBtn.querySelector('p');
    const nText = nBtn.querySelector('p');
    const daysContainer = kalen.querySelector('.cisl');
    const modalMonth = document.getElementById('modal-month');
    const modalYear = document.getElementById('modal-year');
    const monthList = document.getElementById('modal-month-list');
    const yearList = document.getElementById('modal-year-list');
    const months = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'];
    let selectedMonth = 8, selectedYear = 2025;
    const now = new Date();
    const years = Array.from({length: 11}, (_,i) => now.getFullYear()-5+i);

    function updateDisplays() {
        mText.textContent = months[selectedMonth];
        nText.textContent = selectedYear;
    }
    function getDaysInMonth(year, month) {
        if (month === 1) return ((year%4===0&&year%100!==0)||(year%400===0))?29:28;
        if ([3,5,8,10].includes(month)) return 30;
        return 31;
    }
    function renderDays(year, month) {
        const days = getDaysInMonth(year, month);
        const datas = Array.from(daysContainer.querySelectorAll('.data'));
        // Если есть .data, распределяем дни по ним
        if (datas.length) {
            for (let i = 0; i < days; i++) {
                if (datas[i]) {
                    datas[i].innerHTML = `<div class=\"calendar-day\" data-day=\"${i+1}\">${i+1}</div>`;
                } else {
                    // Если дней больше, чем .data, создаём новые
                    const div = document.createElement('div');
                    div.className = 'data';
                    div.innerHTML = `<div class=\"calendar-day\" data-day=\"${i+1}\">${i+1}</div>`;
                    daysContainer.appendChild(div);
                }
            }
            // Если .data больше, чем дней, очищаем лишние
            for (let i = days; i < datas.length; i++) {
                datas[i].innerHTML = '';
            }
        } else {
            // Если .data нет, как раньше
            daysContainer.innerHTML = Array.from({length:days}, (_,d) => `<div class=\"calendar-day\" data-day=\"${d+1}\">${d+1}</div>`).join('');
        }
    }
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
    mBtn.addEventListener('click', () => {
        renderList(monthList, months, selectedMonth, 'modal-month-item', (i) => {
            selectedMonth = i;
            updateDisplays();
            renderDays(selectedYear, selectedMonth);
            modalMonth.style.display = 'none';
        });
        modalMonth.style.display = 'flex';
    });
    nBtn.addEventListener('click', () => {
        renderList(yearList, years, years.indexOf(selectedYear), 'modal-year-item', (_, val) => {
            selectedYear = val;
            updateDisplays();
            renderDays(selectedYear, selectedMonth);
            modalYear.style.display = 'none';
        });
        modalYear.style.display = 'flex';
    });
    window.addEventListener('click', (e) => {
        if (modalMonth.style.display === 'flex' && !modalMonth.querySelector('.modal-content').contains(e.target) && !mBtn.contains(e.target)) {
            modalMonth.style.display = 'none';
        }
        if (modalYear.style.display === 'flex' && !modalYear.querySelector('.modal-content').contains(e.target) && !nBtn.contains(e.target)) {
            modalYear.style.display = 'none';
        }
    });
    daysContainer.addEventListener('click', function(e) {
        if (e.target.classList.contains('calendar-day')) {
            daysContainer.querySelectorAll('.calendar-day').forEach(day => day.classList.remove('selected'));
            e.target.classList.add('selected');
        }
    });
    updateDisplays();
    renderDays(selectedYear, selectedMonth);

    // Горизонтальный скролл колесом мыши для .cisl
    const cisl = document.querySelector('.Kalen .cisl');
    const SCROLL_SPEED = 4; // Измени это число для своей скорости (1 = стандартно, 2 = в 2 раза быстрее и т.д.)

    if (cisl) {
        cisl.addEventListener('wheel', function(e) {
            if (e.deltaY !== 0) {
                e.preventDefault();
                cisl.scrollLeft += e.deltaY * SCROLL_SPEED;
            }
        }, { passive: false });
    }

    // --- Выделение даты и вывод мероприятий ---
    function renderTabs(events) {
        const tabl = document.querySelector('.tabl');
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
    // Клик по .data в .cisl
    if (daysContainer) {
        daysContainer.addEventListener('click', function(e) {
            const dataEl = e.target.closest('.data');
            if (dataEl) {
                daysContainer.querySelectorAll('.data').forEach(d => d.classList.remove('selected'));
                dataEl.classList.add('selected');
                renderTabs([]); // Здесь потом будут данные из БД по выбранной дате
            }
        });
    }
});
