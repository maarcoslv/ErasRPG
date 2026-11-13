/*
 * Game.js — Bucle principal y máquina de estados.
 * Estados: 'menu' | 'playing' | 'dialogue' | 'paused'
 * Coordina los sistemas; la lógica concreta vive en cada clase.
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var C = RPG.CONFIG;

  class Game {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this.app = document.getElementById('app');
      this.ui = document.getElementById('ui');

      this.settings = RPG.SaveSystem.loadSettings();
      this.input = new RPG.Input();
      this.camera = new RPG.Camera(C.VIEW_W, C.VIEW_H);
      this.renderer = new RPG.Renderer(this);
      this.interaction = new RPG.InteractionSystem(this);
      this.hud = new RPG.HUD(this);
      this.dialogue = new RPG.Dialogue(this);
      this.menu = new RPG.Menu(this);

      this.state = 'boot';
      this.time = 0;
      this.world = null; this.player = null;
      this.flags = {};
      this.playTime = 0;
      this.autosaveTimer = 0;
      this.fps = 0; this._fpsFrames = 0; this._fpsTime = 0;
      this.last = 0;
      this._loop = this.loop.bind(this);
    }

    async init() {
      var self = this;
      this.fit();
      window.addEventListener('resize', function () { self.fit(); });
      document.addEventListener('fullscreenchange', function () { self.fit(); });
      document.addEventListener('visibilitychange', function () { if (document.hidden) self.onHidden(); });

      await RPG.SaveSystem.init();
      this.buildWorld();
      this.state = 'menu';
      await this.menu.showMain();
      requestAnimationFrame(function (t) { self.last = t; self._loop(t); });
    }

    /** Ajusta el canvas y la interfaz al tamaño de la ventana manteniendo 16:9. */
    fit() {
      var s = Math.max(0.3, Math.min(window.innerWidth / C.VIEW_W, window.innerHeight / C.VIEW_H));
      var w = Math.floor(C.VIEW_W * s), h = Math.floor(C.VIEW_H * s);
      this.app.style.width = w + 'px';
      this.app.style.height = h + 'px';
      this.ui.style.transform = 'scale(' + (w / C.VIEW_W) + ')';
      this.renderer.resize(w, h);
    }

    /* ---------- partidas ---------- */
    buildWorld() {
      this.world = new RPG.World(RPG.buildValle());
      this.player = new RPG.Player(this.world.spawn.x, this.world.spawn.y);
      this.world.player = this.player;
      this.camera.setBounds(this.world.map.pxW, this.world.map.pxH);
      this.camera.snapTo(this.player.x, this.player.y - 12);
      this.interaction.reset();
    }

    async newGame() {
      this.buildWorld();
      this.flags = {}; this.playTime = 0; this.autosaveTimer = 0;
      this.startPlaying();
      await this.saveGame(true);
      this.hud.toast('Nueva partida');
    }

    async continueGame() {
      var d = await RPG.SaveSystem.load();
      if (!d) { this.hud.toast('No hay partida guardada'); return; }
      this.buildWorld();
      var p = this.player;
      p.x = d.player.x; p.y = d.player.y; p.hp = d.player.hp; p.maxHp = d.player.maxHp;
      p.dir = d.player.dir; p.name = d.player.name;
      if (this.world.isBlocked(p.box())) { p.x = this.world.spawn.x; p.y = this.world.spawn.y; }  // posición guardada inválida
      this.flags = d.flags; this.playTime = d.playTime; this.autosaveTimer = 0;
      this.camera.snapTo(p.x, p.y - 12);
      this.startPlaying();
      this.hud.toast('Partida cargada');
    }

    serialize() {
      var p = this.player;
      return {
        version: C.SAVE.VERSION,
        savedAt: Date.now(),
        map: this.world.id,
        player: { x: p.x, y: p.y, hp: p.hp, maxHp: p.maxHp, dir: p.dir, name: p.name },
        flags: Object.assign({}, this.flags),
        playTime: this.playTime
      };
    }

    async saveGame(silent) {
      var ok = await RPG.SaveSystem.save(this.serialize());
      if (!silent) this.hud.toast(ok ? 'Partida guardada' : 'No se pudo guardar (almacenamiento bloqueado)');
      return ok;
    }

    /* ---------- estados ---------- */
    startPlaying() {
      this.state = 'playing';
      this.menu.hideAll();
      this.canvas.focus();
    }

    pause() { if (this.state !== 'playing') return; this.state = 'paused'; this.menu.show('pause'); }
    resume() { if (this.state !== 'paused') return; this.state = 'playing'; this.menu.hideAll(); this.canvas.focus(); }

    async toMenu() {
      this.buildWorld();
      this.state = 'menu';
      await this.menu.showMain();
    }

    startDialogue(speaker, lines, onClose) {
      this.state = 'dialogue';
      this.dialogue.open(speaker, lines, onClose);
    }
    endDialogue() { if (this.state === 'dialogue') this.state = 'playing'; }

    onHidden() {
      if (this.state === 'playing' || this.state === 'dialogue') { this.saveGame(true); }
      if (this.state === 'playing') this.pause();
    }

    /* ---------- bucle ---------- */
    loop(ts) {
      var dt = Math.min(Math.max((ts - this.last) / 1000, 0), 0.05);
      this.last = ts;
      this._fpsFrames++; this._fpsTime += dt;
      if (this._fpsTime >= 0.5) { this.fps = Math.round(this._fpsFrames / this._fpsTime); this._fpsFrames = 0; this._fpsTime = 0; }
      try {
        this.update(dt);
        this.render();
      } catch (e) { this.fatal(e); return; }
      requestAnimationFrame(this._loop);
    }

    update(dt) {
      this.time += dt;
      var inp = this.input, esc = inp.wasPressed('Escape');

      switch (this.state) {
        case 'menu':
          this.camera.x = 160 + Math.sin(this.time * 0.15) * 140;
          this.camera.y = 520 + Math.cos(this.time * 0.11) * 70;
          this.camera.clamp();
          this.world.update(dt);
          if (esc) this.menu.onEscape();
          break;

        case 'playing':
          if (esc) { this.pause(); break; }
          this.player.update(dt, inp, this.world);
          this.world.update(dt);
          this.interaction.update();
          if (this.state === 'playing') this.camera.follow(this.player.x, this.player.y - 12, dt);
          this.playTime += dt;
          if (this.settings.autosave) {
            this.autosaveTimer += dt;
            if (this.autosaveTimer >= C.AUTOSAVE_SECONDS) { this.autosaveTimer = 0; this.saveGame(true); }
          }
          break;

        case 'dialogue':
          this.world.update(dt);
          this.camera.follow(this.player.x, this.player.y - 12, dt);
          this.dialogue.update(dt);
          if (esc) this.dialogue.close();
          else if (inp.wasPressed('KeyE', 'Space', 'Enter')) this.dialogue.advance();
          break;

        case 'paused':
          if (esc) this.menu.onEscape();
          break;
      }
      inp.endFrame();
    }

    render() {
      this.renderer.render();
      if (this.state === 'playing' || this.state === 'dialogue' || this.state === 'paused') this.hud.draw(this.ctx);
    }

    fatal(e) {
      console.error(e);
      var box = document.getElementById('fatal');
      box.textContent = 'Ha ocurrido un error en el juego:\n\n' + (e && e.stack ? e.stack : String(e));
      box.classList.remove('hidden');
    }
  }

  RPG.Game = Game;
})();
