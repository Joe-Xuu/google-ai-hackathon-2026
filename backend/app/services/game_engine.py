import uuid
from typing import Tuple, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Player, Item, Quest
from app.schemas import PlayerStateSchema, RewardsGrantedSchema, GeneratedRPGItemSchema

class GameEngineService:
    async def get_or_create_player(self, db: AsyncSession, player_id: str, name: str = "像素勇者") -> Player:
        result = await db.execute(select(Player).where(Player.id == player_id))
        player = result.scalar_one_or_none()
        if not player:
            player = Player(
                id=player_id,
                name=name,
                level=1,
                hp=100,
                max_hp=100,
                mp=50,
                max_mp=50,
                exp=0,
                next_level_exp=100,
                coins=20
            )
            db.add(player)
            await db.commit()
            await db.refresh(player)
        return player

    async def grant_quest_rewards(
        self,
        db: AsyncSession,
        player: Player,
        xp_gain: int,
        mp_gain: int,
        coin_gain: int = 10
    ) -> RewardsGrantedSchema:
        player.exp += xp_gain
        player.mp = min(player.max_mp, player.mp + mp_gain)
        player.coins += coin_gain

        leveled_up = False
        while player.exp >= player.next_level_exp:
            player.exp -= player.next_level_exp
            player.level += 1
            player.next_level_exp = int(player.next_level_exp * 1.5)
            player.max_hp += 20
            player.hp = player.max_hp
            player.max_mp += 10
            player.mp = player.max_mp
            leveled_up = True

        await db.commit()
        await db.refresh(player)

        return RewardsGrantedSchema(
            exp_gained=xp_gain,
            mp_gained=mp_gain,
            leveled_up=leveled_up,
            current_player_state=PlayerStateSchema(
                id=player.id,
                name=player.name,
                level=player.level,
                hp=player.hp,
                max_hp=player.max_hp,
                mp=player.mp,
                max_mp=player.max_mp,
                exp=player.exp,
                next_level_exp=player.next_level_exp,
                coins=player.coins
            )
        )

    async def create_rpg_item(
        self,
        db: AsyncSession,
        player_id: str,
        quest_id: Optional[str],
        detected_obj: str,
        name: str,
        lore: str,
        rarity: str,
        image_b64: str
    ) -> GeneratedRPGItemSchema:
        item_id = f"itm_{uuid.uuid4().hex[:8]}"
        item = Item(
            id=item_id,
            player_id=player_id,
            quest_id=quest_id,
            real_world_object=detected_obj,
            name=name,
            lore=lore,
            rarity=rarity,
            image_base64=image_b64
        )
        db.add(item)
        await db.commit()
        await db.refresh(item)

        return GeneratedRPGItemSchema(
            item_id=item_id,
            real_world_object_detected=detected_obj,
            rpg_item_name=name,
            rpg_lore=lore,
            rarity=rarity,
            pixel_image_url=image_b64,
            created_at=item.created_at.strftime("%Y-%m-%d") if item.created_at else None
        )

game_engine = GameEngineService()
