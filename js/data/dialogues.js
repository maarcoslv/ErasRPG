/*
 * dialogues.js — Textos de diálogo y objetivo actual.
 * Datos separados del código. No se establece lore nuevo: solo lo mínimo del prototipo.
 */
(function () {
  'use strict';
  var RPG = window.RPG;

  var DIALOGUES = {
    elder: {
      speaker: 'Tala',
      flag: 'talkedToElder',
      pick: function (f) {
        if (!f.talkedToElder) {
          return [
            'Bienvenido, viajero. Este es el Valle de los Ancestros.',
            'Aquí puedes aprender lo básico: moverte, observar y no molestar a las criaturas.',
            'Los herbívoros huyen si te acercas demasiado. Mejor observarlos desde lejos.',
            'Explora el valle. Al sureste hay una piedra con marcas grabadas. Merece la pena verla.'
          ];
        }
        if (f.foundStone) {
          return ['Así que has visto la piedra grabada. Yo tampoco sé qué significan esas marcas.'];
        }
        return ['Sigue explorando el valle. Recuerda: la piedra grabada está al sureste, siguiendo el camino.'];
      }
    },

    stone: {
      speaker: '',
      flag: 'foundStone',
      pick: function (f) {
        if (!f.foundStone) {
          return [
            'Una piedra alta rodeada de rocas más pequeñas.',
            'Tiene marcas grabadas, pero no sabes qué significan.'
          ];
        }
        return ['Las marcas siguen ahí. Sigues sin entenderlas.'];
      }
    },

    fire: {
      speaker: '',
      pick: function () { return ['La fogata arde con calma. Es un buen lugar para descansar.']; }
    },

    hut: {
      speaker: '',
      pick: function () { return ['La puerta está cerrada. Por ahora no puedes entrar.']; }
    }
  };

  RPG.Dialogues = {
    /** Devuelve {speaker, lines, flag} para un diálogo según las banderas actuales. */
    get: function (id, flags) {
      var d = DIALOGUES[id];
      if (!d) return { speaker: '', lines: ['...'], flag: null };
      return { speaker: d.speaker, lines: d.pick(flags || {}), flag: d.flag || null };
    }
  };

  /** Texto del objetivo que se muestra en la interfaz, según el progreso. */
  RPG.getObjective = function (flags) {
    flags = flags || {};
    if (!flags.talkedToElder) return 'Habla con Tala, junto a la fogata de la aldea.';
    if (!flags.foundStone) return 'Explora el valle y encuentra la piedra grabada, al sureste.';
    return 'Introducción completada. Explora el valle con calma.';
  };
})();
