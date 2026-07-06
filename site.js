/* ---------- Приветствие по времени суток ---------- */

(function () {
  var el = document.getElementById('greeting');
  if (!el) return;
  var hour = new Date().getHours();
  var text = 'Добрый день';
  if (hour >= 5 && hour < 12) text = 'Доброе утро';
  else if (hour >= 12 && hour < 18) text = 'Добрый день';
  else if (hour >= 18 && hour < 23) text = 'Добрый вечер';
  else text = 'Доброй ночи';
  el.textContent = text;
})();

/* ---------- Статус «сейчас открыто / закрыто» ----------
   Считаем по времени Казани (совпадает с московским, UTC+3),
   а не по времени клиента, потому что открыт именно шоурум,
   а не телефон посетителя. */

(function () {
  var el = document.getElementById('open-status');
  if (!el) return;

  var parts = new Intl.DateTimeFormat('ru-RU', {
    timeZone: 'Europe/Moscow',
    hour: 'numeric',
    hour12: false,
    weekday: 'short'
  }).formatToParts(new Date());

  var hour = 0, weekday = '';
  parts.forEach(function (p) {
    if (p.type === 'hour') hour = parseInt(p.value, 10);
    if (p.type === 'weekday') weekday = p.value;
  });

  var isWeekday = ['пн', 'вт', 'ср', 'чт', 'пт'].indexOf(weekday.toLowerCase()) !== -1;
  var isOpenNow = isWeekday && hour >= 9 && hour < 18;

  el.textContent = isOpenNow ? 'Открыто сейчас' : 'Сейчас закрыто';
  el.className = 'status-badge ' + (isOpenNow ? 'status-open' : 'status-closed');
})();

/* ---------- Сезонный акцент по дате ---------- */

(function () {
  var month = new Date().getMonth(); // 0 = январь
  var season;
  if (month === 11 || month === 0 || month === 1) season = 'winter';
  else if (month >= 2 && month <= 4) season = 'spring';
  else if (month >= 5 && month <= 7) season = 'summer';
  else season = 'autumn';

  var palette = {
    winter: { brass: '#9FA6AE', brassDeep: '#7C838C' },
    spring: { brass: '#A9A25F', brassDeep: '#87823F' },
    summer: { brass: '#C49A52', brassDeep: '#9C7538' },
    autumn: { brass: '#B4763F', brassDeep: '#8C5A2C' }
  };

  var chosen = palette[season];
  var root = document.documentElement.style;
  root.setProperty('--brass', chosen.brass);
  root.setProperty('--brass-deep', chosen.brassDeep);
  document.documentElement.setAttribute('data-season', season);
})();

/* ---------- Установка на главный экран (PWA) ---------- */

(function () {
  var btn = document.getElementById('installBtn');
  if (!btn) return;

  var isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  if (isStandalone) {
    btn.style.display = 'none';
    return;
  }

  var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  var deferredPrompt = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    btn.style.display = 'flex';
  });

  if (isIOS) {
    btn.style.display = 'flex';
  }

  btn.addEventListener('click', function () {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt = null;
      return;
    }
    if (isIOS) {
      alert('Нажмите «Поделиться» внизу экрана и выберите «На экран «Домой»».');
    }
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js').catch(function () {});
  }
})();

/* ---------- Сохранение контакта ---------- */

(function () {
  var btn = document.getElementById('saveContactBtn');
  if (!btn) return;

  btn.addEventListener('click', function () {
    var lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      'N:;Салават Менеджер МебельДан;;;',
      'FN:Салават Менеджер МебельДан',
      'ORG:МебельДан',
      'TITLE:Менеджер',
      'TEL;TYPE=CELL:+79600492284',
      'URL;TYPE=Telegram:https://t.me/salavatfazliev',
      'END:VCARD'
    ];
    var vcf = lines.join('\r\n');
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

    if (isIOS) {
      window.location.href = 'data:text/vcard;charset=utf-8,' + encodeURIComponent(vcf);
    } else {
      var blob = new Blob([vcf], { type: 'text/vcard;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'Салават Менеджер МебельДан.vcf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(url); }, 3000);
    }
  });
})();
