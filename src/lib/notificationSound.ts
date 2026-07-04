let audioCtx: AudioContext | null = null;

export type ToneVariant = 'reminder' | 'success' | 'alarm';

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

interface Note {
  freq: number;
  at: number;
  dur: number;
  gain?: number;
}

function playNotes(notes: Note[]) {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;

  // A limiter keeps things loud without harsh clipping when notes overlap.
  const master = audioCtx.createGain();
  master.gain.value = 1;
  const limiter = audioCtx.createDynamicsCompressor();
  limiter.threshold.setValueAtTime(-6, now);
  limiter.ratio.setValueAtTime(12, now);
  master.connect(limiter);
  limiter.connect(audioCtx.destination);

  for (const note of notes) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    const peak = note.gain ?? 0.7;
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(note.freq, now + note.at);
    gain.gain.setValueAtTime(0.0001, now + note.at);
    gain.gain.exponentialRampToValueAtTime(peak, now + note.at + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + note.at + note.dur);
    osc.connect(gain);
    gain.connect(master);
    osc.start(now + note.at);
    osc.stop(now + note.at + note.dur + 0.05);
  }
}

export async function playReminderTone(variant: ToneVariant = 'reminder'): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    await primeNotificationSound();
    if (!audioCtx) return;

    if (variant === 'success') {
      playNotes([
        { freq: 784, at: 0, dur: 0.16, gain: 0.85 },
        { freq: 988, at: 0.16, dur: 0.26, gain: 0.9 },
      ]);
      return;
    }

    if (variant === 'alarm') {
      // Loud, repeating siren-like pattern so it's audible when away from the device.
      const notes: Note[] = [];
      for (let rep = 0; rep < 6; rep++) {
        const base = rep * 0.5;
        notes.push(
          { freq: 988, at: base, dur: 0.2, gain: 1 },
          { freq: 1319, at: base + 0.22, dur: 0.24, gain: 1 }
        );
      }
      playNotes(notes);
      return;
    }

    playNotes([
      { freq: 659, at: 0, dur: 0.14, gain: 0.85 },
      { freq: 880, at: 0.16, dur: 0.14, gain: 0.9 },
      { freq: 988, at: 0.32, dur: 0.3, gain: 0.95 },
    ]);
  } catch {
    // fallback silent
  }
}
