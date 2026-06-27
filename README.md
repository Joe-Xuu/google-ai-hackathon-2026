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

### 🏛 System Architecture

Gamify Everything operates on a highly decoupled, serverless cloud-native architecture built for low latency and seamless scaling:

```
+---------------------------------------------------------------------------------------------------+
|                                      FRONTEND LAYER                                               |
|   Next.js 16 Standalone Container (App Router, NES.css 8-bit UI, Zustand State Management)       |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  | RESTful JSON API / CORS
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      BACKEND LAYER                                                |
|   Python FastAPI Asynchronous Microservice hosted on Google Cloud Run                             |
|   + Dual State Persistence: Memory state synchronized with SQLite via async SQLAlchemy ORM       |
|   + REST Endpoints: /api/v1/proof/verify, /api/v1/players/sync, /api/v1/players/{name_or_id}      |
+--------+----------------------------------------+----------------------------------------+--------+
         |                                        |                                        |
         | AI Goal Decomposition                  | Multimodal Proof Verification          | Computer Vision Pipeline
         v                                        v                                        v
+--------------------------------+  +--------------------------------+  +--------------------------------+
|      Google Gemini 3.0 Pro     |  |     Google Gemini 2.5 Flash    |  |  ONNXRuntime (rembg / U2Net)   |
|  Strict JSON Campaign Builder  |  |  Instant Image Check & Object  |  |  + pyxelate 16-Color Engine    |
+--------------------------------+  +--------------------------------+  +--------------------------------+
```

1. **Decoupled Stateless Services**: The frontend communicates via strictly typed RESTful JSON APIs. Both layers run in isolated Docker containers deployed on Google Cloud Run.
2. **Persistent State Synchronization**: To ensure zero data loss in serverless environments, the frontend automatically synchronizes character progression, unlocked campaigns, and inventory items to backend storage via `POST /api/v1/players/sync`. When loading or switching accounts, `GET /api/v1/players/{name_or_id}` reconstructs the player's complete historical profile.
3. **Zero Cold-Start Vision Engine**: The backend container embeds pre-cached `u2net.onnx` neural network weights (170MB) directly into the image layer, eliminating download latency during background removal inference.

---

### 🔮 Photo to Pixel Souvenir Workflow

When a user completes a task or uses the **Free Upload / Synthesis** portal, their real-world photo undergoes a 6-step transmutation pipeline to become a permanent 8-bit pixel art souvenir:

```
[Real Photo Upload] ---> [Gemini Flash Object Detection] ---> [Gemini Humorous Lore & Date Tagging]
                                                                                |
[Inventory Gallery] <--- [Nearest-Neighbor Scaling] <--- [pyxelate Quantization] <--- [rembg Background Removal]
```

1. **Photo Capture & Upload**: User snaps a picture of their morning water mug, salad bowl, gym equipment, or study desk.
2. **Multimodal AI Verification (`Gemini 2.5 Flash`)**: Scans the photo to verify completion of the objective and identifies the single most prominent real-world subject (e.g., `"Sports Water Flask"`).
3. **Witty Lore & Date Tagging (`Gemini 3.0 Pro / Flash`)**: Generates an epic retro RPG item name, assigns a rarity tier (Common, Rare, Epic, Legendary), and writes a typewriter dialogue monologue. **Crucially, it appends a witty, humorous one-sentence observation connecting the item to real-life productivity** (e.g., *"Proven to boost productivity by 1% while looking 100% cooler!"*). The exact acquisition date (`YYYY-MM-DD`) is stamped.
4. **AI Background Removal (`rembg / U2Net`)**: A deep neural network segments the primary object and deletes background clutter, outputting a clean transparent RGBA foreground.
5. **16-Color NES Pixelation (`pyxelate`)**: Downsamples the segmented image to a 64x64 resolution using retro color quantization algorithms to cluster colors into an authentic 8-bit NES palette.
6. **Upscaling & Inventory Storage**: Applies nearest-neighbor scaling to preserve hard pixel edges and saves the artifact base64 string and acquisition metadata directly into the player's permanent reward gallery.

---

### 🧰 Complete Tech Stack & Open-Source Projects

#### 🧠 AI Models & LLMs
- **`Google Gemini 3.0 Pro`** (`gemini-pro-latest`): Powers complex chain-of-thought goal decomposition and structured campaign JSON generation.
- **`Google Gemini 2.5 Flash`** (`gemini-flash-latest`): Powers lightning-fast multimodal vision verification, prominent object detection, and humorous RPG lore writing.

