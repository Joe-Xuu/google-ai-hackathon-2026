from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Quest, Player
from app.schemas import VerifyProofResponse, VerificationResultSchema
from app.services.ai_service import ai_service
from app.services.image_pipeline import image_pipeline
from app.services.game_engine import game_engine

router = APIRouter(prefix="/proof", tags=["Proof of Quest"])

@router.post("/verify", response_model=VerifyProofResponse)
async def verify_proof(
    player_id: str = Form(...),
    quest_id: str = Form(...),
    proof_image: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    # 1. 校验任务与玩家状态
    player = await game_engine.get_or_create_player(db, player_id)
    res_quest = await db.execute(select(Quest).where(Quest.id == quest_id))
    quest = res_quest.scalar_one_or_none()
    
    quest_title = quest.title if quest else "自律习惯打卡"
    proof_prompt = quest.proof_prompt if quest else "检查图片内容是否合规"

    image_bytes = await proof_image.read()
    
    # 【阶段 A】多模态极速打卡判定 (Gemini Flash)
    flash_res = await ai_service.verify_proof_image(image_bytes, quest_title, proof_prompt)
    
    if not flash_res.is_valid:
        # 验证失败，即刻退回前端，节省图像计算资源
        return VerifyProofResponse(
            verification=VerificationResultSchema(
                is_valid=False,
                confidence=flash_res.confidence,
                reason=flash_res.reason
            ),
            story_progression={
                "dialogue": "很遗憾，守门人没有在你的照片中看到符合要求的证据。请重新拍摄打卡！",
                "narrator_tone": "warning"
            }
        )

    # 【阶段 B】验证通过！并行处理：经验数值发放 + 物品设定异化生成 + 后台线程池像素降维渲染
    if quest and not quest.is_completed:
        quest.is_completed = True
        xp_reward = quest.xp_reward
        mp_reward = quest.mp_reward
    else:
        xp_reward = 50
        mp_reward = 10

    # B.1 发放经验与金币奖励
    rewards_granted = await game_engine.grant_quest_rewards(db, player, xp_reward, mp_reward)

    # B.2 生成物品背景故事（free upload 用视觉分析，普通任务用 detected_obj）
    is_free_upload = quest_id.startswith("free_upload")
    if is_free_upload:
        # 直接把图片传给 Gemini，让它分析内容并生成 lore
        item_lore = await ai_service.analyze_free_upload_image(image_bytes)
        detected_obj = flash_res.detected_main_object or "Everyday Item"
    else:
        detected_obj = flash_res.detected_main_object or "冒险者物品"
        item_lore = await ai_service.generate_item_lore(detected_obj, quest_title)

    # B.3 【核心管线】派发至独立后台线程池非阻塞执行 rembg 抠图 + pyxelate 16色降采样
    pixel_b64 = await image_pipeline.execute_async(image_bytes)

    # B.4 存档入库
    gen_item = await game_engine.create_rpg_item(
        db=db,
        player_id=player.id,
        quest_id=quest_id,
        detected_obj=detected_obj,
        name=item_lore.rpg_item_name,
        lore=item_lore.rpg_lore,
        rarity=item_lore.rarity,
        image_b64=pixel_b64
    )

    return VerifyProofResponse(
        verification=VerificationResultSchema(
            is_valid=True,
            confidence=flash_res.confidence,
            reason=flash_res.reason
        ),
        story_progression={
            "dialogue": item_lore.story_dialogue,
            "narrator_tone": "epic"
        },
        rewards_granted=rewards_granted,
        generated_rpg_item=gen_item
    )
