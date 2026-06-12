// =============================================================================
// Murder Drones 3D - Procedural Audio Manager (Web Audio API)
// =============================================================================

(function () {

  var ctx = null;
  var masterGain = null;
  var bgmNodes = null; // { gains: [], oscillators: [], noiseSource: null }
  var isInitialized = false;

  /**
   * Creates a white-noise AudioBuffer of the given duration.
   */
  function createNoiseBuffer(duration) {
    var sampleRate = ctx.sampleRate;
    var length = Math.floor(sampleRate * duration);
    var buffer = ctx.createBuffer(1, length, sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * Creates a metallic noise burst filtered around a center frequency.
   */
  function createFilteredNoise(duration, frequency, Q, gainVal, startTime) {
    var noise = ctx.createBufferSource();
    noise.buffer = createNoiseBuffer(duration);

    var filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = frequency;
    filter.Q.value = Q;

    var gain = ctx.createGain();
    gain.gain.setValueAtTime(gainVal, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(masterGain);

    noise.start(startTime);
    noise.stop(startTime + duration);
    return noise;
  }

  window.AudioManager = {

    /**
     * Initialize the AudioContext and master gain.
     */
    init: function () {
      if (isInitialized) return;
      try {
        var AudioCtx = window.AudioContext || window.webkitAudioContext;
        ctx = new AudioCtx();
        masterGain = ctx.createGain();
        masterGain.gain.value = 0.5;
        masterGain.connect(ctx.destination);
        isInitialized = true;
      } catch (e) {
        console.warn('AudioManager: Web Audio API not supported.', e);
      }
    },

    /**
     * Sci-fi laser sound: high-frequency sweep down with harmonic overtones.
     */
    playLaser: function () {
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      var now = ctx.currentTime;
      var duration = 0.15; // Faster

      // Main oscillator - sweep from 3000Hz down to 100Hz
      var osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(3000, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + duration);

      // Second oscillator for shimmer
      var osc2 = ctx.createOscillator();
      osc2.type = 'square';
      osc2.frequency.setValueAtTime(4000, now);
      osc2.frequency.exponentialRampToValueAtTime(200, now + duration * 0.8);

      // Low-pass filter for metallic quality
      var filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(6000, now);
      filter.frequency.exponentialRampToValueAtTime(500, now + duration);
      filter.Q.value = 5;

      // Envelope - punchier peak
      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.setValueAtTime(0.5, now + duration * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      var gain2 = ctx.createGain();
      gain2.gain.setValueAtTime(0.2, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc2.connect(gain2);
      gain2.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration);
      osc2.start(now);
      osc2.stop(now + duration);
    },

    /**
     * Metallic slash/claw sound: noise burst with resonant filter.
     */
    playClaw: function () {
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      var now = ctx.currentTime;
      var duration = 0.12;

      // High metallic scrape
      createFilteredNoise(duration, 8000, 10, 0.6, now);

      // Mid-range body
      createFilteredNoise(duration * 0.8, 2000, 5, 0.4, now);

      // Sharp transient oscillator
      var osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(2400, now);
      osc.frequency.exponentialRampToValueAtTime(100, now + duration * 0.5);

      var gain = ctx.createGain();
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.5);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration);
    },

    /**
     * Explosion: layered noise burst + low-frequency sub-bass rumble.
     */
    playExplosion: function () {
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      var now = ctx.currentTime;
      var duration = 1.2;

      // Low sub-bass rumble
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, now);
      osc.frequency.exponentialRampToValueAtTime(20, now + duration);

      var subGain = ctx.createGain();
      subGain.gain.setValueAtTime(0.6, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(subGain);
      subGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration);

      // Mid rumble
      var osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(120, now);
      osc2.frequency.exponentialRampToValueAtTime(30, now + duration * 0.6);

      var midGain = ctx.createGain();
      midGain.gain.setValueAtTime(0.3, now);
      midGain.gain.exponentialRampToValueAtTime(0.001, now + duration * 0.6);

      osc2.connect(midGain);
      midGain.connect(masterGain);
      osc2.start(now);
      osc2.stop(now + duration * 0.6);

      // Noise burst - initial impact
      createFilteredNoise(0.3, 800, 2, 0.7, now);

      // Noise crackle - upper frequencies
      createFilteredNoise(duration * 0.5, 3000, 3, 0.25, now + 0.05);

      // Debris scatter noise
      createFilteredNoise(duration * 0.8, 1500, 1.5, 0.15, now + 0.1);
    },

    /**
     * Impact/damage sound: short punchy thud with metallic ring.
     */
    playHit: function () {
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      var now = ctx.currentTime;

      // Thud
      var osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);

      var thudGain = ctx.createGain();
      thudGain.gain.setValueAtTime(0.8, now);
      thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

      osc.connect(thudGain);
      thudGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.2);
      
      // Impact noise
      createFilteredNoise(0.1, 4000, 2, 0.5, now);

      // Metallic ring
      var ring = ctx.createOscillator();
      ring.type = 'square';
      ring.frequency.setValueAtTime(1100, now);
      ring.frequency.exponentialRampToValueAtTime(600, now + 0.2);

      var ringFilter = ctx.createBiquadFilter();
      ringFilter.type = 'bandpass';
      ringFilter.frequency.value = 1000;
      ringFilter.Q.value = 15;

      var ringGain = ctx.createGain();
      ringGain.gain.setValueAtTime(0.15, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      ring.connect(ringFilter);
      ringFilter.connect(ringGain);
      ringGain.connect(masterGain);
      ring.start(now);
      ring.stop(now + 0.25);

      // Noise transient
      createFilteredNoise(0.06, 2000, 4, 0.4, now);
    },

    /**
     * Electric pulse (EMP): buzzing sweep with crackle.
     */
    playEMP: function () {
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      var now = ctx.currentTime;
      var duration = 0.6;

      // Electric buzz sweep
      var osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(2000, now + duration * 0.3);
      osc.frequency.linearRampToValueAtTime(100, now + duration);

      var distortion = ctx.createWaveShaper();
      var curve = new Float32Array(256);
      for (var i = 0; i < 256; i++) {
        var x = (i / 128) - 1;
        curve[i] = (Math.PI + 200) * x / (Math.PI + 200 * Math.abs(x));
      }
      distortion.curve = curve;

      var buzzGain = ctx.createGain();
      buzzGain.gain.setValueAtTime(0.2, now);
      buzzGain.gain.setValueAtTime(0.25, now + duration * 0.3);
      buzzGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(distortion);
      distortion.connect(buzzGain);
      buzzGain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration);

      // High crackle modulation
      var mod = ctx.createOscillator();
      mod.type = 'square';
      mod.frequency.setValueAtTime(60, now);
      mod.frequency.linearRampToValueAtTime(200, now + duration * 0.5);

      var modGain = ctx.createGain();
      modGain.gain.setValueAtTime(0.15, now);
      modGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      mod.connect(modGain);
      modGain.connect(masterGain);
      mod.start(now);
      mod.stop(now + duration);

      // Electric crackle noise
      createFilteredNoise(duration * 0.7, 5000, 8, 0.2, now + 0.05);
      createFilteredNoise(duration * 0.4, 8000, 10, 0.1, now + 0.1);
    },

    /**
     * Ambient background music loop: dark, tense atmosphere.
     * Uses layered drones, filtered noise, and slow LFO modulation.
     */
    playBGM: function () {
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      // Stop existing BGM first
      this.stopBGM();

      bgmNodes = { oscillators: [], gains: [], sources: [] };

      // --- Layer 1: Deep sub-drone ---
      var subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.value = 38;

      var subGain = ctx.createGain();
      subGain.gain.value = 0.12;

      // Slow LFO on sub volume
      var subLFO = ctx.createOscillator();
      subLFO.type = 'sine';
      subLFO.frequency.value = 0.08;
      var subLFOGain = ctx.createGain();
      subLFOGain.gain.value = 0.04;

      subLFO.connect(subLFOGain);
      subLFOGain.connect(subGain.gain);

      subOsc.connect(subGain);
      subGain.connect(masterGain);

      subOsc.start();
      subLFO.start();
      bgmNodes.oscillators.push(subOsc, subLFO);
      bgmNodes.gains.push(subGain, subLFOGain);

      // --- Layer 2: Dark pad (detuned saws through LP filter) ---
      var padFreqs = [55, 55.3, 82, 82.5];
      var padFilter = ctx.createBiquadFilter();
      padFilter.type = 'lowpass';
      padFilter.frequency.value = 400;
      padFilter.Q.value = 2;

      var padGain = ctx.createGain();
      padGain.gain.value = 0.06;

      // LFO on filter cutoff
      var padLFO = ctx.createOscillator();
      padLFO.type = 'triangle';
      padLFO.frequency.value = 0.05;
      var padLFOGain = ctx.createGain();
      padLFOGain.gain.value = 150;

      padLFO.connect(padLFOGain);
      padLFOGain.connect(padFilter.frequency);

      for (var i = 0; i < padFreqs.length; i++) {
        var padOsc = ctx.createOscillator();
        padOsc.type = 'sawtooth';
        padOsc.frequency.value = padFreqs[i];
        padOsc.connect(padFilter);
        padOsc.start();
        bgmNodes.oscillators.push(padOsc);
      }

      padFilter.connect(padGain);
      padGain.connect(masterGain);

      padLFO.start();
      bgmNodes.oscillators.push(padLFO);
      bgmNodes.gains.push(padGain, padLFOGain);

      // --- Layer 3: Wind-like filtered noise ---
      var windDuration = 60; // 60-second noise buffer, will loop
      var windNoise = ctx.createBufferSource();
      windNoise.buffer = createNoiseBuffer(windDuration);
      windNoise.loop = true;

      var windFilter = ctx.createBiquadFilter();
      windFilter.type = 'bandpass';
      windFilter.frequency.value = 300;
      windFilter.Q.value = 0.8;

      var windGain = ctx.createGain();
      windGain.gain.value = 0.04;

      // Slow modulation on wind filter
      var windLFO = ctx.createOscillator();
      windLFO.type = 'sine';
      windLFO.frequency.value = 0.03;
      var windLFOGain = ctx.createGain();
      windLFOGain.gain.value = 200;

      windLFO.connect(windLFOGain);
      windLFOGain.connect(windFilter.frequency);

      windNoise.connect(windFilter);
      windFilter.connect(windGain);
      windGain.connect(masterGain);

      windNoise.start();
      windLFO.start();
      bgmNodes.sources.push(windNoise);
      bgmNodes.oscillators.push(windLFO);
      bgmNodes.gains.push(windGain, windLFOGain);

      // --- Layer 4: High eerie tone ---
      var eerieOsc = ctx.createOscillator();
      eerieOsc.type = 'sine';
      eerieOsc.frequency.value = 660;

      var eerieOsc2 = ctx.createOscillator();
      eerieOsc2.type = 'sine';
      eerieOsc2.frequency.value = 663; // slight detune for beating

      var eerieGain = ctx.createGain();
      eerieGain.gain.value = 0.015;

      var eerieLFO = ctx.createOscillator();
      eerieLFO.type = 'sine';
      eerieLFO.frequency.value = 0.12;
      var eerieLFOGain = ctx.createGain();
      eerieLFOGain.gain.value = 0.01;

      eerieLFO.connect(eerieLFOGain);
      eerieLFOGain.connect(eerieGain.gain);

      eerieOsc.connect(eerieGain);
      eerieOsc2.connect(eerieGain);
      eerieGain.connect(masterGain);

      eerieOsc.start();
      eerieOsc2.start();
      eerieLFO.start();
      bgmNodes.oscillators.push(eerieOsc, eerieOsc2, eerieLFO);
      bgmNodes.gains.push(eerieGain, eerieLFOGain);

      // --- Layer 5: Low metallic pulse ---
      var pulseOsc = ctx.createOscillator();
      pulseOsc.type = 'square';
      pulseOsc.frequency.value = 0.5; // slow pulse

      var pulseOsc2 = ctx.createOscillator();
      pulseOsc2.type = 'triangle';
      pulseOsc2.frequency.value = 110;

      var pulseModGain = ctx.createGain();
      pulseModGain.gain.value = 0.03;

      pulseOsc.connect(pulseModGain.gain);
      pulseOsc2.connect(pulseModGain);
      pulseModGain.connect(masterGain);

      pulseOsc.start();
      pulseOsc2.start();
      bgmNodes.oscillators.push(pulseOsc, pulseOsc2);
      bgmNodes.gains.push(pulseModGain);
    },

    /**
     * Stop the background music.
     */
    stopBGM: function () {
      if (!bgmNodes) return;

      var i;
      for (i = 0; i < bgmNodes.oscillators.length; i++) {
        try { bgmNodes.oscillators[i].stop(); } catch (e) { /* already stopped */ }
        try { bgmNodes.oscillators[i].disconnect(); } catch (e) {}
      }
      for (i = 0; i < bgmNodes.gains.length; i++) {
        try { bgmNodes.gains[i].disconnect(); } catch (e) {}
      }
      if (bgmNodes.sources) {
        for (i = 0; i < bgmNodes.sources.length; i++) {
          try { bgmNodes.sources[i].stop(); } catch (e) {}
          try { bgmNodes.sources[i].disconnect(); } catch (e) {}
        }
      }
      bgmNodes = null;
    },

    /**
     * Set master volume (0–1).
     * @param {number} v
     */
    setVolume: function (v) {
      if (!masterGain) return;
      masterGain.gain.setValueAtTime(
        window.Utils ? window.Utils.clamp(v, 0, 1) : Math.max(0, Math.min(1, v)),
        ctx.currentTime
      );
    }
  };

})();
