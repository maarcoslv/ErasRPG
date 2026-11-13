/*
 * Assets.js — Carga de imágenes y fuentes locales (rutas relativas, compatible con file://).
 *
 * - load() devuelve una promesa que SIEMPRE se resuelve (con tiempo máximo): si algo falla,
 *   el juego arranca igualmente y dibuja con el respaldo procedural de Sprites.js.
 * - RPG.Assets.ok = true solo si TODAS las imágenes necesarias se cargaron.
 * - Aviso: en file:// el navegador no deja leer los píxeles de una imagen (getImageData);
 *   por eso este proyecto solo DIBUJA las imágenes y todos los anclajes están precalculados en atlas.js.
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var DIR = 'assets/images/bq/';

  var LIST = {
    tiles: 'tilesheet.png',
    player: 'clotharmor.png',
    villager: 'villager.png',
    bars: 'barsheet.png',
    border: 'border.png'
  };

  RPG.Assets = {
    img: {},
    ok: false,
    fontOk: false,

    load: function (timeoutMs) {
      var self = this, names = Object.keys(LIST), pending = names.length, failed = 0;
      return new Promise(function (resolve) {
        var done = false;
        function finish() {
          if (done) return; done = true;
          self.ok = failed === 0 && pending === 0;
          resolve(self.ok);
        }
        var timer = setTimeout(finish, timeoutMs || 8000);
        names.forEach(function (n) {
          var im = new Image();
          im.onload = function () { self.img[n] = im; if (--pending === 0) { clearTimeout(timer); loadFont(self).then(finish, finish); } };
          im.onerror = function () { failed++; if (--pending === 0) { clearTimeout(timer); finish(); } };
          im.src = DIR + LIST[n];
        });
      });
    }
  };

  /** Espera (como mucho 1,5 s) a que cargue la fuente pixelada; si no, se usa una fuente del sistema. */
  function loadFont(self) {
    return new Promise(function (resolve) {
      if (!document.fonts || !document.fonts.load) { resolve(); return; }
      var t = setTimeout(resolve, 1500);
      document.fonts.load('16px GraphicPixel').then(function (f) { self.fontOk = !!(f && f.length); clearTimeout(t); resolve(); },
        function () { clearTimeout(t); resolve(); });
    });
  }
})();
