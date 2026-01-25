// Simple Web Audio API Synthesizer for UI Sounds
// No external assets required.

class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled: boolean = false;

  constructor() {
    // Initialize on first user interaction to comply with browser autoplay policies
    this.enabled = true;
  }

  private getContext() {
    if (!this.enabled) return null;
    if (!this.ctx) {
      const AudioContext = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; // Master volume
        this.masterGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Generic beep function
  private playTone(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(ctx.currentTime + startTime);
    osc.stop(ctx.currentTime + startTime + duration);
  }

  public playClick() {
    // High pitched short blip
    this.playTone(800, 'sine', 0.05);
  }

  public playTyping() {
    // Very short mechanical click
    const ctx = this.getContext();
    if (!ctx || !this.masterGain) return;
    
    // Slight randomization for realism
    const freq = 600 + Math.random() * 200;
    this.playTone(freq, 'square', 0.03);
  }

  public playSuccess() {
    // Major Arpeggio (C - E - G)
    this.playTone(523.25, 'sine', 0.1, 0);
    this.playTone(659.25, 'sine', 0.1, 0.1);
    this.playTone(783.99, 'sine', 0.3, 0.2);
  }

  public playError() {
    // Low buzzing saw
    this.playTone(150, 'sawtooth', 0.3);
    this.playTone(140, 'sawtooth', 0.3, 0.1);
  }

  public playCash() {
    // "Ka-ching" sound simulation
    this.playTone(1200, 'sine', 0.1, 0);
    this.playTone(1600, 'square', 0.4, 0.05);
  }
  
  public playAlert() {
      // Siren like
      this.playTone(880, 'triangle', 0.2, 0);
      this.playTone(440, 'triangle', 0.2, 0.2);
  }
}

export const audio = new AudioService();