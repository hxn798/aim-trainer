/**
 * tracking.js — 跟枪追踪模式
 * 目标沿正弦波轨迹运动，鼠标需要持续保持在目标上
 * 精度 = 鼠标在目标内的帧数占比
 */
const Tracking = (() => {
  let target      = null;
  let running     = false;
  let animFrame   = 0;
  let mouseX      = -1000;
  let mouseY      = -1000;
  let time        = 0;
  let onFrame     = null; // 每帧回调，由 app.js 设置

  const RADIUS = 35;
  const SPEED  = 0.003;

  function initTarget() {
    const { W, H } = Canvas.size;
    target = {
      x: W / 2,
      y: H / 2,
      radius: RADIUS,
      color: '#00b4ff',
      glow: 'rgba(0,180,255,.4)',
    };
  }

  /** 更新目标位置 — 正弦波运动 */
  function update(dt) {
    if (!target) return;
    const { W, H } = Canvas.size;
    time += dt;

    const ampX = Math.min(W * 0.3, 200);
    const cx = W / 2;
    target.x = cx + Math.sin(time * SPEED) * ampX;

    const ampY = Math.min(H * 0.15, 80);
    const cy = H / 2;
    target.y = cy + Math.sin(time * SPEED * 0.7) * ampY;
  }

  /** 计算当前帧鼠标在目标内的比例 (0~1) */
  function calcOverlap() {
    if (!target) return 0;
    const dx = mouseX - target.x;
    const dy = mouseY - target.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist >= target.radius) return 0;
    return 1 - (dist / target.radius);
  }

  function draw() {
    if (!running) return;
    Canvas.clear('#0d0d0d');

    // 绘制运动轨迹水平参考线
    if (target) {
      const canvasWidth = Canvas.size.W;
      const ctx = Canvas.ctx;
      ctx.save();
      ctx.setLineDash([4, 8]);
      ctx.strokeStyle = 'rgba(0,180,255,.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, target.y);
      ctx.lineTo(canvasWidth, target.y);
      ctx.stroke();
      ctx.restore();
    }

    Canvas.drawTarget(target.x, target.y, target.radius, target.color, target.glow);

    // 准心
    Canvas.drawCrosshair(mouseX, mouseY);

    // 精度实时显示
    const overlap = calcOverlap();
    const pct = Math.round(overlap * 100);
    Canvas.drawText(`${pct}%`, mouseX, mouseY - 30, 14, 'rgba(255,255,255,.5)');

    Stats.trackFrame(overlap * 100);

    // 每帧回调 — HUD 实时更新
    if (onFrame) onFrame();

    animFrame = requestAnimationFrame(() => {
      const now = performance.now();
      if (!running) return;
      update(now - (Tracking._lastTime || now));
      Tracking._lastTime = now;
      draw();
    });
  }

  function onMouseMove(e) {
    const pos = Canvas.getMousePos(e);
    mouseX = pos.x;
    mouseY = pos.y;
  }

  function start() {
    running = true;
    initTarget();
    Stats.resetTracking();
    Stats.reset();
    Tracking._lastTime = performance.now();
    draw();
  }

  function stop() {
    running = false;
    cancelAnimationFrame(animFrame);
    onFrame = null;
  }

  function setFrameCallback(fn) { onFrame = fn; }

  function isRunning() { return running; }

  return { start, stop, isRunning, onMouseMove, setFrameCallback };
})();
