"use client";
import React from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';

export const PlayerStatusBar: React.FC = () => {
  const player = usePlayerStore((state) => state.player);

  return (
    <div className="nes-container is-dark p-4 my-4 border-2 border-white bg-[#121212]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 pb-3 border-b-2 border-gray-700">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-black border-2 border-[#f4a261] p-1 flex items-center justify-center shadow-[0_0_10px_#f4a261]">
            <img src={player.avatar_url} alt="User Avatar" className="w-full h-full object-contain image-pixelated" />
          </div>
          <div>
            <h2 className="text-base md:text-lg text-[#f4a261] font-bold tracking-wide flex items-center gap-2">
              <span className="mario-star inline-block"><i className="nes-icon star"></i></span>
              {player.name}
            </h2>
            <p className="text-xs text-gray-400 mt-1">STATUS: [ACTIVE TRACKER]</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="nes-text is-warning text-sm font-bold flex items-center gap-1">
            <span className="mario-star inline-block"><i className="nes-icon star"></i></span> LEVEL {player.level}
          </span>
          <span className="nes-text is-success text-sm font-bold flex items-center gap-1">
            <i className="nes-icon coin is-small"></i> {player.coins} COINS
          </span>
        </div>
      </div>

      <div className="text-xs">
        {/* EXP Bar */}
        <div className="flex justify-between mb-1 items-center">
          <span className="text-yellow-400 font-bold flex items-center gap-1">
            [PROGRESS / EXP]
          </span>
          <span className="font-mono">{player.exp} / {player.next_level_exp} EXP</span>
        </div>
        <progress className="nes-progress is-warning w-full h-6" value={player.exp} max={player.next_level_exp}></progress>
      </div>
    </div>
  );
};
