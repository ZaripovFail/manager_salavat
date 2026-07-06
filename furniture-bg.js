(function () {
  var canvas = document.getElementById('furniture-bg');
  if (!canvas || !canvas.getContext) return;

  var ctx = canvas.getContext('2d');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, DPR;

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W * DPR;
    canvas.height = H * DPR;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  /* ---------- Сцены ----------
     Координаты (tx, ty) — доли ширины/высоты экрана, куда деталь
     должна встать в собранном виде. w, h — тоже доли экрана. */

  var scenes = [
    {
      name: 'wardrobe',
      parts: [
        { type: 'plank', w: 0.34, h: 0.018, tx: 0.5,   ty: 0.20 },
        { type: 'plank', w: 0.34, h: 0.018, tx: 0.5,   ty: 0.66 },
        { type: 'plank', w: 0.018, h: 0.46, tx: 0.335, ty: 0.43 },
        { type: 'plank', w: 0.018, h: 0.46, tx: 0.665, ty: 0.43 },
        { type: 'door',  w: 0.14, h: 0.44, tx: 0.425, ty: 0.43 },
        { type: 'door',  w: 0.14, h: 0.44, tx: 0.575, ty: 0.43 }
      ]
    },
    {
      name: 'kitchen',
      parts: [
        { type: 'door',  w: 0.16, h: 0.11, tx: 0.30, ty: 0.18 },
        { type: 'door',  w: 0.16, h: 0.11, tx: 0.50, ty: 0.18 },
        { type: 'door',  w: 0.16, h: 0.11, tx: 0.70, ty: 0.18 },
        { type: 'plank', w: 0.55, h: 0.012, tx: 0.50, ty: 0.34 },
        { type: 'door',  w: 0.16, h: 0.16, tx: 0.30, ty: 0.45 },
        { type: 'door',  w: 0.16, h: 0.16, tx: 0.50, ty: 0.45 },
        { type: 'door',  w: 0.16, h: 0.16, tx: 0.70, ty: 0.45 }
      ]
    },
    {
      name: 'closet',
      parts: [
        { type: 'plank', w: 0.5,  h: 0.012, tx: 0.5,  ty: 0.16 },
        { type: 'plank', w: 0.46, h: 0.005, tx: 0.5,  ty: 0.27 },
        { type: 'plank', w: 0.018, h: 0.40, tx: 0.27, ty: 0.42 },
        { type: 'plank', w: 0.018, h: 0.40, tx: 0.73, ty: 0.42 },
        { type: 'plank', w: 0.018, h: 0.20, tx: 0.5,  ty: 0.32 },
        { type: 'drawer', w: 0.2, h: 0.1,  tx: 0.35, ty: 0.58 },
        { type: 'drawer', w: 0.2, h: 0.1,  tx: 0.65, ty: 0.58 }
      ]
    },
    {
      name: 'dresser',
      parts: [
        { type: 'plank', w: 0.3, h: 0.018, tx: 0.5,   ty: 0.30 },
        { type: 'plank', w: 0.3, h: 0.018, tx: 0.5,   ty: 0.62 },
        { type: 'plank', w: 0.018, h: 0.34, tx: 0.355, ty: 0.46 },
        { type: 'plank', w: 0.018, h: 0.34, tx: 0.645, ty: 0.46 },
        { type: 'drawer', w: 0.24, h: 0.08, tx: 0.5, ty: 0.375 },
        { type: 'drawer', w: 0.24, h: 0.08, tx: 0.5, ty: 0.465 },
        { type: 'drawer', w: 0.24, h: 0.08, tx: 0.5, ty: 0.555 }
      ]
    }
  ];

  var scene = scenes[Math.floor(Math.random() * scenes.length)];
  var isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var LINE_COLOR = isDark ? 'rgba(201, 192, 178, 0.16)' : 'rgba(139, 128, 116, 0.16)';
  var FLOAT_MS = 5200;
  var ASSEMBLE_MS = 2600;
  var FLOURISH_MS = 1000;

  var parts = scene.parts.map(function (p) {
    return {
      type: p.type,
      w: p.w * W,
      h: p.h * H,
      x: Math.random() * W,
      y: Math.random() * H,
      rot: Math.random() * Math.PI * 2,
      vx: (Math.random() - 0.5) * 1.1,
      vy: (Math.random() - 0.5) * 1.1,
      vr: (Math.random() - 0.5) * 0.012,
      targetX: p.tx * W,
      targetY: p.ty * H,
      targetRot: 0
    };
  });

  function drawPart(p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.strokeStyle = LINE_COLOR;
    ctx.lineWidth = 1;
    ctx.strokeRect(-p.w / 2, -p.h / 2, p.w, p.h);
    if (p.type === 'door' || p.type === 'drawer') {
      ctx.beginPath();
      ctx.arc(p.w / 2 - 8, 0, 2, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  if (reduceMotion) {
    parts.forEach(function (p) {
      p.x = p.targetX; p.y = p.targetY; p.rot = p.targetRot;
      drawPart(p);
    });
    return;
  }

  var startTime = null;
  var assembleStart = null;

  function tick(now) {
    if (startTime === null) startTime = now;
    var elapsed = now - startTime;
    ctx.clearRect(0, 0, W, H);

    if (elapsed < FLOAT_MS) {
      parts.forEach(function (p) {
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.x - p.w / 2 < 0 || p.x + p.w / 2 > W) p.vx *= -1;
        if (p.y - p.h / 2 < 0 || p.y + p.h / 2 > H) p.vy *= -1;
        p.x = Math.max(p.w / 2, Math.min(W - p.w / 2, p.x));
        p.y = Math.max(p.h / 2, Math.min(H - p.h / 2, p.y));
        drawPart(p);
      });
      requestAnimationFrame(tick);
      return;
    }

    if (elapsed < FLOAT_MS + ASSEMBLE_MS) {
      if (assembleStart === null) {
        assembleStart = now;
        parts.forEach(function (p) {
          p.fromX = p.x; p.fromY = p.y; p.fromRot = p.rot;
        });
      }
      var t = Math.min((now - assembleStart) / ASSEMBLE_MS, 1);
      var e = easeInOutCubic(t);
      parts.forEach(function (p) {
        p.x = p.fromX + (p.targetX - p.fromX) * e;
        p.y = p.fromY + (p.targetY - p.fromY) * e;
        p.rot = p.fromRot + (p.targetRot - p.fromRot) * e;
        drawPart(p);
      });
      requestAnimationFrame(tick);
      return;
    }

    if (elapsed < FLOAT_MS + ASSEMBLE_MS + FLOURISH_MS) {
      if (flourishStart === null) flourishStart = now;
      var ft = Math.min((now - flourishStart) / FLOURISH_MS, 1);
      var wave = Math.sin(ft * Math.PI); // 0 -> 1 -> 0, один плавный жест
      parts.forEach(function (p) {
        if (p.type === 'door') {
          var side = p.targetX < W / 2 ? -1 : 1;
          p.rot = p.targetRot + side * wave * 0.22;
          p.x = p.targetX; p.y = p.targetY;
        } else if (p.type === 'drawer') {
          p.x = p.targetX;
          p.y = p.targetY + wave * H * 0.015;
          p.rot = p.targetRot;
        } else {
          p.x = p.targetX; p.y = p.targetY; p.rot = p.targetRot;
        }
        drawPart(p);
      });
      requestAnimationFrame(tick);
      return;
    }

    /* Сборка и жест «открывания» завершены — рисуем финальный кадр
       и останавливаем цикл, чтобы не нагружать телефон бесконечной анимацией. */
    parts.forEach(function (p) {
      p.x = p.targetX; p.y = p.targetY; p.rot = p.targetRot;
      drawPart(p);
    });
  }

  var flourishStart = null;
  requestAnimationFrame(tick);
})();
