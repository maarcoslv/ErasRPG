/*
 * config.js — Constantes globales del juego.
 * Todos los scripts cuelgan de un único espacio de nombres: window.RPG
 * (scripts clásicos, sin módulos ES, para que funcione con file://).
 */
(function () {
  'use strict';

  var RPG = (window.RPG = window.RPG || {});

  RPG.CONFIG = {
    TITLE: 'ERAS',
    SUBTITLE: 'De las bestias a las estrellas',
    VERSION: '0.2.0',

    TILE: 32,                 // tamaño de casilla en píxeles lógicos
    VIEW_W: 960,              // resolución lógica de la pantalla
    VIEW_H: 540,

    PLAYER: { name: 'Explorador', speed: 150, maxHp: 100, w: 18, h: 12 },

    AUTOSAVE_SECONDS: 30,

    SAVE: {
      VERSION: 1,
      KEY: 'eras-rpg:save:v1',
      SETTINGS_KEY: 'eras-rpg:settings:v1',
      DB_NAME: 'eras-rpg',
      STORE: 'saves',
      SLOT: 'slot1',
      IDB_TIMEOUT_MS: 1500
    },

    DEFAULT_SETTINGS: { showFps: false, showHelp: true, autosave: true, sound: true }
  };

  // Tipos de casilla del terreno
  RPG.TILES = { GRASS: 0, PATH: 1, WATER: 2, DARK_GRASS: 3, SAND: 4 };
})();
