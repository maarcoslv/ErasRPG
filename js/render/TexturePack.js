/*
 * TexturePack.js — Paquete de texturas "BrowserQuest" para el dibujo del mundo.
 *
 * Sustituye (sin tocar la lógica) los dibujos por código de Sprites.js por sprites en pixel art:
 *  - terreno: casillas de hierba/camino/arena/agua con bordes irregulares entre tipos de terreno
 *  - objetos: árboles, rocas, cabañas, fogata animada...
 *  - personaje y aldeano: hojas de sprites animadas
 *  - herbívoro: pixel art propio del proyecto (BrowserQuest no tiene dinosaurios)
 * Si las imágenes no cargan (RPG.Assets.ok === false) se usa el respaldo procedural original.
 * Para volver al dibujo por código basta con no cargar este archivo.
 *
 * Arte original © Little Workshop (BrowserQuest), CC-BY-SA 3.0. Ver assets/LICENSE-BrowserQuest.txt.
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var A = RPG.ATLAS, T = RPG.TILES, TS = RPG.CONFIG.TILE, COLS = RPG.TILESHEET_COLS;
  var S = RPG.Sprites;

  var pack = RPG.TexturePack = {
    active: function () { return RPG.Assets.ok; }
  };

  /* =============== casillas de terreno =============== */
  var tileCache = null;

  function crop(id) {                              // id de BrowserQuest (base 1) -> canvas de 32x32
    var i = id - 1, cv = document.createElement('canvas');
    cv.width = TS; cv.height = TS;
    cv.getContext('2d').drawImage(RPG.Assets.img.tiles, (i % COLS) * TS, Math.floor(i / COLS) * TS, TS, TS, 0, 0, TS, TS);
    return cv;
  }

  function darken(cv) {
    var d = document.createElement('canvas'); d.width = TS; d.height = TS;
    var g = d.getContext('2d'); g.drawImage(cv, 0, 0);
    g.fillStyle = 'rgba(8,48,28,0.30)'; g.fillRect(0, 0, TS, TS);
    return d;
  }

  function buildTiles() {
    var ids = RPG.TILE_IDS, grass = ids.grass.map(crop);
    tileCache = {};
    tileCache[T.GRASS] = grass.concat(ids.grassFlowers.map(crop));
    tileCache[T.DARK_GRASS] = grass.map(darken);
    tileCache[T.PATH] = ids.path.map(crop);
    tileCache[T.SAND] = ids.sand.map(crop);
    tileCache[T.WATER] = ids.water.slice(0, 1).map(crop);
  }

  function hash(x, y) { return (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0; }

  function tileFor(type, tx, ty) {
    var list = tileCache[type], h = hash(tx, ty);
    if (type === T.GRASS) return (h % 31 === 0) ? list[8 + (h >> 5) % 2] : list[h % 8];   // flores muy de vez en cuando
    if (type === T.DARK_GRASS) return list[h % list.length];
    return list[h % list.length];
  }

  // Prioridad: el terreno de mayor prioridad "invade" con un borde irregular al de menor prioridad
  var PRIO = {}; PRIO[T.WATER] = 0; PRIO[T.SAND] = 1; PRIO[T.PATH] = 2; PRIO[T.DARK_GRASS] = 3; PRIO[T.GRASS] = 4;

  function depth(u, id) {                          // profundidad del borde (px, par) en la coordenada u de la línea id
    var n = Math.sin(u * 0.21 + id * 1.7) * 0.5 + Math.sin(u * 0.53 + id * 3.1) * 0.5;
    return Math.max(2, Math.round((6 + n * 4) / 2) * 2);
  }

  /* =============== terreno "horneado" =============== */
  function bake(map) {
    if (map._bq) return map._bq;
    var W = map.cols * TS, H = map.rows * TS, tx, ty, x, y;
    var ground = document.createElement('canvas'); ground.width = W; ground.height = H;
    var shore = document.createElement('canvas'); shore.width = W; shore.height = H;
    var g = ground.getContext('2d'), sh = shore.getContext('2d'), water = [];
    g.imageSmoothingEnabled = false; sh.imageSmoothingEnabled = false;

    function typeAt(x, y) { return (x < 0 || y < 0 || x >= map.cols || y >= map.rows) ? -1 : map.tileAt(x, y); }

    for (ty = 0; ty < map.rows; ty++) for (tx = 0; tx < map.cols; tx++) {
      var type = map.tileAt(tx, ty);
      g.drawImage(tileFor(type, tx, ty), tx * TS, ty * TS);
      if (type === T.WATER) water.push(tx, ty);
    }

    for (ty = 0; ty < map.rows; ty++) for (tx = 0; tx < map.cols; tx++) {
      var a = map.tileAt(tx, ty), ctx2 = a === T.WATER ? sh : g, X = tx * TS, Y = ty * TS;
      var up = typeAt(tx, ty - 1), dn = typeAt(tx, ty + 1), lf = typeAt(tx - 1, ty), rt = typeAt(tx + 1, ty);
      function higher(t) { return t >= 0 && PRIO[t] > PRIO[a]; }
      var d;
      if (higher(up)) { var bu = tileFor(up, tx, ty); for (x = 0; x < TS; x += 2) { d = depth(X + x, ty); ctx2.drawImage(bu, x, 0, 2, d, X + x, Y, 2, d); } }
      if (higher(dn)) { var bd = tileFor(dn, tx, ty); for (x = 0; x < TS; x += 2) { d = depth(X + x, ty + 1); ctx2.drawImage(bd, x, TS - d, 2, d, X + x, Y + TS - d, 2, d); } }
      if (higher(lf)) { var bl = tileFor(lf, tx, ty); for (y = 0; y < TS; y += 2) { d = depth(Y + y, 1000 + tx); ctx2.drawImage(bl, 0, y, d, 2, X, Y + y, d, 2); } }
      if (higher(rt)) { var br = tileFor(rt, tx, ty); for (y = 0; y < TS; y += 2) { d = depth(Y + y, 1001 + tx); ctx2.drawImage(br, TS - d, y, d, 2, X + TS - d, Y + y, d, 2); } }

      // Esquinas redondeadas donde solo hay vecino diagonal de mayor prioridad
      [[-1, -1, up, lf, 0, 0], [1, -1, up, rt, 1, 0], [-1, 1, dn, lf, 0, 1], [1, 1, dn, rt, 1, 1]].forEach(function (c) {
        var diag = typeAt(tx + c[0], ty + c[1]);
        if (!higher(diag) || higher(c[2]) || higher(c[3])) return;
        var bt = tileFor(diag, tx, ty), r = 8;
        for (var by = 0; by < r; by += 2) for (var bx = 0; bx < r; bx += 2) {
          if (Math.hypot(bx + 1, by + 1) > r) continue;
          var sx = c[4] ? TS - 2 - bx : bx, sy = c[5] ? TS - 2 - by : by;
          ctx2.drawImage(bt, sx, sy, 2, 2, X + sx, Y + sy, 2, 2);
        }
      });
    }
    map._bq = { ground: ground, shore: shore, water: water };
    return map._bq;
  }

  /** Dibuja el terreno visible. Devuelve true si lo ha dibujado (si no, el Renderer usa su respaldo). */
  pack.drawGround = function (ctx, map, camX, camY, k, time) {
    if (!tileCache) buildTiles();
    var b = bake(map), C = RPG.CONFIG, i;
    ctx.setTransform(k, 0, 0, k, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(b.ground, camX, camY, C.VIEW_W, C.VIEW_H, 0, 0, C.VIEW_W, C.VIEW_H);

    var f = Math.floor(time * 2.5) % 4, w = b.water, id = RPG.TILE_IDS.water[f] - 1;
    var sx = (id % COLS) * TS, sy = Math.floor(id / COLS) * TS;
    for (i = 0; i < w.length; i += 2) {
      var px = w[i] * TS - camX, py = w[i + 1] * TS - camY;
      if (px < -TS || py < -TS || px > C.VIEW_W || py > C.VIEW_H) continue;
      ctx.drawImage(RPG.Assets.img.tiles, sx, sy, TS, TS, px, py, TS, TS);
    }
    ctx.drawImage(b.shore, camX, camY, C.VIEW_W, C.VIEW_H, 0, 0, C.VIEW_W, C.VIEW_H);
  };

  /* =============== objetos =============== */
  function shadow(ctx, rx, ry, a) {
    ctx.fillStyle = 'rgba(0,0,0,' + (a == null ? 0.2 : a) + ')';
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); ctx.fill();
  }

  function spr(ctx, a, s, centerX) {               // dibuja un recorte de la hoja con los pies en (0,0)
    var ax = centerX ? a.w / 2 : a.ax;
    ctx.drawImage(RPG.Assets.img.tiles, a.x, a.y, a.w, a.h, -ax * s, -a.ay * s, a.w * s, a.h * s);
  }

  function px(ctx, x, y, w, h, c) { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); }

  var PETALS = ['#ffffff', '#f4f4f4', '#f4d03f', '#e88ab4'];
  function flowerPixels(ctx, v) {
    var c = PETALS[v % PETALS.length];
    px(ctx, -1, -6, 2, 6, '#2f8a3c');
    px(ctx, -3, -10, 2, 2, c); px(ctx, 1, -10, 2, 2, c); px(ctx, -1, -12, 2, 2, c); px(ctx, -1, -8, 2, 2, c);
    px(ctx, -1, -10, 2, 2, '#e08a1b');
  }

  function fireBQ(ctx, time) {
    var g = ctx.createRadialGradient(0, -8, 4, 0, -8, 64);
    g.addColorStop(0, 'rgba(255,170,60,0.28)'); g.addColorStop(1, 'rgba(255,150,40,0)');
    ctx.fillStyle = g; ctx.fillRect(-64, -72, 128, 128);
    shadow(ctx, 18, 6, 0.25);
    var stones = [[-16, -2], [-10, 2], [0, 4], [10, 2], [16, -2], [11, -6], [-11, -6], [0, -8]];
    stones.forEach(function (s, i) {
      px(ctx, s[0] - 3, s[1] - 3, 7, 5, '#3c3f45'); px(ctx, s[0] - 2, s[1] - 3, 5, 3, i % 2 ? '#8b9097' : '#a4a9b0');
    });
    px(ctx, -10, -4, 20, 3, '#5b3d22'); px(ctx, -8, -6, 16, 2, '#6b4a2b');
    var fr = A.fire[Math.floor(time * 8) % 3];
    ctx.drawImage(RPG.Assets.img.tiles, fr.x, fr.y, fr.w, fr.h, -fr.ax * 0.85, -fr.ay * 0.85 - 2, fr.w * 0.85, fr.h * 0.85);
  }

  function monolithBQ(ctx) {
    shadow(ctx, 30, 9, 0.28);
    spr(ctx, A.rockBig, 0.62, true);
    // marcas grabadas (píxeles oscuros sobre la cara de la roca)
    var m = 'rgba(70,76,88,0.9)';
    px(ctx, -8, -44, 16, 2, m); px(ctx, -8, -36, 2, 8, m); px(ctx, 6, -36, 2, 8, m); px(ctx, -4, -30, 8, 2, m);
    px(ctx, -2, -24, 2, 10, m); px(ctx, -8, -20, 4, 2, m); px(ctx, 4, -20, 4, 2, m);
  }

  function drawObjectBQ(ctx, o, time) {
    switch (o.type) {
      case 'tree':
        if (o.variant === 1) spr(ctx, A.palm, 0.82);
        else spr(ctx, A.oak, o.variant === 2 ? 0.6 : 0.72);
        return true;
      case 'rock':
        if (o.variant) spr(ctx, A.rockSmall, 1.15); else spr(ctx, A.rockTiny, 1.1);
        return true;
      case 'bush': spr(ctx, A.bush, 1.25); return true;
      case 'flower':
        if (o.variant < 2) spr(ctx, A.flower[o.variant % 3], 1); else flowerPixels(ctx, o.variant);
        return true;
      case 'tuft': spr(ctx, A.tuft[o.variant % 3], 1); return true;
      case 'fern': spr(ctx, A.fern, 1.2); return true;
      case 'hut': spr(ctx, o.variant ? A.hutB : A.hutA, 0.85, true); return true;
      case 'fire': fireBQ(ctx, time); return true;
      case 'monolith': monolithBQ(ctx); return true;
    }
    return false;
  }

  /* =============== personajes =============== */
  function gameTime() { return RPG.game ? RPG.game.time : 0; }

  function drawPlayerBQ(ctx, p) {
    var P = A.player, dir = p.dir, side = dir === 'left' || dir === 'right', key = (side ? 'right' : dir);
    var anim = P.rows[(p.moving ? 'walk_' : 'idle_') + key];
    var f = p.moving ? (p.frame % anim[1]) : (Math.floor(gameTime() * 2) % anim[1]);
    shadow(ctx, 11, 4.5, 0.25);
    ctx.save();
    if (dir === 'left') ctx.scale(-1, 1);
    ctx.drawImage(RPG.Assets.img.player, f * P.fw, anim[0] * P.fh, P.fw, P.fh, -P.cx, -P.foot, P.fw, P.fh);
    ctx.restore();
  }

  function drawNPCBQ(ctx, n) {
    var V = A.villager, f = Math.floor(gameTime() * 2 + n.x) % V.frames;
    shadow(ctx, 10, 4, 0.25);
    ctx.drawImage(RPG.Assets.img.villager, f * V.fw, 0, V.fw, V.fh, -V.cx, -V.foot, V.fw, V.fh);
  }

  /* Herbívoro: pixel art propio, pre-dibujado una vez (cada píxel de arte = 2x2 px) */
  var dinoCv = null;
  function buildDino() {
    var D = RPG.DINO, SC = 2;
    dinoCv = D.frames.map(function (rows) {
      var cv = document.createElement('canvas'); cv.width = rows[0].length * SC; cv.height = rows.length * SC;
      var g = cv.getContext('2d');
      rows.forEach(function (row, y) {
        for (var x = 0; x < row.length; x++) {
          var c = row.charAt(x); if (c === '.') continue;
          g.fillStyle = D.palette[c]; g.fillRect(x * SC, y * SC, SC, SC);
        }
      });
      return cv;
    });
  }

  function drawCreatureBQ(ctx, c) {
    if (!dinoCv) buildDino();
    var cv = dinoCv[c.moving ? Math.floor(c.animTime * (c.alert ? 14 : 7)) % dinoCv.length : 0];
    shadow(ctx, 24, 6, 0.22);
    ctx.save();
    if (c.facing === 'left') ctx.scale(-1, 1);
    ctx.drawImage(cv, -cv.width / 2 - 4, -cv.height);
    ctx.restore();
    if (c.alert) {
      ctx.fillStyle = '#ffd34d'; ctx.font = '20px ' + (RPG.Assets.fontOk ? 'GraphicPixel, ' : '') + 'sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('!', c.facing === 'left' ? -22 : 22, -cv.height - 2);
    }
  }

  /* =============== enlace con Sprites.js =============== */
  var proc = { object: S.drawObject, player: S.drawPlayer, npc: S.drawNPC };
  S.drawObject = function (ctx, o, time) { if (!(pack.active() && drawObjectBQ(ctx, o, time))) proc.object(ctx, o, time); };
  S.drawPlayer = function (ctx, p) { if (pack.active()) drawPlayerBQ(ctx, p); else proc.player(ctx, p); };
  S.drawNPC = function (ctx, n) { if (pack.active()) drawNPCBQ(ctx, n); else proc.npc(ctx, n); };
  S.drawCreature = drawCreatureBQ;   // el pixel art del herbívoro es propio y no depende de las imágenes
})();
