/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioSystem {
  private soundVolume: number = 0.7; // Range: 0 to 1
  private bgmVolume: number = 0.4;   // Range: 0 to 1
  private bgmIntervalId: any = null;
  private bgmGainNode: GainNode | null = null;
  private bgmAudioCtx: AudioContext | null = null;
  private step: number = 0;

  constructor() {
    this.loadSettings();
  }

  private loadSettings() {
    try {
      const savedSound = localStorage.getItem('sfx_sound_volume');
      if (savedSound !== null) {
        this.soundVolume = parseFloat(savedSound);
      }
      const savedBgm = localStorage.getItem('sfx_bgm_volume');
      if (savedBgm !== null) {
        this.bgmVolume = parseFloat(savedBgm);
      }
    } catch (e) {
      console.warn('LocalStorage unavailable for audio settings:', e);
    }
  }

  public getSoundVolumePercent(): number {
    return Math.round(this.soundVolume * 100);
  }

  public getBgmVolumePercent(): number {
    return Math.round(this.bgmVolume * 100);
  }

  public setSoundVolume(volPercent: number) {
    this.soundVolume = Math.max(0, Math.min(1, volPercent / 100));
    try {
      localStorage.setItem('sfx_sound_volume', this.soundVolume.toString());
    } catch (e) {}
  }

  public setBgmVolume(volPercent: number) {
    this.bgmVolume = Math.max(0, Math.min(1, volPercent / 100));
    try {
      localStorage.setItem('sfx_bgm_volume', this.bgmVolume.toString());
    } catch (e) {}

    // Adjust active BGM gain immediately
    if (this.bgmGainNode && this.bgmAudioCtx) {
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume * 0.05, this.bgmAudioCtx.currentTime);
    }

    // Auto-start / stop background loop based on volume threshold and existence
    if (this.bgmVolume > 0) {
      this.startBgmLoop();
    } else {
      this.stopBgmLoop();
    }
  }

  private createCtx(): AudioContext | null {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return null;
      return new AudioCtxClass();
    } catch (e) {
      return null;
    }
  }

  // 1. Gentle pop/tick sound on button click with linear pitch decay
  public playClick() {
    if (this.soundVolume <= 0) return;
    const ctx = this.createCtx();
    if (!ctx) return;

    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(450, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.08);

      g.gain.setValueAtTime(this.soundVolume * 0.12, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.08);
    } catch (e) {}
  }

  // 2. Play role assignment dramatic chime sequence
  public playRoleAssign() {
    if (this.soundVolume <= 0) return;
    const ctx = this.createCtx();
    if (!ctx) return;

    try {
      const g = ctx.createGain();
      g.gain.setValueAtTime(this.soundVolume * 0.08, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7);
      g.connect(ctx.destination);

      // Descending low-fi neon mystery scale
      const notes = [293.66, 220.00, 146.83]; // D4, A3, D3
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        o.type = 'triangle';
        o.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.12);
        o.connect(g);
        o.start(ctx.currentTime + idx * 0.12);
        o.stop(ctx.currentTime + 0.7);
      });
    } catch (e) {}
  }

  // 3. Cute bubble-pop chimes for messages and clue submissions
  public playBubble() {
    if (this.soundVolume <= 0) return;
    const ctx = this.createCtx();
    if (!ctx) return;

    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(320, ctx.currentTime);
      o.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.12);

      g.gain.setValueAtTime(this.soundVolume * 0.07, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      o.connect(g);
      g.connect(ctx.destination);
      o.start();
      o.stop(ctx.currentTime + 0.12);
    } catch (e) {}
  }

  // 4. Low sad buzzer sound for elimination or vote rounds
  public playElimination() {
    if (this.soundVolume <= 0) return;
    const ctx = this.createCtx();
    if (!ctx) return;

    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      
      // Dramatic drop in frequency (descending sigh)
      o.frequency.setValueAtTime(180, ctx.currentTime);
      o.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.5);

      g.gain.setValueAtTime(this.soundVolume * 0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      // Lowpass filter to avoid harshness
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, ctx.currentTime);

      o.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);

      o.start();
      o.stop(ctx.currentTime + 0.5);
    } catch (e) {}
  }

  // 5. Bright major pentatonic fanfare for victory screens
  public playVictory() {
    if (this.soundVolume <= 0) return;
    const ctx = this.createCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const g = ctx.createGain();
      g.gain.setValueAtTime(this.soundVolume * 0.08, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
      g.connect(ctx.destination);

      // Play joyful major chord arpeggio: C4, G4, C5, E5, G5
      const notes = [261.63, 392.00, 523.25, 659.25, 783.99]; // C4, G4, C5, E5, G5
      notes.forEach((freq, idx) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.setValueAtTime(freq, now + idx * 0.08);
        o.connect(g);
        o.start(now + idx * 0.08);
        o.stop(now + 1.2);
      });
    } catch (e) {}
  }

  // 6. Double coin chime for shop purchases
  public playCoinChime() {
    if (this.soundVolume <= 0) return;
    const ctx = this.createCtx();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const g = ctx.createGain();
      g.gain.setValueAtTime(this.soundVolume * 0.06, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      g.connect(ctx.destination);

      // Quick rapid chiptune double chime
      const o1 = ctx.createOscillator();
      o1.type = 'sine';
      o1.frequency.setValueAtTime(659.25, now); // E5
      o1.connect(g);
      o1.start(now);
      o1.stop(now + 0.45);

      const o2 = ctx.createOscillator();
      o2.type = 'sine';
      o2.frequency.setValueAtTime(987.77, now + 0.08); // B5
      o2.connect(g);
      o2.start(now + 0.08);
      o2.stop(now + 0.45);
    } catch (e) {}
  }

  // 7. Error warning buzzer
  public playWarning() {
    if (this.soundVolume <= 0) return;
    const ctx = this.createCtx();
    if (!ctx) return;

    try {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(140, ctx.currentTime);

      g.gain.setValueAtTime(this.soundVolume * 0.1, ctx.currentTime);
      g.gain.linearRampToValueAtTime(0.001, ctx.currentTime + 0.15);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, ctx.currentTime);

      o.connect(filter);
      filter.connect(g);
      g.connect(ctx.destination);

      o.start();
      o.stop(ctx.currentTime + 0.15);
    } catch (e) {}
  }

  // 8. Background Music (BGM) ambient loop sequencer
  // Generates offline friendly low-volume lofi retro synth bassline
  public startBgmLoop() {
    if (this.bgmVolume <= 0) return;
    if (this.bgmIntervalId) return; // Already running

    this.bgmAudioCtx = this.createCtx();
    if (!this.bgmAudioCtx) return;

    try {
      this.bgmGainNode = this.bgmAudioCtx.createGain();
      this.bgmGainNode.gain.setValueAtTime(this.bgmVolume * 0.05, this.bgmAudioCtx.currentTime);
      this.bgmGainNode.connect(this.bgmAudioCtx.destination);

      // Low-fi retro chord step sequencer: play a note every 1 second
      const chordSequence = [
        [110.00, 220.00], // Am (A2 & A3)
        [110.00, 220.00],
        [87.31, 174.61],   // F (F2 & F3)
        [87.31, 174.61],
        [130.81, 261.63],  // C (C3 & C4)
        [130.81, 261.63],
        [98.00, 196.00],   // G (G2 & G3)
        [98.00, 196.00]
      ];

      this.bgmIntervalId = setInterval(() => {
        if (!this.bgmAudioCtx || !this.bgmGainNode || this.bgmVolume <= 0) return;
        
        try {
          if (this.bgmAudioCtx.state === 'suspended') {
            this.bgmAudioCtx.resume();
          }

          const now = this.bgmAudioCtx.currentTime;
          const notes = chordSequence[this.step % chordSequence.length];
          this.step++;

          notes.forEach((freq) => {
            const o = this.bgmAudioCtx!.createOscillator();
            const noteGain = this.bgmAudioCtx!.createGain();

            // Very soft, ambient hum using trianglewave
            o.type = 'triangle';
            o.frequency.setValueAtTime(freq, now);

            // High lowpass cut-off
            const filter = this.bgmAudioCtx!.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(320, now);

            noteGain.gain.setValueAtTime(1.0, now);
            noteGain.gain.exponentialRampToValueAtTime(0.001, now + 0.95);

            o.connect(filter);
            filter.connect(noteGain);
            noteGain.connect(this.bgmGainNode!);

            o.start(now);
            o.stop(now + 0.95);
          });
        } catch (err) {
          console.warn('Error in BGM sequencer step:', err);
        }
      }, 1000);

    } catch (e) {
      console.warn('Could not launch BGM audio loop:', e);
    }
  }

  public stopBgmLoop() {
    if (this.bgmIntervalId) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    if (this.bgmAudioCtx) {
      this.bgmAudioCtx.close();
      this.bgmAudioCtx = null;
    }
    this.bgmGainNode = null;
  }
}

export const sfx = new AudioSystem();
