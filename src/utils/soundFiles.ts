// Sound file URLs - placeholder paths
// To use real sounds, place audio files in public/sounds/ directory
export const SOUND_FILES = {
  xp_gain: '/sounds/xp-gain.mp3',
  level_up: '/sounds/level-up.mp3',
  achievement_unlock: '/sounds/achievement.mp3',
  badge_unlock: '/sounds/badge.mp3',
  challenge_complete: '/sounds/challenge.mp3',
  streak_milestone: '/sounds/streak.mp3',
  mystery_reward: '/sounds/mystery.mp3',
  trade_win: '/sounds/win.mp3',
};

// Generate placeholder beep sounds using Web Audio API
export const generatePlaceholderSound = (frequency: number, duration: number = 0.2) => {
  if (typeof window === 'undefined') return;
  
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.value = frequency;
  oscillator.type = 'sine';

  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + duration);
};
