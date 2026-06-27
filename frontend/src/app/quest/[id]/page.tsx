"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { StoryTypewriter } from '@/components/StoryTypewriter';
import { verifyProof } from '@/utils/api';

export default function QuestCheckinPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = React.use(params);
  const questId = unwrappedParams.id;
  const router = useRouter();
  const { player, campaigns, completeQuest, updatePlayerStats, addItem, openStory } = usePlayerStore();
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [transmutedItem, setTransmutedItem] = useState<any | null>(null);

  // Search quest across all campaigns (Daily, Weekly, or Boss)
  let questTitle = "Unknown Quest Trial";
  let promptReq = "Upload proof photo";
  let parentCampaignId = "";

  for (const camp of campaigns) {
    const daily = camp.daily_quests.find(q => q.id === questId);
    const weekly = camp.weekly_quests?.find(q => q.id === questId);
    if (daily) {
      questTitle = daily.title;
      promptReq = daily.proof_requirement_prompt || daily.description;
      parentCampaignId = camp.campaign_id;
      break;
    } else if (weekly) {
      questTitle = `[WEEK ${weekly.week_number}] ${weekly.title}`;
      promptReq = weekly.proof_requirement_prompt || weekly.description;
      parentCampaignId = camp.campaign_id;
      break;
    } else if (camp.boss_quest.id === questId) {
      questTitle = camp.boss_quest.title;
      promptReq = camp.boss_quest.condition;
      parentCampaignId = camp.campaign_id;
      break;
    }
  }

  if (questId === 'free_upload' || questId.startsWith('free_upload')) {
    questTitle = "FREE UPLOAD / SYNTHESIZE ANY ITEM";
    promptReq = "Upload any photo related to your everyday life or current goal. AI will automatically approve it and craft an 8-bit inventory relic with a humorous observation!";
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitProof = async () => {
    if (!selectedFile) return;
    setVerifying(true);
    try {
      const res = await verifyProof(questId, player.id, selectedFile);
      
      if (!res.verification.is_valid) {
        openStory(`[VERIFICATION FAILED]:\n\n${res.verification.reason}`, "warning");
      } else {
        completeQuest(questId);
        if (res.rewards_granted) {
          updatePlayerStats(res.rewards_granted.current_player_state);
        }
        if (res.generated_rpg_item) {
          addItem({
            id: res.generated_rpg_item.item_id,
            real_world_object: res.generated_rpg_item.real_world_object_detected,
            name: res.generated_rpg_item.rpg_item_name,
            lore: res.generated_rpg_item.rpg_lore,
            rarity: res.generated_rpg_item.rarity as any,
            image_base64: res.generated_rpg_item.pixel_image_url,
            created_at: res.generated_rpg_item.created_at || new Date().toISOString().split('T')[0]
          });
          setTransmutedItem(res.generated_rpg_item);
        }
        openStory(
          `[PHOTO VERIFIED!] Confidence: ${(res.verification.confidence * 100).toFixed(0)}%\n\n${res.story_progression.dialogue}\n\nUnlocked Reward Item: [${res.generated_rpg_item?.rpg_item_name}]!`,
          "epic"
        );
      }
    } catch (err) {
      console.error(err);
      alert("Verification failed. Check if backend API server is running.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pt-2 animate-fade-in">
      <button onClick={() => router.back()} className="nes-btn text-[10px] px-2 py-1 mb-2">
        &lt; BACK
      </button>

      {transmutedItem ? (
        /* Transmutation Result Showcase */
        <div className="nes-container is-dark with-title p-6 border-4 border-yellow-400 bg-[#121212] text-center animate-fade-in shadow-[0_0_25px_#f4a261]">
          <p className="title text-xs text-yellow-400">[VERIFICATION SUCCESS!]</p>
          
          <h2 className="text-sm md:text-base font-bold text-white mb-1">
            {transmutedItem.rpg_item_name}
          </h2>
          <span className="inline-block px-2 py-0.5 text-[10px] border border-yellow-500 text-yellow-300 bg-yellow-950/40 mb-4 font-mono uppercase">
            [{transmutedItem.rarity || 'RARE'}] REWARD ITEM
          </span>

          <div className="w-36 h-36 mx-auto bg-black border-4 border-white p-2 flex items-center justify-center shadow-inner my-4">
            <img src={transmutedItem.pixel_image_url} alt="Transmuted Pixel Art" className="w-full h-full object-contain image-pixelated animate-pulse" />
          </div>

          <p className="text-[11px] text-gray-400 font-mono mb-2">
            Real Object Detected: <span className="text-white font-bold">{transmutedItem.real_world_object_detected}</span>
          </p>

          <p className="text-[11px] text-gray-300 leading-relaxed font-mono bg-black/80 p-3 border border-gray-800 text-left my-4">
            {transmutedItem.rpg_lore}
          </p>

          <p className="text-[10px] text-green-400 font-mono mb-6">
            * Added to your Reward Items!
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-3">
            <button
              onClick={() => router.push("/inventory")}
              className="nes-btn is-success text-xs px-4"
            >
              [VIEW ITEMS &gt;]
            </button>
            <button
              onClick={() => {
                if (parentCampaignId) router.push(`/campaign/${parentCampaignId}`);
                else router.push("/");
              }}
              className="nes-btn is-primary text-xs px-4"
            >
              [RETURN TO DASHBOARD]
            </button>
          </div>
        </div>
      ) : (
        /* Standard Check-in Upload Form */
        <div className="nes-container is-dark with-title p-5 border-2 border-[#f4a261] bg-[#121212]">
          <p className="title text-xs text-[#f4a261]">[TASK CHECK-IN]</p>
          <h1 className="text-sm md:text-base font-bold text-white mb-1">{questTitle}</h1>
          <p className="text-[11px] text-gray-400 mb-4 pb-3 border-b border-gray-800 font-mono">
            OBJECTIVE: {promptReq}
          </p>

          <div className="space-y-4 text-center">
            <div className="border-4 border-dashed border-gray-700 bg-black/50 p-4 relative flex flex-col items-center justify-center min-h-[220px]">
              {previewUrl ? (
                <img src={previewUrl} alt="Proof preview" className="max-h-[200px] object-contain mx-auto border-2 border-white shadow-lg" />
              ) : (
                <div className="space-y-2 text-gray-500 text-xs font-mono">
                  <p className="text-sm">[CAMERA / PHOTO]</p>
                  <p className="text-[10px]">Click below to upload real-world proof</p>
                  <p className="text-[9px] text-yellow-500">Gemini Flash Multimodal AI Verification</p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-xs">
              <label className="nes-btn is-normal w-full sm:flex-1 cursor-pointer text-center text-xs py-1.5">
                [SELECT PHOTO]
                <input type="file" accept="image/*" capture="environment" onChange={handleFileChange} className="hidden" />
              </label>

              <button
                onClick={handleSubmitProof}
                disabled={!selectedFile || verifying}
                className={`nes-btn w-full sm:flex-1 text-xs py-1.5 ${!selectedFile || verifying ? 'is-disabled' : 'is-error animate-pulse font-bold'}`}
              >
                {verifying ? "[VERIFYING...]" : "[SUBMIT PROOF]"}
              </button>
            </div>
          </div>
        </div>
      )}

      <StoryTypewriter />
    </div>
  );
}
