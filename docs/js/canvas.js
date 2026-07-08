/**
 * canvas.js — Canvas 渲染引擎
 * 负责创建/缩放 Canvas、获取鼠标坐标、绘制靶子等基础渲染
 */
const Canvas = (() => {
  const canvas = document.getElementById('canvas');
  const ctx = canvas.getContext('2d');

  let W = 0;
  let H = 0;

  /** 初始化 Canvas 尺寸 */
  function init() {
    const rect = canvas.getBoundingClientRect();
    W = canvas.width  = rect.width * devicePixelRatio;
    H = canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    W = rect.width;
    H = rect.height;
  }

  /** 鼠标在 Canvas 内的坐标 */
  function getMousePos(e) {
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  /** 绘制一个圆形靶子 */
  function drawTarget(x, y, radius, color, glowColor) {
    // 发光
    if (glowColor) {
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 18;
    }
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.shadowBlur = 0;

    // 同心圆装饰
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.55, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,.25)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, radius * 0.2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,.5)';
    ctx.fill();
  }

  /** 清空画布 */
  function clear(color) {
    ctx.clearRect(0, 0, W, H);
    if (color) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, W, H);
    }
  }

  /** 绘制准心 */
  function drawCrosshair(x, y) {
    ctx.strokeStyle = 'rgba(255,255,255,.5)';
    ctx.lineWidth = 1.5;
    const s = 10;
    ctx.beginPath();
    ctx.moveTo(x - s, y); ctx.lineTo(x + s, y);
    ctx.moveTo(x, y - s); ctx.lineTo(x, y + s);
    ctx.stroke();
  }

  /** 绘制文字 */
  function drawText(text, x, y, size, color, align) {
    ctx.font = `bold ${size}px -apple-system, "PingFang SC", sans-serif`;
    ctx.fillStyle = color || '#fff';
    ctx.textAlign = align || 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }

  /** 检测点是否在圆内 */
  function hitTest(mx, my, tx, ty, r) {
    const dx = mx - tx;
    const dy = my - ty;
    return dx * dx + dy * dy <= r * r;
  }

  return {
    canvas, ctx,
    get size() { return { W, H }; },
    init,
    getMousePos,
    drawTarget,
    clear,
    drawCrosshair,
    drawText,
    hitTest,
  };
})();
