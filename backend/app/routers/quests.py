import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Campaign, Quest
from app.schemas import DecomposeRequest
from app.services.ai_service import ai_service
from app.services.game_engine import game_engine

router = APIRouter(prefix="/quests", tags=["Quests"])

@router.post("/decompose")
async def decompose_goal(req: DecomposeRequest, db: AsyncSession = Depends(get_db)):
    player = await game_engine.get_or_create_player(db, req.player_id)
    
    # 1. 调用 Gemini 生成任务链 JSON
    ai_res = await ai_service.decompose_goal(req.real_life_goal, req.difficulty_preference)
    
    campaign_id = f"camp_{uuid.uuid4().hex[:8]}"
    campaign = Campaign(
        id=campaign_id,
        player_id=player.id,
        real_life_goal=req.real_life_goal,
        world_theme=ai_res.world_theme,
        title=ai_res.campaign_title,
        lore_background=ai_res.lore_background
    )
    db.add(campaign)
    
    # 2. 存入日常任务 (Daily)
    res_daily = []
    for q in ai_res.daily_quests:
        qid = f"qst_day_{uuid.uuid4().hex[:8]}"
        quest_orm = Quest(
            id=qid,
            campaign_id=campaign_id,
            player_id=player.id,
            title=q.title,
            description=q.description,
            tier="daily",
            is_boss=False,
            xp_reward=q.xp_reward,
            mp_reward=q.mp_reward,
            proof_prompt=q.proof_requirement_prompt
        )
        db.add(quest_orm)
        res_daily.append({
            "id": qid,
            "title": q.title,
            "description": q.description,
            "xp_reward": q.xp_reward,
            "mp_reward": q.mp_reward,
            "proof_requirement_prompt": q.proof_requirement_prompt,
            "is_completed": False
        })
        
    # 3. 存入周阶段任务 (Weekly)
    res_weekly = []
    for q in (ai_res.weekly_quests or []):
        qid = f"qst_wk_{uuid.uuid4().hex[:8]}"
        quest_orm = Quest(
            id=qid,
            campaign_id=campaign_id,
            player_id=player.id,
            title=q.title,
            description=q.description,
            tier="weekly",
            week_number=q.week_number,
            is_boss=False,
            xp_reward=q.xp_reward,
            mp_reward=q.mp_reward,
            proof_prompt=q.proof_requirement_prompt
        )
        db.add(quest_orm)
        res_weekly.append({
            "id": qid,
            "title": q.title,
            "description": q.description,
            "week_number": q.week_number,
            "xp_reward": q.xp_reward,
            "mp_reward": q.mp_reward,
            "proof_requirement_prompt": q.proof_requirement_prompt,
            "is_completed": False
        })
        
    # 4. 存入 BOSS 战 (Boss)
    boss_id = f"qst_boss_{uuid.uuid4().hex[:8]}"
    boss_orm = Quest(
        id=boss_id,
        campaign_id=campaign_id,
        player_id=player.id,
        title=ai_res.boss_quest.title,
        description=ai_res.boss_quest.condition,
        tier="boss",
        is_boss=True,
        xp_reward=ai_res.boss_quest.xp_reward,
        mp_reward=50,
        proof_prompt="验证是否完成了终极挑战目标",
        condition=ai_res.boss_quest.condition
    )
    db.add(boss_orm)
    await db.commit()
    
    return {
        "campaign_id": campaign_id,
        "world_theme": ai_res.world_theme,
        "campaign_title": ai_res.campaign_title,
        "lore_background": ai_res.lore_background,
        "quantitative_target": ai_res.quantitative_target.model_dump(),
        "daily_quests": res_daily,
        "weekly_quests": res_weekly,
        "boss_quest": {
            "id": boss_id,
            "title": ai_res.boss_quest.title,
            "condition": ai_res.boss_quest.condition,
            "xp_reward": ai_res.boss_quest.xp_reward,
            "special_title": ai_res.boss_quest.special_title,
            "is_completed": False
        }
    }

@router.get("/active/{player_id}")
async def get_active_quests(player_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Quest).where(Quest.player_id == player_id, Quest.is_completed == False))
    quests = result.scalars().all()
    return [{
        "id": q.id,
        "title": q.title,
        "description": q.description,
        "tier": q.tier,
        "week_number": q.week_number,
        "is_boss": q.is_boss,
        "xp_reward": q.xp_reward,
        "mp_reward": q.mp_reward,
        "proof_prompt": q.proof_prompt
    } for q in quests]
