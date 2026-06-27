"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { PlayerStatusBar } from '@/components/PlayerStatusBar';
import { StoryTypewriter } from '@/components/StoryTypewriter';
import { decomposeGoal } from '@/utils/api';

export default function CampaignLobbyPage() {
  const router = useRouter();
  const { player, campaigns, addCampaign, deleteCampaign, openStory } = usePlayerStore();
  
  const [showModal, setShowModal] = useState(false);
  const [inputGoal, setInputGoal] = useState("");
  const [difficulty, setDifficulty] = useState("normal");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!player.has_completed_onboarding) {
      router.push("/onboarding");
    }
  }, [player.has_completed_onboarding, router]);

  if (!player.has_completed_onboarding) {
    return <div className="text-center py-20 text-xs font-mono">[REDIRECTING TO ONBOARDING...]</div>;
  }

  const handleCreateNewCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGoal.trim()) return;
    setLoading(true);
    try {
      const res = await decomposeGoal(inputGoal, difficulty, player.id);
      res.created_at = new Date().toISOString().split('T')[0];
      res.real_life_goal = inputGoal;
      addCampaign(res);
      setShowModal(false);
      setInputGoal("");
      openStory(`[NEW GOAL CREATED]: ${res.campaign_title}\n\nTheme: ${res.world_theme}`, "epic");
    } catch (err) {
      console.error(err);
      alert("Failed to create goal. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pt-1">
      <PlayerStatusBar />

      {/* Lobby Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b-4 border-white pb-3">
        <div>
          <h1 className="text-base md:text-lg font-bold text-[#f4a261]">
            [MY GOALS &amp; PLANS]
          </h1>
        </div>
        <button onClick={() => setShowModal(true)} className="nes-btn is-warning text-xs w-full sm:w-auto px-4">
          + ADD GOAL
        </button>
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((c) => {
          const completedCount = c.daily_quests.filter(q => q.is_completed).length;
          const totalCount = c.daily_quests.length;
          const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

          return (
            <div
              key={c.campaign_id}
              onClick={() => router.push(`/campaign/${c.campaign_id}`)}
              className="nes-container is-dark p-4 border-2 border-gray-700 bg-[#161616] cursor-pointer transition-all hover:border-[#e76f51] hover:scale-[1.01] flex flex-col justify-between min-h-[160px]"
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-2">
                  <span className="text-[10px] text-yellow-400 font-mono">[{c.world_theme.slice(0, 20)}...]</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this goal?")) deleteCampaign(c.campaign_id);
                    }}
                    className="text-red-500 hover:text-red-300 text-xs px-1 font-mono"
                    title="Delete"
                  >
                    [X]
                  </button>
                </div>

                <h2 className="text-sm font-bold text-white mb-1 leading-snug truncate">{c.campaign_title}</h2>
                <p className="text-[11px] text-gray-400 truncate mb-3 font-mono">GOAL: {c.real_life_goal || 'Habit Challenge'}</p>
              </div>

              <div className="border-t border-gray-800 pt-2.5 mt-auto">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1 font-mono">
                  <span>PROGRESS</span>
                  <span className="text-green-400 font-bold">{completedCount}/{totalCount} ({progressPercent}%)</span>
                </div>
                <progress className="nes-progress is-success h-3 w-full" value={progressPercent} max="100"></progress>
              </div>
            </div>
          );
        })}
      </div>

      {campaigns.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-800 p-6 space-y-3">
          <p className="text-xs text-gray-500 font-mono">[NO ACTIVE GOALS YET]</p>
          <button onClick={() => setShowModal(true)} className="nes-btn is-primary text-xs">+ CREATE FIRST GOAL</button>
        </div>
      )}

      {/* Create New Campaign Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="nes-container is-dark with-title max-w-md w-full p-5 border-4 border-white bg-[#121212]">
            <p className="title text-xs text-[#f4a261]">[ADD NEW GOAL]</p>
            
            <form onSubmit={handleCreateNewCampaign} className="space-y-3 text-left mt-1">
              <div>
                <label className="block text-[11px] text-yellow-400 mb-1.5 font-mono">ENTER YOUR GOAL:</label>
                <input
                  type="text"
                  className="nes-input is-dark w-full text-xs py-2"
                  placeholder="e.g. Lose 5kg in 1 month"
                  value={inputGoal}
                  onChange={(e) => setInputGoal(e.target.value)}
                  required
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-1">
                <span className="text-gray-400 text-[11px] font-mono">MODE:</span>
                <label className="inline-flex items-center gap-1 cursor-pointer">
                  <input type="radio" className="nes-radio" checked={difficulty === 'normal'} onChange={() => setDifficulty('normal')} />
                  <span className="text-xs">Normal</span>
                </label>
                <label className="inline-flex items-center gap-1 cursor-pointer text-red-400 font-bold">
                  <input type="radio" className="nes-radio is-dark" checked={difficulty === 'hardcore'} onChange={() => setDifficulty('hardcore')} />
                  <span className="text-xs">Hardcore</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-800">
                <button type="button" onClick={() => setShowModal(false)} disabled={loading} className="nes-btn text-xs px-3">CANCEL</button>
                <button type="submit" disabled={loading || !inputGoal.trim()} className={`nes-btn text-xs px-3 ${loading ? 'is-disabled' : 'is-warning'}`}>
                  {loading ? "[AI...]" : "[START]"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <StoryTypewriter />
    </div>
  );
}
