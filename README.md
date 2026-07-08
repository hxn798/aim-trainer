# 🎯 Aim Trainer — 网页版练枪工具

纯前端 FPS 练枪网站，支持**定位射击**和**跟枪追踪**两种训练模式。

## 快速开始

### 本地运行

```bash
cd aim-trainer
node server.js
```

然后打开 `http://127.0.0.1:8769`

### 静态部署

也可以直接用任意 HTTP 服务器托管这个目录（Nginx、GitHub Pages、Vercel 等），因为没有后端依赖。

```bash
# 使用 Python
python3 -m http.server 8080

# 使用 npx
npx serve -p 8080
```

## 项目结构

```
aim-trainer/
├── index.html          # 主页 — 模式选择 + 设置 + 结算面板
├── css/
│   └── style.css       # 暗色主题 + 午夜蓝/战术绿 三套主题
├── js/
│   ├── app.js          # 主入口 — 菜单交互、游戏生命周期、事件分发
│   ├── canvas.js       # Canvas 渲染引擎 — 靶子、准心、碰撞检测
│   ├── stats.js        # 数据统计 — 命中率/连击/精度/localStorage
│   ├── flick.js        # 定位射击 — 随机靶子、点击命中
│   └── tracking.js     # 跟枪追踪 — 正弦波运动、实时精度
├── server.js           # 生产环境静态文件服务
└── .gitignore
```

## 玩法

| 模式 | 操作 | 指标 |
|------|------|------|
| **定位射击** | 点击随机出现的靶子 | 命中率、平均反应时间、连击、总分 |
| **跟枪追踪** | 鼠标跟随正弦波运动的靶子 | 跟踪精度、总得分 |

## 技术栈

- 原生 HTML5 + CSS3 + JavaScript（零依赖）
- Canvas 2D 渲染
- localStorage 持久化

## 部署到生产

```bash
# 设置端口
PORT=8080 node server.js
```

静态资源 JS/CSS 有 30 天缓存头，HTML 不缓存。
