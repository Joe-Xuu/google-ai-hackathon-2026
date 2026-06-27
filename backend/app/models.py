from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class Player(Base):
    __tablename__ = "players"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, default="8-BIT HERO")
    avatar_url = Column(String, default="https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero")
    level = Column(Integer, default=1)
    hp = Column(Integer, default=100)
    max_hp = Column(Integer, default=100)
    mp = Column(Integer, default=50)
    max_mp = Column(Integer, default=50)
    exp = Column(Integer, default=0)
    next_level_exp = Column(Integer, default=100)
    coins = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    campaigns = relationship("Campaign", back_populates="player", cascade="all, delete")
    items = relationship("Item", back_populates="player", cascade="all, delete")

class Campaign(Base):
    __tablename__ = "campaigns"

    id = Column(String, primary_key=True, index=True)
    player_id = Column(String, ForeignKey("players.id"))
    real_life_goal = Column(Text, nullable=False)
    world_theme = Column(String, default="8-Bit Dark Fantasy")
    title = Column(String, nullable=False)
    lore_background = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    player = relationship("Player", back_populates="campaigns")
    quests = relationship("Quest", back_populates="campaign", cascade="all, delete")

class Quest(Base):
    __tablename__ = "quests"

    id = Column(String, primary_key=True, index=True)
    campaign_id = Column(String, ForeignKey("campaigns.id"))
    player_id = Column(String, ForeignKey("players.id"))
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    tier = Column(String, default="daily") # daily, weekly, boss
    week_number = Column(Integer, nullable=True)
    scheduled_date = Column(String, nullable=True)
    completed_at = Column(String, nullable=True)
    is_boss = Column(Boolean, default=False)
    is_completed = Column(Boolean, default=False)
    xp_reward = Column(Integer, default=50)
    mp_reward = Column(Integer, default=10)
    proof_prompt = Column(Text, nullable=False)
    condition = Column(String, nullable=True)

    campaign = relationship("Campaign", back_populates="quests")

class Item(Base):
    __tablename__ = "items"

    id = Column(String, primary_key=True, index=True)
    player_id = Column(String, ForeignKey("players.id"))
    quest_id = Column(String, nullable=True)
    real_world_object = Column(String, nullable=False)
    name = Column(String, nullable=False)
    lore = Column(Text, nullable=False)
    rarity = Column(String, default="common") # common, rare, epic, legendary
    image_base64 = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    player = relationship("Player", back_populates="items")
