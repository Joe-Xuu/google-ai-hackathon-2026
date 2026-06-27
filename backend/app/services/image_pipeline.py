import io
import base64
import asyncio
import logging
from PIL import Image

logger = logging.getLogger(__name__)

class ImageProcessingPipeline:
    def __init__(self, downsample_size: int = 64, display_size: int = 256, palette_colors: int = 16):
        self.downsample_size = downsample_size
        self.display_size = display_size
        self.palette_colors = palette_colors

    def process_sync(self, image_bytes: bytes) -> str:
        """纯CPU密集型同步处理管线：rembg 抠图 -> 居中填充方框 -> pyxelate 16色聚类降采样 -> Nearest 邻近硬边缘插值放大"""
        try:
            raw_img = Image.open(io.BytesIO(image_bytes)).convert("RGBA")
        except Exception as e:
            logger.error(f"Cannot open raw image bytes: {e}")
            # 生成一张默认的复古红色像素药水图文
            raw_img = Image.new("RGBA", (128, 128), (220, 50, 50, 255))

        # Step 1: rembg 去除背景
        try:
            from rembg import remove
            no_bg_img = remove(raw_img)
        except Exception as e:
            logger.warning(f"rembg remove failed ({e}), using raw image.")
            no_bg_img = raw_img

        # Step 2: 提取主体边界框 BBox 并居中填充至正方形透明画布
        bbox = no_bg_img.getbbox()
        if bbox:
            cropped = no_bg_img.crop(bbox)
        else:
            cropped = no_bg_img

        max_side = max(cropped.size)
        if max_side == 0:
            max_side = 64
            cropped = Image.new("RGBA", (64, 64), (100, 200, 100, 255))

        square_canvas = Image.new("RGBA", (max_side, max_side), (0, 0, 0, 0))
        offset = ((max_side - cropped.width) // 2, (max_side - cropped.height) // 2)
        square_canvas.paste(cropped, offset)

        # Step 3: Pyxelate 像素化与16色量化处理
        try:
            tiny_img = square_canvas.resize((self.downsample_size, self.downsample_size), Image.Resampling.BILINEAR)
            from pyxelate import Pyxel
            pyx = Pyxel(width=self.downsample_size, height=self.downsample_size, palette=self.palette_colors)
            pyx.fit(tiny_img)
            pixelated_img = pyx.transform(tiny_img)
        except Exception as e:
            logger.warning(f"pyxelate failed ({e}), using PIL native quantize fallback.")
            tiny_img = square_canvas.resize((self.downsample_size, self.downsample_size), Image.Resampling.BILINEAR)
            # PIL 自带自适应调色板量化
            if tiny_img.mode != "P":
                quantized = tiny_img.convert("RGB").quantize(colors=self.palette_colors).convert("RGBA")
            else:
                quantized = tiny_img.convert("RGBA")
            pixelated_img = quantized

        # Step 4: Nearest 邻近无损插值放大至目标展示尺寸，完美保持硬边缘像素锯齿感
        final_art = pixelated_img.resize((self.display_size, self.display_size), Image.Resampling.NEAREST)

        # Step 5: 编码为 Base64 Data URI
        out_buf = io.BytesIO()
        final_art.save(out_buf, format="PNG")
        b64_str = base64.b64encode(out_buf.getvalue()).decode("utf-8")
        return f"data:image/png;base64,{b64_str}"

    async def execute_async(self, image_bytes: bytes) -> str:
        """异步非阻塞执行接口：派发至底层线程池执行，确保不阻塞 FastAPI 的事件循环"""
        return await asyncio.to_thread(self.process_sync, image_bytes)

image_pipeline = ImageProcessingPipeline()
