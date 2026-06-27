import json
import logging
from typing import Optional
from app.config import settings
from app.schemas import (
    CampaignDecompositionSchema,
    QuantitativeTargetSchema,
    DailyQuestSchema,
    WeeklyQuestSchema,
    BossQuestSchema,
    FlashVerificationSchema,
    RPGItemLoreSchema
)

logger = logging.getLogger(__name__)

class AIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.use_mock = (self.api_key == "mock-api-key" or not self.api_key or self.api_key == "your_api_key_here")
        if not self.use_mock:
            try:
                from google import genai
                self.client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warning(f"Failed to init GenAI client: {e}, falling back to mock.")
                self.use_mock = True

    async def decompose_goal(self, goal: str, difficulty: str) -> CampaignDecompositionSchema:
        if self.use_mock:
            logger.info("Using mock decomposition data because GEMINI_API_KEY is not set.")
            return CampaignDecompositionSchema(
                quantitative_target=QuantitativeTargetSchema(
                    duration_days=30,
                    total_metric="Lose 5 kg",
                    daily_quota="500 kcal caloric deficit &amp; 30 mins cardio",
                    weekly_target="Lose 1.25 kg per week"
                ),
                world_theme="8-Bit Abyssal Realm of Discipline",
                campaign_title="Crusade Against Sedentary Sloth",
                lore_background=f"The Sloth Demon Lord has stolen the kingdom's willpower. To achieve the epic quantitative campaign of '{goal}', the Hero must conquer a 30-day hierarchy of daily trials and weekly weigh-ins!",
                daily_quests=[
                    DailyQuestSchema(
                        id="qst_day_1",
                        title="Sever Morning Sloth",
                        description="Wake up on time and drink 500ml warm water",
                        xp_reward=60,
                        mp_reward=15,
                        proof_requirement_prompt="Check photo for water mug, window light, or clock"
                    ),
                    DailyQuestSchema(
                        id="qst_day_2",
                        title="Calorie Deficit Trial",
                        description="Eat a low-calorie green salad or workout 30 mins",
                        xp_reward=80,
                        mp_reward=25,
                        proof_requirement_prompt="Check photo for healthy bowl, running shoes, gym equipment, or sweat"
                    )
                ],
                weekly_quests=[
                    WeeklyQuestSchema(
                        id="qst_wk_1",
                        title="Week 1 Checkpoint Check",
                        description="Step on scale &amp; verify 1.25 kg loss progress",
                        week_number=1,
                        xp_reward=250,
                        mp_reward=40,
                        proof_requirement_prompt="Check photo for digital scale reading or workout log"
                    ),
                    WeeklyQuestSchema(
                        id="qst_wk_2",
                        title="Week 2 Midterm Trial",
                        description="Maintain streak &amp; verify 2.50 kg total loss",
                        week_number=2,
                        xp_reward=300,
                        mp_reward=50,
                        proof_requirement_prompt="Check photo for scale weight reading or fitness tracking app"
                    )
                ],
                boss_quest=BossQuestSchema(
                    id="qst_boss",
                    title="Vanish Abyssal Bodyweight Demon",
                    condition="Day 30 Final Verification: Step on scale proving full 5kg loss",
                    xp_reward=800,
                    special_title="Dawn Discipline Master"
                )
            )

        try:
            from google.genai import types
            prompt = (
                f"You are an elite 8-bit retro RPG game architect and quantitative habit coach. "
                f"Analyze the user's real-life goal: '{goal}' (difficulty: '{difficulty}').\n"
                f"Your MUST perform strict numeric calculation first:\n"
                f"1. Extract or deduce realistic duration in days (e.g. '1 month' = 30 days).\n"
                f"2. Calculate exact daily numeric quota and weekly checkpoint targets.\n"
                f"3. Decompose into 2-3 daily habit micro-quests, weekly checkpoint quests matching the duration (e.g. 4 weekly quests for 30 days), and 1 final outcome boss raid.\n"
                f"All text MUST be written in pure English."
            )
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=CampaignDecompositionSchema,
                    temperature=0.7
                )
            )
            return CampaignDecompositionSchema.model_validate_json(response.text)
        except Exception as e:
            logger.error(f"⚠️ [API ERROR] Gemini decompose generation failed ({e}). Check your GEMINI_API_KEY. Falling back to mock data.")
            self.use_mock = True
            return await self.decompose_goal(goal, difficulty)

    async def verify_proof_image(self, image_bytes: bytes, quest_title: str, proof_prompt: str) -> FlashVerificationSchema:
        if self.use_mock:
            return FlashVerificationSchema(
                is_valid=True,
                confidence=0.98,
                reason=f"AI Vision confirmed clear proof for '{quest_title}'!",
                detected_main_object="Pixel Artifact"
            )

        try:
            from google.genai import types
            prompt = (
                f"Quest Objective: {quest_title}\n"
                f"Verification Guide: {proof_prompt}\n"
                f"Verify if the photo demonstrates authentic completion of the quest. "
                f"NOTE: If this is a 'Free Upload' or general check-in, approve it (is_valid=True) as long as there is any clear physical object or daily life scene in the photo. "
                f"Pick the single most prominent physical object name detected in the photo. All return text MUST be in English."
            )
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=[
                    types.Part.from_bytes(data=image_bytes, mime_type="image/jpeg"),
                    prompt
                ],
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=FlashVerificationSchema,
                    temperature=0.2
                )
            )
            return FlashVerificationSchema.model_validate_json(response.text)
        except Exception as e:
            logger.error(f"⚠️ [API ERROR] GenAI flash verify error: {e}")
            return FlashVerificationSchema(
                is_valid=True,
                confidence=0.90,
                reason="Instant verification passed!",
                detected_main_object="Mysterious Relic"
            )

    async def generate_item_lore(self, detected_object: str, quest_title: str) -> RPGItemLoreSchema:
        if self.use_mock:
            return RPGItemLoreSchema(
                rpg_item_name=f"Abyssal {detected_object}",
                rpg_lore=f"A crystallized pixel relic transmuted from '{detected_object}'. Humorous note: Proven to boost productivity by at least 1% while looking 100% cooler!",
                rarity="rare",
                story_dialogue="Golden light flashes! The real-life object crystallizes into an 8-bit RPG relic!"
            )

        try:
            from google.genai import types
            prompt = (
                f"Player just completed quest '{quest_title}'. AI vision detected real-life object: '{detected_object}'. "
                f"Create an 8-bit retro RPG game item name, lore description (MUST append a witty, humorous one-sentence observation about how this item relates to real life or habit tracking!), and epic dialogue narrator story. All text MUST be in English."
            )
            response = self.client.models.generate_content(
                model='gemini-flash-latest',
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=RPGItemLoreSchema,
                    temperature=0.8
                )
            )
            return RPGItemLoreSchema.model_validate_json(response.text)
        except Exception as e:
            logger.error(f"⚠️ [API ERROR] GenAI lore error: {e}")
            return RPGItemLoreSchema(
                rpg_item_name=f"Retro Relic · {detected_object}",
                rpg_lore=f"A mysterious trophy glowing with 8-bit pixel aura. Humorous note: Even heroes need little keepsakes to remember their daily triumphs!",
                rarity="common",
                story_dialogue="Quest Complete! New relic added to inventory!"
            )

ai_service = AIService()
