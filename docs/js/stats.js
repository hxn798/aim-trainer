/**
 * stats.js — 数据统计 + localStorage 持久化
 */
const Stats = (() => {
  // 实时统计
  let hits     = 0;
  let misses   = 0;
  let combo    = 0;
  let maxCombo = 0;
  let reactionTimes = [];
  let targetSpawnTime = 0;

  // 跟枪专用
  let totalOverlap = 0;
  let totalFrames  = 0;

  function reset() {
    hits = 0; misses = 0; combo = 0; maxCombo = 0;
    reactionTimes = []; targetSpawnTime = 0;
    totalOverlap = 0; totalFrames = 0;
  }

  function onSpawn() { targetSpawnTime = performance.now(); }

  function onHit() {
    hits++;
    combo++;
    if (combo > maxCombo) maxCombo = combo;
    if (targetSpawnTime > 0) {
      reactionTimes.push(performance.now() - targetSpawnTime);
    }
  }

  function onMiss() {
    misses++;
    combo = 0;
  }

  function getAccuracy() {
    const total = hits + misses;
    return total === 0 ? 0 : Math.round((hits / total) * 100);
  }

  function getAvgReaction() {
    if (reactionTimes.length === 0) return 0;
    return Math.round(reactionTimes.reduce((a, b) => a + b, 0) / reactionTimes.length);
  }

  function getScore() {
    const comboBonus = maxCombo * 50;
    const reactionBonus = Math.max(0, 300 - getAvgReaction()) * 2;
    return hits * 100 + comboBonus + reactionBonus;
  }

  /** 跟枪模式计分 — 基于精度 */
  function getTrackingScore() {
    const accuracy = getTrackingAccuracy();
    // 精度越高分数越高，满分 10000
    return Math.round(accuracy / 100 * 10000);
  }

  // --- 跟枪精度 ---
  function trackFrame(overlapPct) {
    totalOverlap += overlapPct;
    totalFrames++;
  }

  function getTrackingAccuracy() {
    if (totalFrames === 0) return 0;
    return Math.round(totalOverlap / totalFrames);
  }

  function resetTracking() {
    totalOverlap = 0;
    totalFrames = 0;
  }

  // --- 持久化 ---
  function saveRecord(mode, data) {
    try {
      const key = `aim_${mode}_history`;
      const list = JSON.parse(localStorage.getItem(key) || '[]');
      list.unshift({ ...data, date: Date.now() });
      if (list.length > 20) list.pop(); // 只保留最近 20 条
      localStorage.setItem(key, JSON.stringify(list));
    } catch (_) { /* quota exceeded, ignore */ }
  }

  function getHistory(mode) {
    try {
      return JSON.parse(localStorage.getItem(`aim_${mode}_history`) || '[]');
    } catch { return []; }
  }

  return {
    reset, onSpawn, onHit, onMiss,
    get hits() { return hits; },
    get misses() { return misses; },
    get combo() { return combo; },
    get maxCombo() { return maxCombo; },
    getAccuracy, getAvgReaction, getScore,
    // tracking
    trackFrame, getTrackingAccuracy, resetTracking, getTrackingScore,
    // storage
    saveRecord, getHistory,
  };
})();
