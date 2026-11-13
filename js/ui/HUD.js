/*
 * HUD.js — Interfaz sobre el canvas: nombre, vida, objetivo, indicador de interacción.
 * Los avisos (toast) usan un elemento DOM.
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var C = RPG.CONFIG;

  function rrect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }


  function font(px) { return px + 'px ' + (RPG.Assets.fontOk ? 'GraphicPixel, ' : '') + '"Segoe UI", Arial, sans-serif'; }

  /** Marco de piedra de BrowserQuest (border.png cortado en 9 trozos de 10 px). Sin imagen: marco simple. */
  function panel(ctx, x, y, w, h) {
    var im = RPG.Assets.ok && RPG.Assets.img.border;
    if (!im) {
      ctx.fillStyle = 'rgba(12,16,18,.7)'; rrect(ctx, x, y, w, h, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(184,137,60,.8)'; ctx.lineWidth = 1.5; rrect(ctx, x, y, w, h, 8); ctx.stroke();
      return;
    }
    var b = 10, W = im.width, H = im.height;
    ctx.fillStyle = 'rgba(40,40,40,.95)'; ctx.fillRect(x + 4, y + 4, w - 8, h - 8);   // el centro de border.png es transparente
    ctx.drawImage(im, b, b, W - 2 * b, H - 2 * b, x + b, y + b, w - 2 * b, h - 2 * b);
    ctx.drawImage(im, b, 0, W - 2 * b, b, x + b, y, w - 2 * b, b);
    ctx.drawImage(im, b, H - b, W - 2 * b, b, x + b, y + h - b, w - 2 * b, b);
    ctx.drawImage(im, 0, b, b, H - 2 * b, x, y + b, b, h - 2 * b);
    ctx.drawImage(im, W - b, b, b, H - 2 * b, x + w - b, y + b, b, h - 2 * b);
    ctx.drawImage(im, 0, 0, b, b, x, y, b, b);
    ctx.drawImage(im, W - b, 0, b, b, x + w - b, y, b, b);
    ctx.drawImage(im, 0, H - b, b, b, x, y + h - b, b, b);
    ctx.drawImage(im, W - b, H - b, b, b, x + w - b, y + h - b, b, b);
  }

  function wrap(ctx, text, maxW) {
    var words = text.split(' '), lines = [], line = '';
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    });
    if (line) lines.push(line);
    return lines;
  }

  class HUD {
    constructor(game) {
      this.game = game;
      this.toastEl = document.getElementById('toast');
      this._toastTimer = null;
    }

    toast(msg) {
      var el = this.toastEl;
      el.textContent = msg; el.classList.add('show');
      clearTimeout(this._toastTimer);
      this._toastTimer = setTimeout(function () { el.classList.remove('show'); }, 2200);
    }

    draw(ctx) {
      var g = this.game, p = g.player, k = g.renderer.k, bq = RPG.Assets.ok;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.textBaseline = 'alphabetic';
      ctx.imageSmoothingEnabled = !bq;

      /* Nombre y vida */
      panel(ctx, 10, 10, 238, 70);
      ctx.fillStyle = '#fcda5c'; ctx.font = font(20); ctx.textAlign = 'left';
      ctx.fillText(p.name, 24, 36);
      var ratio = Math.max(0, Math.min(1, p.hp / p.maxHp)), sx = 24, sy = 44;
      if (bq) {
        ctx.drawImage(RPG.Assets.img.bars, 0, 34, 204, 26, sx, sy, 204, 26);      // corazón + barra de BrowserQuest
        ctx.fillStyle = '#d83939'; ctx.fillRect(sx + 27, sy + 9, Math.round(171 * ratio), 15);
        ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(sx + 27, sy + 9, Math.round(171 * ratio), 3);
      } else {
        ctx.fillStyle = 'rgba(0,0,0,.55)'; rrect(ctx, sx, sy + 6, 180, 14, 5); ctx.fill();
        ctx.fillStyle = '#d9433a'; rrect(ctx, sx, sy + 6, Math.max(8, 180 * ratio), 14, 5); ctx.fill();
      }
      ctx.fillStyle = '#fff'; ctx.font = font(15); ctx.textAlign = 'center';
      ctx.fillText(Math.round(p.hp) + ' / ' + p.maxHp, sx + 116, sy + 21);

      /* Zona y objetivo */
      ctx.font = font(17);
      var lines = wrap(ctx, RPG.getObjective(g.flags), 236);
      var boxH = 52 + lines.length * 20, bx = C.VIEW_W - 10 - 268;
      panel(ctx, bx, 10, 268, boxH);
      ctx.textAlign = 'left'; ctx.fillStyle = '#fcda5c'; ctx.font = font(19);
      ctx.fillText(g.world.map.name, bx + 16, 34);
      ctx.fillStyle = '#e6e6e6'; ctx.font = font(17);
      lines.forEach(function (l, i) { ctx.fillText(l, bx + 16, 56 + i * 20); });

      /* Indicador de interacción */
      var it = g.interaction.current;
      if (it && g.state === 'playing') {
        var sp = g.renderer.project(it.x, it.y + (it.ref && it.ref.interact ? -(it.ref.interact.dy || 0) : 0));
        var by = Math.round(sp.y + it.bubble + Math.sin(g.time * 4) * 2);
        panel(ctx, Math.round(sp.x) - 15, by - 17, 30, 28);
        ctx.fillStyle = '#fcda5c'; ctx.font = font(20); ctx.textAlign = 'center';
        ctx.fillText('E', Math.round(sp.x), by + 4);

        var label = '[E]  ' + it.label;
        ctx.font = font(19);
        var tw = ctx.measureText(label).width + 40;
        panel(ctx, Math.round(C.VIEW_W / 2 - tw / 2), C.VIEW_H - 64, Math.round(tw), 38);
        ctx.fillStyle = '#f0f0f0'; ctx.fillText(label, C.VIEW_W / 2, C.VIEW_H - 39);
      }

      /* Ayuda de controles y FPS */
      ctx.textAlign = 'left'; ctx.font = font(15);
      if (g.settings.showHelp) {
        ctx.fillStyle = '#000'; ctx.fillText('WASD / Flechas: mover  ·  E: interactuar  ·  Esc: pausa', 17, C.VIEW_H - 13);
        ctx.fillStyle = '#e6e6e6'; ctx.fillText('WASD / Flechas: mover  ·  E: interactuar  ·  Esc: pausa', 16, C.VIEW_H - 14);
      }
      if (g.settings.showFps) {
        ctx.fillStyle = '#c9f0c9'; ctx.textAlign = 'right';
        ctx.fillText(g.fps + ' FPS', C.VIEW_W - 16, C.VIEW_H - 14);
      }
    }
  }

  RPG.HUD = HUD;
})();
