<div align="center">

# 🎮 Gamify Everything

**Turn your real-life habits and goals into an 8-bit retro pixel adventure powered by Google Gemini AI.**  
**将现实生活目标（减肥、健身、早起、学习）自动转化为 8-bit 复古像素打卡与收集游戏。**

[🌐 English](#-english-version) | [🌐 简体中文](#-简体中文)

<br/>

[![Live Demo](https://img.shields.io/badge/Live_Demo-Google_Cloud_Run-4285F4?style=for-the-badge&logo=googlecloud)](https://gamify-frontend-943810940065.us-central1.run.app)
[![API Docs](https://img.shields.io/badge/API_Docs-FastAPI_Swagger-009688?style=for-the-badge&logo=fastapi)](https://gamify-backend-943810940065.us-central1.run.app/docs)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-black?style=for-the-badge&logo=next.dot.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini AI](https://img.shields.io/badge/AI_Engine-Google_Gemini_3.0_%2F_Flash-8E75B2?style=for-the-badge&logo=google)](https://aistudio.google.com/)

</div>

---

<a name="-english-version"></a>

## 🌟 English Version

### 💡 What is Gamify Everything?
**Gamify Everything** is a full-stack AI application designed to bridge the gap between vague personal aspirations and structured daily execution. Instead of traditional, boring to-do lists, it leverages **Google Gemini AI** to transform your real-life goals (e.g., *“Lose 5kg in 2 months”* or *“Learn Python daily”*) into actionable bite-sized tasks, verifying your daily progress through AI multimodal photo checks, and rewarding you with synthesized **8-bit pixel art items** crafted from your real-life check-in photos!

### ✨ Key Features
1. 🎯 **AI Goal Decomposition (`Gemini 3.0 Pro`)**: Automatically analyses vague life aspirations and breaks them down into milestones and practical daily tasks with structured JSON outputs.
2. 📸 **Multimodal Proof Verification (`Gemini 2.5 Flash`)**: Upload real-life proof photos (e.g., gym selfies, study desks). Gemini Flash analyzes image authenticity in seconds before granting rewards.
3. 🎨 **8-Bit Item Synthesis Pipeline**: A non-blocking asynchronous computer vision pipeline that transforms user check-in photos into transparent, retro 16-color 8-bit pixel art artifacts (`rembg` AI background removal + `pyxelate` downsampling + nearest-neighbor scaling) stored directly in your inventory!
4. ☁️ **Cloud Native & Serverless**: Fully dockerized frontend (`Next.js standalone`) and backend (`FastAPI + U2Net pre-cached weights`) deployed on **Google Cloud Run** for instantaneous auto-scaling and zero cold-start latency.

---

### 🏛 Architecture & Tech Stack

```
[ Frontend: Next.js 16 + NES.css ] <--- REST API ---> [ Backend: Python FastAPI ]
                                                               |
               +-----------------------------------------------+-----------------------------------------------+
               |                                               |                                               |
       [ Gemini 3.0 Pro ]                            [ Gemini 2.5 Flash ]                       [ CV Pipeline (rembg + pyxelate) ]
    (Goal & Task Breakdown)                      (Photo Check-in Verification)                 (Real Photo to 8-Bit Pixel Art Item)
```

* **Frontend**: Next.js 16 (App Router), Tailwind CSS v4, **NES.css** (Retro 8-bit styling), Zustand State Management.
* **Backend**: Python 3.11, FastAPI, SQLite + SQLAlchemy Asynchronous ORM.
* **Computer Vision**: ONNXRuntime, `rembg` (U2Net background removal), `pyxelate` (Color quantization & downsampling).
* **Cloud Infrastructure**: Google Cloud Platform (GCP), Cloud Build, Cloud Run, Artifact Registry.

---

### 🚀 Quickstart Guide

#### Prerequisites
- Node.js 20+ & npm
- Python 3.11+
- Google Gemini API Key ([Get one here](https://aistudio.google.com/app/apikey))

#### 1. Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create environment file
echo 'GEMINI_API_KEY="your_gemini_api_key_here"' > .env
echo 'DATABASE_URL="sqlite+aiosqlite:///./gamify.db"' >> .env

# Run FastAPI development server
uvicorn app.main:app --reload --port 8080
```

#### 2. Frontend Setup
```bash
cd frontend
npm install

# Run Next.js development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to start your pixel journey!

---

<br/>
<hr/>
<br/>

<a name="-简体中文"></a>

## 🌟 简体中文

### 💡 项目简介
**Gamify Everything (现实目标 RPG 化 AI 系统)** 是一款致力于将现实生活习惯与目标“游戏化”的全栈 AI 应用。告别枯燥乏味的待办事项清单（To-Do List），系统利用强大的 **Google Gemini AI** 将你的个人目标（如 *“两个月减重5公斤”* 或 *“每天学习 Python”*）智能拆解为清晰可执行的日常打卡任务。通过 AI 视觉验证你的日常拍照打卡，并将你的真实照片实时转化为独特的 **8-bit 复古红白机像素道具**放入你的专属背包！

### ✨ 核心亮点
1. 🎯 **AI 目标智能拆解 (`Gemini 3.0 Pro`)**：深入语义理解用户的宏大目标，强制以 Structured JSON 格式生成科学的阶段性里程碑与每日实操任务。
2. 📸 **多模态打卡验证 (`Gemini 2.5 Flash`)**：用户上传真实打卡照片（如健身房自拍、学习桌面、健康餐食），Gemini Flash 在1秒内极速完成图像真实性与任务匹配度校验。
3. 🎨 **8-Bit 像素道具合成管线**：后台非阻塞异步视觉管线，将通过验证的实拍照片自动进行 `rembg` AI 深度抠图去背、方框填充、`pyxelate` 16色聚类降维至 64x64，最终无损放大为硬边缘透明底像素道具，永久储存在玩家行囊中！
4. ☁️ **云原生与 Serverless 弹性部署**：前后端均实现了生产级 Docker 容器化（前端 `Next.js standalone` 构建；后端内嵌 170MB `u2net.onnx` 权重预缓存），无缝部署于 **Google Cloud Run**，享受毫秒级弹性伸缩与零冷启动延迟。

---

### 🏛 系统架构与技术栈

* **前端工程 (`/frontend`)**: Next.js 16 (App Router) + Tailwind CSS v4 + **NES.css** (红白机 8-bit 像素美学 UI) + Zustand 全局状态持久化。
* **后端服务 (`/backend`)**: Python 3.11 + FastAPI 异步框架 + SQLite 轻量级异步存储 (`aiosqlite`)。
* **AI 与 CV 引擎**: Google GenAI SDK (`gemini-3.0-pro`, `gemini-2.5-flash`) + `rembg` (U2Net) + `pyxelate`。
* **云端部署 DevOps**: Google Cloud Platform (GCP) -> Cloud Build 自动化镜像构建 -> Cloud Run 容器托管。

---

### 🚀 本地开发快速启动

#### 环境要求
- Node.js 20+ & npm
- Python 3.11+
- Google Gemini API 密钥 ([申请地址](https://aistudio.google.com/app/apikey))

#### 1. 启动后端 API 服务
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows 用户执行: venv\Scripts\activate
pip install -r requirements.txt

# 创建配置文件写入 API Key
echo 'GEMINI_API_KEY="你的_GEMINI_API_KEY"' > .env
echo 'DATABASE_URL="sqlite+aiosqlite:///./gamify.db"' >> .env

# 启动 FastAPI 本地服务 (运行在 8080 端口)
uvicorn app.main:app --reload --port 8080
```

#### 2. 启动前端页面
```bash
cd frontend
npm install

# 启动 Next.js 开发服务器
npm run dev
```
在浏览器中打开 [http://localhost:3000](http://localhost:3000) 即可体验！

---

<div align="center">
  <p>Built with ❤️ for the Google AI Hackathon 2026</p>
</div>
