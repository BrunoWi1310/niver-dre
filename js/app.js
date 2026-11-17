/* ==========================================================
   app.js — lógica da caçada. O conteúdo vem de dados.js.
   ========================================================== */
(function () {
  'use strict';

  var CHAVE = 'cacaTesouro:progresso:v1';
  var perguntas = (DADOS.perguntas || []).slice(0, 15);
  var total = perguntas.length;
  if ((DADOS.perguntas || []).length > 15) console.warn('dados.js tem mais de 15 perguntas; só as 15 primeiras serão usadas.');

  var $ = function (s) { return document.querySelector(s); };
  var reduzMovimento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SVG_CORACAO = '<svg viewBox="0 0 32 32"><path d="M16 28s-11-6.6-11-14.2C5 9.4 8 6.5 11.5 6.5c2 0 3.6 1 4.5 2.6.9-1.6 2.5-2.6 4.5-2.6C24 6.5 27 9.4 27 13.8 27 21.4 16 28 16 28z"/></svg>';

  /* ---------------- Progresso (localStorage) ---------------- */
  function carregar() {
    var base = { comecou: false, resolvidas: 0, dicas: [], viuFinal: false };
    try {
      var salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (salvo && typeof salvo.resolvidas === 'number') {
        base.comecou = !!salvo.comecou;
        base.resolvidas = Math.max(0, Math.min(total, salvo.resolvidas));
        base.dicas = Array.isArray(salvo.dicas) ? salvo.dicas : [];
        base.viuFinal = !!salvo.viuFinal;
      }
    } catch (e) { /* sem localStorage: segue sem salvar */ }
    return base;
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { }
  }
  if (/[?&]recomecar\b/.test(location.search)) {
    try { localStorage.removeItem(CHAVE); } catch (e) { }
    history.replaceState(null, '', location.pathname);
  }
  var estado = carregar();

  /* ---------------- Telas ---------------- */
  var telaAtual = null, telaAntesDosTesouros = 'tela-inicio';

  function mostrarTela(id) {
    var nova = document.getElementById(id);
    var velha = telaAtual && document.getElementById(telaAtual);
    $('#topo').hidden = (id === 'tela-inicio');
    if (velha && velha !== nova) {
      velha.classList.remove('ativa');
      velha.classList.add('saindo');
      setTimeout(function () {
        velha.classList.remove('saindo');
        nova.classList.add('ativa');
        window.scrollTo(0, 0);
      }, reduzMovimento ? 0 : 230);
    } else {
      nova.classList.add('ativa');
    }
    telaAtual = id;
  }

  /* ---------------- Barra de corações ---------------- */
  function desenharCoracoes(pulsar) {
    var caixa = $('#coracoes');
    caixa.innerHTML = '';
    caixa.setAttribute('aria-label', estado.resolvidas + ' de ' + total + ' tesouros encontrados');
    for (var i = 0; i < total; i++) {
      var span = document.createElement('span');
      span.className = 'coracao' + (i < estado.resolvidas ? ' cheio' : '') + (pulsar && i === estado.resolvidas - 1 ? ' pulou' : '');
      span.innerHTML = SVG_CORACAO;
      caixa.appendChild(span);
    }
    $('#contador-tesouros').textContent = estado.resolvidas;
  }

  /* ---------------- Início ---------------- */
  function montarInicio() {
    var ini = DADOS.inicio || {};
    $('#inicio-sobretitulo').textContent = ini.sobretitulo || '';
    $('#inicio-titulo').textContent = ini.titulo || 'Caça ao tesouro';
    $('#inicio-texto').textContent = ini.texto || '';
    var btn = $('#btn-comecar');
    var prog = $('#inicio-progresso');
    if (estado.comecou) {
      btn.textContent = estado.resolvidas >= total ? 'Ver a surpresa final' : 'Continuar a caçada';
      prog.textContent = estado.resolvidas + ' de ' + total + ' tesouros encontrados ♥';
      prog.hidden = false;
      $('#btn-inicio-tesouros').hidden = estado.resolvidas === 0;
    } else {
      btn.textContent = ini.botao || 'Começar a caçada';
      prog.hidden = true;
      $('#btn-inicio-tesouros').hidden = true;
    }
  }

  function seguir() {
    if (estado.resolvidas >= total) abrirFinal();
    else abrirPergunta();
  }

  /* ---------------- Pergunta ---------------- */
  var errosSeguidos = 0, ultimaFrase = -1;

  function abrirPergunta() {
    var i = estado.resolvidas, p = perguntas[i];
    errosSeguidos = 0;
    $('#numero-enigma').textContent = 'enigma nº ' + (i + 1) + ' de ' + total;
    $('#texto-enigma').textContent = p.pergunta;
    $('#campo-resposta').value = '';
    $('#feedback').textContent = '';
    $('#texto-dica').textContent = p.dica || '';
    var mostrouDica = estado.dicas.indexOf(i) !== -1;
    $('#dica').hidden = !mostrouDica;
    $('#btn-dica').hidden = mostrouDica || !p.dica;
    $('#btn-dica').classList.remove('chamando');
    mostrarTela('tela-pergunta');
  }

  function fraseErro() {
    var frases = DADOS.mensagensErro && DADOS.mensagensErro.length ? DADOS.mensagensErro : ['Não é isso… tenta de novo!'];
    var n;
    do { n = Math.floor(Math.random() * frases.length); } while (frases.length > 1 && n === ultimaFrase);
    ultimaFrase = n;
    return frases[n];
  }

  $('#form-resposta').addEventListener('submit', function (ev) {
    ev.preventDefault();
    var campo = $('#campo-resposta');
    var i = estado.resolvidas, p = perguntas[i];
    if (!p) return;
    if (!Cripto.normalizarResposta(campo.value)) {
      $('#feedback').textContent = 'Escreve alguma coisa primeiro 😉';
      return;
    }
    var hash = Cripto.hashResposta(campo.value);
    var aceitas = (p.respostas || []).map(function (h) { return String(h).trim().toLowerCase(); });

    if (aceitas.indexOf(hash) !== -1) {
      campo.blur();
      estado.comecou = true;
      estado.resolvidas = i + 1;
      salvar();
      desenharCoracoes(true);
      comemorar(1);
      mostrarRecompensa(p.recompensa);
    } else {
      errosSeguidos++;
      $('#feedback').textContent = fraseErro();
      campo.classList.remove('tremendo');
      void campo.offsetWidth;
      campo.classList.add('tremendo');
      if (navigator.vibrate) navigator.vibrate(60);
    }
  });

  $('#btn-dica').addEventListener('click', function () {
    var i = estado.resolvidas;
    if (estado.dicas.indexOf(i) === -1) estado.dicas.push(i);
    salvar();
    $('#dica').hidden = false;
    $('#btn-dica').hidden = true;
  });

  /* ---------------- Recompensa ---------------- */
  function mostrarRecompensa(r) {
    var area = $('#area-recompensa');
    area.innerHTML = '';
    area.appendChild(criarRecompensa(r));
    $('#btn-proxima').textContent = estado.resolvidas >= total ? 'Abrir a surpresa final ✨' : 'Próximo enigma →';
    mostrarTela('tela-recompensa');
  }

  $('#btn-proxima').addEventListener('click', seguir);

  function el(tag, classe, texto) {
    var e = document.createElement(tag);
    if (classe) e.className = classe;
    if (texto != null) e.textContent = texto;
    return e;
  }

  function criarRecompensa(r) {
    r = r || {};
    if (r.tipo === 'foto') return criarFoto(r);
    if (r.tipo === 'carta') return criarCarta(r);
    if (r.tipo === 'vale') return criarVale(r);
    return el('p', 'centro', 'Tipo de recompensa desconhecido: ' + r.tipo);
  }

  function criarFoto(r) {
    var fig = el('figure', 'polaroid');
    fig.appendChild(el('span', 'fita'));
    var img = el('img');
    img.alt = r.legenda || 'Nossa foto';
    img.src = r.imagem;
    img.onerror = function () { console.warn('Foto não encontrada: ' + r.imagem); };
    fig.appendChild(img);
    if (r.legenda) fig.appendChild(el('figcaption', '', r.legenda));
    return fig;
  }

  function criarCarta(r) {
    var caixa = el('div', 'caixa-carta');
    var env = el('div', 'envelope');
    env.setAttribute('role', 'button');
    env.setAttribute('tabindex', '0');
    env.setAttribute('aria-label', 'Abrir a carta');
    env.innerHTML =
      '<div class="env-fundo"></div>' +
      '<div class="env-papel"></div>' +
      '<div class="env-frente"></div>' +
      '<div class="env-aba"></div>' +
      '<div class="env-selo">' + SVG_CORACAO + '</div>';
    env.querySelector('.env-papel').textContent = r.titulo || 'Para você';
    var dica = el('p', 'env-dica', 'toque para abrir');
    caixa.appendChild(env);
    caixa.appendChild(dica);

    var aberta = false;
    function abrir() {
      if (aberta) return;
      aberta = true;
      env.classList.add('aberto');
      dica.style.visibility = 'hidden';
      setTimeout(function () {
        caixa.innerHTML = '';
        var papel = el('div', 'papel carta');
        if (r.titulo) papel.appendChild(el('p', 'carta-titulo', r.titulo));
        papel.appendChild(el('p', 'manuscrita texto-carta', r.texto || ''));
        if (r.assinatura) papel.appendChild(el('p', 'manuscrita assinatura', r.assinatura));
        caixa.appendChild(papel);
      }, reduzMovimento ? 50 : 1250);
    }
    env.addEventListener('click', abrir);
    env.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abrir(); } });
    return caixa;
  }

  function criarVale(r) {
    var caixa = el('div');
    var vale = el('div', 'vale');
    var corpo = el('div', 'vale-corpo');
    corpo.appendChild(el('p', 'vale-rotulo', 'Vale-presente'));
    corpo.appendChild(el('p', 'vale-titulo', r.titulo || 'Vale'));
    if (r.descricao) corpo.appendChild(el('p', 'vale-descricao', r.descricao));
    corpo.appendChild(el('p', 'vale-validade', r.validade || 'Válido para sempre'));
    var canhoto = el('div', 'vale-canhoto');
    canhoto.innerHTML = SVG_CORACAO;
    canhoto.appendChild(el('span', 'vale-codigo', r.codigo || ''));
    vale.appendChild(corpo);
    vale.appendChild(canhoto);
    caixa.appendChild(vale);
    caixa.appendChild(el('p', 'vale-print', 'Tire um print para guardar. Ele também fica em “Meus tesouros”.'));
    return caixa;
  }

  /* ---------------- Meus tesouros ---------------- */
  var MINI_CARTA = '<svg viewBox="0 0 48 34"><rect x="1" y="1" width="46" height="32" rx="3" fill="#fdf8f0"/><path d="M1 3l23 17L47 3" fill="none" stroke="#c9627a" stroke-width="2"/><circle cx="24" cy="19" r="5" fill="#6e1f33"/></svg>';
  var MINI_VALE = '<svg viewBox="0 0 48 30"><path d="M3 1h42a2 2 0 0 1 2 2v7a5 5 0 0 0 0 10v7a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-7a5 5 0 0 0 0-10V3a2 2 0 0 1 2-2z" fill="#fdf8f0"/><path d="M34 3v24" stroke="#c9627a" stroke-width="1.5" stroke-dasharray="2 2"/><path d="M8 11h18M8 16h14M8 21h10" stroke="#e7aab4" stroke-width="2"/></svg>';

  function tituloDe(r) {
    if (r.tipo === 'foto') return r.legenda || 'Foto';
    if (r.tipo === 'carta') return r.titulo || 'Carta';
    return r.titulo || 'Vale-presente';
  }

  function abrirTesouros() {
    if (telaAtual !== 'tela-tesouros') telaAntesDosTesouros = telaAtual || 'tela-inicio';
    var grade = $('#grade-tesouros');
    grade.innerHTML = '';
    $('#resumo-tesouros').textContent = estado.resolvidas === 0
      ? 'Ainda nenhum tesouro… o primeiro está te esperando!'
      : estado.resolvidas + ' de ' + total + ' tesouros encontrados';

    perguntas.forEach(function (p, i) {
      var r = p.recompensa || {};
      var item = el('button', 'item-tesouro');
      item.type = 'button';
      item.style.animationDelay = (i * 50) + 'ms';
      var mini = el('div', 'miniatura');
      if (i < estado.resolvidas) {
        if (r.tipo === 'foto') { var im = el('img'); im.src = r.imagem; im.alt = ''; im.loading = 'lazy'; mini.appendChild(im); }
        else if (r.tipo === 'carta') { mini.classList.add('carta-mini'); mini.innerHTML = MINI_CARTA; }
        else { mini.classList.add('vale-mini'); mini.innerHTML = MINI_VALE; }
        item.appendChild(mini);
        item.appendChild(el('span', 'item-tipo', { foto: 'Foto', carta: 'Carta', vale: 'Vale' }[r.tipo] || ''));
        item.appendChild(el('span', 'item-titulo', tituloDe(r)));
        item.addEventListener('click', function () { abrirModal(criarRecompensa(r)); });
      } else {
        item.classList.add('trancado');
        item.disabled = true;
        mini.textContent = '?';
        item.appendChild(mini);
        item.appendChild(el('span', 'item-titulo', 'Enigma ' + (i + 1) + ' — ainda escondido'));
      }
      grade.appendChild(item);
    });
    mostrarTela('tela-tesouros');
  }

  $('#btn-tesouros').addEventListener('click', abrirTesouros);
  $('#btn-inicio-tesouros').addEventListener('click', abrirTesouros);
  $('#btn-final-tesouros').addEventListener('click', abrirTesouros);
  $('#btn-voltar').addEventListener('click', function () {
    if (telaAntesDosTesouros === 'tela-inicio') montarInicio();
    mostrarTela(telaAntesDosTesouros);
  });
  $('#btn-recomecar').addEventListener('click', function () {
    if (!confirm('Apagar todo o progresso e recomeçar do primeiro enigma?')) return;
    try { localStorage.removeItem(CHAVE); } catch (e) { }
    location.reload();
  });

  /* ---------------- Modal ---------------- */
  var modal = $('#modal');
  function abrirModal(conteudo) {
    var c = $('#modal-conteudo');
    c.innerHTML = '';
    c.appendChild(conteudo);
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    modal.querySelector('.modal-caixa').scrollTop = 0;
  }
  function fecharModal() {
    modal.hidden = true;
    document.body.style.overflow = '';
  }
  modal.addEventListener('click', function (e) { if (e.target.closest('[data-fechar]')) fecharModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) fecharModal(); });

  /* ---------------- Final ---------------- */
  function abrirFinal() {
    var f = DADOS.final || {};
    $('#final-titulo').textContent = f.titulo || 'Fim!';
    $('#final-mensagem').textContent = f.mensagem || '';
    $('#final-assinatura').textContent = f.assinatura || '';
    $('#conquista-nome').textContent = f.conquista || 'Amor da minha vida';
    var primeiraVez = !estado.viuFinal;
    estado.viuFinal = true;
    salvar();
    mostrarTela('tela-final');
    setTimeout(function () { comemorar(primeiraVez ? 2.2 : 1); }, 500);
    if (primeiraVez) setTimeout(function () { comemorar(1.4); }, 1700);
  }

  /* ---------------- Comemoração ---------------- */
  var CORES = ['#6e1f33', '#c9627a', '#e7aab4', '#c99a55', '#f6dde0', '#8c2b44'];
  function comemorar(intensidade) {
    if (reduzMovimento) return;
    var festa = $('#festa');
    var W = window.innerWidth, H = window.innerHeight;
    var n = Math.round(38 * (intensidade || 1));
    for (var k = 0; k < n; k++) {
      (function () {
        var e = document.createElement('i');
        var cor = CORES[Math.floor(Math.random() * CORES.length)];
        var coracao = Math.random() < 0.55;
        var tam = coracao ? 14 + Math.random() * 20 : 6 + Math.random() * 6;
        e.style.width = tam + 'px';
        e.style.height = (coracao ? tam : tam * 1.7) + 'px';
        if (coracao) { e.innerHTML = SVG_CORACAO; e.firstChild.style.fill = cor; }
        else { e.style.background = cor; e.style.borderRadius = '2px'; }
        festa.appendChild(e);

        var x0 = W / 2 + (Math.random() - 0.5) * 80, y0 = H * 0.7;
        var ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.95;
        var v = (0.35 + Math.random() * 0.45) * H;
        var x1 = x0 + Math.cos(ang) * v, y1 = y0 + Math.sin(ang) * v;
        var x2 = x1 + (Math.random() - 0.5) * 120, y2 = H + 60;
        var giro = (Math.random() - 0.5) * (coracao ? 120 : 900);
        var anim = e.animate([
          { transform: 'translate(' + x0 + 'px,' + y0 + 'px) scale(.2) rotate(0deg)', opacity: 0 },
          { transform: 'translate(' + x1 + 'px,' + y1 + 'px) scale(1) rotate(' + giro / 2 + 'deg)', opacity: 1, offset: 0.3 },
          { transform: 'translate(' + x2 + 'px,' + y2 + 'px) scale(.9) rotate(' + giro + 'deg)', opacity: 0.85 }
        ], { duration: 2000 + Math.random() * 1400, easing: 'cubic-bezier(.15,.6,.35,1)', delay: Math.random() * 150, fill: 'backwards' });
        anim.onfinish = function () { e.remove(); };
      })();
    }
  }

  /* ---------------- Música ---------------- */
  var audio = $('#audio'), btnMusica = $('#btn-musica');
  if (DADOS.musica) {
    btnMusica.hidden = false;
    btnMusica.addEventListener('click', function () {
      if (!audio.src) audio.src = DADOS.musica;
      if (audio.paused) {
        audio.play().then(function () {
          btnMusica.classList.add('tocando');
          btnMusica.setAttribute('aria-label', 'Pausar música');
        }).catch(function () {
          if (audio.error) aviso('Não achei a música (' + DADOS.musica + ')');
        });
      } else {
        audio.pause();
      }
    });
    audio.addEventListener('pause', function () {
      btnMusica.classList.remove('tocando');
      btnMusica.setAttribute('aria-label', 'Tocar música');
    });
    audio.addEventListener('error', function () { btnMusica.classList.add('indisponivel'); });
  }

  var timerAviso;
  function aviso(texto) {
    var a = $('#aviso');
    a.textContent = texto;
    a.classList.add('visivel');
    clearTimeout(timerAviso);
    timerAviso = setTimeout(function () { a.classList.remove('visivel'); }, 3200);
  }

  /* ---------------- Começo ---------------- */
  $('#btn-comecar').addEventListener('click', function () {
    estado.comecou = true;
    salvar();
    seguir();
  });

  if (total === 0) {
    document.body.innerHTML = '<p style="padding:24px">Nenhuma pergunta em dados.js ainda.</p>';
    return;
  }
  desenharCoracoes(false);
  montarInicio();
  mostrarTela('tela-inicio');
})();
