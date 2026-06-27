"use client";
import React from 'react';
import Link from 'next/link';

interface QuestCardProps {
  id: string;
  title: string;
  description: string;
  xpReward: number;
  mpReward?: number;
  isBoss?: boolean;
  isCompleted?: boolean;
  scheduledDate?: string;
  completedAt?: string;
}

export const QuestCard: React.FC<QuestCardProps> = ({
  id,
  title,
  description,
  xpReward,
  isBoss = false,
  isCompleted = false,
  scheduledDate,
  completedAt,
}) => {
  const shortDate = scheduledDate ? scheduledDate.slice(5) : '';
  const shortComplete = completedAt ? completedAt.slice(5) : '';

  return (
    <div className={`nes-container is-dark p-3 my-2 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-transform hover:scale-[1.01] ${isBoss ? 'border-red-500 bg-[#251010]' : isCompleted ? 'border-green-600 bg-[#0d1f12]/80 opacity-75' : 'border-white bg-[#161616]'}`}>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {isCompleted ? (
            <span className="text-[10px] text-green-400 font-mono bg-black px-1.5 py-0.5 border border-green-600 font-bold">
              [OK: {shortComplete}]
            </span>
          ) : shortDate ? (
            <span className="text-[10px] text-yellow-400 font-mono bg-black px-1.5 py-0.5 border border-yellow-600 font-bold">
              [DUE: {shortDate}]
            </span>
          ) : null}
          
          {isBoss && <span className="text-[10px] text-red-400 font-bold">[BOSS]</span>}
        </div>

        <h3 className={`text-xs md:text-sm font-bold truncate ${isCompleted ? 'text-green-300 line-through' : 'text-white'}`}>
          {title}
        </h3>
        <p className="text-[11px] text-gray-400 truncate mt-0.5">{description}</p>
      </div>

      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t border-gray-800 sm:border-0 shrink-0">
        <div className="text-xs text-right font-mono font-bold text-yellow-400">
          +{xpReward} XP
        </div>

        {isCompleted ? (
          <span className="text-[10px] text-gray-500 font-mono px-2 py-1">[DONE]</span>
        ) : (
          <Link href={`/quest/${id}`} className={`nes-btn text-[10px] px-2 py-1 ${isBoss ? 'is-error animate-pulse font-bold' : 'is-primary'}`}>
            [ENTER &gt;]
          </Link>
        )}
      </div>
    </div>
  );
};
