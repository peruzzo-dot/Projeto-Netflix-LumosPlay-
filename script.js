// script.js
// Gerencia alternância entre 'dark' e 'light' themes e persiste a escolha no localStorage
(function(){
  const KEY = 'theme';
  const toggle = document.getElementById('theme-toggle');
  if(!toggle) return;

  // Define o tema no elemento root (<html>) e atualiza atributos/ícone do botão
  function applyTheme(theme){
    document.documentElement.setAttribute('data-theme', theme);
    const isDark = theme === 'dark';
    toggle.setAttribute('aria-pressed', isDark.toString());
    // Não insere texto visível no botão — o ícone é mostrado via CSS (::after).
    // Mantemos apenas um rótulo simples e o estado aria-pressed para acessibilidade.
    toggle.setAttribute('aria-label', 'Alternar tema');
    try{ localStorage.setItem(KEY, theme); }catch(e){/* silenciar se storage não disponível */}
  }

  // Detecta preferência salva ou do sistema
  function getInitialTheme(){
    try{
      const saved = localStorage.getItem(KEY);
      if(saved === 'dark' || saved === 'light') return saved;
    }catch(e){ /* ignore */ }
    // fallback para preferência do sistema (dark) ou default light
    if(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches){
      return 'dark';
    }
    return 'light';
  }

  // Alterna tema ao clicar
  toggle.addEventListener('click', function(){
    const current = document.documentElement.getAttribute('data-theme') || getInitialTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });

  // Inicializa
  applyTheme(getInitialTheme());
})();
