import {
  SoundType,
  AudioChannel,
  AudioSettings,
  DEFAULT_AUDIO_SETTINGS,
  SoundAsset,
  PlaybackOptions,
} from './types';

// Generate simple synthetic sounds using Web Audio API oscillators
// In production, these would be replaced with actual audio files
class AudioManagerClass {
  private audioContext: AudioContext | null = null;
  private settings: AudioSettings = { ...DEFAULT_AUDIO_SETTINGS };
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private ambienceGain: GainNode | null = null;
  private activeSources: Map<SoundType, AudioBufferSourceNode[]> = new Map();
  private isInitialized = false;
  private backgroundMusicSource: AudioBufferSourceNode | null = null;

  // Sound asset registry (in production, would load from files)
  private soundAssets: Map<SoundType, AudioBuffer> = new Map();

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

      // Create gain nodes for each channel
      this.masterGain = this.audioContext.createGain();
      this.musicGain = this.audioContext.createGain();
      this.sfxGain = this.audioContext.createGain();
      this.ambienceGain = this.audioContext.createGain();

      // Connect the chain: channel gains -> master gain -> destination
      this.musicGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.ambienceGain.connect(this.masterGain);
      this.masterGain.connect(this.audioContext.destination);

      this.updateVolumes();
      this.isInitialized = true;

