let audioCtx: AudioContext | null = null;

export async function primeNotificationSound(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    audioCtx = audioCtx ?? new AudioContext();
    if (audioCtx.state === 'suspended') {
      await audioCtx.resume();
    }
  } catch {
    // ignore — autoplay policy
  }
}

export async function playReminderTone(variant: 'reminder' | 'success' = 'reminder'): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    await primeNotificationSound();
    if (!audioCtx) return;

    const now = audioCtx.currentTime;
    const notes =
      variant === 'success'
        ? [
            { freq: 784, at: 0, dur: 0.14 },
            { freq: 988, at: 0.16, dur: 0.22 },
          ]
        : [
            { freq: 659, at: 0, dur: 0.12 },
            { freq: 880, at: 0.14, dur: 0.12 },
            { freq: 988, at: 0.28, dur: 0.28 },
          ];

    for (const note of notes) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, now + note.at);
      gain.gain.setValueAtTime(0.0001, now + note.at);
      gain.gain.exponentialRampToValueAtTime(0.28, now + note.at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.dur);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now + note.at);
      osc.stop(now + note.at + note.dur + 0.05);
    }
  } catch {
    // fallback silent
  }
}
