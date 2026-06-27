import json
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.database import get_db
from app.models import Player, Campaign, Quest, Item
from app.schemas import PlayerSyncRequestSchema, PlayerFullDataSchema, PlayerStateSchema

router = APIRouter(prefix="/players", tags=["Players Persistence"])

@router.post("/sync")
async def sync_player_data(data: PlayerSyncRequestSchema, db: AsyncSession = Depends(get_db)):
    p_data = data.player
    
    # Check if player exists
    res = await db.execute(select(Player).where(Player.id == p_data.id))
    player = res.scalar_one_or_none()
    
    if not player:
        player = Player(
            id=p_data.id,
            name=p_data.name,
            avatar_url=p_data.avatar_url or "https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero",
            level=p_data.level,
            hp=p_data.hp,
            max_hp=p_data.max_hp,
            mp=p_data.mp,
            max_mp=p_data.max_mp,
            exp=p_data.exp,
            next_level_exp=p_data.next_level_exp,
            coins=p_data.coins
        )
        db.add(player)
    else:
        player.name = p_data.name
        if p_data.avatar_url:
            player.avatar_url = p_data.avatar_url
        player.level = p_data.level
        player.hp = p_data.hp
        player.max_hp = p_data.max_hp
        player.mp = p_data.mp
        player.max_mp = p_data.max_mp
        player.exp = p_data.exp
        player.next_level_exp = p_data.next_level_exp
        player.coins = p_data.coins

    # Sync campaigns &amp; quests
    for camp_dict in data.campaigns:
        camp_id = camp_dict.get("campaign_id") or f"cmp_{uuid.uuid4().hex[:6]}"
        res_camp = await db.execute(select(Campaign).where(Campaign.id == camp_id))
        camp = res_camp.scalar_one_or_none()
        
        if not camp:
            camp = Campaign(
                id=camp_id,
                player_id=player.id,
                real_life_goal=camp_dict.get("real_life_goal", "Habit Goal"),
                world_theme=camp_dict.get("world_theme", "8-Bit Realm"),
                title=camp_dict.get("campaign_title", "Epic Crusade"),
                lore_background=camp_dict.get("lore_background", "A hero rises.")
            )
            db.add(camp)

        # Sync daily quests
        for q_dict in camp_dict.get("daily_quests", []):
            q_id = q_dict.get("id") or f"qst_{uuid.uuid4().hex[:6]}"
            res_q = await db.execute(select(Quest).where(Quest.id == q_id))
            q = res_q.scalar_one_or_none()
            if not q:
                q = Quest(
                    id=q_id,
                    campaign_id=camp_id,
                    player_id=player.id,
                    title=q_dict.get("title", "Daily Task"),
                    description=q_dict.get("description", "Complete task"),
                    tier="daily",
                    scheduled_date=q_dict.get("scheduled_date"),
                    completed_at=q_dict.get("completed_at"),
                    is_completed=q_dict.get("is_completed", False),
                    xp_reward=q_dict.get("xp_reward", 50),
                    mp_reward=q_dict.get("mp_reward", 10),
                    proof_prompt=q_dict.get("proof_requirement_prompt", "Verify photo")
                )
                db.add(q)
            else:
                q.is_completed = q_dict.get("is_completed", q.is_completed)
                q.completed_at = q_dict.get("completed_at", q.completed_at)

        # Sync weekly quests
        for q_dict in camp_dict.get("weekly_quests", []):
            q_id = q_dict.get("id") or f"qst_{uuid.uuid4().hex[:6]}"
            res_q = await db.execute(select(Quest).where(Quest.id == q_id))
            q = res_q.scalar_one_or_none()
            if not q:
                q = Quest(
                    id=q_id,
                    campaign_id=camp_id,
                    player_id=player.id,
                    title=q_dict.get("title", "Weekly Milestone"),
                    description=q_dict.get("description", "Check progress"),
                    tier="weekly",
                    week_number=q_dict.get("week_number", 1),
                    scheduled_date=q_dict.get("scheduled_date"),
                    completed_at=q_dict.get("completed_at"),
                    is_completed=q_dict.get("is_completed", False),
                    xp_reward=q_dict.get("xp_reward", 200),
                    mp_reward=q_dict.get("mp_reward", 30),
                    proof_prompt=q_dict.get("proof_requirement_prompt", "Verify scale")
                )
                db.add(q)
            else:
                q.is_completed = q_dict.get("is_completed", q.is_completed)
                q.completed_at = q_dict.get("completed_at", q.completed_at)

        # Sync boss quest
        bq_dict = camp_dict.get("boss_quest")
        if bq_dict:
            bq_id = bq_dict.get("id") or f"qst_boss_{camp_id}"
            res_q = await db.execute(select(Quest).where(Quest.id == bq_id))
            q = res_q.scalar_one_or_none()
            if not q:
                q = Quest(
                    id=bq_id,
                    campaign_id=camp_id,
                    player_id=player.id,
                    title=bq_dict.get("title", "Final Raid"),
                    description=bq_dict.get("condition", "Slay the demon"),
                    tier="boss",
                    is_boss=True,
                    scheduled_date=bq_dict.get("scheduled_date"),
                    completed_at=bq_dict.get("completed_at"),
                    is_completed=bq_dict.get("is_completed", False),
                    xp_reward=bq_dict.get("xp_reward", 800),
                    mp_reward=50,
                    proof_prompt=bq_dict.get("condition", "Verify final goal")
                )
                db.add(q)
            else:
                q.is_completed = bq_dict.get("is_completed", q.is_completed)
                q.completed_at = bq_dict.get("completed_at", q.completed_at)

    # Sync inventory items
    for itm_dict in data.inventory:
        itm_id = itm_dict.get("id") or f"itm_{uuid.uuid4().hex[:6]}"
        res_itm = await db.execute(select(Item).where(Item.id == itm_id))
        itm = res_itm.scalar_one_or_none()
        if not itm:
            itm = Item(
                id=itm_id,
                player_id=player.id,
                real_world_object=itm_dict.get("real_world_object", "Relic"),
                name=itm_dict.get("name", "Pixel Item"),
                lore=itm_dict.get("lore", "Transmuted relic."),
                rarity=itm_dict.get("rarity", "rare"),
                image_base64=itm_dict.get("image_base64", "")
            )
            db.add(itm)

    await db.commit()
    return {"status": "success", "message": "Player synchronized to database."}