      // Generate synthetic sounds for demo
      await this.generateSyntheticSounds();
    } catch (error) {
      console.error('Failed to initialize AudioManager:', error);
    }
  }

  private generateSyntheticSounds(): Promise<void> {
    return new Promise((resolve) => {
      if (!this.audioContext) return resolve();

      // Generate crowd sounds (brown noise with filtering)
      const crowdBuffer = this.createNoiseBuffer(2.0, 'brown', 0.05);
      this.soundAssets.set(SoundType.CROWD, crowdBuffer);

      // Generate whistle (high frequency sine burst)
      const whistleBuffer = this.createToneBuffer(2000, 0.1, 'sine');
      this.soundAssets.set(SoundType.WHISTLE, whistleBuffer);

      // Generate goal horn ( triumphant melody)
      const goalHornBuffer = this.createMelodyBuffer([
        { freq: 523.25, duration: 0.15 }, // C5
        { freq: 659.25, duration: 0.15 }, // E5
        { freq: 783.99, duration: 0.2 }, // G5
        { freq: 1046.5, duration: 0.4 }, // C6
      ]);
      this.soundAssets.set(SoundType.GOAL_HORN, goalHornBuffer);

      // Generate goal celebration (confetti-like sounds)
      const goalBuffer = this.createMelodyBuffer([
        { freq: 880, duration: 0.1 },
        { freq: 1108.73, duration: 0.1 },
        { freq: 1318.51, duration: 0.15 },
        { freq: 1760, duration: 0.2 },
      ]);
      this.soundAssets.set(SoundType.GOAL, goalBuffer);

      // Generate card sound (short, sharp)
      const cardBuffer = this.createToneBuffer(800, 0.15, 'square');
      this.soundAssets.set(SoundType.CARD, cardBuffer);

      // Generate UI click (very short, high frequency)
      const uiClickBuffer = this.createToneBuffer(1000, 0.05, 'sine');
      this.soundAssets.set(SoundType.UI_CLICK, uiClickBuffer);

      // Generate kickoff whistle
      const kickoffBuffer = this.createToneBuffer(1500, 0.3, 'sine');
      this.soundAssets.set(SoundType.KICK_OFF, kickoffBuffer);

      // Generate half-time bell-like sound
      const halfTimeBuffer = this.createMelodyBuffer([
        { freq: 440, duration: 0.3 },
        { freq: 554.37, duration: 0.3 },
      ]);
      this.soundAssets.set(SoundType.HALF_TIME, halfTimeBuffer);

      // Generate full-time fanfare
      const fullTimeBuffer = this.createMelodyBuffer([
        { freq: 523.25, duration: 0.2 },
        { freq: 659.25, duration: 0.2 },
        { freq: 783.99, duration: 0.2 },
        { freq: 1046.5, duration: 0.4 },
      ]);
      this.soundAssets.set(SoundType.FULL_TIME, fullTimeBuffer);

      // Generate ambient crowd loop
      const ambienceBuffer = this.createNoiseBuffer(10.0, 'pink', 0.03);
      this.soundAssets.set(SoundType.BACKGROUND_MUSIC, ambienceBuffer);

      resolve();
    });
  }

  private createToneBuffer(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine'
  ): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);

    for (let i = 0; i < buffer.length; i++) {
      const t = i / sampleRate;
      let sample = 0;

      switch (type) {
        case 'sine':
          sample = Math.sin(2 * Math.PI * frequency * t);
          break;
        case 'square':
          sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
          break;
        case 'sawtooth':
          sample = 2 * (t * frequency - Math.floor(0.5 + t * frequency));
          break;
        case 'triangle':
          sample = Math.asin(Math.sin(2 * Math.PI * frequency * t)) * (2 / Math.PI);
          break;
      }

      // Apply envelope
      const attackTime = 0.01;
      const releaseTime = 0.02;
      let envelope = 1;
      if (t < attackTime) envelope = t / attackTime;
      else if (t > duration - releaseTime) envelope = (duration - t) / releaseTime;

      channelData[i] = sample * envelope * 0.5;
    }

    return buffer;
  }

  private createMelodyBuffer(notes: { freq: number; duration: number }[]): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');

    const totalDuration = notes.reduce((sum, note) => sum + note.duration, 0);
    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * totalDuration, sampleRate);
    const channelData = buffer.getChannelData(0);

    let offset = 0;
    for (const note of notes) {
      const noteSamples = sampleRate * note.duration;
      for (let i = 0; i < noteSamples; i++) {
        const t = i / sampleRate;
        const sample = Math.sin(2 * Math.PI * note.freq * t);

        // Envelope for each note
        const attackTime = 0.01;
        const releaseTime = 0.02;
        let envelope = 1;
        if (t < attackTime) envelope = t / attackTime;
        else if (t > note.duration - releaseTime) envelope = (note.duration - t) / releaseTime;

        channelData[offset + i] = sample * envelope * 0.5;
      }
      offset += noteSamples;
    }

    return buffer;
  }

  private createNoiseBuffer(
    duration: number,
    type: 'white' | 'pink' | 'brown',
    volume: number
  ): AudioBuffer {
    if (!this.audioContext) throw new Error('AudioContext not initialized');

    const sampleRate = this.audioContext.sampleRate;
    const buffer = this.audioContext.createBuffer(1, sampleRate * duration, sampleRate);
    const channelData = buffer.getChannelData(0);
    let b0 = 0,
      b1 = 0,
      b2 = 0,
      b3 = 0,
      b4 = 0,
      b5 = 0,
      b6 = 0;

    for (let i = 0; i < buffer.length; i++) {
      const white = Math.random() * 2 - 1;
      let pink = 0;

      switch (type) {
        case 'white':
          pink = white;
          break;
        case 'pink':
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.969 * b2 + white * 0.153852;
          b3 = 0.8665 * b3 + white * 0.3104856;
          b4 = 0.55 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.016898;
          pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) / 7;
          b6 = white * 0.115926;
          break;
        case 'brown':
          pink += (white - (pink || 0)) * 0.02;
          break;
      }

      channelData[i] = pink * volume;
    }

    return buffer;
  }

  async loadSoundAsset(type: SoundType, url: string): Promise<void> {
    if (!this.audioContext) await this.initialize();
    if (!this.audioContext) {
      console.error(`Cannot load sound asset ${type}: AudioContext not available`);
      return;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      this.soundAssets.set(type, audioBuffer);
    } catch (error) {
      console.error(`Failed to load sound asset ${type}:`, error);
    }
  }

  private getChannelGain(channel: AudioChannel): GainNode | null {
    switch (channel) {
      case AudioChannel.SFX:
        return this.sfxGain;
      case AudioChannel.MUSIC:
        return this.musicGain;
      case AudioChannel.AMBIENCE:
        return this.ambienceGain;
      default:
        return this.masterGain;
    }
  }

  play(
    type: SoundType,
    channel: AudioChannel,
    options: PlaybackOptions = {}
  ): AudioBufferSourceNode | null {
    if (!this.isInitialized || this.settings.muted) {
      return this.resumeContext();
    }

    const buffer = this.soundAssets.get(type);
    if (!buffer) {
      console.warn(`Sound asset not found: ${type}`);
      return null;
    }

    const source = this.audioContext!.createBufferSource();
    source.buffer = buffer;
    source.loop =
      options.loop ?? (channel === AudioChannel.MUSIC || channel === AudioChannel.AMBIENCE);

    const channelGain = this.getChannelGain(channel);
    if (channelGain) {
      const gainNode = this.audioContext!.createGain();
      const effectiveVolume = this.calculateEffectiveVolume(channel, options.volume);
      gainNode.gain.value = effectiveVolume;

      source.connect(gainNode);
      gainNode.connect(this.masterGain!);
    }

    source.start(0);

    // Track active sources
    if (!this.activeSources.has(type)) {
      this.activeSources.set(type, []);
    }
    this.activeSources.get(type)!.push(source);

    // Auto-remove from tracking when done
    source.onended = () => {
      const sources = this.activeSources.get(type);
      if (sources) {
        const index = sources.indexOf(source);
        if (index > -1) sources.splice(index, 1);
      }
    };

    return source;
  }

  private calculateEffectiveVolume(channel: AudioChannel, customVolume?: number): number {
    if (this.settings.muted) return 0;

    let channelVolume = 1;
    switch (channel) {
      case AudioChannel.MUSIC:
        channelVolume = this.settings.musicVolume;
        break;
      case AudioChannel.SFX:
        channelVolume = this.settings.sfxVolume;
        break;
      case AudioChannel.AMBIENCE:
        channelVolume = this.settings.ambienceVolume;
        break;
    }

    return this.settings.masterVolume * channelVolume * (customVolume ?? 1);
  }

  stop(type: SoundType): void {
    const sources = this.activeSources.get(type);
    if (sources) {
      sources.forEach((source) => {
        try {
          source.stop();
        } catch (e) {
          // Source may have already stopped
        }
      });
      this.activeSources.delete(type);
    }
  }

  stopAll(): void {
    this.activeSources.forEach((sources, type) => {
      this.stop(type);
    });
    this.activeSources.clear();
    if (this.backgroundMusicSource) {
      try {
        this.backgroundMusicSource.stop();
      } catch (e) {
        // Already stopped
      }
      this.backgroundMusicSource = null;
    }
  }

  setSettings(settings: Partial<AudioSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.updateVolumes();
  }

  getSettings(): AudioSettings {
    return { ...this.settings };
  }

  private updateVolumes(): void {
    if (this.masterGain) {
      this.masterGain.gain.value = this.settings.muted ? 0 : this.settings.masterVolume;
    }
    if (this.musicGain) {
      this.musicGain.gain.value = this.settings.muted ? 0 : this.settings.musicVolume;
    }
    if (this.sfxGain) {
      this.sfxGain.gain.value = this.settings.muted ? 0 : this.settings.sfxVolume;
    }
    if (this.ambienceGain) {
      this.ambienceGain.gain.value = this.settings.muted ? 0 : this.settings.ambienceVolume;
    }
  }

  playBackgroundMusic(): void {
    if (this.backgroundMusicSource) {
      this.backgroundMusicSource.stop();
    }
    this.backgroundMusicSource = this.play(SoundType.BACKGROUND_MUSIC, AudioChannel.AMBIENCE, {
      loop: true,
    });
  }

  stopBackgroundMusic(): void {
    if (this.backgroundMusicSource) {
      this.backgroundMusicSource.stop();
      this.backgroundMusicSource = null;
    }
  }

  // Helper: resume AudioContext if suspended (browser autoplay policy)
  private resumeContext(): AudioBufferSourceNode | null {
    if (this.audioContext?.state === 'suspended') {
      this.audioContext.resume();
    }
    return null;
  }

  async preloadAll(): Promise<void> {
    await this.initialize();
    // In production, this would load all audio files from public/audio/
  }

  dispose(): void {
    this.stopAll();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.isInitialized = false;
  }
}

// Singleton instance
export const AudioManager = new AudioManagerClass();
