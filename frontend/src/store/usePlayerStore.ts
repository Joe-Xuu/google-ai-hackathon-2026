import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PlayerState, CampaignData, RPGItem } from '@/types/game';
import { syncPlayerData, loadPlayerData } from '@/utils/api';

interface PlayerStore {
  player: PlayerState;
  campaigns: CampaignData[];
  inventory: RPGItem[];
  storyDialogue: { text: string; isOpen: boolean; tone?: string };
  _hasHydrated: boolean;

  createCharacter: (name: string, avatarUrl: string) => void;
  addCampaign: (campaign: CampaignData) => void;
  deleteCampaign: (campaignId: string) => void;
  setInventory: (items: RPGItem[]) => void;
  addItem: (item: RPGItem) => void;
  completeQuest: (questId: string) => void;
  updatePlayerStats: (updates: Partial<PlayerState>) => void;
  loadFromServer: (nameOrId: string) => Promise<boolean>;
  openStory: (text: string, tone?: string) => void;
  closeStory: () => void;
  resetGame: () => void;
  _setHasHydrated: (val: boolean) => void;
}

const INIT_PLAYER: PlayerState = {
  id: "usr_hero_01",
  name: "8-BIT HERO",
  avatar_url: "https://api.dicebear.com/7.x/pixel-art/svg?seed=Hero",
  has_completed_onboarding: false,
  level: 1,
  hp: 100,
  max_hp: 100,
  mp: 50,
  max_mp: 50,
  exp: 0,
  next_level_exp: 100,
  coins: 0
};

export const usePlayerStore = create<PlayerStore>()(
  persist(
    (set, get) => ({
      player: INIT_PLAYER,
      campaigns: [],
      inventory: [],
      storyDialogue: { text: "", isOpen: false, tone: "epic" },
      _hasHydrated: false,
      
      createCharacter: (name, avatarUrl) => {
        set((state) => {
          const cleanName = name.trim() || "8-BIT HERO";
          const formattedSlug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const uniqueId = formattedSlug ? `usr_${formattedSlug}` : "usr_hero_01";
          const updatedPlayer = { ...state.player, id: uniqueId, name: cleanName, avatar_url: avatarUrl, has_completed_onboarding: true };
          syncPlayerData(updatedPlayer, state.campaigns, state.inventory);
          return { player: updatedPlayer };
        });
      },

      addCampaign: (campaign) => {
        set((state) => {
          const baseDateStr = campaign.created_at || new Date().toISOString().split('T')[0];
          const baseDate = new Date(baseDateStr);
          const formatDate = (d: Date) => d.toISOString().split('T')[0];
          
          const daily_quests = campaign.daily_quests.map((q, idx) => {
            const target = new Date(baseDate);
            target.setDate(target.getDate() + idx);
            return { ...q, scheduled_date: q.scheduled_date || formatDate(target) };
          });

          const weekly_quests = (campaign.weekly_quests || []).map((q) => {
            const target = new Date(baseDate);
            target.setDate(target.getDate() + (q.week_number * 7));
            return { ...q, scheduled_date: q.scheduled_date || formatDate(target) };
          });

          const duration = campaign.quantitative_target?.duration_days || 30;
          const bossTarget = new Date(baseDate);
          bossTarget.setDate(bossTarget.getDate() + duration);
          const boss_quest = {
            ...campaign.boss_quest,
            scheduled_date: campaign.boss_quest.scheduled_date || formatDate(bossTarget)
          };

          const scheduledCampaign: CampaignData = {
            ...campaign,
            created_at: baseDateStr,
            daily_quests,
            weekly_quests,
            boss_quest
          };

          const updatedCampaigns = [scheduledCampaign, ...state.campaigns];
          syncPlayerData(state.player, updatedCampaigns, state.inventory);
          return { campaigns: updatedCampaigns };
        });
      },

      deleteCampaign: (campaignId) => {
        set((state) => {
          const updated = state.campaigns.filter(c => c.campaign_id !== campaignId);
          syncPlayerData(state.player, updated, state.inventory);
          return { campaigns: updated };
        });
      },
      
      setInventory: (inventory) => {
        set({ inventory });
        syncPlayerData(get().player, get().campaigns, inventory);
      },

      addItem: (item) => {
        set((state) => {
          const updated = [item, ...state.inventory];
          syncPlayerData(state.player, state.campaigns, updated);
          return { inventory: updated };
        });
      },
      
      completeQuest: (questId) => {
        set((state) => {
          const nowTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 16);
          const updatedCampaigns = state.campaigns.map(c => {
            const dailyMatch = c.daily_quests.some(q => q.id === questId);
            const weeklyMatch = c.weekly_quests?.some(q => q.id === questId);
            const bossMatch = c.boss_quest.id === questId;
            if (!dailyMatch && !weeklyMatch && !bossMatch) return c;
            
            return {
              ...c,
              daily_quests: c.daily_quests.map(q => q.id === questId ? { ...q, is_completed: true, completed_at: q.completed_at || nowTimestamp } : q),
              weekly_quests: c.weekly_quests?.map(q => q.id === questId ? { ...q, is_completed: true, completed_at: q.completed_at || nowTimestamp } : q),
              boss_quest: bossMatch ? { ...c.boss_quest, is_completed: true, completed_at: c.boss_quest.completed_at || nowTimestamp } : c.boss_quest
            };
          });
          syncPlayerData(state.player, updatedCampaigns, state.inventory);
          return { campaigns: updatedCampaigns };
        });
      },

      updatePlayerStats: (updates) => {
        set((state) => {
          const updatedPlayer = { ...state.player, ...updates };
          syncPlayerData(updatedPlayer, state.campaigns, state.inventory);
          return { player: updatedPlayer };
        });
      },

      loadFromServer: async (nameOrId) => {
        try {
          const cleanInput = nameOrId.trim();
          const formattedSlug = cleanInput.toLowerCase().replace(/[^a-z0-9]/g, '_');
          const possibleId = formattedSlug ? `usr_${formattedSlug}` : cleanInput;
          
          let data = null;
          try {
            data = await loadPlayerData(possibleId);
          } catch {
            try {
              data = await loadPlayerData(cleanInput);
            } catch {
              return false;
            }
          }

          if (data && data.player) {
            set({
              player: data.player,
              campaigns: data.campaigns || [],
              inventory: data.inventory || []
            });
            return true;
          }
          return false;
        } catch (err) {
          console.error("Failed to load user from server:", err);
          return false;
        }
      },

      openStory: (text, tone = "epic") => set({ storyDialogue: { text, isOpen: true, tone } }),
      closeStory: () => set({ storyDialogue: { text: "", isOpen: false } }),
      resetGame: () => set({ player: INIT_PLAYER, campaigns: [], inventory: [] }),
      _setHasHydrated: (val: boolean) => set({ _hasHydrated: val }),
    }),
    {
      name: 'gamify-player-store',
      partialize: (state) => ({
        // Only persist game data, NOT the transient storyDialogue UI state
        player: state.player,
        campaigns: state.campaigns,
        inventory: state.inventory,
      }),
      onRehydrateStorage: () => (state) => {
        // Called once localStorage data has been loaded into the store
        state?._setHasHydrated(true);
      },
    }
  )
);


