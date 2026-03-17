export enum SoundType {
  CROWD = 'crowd',
  WHISTLE = 'whistle',
  GOAL_HORN = 'goal_horn',
  GOAL = 'goal',
  CARD = 'card',
  UI_CLICK = 'ui_click',
  BACKGROUND_MUSIC = 'background_music',
  KICK_OFF = 'kick_off',
  HALF_TIME = 'half_time',
  FULL_TIME = 'full_time',
}

export enum AudioChannel {
  SFX = 'sfx',
  MUSIC = 'music',
  AMBIENCE = 'ambience',
}

export interface AudioSettings {
  masterVolume: number; // 0.0 - 1.0
  musicVolume: number; // 0.0 - 1.0
  sfxVolume: number; // 0.0 - 1.0
  ambienceVolume: number; // 0.0 - 1.0
  muted: boolean;
}

export const DEFAULT_AUDIO_SETTINGS: AudioSettings = {
  masterVolume: 0.8,
  musicVolume: 0.7,
  sfxVolume: 0.9,
  ambienceVolume: 0.6,
  muted: false,
};

export interface SoundAsset {
  type: SoundType;
  channel: AudioChannel;
  url: string;
  volume: number;
  loop: boolean;
}

export interface PlaybackOptions {
  volume?: number;
  loop?: boolean;
  fadeIn?: number; // milliseconds
  fadeOut?: number; // milliseconds
}
