"use client";
import React, { useEffect, useState } from 'react';
import { usePlayerStore } from '@/store/usePlayerStore';

export const StoryTypewriter: React.FC = () => {
  const { text, isOpen, tone } = usePlayerStore((state) => state.storyDialogue);
  const closeStory = usePlayerStore((state) => state.closeStory);
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setDisplayedText("");
      return;
    }
    let idx = 0;
    setDisplayedText("");
    const timer = setInterval(() => {
      if (idx < text.length) {
        setDisplayedText((prev) => prev + text.charAt(idx));
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 40);
    return () => clearInterval(timer);
  }, [isOpen, text]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
      <div className="nes-container is-dark with-title max-w-xl w-full p-6 border-4 border-white bg-[#121212] shadow-[0_0_20px_#e76f51]">
        <p className="title text-sm font-bold text-[#f4a261]">
          {tone === 'warning' ? '[ABYSS WARNING]' : '[QUEST CHRONICLE]'}
        </p>
        
        <div className="min-h-[80px] my-4 flex items-start gap-4">
          <i className={`nes-icon is-large ${tone === 'warning' ? 'close is-error' : 'trophy is-warning'} animate-bounce`}></i>
          <p className="text-xs md:text-sm leading-loose tracking-wide text-white font-mono flex-1 whitespace-pre-wrap">
            {displayedText}
            <span className="animate-pulse ml-1 text-[#e76f51]">█</span>
          </p>
        </div>

        <div className="text-right mt-6">
          <button onClick={closeStory} className="nes-btn is-primary text-xs px-6">
            CONTINUE &gt;&gt;
          </button>
        </div>
      </div>
    </div>
  );
};
