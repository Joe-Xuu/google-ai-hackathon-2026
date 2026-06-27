from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Player, Item
from app.services.game_engine import game_engine

router = APIRouter(prefix="/player", tags=["Player & Inventory"])

@router.get("/{player_id}/state")
async def get_player_state(player_id: str, db: AsyncSession = Depends(get_db)):
    player = await game_engine.get_or_create_player(db, player_id)
    return {
        "id": player.id,
        "name": player.name,
        "level": player.level,
        "hp": player.hp,
        "max_hp": player.max_hp,
        "mp": player.mp,
        "max_mp": player.max_mp,
        "exp": player.exp,
        "next_level_exp": player.next_level_exp,
        "coins": player.coins
    }

@router.get("/{player_id}/inventory")
async def get_player_inventory(player_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Item).where(Item.player_id == player_id).order_by(Item.created_at.desc()))
    items = result.scalars().all()
    return [{
        "id": it.id,
        "real_world_object": it.real_world_object,
        "name": it.name,
        "lore": it.lore,
        "rarity": it.rarity,
        "image_base64": it.image_base64,
        "created_at": it.created_at.isoformat() if it.created_at else ""
    } for it in items]
