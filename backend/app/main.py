from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database import init_db
from app.routers import quests, proof, player, players

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 启动时自动建立或同步 SQLite 表结构
    await init_db()
    yield

app = FastAPI(
    title="Gamify Everything AI Engine API",
    description="现实生活目标 RPG 化与打卡多模态异化渲染引擎 API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS 跨域配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册核心业务路由
app.include_router(quests.router, prefix="/api/v1")
app.include_router(proof.router, prefix="/api/v1")
app.include_router(player.router, prefix="/api/v1")
app.include_router(players.router, prefix="/api/v1")

# 挂载本地静态资源目录
static_dir = "/app/static" if os.path.exists("/app/static") else "./static"
os.makedirs(os.path.join(static_dir, "artifacts"), exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
async def root():
    return {
        "status": "alive",
        "service": "Gamify Everything AI Engine",
        "version": "1.0.0",
        "docs": "/docs"
    }
