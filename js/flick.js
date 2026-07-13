/**
 * flick.js — 定位射击模式
 * 靶子随机出现，点击命中得分，未命中算失误
 */
const Flick = (() => {
  let target    = null; // { x, y, radius, color }
  let running   = false;
  let animFrame = 0;

  // 颜色方案
  const COLORS = [
    { fill: '#ff6a00', glow: 'rgba(255,106,0,.4)' },
    { fill: '#00b4ff', glow: 'rgba(0,180,255,.4)' },
    { fill: '#22c55e', glow: 'rgba(34,197,94,.4)' },
    { fill: '#a855f7', glow: 'rgba(168,85,247,.4)' },
    { fill: '#ef4444', glow: 'rgba(239,68,68,.4)' },
  ];

  function getRadius() {
    const size = (typeof AppSettings !== 'undefined' ? AppSettings.size : 'medium');
    switch (size) {
      case 'large':  return 40;
      case 'medium': return 28;
      case 'small':  return 18;
      default:       return 28;
    }
  }

  function spawn() {
    const { W, H } = Canvas.size;
    const r = getRadius();
    const margin = r + 10;
    const x = margin + Math.random() * (W - margin * 2);
    const y = margin + Math.random() * (H - margin * 2);
    const c = COLORS[Math.floor(Math.random() * COLORS.length)];
    target = { x, y, radius: r, ...c };
    Stats.onSpawn();
  }

  function handleClick(e) {
    if (!running) return;
    const pos = Canvas.getMousePos(e);

    if (target && Canvas.hitTest(pos.x, pos.y, target.x, target.y, target.radius)) {
      Stats.onHit();
      void AudioFX.playHit();
      spawn();
    } else {
      Stats.onMiss();
      void AudioFX.playMiss();
    }
  }

  function draw() {
    if (!running) return;
    Canvas.clear('#0d0d0d');

    if (target) {
      Canvas.drawTarget(target.x, target.y, target.radius, target.fill, target.glow);
    }

    // 绘制准心
    // 准心由 app.js 全局监听 mousemove 绘制
    animFrame = requestAnimationFrame(draw);
  }

  function start() {
    running = true;
    spawn();
    draw();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(animFrame);
  }

  function isRunning() { return running; }

  return { start, stop, isRunning, spawn, handleClick };
})();
