/* =========================================================================
   DÁLIA — scripts
   - Navegação mobile (pill)
   - Vídeo do hero respeitando prefers-reduced-motion
   - Validação e envio do formulário da lista de espera
   ========================================================================= */
(function () {
  'use strict';

  /* ---------------------------------------------------- Ano no rodapé */
  var anoEl = document.getElementById('ano');
  if (anoEl) anoEl.textContent = String(new Date().getFullYear());

  /* ------------------------------------------------ Navegação mobile */
  var toggle = document.querySelector('.nav-toggle');
  var navLinks = document.getElementById('nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', function () {
      var open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    // fecha ao clicar num link
    navLinks.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        navLinks.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Abrir menu');
      }
    });
  }

  /* ----------------------- Vídeo do hero (prefers-reduced-motion) */
  var heroVideo = document.querySelector('.hero-video');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function applyMotionPref() {
    if (!heroVideo) return;
    if (reduceMotion.matches) {
      heroVideo.pause();
      heroVideo.removeAttribute('autoplay');
    } else {
      var p = heroVideo.play();
      if (p && typeof p.catch === 'function') { p.catch(function () {}); }
    }
  }
  if (heroVideo) {
    applyMotionPref();
    if (reduceMotion.addEventListener) {
      reduceMotion.addEventListener('change', applyMotionPref);
    } else if (reduceMotion.addListener) {
      reduceMotion.addListener(applyMotionPref);
    }
  }

  /* ====================================================================
     FORMULÁRIO DA LISTA DE ESPERA
     --------------------------------------------------------------------
     DEMO_MODE é detectado automaticamente: enquanto o "action" do form
     ainda contiver o placeholder "SEU_ENDPOINT_AQUI", o envio NÃO é feito
     a nenhum servidor — apenas exibimos o estado de sucesso para teste.
     Configure o endpoint real no atributo action do <form> (index.html).
     ==================================================================== */
  var form = document.getElementById('waitlist-form');
  var successEl = document.getElementById('waitlist-success');
  if (!form) return;

  var PLACEHOLDER = 'SEU_ENDPOINT_AQUI';
  var DEMO_MODE = (form.getAttribute('action') || '').indexOf(PLACEHOLDER) !== -1;

  function getField(name) { return form.querySelector('[name="' + name + '"]'); }
  function fieldWrap(input) { return input.closest('.field'); }
  function errorFor(input) {
    return form.querySelector('.field-error[data-for="' + input.id + '"]');
  }

  function setError(input, message) {
    var wrap = fieldWrap(input);
    var err = errorFor(input);
    if (wrap) wrap.classList.add('invalid');
    input.setAttribute('aria-invalid', 'true');
    if (err) { err.textContent = message; err.hidden = false; }
  }
  function clearError(input) {
    var wrap = fieldWrap(input);
    var err = errorFor(input);
    if (wrap) wrap.classList.remove('invalid');
    input.removeAttribute('aria-invalid');
    if (err) { err.textContent = ''; err.hidden = true; }
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    var ok = true;
    var firstInvalid = null;

    var nome = getField('nome');
    if (nome) {
      if (nome.value.trim().length < 2) {
        setError(nome, 'Por favor, informe o seu nome.');
        ok = false; firstInvalid = firstInvalid || nome;
      } else clearError(nome);
    }

    var email = getField('email');
    if (email) {
      if (!EMAIL_RE.test(email.value.trim())) {
        setError(email, 'Informe um e-mail válido, por exemplo nome@email.com.');
        ok = false; firstInvalid = firstInvalid || email;
      } else clearError(email);
    }

    // WhatsApp é opcional — valida só se preenchido
    var zap = getField('whatsapp');
    if (zap && zap.value.trim() !== '') {
      var digits = zap.value.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 13) {
        setError(zap, 'Confira o número com DDD, por exemplo (11) 99999-9999.');
        ok = false; firstInvalid = firstInvalid || zap;
      } else clearError(zap);
    } else if (zap) {
      clearError(zap);
    }

    var consent = getField('consentimento');
    if (consent) {
      if (!consent.checked) {
        setError(consent, 'É necessário concordar para entrar na lista.');
        ok = false; firstInvalid = firstInvalid || consent;
      } else clearError(consent);
    }

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: false });
    }
    return ok;
  }

  // limpa erro ao corrigir
  ['nome', 'email', 'whatsapp', 'consentimento'].forEach(function (n) {
    var el = getField(n);
    if (!el) return;
    var ev = el.type === 'checkbox' ? 'change' : 'input';
    el.addEventListener(ev, function () { clearError(el); });
  });

  function showSuccess() {
    form.hidden = true;
    if (successEl) {
      successEl.hidden = false;
      successEl.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
      var h = successEl.querySelector('h3');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
  }

  var submitBtn = document.getElementById('waitlist-submit');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // honeypot
    var hp = getField('_gotcha');
    if (hp && hp.value) { showSuccess(); return; }

    if (!validate()) return;

    if (DEMO_MODE) {
      // Sem endpoint configurado: apenas demonstra o sucesso (não envia dados).
      if (window.console) console.warn('[Dália] Formulário em modo de demonstração: configure o endpoint real (action) para capturar os dados.');
      showSuccess();
      return;
    }

    // Envio real (Formspree e compatíveis aceitam fetch com JSON e header Accept)
    var originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enviando…'; }

    var data = new FormData(form);
    fetch(form.action, {
      method: (form.method || 'POST').toUpperCase(),
      body: data,
      headers: { 'Accept': 'application/json' }
    })
      .then(function (res) {
        if (res.ok) { showSuccess(); return; }
        return res.json().then(function (j) {
          throw new Error((j && j.error) || 'Falha no envio');
        }).catch(function () { throw new Error('Falha no envio'); });
      })
      .catch(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = originalLabel; }
        var email = getField('email');
        if (email) setError(email, 'Não foi possível enviar agora. Tente novamente em instantes.');
      });
  });
})();