@router.get("/{name_or_id}", response_model=PlayerFullDataSchema)
async def get_player_data(name_or_id: str, db: AsyncSession = Depends(get_db)):
    # Query player by id or exact name
    res = await db.execute(
        select(Player).where((Player.id == name_or_id) | (Player.name == name_or_id))
    )
    player = res.scalar_one_or_none()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found in database.")

    # Fetch campaigns
    res_camps = await db.execute(select(Campaign).where(Campaign.player_id == player.id))
    campaigns_db = res_camps.scalars().all()

    formatted_campaigns = []
    for c in campaigns_db:
        res_quests = await db.execute(select(Quest).where(Quest.campaign_id == c.id))
        quests_db = res_quests.scalars().all()
        
        daily_quests = []
        weekly_quests = []
        boss_quest = None
        
        for q in quests_db:
            q_obj = {
                "id": q.id,
                "title": q.title,
                "description": q.description,
                "xp_reward": q.xp_reward,
                "mp_reward": q.mp_reward,
                "proof_requirement_prompt": q.proof_prompt,
                "is_completed": q.is_completed,
                "scheduled_date": q.scheduled_date,
                "completed_at": q.completed_at
            }
            if q.is_boss or q.tier == "boss":
                boss_quest = {
                    "id": q.id,
                    "title": q.title,
                    "condition": q.proof_prompt or q.description,
                    "xp_reward": q.xp_reward,
                    "special_title": "Discipline Master",
                    "is_completed": q.is_completed,
                    "scheduled_date": q.scheduled_date,
                    "completed_at": q.completed_at
                }
            elif q.tier == "weekly":
                q_obj["week_number"] = q.week_number or 1
                weekly_quests.append(q_obj)
            else:
                daily_quests.append(q_obj)

        if not boss_quest:
            boss_quest = {
                "id": f"qst_boss_{c.id}",
                "title": "Final Boss Raid",
                "condition": "Achieve goal",
                "xp_reward": 800,
                "special_title": "Hero",
                "is_completed": False
            }

        formatted_campaigns.append({
            "campaign_id": c.id,
            "real_life_goal": c.real_life_goal,
            "world_theme": c.world_theme,
            "campaign_title": c.title,
            "lore_background": c.lore_background,
            "daily_quests": daily_quests,
            "weekly_quests": weekly_quests,
            "boss_quest": boss_quest,
            "created_at": c.created_at.strftime("%Y-%m-%d") if c.created_at else None
        })

    # Fetch items
    res_items = await db.execute(select(Item).where(Item.player_id == player.id))
    items_db = res_items.scalars().all()
    
    formatted_inventory = [
        {
            "id": itm.id,
            "real_world_object": itm.real_world_object,
            "name": itm.name,
            "lore": itm.lore,
            "rarity": itm.rarity,
            "image_base64": itm.image_base64,
            "created_at": itm.created_at.strftime("%Y-%m-%d") if itm.created_at else None
        }
        for itm in items_db
    ]

    return PlayerFullDataSchema(
        player=PlayerStateSchema(
            id=player.id,
            name=player.name,
            avatar_url=player.avatar_url or "https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero",
            has_completed_onboarding=True,
            level=player.level,
            hp=player.hp,
            max_hp=player.max_hp,
            mp=player.mp,
            max_mp=player.max_mp,
            exp=player.exp,
            next_level_exp=player.next_level_exp,
            coins=player.coins
        ),
        campaigns=formatted_campaigns,
        inventory=formatted_inventory
    )
