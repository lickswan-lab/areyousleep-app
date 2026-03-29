// 白噪音引擎 — 管理多轨音频播放、音量、定时

export interface NoiseTrack {
  id: string;
  name: string;
  emoji: string;
  file: string;
}

export const NOISE_TRACKS: NoiseTrack[] = [
  { id: "rain", name: "雨声", emoji: "🌧️", file: "/sounds/rain.mp3" },
  { id: "ocean", name: "海浪", emoji: "🌊", file: "/sounds/ocean.mp3" },
  { id: "fire", name: "篝火", emoji: "🔥", file: "/sounds/fire.mp3" },
  { id: "forest", name: "森林", emoji: "🌲", file: "/sounds/forest.mp3" },
  { id: "cafe", name: "咖啡馆", emoji: "☕", file: "/sounds/cafe.mp3" },
  { id: "wind", name: "风声", emoji: "🌬️", file: "/sounds/wind.mp3" },
  { id: "cricket", name: "虫鸣", emoji: "🦗", file: "/sounds/cricket.mp3" },
  { id: "thunder", name: "雷雨", emoji: "⛈️", file: "/sounds/thunder.mp3" },
];

export const TIMER_OPTIONS = [
  { label: "15分", minutes: 15 },
  { label: "30分", minutes: 30 },
  { label: "60分", minutes: 60 },
  { label: "整晚", minutes: 480 },
];

class WhiteNoiseEngine {
  private sounds: Map<string, HTMLAudioElement> = new Map();
  private _masterVolume: number = 0.7;
  private _timer: ReturnType<typeof setTimeout> | null = null;
  private _timerMinutes: number | null = null;

  get masterVolume() { return this._masterVolume; }
  get timerMinutes() { return this._timerMinutes; }

  toggle(id: string): boolean {
    const existing = this.sounds.get(id);
    if (existing) {
      existing.pause();
      existing.currentTime = 0;
      this.sounds.delete(id);
      return false;
    }

    // Max 3 simultaneous
    if (this.sounds.size >= 3) return false;

    const track = NOISE_TRACKS.find(t => t.id === id);
    if (!track) return false;

    const audio = new Audio(track.file);
    audio.loop = true;
    audio.volume = this._masterVolume;
    audio.play().catch(() => {}); // Handle autoplay restrictions gracefully
    this.sounds.set(id, audio);
    return true;
  }

  isPlaying(id: string): boolean {
    return this.sounds.has(id);
  }

  getActiveCount(): number {
    return this.sounds.size;
  }

  setMasterVolume(vol: number): void {
    this._masterVolume = Math.max(0, Math.min(1, vol));
    this.sounds.forEach(audio => {
      audio.volume = this._masterVolume;
    });
  }

  setTimer(minutes: number | null): void {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
    this._timerMinutes = minutes;
    if (minutes) {
      this._timer = setTimeout(() => {
        this.stopAll();
        this._timerMinutes = null;
      }, minutes * 60 * 1000);
    }
  }

  stopAll(): void {
    this.sounds.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    this.sounds.clear();
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
      this._timerMinutes = null;
    }
  }

  hasActive(): boolean {
    return this.sounds.size > 0;
  }
}

// Singleton
let _engine: WhiteNoiseEngine | null = null;

export function getNoiseEngine(): WhiteNoiseEngine {
  if (!_engine) {
    _engine = new WhiteNoiseEngine();
  }
  return _engine;
}