#### 👁️ Computer Vision & Image Processing
- **`rembg`**: Open-source tool using pre-trained **U2Net** deep neural networks for salient object detection and background removal.
- **`pyxelate`**: Open-source Python library for downsampling images into retro 8-bit pixel art with color palette quantization.
- **`onnxruntime`**: High-performance C++ backend engine running the U2Net neural network inference locally in memory.
- **`Pillow (PIL)`**: Core Python Imaging Library used for bounding-box cropping, padding, and RGBA alpha manipulation.

#### 💻 Frontend Open-Source Ecosystem
- **`Next.js 16`**: React framework utilizing modern App Router and server/client component architectures.
- **`React 19`**: Latest UI rendering library.
- **`Tailwind CSS v4`**: Utility-first CSS styling engine.
- **`NES.css`**: Open-source 8-bit Nintendo Entertainment System (NES) retro CSS framework.
- **`Zustand`**: Lightweight state management library with automatic persistence hooks.
- **`Lucide React`**: Icon toolkit providing clean visual cues.

#### ⚙️ Backend Open-Source Ecosystem
- **`FastAPI`**: Modern, asynchronous Python web framework with OpenAPI validation.
- **`Uvicorn`**: High-performance ASGI web server implementation.
- **`SQLAlchemy 2.0`**: Modern asynchronous Python ORM for database modeling.
- **`aiosqlite`**: Asynchronous SQLite driver enabling non-blocking database transactions.
- **`Pydantic v2`**: Core data validation and schema enforcement engine.

#### ☁️ Cloud & DevOps Infrastructure
- **`Google Cloud Run`**: Fully managed serverless container runtime providing automatic horizontal scaling.
- **`Google Cloud Build`**: Serverless CI/CD pipeline executing multi-stage Docker builds.
- **`Google Cloud Artifact Registry`**: Secure repository storing optimized production container images.
- **`Docker`**: Multi-stage container virtualization ensuring consistent development and production environments.

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

### 🏛 系统深度架构

Gamify Everything 采用了高度解耦、前后端分离的云原生 Serverless 架构，专为极速响应与弹性自动扩缩容设计：

```
+---------------------------------------------------------------------------------------------------+
|                                      前端交互层 (Frontend Layer)                                    |
|   Next.js 16 独立容器 (App Router 架构, NES.css 复古红白机美学 UI, Zustand 数据持久化)               |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
                                                  | RESTful JSON API / CORS 跨域通信
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                      后端微服务层 (Backend Layer)                                   |
|   Python FastAPI 异步微服务托管于 Google Cloud Run                                                  |
|   + 双向持久化引擎：内存状态通过异步 SQLAlchemy ORM 实时无缝同步至 SQLite 数据库                       |
|   + 核心 REST 接口: /api/v1/proof/verify, /api/v1/players/sync, /api/v1/players/{name_or_id}      |
+--------+----------------------------------------+----------------------------------------+--------+
         |                                        |                                        |
         | AI 目标逻辑拆解                         | 多模态打卡真实性验证                    | 视觉合成管线
         v                                        v                                        v
+--------------------------------+  +--------------------------------+  +--------------------------------+
|      Google Gemini 3.0 Pro     |  |     Google Gemini 2.5 Flash    |  |  ONNXRuntime (rembg / U2Net)   |
|  严谨的 Structured JSON 生成引擎  |  |  毫秒级图像真实性校验与物体识别   |  |  + pyxelate 16色降维调色板       |
+--------------------------------+  +--------------------------------+  +--------------------------------+
```

1. **前后端完全解耦**：前端页面与后端算法通过严格类型的 RESTful API 交互，双方分别打包为独立的 Docker 容器部署在 Google Cloud Run。
2. **状态双向自动同步**：为解决 Serverless 环境下的无状态问题，系统内置了自动化持久化机制。当用户新建战役或打卡升级时，前端会自动触发 `POST /api/v1/players/sync` 将最新角色属性、所有任务状态和背包物品存入后端 DB。刷新网页或切换账号时，只需调用 `GET /api/v1/players/{name_or_id}` 即可完美复原完整的历史进度。
3. **零冷启动 AI 视觉引擎**：为消除深度学习模型下载带来的网络延迟，后端构建 Docker 镜像时已提前将 170MB 的 `u2net.onnx` 权重文件内置固化在容器层中，确保后台扣图算法瞬间响应。

---

### 🔮 真实照片转化为 8-Bit 像素纪念品工作流

每当用户完成日常任务或使用 **自由拍照打卡 (Free Upload / Synthesis)** 专属通道时，真实世界上传的照片将经历一条由 AI 与 CV 驱动的 6 步炼金转化管线，最终凝聚为一件永久珍藏的 8-bit 像素纪念品：

```
[用户上传真实照片] ---> [Gemini Flash 提取主体] ---> [Gemini 生成幽默吐槽故事与获得日期]
                                                                                  |
[永久收录至个人图鉴] <--- [最近邻插值无损放大] <--- [pyxelate 16色调色板降维] <--- [rembg AI 深度抠图去背]
```

