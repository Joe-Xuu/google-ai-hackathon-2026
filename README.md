# Gamify Everything (现实生活目标 RPG 化 AI 架构)

> **将现实生活目标（减肥、健身、早起、学习）自动转化为 8-bit 复古 RPG 冒险与打卡收集游戏。**

本仓库为 Hackathon 全栈应用架构工程，采用前后端解耦的 Monorepo 工程规范设计。

## 🏛 系统架构架构与技术栈

* **前端 (`/frontend`)**: Next.js 14+ (App Router) + Tailwind CSS + **NES.css** (全局经典红白机 8-bit 像素美学) + Zustand 全局状态机。
* **后端 (`/backend`)**: Python FastAPI 异步框架 + **rembg** (U2Net 深度抠图) + **pyxelate** (16色 8-bit 像素量化降采样管线) + SQLite 本地轻量异步存储。
* **AI 引擎层**: Google 官方 `google-genai` Python SDK
  * **Gemini 3.0 Pro** (`gemini-3.0-pro`): 负责主线剧情编排、目标 RPG 化拆解 (强制 Structured JSON Outputs)。
  * **Gemini Flash** (`gemini-2.5-flash`): 负责极速多模态现实打卡照片验证 (Proof of Quest)。
* **DevOps 容器部署**: Google Cloud Platform (GCP) -> Cloud Run (Serverless 弹性容器部署，内化 AI 模型权重预下载优化)。

---

## 🚀 本地快速启动指南

### 1. 环境变量配置
在根目录或 `/backend` 目录下创建 `.env` 文件：
```ini
GEMINI_API_KEY="你的_GEMINI_API_KEY"
DATABASE_URL="sqlite+aiosqlite:///./gamify.db"
```

### 2. 启动异步图像渲染后端 (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 启动开发服务器 (默认运行在 http://localhost:8080)
uvicorn app.main:app --reload --port 8080
```

### 3. 启动复古像素前端 (Next.js)
```bash
cd frontend
npm install
npm run dev  # 默认访问 http://localhost:3000
```

---

## 🖼 核心后端图像管线设计 (非阻塞并发)

当用户拍照打卡后，后端执行双阶段异步流：
1. **极速多模态打卡验证**：调用 Gemini Flash 判定照片真实性（约1秒）。若未通过立即拒绝，节省计算资源。
2. **后台线程池非阻塞渲染**：通过 `asyncio.to_thread` 将图像计算脱离主事件循环。执行 `rembg 去背` -> `居中填充方框` -> `pyxelate 16色聚类降维至64x64` -> `Nearest 邻近无损放大至256x256`，最终生成硬边缘透明底像素道具并存入玩家背包。
