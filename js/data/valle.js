/*
 * valle.js — Datos del mapa "Valle de los Ancestros".
 * Se genera con un generador pseudoaleatorio con semilla fija: el mapa es siempre el mismo
 * y no hace falta cargar ningún JSON externo (compatible con file://).
 * Devuelve datos puros: terreno, objetos, NPC y criaturas. No dibuja nada.
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var T = RPG.TILES;

  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  RPG.buildValle = function () {
    var TS = RPG.CONFIG.TILE, W = 64, H = 48;
    var rnd = mulberry32(1337);
    function rr(a, b) { return a + rnd() * (b - a); }
    function ri(a, b) { return Math.floor(rr(a, b + 1)); }
    function inb(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
    function idx(x, y) { return y * W + x; }

    var ground = [], occ = [], i, x, y;
    for (i = 0; i < W * H; i++) { ground.push(T.GRASS); occ.push(0); }
    function set(x, y, t) { if (inb(x, y)) ground[idx(x, y)] = t; }
    function isGrass(x, y) { var t = ground[idx(x, y)]; return t === T.GRASS || t === T.DARK_GRASS; }
    function reserve(cx, cy, r) {
      for (var yy = Math.floor(cy - r); yy <= Math.ceil(cy + r); yy++)
        for (var xx = Math.floor(cx - r); xx <= Math.ceil(cx + r); xx++)
          if (inb(xx, yy) && Math.hypot(xx - cx, yy - cy) <= r) occ[idx(xx, yy)] = 1;
    }

    /* ---- Manchas de hierba oscura (zonas más boscosas) ---- */
    for (i = 0; i < 26; i++) {
      var bx = rr(2, W - 2), by = rr(2, H - 2), br = rr(2, 5);
      for (y = 0; y < H; y++) for (x = 0; x < W; x++)
        if (Math.hypot(x - bx, y - by) < br * (0.75 + rnd() * 0.35)) set(x, y, T.DARK_GRASS);
    }

    /* ---- Estanque con orilla de arena ---- */
    var PX = 47, PY = 13, PRX = 6.5, PRY = 4.5;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      var q = Math.pow((x + 0.5 - PX) / PRX, 2) + Math.pow((y + 0.5 - PY) / PRY, 2);
      if (q <= 1) set(x, y, T.WATER); else if (q <= 1.5) set(x, y, T.SAND);
    }

    /* ---- Caminos ---- */
    function carve(pts, w) {
      for (var s = 0; s < pts.length - 1; s++) {
        var a = pts[s], b = pts[s + 1];
        var n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) * 2));
        for (var k = 0; k <= n; k++) {
          var px = a[0] + (b[0] - a[0]) * k / n, py = a[1] + (b[1] - a[1]) * k / n, r = w / 2;
          for (var dy = -Math.ceil(r); dy <= Math.ceil(r); dy++)
            for (var dx = -Math.ceil(r); dx <= Math.ceil(r); dx++)
              if (dx * dx + dy * dy <= r * r + 0.5) {
                var tx = Math.round(px + dx), ty = Math.round(py + dy);
                if (inb(tx, ty) && ground[idx(tx, ty)] !== T.WATER) set(tx, ty, T.PATH);
              }
        }
      }
    }
    carve([[20, 25], [30, 26], [40, 25], [50, 26], [60, 25]], 3);   // este-oeste
    carve([[20, 25], [19, 16], [21, 8], [20, 4]], 3);               // norte
    carve([[20, 25], [21, 34], [19, 42], [20, 44]], 3);             // sur
    carve([[28, 26], [32, 33], [40, 37], [49, 38]], 2);             // hacia la piedra grabada
    carve([[36, 25], [38, 19], [41, 15]], 2);                       // hacia el estanque
    for (y = 0; y < H; y++) for (x = 0; x < W; x++)                  // plaza de la aldea
      if (Math.hypot(x - 20, y - 25) <= 4.5) set(x, y, T.PATH);

    /* ---- Terreno no apto para vegetación ---- */
    for (y = 0; y < H; y++) for (x = 0; x < W; x++)
      if (!isGrass(x, y)) occ[idx(x, y)] = 1;

    /* ---- Objetos ---- */
    var objects = [], oid = 0;
    function add(type, px, py, extra) {
      var o = { id: 'o' + (oid++), type: type, x: px, y: py, variant: 0, collider: null, interact: null };
      for (var k in extra) o[k] = extra[k];
      objects.push(o); return o;
    }
    function col(px, py, w, h) { return { x: px - w / 2, y: py - h, w: w, h: h }; }

    // Aldea
    var huts = [[14, 23], [26, 22], [14, 30], [26, 31]];
    huts.forEach(function (h, n) {
      var hx = h[0] * TS, hy = h[1] * TS;
      add('hut', hx, hy, {
        variant: n % 2, collider: col(hx, hy, 68, 24),
        interact: n === 0 ? { dialogue: 'hut', label: 'Mirar la choza', range: 50, dy: 14, bubble: -70 } : null
      });
      for (var yy = h[1] - 3; yy <= h[1] + 1; yy++) for (var xx = h[0] - 3; xx <= h[0] + 3; xx++)
        if (inb(xx, yy)) occ[idx(xx, yy)] = 1;
    });
    var fx = 20 * TS, fy = 25 * TS;
    add('fire', fx, fy, {
      collider: col(fx, fy, 26, 12),
      interact: { dialogue: 'fire', label: 'Mirar la fogata', range: 52, bubble: -40 }
    });
    reserve(20, 25, 5);
    reserve(20, 28.5, 2.5);                       // zona de aparición del jugador

    // Piedra grabada (punto de interés) con anillo de rocas
    var sx = 49 * TS, sy = 38 * TS;
    add('monolith', sx, sy, {
      collider: col(sx, sy, 32, 12),
      interact: { dialogue: 'stone', label: 'Examinar la piedra', range: 84, bubble: -86 }
    });
    for (i = 0; i < 8; i++) {
      var ang = i * Math.PI / 4;
      if (i === 4) continue;                       // hueco al oeste: entrada desde el camino
      add('rock', sx + Math.cos(ang) * 74, sy + Math.sin(ang) * 46, { variant: 1, collider: col(sx + Math.cos(ang) * 74, sy + Math.sin(ang) * 46, 28, 12) });
    }
    reserve(49, 38, 6);

    // Criaturas (posiciones en casillas)
    var creatureSpots = [[31, 20], [30, 38], [56, 29], [10, 37], [40, 6]];
    creatureSpots.forEach(function (c) { reserve(c[0], c[1], 2); });

    // Estanque: algo de decoración fija en la orilla
    add('rock', 40.2 * TS, 17 * TS, { variant: 0, collider: col(40.2 * TS, 17 * TS, 18, 8) });
    add('rock', 53 * TS, 18.4 * TS, { variant: 1, collider: col(53 * TS, 18.4 * TS, 28, 12) });
    reserve(40, 17, 1); reserve(53, 18, 1);

    // Árboles de borde (límite visual del mapa)
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) {
      if (x < 2 || y < 2 || x >= W - 2 || y >= H - 2) {
        if (rnd() < 0.92) {
          var tvx = x * TS + TS / 2 + rr(-8, 8), tvy = y * TS + TS - rr(0, 8);
          add('tree', tvx, tvy, { variant: ri(0, 2), collider: col(tvx, tvy, 14, 10) });
        }
        occ[idx(x, y)] = 1;
      }
    }

    // Árboles interiores: más densos en la hierba oscura
    for (y = 2; y < H - 2; y++) for (x = 2; x < W - 2; x++) {
      if (occ[idx(x, y)] || !isGrass(x, y)) continue;
      var p = ground[idx(x, y)] === T.DARK_GRASS ? 0.28 : 0.05;
      if (rnd() < p) {
        var tx2 = x * TS + TS / 2 + rr(-8, 8), ty2 = y * TS + TS - rr(0, 6);
        add('tree', tx2, ty2, { variant: ri(0, 2), collider: col(tx2, ty2, 14, 10) });
        occ[idx(x, y)] = 1;
      }
    }

    // Rocas, arbustos
    function scatter(type, count, build) {
      var placed = 0, tries = 0;
      while (placed < count && tries++ < count * 40) {
        var gx = ri(2, W - 3), gy = ri(2, H - 3);
        if (occ[idx(gx, gy)] || !isGrass(gx, gy)) continue;
        var px = gx * TS + rr(6, TS - 6), py = gy * TS + rr(14, TS - 2);
        var v = build(px, py);
        add(type, px, py, v);
        occ[idx(gx, gy)] = 1; placed++;
      }
    }
    scatter('rock', 34, function (px, py) { var big = rnd() < 0.3; return { variant: big ? 1 : 0, collider: big ? col(px, py, 28, 12) : col(px, py, 18, 8) }; });
    scatter('bush', 46, function (px, py) { return { variant: rnd() < 0.35 ? 1 : 0, collider: col(px, py, 18, 9) }; });

    // Decoración sin colisión
    function decor(type, count, variants) {
      var placed = 0, tries = 0;
      while (placed < count && tries++ < count * 30) {
        var gx = ri(1, W - 2), gy = ri(1, H - 2);
        if (!isGrass(gx, gy)) continue;
        var px = gx * TS + rr(2, TS - 2), py = gy * TS + rr(8, TS - 2);
        // evitar caminos, plaza y huts
        if (Math.hypot(gx - 20, gy - 25) < 5.2) continue;
        add(type, px, py, { variant: ri(0, variants - 1) });
        placed++;
      }
    }
    decor('tuft', 190, 2);
    decor('fern', 80, 1);
    decor('flower', 130, 4);

    return {
      id: 'valle',
      name: 'Valle de los Ancestros',
      width: W, height: H, tile: TS,
      ground: ground,
      objects: objects,
      npcs: [
        { id: 'tala', name: 'Tala', x: 22 * TS, y: 26 * TS, dialogue: 'elder', label: 'Hablar con Tala', range: 58 }
      ],
      creatures: creatureSpots.map(function (c, n) {
        return { id: 'c' + n, species: 'herbivoro_valle', x: c[0] * TS + TS / 2, y: c[1] * TS + TS - 4 };
      }),
      spawn: { x: 20 * TS, y: 28.5 * TS }
    };
  };
})();