1. **实景拍照上传**：用户拍摄日常打卡照片（例如桌上的保温杯、健康沙拉碗、跑鞋或学习笔记）。
2. **多模态智能识别 (`Gemini 2.5 Flash`)**：快速校验打卡合规性，并自动提取画面中最核心的物理实物名称（例如识别出 `"运动水壶"`）。
3. **幽默背景故事 & 日期收录 (`Gemini 3.0 Pro / Flash`)**：为实物赋予一个霸气的 RPG 复古道具名、评定稀有度（Common, Rare, Epic, Legendary），并生成一段打字机剧情独白。**最核心的是，AI 会紧扣现实生活，生成一句幽默风趣的一句话吐槽**（例如：*“该道具已被证明能提升 1% 的工作效率，同时让颜值增加 100%！”*），同时精准打上获取时间戳 (`YYYY-MM-DD`)。
4. **AI 深度抠图 (`rembg / U2Net`)**：利用高精度神经网络对画面主体进行精确语义分割，剔除所有背景杂物，生成带透明通道的干净 RGBA 图像。
5. **16-Color 红白机像素化 (`pyxelate`)**：采用复古色彩聚类算法，将高清抠图降采样至 64x64 分辨率，并将丰富色彩精准归并到 16 色红白机（NES）经典调色板中。
6. **无损缩放与行囊入库**：采用最近邻插值（Nearest-Neighbor）将其放大为硬边缘、无模糊的像素图，并将其 Base64 数据与获得日期永久储存在玩家的专属图鉴中！

---

### 🧰 全套技术栈与开源项目清单

#### 🧠 AI 大语言模型与多模态引擎 (LLMs)
- **`Google Gemini 3.0 Pro`** (`gemini-pro-latest`)：负责复杂逻辑思维链（CoT）推理，将宏大生活目标精准拆解为 JSON 格式的阶段里程碑与每日实操任务。
- **`Google Gemini 2.5 Flash`** (`gemini-flash-latest`)：负责毫秒级多模态视觉打卡验证、实物主体识别以及幽默风趣的 RPG 背景故事创作。

#### 👁️ 计算机视觉与图像处理库 (CV)
- **`rembg`**：开源通用去背工具，基于预训练的 **U2Net** 显著性目标检测深度神经网络，实现毫秒级高精度发丝级抠图。
- **`pyxelate`**：开源 Python 视觉算法库，专用于将高清图像降采样并聚类生成具备 8-bit 复古美学的像素图。
- **`onnxruntime`**：微软开源的高性能跨平台 C++ 推理引擎，在内存中直接全速运行 U2Net 模型。
- **`Pillow (PIL)`**：Python 核心图像处理库，用于自动边界框裁剪（Bounding-box cropping）、内边距计算与 RGBA 透明通道操作。

#### 💻 前端开源生态 (Frontend)
- **`Next.js 16`**：React 框架，采用现代化 App Router 与服务端/客户端组件混合渲染架构。
- **`React 19`**：最新的前端声明式 UI 构建库。
- **`Tailwind CSS v4`**：下一代原子化 CSS 样式引擎。
- **`NES.css`**：开源的 8-bit 任天堂红白机（NES）复古风格 CSS UI 框架。
- **`Zustand`**：轻量级且极速的前端全局状态管理库，支持内建持久化中间件。
- **`Lucide React`**：简洁美观的开源图标工具包。

#### ⚙️ 后端开源生态 (Backend)
- **`FastAPI`**：现代化、高性能的 Python 异步 Web 框架，自动生成 Swagger API 文档。
- **`Uvicorn`**：基于 uvloop 和 httptools 极速实现的 ASGI Web 服务器。
- **`SQLAlchemy 2.0`**：Python 生态中最强大的异步 ORM 数据库映射框架。
- **`aiosqlite`**：异步 SQLite 驱动程序，确保高并发请求下数据库操作非阻塞。
- **`Pydantic v2`**：基于 Rust 驱动的 Python 数据验证与序列化引擎。

#### ☁️ 云端原生运维与容器化 (Cloud & DevOps)
- **`Google Cloud Run`**：全托管的 Serverless 容器计算平台，支持毫秒级冷启动与流量自动弹性扩缩容至零。
- **`Google Cloud Build`**：GCP 云端自动化 CI/CD 流水线，负责读取 Dockerfile 构建多阶段生产镜像。
- **`Google Cloud Artifact Registry`**：企业级安全容器镜像存储库。
- **`Docker`**：多阶段镜像构建容器技术，确保本地开发与云端生产环境百分之百一致。

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
