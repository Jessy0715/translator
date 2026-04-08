"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Languages, Loader2, X, Undo2, BookOpen, Copy, Check, Volume2, Bookmark } from "lucide-react";
import Link from "next/link";
import { locales, type LocaleKey, type Translations, defaultLocale } from "@/locales";
import { useTranslationHistory } from "@/hooks/useTranslationHistory";
import { useSavedPhrases } from "@/hooks/useSavedPhrases";
import { StarButton } from "@/components/StarButton";
import { LOCALE_OPTIONS, LANGUAGE_KEYS } from "@/constants/options";
import type { LanguageCode } from "@/types/saved";
import type { SpeechRecognitionInstance, SpeechRecognitionEvent, SpeechRecognitionErrorEvent } from "@/types/speech";

interface TranslationResult {
  translatedText: string;
  targetLanguage: LanguageCode;
}

// 從翻譯結果產生穩定的收藏 id
function buildSaveId(inputText: string, targetLanguage: LanguageCode): string {
  return btoa(encodeURIComponent(inputText + targetLanguage));
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>("th");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");
  const [currentLocale, setCurrentLocale] = useState<LocaleKey>(defaultLocale);
  const [lastClearedText, setLastClearedText] = useState("");
  const [showUndoButton, setShowUndoButton] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const { addToHistory } = useTranslationHistory();
  const { savePhrase, removePhrase, isSaved } = useSavedPhrases();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const t: Translations = locales[currentLocale];
  const languageOptions = LANGUAGE_KEYS.map((key) => ({ value: key, label: t.languages[key] }));

  // --- 語音辨識 ---

  const startVoiceRecognition = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);

    if (isMobile && navigator.vibrate) navigator.vibrate(100);

    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setError(isIOSSafari ? t.errors.iosSpeechSupport : t.errors.noSpeechSupport);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError(t.errors.noSpeechSupport);
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = isIOSSafari ? "zh" : "zh-TW";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      setInputText(event.results[0][0].transcript);
      if (isMobile && navigator.vibrate) navigator.vibrate([50, 50, 50]);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      const errorMap: Record<string, string> = {
        "service-not-allowed": t.errors.serviceNotAllowed,
        "not-allowed": t.errors.notAllowed,
        "no-speech": t.errors.noSpeech,
        network: t.errors.network,
        "audio-capture": t.errors.audioCapture,
      };
      setError(
        errorMap[event.error] ??
          (isIOSSafari ? `${t.errors.iosLimited} (${event.error})` : `${t.errors.speechGeneral}: ${event.error}`)
      );
      setIsListening(false);
      if (isMobile && navigator.vibrate) navigator.vibrate(200);
    };

    recognitionRef.current.onend = () => setIsListening(false);

    try {
      recognitionRef.current.start();
    } catch {
      setError(t.errors.cannotStart);
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    recognitionRef.current?.stop();
    setIsListening(false);
  };

  // --- 輸入管理 ---

  const clearInput = () => {
    if (inputText.trim()) {
      setLastClearedText(inputText);
      setShowUndoButton(true);
    }
    setInputText("");
    setTranslationResult(null);
    setError("");
  };

  const undoClear = () => {
    setInputText(lastClearedText);
    setShowUndoButton(false);
    setLastClearedText("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    if (showUndoButton) setShowUndoButton(false);
  };

  // --- 複製到剪貼板 ---

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // --- TTS ---

  const speakTranslation = (text: string, language: LanguageCode) => {
    if (!isClient || !("speechSynthesis" in window)) return;

    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const langCodeMap: Record<LanguageCode, [string, string]> = {
      en: ["en", "en-US"],
      th: ["th", "th-TH"],
      ja: ["ja", "ja-JP"],
      zh: ["zh", "zh-TW"],
    };
    const langCode = langCodeMap[language][isMobile ? 0 : 1];

    speechSynthesis.cancel();
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = langCode;
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const findVoice = () => {
        const voices = speechSynthesis.getVoices();
        const voice =
          language === "th"
            ? voices.find(
                (v) =>
                  ["th-TH", "th-th", "th"].includes(v.lang) ||
                  v.lang.toLowerCase().startsWith("th") ||
                  v.name.toLowerCase().includes("thai")
              )
            : voices.find((v) => v.lang.toLowerCase().startsWith(langCode.split("-")[0]));
        if (voice) utterance.voice = voice;
        speechSynthesis.speak(utterance);
      };

      if (speechSynthesis.getVoices().length === 0) {
        speechSynthesis.addEventListener("voiceschanged", function handler() {
          findVoice();
          speechSynthesis.removeEventListener("voiceschanged", handler);
        });
      } else {
        findVoice();
      }
    }, isMobile ? 200 : 100);
  };

  // --- 翻譯 ---

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError(t.errors.noText);
      return;
    }
    setIsTranslating(true);
    setError("");
    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, targetLanguage }),
      });
      if (!response.ok) throw new Error();
      const data = await response.json();
      setTranslationResult({ translatedText: data.translatedText, targetLanguage });
      addToHistory({
        inputText,
        translatedText: data.translatedText,
        sourceLanguage: (data.sourceLanguage ?? "zh") as LanguageCode,
        targetLanguage,
      });
    } catch {
      setError(t.errors.translationError);
    } finally {
      setIsTranslating(false);
    }
  };

  // --- 收藏翻譯結果 ---

  const handleToggleSave = () => {
    if (!translationResult) return;
    const id = buildSaveId(inputText, translationResult.targetLanguage);
    if (isSaved(id)) {
      removePhrase(id);
    } else {
      const langFields = { zh: "", en: "", th: "", ja: "" };
      langFields[translationResult.targetLanguage] = translationResult.translatedText;
      savePhrase({
        id,
        source: "translation",
        savedAt: Date.now(),
        ...langFields,
        targetLanguage: translationResult.targetLanguage,
      });
    }
  };

  // --- 渲染 ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">{t.title}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{t.subtitle}</p>
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">{t.interfaceLanguage}</label>
            <select
              value={currentLocale}
              onChange={(e) => setCurrentLocale(e.target.value as LocaleKey)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600
                       rounded-md px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                       focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {LOCALE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t.inputLabel}
            </label>
            <div className="relative">
              <textarea
                id="input-text"
                value={inputText}
                onChange={handleInputChange}
                placeholder={t.inputPlaceholder}
                className="w-full h-32 p-3 pr-24 border border-gray-300 dark:border-gray-600 rounded-md
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent
                         dark:bg-gray-700 dark:text-white resize-none"
              />
              <div className="absolute top-3 right-3 flex gap-1">
                {showUndoButton && (
                  <button onClick={undoClear} disabled={isTranslating} title="復原清空"
                    className="p-1 text-amber-600 hover:text-amber-700 dark:hover:text-amber-400 rounded transition-colors">
                    <Undo2 size={20} />
                  </button>
                )}
                {inputText.trim() && !showUndoButton && (
                  <button onClick={clearInput} disabled={isTranslating} title="清空輸入"
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors">
                    <X size={20} />
                  </button>
                )}
                <button
                  onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                  disabled={isTranslating}
                  title={isListening ? "停止語音輸入" : "開始語音輸入"}
                  className={`p-1 rounded transition-colors ${isListening ? "text-red-500 hover:text-red-600" : "text-teal-600 hover:text-teal-700"}`}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              <div className="flex flex-col gap-2">
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
                  disabled={isTranslating}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500"
                >
                  {languageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  將翻譯為：
                  <span className="font-medium text-teal-600 dark:text-teal-400">
                    {languageOptions.find((l) => l.value === targetLanguage)?.label}
                  </span>
                </p>
              </div>

              <button
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 text-white
                         rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isTranslating ? <Loader2 size={20} className="animate-spin" /> : <Languages size={20} />}
                {isTranslating ? t.translating : t.translate}
              </button>

              <Link href="/phrases"
                className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-600 text-white
                         rounded-md hover:bg-slate-700 transition-colors font-medium">
                <BookOpen size={20} />
                {t.phrasebook}
              </Link>

              <Link href="/saved"
                className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-600 text-white
                         rounded-md hover:bg-slate-700 transition-colors font-medium">
                <Bookmark size={20} />
                {t.saved}
              </Link>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Translation Result */}
          {translationResult && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                {t.resultTitle} ({languageOptions.find((l) => l.value === targetLanguage)?.label})
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-start gap-3">
                  <p className="text-gray-800 dark:text-white text-lg leading-relaxed flex-1">
                    {translationResult.translatedText}
                  </p>
                  <div className="flex gap-1 flex-shrink-0">
                    <StarButton
                      isSaved={isSaved(buildSaveId(inputText, translationResult.targetLanguage))}
                      onToggle={handleToggleSave}
                    />
                    <button onClick={() => copyToClipboard(translationResult.translatedText)}
                      title="複製翻譯結果"
                      className="p-2 text-teal-600 hover:text-teal-700 dark:text-teal-400
                               dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 rounded-full transition-colors">
                      {isCopied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                    <button onClick={() => speakTranslation(translationResult.translatedText, translationResult.targetLanguage)}
                      title="播放翻譯語音"
                      className="p-2 text-slate-600 hover:text-slate-700 dark:text-slate-400
                               dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 rounded-full transition-colors">
                      <Volume2 size={20} />
                    </button>
                  </div>
                </div>
                {isCopied && (
                  <div className="mt-2 text-sm text-teal-600 dark:text-teal-400">✓ 已複製到剪貼板</div>
                )}
              </div>
            </div>
          )}

          {/* Listening Status */}
          {isListening && (
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 rounded-md p-4 text-teal-700 dark:text-teal-300 text-center">
              {t.listeningStatus}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
