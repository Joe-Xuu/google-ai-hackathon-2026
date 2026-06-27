# 采用 Python 3.11 官方轻量级基础镜像
FROM python:3.11-slim

# 设置工作目录与环境变量
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    U2NET_HOME=/app/.u2net_cache

# 安装底层系统依赖 (OpenCV 与 ONNXRuntime 运行必需的图形链接库)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

# 拷贝依赖清单并安装 Python 库
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 【核心优化】预先下载 rembg 的 u2net.onnx 权重至镜像缓存目录，避免云服务冷启动超时
RUN python -c "from rembg import new_session; new_session('u2net')"

# 拷贝项目源代码
COPY . .

# 创建静态存放目录
RUN mkdir -p /app/static/artifacts

# 暴露端口并启动应用
EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
