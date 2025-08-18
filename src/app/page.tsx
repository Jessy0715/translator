"use client";

import { useState, useRef } from "react";
import { Mic, MicOff, Languages, Loader2 } from "lucide-react";

type TargetLanguage = "en" | "lo" | "th";

interface TranslationResult {
  translatedText: string;
  targetLanguage: TargetLanguage;
}

interface SpeechRecognitionEvent {
  results: {
    [key: number]: {
      [key: number]: {
        transcript: string;
      };
    };
  };
}

interface SpeechRecognitionErrorEvent {
  error: string;
}

interface SpeechRecognition {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition: new () => SpeechRecognition;
  webkitSpeechRecognition: new () => SpeechRecognition;
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>("en");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const languageOptions = [
    { value: "en", label: "English (英文)" },
    { value: "lo", label: "Lao (寮語)" },
    { value: "th", label: "Thai (泰語)" }
  ];

  const startVoiceRecognition = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError("您的瀏覽器不支援語音辨識功能");
      return;
    }

    const windowWithSpeech = window as WindowWithSpeechRecognition;
    const SpeechRecognition = windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.lang = "zh-TW";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const speechResult = event.results[0][0].transcript;
      setInputText(speechResult);
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      setError(`語音辨識錯誤: ${event.error}`);
      setIsListening(false);
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current.start();
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError("請輸入要翻譯的文字");
      return;
    }

    setIsTranslating(true);
    setError("");

    try {
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText,
          targetLanguage,
        }),
      });

      if (!response.ok) {
        throw new Error("翻譯請求失敗");
      }

      const data = await response.json();
      setTranslationResult({
        translatedText: data.translatedText,
        targetLanguage,
      });
    } catch {
      setError("翻譯過程中發生錯誤，請稍後再試");
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-900">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            AI 即時翻譯
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            支援中文轉英文、寮語、泰語的智能翻譯工具
          </p>
        </header>

        {/* Main Content */}
        <main className="space-y-6">
          {/* Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <label htmlFor="input-text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              輸入中文文字
            </label>
            <textarea
              id="input-text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="請輸入要翻譯的中文，或點擊麥克風按鈕開始語音輸入..."
              className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-md 
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       dark:bg-gray-700 dark:text-white resize-none"
            />
            
            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {/* Voice Input Button */}
              <button
                onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors
                  ${isListening 
                    ? "bg-red-500 hover:bg-red-600 text-white" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                disabled={isTranslating}
              >
                {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                {isListening ? "停止錄音" : "語音輸入"}
              </button>

              {/* Language Selector */}
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as TargetLanguage)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500"
                disabled={isTranslating}
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              {/* Translate Button */}
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-green-500 text-white 
                         rounded-md hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed
                         transition-colors"
              >
                {isTranslating ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Languages size={20} />
                )}
                {isTranslating ? "翻譯中..." : "開始翻譯"}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                          rounded-md p-4 text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          {/* Translation Result */}
          {translationResult && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                翻譯結果 ({languageOptions.find(l => l.value === translationResult.targetLanguage)?.label})
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <p className="text-gray-800 dark:text-white text-lg leading-relaxed">
                  {translationResult.translatedText}
                </p>
              </div>
            </div>
          )}

          {/* Status Indicator */}
          {isListening && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 
                          rounded-md p-4 text-blue-700 dark:text-blue-300 text-center">
              🎤 正在聆聽您的語音輸入...
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
