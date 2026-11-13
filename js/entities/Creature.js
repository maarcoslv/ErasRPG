/*
 * Creature.js — Criaturas con IA sencilla.
 * Estados: idle (parada) -> wander (pasea) ; flee (huye si el jugador se acerca).
 * La especie (velocidades, radios...) viene de data/creatures.js.
 * Hoy solo hay herbívoros; los depredadores se añadirán como otro 'diet' con su propia IA.
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  function rand(a, b) { return a + Math.random() * (b - a); }
  var FLEE_ANGLES = [0, 0.7, -0.7, 1.4, -1.4, 2.2, -2.2];

  class Creature extends RPG.Entity {
    constructor(data) {
      var sp = RPG.SPECIES[data.species];
      super(data.x, data.y, sp.w, sp.h);
      this.id = data.id;
      this.species = sp;
      this.name = sp.name;
      this.homeX = data.x;
      this.homeY = data.y;
      this.facing = Math.random() < 0.5 ? 'left' : 'right';   // las criaturas solo miran a izquierda/derecha
      this.state = 'idle';
      this.timer = rand(0.3, sp.idleMax);
      this.targetX = this.x; this.targetY = this.y;
      this.stuck = 0; this.wanderTime = 0;
      this.moving = false;
      this.animTime = Math.random() * 10;
    }

    get alert() { return this.state === 'flee'; }

    update(dt, world, player) {
      var sp = this.species;
      var dx = player.x - this.x, dy = player.y - this.y;
      var d = Math.hypot(dx, dy) || 0.001;
      this.moving = false;

      if (this.state !== 'flee' && d < sp.detectRadius) this.state = 'flee';

      if (this.state === 'flee') {
        if (d > sp.safeRadius) { this.state = 'idle'; this.timer = rand(sp.idleMin, sp.idleMax); }
        else this._flee(dt, world, -dx / d, -dy / d);
      } else if (this.state === 'idle') {
        this.timer -= dt;
        if (this.timer <= 0) this._pickTarget(world);
      } else if (this.state === 'wander') {
        this._walk(dt, world);
      }

      this.animTime += dt;
    }

    _step(dt, world, ux, uy, speed) {
      var moved = RPG.CollisionSystem.move(this, ux * speed * dt, uy * speed * dt, world);
      if (moved) {
        this.moving = true;
        if (Math.abs(ux) > 0.15) this.facing = ux < 0 ? 'left' : 'right';
      }
      return moved;
    }

    _flee(dt, world, ax, ay) {
      // Intenta alejarse; si hay un obstáculo, rodea probando ángulos distintos.
      for (var i = 0; i < FLEE_ANGLES.length; i++) {
        var a = FLEE_ANGLES[i], c = Math.cos(a), s = Math.sin(a);
        if (this._step(dt, world, ax * c - ay * s, ax * s + ay * c, this.species.runSpeed)) return;
      }
    }

    _pickTarget(world) {
      var sp = this.species;
      for (var n = 0; n < 8; n++) {
        var ang = Math.random() * Math.PI * 2, dist = rand(30, sp.wanderRadius);
        var tx = this.homeX + Math.cos(ang) * dist, ty = this.homeY + Math.sin(ang) * dist;
        var probe = { x: tx - this.w / 2, y: ty - this.h, w: this.w, h: this.h };
        if (!world.isBlocked(probe)) {
          this.targetX = tx; this.targetY = ty;
          this.state = 'wander'; this.stuck = 0; this.wanderTime = 0;
          return;
        }
      }
      this.timer = rand(0.5, 1.5);   // no encontró sitio: espera y reintenta
    }

    _walk(dt, world) {
      var dx = this.targetX - this.x, dy = this.targetY - this.y;
      var d = Math.hypot(dx, dy);
      this.wanderTime += dt;
      if (d < 4 || this.wanderTime > 10 || this.stuck > 0.6) {
        this.state = 'idle'; this.timer = rand(this.species.idleMin, this.species.idleMax);
        return;
      }
      if (this._step(dt, world, dx / d, dy / d, this.species.walkSpeed)) this.stuck = 0;
      else this.stuck += dt;
    }
  }

  RPG.Creature = Creature;
})();
