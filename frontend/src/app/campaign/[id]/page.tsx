"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { PlayerStatusBar } from '@/components/PlayerStatusBar';
import { QuestCard } from '@/components/QuestCard';
import { StoryTypewriter } from '@/components/StoryTypewriter';

export default function CampaignDashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const campaignId = unwrappedParams.id;
  const router = useRouter();
  
  const campaigns = usePlayerStore((state) => state.campaigns);
  const campaign = campaigns.find(c => c.campaign_id === campaignId) || campaigns[0];

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'boss' | 'logs'>('daily');
  const [showLore, setShowLore] = useState(false);

  if (!campaign) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-xs text-gray-500">[SCRIPT NOT FOUND]</p>
        <button onClick={() => router.push("/")} className="nes-btn is-primary text-xs">[LOBBY &gt;]</button>
      </div>
    );
  }

  const dailyCompleted = campaign.daily_quests.filter(q => q.is_completed).length;
  const totalDaily = campaign.daily_quests.length;
  const weeklyCompleted = (campaign.weekly_quests || []).filter(q => q.is_completed).length;
  const totalWeekly = (campaign.weekly_quests || []).length;

  const allCompletedQuests: Array<{ id: string; title: string; tier: string; completedAt?: string; xpReward: number }> = [];
  campaign.daily_quests.filter(q => q.is_completed).forEach(q => {
    allCompletedQuests.push({ id: q.id, title: q.title, tier: "DAILY", completedAt: q.completed_at, xpReward: q.xp_reward });
  });
  (campaign.weekly_quests || []).filter(q => q.is_completed).forEach(q => {
    allCompletedQuests.push({ id: q.id, title: `[WK ${q.week_number}] ${q.title}`, tier: "WEEKLY", completedAt: q.completed_at, xpReward: q.xp_reward });
  });
  if (campaign.boss_quest.is_completed) {
    allCompletedQuests.push({ id: campaign.boss_quest.id, title: campaign.boss_quest.title, tier: "BOSS", completedAt: campaign.boss_quest.completed_at, xpReward: campaign.boss_quest.xp_reward });
  }

  return (
    <div className="space-y-4 animate-fade-in pt-1">
      <div className="flex justify-between items-center text-xs">
        <button onClick={() => router.push("/")} className="nes-btn text-[10px] px-2 py-1">
          &lt; LOBBY
        </button>
        <span className="text-[#f4a261] font-mono">ID: #{campaign.campaign_id.slice(-4)}</span>
      </div>

      <PlayerStatusBar />

      {/* Minimalist Arcade Header */}
      <div className="nes-container is-dark p-4 border-2 border-[#f4a261] bg-[#14100c]">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-2 border-b border-gray-800">
          <div>
            <span className="text-[10px] text-yellow-400 font-mono">[{campaign.world_theme}]</span>
            <h1 className="text-sm md:text-lg font-bold text-white mt-0.5">{campaign.campaign_title}</h1>
          </div>
          <div className="text-[11px] font-mono shrink-0">
            <span className="text-green-400">D: {dailyCompleted}/{totalDaily}</span> | <span className="text-blue-400">W: {weeklyCompleted}/{totalWeekly}</span>
          </div>
        </div>

        {/* Compact Quantitative Ribbon */}
        {campaign.quantitative_target ? (
          <div className="flex flex-wrap items-center justify-between gap-2 bg-black p-2 my-2 text-[11px] font-mono border border-gray-800">
            <div><span className="text-[#f4a261]">GOAL:</span> {campaign.quantitative_target.total_metric}</div>
            <div><span className="text-[#f4a261]">TIME:</span> {campaign.quantitative_target.duration_days}D</div>
            <div><span className="text-[#f4a261]">DAILY:</span> {campaign.quantitative_target.daily_quota}</div>
          </div>
        ) : (
          <div className="text-[11px] text-yellow-400 my-2 font-mono">GOAL: {campaign.real_life_goal || 'Habit Discipline'}</div>
        )}

        {/* Collapsible Lore Toggle */}
        <div className="text-right mt-1">
          <button onClick={() => setShowLore(!showLore)} className="text-[10px] text-gray-400 hover:text-white underline font-mono">
            {showLore ? '[- HIDE DETAILS]' : '[+ VIEW DETAILS]'}
          </button>
        </div>

        {showLore && (
          <p className="text-[11px] text-gray-300 leading-relaxed font-mono bg-black p-3 border border-gray-800 mt-2 animate-fade-in">
            {campaign.lore_background}
          </p>
        )}
      </div>

      {/* Retro Arcade Tab Navigation Bar */}
      <div className="grid grid-cols-4 gap-1 text-[10px] sm:text-xs">
        <button
          onClick={() => setActiveTab('daily')}
          className={`nes-btn py-2 px-1 truncate ${activeTab === 'daily' ? 'is-warning font-bold' : 'is-normal'}`}
        >
          DAILY ({totalDaily - dailyCompleted})
        </button>
        <button
          onClick={() => setActiveTab('weekly')}
          className={`nes-btn py-2 px-1 truncate ${activeTab === 'weekly' ? 'is-primary font-bold' : 'is-normal'}`}
        >
          WEEKLY ({totalWeekly - weeklyCompleted})
        </button>
        <button
          onClick={() => setActiveTab('boss')}
          className={`nes-btn py-2 px-1 truncate ${activeTab === 'boss' ? 'is-error font-bold' : 'is-normal'}`}
        >
          FINAL GOAL {campaign.boss_quest.is_completed ? '[OK]' : '[1]'}
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`nes-btn py-2 px-1 truncate ${activeTab === 'logs' ? 'is-success font-bold' : 'is-normal'}`}
        >
          HISTORY ({allCompletedQuests.length})
        </button>
      </div>

      {/* Tab Content Section */}
      <div className="min-h-[220px]">
        {/* TAB 1: DAILY TRIALS */}
        {activeTab === 'daily' && (
          <div className="space-y-2 animate-fade-in">
            {campaign.daily_quests.map((q) => (
              <QuestCard
                key={q.id}
                id={q.id}
                title={q.title}
                description={q.description}
                xpReward={q.xp_reward}
                mpReward={q.mp_reward}
                isCompleted={q.is_completed}
                scheduledDate={q.scheduled_date}
                completedAt={q.completed_at}
              />
            ))}
          </div>
        )}

        {/* TAB 2: WEEKLY MILESTONES */}
        {activeTab === 'weekly' && (
          <div className="space-y-2 animate-fade-in">
            {(!campaign.weekly_quests || campaign.weekly_quests.length === 0) ? (
              <p className="text-xs text-gray-500 text-center py-12 font-mono">[NO WEEKLY MILESTONES ASSIGNED]</p>
            ) : (
              campaign.weekly_quests.map((q) => (
                <QuestCard
                  key={q.id}
                  id={q.id}
                  title={`[WK ${q.week_number}] ${q.title}`}
                  description={q.description}
                  xpReward={q.xp_reward}
                  mpReward={q.mp_reward}
                  isCompleted={q.is_completed}
                  scheduledDate={q.scheduled_date}
                  completedAt={q.completed_at}
                />
              ))
            )}
          </div>
        )}

        {/* TAB 3: BOSS RAID */}
        {activeTab === 'boss' && (
          <div className="animate-fade-in pt-2">
            <QuestCard
              id={campaign.boss_quest.id}
              title={campaign.boss_quest.title}
              description={campaign.boss_quest.condition}
              xpReward={campaign.boss_quest.xp_reward}
              mpReward={50}
              isBoss={true}
              isCompleted={campaign.boss_quest.is_completed}
              scheduledDate={campaign.boss_quest.scheduled_date}
              completedAt={campaign.boss_quest.completed_at}
            />
          </div>
        )}

        {/* TAB 4: HISTORICAL COMPLETED LOGS */}
        {activeTab === 'logs' && (
          <div className="nes-container is-dark p-4 border border-green-700 bg-[#0c160e] animate-fade-in">
            {allCompletedQuests.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-10 font-mono">
                [NO COMPLETED TASKS YET. COMPLETE TASKS TO RECORD HISTORY]
              </p>
            ) : (
              <div className="space-y-2">
                <p className="text-[10px] text-green-400 font-mono pb-2 border-b border-green-900">
                  COMPLETED TASKS ({allCompletedQuests.length})
                </p>
                {allCompletedQuests.map((item) => (
                  <div key={item.id} className="flex justify-between items-center bg-black p-2.5 border border-green-950 text-xs">
                    <div className="truncate pr-2">
                      <span className="text-[10px] text-yellow-500 font-bold mr-1.5">[{item.tier}]</span>
                      <span className="text-white font-bold text-xs">{item.title}</span>
                    </div>
                    <div className="text-[10px] font-mono text-gray-400 shrink-0">
                      <span className="text-green-400 mr-2">+{item.xpReward}XP</span>
                      <span>{item.completedAt ? item.completedAt.slice(5) : 'DONE'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <StoryTypewriter />
    </div>
  );
}
