"use client";

import { Star } from "lucide-react";

interface StarButtonProps {
  isSaved: boolean;
  onToggle: () => void;
  size?: number;
}

export function StarButton({ isSaved, onToggle, size = 20 }: StarButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`p-2 rounded-full transition-colors
        ${isSaved
          ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
          : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
        }`}
      title={isSaved ? "取消收藏" : "加入收藏"}
    >
      <Star
        size={size}
        fill={isSaved ? "currentColor" : "none"}
        strokeWidth={isSaved ? 0 : 2}
      />
    </button>
  );
}
