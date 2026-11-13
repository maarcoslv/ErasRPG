/*
 * SaveSystem.js — Guardado local sin servidor ni cuentas.
 *
 * Estrategia:
 *  - Se guarda SIEMPRE en localStorage (síncrono, funciona casi en cualquier sitio).
 *  - Además, si IndexedDB está disponible y responde a tiempo, se guarda también ahí.
 *  - Al cargar se leen ambos y se usa el más reciente (campo savedAt).
 *  - Si IndexedDB falla (p. ej. algunos navegadores con file://), el juego sigue con localStorage.
 *  - Si ni localStorage funciona (almacenamiento bloqueado), save() devuelve false y se avisa al jugador.
 */
(function () {
  'use strict';
  var RPG = window.RPG;
  var S = RPG.CONFIG.SAVE;

  var memory = {};   // solo para que los ajustes funcionen en la sesión si localStorage está bloqueado

  function lsGet(k) {
    try { return window.localStorage.getItem(k); } catch (e) { return memory[k] == null ? null : memory[k]; }
  }
  function lsSet(k, v) {
    try { window.localStorage.setItem(k, v); return true; } catch (e) { memory[k] = v; return false; }
  }
  function lsDel(k) {
    try { window.localStorage.removeItem(k); } catch (e) { /* nada */ }
    delete memory[k];
  }

  function openDB() {
    return new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error('Sin IndexedDB')); return; }
      var req;
      try { req = window.indexedDB.open(S.DB_NAME, 1); } catch (e) { reject(e); return; }
      req.onupgradeneeded = function () { req.result.createObjectStore(S.STORE); };
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error('Error IndexedDB')); };
      req.onblocked = function () { reject(new Error('IndexedDB bloqueada')); };
    });
  }

  function withTimeout(promise, ms) {
    return new Promise(function (resolve, reject) {
      var t = setTimeout(function () { reject(new Error('timeout')); }, ms);
      promise.then(function (v) { clearTimeout(t); resolve(v); }, function (e) { clearTimeout(t); reject(e); });
    });
  }

  function validate(d) {
    if (!d || typeof d !== 'object' || !d.player || typeof d.player !== 'object') return null;
    var p = d.player;
    if (!isFinite(p.x) || !isFinite(p.y)) return null;
    var maxHp = isFinite(p.maxHp) && p.maxHp > 0 ? p.maxHp : RPG.CONFIG.PLAYER.maxHp;
    var hp = isFinite(p.hp) ? Math.max(0, Math.min(maxHp, p.hp)) : maxHp;
    var dir = ['up', 'down', 'left', 'right'].indexOf(p.dir) >= 0 ? p.dir : 'down';
    var flags = {};
    if (d.flags && typeof d.flags === 'object') for (var k in d.flags) if (d.flags[k] === true) flags[k] = true;
    return {
      version: d.version || 1,
      savedAt: isFinite(d.savedAt) ? d.savedAt : 0,
      map: typeof d.map === 'string' ? d.map : 'valle',
      player: { x: p.x, y: p.y, hp: hp, maxHp: maxHp, dir: dir, name: typeof p.name === 'string' ? p.name : RPG.CONFIG.PLAYER.name },
      flags: flags,
      playTime: isFinite(d.playTime) ? d.playTime : 0
    };
  }

  RPG.SaveSystem = {
    db: null,

    /** Intenta abrir IndexedDB (sin bloquear el arranque más de IDB_TIMEOUT_MS). */
    init: function () {
      var self = this;
      return withTimeout(openDB(), S.IDB_TIMEOUT_MS).then(function (db) { self.db = db; }, function () { self.db = null; });
    },

    backendName: function () {
      return this.db ? 'IndexedDB + LocalStorage' : 'LocalStorage';
    },

    /** Guarda la partida. Devuelve Promise<boolean> (true si se guardó en algún sitio). */
    save: function (data) {
      var self = this;
      var okLs = lsSet(S.KEY, JSON.stringify(data));
      var okDb = this.db ? new Promise(function (resolve) {
        try {
          var tx = self.db.transaction(S.STORE, 'readwrite');
          tx.objectStore(S.STORE).put(data, S.SLOT);
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = tx.onabort = function () { resolve(false); };
        } catch (e) { resolve(false); }
      }) : Promise.resolve(false);
      return okDb.then(function (db) { return okLs || db; });
    },

    /** Carga la partida más reciente (o null). */
    load: function () {
      var self = this;
      var fromLs = null;
      try { fromLs = validate(JSON.parse(lsGet(S.KEY))); } catch (e) { fromLs = null; }
      var fromDb = this.db ? new Promise(function (resolve) {
        try {
          var req = self.db.transaction(S.STORE, 'readonly').objectStore(S.STORE).get(S.SLOT);
          req.onsuccess = function () { resolve(validate(req.result)); };
          req.onerror = function () { resolve(null); };
        } catch (e) { resolve(null); }
      }) : Promise.resolve(null);
      return fromDb.then(function (d) {
        if (d && fromLs) return d.savedAt >= fromLs.savedAt ? d : fromLs;
        return d || fromLs;
      });
    },

    hasSave: function () { return this.load().then(function (d) { return !!d; }); },

    remove: function () {
      var self = this;
      lsDel(S.KEY);
      if (!this.db) return Promise.resolve(true);
      return new Promise(function (resolve) {
        try {
          var tx = self.db.transaction(S.STORE, 'readwrite');
          tx.objectStore(S.STORE).delete(S.SLOT);
          tx.oncomplete = function () { resolve(true); };
          tx.onerror = tx.onabort = function () { resolve(false); };
        } catch (e) { resolve(false); }
      });
    },

    /* ---- Ajustes (síncronos, en localStorage) ---- */
    loadSettings: function () {
      var out = {}, def = RPG.CONFIG.DEFAULT_SETTINGS, k;
      for (k in def) out[k] = def[k];
      try {
        var s = JSON.parse(lsGet(S.SETTINGS_KEY));
        if (s && typeof s === 'object') for (k in def) if (typeof s[k] === 'boolean') out[k] = s[k];
      } catch (e) { /* valores por defecto */ }
      return out;
    },
    saveSettings: function (settings) { lsSet(S.SETTINGS_KEY, JSON.stringify(settings)); }
  };
})();
