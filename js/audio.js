/**
 * audio.js — 合成音效（Web Audio API）
 * 无需外部音频文件，运行时生成命中/失误音效
 */
const AudioFX = (() => {
  let ctx = null;

  /** 懒初始化 AudioContext（需要用户交互触发） */
  function getContext() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    return ctx;
  }

  /** 命中音效 — 短促清脆的"叮"声 */
  function playHit() {
    const audioCtx = getContext();
    const now = audioCtx.currentTime;

    // 主音：高频正弦波
    const osc1 = audioCtx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(880, now);       // A5
    osc1.frequency.exponentialRampToValueAtTime(1200, now + 0.06);

    // 泛音：稍低一点的二次谐波
    const osc2 = audioCtx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, now);       // E6
    osc2.frequency.exponentialRampToValueAtTime(1600, now + 0.04);

    // 增益包络
    const gain1 = audioCtx.createGain();
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    const gain2 = audioCtx.createGain();
    gain2.gain.setValueAtTime(0.08, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    // 连接
    osc1.connect(gain1).connect(audioCtx.destination);
    osc2.connect(gain2).connect(audioCtx.destination);

    osc1.start(now);
    osc1.stop(now + 0.15);
    osc2.start(now);
    osc2.stop(now + 0.1);
  }

  /** 失误音效 — 低沉的"嗡"声 */
  function playMiss() {
    const audioCtx = getContext();
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.12);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  return { playHit, playMiss };
})();
