/*
 * Camera.js — Cámara en coordenadas de mundo (x, y = esquina superior izquierda de la vista).
 * Sigue a un objetivo con suavizado y se limita a los bordes del mapa.
 * Si el mapa es menor que la pantalla, lo centra.
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  class Camera {
    constructor(viewW, viewH) {
      this.w = viewW; this.h = viewH;
      this.x = 0; this.y = 0;
      this.mapW = viewW; this.mapH = viewH;
    }

    setBounds(mapW, mapH) { this.mapW = mapW; this.mapH = mapH; }

    clamp() {
      this.x = this.mapW <= this.w ? (this.mapW - this.w) / 2 : Math.max(0, Math.min(this.mapW - this.w, this.x));
      this.y = this.mapH <= this.h ? (this.mapH - this.h) / 2 : Math.max(0, Math.min(this.mapH - this.h, this.y));
    }

    snapTo(tx, ty) {
      this.x = tx - this.w / 2;
      this.y = ty - this.h / 2;
      this.clamp();
    }

    follow(tx, ty, dt) {
      var k = 1 - Math.exp(-dt * 10);
      this.x += (tx - this.w / 2 - this.x) * k;
      this.y += (ty - this.h / 2 - this.y) * k;
      this.clamp();
    }
  }

  RPG.Camera = Camera;
})();
