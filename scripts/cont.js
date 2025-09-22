// ========================================
// КАРТА ЯНДЕКС - СТРАНИЦА КОНТАКТОВ
// Относится к: cont.html - элемент #map
// CSS файл: cont.css
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    function initYandexMap() {
        const initialCenter = [55.7558, 37.6176];
        const map = new ymaps.Map('map', {
            center: initialCenter,
            zoom: 15,
            controls: [],
            suppressMapOpenBlock: true
        });
        map.behaviors.enable(['drag', 'multiTouch', 'scrollZoom']);

        // Убеждаемся, что прокрутка колёсиком мыши работает для карты
        mapContainer.addEventListener('wheel', (e) => {
            e.stopPropagation();
        }, { passive: true });

        const address = '105318, г. Москва, Семёновская площадь, д. 4, ст. м. Семёновская';

        // 1) Если заданы точные координаты в атрибутах, используем их
        const latAttr = mapContainer.getAttribute('data-lat');
        const lngAttr = mapContainer.getAttribute('data-lng');
        const zoomAttr = mapContainer.getAttribute('data-zoom');
        if (latAttr && lngAttr) {
            const coords = [parseFloat(latAttr), parseFloat(lngAttr)];
            const zoom = zoomAttr ? parseInt(zoomAttr, 10) : 17;
            map.setCenter(coords, zoom);
            const placemark = new ymaps.Placemark(coords, { balloonContent: address }, { preset: 'islands#redIcon' });
            map.geoObjects.add(placemark);
            return;
        }

        // 2) Иначе используем геокодер с уточнениями
        ymaps.geocode(address, { results: 1, kind: 'house' }).then((res) => {
            const firstGeoObject = res.geoObjects.get(0);
            let coords;
            if (firstGeoObject) {
                coords = firstGeoObject.geometry.getCoordinates();
            } else {
                // Фолбэк на координаты Семёновской площади
                coords = [55.799962, 37.705248];
            }
            map.setCenter(coords, 17);
            const placemark = new ymaps.Placemark(coords, { balloonContent: address }, { preset: 'islands#redIcon' });
            map.geoObjects.add(placemark);
        }).catch(() => {
            const coords = [55.799962, 37.705248];
            map.setCenter(coords, 17);
            const placemark = new ymaps.Placemark(coords, { balloonContent: address }, { preset: 'islands#redIcon' });
            map.geoObjects.add(placemark);
            
            // Дополнительное применение border-radius после загрузки
            setTimeout(() => {
                const mapElements = mapContainer.querySelectorAll('[class*="ymaps-2-1-79-map"], [class*="ymaps-2-1-80-map"]');
                mapElements.forEach(element => {
                    element.style.borderRadius = '12px';
                    element.style.overflow = 'hidden';
                });
            }, 500);
        });
    }

    if (typeof window.ymaps !== 'undefined') {
        ymaps.ready(initYandexMap);
    } else {
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU';
        script.onload = () => ymaps.ready(initYandexMap);
        document.head.appendChild(script);
    }
});