/*
 * Player.js — Personaje controlable. Solo lógica: el dibujo vive en render/Sprites.js.
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  class Player extends RPG.Entity {
    constructor(x, y) {
      var c = RPG.CONFIG.PLAYER;
      super(x, y, c.w, c.h);
      this.name = c.name;
      this.speed = c.speed;
      this.maxHp = c.maxHp;
      this.hp = c.maxHp;
      this.dir = 'down';        // 'up' | 'down' | 'left' | 'right'
      this.moving = false;
      this.animTime = 0;
    }

    get frame() { return Math.floor(this.animTime * 9) % 4; }

    update(dt, input, world) {
      var a = input.axis();
      this.moving = false;

      if (a.x !== 0 || a.y !== 0) {
        var len = Math.hypot(a.x, a.y);
        var vx = a.x / len * this.speed * dt;
        var vy = a.y / len * this.speed * dt;
        var moved = RPG.CollisionSystem.move(this, vx, vy, world);

        // La dirección se actualiza aunque esté pegado a un obstáculo (para poder "mirar" a un objeto)
        if (a.x !== 0 && a.y === 0) this.dir = a.x < 0 ? 'left' : 'right';
        else if (a.y !== 0 && a.x === 0) this.dir = a.y < 0 ? 'up' : 'down';
        else if (this.dir === 'up' || this.dir === 'down') this.dir = a.x < 0 ? 'left' : 'right';

        this.moving = moved;
      }

      if (this.moving) this.animTime += dt; else this.animTime = 0;
    }
  }

  RPG.Player = Player;
})();
