"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Languages, Loader2, Globe, X, Undo2, BookOpen, Copy, Check, Volume2 } from "lucide-react";
import Link from "next/link";
import { locales, type LocaleKey, type Translations, defaultLocale } from "@/locales";

type TargetLanguage = "en" | "zh" | "th";

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

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export default function Home() {
  const [inputText, setInputText] = useState("");
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [targetLanguage, setTargetLanguage] = useState<TargetLanguage>("th");
  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState("");
  const [currentLocale, setCurrentLocale] = useState<LocaleKey>(defaultLocale);
  const [lastClearedText, setLastClearedText] = useState("");
  const [showUndoButton, setShowUndoButton] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const t: Translations = locales[currentLocale];

  const languageOptions = [
    { value: "en", label: t.languages.en },
    { value: "zh", label: t.languages.zh },
    { value: "th", label: t.languages.th }
  ];
  
  const localeOptions = [
    { value: "zh", label: "中文" },
    { value: "en", label: "English" },
    { value: "th", label: "ไทย" }
  ];

  const startVoiceRecognition = () => {
    // 檢查是否為移動設備
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOSSafari = /iPad|iPhone|iPod/.test(navigator.userAgent) && !('MSStream' in window);
    
    // 手機震動效果
    if (isMobile && navigator.vibrate) {
      // 短震動表示開始錄音 (100ms)
      navigator.vibrate(100);
    }
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      if (isIOSSafari) {
        setError(t.errors.iosSpeechSupport);
      } else {
        setError(t.errors.noSpeechSupport);
      }
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setError(t.errors.noSpeechSupport);
      return;
    }
    
    recognitionRef.current = new SpeechRecognition();
    
    // iOS 特殊設定
    recognitionRef.current.lang = "zh-TW";
    recognitionRef.current.interimResults = false;
    recognitionRef.current.maxAlternatives = 1;
    
    // iOS 需要更寬鬆的設定
    if (isIOSSafari) {
      recognitionRef.current.lang = "zh";  // iOS 使用較簡單的語言代碼
    }

    recognitionRef.current.onstart = () => {
      setIsListening(true);
      setError("");
    };

    recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
      const speechResult = event.results[0][0].transcript;
      setInputText(speechResult);
      
      // 識別成功時的震動反饋
      if (isMobile && navigator.vibrate) {
        // 雙短震表示識別成功 (50ms, 50ms 暫停, 50ms)
        navigator.vibrate([50, 50, 50]);
      }
    };

    recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = "";
      
      switch (event.error) {
        case "service-not-allowed":
          errorMessage = "語音辨識服務被拒絕。請檢查瀏覽器權限設定，或嘗試在設定中允許麥克風存取";
          break;
        case "not-allowed":
          errorMessage = "麥克風權限被拒絕。請在瀏覽器設定中允許此網站使用麥克風";
          break;
        case "no-speech":
          errorMessage = "未偵測到語音輸入，請再試一次";
          break;
        case "network":
          errorMessage = "網路連線問題，請檢查網路連線";
          break;
        case "audio-capture":
          errorMessage = "無法存取麥克風，請確認麥克風已連接且正常運作";
          break;
        default:
          if (isIOSSafari) {
            errorMessage = `iOS Safari 語音功能受限 (${event.error})。建議：1.檢查「設定→Safari→麥克風」權限 2.嘗試使用其他瀏覽器如 Chrome`;
          } else {
            errorMessage = `語音辨識錯誤: ${event.error}`;
          }
      }
      
      setError(errorMessage);
      setIsListening(false);
      
      // 錯誤時的震動反饋
      if (isMobile && navigator.vibrate) {
        // 長震動表示錯誤 (200ms)
        navigator.vibrate(200);
      }
    };

    recognitionRef.current.onend = () => {
      setIsListening(false);
    };

    // 使用 try-catch 包裹 start() 方法
    try {
      recognitionRef.current.start();
    } catch (error) {
      setError("無法啟動語音辨識，請確認瀏覽器權限設定");
      setIsListening(false);
    }
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  };

  const clearInput = () => {
    // 只有在有文字時才保存並顯示復原按鈕
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

  // 監聽手動輸入變化，隱藏復原按鈕
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputText(e.target.value);
    // 如果使用者手動修改文字，隱藏復原按鈕
    if (showUndoButton) {
      setShowUndoButton(false);
    }
  };

  // 複製到剪貼板
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // 2秒後隱藏複製成功狀態
    } catch (error) {
      // 如果 clipboard API 不可用，使用舊方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (fallbackError) {
        console.error('複製失敗:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  // TTS 語音播放功能
  const speakTranslation = (text: string, language: TargetLanguage) => {
    if (!isClient || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // 偵測移動設備
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // 清除之前的語音
    speechSynthesis.cancel();
    
    const delay = isMobile ? 200 : 100;
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 設定語言
      let langCode = '';
      switch (language) {
        case 'en':
          langCode = isMobile ? 'en' : 'en-US';
          break;
        case 'th':
          langCode = isMobile ? 'th' : 'th-TH';
          break;
        case 'zh':
        default:
          langCode = isMobile ? 'zh' : 'zh-TW';
          break;
      }
      
      utterance.lang = langCode;
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      // 尋找合適的語音
      const findVoice = () => {
        const voices = speechSynthesis.getVoices();
        let selectedVoice = null;
        
        if (language === 'th') {
          // 泰語特殊處理
          selectedVoice = voices.find(voice => 
            voice.lang === 'th-TH' || 
            voice.lang === 'th-th' || 
            voice.lang === 'th' ||
            voice.lang.toLowerCase().startsWith('th') ||
            voice.name.toLowerCase().includes('thai')
          );
        } else {
          // 其他語言通用搜尋
          const langPrefix = langCode.split('-')[0];
          selectedVoice = voices.find(voice => voice.lang.toLowerCase().startsWith(langPrefix));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
        }
        
        speechSynthesis.speak(utterance);
      };
      
      // 如果語音列表未準備好，等待載入
      if (speechSynthesis.getVoices().length === 0) {
        const handleVoicesChanged = () => {
          findVoice();
          speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        };
        speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      } else {
        findVoice();
      }
    }, delay);
  };

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
      setError(t.errors.translationError);
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            {t.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {t.subtitle}
          </p>
          {/* Interface Language Switcher */}
          <div className="flex flex-col items-center gap-2">
            <label className="text-sm text-gray-600 dark:text-gray-400">
              {t.interfaceLanguage}
            </label>
            <select
              value={currentLocale}
              onChange={(e) => setCurrentLocale(e.target.value as LocaleKey)}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                       rounded-md px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                       focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              {localeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
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
              
              {/* Icons in textarea */}
              <div className="absolute top-3 right-3 flex gap-1">
                {/* Undo button - only show after clearing with X button */}
                {showUndoButton && (
                  <button
                    onClick={undoClear}
                    className="p-1 text-amber-600 hover:text-amber-700 dark:hover:text-amber-400 
                             rounded transition-colors"
                    disabled={isTranslating}
                    title="復原清空"
                  >
                    <Undo2 size={20} />
                  </button>
                )}
                
                {/* Clear button - only show when there's text and no undo button */}
                {inputText.trim() && !showUndoButton && (
                  <button
                    onClick={clearInput}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 
                             rounded transition-colors"
                    disabled={isTranslating}
                    title="清空輸入"
                  >
                    <X size={20} />
                  </button>
                )}
                
                {/* Voice button */}
                <button
                  onClick={isListening ? stopVoiceRecognition : startVoiceRecognition}
                  className={`p-1 rounded transition-colors
                    ${isListening 
                      ? "text-red-500 hover:text-red-600" 
                      : "text-teal-600 hover:text-teal-700"
                    }`}
                  disabled={isTranslating}
                  title={isListening ? "停止語音輸入" : "開始語音輸入"}
                >
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </button>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-4">
              {/* Translation Target Language Selector */}
              <div className="flex flex-col gap-2">
                <select
                  value={targetLanguage}
                  onChange={(e) => setTargetLanguage(e.target.value as TargetLanguage)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                           dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-teal-500"
                  disabled={isTranslating}
                >
                  {languageOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  將翻譯為：<span className="font-medium text-teal-600 dark:text-teal-400">
                    {languageOptions.find(l => l.value === targetLanguage)?.label}
                  </span>
                </p>
              </div>

              {/* Translate Button */}
              <button
                onClick={handleTranslate}
                disabled={isTranslating || !inputText.trim()}
                className="flex items-center justify-center gap-2 px-6 py-2 bg-teal-600 text-white 
                         rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed
                         transition-colors"
              >
                {isTranslating ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <Languages size={20} />
                )}
                {isTranslating ? t.translating : t.translate}
              </button>

              {/* Phrasebook Button */}
              <Link
                href="/phrases"
                className="flex items-center justify-center gap-2 px-6 py-2 bg-slate-600 text-white 
                         rounded-md hover:bg-slate-700 transition-colors font-medium"
              >
                <BookOpen size={20} />
                {t.phrasebook}
              </Link>
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
{t.resultTitle} ({languageOptions.find(l => l.value === targetLanguage)?.label})
              </h3>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="flex items-start gap-3">
                  <p className="text-gray-800 dark:text-white text-lg leading-relaxed flex-1">
                    {translationResult.translatedText}
                  </p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => copyToClipboard(translationResult.translatedText)}
                      className="p-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 
                               dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 
                               rounded-full transition-colors"
                      title="複製翻譯結果"
                    >
                      {isCopied ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                    
                    <button
                      onClick={() => speakTranslation(translationResult.translatedText, translationResult.targetLanguage)}
                      className="p-2 text-slate-600 hover:text-slate-700 dark:text-slate-400 
                               dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 
                               rounded-full transition-colors"
                      title="播放翻譯語音"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                </div>
                {isCopied && (
                  <div className="mt-2 text-sm text-teal-600 dark:text-teal-400">
                    ✓ 已複製到剪貼板
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Status Indicator */}
          {isListening && (
            <div className="bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 
                          rounded-md p-4 text-teal-700 dark:text-teal-300 text-center">
{t.listeningStatus}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
