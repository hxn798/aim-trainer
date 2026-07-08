/**
 * server.js — 生产环境静态文件服务
 * 用法: node server.js
 * 环境变量: PORT (默认 8769)
 */
const http = require('http');
const fs   = require('fs');
const path = require('path');

const BASE = __dirname;
const PORT = parseInt(process.env.PORT, 10) || 8769;

// MIME 类型映射
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
};

// 缓存策略：JS/CSS 30天，HTML 不缓存
const CACHE_TTL = {
  '.js':  2592000,
  '.css': 2592000,
};

function serve(req, res) {
  // 路径清理，防止目录遍历
  let urlPath = req.url.split('?')[0];
  if (urlPath.includes('..')) {
    res.writeHead(403);
    res.end();
    return;
  }

  let filePath = path.join(BASE, urlPath === '/' ? 'index.html' : urlPath);
  if (!filePath.startsWith(BASE)) {
    res.writeHead(403);
    res.end();
    return;
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'application/octet-stream';

  try {
    const data = fs.readFileSync(filePath);
    const headers = { 'Content-Type': contentType };

    // 缓存控制
    if (CACHE_TTL[ext]) {
      headers['Cache-Control'] = `public, max-age=${CACHE_TTL[ext]}`;
    } else {
      headers['Cache-Control'] = 'no-cache';
    }

    res.writeHead(200, headers);
    res.end(data);
  } catch (_e) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
  }
}

const server = http.createServer(serve);

server.listen(PORT, '127.0.0.1', () => {
  console.log(`Aim Trainer running on http://127.0.0.1:${PORT}`);
});
