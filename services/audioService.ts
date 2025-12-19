
class AudioService {
  private ctx: AudioContext | null = null;
  private lastPurrTime: number = 0;

  private getContext() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return this.ctx;
  }

  // A cute, short "mew" or "plop" sound for clicking the cat
  playClickSound() {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    // Quick pitch sweep for a "mew" feel
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.1);
  }

  // A bright "chime" sound for purchasing upgrades
  playBuySound() {
    const ctx = this.getContext();
    
    // First note
    this.playTone(660, 0.1, 0.05);
    // Second note slightly delayed and higher for success feel
    setTimeout(() => this.playTone(880, 0.15, 0.05), 50);
  }

  // Low rumbled purr for stroking
  playPurrSound() {
    const now = Date.now();
    // Prevent overlapping purrs (limit to one every 150ms)
    if (now - this.lastPurrTime < 150) return;
    this.lastPurrTime = now;

    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth'; // Rougher sound for purr
    osc.frequency.setValueAtTime(40, ctx.currentTime); // Low frequency
    osc.frequency.linearRampToValueAtTime(30, ctx.currentTime + 0.2);

    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);

    // Filter to make it softer
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 200;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  }

  private playTone(freq: number, duration: number, volume: number) {
    const ctx = this.getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }
}

export const audioService = new AudioService();
