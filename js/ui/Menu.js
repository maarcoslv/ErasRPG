/*
 * Menu.js — Menú principal, ajustes, créditos, pausa y ventana de confirmación (DOM).
 * Los botones se enlazan por el atributo data-action (delegación de eventos).
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  var SETTING_LABELS = {
    showFps: 'Mostrar FPS',
    showHelp: 'Mostrar ayuda de controles',
    autosave: 'Autoguardado (cada 30 s)',
    sound: 'Sonido'
  };

  class Menu {
    constructor(game) {
      this.game = game;
      this.names = ['main', 'settings', 'credits', 'pause'];
      this.current = null;
      this.settingsReturn = 'main';
      this._confirmResolve = null;
      this.modal = document.getElementById('modal');
      var self = this;

      document.getElementById('ui').addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('[data-action]') : null;
        if (b && !b.disabled) self.onAction(b.getAttribute('data-action'), b);
      });

      // Navegación con flechas arriba/abajo entre los botones visibles
      document.addEventListener('keydown', function (e) {
        if (e.code !== 'ArrowDown' && e.code !== 'ArrowUp') return;
        var scope = self._visibleScope();
        if (!scope) return;
        var btns = Array.prototype.filter.call(scope.querySelectorAll('button'), function (b) { return !b.disabled; });
        if (!btns.length) return;
        var i = btns.indexOf(document.activeElement);
        i = e.code === 'ArrowDown' ? (i + 1) % btns.length : (i <= 0 ? btns.length - 1 : i - 1);
        btns[i].focus(); e.preventDefault();
      });
    }

    _visibleScope() {
      if (!this.modal.classList.contains('hidden')) return this.modal;
      return this.current ? document.getElementById('screen-' + this.current) : null;
    }

    show(name) {
      this.names.forEach(function (n) { document.getElementById('screen-' + n).classList.add('hidden'); });
      this.current = name;
      if (!name) return;
      var el = document.getElementById('screen-' + name);
      el.classList.remove('hidden');
      var first = el.querySelector('button:not(:disabled)');
      if (first) first.focus();
    }

    hideAll() { this.show(null); }

    async showMain() {
      await this.refreshContinue();
      this.show('main');
    }

    async refreshContinue() {
      var d = await RPG.SaveSystem.load();
      document.getElementById('btn-continue').disabled = !d;
      var note = document.getElementById('main-note');
      if (d && d.savedAt) {
        var dt = new Date(d.savedAt);
        note.textContent = 'Última partida guardada: ' + dt.toLocaleDateString() + ' ' + dt.toLocaleTimeString().slice(0, 5);
      } else note.textContent = d ? '' : 'No hay ninguna partida guardada.';
    }

    showSettings(returnTo) {
      this.settingsReturn = returnTo;
      this.updateSettingsLabels();
      document.getElementById('settings-note').textContent = 'Guardado en: ' + RPG.SaveSystem.backendName();
      this.show('settings');
    }

    updateSettingsLabels() {
      var s = this.game.settings;
      Array.prototype.forEach.call(document.querySelectorAll('[data-action="toggle"]'), function (b) {
        var key = b.getAttribute('data-setting');
        b.textContent = SETTING_LABELS[key] + ': ' + (s[key] ? 'Sí' : 'No');
      });
      document.getElementById('btn-fullscreen').textContent = document.fullscreenElement ? 'Salir de pantalla completa' : 'Pantalla completa';
    }

    /** Ventana de confirmación. Devuelve Promise<boolean>. */
    confirm(text, okLabel) {
      var self = this;
      document.getElementById('modal-text').textContent = text;
      document.getElementById('modal-ok').textContent = okLabel || 'Aceptar';
      this.modal.classList.remove('hidden');
      document.getElementById('modal-ok').focus();
      return new Promise(function (resolve) { self._confirmResolve = resolve; });
    }

    _closeModal(result) {
      this.modal.classList.add('hidden');
      var r = this._confirmResolve; this._confirmResolve = null;
      if (r) r(result);
    }

    /** Esc dentro de menús. */
    onEscape() {
      if (!this.modal.classList.contains('hidden')) { this._closeModal(false); return; }
      if (this.current === 'settings') this.onAction('back');
      else if (this.current === 'credits') this.show('main');
      else if (this.current === 'pause') this.game.resume();
    }

    async onAction(action, btn) {
      var g = this.game;
      if (action !== 'new' && action !== 'continue') RPG.Audio.play('chat');   // clic de menú
      switch (action) {
        case 'new':
          if (await RPG.SaveSystem.hasSave()) {
            var ok = await this.confirm('Ya tienes una partida guardada. Si empiezas una nueva, se sobrescribirá. ¿Continuar?', 'Sí, empezar de nuevo');
            if (!ok) return;
          }
          g.newGame(); break;
        case 'continue': g.continueGame(); break;
        case 'settings': this.showSettings(this.current === 'pause' ? 'pause' : 'main'); break;
        case 'credits': this.show('credits'); break;
        case 'back': this.show(this.current === 'settings' ? this.settingsReturn : 'main'); break;
        case 'toggle':
          var key = btn.getAttribute('data-setting');
          g.settings[key] = !g.settings[key];
          if (key === 'sound') { RPG.Audio.enabled = g.settings.sound; RPG.Audio.play('chat'); }
          RPG.SaveSystem.saveSettings(g.settings);
          this.updateSettingsLabels(); break;
        case 'fullscreen':
          try {
            if (document.fullscreenElement) document.exitFullscreen();
            else document.documentElement.requestFullscreen();
          } catch (e) { g.hud.toast('Tu navegador no permite pantalla completa'); }
          setTimeout(this.updateSettingsLabels.bind(this), 250); break;
        case 'deleteSave':
          if (await this.confirm('¿Borrar la partida guardada? No se puede deshacer.', 'Sí, borrar')) {
            await RPG.SaveSystem.remove();
            await this.refreshContinue();
            g.hud.toast('Partida borrada');
          } break;
        case 'resume': g.resume(); break;
        case 'save': g.saveGame(false); break;
        case 'quit': await g.saveGame(true); g.toMenu(); break;
        case 'modal-ok': this._closeModal(true); break;
        case 'modal-cancel': this._closeModal(false); break;
      }
    }
  }

  RPG.Menu = Menu;
})();
