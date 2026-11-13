/*
 * Dialogue.js — Cuadro de diálogo (DOM) con efecto de escritura.
 * open(speaker, lines, onClose) · advance() · close()
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  class Dialogue {
    constructor(game) {
      this.game = game;
      this.box = document.getElementById('dialogue');
      this.speakerEl = document.getElementById('dlg-speaker');
      this.textEl = document.getElementById('dlg-text');
      this.isOpen = false;
      this.lines = []; this.index = 0; this.shown = 0; this.onClose = null;
      var self = this;
      this.box.addEventListener('click', function () { if (self.isOpen) self.advance(); });
    }

    open(speaker, lines, onClose) {
      this.lines = lines; this.index = 0; this.shown = 0; this.onClose = onClose || null;
      this.speakerEl.textContent = speaker || '';
      this.textEl.className = speaker ? '' : 'narration';
      this.box.classList.remove('hidden');
      this.isOpen = true;
      this._render();
    }

    _render() { this.textEl.textContent = this.lines[this.index].slice(0, Math.floor(this.shown)); }

    update(dt) {
      if (!this.isOpen) return;
      var full = this.lines[this.index].length;
      if (this.shown < full) { this.shown = Math.min(full, this.shown + dt * 55); this._render(); }
    }

    advance() {
      if (!this.isOpen) return;
      var full = this.lines[this.index].length;
      if (this.shown < full) { this.shown = full; this._render(); return; }   // primero completa el texto
      if (this.index < this.lines.length - 1) { this.index++; this.shown = 0; this._render(); }
      else this.close();
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      this.box.classList.add('hidden');
      var cb = this.onClose; this.onClose = null;
      if (cb) cb();
      this.game.endDialogue();
    }
  }

  RPG.Dialogue = Dialogue;
})();
