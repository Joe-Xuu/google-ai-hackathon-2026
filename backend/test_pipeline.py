import io
import asyncio
from PIL import Image, ImageDraw
from app.services.image_pipeline import image_pipeline

def generate_sample_image_bytes() -> bytes:
    """在内存中动态生成一张带圈的测试水杯图像"""
    img = Image.new("RGBA", (200, 200), (255, 255, 255, 255))
    draw = ImageDraw.Draw(img)
    # 画一个蓝色杯身
    draw.rectangle([50, 40, 140, 160], fill=(50, 100, 220, 255), outline=(20, 40, 100, 255), width=4)
    # 画杯把手
    draw.ellipse([130, 60, 170, 120], outline=(50, 100, 220, 255), width=10)
    
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    return buf.getvalue()

async def run_test():
    print(">>> [Test Pipeline] 开始测试同步与后台非阻塞渲染管线...")
    sample_bytes = generate_sample_image_bytes()
    print(f">>> [Test Pipeline] 生成原始测试图像大小: {len(sample_bytes)} 字节")
    
    # 异步非阻塞调用
    b64_uri = await image_pipeline.execute_async(sample_bytes)
    print(">>> [Test Pipeline] 渲染成功！生成8-bit像素化 Data URI 前缀:")
    print(b64_uri[:100] + "...")
    print(f">>> [Test Pipeline] Data URI 总长度: {len(b64_uri)} 字符")
    assert b64_uri.startswith("data:image/png;base64,")
    print(">>> [Test Pipeline] 独立渲染管线测试100%通过！")

if __name__ == "__main__":
    asyncio.run(run_test())
