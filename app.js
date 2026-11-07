// Bahasa, tema, menu kecil, tab galeri, dan tombol salin SHA-256.
// Halaman tetap terbaca tanpa skrip ini; tombol yang butuh skrip disembunyikan lewat CSS.
(function () {
  var root = document.documentElement;
  var titles = {
    id: 'Sekat: manajer partisi untuk Windows',
    en: 'Sekat: partition manager for Windows'
  };
  var copyText = {
    id: { ok: 'SHA-256 tersalin.', fail: 'Tidak bisa menyalin otomatis. Kode sudah dipilih, tekan Ctrl+C.' },
    en: { ok: 'SHA-256 copied.', fail: 'Could not copy automatically. The code is selected, press Ctrl+C.' }
  };
  var themeColor = { light: '#F3F0E8', dark: '#111816' };

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* penyimpanan diblokir: pilihan berlaku sampai halaman ditutup */ }
  }
  function lang() { return root.getAttribute('data-lang') === 'en' ? 'en' : 'id'; }
  function dark() { return root.getAttribute('data-theme') === 'dark'; }

  // Label aksesibel ikut bahasa: elemen dengan data-label-id / data-label-en.
  function applyLabels() {
    var l = lang();
    document.querySelectorAll('[data-label-' + l + ']').forEach(function (el) {
      var text = el.getAttribute('data-label-' + l);
      el.setAttribute('aria-label', text);
      if (el.matches('button')) el.title = text;
    });
  }

  function setLang(next) {
    root.setAttribute('data-lang', next);
    root.lang = next;
    document.title = titles[next];
    applyLabels();
    document.querySelectorAll('.copy-status').forEach(function (s) { s.textContent = ''; });
  }

  function setTheme(next) {
    root.setAttribute('data-theme', next);
    document.querySelectorAll('[data-toggle-theme]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(next === 'dark'));
    });
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', themeColor[next]);
  }

  setLang(lang());
  setTheme(dark() ? 'dark' : 'light');

  document.querySelectorAll('[data-set-lang]').forEach(function (button) {
    button.addEventListener('click', function () {
      var next = lang() === 'id' ? 'en' : 'id';
      setLang(next);
      save('sekat-lang', next);
    });
  });

  document.querySelectorAll('[data-toggle-theme]').forEach(function (button) {
    button.addEventListener('click', function () {
      var next = dark() ? 'light' : 'dark';
      setTheme(next);
      save('sekat-theme', next);
    });
  });

  // Menu di layar kecil.
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('menu');
  function setMenu(open, refocus) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    menu.classList.toggle('open', open);
    if (!open && refocus) toggle.focus();
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('open')) setMenu(false, true);
    });
    document.addEventListener('click', function (e) {
      if (menu.classList.contains('open') && !menu.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 1080px)').addEventListener('change', function (m) {
      if (m.matches) setMenu(false);
    });
  }

  // Tab galeri: klik, panah kiri/kanan, Home, End.
  var tabs = Array.prototype.slice.call(document.querySelectorAll('[role="tab"][data-tab]'));
  function select(tab, focus) {
    var name = tab.getAttribute('data-tab');
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
    });
    document.querySelectorAll('[data-panel]').forEach(function (panel) {
      panel.hidden = panel.getAttribute('data-panel') !== name;
    });
    if (focus) tab.focus();
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab); });
    tab.addEventListener('keydown', function (e) {
      var to = null;
      if (e.key === 'ArrowRight') to = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') to = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') to = tabs[0];
      else if (e.key === 'End') to = tabs[tabs.length - 1];
      if (to) { e.preventDefault(); select(to, true); }
    });
  });

  // Salin SHA-256. Bila clipboard ditolak, kodenya dipilih supaya bisa disalin dengan Ctrl+C.
  function selectText(el) {
    var range = document.createRange();
    range.selectNodeContents(el);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }
  document.querySelectorAll('[data-copy]').forEach(function (button) {
    var source = document.getElementById(button.getAttribute('data-copy'));
    var status = button.parentNode.querySelector('.copy-status');
    var timer;
    function report(kind) {
      if (!status) return;
      status.textContent = copyText[lang()][kind];
      clearTimeout(timer);
      if (kind === 'ok') timer = setTimeout(function () { status.textContent = ''; }, 4000);
    }
    function fallback() {
      selectText(source);
      var done = false;
      try { done = document.execCommand('copy'); } catch (e) { done = false; }
      report(done ? 'ok' : 'fail');
    }
    button.addEventListener('click', function () {
      if (!source) return;
      var text = source.textContent.trim();
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { report('ok'); }, fallback);
      } else {
        fallback();
      }
    });
  });
})();
