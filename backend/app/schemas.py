from typing import List, Optional, Any
from pydantic import BaseModel, Field

# --- AI Structured Output Schemas ---

class QuantitativeTargetSchema(BaseModel):
    duration_days: int = Field(description="Exact campaign duration in days extracted or calculated from user input, e.g. 30 for '1 month'")
    total_metric: str = Field(description="The numeric target metric, e.g. 'Lose 5 kg' or 'Run 50 km'")
    daily_quota: str = Field(description="Calculated daily numeric quota requirement, e.g. '500 kcal deficit / run 2 km'")
    weekly_target: str = Field(description="Calculated weekly milestone target, e.g. 'Lose 1.25 kg per week'")

class DailyQuestSchema(BaseModel):
    id: str = Field(description="Short unique daily quest ID, e.g. qst_day_1")
    title: str = Field(description="Retro RPG style daily habit quest title")
    description: str = Field(description="Specific real-world daily action required")
    xp_reward: int = Field(description="XP reward, e.g. 50 to 100")
    mp_reward: int = Field(description="MP reward, e.g. 10 to 30")
    proof_requirement_prompt: str = Field(description="Prompt instructing AI vision model how to verify the proof photo")
    is_completed: bool = False
    scheduled_date: Optional[str] = Field(default=None, description="Scheduled completion due date YYYY-MM-DD")
    completed_at: Optional[str] = Field(default=None, description="Timestamp when verified completed YYYY-MM-DD HH:MM")

class WeeklyQuestSchema(BaseModel):
    id: str = Field(description="Short unique weekly quest ID, e.g. qst_wk_1")
    title: str = Field(description="Retro RPG style weekly milestone quest title")
    description: str = Field(description="Specific weekly numeric check-in requirement")
    week_number: int = Field(description="Week number, e.g. 1, 2, 3, or 4")
    xp_reward: int = Field(description="XP reward, e.g. 200 to 350")
    mp_reward: int = Field(description="MP reward, e.g. 30 to 50")
    proof_requirement_prompt: str = Field(description="Prompt for AI vision to verify photo proof of weekly milestone")
    is_completed: bool = False
    scheduled_date: Optional[str] = Field(default=None, description="Scheduled completion due date YYYY-MM-DD")
    completed_at: Optional[str] = Field(default=None, description="Timestamp when verified completed YYYY-MM-DD HH:MM")

class BossQuestSchema(BaseModel):
    id: str = Field(description="Final boss quest ID, e.g. qst_boss")
    title: str = Field(description="Final Boss Raid quest title")
    condition: str = Field(description="Final outcome condition required to defeat the boss at the end of duration")
    xp_reward: int = Field(description="XP reward, e.g. 600 to 1000")
    special_title: str = Field(description="Special honorary title unlocked upon defeating the final boss")
    is_completed: bool = False
    scheduled_date: Optional[str] = Field(default=None, description="Scheduled completion due date YYYY-MM-DD")
    completed_at: Optional[str] = Field(default=None, description="Timestamp when verified completed YYYY-MM-DD HH:MM")

class CampaignDecompositionSchema(BaseModel):
    campaign_id: Optional[str] = None
    quantitative_target: QuantitativeTargetSchema = Field(description="Chain-of-thought numeric analysis of duration and targets")
    world_theme: str = Field(description="Custom 8-bit retro dark fantasy world setting tailored to the goal")
    campaign_title: str = Field(description="Epic campaign title")
    lore_background: str = Field(description="Engaging RPG lore story introducing the crusade against real-world obstacles")
    daily_quests: List[DailyQuestSchema] = Field(description="List of 2-3 daily habit micro-quests")
    weekly_quests: List[WeeklyQuestSchema] = Field(description="List of weekly milestone checkpoint quests matching the duration")
    boss_quest: BossQuestSchema = Field(description="Final outcome verification quest at the end of the campaign")
    created_at: Optional[str] = None
    real_life_goal: Optional[str] = None

class FlashVerificationSchema(BaseModel):
    is_valid: bool = Field(description="Whether the uploaded photo authentically completes the quest requirement")
    confidence: float = Field(description="Confidence score between 0.0 and 1.0")
    reason: str = Field(description="Short brief explanation for the player")
    detected_main_object: str = Field(description="The single most prominent physical object detected in the photo, e.g. 'Water Flask', 'Running Shoes'")

class RPGItemLoreSchema(BaseModel):
    rpg_item_name: str = Field(description="Transmuted 8-bit retro RPG item name based on detected real object")
    rpg_lore: str = Field(description="Retro lore description of the transmuted artifact. MUST append a humorous one-sentence observation about how this item relates to everyday life or habit tracking!")
    rarity: str = Field(description="Rarity tier: common, rare, epic, or legendary")
    story_dialogue: str = Field(description="Exciting typewriter narrator text when the item is unlocked")

# --- API RESTful Request / Response Schemas ---

class DecomposeRequest(BaseModel):
    player_id: str
    real_life_goal: str
    difficulty_preference: str = "normal"

class PlayerStateSchema(BaseModel):
    id: str
    name: str
    avatar_url: Optional[str] = "https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero"
    has_completed_onboarding: Optional[bool] = True
    level: int
    hp: int
    max_hp: int
    mp: int
    max_mp: int
    exp: int
    next_level_exp: int
    coins: int

class ItemSchema(BaseModel):
    id: str
    real_world_object: str
    name: str
    lore: str
    rarity: str
    image_base64: str
    created_at: Optional[str] = None

class VerificationResultSchema(BaseModel):
    is_valid: bool
    confidence: float
    reason: str

class RewardsGrantedSchema(BaseModel):
    exp_gained: int
    mp_gained: int
    leveled_up: bool
    current_player_state: PlayerStateSchema

class GeneratedRPGItemSchema(BaseModel):
    item_id: str
    real_world_object_detected: str
    rpg_item_name: str
    rpg_lore: str
    rarity: str
    pixel_image_url: str
    created_at: Optional[str] = None

class VerifyProofResponse(BaseModel):
    verification: VerificationResultSchema
    story_progression: dict
    rewards_granted: Optional[RewardsGrantedSchema] = None
    generated_rpg_item: Optional[GeneratedRPGItemSchema] = None

class PlayerSyncRequestSchema(BaseModel):
    player: PlayerStateSchema
    campaigns: List[dict] = []
    inventory: List[dict] = []

class PlayerFullDataSchema(BaseModel):
    player: PlayerStateSchema
    campaigns: List[dict] = []
    inventory: List[dict] = []
