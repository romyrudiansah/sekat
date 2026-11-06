// Bahasa, tema, tab galeri, dan tombol salin SHA-256. Halaman tetap terbaca tanpa skrip ini.
(function () {
  var root = document.documentElement;
  var titles = {
    id: 'Sekat: manajer partisi untuk Windows',
    en: 'Sekat: partition manager for Windows'
  };

  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* mode privat: abaikan */ }
  }

  function setLang(lang) {
    root.setAttribute('data-lang', lang);
    root.lang = lang;
    document.title = titles[lang];
  }

  function darkNow() {
    var t = root.getAttribute('data-theme');
    if (t) return t === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  setLang(root.getAttribute('data-lang') === 'en' ? 'en' : 'id');

  document.querySelectorAll('[data-set-lang]').forEach(function (button) {
    button.addEventListener('click', function () {
      var next = root.getAttribute('data-lang') === 'id' ? 'en' : 'id';
      setLang(next);
      save('sekat-lang', next);
    });
  });

  document.querySelectorAll('[data-toggle-theme]').forEach(function (button) {
    button.addEventListener('click', function () {
      var next = darkNow() ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      save('sekat-theme', next);
    });
  });

  var tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var name = tab.getAttribute('data-tab');
      tabs.forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
      document.querySelectorAll('[data-panel]').forEach(function (panel) {
        panel.hidden = panel.getAttribute('data-panel') !== name;
      });
    });
  });

  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      var source = document.getElementById(button.getAttribute('data-copy'));
      if (!source || !navigator.clipboard) return;
      var text = source.textContent.trim();
      navigator.clipboard.writeText(text).then(function () {
        button.classList.add('copied');
        var spans = button.querySelectorAll('span');
        var before = Array.prototype.map.call(spans, function (s) { return s.textContent; });
        if (spans[0]) spans[0].textContent = 'Tersalin';
        if (spans[1]) spans[1].textContent = 'Copied';
        setTimeout(function () {
          spans.forEach(function (s, i) { s.textContent = before[i]; });
          button.classList.remove('copied');
        }, 1600);
      }, function () { /* izin clipboard ditolak: biarkan */ });
    });
  });
})();
