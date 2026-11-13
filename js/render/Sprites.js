/*
 * Sprites.js — Dibujo procedural (solo Canvas, sin imágenes).
 * Todas las funciones dibujan con el ORIGEN (0,0) en los pies de la entidad.
 * Para usar sprites reales más adelante basta con sustituir estas funciones.
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var TAU = Math.PI * 2;
  var S = (RPG.Sprites = {});

  /* ---------- utilidades ---------- */
  function shadow(ctx, rx, ry, a) {
    ctx.fillStyle = 'rgba(0,0,0,' + (a == null ? 0.22 : a) + ')';
    ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill();
  }
  function circle(ctx, x, y, r, c) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill();
  }
  function poly(ctx, pts, c) {
    ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(pts[0], pts[1]);
    for (var i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]);
    ctx.closePath(); ctx.fill();
  }

  /* ---------- naturaleza ---------- */
  function tree(ctx, v) {
    shadow(ctx, 22, 8);
    var i;
    if (v === 1) {                                   // helecho arborescente
      ctx.fillStyle = '#6a5236'; ctx.fillRect(-3, -36, 6, 36);
      ctx.fillStyle = '#53402a';
      for (i = 0; i < 5; i++) ctx.fillRect(-3, -6 - i * 7, 6, 2);
      ctx.lineCap = 'round'; ctx.lineWidth = 6;
      for (i = 0; i < 9; i++) {
        var a = i / 9 * TAU, c = Math.cos(a), s = Math.sin(a);
        ctx.strokeStyle = i % 2 ? '#3f8f4a' : '#4ea65a';
        ctx.beginPath(); ctx.moveTo(0, -38);
        ctx.quadraticCurveTo(c * 16, -54 + s * 4, c * 30, -36 + s * 12); ctx.stroke();
      }
    } else if (v === 2) {                            // conífera
      ctx.fillStyle = '#5b4128'; ctx.fillRect(-3, -12, 6, 12);
      poly(ctx, [0, -34, -22, -4, 22, -4], '#285a3a');
      poly(ctx, [0, -52, -18, -20, 18, -20], '#2a6040');
      poly(ctx, [0, -68, -13, -40, 13, -40], '#2c6a44');
    } else {                                         // frondoso
      ctx.fillStyle = '#6b4a2b'; ctx.fillRect(-4, -28, 8, 28);
      ctx.fillStyle = '#573b22'; ctx.fillRect(1, -28, 3, 28);
      circle(ctx, -11, -34, 12, '#2f6b34');
      circle(ctx, 11, -35, 12, '#2f6b34');
      circle(ctx, 0, -42, 16, '#35763a');
      circle(ctx, 0, -54, 12, '#3a8240');
      circle(ctx, -4, -46, 6, '#4a9a4f');
      circle(ctx, 8, -38, 5, '#40894a');
    }
  }

  function rock(ctx, v) {
    var s = v ? 1 : 0.62;
    shadow(ctx, 17 * s + 2, 5 * s + 1);
    ctx.save(); ctx.scale(s, s);
    poly(ctx, [-16, 0, -18, -10, -8, -20, 6, -22, 16, -12, 18, 0], '#8c9096');
    poly(ctx, [-8, -20, 6, -22, 12, -14, -6, -12], '#a9adb3');
    poly(ctx, [6, -22, 16, -12, 18, 0, 8, 0, 8, -10], '#767a80');
    ctx.strokeStyle = '#5f6368'; ctx.lineWidth = 1.5 / s;
    ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-18, -10); ctx.lineTo(-8, -20); ctx.lineTo(6, -22);
    ctx.lineTo(16, -12); ctx.lineTo(18, 0); ctx.closePath(); ctx.stroke();
    ctx.restore();
  }

  function bush(ctx, v) {
    shadow(ctx, 14, 5);
    circle(ctx, -8, -8, 9, '#3b7a38');
    circle(ctx, 8, -8, 9, '#3b7a38');
    circle(ctx, 0, -13, 10, '#468a42');
    circle(ctx, -3, -16, 4, '#58a052');
    if (v === 1) {
      ctx.fillStyle = '#c0392b';
      [[-8, -10], [6, -7], [1, -15], [9, -12]].forEach(function (p) { ctx.beginPath(); ctx.arc(p[0], p[1], 1.8, 0, TAU); ctx.fill(); });
    }
  }

  var PETALS = ['#f4d03f', '#f4f4f4', '#e88ab4', '#9b7be0'];
  function flower(ctx, v) {
    ctx.strokeStyle = '#3d7c33'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -7); ctx.stroke();
    ctx.fillStyle = PETALS[v % PETALS.length];
    for (var i = 0; i < 5; i++) {
      ctx.beginPath(); ctx.arc(Math.cos(i / 5 * TAU) * 2.4, -8 + Math.sin(i / 5 * TAU) * 2.4, 1.7, 0, TAU); ctx.fill();
    }
    circle(ctx, 0, -8, 1.3, '#d68910');
  }

  function tuft(ctx, v) {
    ctx.lineCap = 'round'; ctx.lineWidth = 1.6;
    ctx.strokeStyle = v ? '#6dae52' : '#3d7c33';
    for (var i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.moveTo(i * 1.5, 0); ctx.lineTo(i * 3.2, -6 - (2 - Math.abs(i)) * 1.5); ctx.stroke();
    }
  }

  function fern(ctx) {
    ctx.lineCap = 'round'; ctx.lineWidth = 2.4; ctx.strokeStyle = '#357a42';
    for (var i = 0; i < 7; i++) {
      var a = -Math.PI * 0.95 + i / 6 * Math.PI * 0.9;
      ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(Math.cos(a) * 7, Math.sin(a) * 9 - 2, Math.cos(a) * 14, Math.sin(a) * 11 + 1); ctx.stroke();
    }
  }

  /* ---------- construcciones ---------- */
  function hut(ctx, v) {
    shadow(ctx, 50, 11, 0.25);
    ctx.fillStyle = v ? '#7d6240' : '#8b6a45'; ctx.fillRect(-34, -36, 68, 36);
    ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1;
    for (var x = -28; x <= 28; x += 8) { ctx.beginPath(); ctx.moveTo(x, -36); ctx.lineTo(x, 0); ctx.stroke(); }
    poly(ctx, [0, -84, -48, -30, 48, -30], '#b89a54');
    poly(ctx, [0, -84, 48, -30, 30, -30], '#a3863f');
    ctx.strokeStyle = 'rgba(80,55,20,.45)'; ctx.lineWidth = 1.5;
    for (var k = -36; k <= 36; k += 9) { ctx.beginPath(); ctx.moveTo(k * 0.35, -78 + Math.abs(k) * 0.1); ctx.lineTo(k * 1.2, -31); ctx.stroke(); }
    ctx.fillStyle = '#3b2a1a'; ctx.fillRect(-8, -24, 16, 24);
    ctx.fillStyle = '#5a4128'; ctx.fillRect(-8, -24, 16, 3);
  }

  function fire(ctx, t) {
    ctx.fillStyle = 'rgba(255,150,40,0.10)'; circle(ctx, 0, -8, 60, 'rgba(255,150,40,0.10)');
    circle(ctx, 0, -8, 34, 'rgba(255,170,60,0.14)');
    shadow(ctx, 18, 6);
    for (var i = 0; i < 9; i++) {
      var a = i / 9 * TAU;
      circle(ctx, Math.cos(a) * 14, Math.sin(a) * 5 - 3, 4, i % 2 ? '#7c8087' : '#989ca3');
    }
    ctx.save(); ctx.lineCap = 'round'; ctx.lineWidth = 5;
    ctx.strokeStyle = '#5b3d22'; ctx.beginPath(); ctx.moveTo(-10, -2); ctx.lineTo(10, -7); ctx.stroke();
    ctx.strokeStyle = '#6b4a2b'; ctx.beginPath(); ctx.moveTo(-10, -7); ctx.lineTo(10, -2); ctx.stroke();
    ctx.restore();
    var f1 = Math.sin(t * 13) * 2, f2 = Math.sin(t * 9 + 1) * 2;
    poly(ctx, [-8, -5, -4 + f1, -22, 0, -10, 3 + f2, -26, 8, -5], '#e8741c');
    poly(ctx, [-5, -5, -2 + f2, -16, 1, -8, 3 + f1, -18, 5, -5], '#f7b733');
    poly(ctx, [-2, -5, 0, -11, 3, -5], '#fff1a8');
  }

  function monolith(ctx) {
    shadow(ctx, 30, 9, 0.28);
    ctx.fillStyle = '#7f8590';
    ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-13, -62); ctx.quadraticCurveTo(0, -80, 13, -62); ctx.lineTo(15, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#9aa0ab';
    ctx.beginPath(); ctx.moveTo(-15, 0); ctx.lineTo(-13, -62); ctx.quadraticCurveTo(-8, -72, -4, -74); ctx.lineTo(-4, 0); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#656b75';
    ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(6, -72); ctx.quadraticCurveTo(11, -68, 13, -62); ctx.lineTo(15, 0); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#d3d8df'; ctx.lineWidth = 2; ctx.lineCap = 'round';
    [[-5, -52, 5, -52], [-5, -44, 0, -38], [0, -38, 5, -44], [-5, -30, 5, -30], [0, -26, 0, -18], [-5, -18, 5, -18]].forEach(function (l) {
      ctx.beginPath(); ctx.moveTo(l[0], l[1]); ctx.lineTo(l[2], l[3]); ctx.stroke();
    });
  }

  /* ---------- personajes ---------- */
  var PAL_PLAYER = { tunic: '#a0522d', pants: '#5b3a29', skin: '#e0b48a', hair: '#3a2a1e', belt: '#d9b66a', shoes: '#2d1f15' };
  var PAL_ELDER = { tunic: '#6f8a56', pants: '#6a5a48', skin: '#d9a77c', hair: '#dcdcdc', belt: '#8a6a3a', shoes: '#3a2b1d' };

  function humanoid(ctx, dir, frame, moving, pal, staff) {
    shadow(ctx, 9, 4);
    var mirror = dir === 'left';
    var side = dir === 'left' || dir === 'right';
    var sw = moving ? [0, 3, 0, -3][frame % 4] : 0;
    ctx.save();
    if (mirror) ctx.scale(-1, 1);

    // piernas
    if (side) {
      ctx.fillStyle = pal.pants;
      ctx.fillRect(-4 - sw, -9, 4, 8); ctx.fillRect(1 + sw, -9, 4, 8);
      ctx.fillStyle = pal.shoes;
      ctx.fillRect(-4 - sw, -2, 5, 2); ctx.fillRect(1 + sw, -2, 5, 2);
    } else {
      ctx.fillStyle = pal.pants;
      ctx.fillRect(-6, -9 + Math.max(0, sw) * 0.5, 5, 8 - Math.max(0, sw) * 0.5);
      ctx.fillRect(1, -9 + Math.max(0, -sw) * 0.5, 5, 8 - Math.max(0, -sw) * 0.5);
      ctx.fillStyle = pal.shoes;
      ctx.fillRect(-6, -2 - Math.max(0, sw) * 0.5, 5, 2); ctx.fillRect(1, -2 - Math.max(0, -sw) * 0.5, 5, 2);
    }
    // bastón (detrás del cuerpo si mira de espaldas)
    if (staff && dir === 'up') { ctx.fillStyle = '#6b4a2b'; ctx.fillRect(9, -32, 2, 32); }
    // torso
    ctx.fillStyle = pal.tunic; ctx.fillRect(-7, -21, 14, 13);
    ctx.fillStyle = pal.belt; ctx.fillRect(-7, -12, 14, 2);
    // brazos
    ctx.fillStyle = pal.skin;
    if (side) { ctx.fillRect(-2 + sw * 0.4, -20, 4, 9); }
    else { ctx.fillRect(-10, -20 + sw * 0.5, 3, 9); ctx.fillRect(7, -20 - sw * 0.5, 3, 9); }
    // cabeza
    circle(ctx, 0, -27, 6.5, pal.skin);
    ctx.fillStyle = pal.hair;
    if (dir === 'up') { circle(ctx, 0, -27, 7, pal.hair); }
    else {
      ctx.beginPath(); ctx.arc(0, -27.5, 7, Math.PI, TAU); ctx.fill();
      if (side) ctx.fillRect(-7, -28, 5, 6);
    }
    // cara
    ctx.fillStyle = '#1d1712';
    if (dir === 'down') { ctx.fillRect(-3, -26, 2, 2); ctx.fillRect(1, -26, 2, 2); }
    else if (side) { ctx.fillRect(2, -26, 2, 2); }
    // bastón (delante)
    if (staff && dir !== 'up') { ctx.fillStyle = '#6b4a2b'; ctx.fillRect(side ? 7 : 10, -32, 2, 32); }
    ctx.restore();
  }

  function herbivore(ctx, facing, animT, moving, alert) {
    ctx.save();
    if (facing === 'left') ctx.scale(-1, 1);
    shadow(ctx, 21, 6);
    var sw = moving ? Math.sin(animT * (alert ? 18 : 9)) * 4 : 0;
    ctx.fillStyle = '#4e6b3f';
    ctx.fillRect(-9 + sw, -8, 4, 8); ctx.fillRect(7 - sw, -8, 4, 8);        // patas lejanas
    poly(ctx, [-12, -17, -31, -9, -12, -9], '#6f8f5a');                      // cola
    ctx.fillStyle = '#7ba063'; ctx.beginPath(); ctx.ellipse(0, -14, 16, 8.5, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#a9c486'; ctx.beginPath(); ctx.ellipse(1, -10, 12, 4, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = '#d1a94b';                                               // cresta dorsal
    for (var i = 0; i < 5; i++) poly(ctx, [-9 + i * 5, -21, -6.5 + i * 5, -27, -4 + i * 5, -21], '#d1a94b');
    ctx.strokeStyle = '#7ba063'; ctx.lineWidth = 7; ctx.lineCap = 'round';   // cuello
    ctx.beginPath(); ctx.moveTo(10, -16); ctx.lineTo(18, -25); ctx.stroke();
    ctx.fillStyle = '#7ba063'; ctx.beginPath(); ctx.ellipse(22, -26, 7, 4.5, -0.2, 0, TAU); ctx.fill();
    ctx.fillStyle = '#a9c486'; ctx.beginPath(); ctx.ellipse(26, -24.5, 3.5, 2.2, 0, 0, TAU); ctx.fill();
    circle(ctx, 23.5, -27.5, 1.3, '#1b1b1b');
    ctx.fillStyle = '#648a4f';
    ctx.fillRect(-5 - sw, -8, 4, 8); ctx.fillRect(10 + sw, -8, 4, 8);        // patas cercanas
    ctx.restore();
    if (alert) {
      ctx.fillStyle = '#ffd34d'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
      ctx.fillText('!', facing === 'left' ? -20 : 20, -36);
    }
  }

  /* ---------- API ---------- */
  S.drawObject = function (ctx, o, time) {
    switch (o.type) {
      case 'tree': tree(ctx, o.variant); break;
      case 'rock': rock(ctx, o.variant); break;
      case 'bush': bush(ctx, o.variant); break;
      case 'flower': flower(ctx, o.variant); break;
      case 'tuft': tuft(ctx, o.variant); break;
      case 'fern': fern(ctx); break;
      case 'hut': hut(ctx, o.variant); break;
      case 'fire': fire(ctx, time); break;
      case 'monolith': monolith(ctx); break;
    }
  };
  S.drawPlayer = function (ctx, p) { humanoid(ctx, p.dir, p.frame, p.moving, PAL_PLAYER, false); };
  S.drawNPC = function (ctx, n) { humanoid(ctx, n.dir, 0, false, PAL_ELDER, true); };
  S.drawCreature = function (ctx, c) { herbivore(ctx, c.facing, c.animTime, c.moving, c.alert); };
})();
