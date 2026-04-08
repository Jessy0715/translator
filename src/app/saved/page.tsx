"use client";

import { useState } from "react";
import { ArrowLeft, Trash2, Clock, Star, BookOpen } from "lucide-react";
import Link from "next/link";
import { useTranslationHistory } from "@/hooks/useTranslationHistory";
import { useSavedPhrases } from "@/hooks/useSavedPhrases";
import type { HistoryEntry, SavedPhrase, LanguageCode } from "@/types/saved";

const LANGUAGE_LABELS: Record<LanguageCode, string> = {
  zh: "中文",
  en: "英文",
  th: "泰文",
  ja: "日文",
};

function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleString("zh-TW", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 歷史記錄卡片
function HistoryCard({
  entry,
  onSave,
  isSaved,
}: {
  entry: HistoryEntry;
  onSave: () => void;
  isSaved: boolean;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-gray-800 dark:text-white font-medium truncate">
            {entry.inputText}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
              {LANGUAGE_LABELS[entry.sourceLanguage]}
            </span>
            <span className="text-gray-400 text-xs">→</span>
            <span className="text-xs px-2 py-0.5 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded">
              {LANGUAGE_LABELS[entry.targetLanguage]}
            </span>
          </div>
          <p className="text-teal-700 dark:text-teal-300 mt-2">
            {entry.translatedText}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {formatTime(entry.timestamp)}
          </p>
        </div>
        <button
          onClick={onSave}
          className={`p-2 rounded-full transition-colors flex-shrink-0
            ${isSaved
              ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
              : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
            }`}
          title={isSaved ? "已收藏" : "加入收藏"}
        >
          <Star size={18} fill={isSaved ? "currentColor" : "none"} strokeWidth={isSaved ? 0 : 2} />
        </button>
      </div>
    </div>
  );
}

// 收藏短語卡片
function SavedCard({
  phrase,
  onRemove,
}: {
  phrase: SavedPhrase;
  onRemove: () => void;
}) {
  // 決定顯示哪個語言作為主文字（優先顯示有值的）
  const primaryText = phrase.zh || phrase.en || phrase.th || phrase.ja;
  const isPhrasebook = phrase.source === "phrasebook";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs px-2 py-0.5 rounded flex items-center gap-1
                ${isPhrasebook
                  ? "bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                  : "bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400"
                }`}
            >
              {isPhrasebook ? (
                <><BookOpen size={11} /> 手冊</>
              ) : (
                <><Star size={11} fill="currentColor" strokeWidth={0} /> 翻譯</>
              )}
            </span>
            {isPhrasebook && phrase.subcategory && (
              <span className="text-xs text-gray-400 dark:text-gray-500">
                {phrase.subcategory}
              </span>
            )}
          </div>
          <p className="text-gray-800 dark:text-white font-medium">{primaryText}</p>
          {/* 顯示其他有值的語言版本 */}
          <div className="mt-2 space-y-1">
            {(["en", "th", "ja"] as LanguageCode[]).map((lang) =>
              phrase[lang] ? (
                <p key={lang} className="text-sm text-gray-500 dark:text-gray-400 flex gap-2">
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded flex-shrink-0">
                    {LANGUAGE_LABELS[lang]}
                  </span>
                  {phrase[lang]}
                </p>
              ) : null
            )}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            {formatTime(phrase.savedAt)}
          </p>
        </div>
        <button
          onClick={onRemove}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-colors flex-shrink-0"
          title="移除收藏"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
}

export default function SavedPage() {
  const [activeTab, setActiveTab] = useState<"history" | "saved">("history");
  const { history, clearHistory } = useTranslationHistory();
  const { savedPhrases, savePhrase, removePhrase, isSaved } = useSavedPhrases();

  const handleSaveFromHistory = (entry: HistoryEntry) => {
    const id = btoa(encodeURIComponent(entry.inputText + entry.targetLanguage));
    if (isSaved(id)) {
      removePhrase(id);
    } else {
      const phrase = {
        id,
        source: "translation" as const,
        savedAt: Date.now(),
        zh: entry.targetLanguage === "zh" ? entry.translatedText : entry.inputText,
        en: entry.targetLanguage === "en" ? entry.translatedText : "",
        th: entry.targetLanguage === "th" ? entry.translatedText : "",
        ja: entry.targetLanguage === "ja" ? entry.translatedText : "",
        sourceLanguage: entry.sourceLanguage,
        targetLanguage: entry.targetLanguage,
      };
      savePhrase(phrase);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300
                       hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">返回</span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white text-center">
            歷史記錄與收藏
          </h1>
        </header>

        {/* Tab Bar */}
        <div className="flex bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-1 mb-6">
          <button
            onClick={() => setActiveTab("history")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors
              ${activeTab === "history"
                ? "bg-teal-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <Clock size={16} />
            歷史記錄
            {history.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full
                ${activeTab === "history" ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"}`}>
                {history.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-colors
              ${activeTab === "saved"
                ? "bg-teal-600 text-white"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              }`}
          >
            <Star size={16} />
            我的收藏
            {savedPhrases.length > 0 && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full
                ${activeTab === "saved" ? "bg-white/20" : "bg-gray-100 dark:bg-gray-700"}`}>
                {savedPhrases.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "history" && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <Clock size={40} className="mx-auto mb-3 opacity-40" />
                <p>尚無翻譯記錄</p>
                <Link href="/" className="text-teal-600 hover:underline text-sm mt-2 inline-block">
                  前往翻譯
                </Link>
              </div>
            ) : (
              <>
                <div className="flex justify-end">
                  <button
                    onClick={clearHistory}
                    className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={14} />
                    清除全部歷史
                  </button>
                </div>
                {history.map((entry) => (
                  <HistoryCard
                    key={entry.id}
                    entry={entry}
                    isSaved={isSaved(btoa(encodeURIComponent(entry.inputText + entry.targetLanguage)))}
                    onSave={() => handleSaveFromHistory(entry)}
                  />
                ))}
              </>
            )}
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-3">
            {savedPhrases.length === 0 ? (
              <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                <Star size={40} className="mx-auto mb-3 opacity-40" />
                <p>尚無收藏</p>
                <p className="text-sm mt-1">可從翻譯結果或常用語手冊點星收藏</p>
              </div>
            ) : (
              savedPhrases.map((phrase) => (
                <SavedCard
                  key={phrase.id}
                  phrase={phrase}
                  onRemove={() => removePhrase(phrase.id)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
