/*
 * Audio.js — Efectos de sonido (HTMLAudioElement, sin Web Audio, compatible con file://).
 *
 * - Elige .ogg o .mp3 según lo que reproduzca el navegador. Archivos en assets/audio/bq/.
 * - Los sonidos se cargan en segundo plano: si faltan o fallan, el juego sigue sin sonido.
 * - Los navegadores bloquean el audio hasta que el jugador pulsa algo; el menú ya exige un clic,
 *   así que no hay que hacer nada especial.
 * - Uso: RPG.Audio.play('npc')   ·   RPG.Audio.enabled = false
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var DIR = 'assets/audio/bq/';
  var NAMES = ['achievement', 'chat', 'chest', 'death', 'heal', 'hit1', 'hit2', 'hurt', 'kill1', 'kill2',
               'loot', 'noloot', 'npc', 'npc-end', 'npctalk', 'revive', 'teleport'];
  var VOICES = 3;   // copias por sonido para que puedan solaparse

  RPG.Audio = {
    enabled: true,
    volume: 0.6,
    ext: null,
    pool: {},
    loaded: 0,

    init: function () {
      var probe = document.createElement('audio');
      if (!probe.canPlayType) return;
      this.ext = probe.canPlayType('audio/ogg; codecs="vorbis"') ? 'ogg' : (probe.canPlayType('audio/mpeg') ? 'mp3' : null);
      if (!this.ext) return;
      var self = this;
      NAMES.forEach(function (n) {
        var list = [];
        for (var i = 0; i < VOICES; i++) {
          var a = new Audio();
          a.preload = 'auto';
          a.src = DIR + n + '.' + self.ext;
          a.addEventListener('canplaythrough', function () { self.loaded++; }, { once: true });
          a.addEventListener('error', function () { /* sin sonido: no pasa nada */ }, { once: true });
          list.push(a);
        }
        self.pool[n] = list;
      });
    },

    play: function (name) {
      if (!this.enabled) return;
      var list = this.pool[name];
      if (!list) return;
      var a = null, i;
      for (i = 0; i < list.length; i++) if (list[i].paused || list[i].ended) { a = list[i]; break; }
      if (!a) a = list[0];
      try {
        a.currentTime = 0;
        a.volume = this.volume;
        var p = a.play();
        if (p && p.catch) p.catch(function () { /* bloqueado por el navegador: se ignora */ });
      } catch (e) { /* ignorar */ }
    }
  };
})();
