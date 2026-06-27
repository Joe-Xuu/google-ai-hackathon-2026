export interface QuantitativeTarget {
  duration_days: number;
  total_metric: string;
  daily_quota: string;
  weekly_target: string;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  xp_reward: number;
  mp_reward: number;
  proof_requirement_prompt: string;
  is_completed?: boolean;
  scheduled_date?: string;
  completed_at?: string;
}

export interface WeeklyQuest {
  id: string;
  title: string;
  description: string;
  week_number: number;
  xp_reward: number;
  mp_reward: number;
  proof_requirement_prompt: string;
  is_completed?: boolean;
  scheduled_date?: string;
  completed_at?: string;
}

export interface BossQuest {
  id: string;
  title: string;
  condition: string;
  xp_reward: number;
  special_title: string;
  is_completed?: boolean;
  scheduled_date?: string;
  completed_at?: string;
}

export interface CampaignData {
  campaign_id: string;
  quantitative_target?: QuantitativeTarget;
  world_theme: string;
  campaign_title: string;
  lore_background: string;
  daily_quests: DailyQuest[];
  weekly_quests?: WeeklyQuest[];
  boss_quest: BossQuest;
  created_at?: string;
  real_life_goal?: string;
}

export interface RPGItem {
  id: string;
  real_world_object: string;
  name: string;
  lore: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image_base64: string;
  created_at?: string;
}

export interface PlayerState {
  id: string;
  name: string;
  avatar_url: string;
  has_completed_onboarding: boolean;
  level: number;
  hp: number;
  max_hp: number;
  mp: number;
  max_mp: number;
  exp: number;
  next_level_exp: number;
  coins: number;
}
