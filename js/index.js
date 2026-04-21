console.log('Bem-vindo à Netflix!');

// Salva no localStorage o perfil ativo (nome e imagem) quando o usuário clicar em um perfil na index
document.addEventListener('DOMContentLoaded', () => {
	const profileLinks = document.querySelectorAll('.profile');
	profileLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			// Encontrar IMG e FIGCAPTION dentro do link clicado
			const img = link.querySelector('img');
			const caption = link.querySelector('figcaption');
			if (!img || !caption) return;

			// Pegamos o atributo src exatamente como está no HTML (relativo)
			const srcAttr = img.getAttribute('src') || '';
			const filename = srcAttr.split('/').pop(); // ex: 'perfil-1.jpg'
			const nome = caption.textContent.trim();

			try {
				localStorage.setItem('perfilAtivoNome', nome);
				// armazenamos apenas o nome do arquivo para montar o caminho corretamente em catalogo
				localStorage.setItem('perfilAtivoImagem', filename);
					// se o link tiver data-genre, salvamos a preferência de gênero do perfil
					const genre = link.dataset.genre;
					if (genre) {
						localStorage.setItem('perfilAtivoGenero', genre);
					} else {
						localStorage.removeItem('perfilAtivoGenero');
					}
			} catch (err) {
				// se o storage falhar, não interrompe a navegação
				console.error('Não foi possível salvar o perfil no localStorage', err);
			}
			// Não previne a navegação; localStorage é síncrono, então o valor estará disponível na página destino
		});
	});
});

// Background video autoplay helper: try to play the video programmatically.
document.addEventListener('DOMContentLoaded', () => {
	const bgVideo = document.getElementById('bg-video');
	if (!bgVideo) return;

	// Ensure it's muted (required by many browsers to allow autoplay)
	bgVideo.muted = true;

	// Try to play. If rejected, show a small play button so the user can start it.
	const playPromise = bgVideo.play();
	if (playPromise !== undefined) {
		playPromise.catch(() => {
			// Create a lightweight play button overlay
			const btn = document.createElement('button');
			btn.id = 'bg-play-btn';
			btn.type = 'button';
			btn.setAttribute('aria-label', 'Ativar vídeo de fundo');
			btn.innerText = '▶';
			document.body.appendChild(btn);

			btn.addEventListener('click', () => {
				bgVideo.play().then(() => {
					try { btn.remove(); } catch (e) {}
				}).catch(() => {
					// still failed; keep button visible
				});
			});
		});
	}
});

const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

themeToggle.addEventListener('click', () => {
    // Alterna a classe entre modo claro e escuro
    body.classList.toggle('light-mode');

    // Opcional: Troca o ícone de Lua para Sol
    const icon = themeToggle.querySelector('i');
    if (body.classList.contains('light-mode')) {
        icon.classList.replace('fa-moon', 'fa-sun'); // Vira sol se estiver branco
    } else {
        icon.classList.replace('fa-sun', 'fa-moon'); // Volta a ser lua se estiver preto
    }
});