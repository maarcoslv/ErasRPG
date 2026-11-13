/*
 * main.js — Punto de arranque. Solo crea el juego; no contiene lógica.
 */
(function () {
  'use strict';

  function showFatal(msg) {
    var box = document.getElementById('fatal');
    if (!box) return;
    box.textContent = msg;
    box.classList.remove('hidden');
  }

  // Cualquier fallo de carga o ejecución se muestra en pantalla en vez de dejarla en blanco
  window.addEventListener('error', function (e) {
    showFatal('Error al cargar el juego:\n\n' + (e.message || 'desconocido') + '\n' + (e.filename ? e.filename + ':' + e.lineno : '') +
      '\n\nSi abriste el ZIP sin descomprimir, descomprímelo primero y abre index.html desde la carpeta.');
  });

  window.addEventListener('DOMContentLoaded', function () {
    var RPG = window.RPG;
    if (!RPG || !RPG.Game) {
      showFatal('Faltan archivos del juego. Comprueba que has descomprimido el ZIP completo (carpetas css/ y js/ junto a index.html).');
      return;
    }
    var game = new RPG.Game(document.getElementById('game'));
    RPG.game = game;   // útil para depurar desde la consola del navegador
    game.init().catch(function (e) { game.fatal(e); });
  });
})();
