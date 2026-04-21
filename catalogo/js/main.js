import { categories, featured as featuredKey } from "../data.js";
import { createCarousel } from "../Carousel.js";

// Debug: log categories to help diagnose missing items
console.log('LumosPlay — categories loaded:', Array.isArray(categories) ? categories.length : 'NO CATEGORIES');

document.addEventListener('DOMContentLoaded', () => {
    // Recupera informações do perfil ativo (se houver)
    const nomePerfil = localStorage.getItem('perfilAtivoNome');
    const imagemPerfil = localStorage.getItem('perfilAtivoImagem');

    if (nomePerfil && imagemPerfil) {
        const kidsLink = document.querySelector('.kids-link');
        const profileIcon = document.querySelector('.profile-icon');
        if (kidsLink) kidsLink.textContent = nomePerfil;
        if (profileIcon) {
            // Ajusta o caminho da imagem dependendo do formato armazenado
            let imgPath = imagemPerfil;
            if (!imagemPerfil.includes('/') && !imagemPerfil.startsWith('http')) {
                // se for apenas o nome do arquivo, monta o caminho relativo correto a partir de catalogo/
                imgPath = '../assets/' + imagemPerfil;
            } else if (imagemPerfil.startsWith('assets/')) {
                // armazenado como 'assets/perfil-1.jpg' -> ajusta para '../assets/...'
                imgPath = '../' + imagemPerfil;
            } else if (imagemPerfil.startsWith('/assets/')) {
                // armazenado como '/assets/perfil-1.jpg' (raiz) -> torna relativo
                imgPath = '..' + imagemPerfil;
            }
            profileIcon.src = imgPath;
        }
    }

    // Injeta as carousels/categories na página
    const container = document.getElementById('main-content');
    if (container) {
        // Attempt to initialise featured media (YouTube iframe preferred, mp4 fallback)
        let featuredYouTubeId = null;
        try {
            const featuredVideo = document.getElementById('featured-video');
            const featuredIframe = document.getElementById('featured-iframe');
            const featPlayBtn = document.getElementById('feat-play');
            const featTitle = document.querySelector('.featured-title');
            const featSub = document.querySelector('.featured-sub');

            // Determine the featured item:
            // 1) If a `featured` key is exported from data.js, try to find that item by id or title.
            // 2) Otherwise look for a known trailer/title ('Perfil Falso' or the YouTube id).
            // 3) Finally, fall back to the first item of the first category.
            const preferredId = 'MrxMLdi7kkg';
            let featuredItem = null;

            if (featuredKey) {
                for (const cat of categories) {
                    for (const it of cat.items) {
                        if (!it) continue;
                        if (it.id && it.id === featuredKey) { featuredItem = it; break; }
                        if (it.title && it.title.toString().toLowerCase() === featuredKey.toString().toLowerCase()) { featuredItem = it; break; }
                    }
                    if (featuredItem) break;
                }
            }

            if (!featuredItem) {
                for (const cat of categories) {
                    for (const it of cat.items) {
                        if (it && ( (it.title && it.title.toLowerCase().includes('perfil falso')) || (it.youtube && it.youtube.includes(preferredId)) )) {
                            featuredItem = it;
                            break;
                        }
                    }
                    if (featuredItem) break;
                }
            }

            // Final fallback -> first item of first category
            if (!featuredItem && Array.isArray(categories) && categories.length && Array.isArray(categories[0].items) && categories[0].items.length) {
                featuredItem = categories[0].items[0];
            }

            if (featuredItem && featuredItem.youtube) {
                // use YouTube iframe as featured media
                const url = featuredItem.youtube;
                const id = (url.includes('v=')) ? url.split('v=')[1].split('&')[0] : url.split('/').pop();
                featuredYouTubeId = id;
                const embed = `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${id}&rel=0&playsinline=1`;
                if (featuredIframe) {
                    featuredIframe.src = embed;
                    featuredIframe.style.display = 'block';
                }
                if (featuredVideo) featuredVideo.style.display = 'none';
                if (featTitle && featuredItem.title) featTitle.textContent = featuredItem.title;
                if (featSub) featSub.textContent = featuredItem.badge ? featuredItem.badge : 'Em alta agora';
            } else {
                // try to autoplay mp4 and show play fallback if blocked
                if (featuredVideo) {
                    featuredVideo.play().catch(() => {
                        if (featPlayBtn) featPlayBtn.style.display = 'inline-block';
                    });
                }
            }

            // Modal player references
            const playerModal = document.getElementById('player-modal');
            const playerBackdrop = document.getElementById('player-backdrop');
            const playerClose = document.getElementById('player-close');
            const playerContainer = document.getElementById('player-container');
            const playerTitleEl = document.getElementById('player-title');
            const playerSynopsisEl = document.getElementById('player-synopsis');
            const playerMylistBtn = document.getElementById('player-mylist');

            // localStorage helpers for 'Minha lista'
            const MINHA_LISTA_KEY = 'minhaLista';
            function getMinhaLista() {
                try {
                    const raw = localStorage.getItem(MINHA_LISTA_KEY);
                    return raw ? JSON.parse(raw) : [];
                } catch (e) { return []; }
            }
            function saveMinhaLista(list) {
                try { localStorage.setItem(MINHA_LISTA_KEY, JSON.stringify(list || [])); } catch (e) {}
            }
            function isInMinhaLista(key) {
                if (!key) return false;
                return getMinhaLista().includes(key);
            }
            function updateMylistButtonState(key) {
                if (!playerMylistBtn) return;
                if (isInMinhaLista(key)) {
                    playerMylistBtn.textContent = 'Remover da Minha lista';
                    playerMylistBtn.classList.add('in-list');
                } else {
                    playerMylistBtn.textContent = 'Minha lista';
                    playerMylistBtn.classList.remove('in-list');
                }
            }

            function openPlayerWithYouTube(id, metadataKey, title, synopsis) {
                if (!playerModal || !playerContainer) return;
                // populate metadata
                if (playerTitleEl && title) playerTitleEl.textContent = title;
                if (playerSynopsisEl && synopsis) playerSynopsisEl.textContent = synopsis;
                updateMylistButtonState(metadataKey);

                // create iframe
                const iframe = document.createElement('iframe');
                iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&mute=0&controls=1&modestbranding=1&rel=0&playsinline=1`;
                iframe.allow = 'autoplay; encrypted-media; fullscreen';
                iframe.width = '100%';
                iframe.height = '100%';
                playerContainer.appendChild(iframe);
                playerModal.setAttribute('aria-hidden', 'false');

                // wire mylist toggle for this item
                if (playerMylistBtn) {
                    playerMylistBtn.onclick = () => {
                        const key = metadataKey || title || id;
                        const list = getMinhaLista();
                        const idx = list.indexOf(key);
                        if (idx === -1) {
                            list.push(key);
                        } else {
                            list.splice(idx, 1);
                        }
                        saveMinhaLista(list);
                        updateMylistButtonState(key);
                    };
                }
            }

            function openPlayerWithMP4(src, metadataKey, title, synopsis) {
                if (!playerModal || !playerContainer) return;
                if (playerTitleEl && title) playerTitleEl.textContent = title;
                if (playerSynopsisEl && synopsis) playerSynopsisEl.textContent = synopsis;
                updateMylistButtonState(metadataKey);

                const video = document.createElement('video');
                video.src = src;
                video.controls = true;
                video.autoplay = true;
                video.playsInline = true;
                video.muted = false;
                video.style.width = '100%';
                video.style.height = '100%';
                playerContainer.appendChild(video);
                playerModal.setAttribute('aria-hidden', 'false');

                if (playerMylistBtn) {
                    playerMylistBtn.onclick = () => {
                        const key = metadataKey || title || src;
                        const list = getMinhaLista();
                        const idx = list.indexOf(key);
                        if (idx === -1) list.push(key); else list.splice(idx, 1);
                        saveMinhaLista(list);
                        updateMylistButtonState(key);
                    };
                }
            }

            function closePlayer() {
                if (!playerModal || !playerContainer) return;
                // pause/cleanup
                const v = playerContainer.querySelector('video');
                if (v) { try { v.pause(); } catch (e) {} }
                const f = playerContainer.querySelector('iframe');
                if (f) { f.src = ''; }
                playerContainer.innerHTML = '';
                playerModal.setAttribute('aria-hidden', 'true');
                // clear metadata
                if (playerTitleEl) playerTitleEl.textContent = '';
                if (playerSynopsisEl) playerSynopsisEl.textContent = '';
                if (playerMylistBtn) playerMylistBtn.onclick = null;
            }

            if (featPlayBtn) {
                featPlayBtn.addEventListener('click', () => {
                    if (featuredYouTubeId && featuredItem) {
                        openPlayerWithYouTube(featuredYouTubeId, featuredItem.id || featuredItem.title, featuredItem.title, featuredItem.synopsis || '');
                        return;
                    }
                    // fallback: read the mp4 source from the featured video element
                    if (featuredVideo) {
                        const srcEl = featuredVideo.querySelector('source');
                        const src = srcEl ? srcEl.src : featuredVideo.src;
                        if (src) openPlayerWithMP4(src, featuredItem && (featuredItem.id || featuredItem.title), (featuredItem && featuredItem.title) || 'Destaque', (featuredItem && featuredItem.synopsis) || '');
                    }
                });
            }

            // close handlers
            if (playerBackdrop) playerBackdrop.addEventListener('click', closePlayer);
            if (playerClose) playerClose.addEventListener('click', closePlayer);
            document.addEventListener('keydown', (ev) => {
                if (ev.key === 'Escape') closePlayer();
            });
        } catch (err) {
            console.warn('Featured media init error', err);
        }
        // helper to canonicalize strings (lowercase + strip diacritics)
        const canonicalize = (s) => s.toString().trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

        // Create carousels and annotate them with a canonical category key
        categories.forEach(category => {
            try {
                // defensive: ensure category shape
                if (!category || !category.title) {
                    console.warn('Skipping invalid category', category);
                    return;
                }
                // ensure items is an array
                if (!Array.isArray(category.items)) category.items = [];

                const carousel = createCarousel(category);
                // set canonical category key on the carousel for show/hide filtering
                const catKey = canonicalize(category.title);
                carousel.dataset.category = catKey;
                carousel.classList.add('category-section');
                container.appendChild(carousel);
            } catch (err) {
                // don't allow one broken category to stop the entire page
                console.error('Failed to create carousel for', category && category.title, err);
                // append a fallback empty section so layout remains
                const fallback = document.createElement('div');
                fallback.className = 'slider-section category-section';
                const h = document.createElement('h3');
                h.textContent = category && category.title ? category.title : 'Categoria indisponível';
                fallback.appendChild(h);
                const p = document.createElement('p');
                p.style.color = '#888';
                p.textContent = 'Erro ao carregar esta seção.';
                fallback.appendChild(p);
                container.appendChild(fallback);
            }
        });
        // Cria barra de filtros por gênero acima das carousels
        // Build a category bar (top-level categories) so the user can show/hide sections
        const categoryBar = document.createElement('div');
        categoryBar.className = 'filter-bar category-bar';

        const allCatBtn = document.createElement('button');
        allCatBtn.className = 'filter-btn active';
        allCatBtn.dataset.category = 'all';
        allCatBtn.textContent = 'Todos';
        categoryBar.appendChild(allCatBtn);

        // create one button per top-level category
        categories.forEach(cat => {
            const b = document.createElement('button');
            b.className = 'filter-btn';
            const key = canonicalize(cat.title);
            b.dataset.category = key;
            b.textContent = cat.title;
            categoryBar.appendChild(b);
        });

        // Insert categoryBar above content
        container.insertBefore(categoryBar, container.firstChild);

        // left sidebar removed per user preference

        // Handle clicks on categoryBar (show/hide carousels)
        const categoryBarElem = categoryBar;
        categoryBarElem.addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (!btn) return;
            // mark active
            categoryBarElem.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.dataset.category;
            const sections = document.querySelectorAll('.category-section');
            if (cat === 'all') {
                sections.forEach(s => s.style.display = 'block');
                return;
            }
            sections.forEach(s => {
                s.style.display = (s.dataset.category === cat) ? 'block' : 'none';
            });
        });

        // (Removed old genre filter code - catalog now uses category buttons to show/hide sections.)
    }
});
