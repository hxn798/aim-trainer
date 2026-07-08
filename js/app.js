/**
 * app.js — 主入口
 * 管理菜单交互、游戏生命周期、HUD 更新
 */
// 设置（全局可访问，供 Flick/Tracking 等模块读取）
const AppSettings = {
  mode: null,      // 'flick' | 'tracking'
  size: 'medium',
  duration: 30,
  theme: 'dark',
};

const App = (() => {

  // DOM
  const $menu      = document.getElementById('menu');
  const $game      = document.getElementById('game');
  const $overlay   = document.getElementById('overlay');
  const $btnStart  = document.getElementById('btn-start');
  const $btnRetry  = document.getElementById('btn-retry');
  const $btnMenu   = document.getElementById('btn-menu');
  const $hudTimer  = document.getElementById('hud-timer');
  const $hudScore  = document.getElementById('hud-score');
  const $hudAcc    = document.getElementById('hud-accuracy');
  const $hudCombo  = document.getElementById('hud-combo');

  let gameTimer = null;
  let timeLeft  = 0;

  // 暴露给其他模块

  // ===== 菜单交互 =====

  // 模式选择
  var cards = document.querySelectorAll('.mode-card');
  cards.forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      AppSettings.mode = card.dataset.mode;
      $btnStart.disabled = false;
    });
  });

  // 设置变更
  document.getElementById('opt-size').addEventListener('change', e => AppSettings.size = e.target.value);
  document.getElementById('opt-duration').addEventListener('change', e => AppSettings.duration = +e.target.value);
  document.getElementById('opt-theme').addEventListener('change', e => {
    AppSettings.theme = e.target.value;
    document.body.className = e.target.value === 'dark' ? '' : `theme-${e.target.value}`;
  });

  // ===== 游戏控制 =====

  function startGame() {
    if (!AppSettings.mode) return;

    // 切换到游戏画面
    $menu.classList.remove('active');
    $game.classList.add('active');
    $overlay.classList.add('hidden');

    // 初始化 Canvas
    Canvas.init();

    // 重置统计
    Stats.reset();
    timeLeft = AppSettings.duration;
    $hudTimer.textContent = timeLeft;
    updateHUD();

    // 启动对应模式
    if (AppSettings.mode === 'flick') {
      Flick.start();
      startTimer();
    } else if (AppSettings.mode === 'tracking') {
      Tracking.start();
      Tracking.setFrameCallback(updateHUD);
      startTimer();
    }
  }

  function stopGame() {
    if (AppSettings.mode === 'flick') Flick.stop();
    if (AppSettings.mode === 'tracking') Tracking.stop();
    clearInterval(gameTimer);
    gameTimer = null;
  }

  function endGame() {
    stopGame();

    var score, accuracyText;
    if (AppSettings.mode === 'tracking') {
      score = Stats.getTrackingScore();
      accuracyText = Stats.getTrackingAccuracy() + '%';
    } else {
      score = Stats.getScore();
      accuracyText = Stats.getAccuracy() + '%';
    }

    // 填充结果面板
    document.getElementById('res-score').textContent     = score;
    document.getElementById('res-accuracy').textContent   = accuracyText;
    document.getElementById('res-accuracy-label').textContent = AppSettings.mode === 'tracking' ? '精度' : '命中率';
    document.getElementById('res-avg-click').textContent  = Stats.getAvgReaction() + 'ms';
    document.getElementById('res-max-combo').textContent  = Stats.maxCombo;

    // 保存记录
    Stats.saveRecord(AppSettings.mode, {
      score: score,
      accuracy: AppSettings.mode === 'tracking' ? Stats.getTrackingAccuracy() : Stats.getAccuracy(),
      avgReaction: Stats.getAvgReaction(),
      maxCombo: Stats.maxCombo,
    });

    // 显示遮罩
    $overlay.classList.remove('hidden');
  }

  function returnToMenu() {
    stopGame();
    $game.classList.remove('active');
    $menu.classList.add('active');
    $overlay.classList.add('hidden');
  }

  // 计时器
  function startTimer() {
    clearInterval(gameTimer);
    gameTimer = setInterval(() => {
      timeLeft--;
      $hudTimer.textContent = timeLeft;
      if (timeLeft <= 0) {
        clearInterval(gameTimer);
        gameTimer = null;
        endGame();
      }
    }, 1000);
  }

  // HUD 更新
  function updateHUD() {
    if (AppSettings.mode === 'tracking') {
      $hudScore.textContent = `得分: ${Stats.getTrackingScore()}`;
      $hudAcc.textContent   = `精度: ${Stats.getTrackingAccuracy()}%`;
    } else {
      $hudScore.textContent = `得分: ${Stats.getScore()}`;
      $hudAcc.textContent   = `命中率: ${Stats.getAccuracy()}%`;
    }
    if (Stats.combo > 1) {
      $hudCombo.textContent = `🔥 x${Stats.combo}`;
    } else {
      $hudCombo.textContent = '';
    }
  }

  // Canvas 鼠标事件分发
  Canvas.canvas.addEventListener('click', e => {
    if (AppSettings.mode === 'flick') {
      Flick.handleClick(e);
      updateHUD();
    }
  });

  Canvas.canvas.addEventListener('mousemove', e => {
    if (AppSettings.mode === 'tracking') {
      Tracking.onMouseMove(e);
    }
  });

  // 按钮事件
  $btnStart.addEventListener('click', startGame);
  $btnRetry.addEventListener('click', startGame);
  $btnMenu.addEventListener('click', returnToMenu);

  // 窗口 resize
  window.addEventListener('resize', () => {
    if ($game.classList.contains('active')) {
      Canvas.init();
    }
  });

  return {};
})();
