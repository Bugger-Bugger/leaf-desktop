(function () {
  'use strict';

  let bridge = null;
  let pendingGmail = '';
  let currentMode = 'register'; // 'register' | 'login'

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  function showScreen(id) {
    $$('.screen').forEach((s) => s.classList.remove('active'));
    const screen = $(id);
    if (screen) screen.classList.add('active');
  }

  function setError(id, msg) {
    const el = $(id);
    if (el) {
      el.textContent = msg || '';
      el.classList.toggle('success', false);
    }
  }

  function setSuccess(id, msg) {
    const el = $(id);
    if (el) {
      el.textContent = msg || '';
      el.classList.add('success');
    }
  }

  function showLoading(on) {
    const overlay = $('#loading');
    if (overlay) overlay.hidden = !on;
  }

  function initOTP() {
    const boxes = $$('.otp-box');
    boxes.forEach((box, i) => {
      box.value = '';
      box.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '');
        box.value = val.slice(0, 1);
        if (val && i < boxes.length - 1) {
          boxes[i + 1].focus();
        }
      });
      box.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !box.value && i > 0) {
          boxes[i - 1].focus();
        }
      });
      box.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '');
        for (let j = 0; j < Math.min(text.length, boxes.length); j++) {
          boxes[j].value = text[j];
        }
        const focusIdx = Math.min(text.length, boxes.length - 1);
        boxes[focusIdx].focus();
      });
    });
  }

  function getOTPCode() {
    return Array.from($$('.otp-box')).map((b) => b.value).join('');
  }

  // ─── Wire UI events ──────────────────────────────────────────

  function wireEvents() {
    // Switch between register / login
    $$('[data-switch]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-switch');
        currentMode = target;
        if (target === 'login') {
          showScreen('#screen-login');
        } else {
          showScreen('#screen-register');
        }
      });
    });

    // Register submit
    $('#reg-submit').addEventListener('click', () => {
      setError('#reg-error');
      const login = $('#reg-login').value.trim();
      const username = $('#reg-username').value.trim();
      const gmail = $('#reg-gmail').value.trim();
      const password = $('#reg-password').value;
      const passwordConfirm = $('#reg-password-confirm').value;
      const agree = $('#reg-agree').checked;

      if (!login || !username || !gmail || !password) {
        setError('#reg-error', 'Заполните все поля');
        return;
      }
      if (password.length < 6) {
        setError('#reg-error', 'Пароль минимум 6 символов');
        return;
      }
      if (password !== passwordConfirm) {
        setError('#reg-error', 'Пароли не совпадают');
        return;
      }
      if (!agree) {
        setError('#reg-error', 'Примите пользовательское соглашение');
        return;
      }

      showLoading(true);
      bridge.register(login, username, gmail, password, passwordConfirm, true);
    });

    // Login submit
    $('#login-submit').addEventListener('click', () => {
      setError('#login-error');
      const login = $('#login-login').value.trim();
      const gmail = $('#login-gmail').value.trim();
      const password = $('#login-password').value;

      if (!login || !gmail || !password) {
        setError('#login-error', 'Заполните все поля');
        return;
      }

      showLoading(true);
      bridge.login(login, gmail, password);
    });

    // Verify submit
    $('#verify-submit').addEventListener('click', () => {
      setError('#verify-error');
      const code = getOTPCode();
      if (code.length !== 6) {
        setError('#verify-error', 'Введите 6-значный код');
        return;
      }

      showLoading(true);
      if (currentMode === 'register') {
        bridge.registerVerify(pendingGmail, code);
      } else {
        bridge.loginVerify(pendingGmail, code);
      }
    });

    // Resend code
    $('#verify-resend').addEventListener('click', (e) => {
      e.preventDefault();
      setError('#verify-error');
      showLoading(true);
      if (currentMode === 'register') {
        bridge.registerResend(pendingGmail);
      } else {
        bridge.loginResend(pendingGmail);
      }
    });

    // Back to register from verify
    $('#verify-back').addEventListener('click', (e) => {
      e.preventDefault();
      if (currentMode === 'register') {
        showScreen('#screen-register');
      } else {
        showScreen('#screen-login');
      }
    });
  }

  // ─── QWebChannel setup ───────────────────────────────────────

  function onBridgeReady() {
    wireEvents();
    initOTP();

    // Register signals
    bridge.registerStep1Done.connect((json) => {
      showLoading(false);
      const data = JSON.parse(json);
      if (data.ok) {
        pendingGmail = $('#reg-gmail').value.trim();
        $('#verify-gmail').textContent = pendingGmail;
        $('#verify-title').textContent = 'Подтверждение gmail';
        showScreen('#screen-verify');
        initOTP();
        setTimeout(() => $$('.otp-box')[0] && $$('.otp-box')[0].focus(), 100);
      } else {
        setError('#reg-error', data.message || 'Ошибка регистрации');
      }
    });

    bridge.registerVerifyDone.connect((json) => {
      showLoading(false);
      const data = JSON.parse(json);
      if (!data.ok) {
        setError('#verify-error', data.message || 'Неверный код');
      }
      // authCompleted will fire from Python side → closes this window
    });

    bridge.registerResendDone.connect((json) => {
      showLoading(false);
      const data = JSON.parse(json);
      if (data.ok) {
        setSuccess('#verify-error', 'Код отправлен повторно');
      } else {
        setError('#verify-error', data.message || 'Не удалось отправить код');
      }
    });

    bridge.loginStep1Done.connect((json) => {
      showLoading(false);
      const data = JSON.parse(json);
      if (data.ok) {
        pendingGmail = $('#login-gmail').value.trim();
        $('#verify-gmail').textContent = pendingGmail;
        $('#verify-title').textContent = 'Подтверждение входа';
        showScreen('#screen-verify');
        initOTP();
        setTimeout(() => $$('.otp-box')[0] && $$('.otp-box')[0].focus(), 100);
      } else {
        setError('#login-error', data.message || 'Ошибка входа');
      }
    });

    bridge.loginVerifyDone.connect((json) => {
      showLoading(false);
      const data = JSON.parse(json);
      if (!data.ok) {
        setError('#verify-error', data.message || 'Неверный код');
      }
      // authCompleted will fire from Python side → closes this window
    });

    bridge.loginResendDone.connect((json) => {
      showLoading(false);
      const data = JSON.parse(json);
      if (data.ok) {
        setSuccess('#verify-error', 'Код отправлен повторно');
      } else {
        setError('#verify-error', data.message || 'Не удалось отправить код');
      }
    });
  }

  // ─── Init ────────────────────────────────────────────────────

  if (typeof qt !== 'undefined' && typeof qt.webChannelTransport !== 'undefined') {
    new QWebChannel(qt.webChannelTransport, (channel) => {
      bridge = channel.objects.bridge;
      onBridgeReady();
    });
  } else {
    // Fallback: standalone mode (browser dev — no Qt bridge)
    console.warn('QWebChannel not available — running in standalone mode');
    wireEvents();
    initOTP();
  }
})();
