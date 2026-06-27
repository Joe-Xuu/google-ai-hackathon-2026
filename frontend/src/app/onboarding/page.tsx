"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlayerStore } from '@/store/usePlayerStore';
import { PixelContainer } from '@/components/PixelContainer';
import { decomposeGoal } from '@/utils/api';

const PRESET_SEEDS = [
  { label: "PALADIN", seed: "Paladin" },
  { label: "VALKYRIE", seed: "Valkyrie" },
  { label: "WIZARD", seed: "Merlin" },
  { label: "SHADOW", seed: "Ninja" },
  { label: "CYBERPUNK", seed: "Neo" },
  { label: "MONARCH", seed: "King" }
];

export default function OnboardingPage() {
  const router = useRouter();
  const { createCharacter, addCampaign, openStory, loadFromServer } = usePlayerStore();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [heroName, setHeroName] = useState("8-BIT HERO");
  const [avatarSeed, setAvatarSeed] = useState("Paladin");
  const [inputGoal, setInputGoal] = useState("");
  const [difficulty, setDifficulty] = useState("normal");
  const [loading, setLoading] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);

  const currentAvatarUrl = `https://api.dicebear.com/7.x/pixel-art/svg?seed=${avatarSeed}`;

  const handleRandomize = () => {
    const randomSeed = "Hero_" + Math.floor(Math.random() * 100000);
    setAvatarSeed(randomSeed);
  };

  const handleLoadExisting = async () => {
    if (!heroName.trim()) return;
    setLoadingExisting(true);
    try {
      const success = await loadFromServer(heroName.trim());
      if (success) {
        openStory(`[DATA RESTORED] Welcome back, ${heroName}! Your saved goals and items have been loaded.`, "epic");
        router.push("/");
      } else {
        alert(`No saved data found for '${heroName}'. Let's create a new user profile!`);
        setStep(2);
      }
    } catch (err) {
      alert("Error checking database.");
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleFinishOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputGoal.trim()) return;
    setLoading(true);
    try {
      const cleanName = heroName.trim() || "8-BIT HERO";
      const formattedSlug = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      const uniqueId = formattedSlug ? `usr_${formattedSlug}` : "usr_hero_01";
      createCharacter(cleanName, currentAvatarUrl);
      const res = await decomposeGoal(inputGoal, difficulty, uniqueId);
      res.created_at = new Date().toISOString().split('T')[0];
      res.real_life_goal = inputGoal;
      addCampaign(res);
      openStory(`[GOAL CREATED] Welcome to Gamify Everything, ${heroName}!\n\nPlan Summary: ${res.lore_background}`, "epic");
      router.push("/");
    } catch (err) {
      console.error(err);
      alert("Failed to connect AI engine. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-8 animate-fade-in space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-[#f4a261] mb-2">[WELCOME TO GAMIFY]</h1>
        <p className="text-xs text-gray-400">Step {step} of 3: {step === 1 ? 'ENTER YOUR NAME' : step === 2 ? 'SELECT AVATAR' : 'SET YOUR GOAL'}</p>
      </div>

      {/* STEP 1: HERO NAME */}
      {step === 1 && (
        <PixelContainer title="STEP 1: YOUR NAME">
          <div className="space-y-6 text-center py-4">
            <div className="py-2">
              <span className="mario-star">
                <i className="nes-icon is-large star"></i>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-gray-300">
              Welcome! Please enter your name or username to start tracking your goals and earn rewards.
            </p>
            <div className="text-left">
              <label className="text-xs text-[#f4a261] block mb-2">YOUR NAME:</label>
              <input
                type="text"
                className="nes-input is-dark text-center font-bold tracking-widest text-sm"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                maxLength={16}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleLoadExisting}
                disabled={!heroName.trim() || loadingExisting}
                className="nes-btn is-success flex-1 text-xs"
              >
                {loadingExisting ? "[LOADING...]" : "[LOAD SAVED DATA >]"}
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!heroName.trim() || loadingExisting}
                className="nes-btn is-primary flex-1 text-xs"
              >
                [NEW USER &gt;&gt;]
              </button>
            </div>
          </div>
        </PixelContainer>
      )}

      {/* STEP 2: DICEBEAR AVATAR CUSTOMIZER */}
      {step === 2 && (
        <PixelContainer title="STEP 2: CHOOSE AVATAR">
          <div className="space-y-6 text-center py-2">
            <div className="w-36 h-36 mx-auto bg-black border-4 border-white p-2 flex items-center justify-center shadow-[0_0_20px_#e76f51]">
              <img src={currentAvatarUrl} alt="User Avatar Preview" className="w-full h-full object-contain image-pixelated" />
            </div>

            <button onClick={handleRandomize} type="button" className="nes-btn is-warning text-xs">
              RANDOMIZE AVATAR
            </button>

            <div className="text-left pt-2 border-t border-gray-800">
              <label className="text-[10px] text-gray-400 block mb-2">SELECT AVATAR STYLE:</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_SEEDS.map((p) => (
                  <button
                    key={p.seed}
                    type="button"
                    onClick={() => setAvatarSeed(p.seed)}
                    className={`nes-btn text-[10px] px-1 py-2 ${avatarSeed === p.seed ? 'is-success' : 'is-normal'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-between gap-4 pt-4">
              <button onClick={() => setStep(1)} className="nes-btn text-xs flex-1">&lt;- BACK</button>
              <button onClick={() => setStep(3)} className="nes-btn is-primary text-xs flex-1">NEXT &gt;&gt;</button>
            </div>
          </div>
        </PixelContainer>
      )}

      {/* STEP 3: FIRST CAMPAIGN GOAL */}
      {step === 3 && (
        <PixelContainer title="STEP 3: FIRST GOAL">
          <form onSubmit={handleFinishOnboarding} className="space-y-6 text-center py-2">
            <p className="text-xs leading-relaxed text-gray-300">
              What is the main habit or goal you want to achieve right now? We will break it down into daily tasks!
            </p>

            <div className="text-left">
              <label className="text-xs text-[#f4a261] block mb-2">ENTER YOUR GOAL:</label>
              <input
                type="text"
                className="nes-input is-dark text-xs py-3 w-full"
                placeholder="e.g. Lose 5kg in 2 months / Learn Python daily"
                value={inputGoal}
                onChange={(e) => setInputGoal(e.target.value)}
              />
            </div>

            <div className="flex justify-center items-center gap-6 text-xs pt-2">
              <label className="inline-flex items-center gap-1 cursor-pointer">
                <input type="radio" className="nes-radio" checked={difficulty === 'normal'} onChange={() => setDifficulty('normal')} />
                <span>Normal</span>
              </label>
              <label className="inline-flex items-center gap-1 cursor-pointer text-red-400 font-bold">
                <input type="radio" className="nes-radio is-dark" checked={difficulty === 'hardcore'} onChange={() => setDifficulty('hardcore')} />
                <span>Hardcore</span>
              </label>
            </div>

            <div className="flex justify-between gap-4 pt-4">
              <button type="button" onClick={() => setStep(2)} disabled={loading} className="nes-btn text-xs flex-1">&lt;- BACK</button>
              <button type="submit" disabled={loading || !inputGoal.trim()} className={`nes-btn flex-1 text-xs ${loading ? 'is-disabled' : 'is-error animate-pulse font-bold'}`}>
                {loading ? "[GENERATING PLAN...]" : "[START TRACKING >>]"}
              </button>
            </div>
          </form>
        </PixelContainer>
      )}
    </div>
  );
}
