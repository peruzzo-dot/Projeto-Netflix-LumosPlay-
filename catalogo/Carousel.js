import { createCard } from './js/Card.js';
import { featured as featuredKey, hideFeaturedInLists } from './data.js';

export function createCarousel(category) {
    console.log('createCarousel:', category && category.title, 'items:', category && category.items && category.items.length);
    const section = document.createElement('div');
    section.className = 'slider-section';

    // Header for Title and Indicators
    const header = document.createElement('div');
    header.className = 'slider-header';

    const title = document.createElement('h2');
    title.className = 'slider-title';
    title.innerText = category.title;

    const indicators = document.createElement('div');
    indicators.className = 'slider-indicators';

    header.appendChild(title);
    header.appendChild(indicators);
    section.appendChild(header);

    const row = document.createElement('div');
    row.className = 'movie-row';

    category.items.forEach(item => {
        // Optionally skip the featured item when hideFeaturedInLists is true.
        if (hideFeaturedInLists && item) {
            const isFeaturedById = (item.id && featuredKey && item.id === featuredKey);
            const isFeaturedByTitle = (item.title && featuredKey && item.title.toString().toLowerCase() === featuredKey.toString().toLowerCase());
            const isFeaturedFlag = !!item.featured;
            if (isFeaturedById || isFeaturedByTitle || isFeaturedFlag) return;
        }
        const card = createCard(item);
        row.appendChild(card);
    });

    section.appendChild(row);
    // Add left/right controls for this row (prev/next) like Netflix
    const controls = document.createElement('div');
    controls.className = 'row-controls';
    const prev = document.createElement('button');
    prev.className = 'row-prev';
    prev.setAttribute('aria-label', 'Anterior');
    prev.innerHTML = '&#x2039;';
    const next = document.createElement('button');
    next.className = 'row-next';
    next.setAttribute('aria-label', 'Próximo');
    next.innerHTML = '&#x203A;';
    controls.appendChild(prev);
    controls.appendChild(next);
    section.appendChild(controls);

    // Wiring the scroll behavior
    prev.addEventListener('click', () => {
        // scroll left by 85% of the visible width
        row.scrollBy({ left: -Math.floor(row.clientWidth * 0.85), behavior: 'smooth' });
    });
    next.addEventListener('click', () => {
        row.scrollBy({ left: Math.floor(row.clientWidth * 0.85), behavior: 'smooth' });
    });
    return section;
}
