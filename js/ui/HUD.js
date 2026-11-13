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
      var g = this.game, p = g.player, k = g.renderer.k;
      ctx.setTransform(k, 0, 0, k, 0, 0);
      ctx.textBaseline = 'alphabetic';

      /* Nombre y vida */
      ctx.fillStyle = 'rgba(12,16,18,.62)'; rrect(ctx, 14, 14, 232, 58, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(184,137,60,.8)'; ctx.lineWidth = 1.5; rrect(ctx, 14, 14, 232, 58, 8); ctx.stroke();
      ctx.fillStyle = '#f2c566'; ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(p.name, 26, 36);
      var bw = 140, ratio = Math.max(0, Math.min(1, p.hp / p.maxHp));
      ctx.fillStyle = 'rgba(0,0,0,.55)'; rrect(ctx, 26, 45, bw, 14, 5); ctx.fill();
      if (ratio > 0) {
        ctx.fillStyle = ratio > 0.5 ? '#4caf50' : (ratio > 0.25 ? '#e0a030' : '#d9433a');
        rrect(ctx, 26, 45, Math.max(8, bw * ratio), 14, 5); ctx.fill();
      }
      ctx.fillStyle = '#f6ecd0'; ctx.font = '12px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'left';
      ctx.fillText(Math.round(p.hp) + ' / ' + p.maxHp, 174, 57);

      /* Zona y objetivo */
      ctx.font = '13px "Segoe UI", Arial, sans-serif';
      var lines = wrap(ctx, RPG.getObjective(g.flags), 240);
      var boxH = 46 + lines.length * 17, bx = C.VIEW_W - 14 - 268;
      ctx.fillStyle = 'rgba(12,16,18,.62)'; rrect(ctx, bx, 14, 268, boxH, 8); ctx.fill();
      ctx.strokeStyle = 'rgba(184,137,60,.8)'; rrect(ctx, bx, 14, 268, boxH, 8); ctx.stroke();
      ctx.textAlign = 'left'; ctx.fillStyle = '#f2c566'; ctx.font = 'bold 13px "Segoe UI", Arial, sans-serif';
      ctx.fillText(g.world.map.name, bx + 14, 34);
      ctx.fillStyle = '#e8dcc0'; ctx.font = '13px "Segoe UI", Arial, sans-serif';
      lines.forEach(function (l, i) { ctx.fillText(l, bx + 14, 54 + i * 17); });

      /* Indicador de interacción */
      var it = g.interaction.current;
      if (it && g.state === 'playing') {
        var sp = g.renderer.project(it.x, it.y + (it.ref && it.ref.interact ? -(it.ref.interact.dy || 0) : 0));
        var by = sp.y + it.bubble + Math.sin(g.time * 4) * 2;
        ctx.fillStyle = '#f6e7b0'; ctx.strokeStyle = '#7a5a20'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(sp.x, by, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3a2a10'; ctx.font = 'bold 15px "Segoe UI", Arial, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText('E', sp.x, by + 5.5);

        var label = '[E]  ' + it.label;
        ctx.font = 'bold 16px "Segoe UI", Arial, sans-serif';
        var tw = ctx.measureText(label).width + 36;
        ctx.fillStyle = 'rgba(12,16,18,.78)'; rrect(ctx, C.VIEW_W / 2 - tw / 2, C.VIEW_H - 62, tw, 34, 17); ctx.fill();
        ctx.strokeStyle = 'rgba(242,197,102,.9)'; ctx.lineWidth = 1.5; rrect(ctx, C.VIEW_W / 2 - tw / 2, C.VIEW_H - 62, tw, 34, 17); ctx.stroke();
        ctx.fillStyle = '#f6ecd0'; ctx.fillText(label, C.VIEW_W / 2, C.VIEW_H - 40);
      }

      /* Ayuda de controles y FPS */
      ctx.textAlign = 'left'; ctx.font = '12px "Segoe UI", Arial, sans-serif';
      if (g.settings.showHelp) {
        ctx.fillStyle = 'rgba(246,236,208,.7)';
        ctx.fillText('WASD / Flechas: mover  ·  E: interactuar  ·  Esc: pausa', 16, C.VIEW_H - 14);
      }
      if (g.settings.showFps) {
        ctx.fillStyle = '#c9f0c9'; ctx.textAlign = 'right';
        ctx.fillText(g.fps + ' FPS', C.VIEW_W - 16, C.VIEW_H - 14);
      }
    }
  }

  RPG.HUD = HUD;
})();
