import { CampaignData, PlayerState, RPGItem } from '@/types/game';

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export async function decomposeGoal(goal: string, difficulty: string = "normal", playerId: string = "usr_hero_01"): Promise<CampaignData> {
  const res = await fetch(`${API_BASE}/quests/decompose`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ player_id: playerId, real_life_goal: goal, difficulty_preference: difficulty })
  });
  if (!res.ok) throw new Error("目标拆解失败");
  return res.json();
}

export async function verifyProof(questId: string, playerId: string, file: File) {
  const form = new FormData();
  form.append("quest_id", questId);
  form.append("player_id", playerId);
  form.append("proof_image", file);

  const res = await fetch(`${API_BASE}/proof/verify`, {
    method: "POST",
    body: form
  });
  if (!res.ok) throw new Error("打卡验证异常");
  return res.json();
}

export async function syncPlayerData(player: PlayerState, campaigns: CampaignData[], inventory: RPGItem[]) {
  try {
    await fetch(`${API_BASE}/players/sync`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ player, campaigns, inventory })
    });
  } catch (err) {
    console.warn("Backend sync failed:", err);
  }
}

export async function loadPlayerData(nameOrId: string) {
  const res = await fetch(`${API_BASE}/players/${encodeURIComponent(nameOrId)}`);
  if (!res.ok) throw new Error("Player not found");
  return res.json();
}
