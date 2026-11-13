/*
 * Input.js — Teclado. Usa e.code (tecla física): WASD y flechas.
 * isDown = mantenida; wasPressed = pulsada desde el último fotograma.
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var BLOCK = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'];

  class Input {
    constructor() {
      this.down = {};
      this.pressed = {};
      var self = this;

      window.addEventListener('keydown', function (e) {
        var t = e.target && e.target.tagName;
        var inControl = t === 'BUTTON' || t === 'INPUT' || t === 'SELECT' || t === 'TEXTAREA';
        if (!inControl && BLOCK.indexOf(e.code) >= 0) e.preventDefault();   // evita que la página haga scroll
        if (!e.repeat) self.pressed[e.code] = true;
        self.down[e.code] = true;
      });
      window.addEventListener('keyup', function (e) { self.down[e.code] = false; });
      window.addEventListener('blur', function () { self.down = {}; self.pressed = {}; });
    }

    isDown() {
      for (var i = 0; i < arguments.length; i++) if (this.down[arguments[i]]) return true;
      return false;
    }

    wasPressed() {
      for (var i = 0; i < arguments.length; i++) if (this.pressed[arguments[i]]) return true;
      return false;
    }

    /** Vector de movimiento -1/0/1 en cada eje. */
    axis() {
      var x = 0, y = 0;
      if (this.isDown('KeyA', 'ArrowLeft')) x -= 1;
      if (this.isDown('KeyD', 'ArrowRight')) x += 1;
      if (this.isDown('KeyW', 'ArrowUp')) y -= 1;
      if (this.isDown('KeyS', 'ArrowDown')) y += 1;
      return { x: x, y: y };
    }

    endFrame() { this.pressed = {}; }
  }

  RPG.Input = Input;
})();
