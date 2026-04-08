"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowLeftRight, Volume2, Copy, Check } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

// 常用語資料
const phrasesData = {
  airport: {
    titleZh: "機場與交通",
    titleEn: "Airport and Transportation",
    titleTh: "สนามบินและการขนส่ง",
    titleJa: "空港と交通",
    categories: [
      {
        titleZh: "詢問方向",
        titleEn: "Asking for Directions",
        titleTh: "การถามทิศทาง",
        titleJa: "道案内",
        phrases: [
          {
            zh: "不好意思，請問服務台在哪裡？",
            en: "Excuse me, where is the information desk?",
            th: "ขอโทษครับ/ค่ะ เคาน์เตอร์ข้อมูลอยู่ที่ไหนครับ/คะ",
            ja: "すみません、インフォメーションデスクはどこですか？"
          },
          {
            zh: "請問如何前往市中心？",
            en: "How do I get to the city center?",
            th: "ไปใจกลางเมืองยังไงครับ/คะ",
            ja: "市内中心部へはどうやって行けばいいですか？"
          },
          {
            zh: "這輛公車是開往機場的嗎？",
            en: "Is this the bus to the airport?",
            th: "รถเมล์คันนี้ไปสนามบินใช่ไหมครับ/คะ",
            ja: "このバスは空港行きですか？"
          }
        ]
      },
      {
        titleZh: "搭乘計程車",
        titleEn: "Taking Taxi",
        titleTh: "การเรียกแท็กซี่",
        titleJa: "タクシーに乗る",
        phrases: [
          {
            zh: "請載我到這個地址。",
            en: "Please take me to this address.",
            th: "กรุณาไปที่อยู่นี้ครับ/ค่ะ",
            ja: "この住所まで連れて行ってください。"
          },
          {
            zh: "您能在這裡等我一下嗎？",
            en: "Could you wait for me here?",
            th: "รอผมหน่อยได้ไหมครับ/คะ",
            ja: "ここで少し待っていただけますか？"
          },
          {
            zh: "請在這裡讓我下車。",
            en: "Please drop me off here.",
            th: "ให้ผมลงตรงนี้ครับ/ค่ะ",
            ja: "ここで降ろしてください。"
          }
        ]
      }
    ]
  },
  accommodation: {
    titleZh: "住宿",
    titleEn: "Accommodation",
    titleTh: "ที่พัก",
    titleJa: "宿泊",
    categories: [
      {
        titleZh: "入住與退房",
        titleEn: "Check-in and Check-out",
        titleTh: "เช็คอินและเช็คเอาท์",
        titleJa: "チェックインとチェックアウト",
        phrases: [
          {
            zh: "我有一個預約，預約人姓名是[你的名字]。",
            en: "I have a reservation under the name [Your Name].",
            th: "ผมจองไว้ชื่อ [ชื่อของคุณ] ครับ/ค่ะ",
            ja: "[あなたの名前]の名前で予約しています。"
          },
          {
            zh: "退房時間是幾點？",
            en: "What time is check-out?",
            th: "เช็คเอาท์กี่โมงครับ/คะ",
            ja: "チェックアウトは何時ですか？"
          },
          {
            zh: "可以請您在早上七點叫我起床嗎？",
            en: "Could I have a wake-up call at 7 a.m.?",
            th: "ช่วยปลุกตอนเช้าตีเจ็ดได้ไหมครับ/คะ",
            ja: "朝7時にモーニングコールをお願いできますか？"
          }
        ]
      },
      {
        titleZh: "請求協助",
        titleEn: "Requesting Help",
        titleTh: "ขอความช่วยเหลือ",
        titleJa: "サポートのお願い",
        phrases: [
          {
            zh: "這把鑰匙打不開門。",
            en: "The key doesn't work.",
            th: "กุญแจใช้ไม่ได้ครับ/ค่ะ",
            ja: "鍵が開きません。"
          },
          {
            zh: "可以請您幫我搬行李嗎？",
            en: "Could you please help me with my luggage?",
            th: "ช่วยยกกระเป๋าให้หน่อยได้ไหมครับ/คะ",
            ja: "荷物を運ぶのを手伝っていただけますか？"
          },
          {
            zh: "附近有自助洗衣店嗎？",
            en: "Is there a laundromat nearby?",
            th: "แถวนี้มีร้านซักรีดไหมครับ/คะ",
            ja: "近くにコインランドリーはありますか？"
          }
        ]
      }
    ]
  },
  dining: {
    titleZh: "用餐",
    titleEn: "Dining",
    titleTh: "การรับประทานอาหาร",
    titleJa: "食事",
    categories: [
      {
        titleZh: "點餐",
        titleEn: "Ordering Food",
        titleTh: "การสั่งอาหาร",
        titleJa: "注文する",
        phrases: [
          {
            zh: "請問有英文菜單嗎？",
            en: "Do you have a menu in English?",
            th: "มีเมนูภาษาอังกฤษไหมครับ/คะ",
            ja: "英語のメニューはありますか？"
          },
          {
            zh: "我想點[菜名]。",
            en: "I would like to order [Name of dish].",
            th: "ผมอยากได้ [ชื่ออาหาร] ครับ/ค่ะ",
            ja: "[料理名]を注文したいのですが。"
          },
          {
            zh: "可以給我一杯水嗎？",
            en: "Can I have a glass of water, please?",
            th: "ขอน้ำหนึ่งแก้วได้ไหมครับ/คะ",
            ja: "お水を一杯いただけますか？"
          }
        ]
      },
      {
        titleZh: "用餐後",
        titleEn: "After Dining",
        titleTh: "หลังการรับประทานอาหาร",
        titleJa: "食後",
        phrases: [
          {
            zh: "麻煩結帳。",
            en: "Could we have the check, please?",
            th: "เก็บเงินครับ/ค่ะ",
            ja: "お会計をお願いします。"
          },
          {
            zh: "小費有包含在帳單裡嗎？",
            en: "Is the tip included?",
            th: "ค่าทิปรวมในบิลแล้วไหมครับ/คะ",
            ja: "チップはこの金額に含まれていますか？"
          },
          {
            zh: "這個很好吃！",
            en: "This is delicious!",
            th: "อร่อยมากเลยครับ/ค่ะ",
            ja: "これはとても美味しいです！"
          }
        ]
      }
    ]
  },
  shopping: {
    titleZh: "購物",
    titleEn: "Shopping",
    titleTh: "ช้อปปิ้ง",
    titleJa: "ショッピング",
    categories: [
      {
        titleZh: "詢問價格",
        titleEn: "Asking About Price",
        titleTh: "ถามราคา",
        titleJa: "値段を聞く",
        phrases: [
          {
            zh: "這個多少錢？",
            en: "How much is this?",
            th: "อันนี้เท่าไหร่ครับ/คะ",
            ja: "これはいくらですか？"
          },
          {
            zh: "你們接受信用卡嗎？",
            en: "Do you accept credit cards?",
            th: "รับบัตรเครดิตไหมครับ/คะ",
            ja: "クレジットカードは使えますか？"
          },
          {
            zh: "這個有打折嗎？",
            en: "Is there a discount on this?",
            th: "อันนี้มีส่วนลดไหมครับ/คะ",
            ja: "これは割引がありますか？"
          }
        ]
      },
      {
        titleZh: "其他",
        titleEn: "Others",
        titleTh: "อื่นๆ",
        titleJa: "その他",
        phrases: [
          {
            zh: "我能試穿這個嗎？",
            en: "Could I try this on?",
            th: "ลองใส่ได้ไหมครับ/คะ",
            ja: "これを試着してもいいですか？"
          },
          {
            zh: "我只是看看，謝謝。",
            en: "I'm just looking, thank you.",
            th: "แค่ดูครับ/ค่ะ ขอบคุณครับ/ค่ะ",
            ja: "ただ見ているだけです、ありがとうございます。"
          },
          {
            zh: "可以幫我包裝起來嗎？",
            en: "Could you wrap this up for me?",
            th: "ช่วยห่อให้หน่อยได้ไหมครับ/คะ",
            ja: "包んでいただけますか？"
          }
        ]
      }
    ]
  },
  emergency: {
    titleZh: "緊急狀況與一般實用片語",
    titleEn: "Emergencies and General Phrases",
    titleTh: "เหตุฉุกเฉินและวลีที่ใช้ทั่วไป",
    titleJa: "緊急事態と一般フレーズ",
    categories: [
      {
        titleZh: "尋求協助",
        titleEn: "Seeking Help",
        titleTh: "ขอความช่วยเหลือ",
        titleJa: "助けを求める",
        phrases: [
          {
            zh: "救命！",
            en: "Help!",
            th: "ช่วยด้วย!",
            ja: "助けてください！"
          },
          {
            zh: "我需要看醫生。",
            en: "I need a doctor.",
            th: "ผมต้องการหาหมอครับ/ค่ะ",
            ja: "医者が必要です。"
          },
          {
            zh: "我迷路了。",
            en: "I am lost.",
            th: "ผมหลงทางครับ/ค่ะ",
            ja: "道に迷いました。"
          }
        ]
      },
      {
        titleZh: "日常問候",
        titleEn: "Daily Greetings",
        titleTh: "การทักทาย",
        titleJa: "日常の挨拶",
        phrases: [
          {
            zh: "你好。",
            en: "Hello / Hi.",
            th: "สวัสดีครับ/ค่ะ",
            ja: "こんにちは。"
          },
          {
            zh: "謝謝。",
            en: "Thank you.",
            th: "ขอบคุณครับ/ค่ะ",
            ja: "ありがとうございます。"
          },
          {
            zh: "不好意思。",
            en: "Excuse me.",
            th: "ขอโทษครับ/ค่ะ",
            ja: "すみません。"
          },
          {
            zh: "對不起。",
            en: "I'm sorry.",
            th: "ขอโทษครับ/ค่ะ",
            ja: "ごめんなさい。"
          },
          {
            zh: "洗手間在哪裡？",
            en: "Where is the restroom?",
            th: "ห้องน้ำอยู่ที่ไหนครับ/คะ",
            ja: "トイレはどこですか？"
          }
        ]
      }
    ]
  }
};

type LanguageCode = 'zh' | 'en' | 'th' | 'ja';

export default function CategoryPage() {
  const params = useParams();
  const categoryId = params.category as string;
  const [sourceLanguage, setSourceLanguage] = useState<LanguageCode>('zh');
  const [targetLanguage, setTargetLanguage] = useState<LanguageCode>('th');
  const [copiedItem, setCopiedItem] = useState<string>('');
  const [isClient, setIsClient] = useState(false);
  
  const categoryData = phrasesData[categoryId as keyof typeof phrasesData];

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!categoryData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            分類不存在
          </h1>
          <Link href="/phrases" className="text-teal-600 hover:underline">
            返回常用語手冊
          </Link>
        </div>
      </div>
    );
  }

  const languageOptions = [
    { value: 'zh', label: '中文' },
    { value: 'en', label: '英文' },
    { value: 'th', label: '泰文' },
    { value: 'ja', label: '日文' }
  ];

  // 交換來源語言與目標語言
  const swapLanguages = () => {
    const temp = sourceLanguage;
    setSourceLanguage(targetLanguage);
    setTargetLanguage(temp);
  };

  // 複製到剪貼板
  const copyToClipboard = async (text: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(itemId);
      setTimeout(() => setCopiedItem(''), 2000); // 2秒後清除複製狀態
    } catch (error) {
      // 如果 clipboard API 不可用，使用舊方法
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        setCopiedItem(itemId);
        setTimeout(() => setCopiedItem(''), 2000);
      } catch (fallbackError) {
        console.error('複製失敗:', fallbackError);
      }
      document.body.removeChild(textArea);
    }
  };

  const speakText = (text: string, language: LanguageCode) => {
    // 確保只在客戶端執行
    if (!isClient || typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return;
    }

    // 偵測移動設備
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

    // 清除之前的語音
    speechSynthesis.cancel();
    
    // 移動設備需要更長的延遲
    const delay = isMobile ? 200 : 100;
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // 設定基本語言屬性（針對移動設備優化）
      let langCode = '';
      switch (language) {
        case 'en':
          langCode = isMobile ? 'en' : 'en-US';
          break;
        case 'th':
          langCode = isMobile ? 'th' : 'th-TH';
          break;
        case 'ja':
          langCode = isMobile ? 'ja' : 'ja-JP';
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
        
        // 除錯：列出所有可用語音（僅在開發環境顯示）
        if (process.env.NODE_ENV === 'development') {
          console.log('所有可用語音:');
          voices.forEach((voice, index) => {
            console.log(`${index}: ${voice.name} (${voice.lang}) - ${voice.localService ? 'Local' : 'Remote'}`);
          });
        }
        
        let selectedVoice = null;
        
        // 對於泰語，使用多重搜尋策略
        if (language === 'th') {
          console.log('嘗試搜尋泰語語音...');
          
          // 策略1: 精確匹配 th-TH, th-th, th
          selectedVoice = voices.find(voice => 
            voice.lang === 'th-TH' || 
            voice.lang === 'th-th' || 
            voice.lang === 'th'
          );
          if (selectedVoice) {
            console.log(`策略1成功: ${selectedVoice.name} (${selectedVoice.lang})`);
          }
          
          // 策略2: 語言代碼開頭匹配
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => voice.lang.toLowerCase().startsWith('th'));
            if (selectedVoice) {
              console.log(`策略2成功: ${selectedVoice.name} (${selectedVoice.lang})`);
            }
          }
          
          // 策略3: 語音名稱包含關鍵字
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => 
              voice.name.toLowerCase().includes('thai') ||
              voice.name.toLowerCase().includes('ไทย') ||
              voice.lang.toLowerCase().includes('thai')
            );
            if (selectedVoice) {
              console.log(`策略3成功: ${selectedVoice.name} (${selectedVoice.lang})`);
            }
          }
          
          // 策略4: Google 語音 (通常命名為 "Google xxxx")
          if (!selectedVoice) {
            selectedVoice = voices.find(voice => 
              voice.name.toLowerCase().includes('google') && 
              (voice.lang.toLowerCase().includes('th') || voice.name.toLowerCase().includes('thai'))
            );
            if (selectedVoice) {
              console.log(`策略4成功: ${selectedVoice.name} (${selectedVoice.lang})`);
            }
          }
        } else {
          // 其他語言的通用搜尋
          const langPrefix = langCode.split('-')[0];
          selectedVoice = voices.find(voice => voice.lang.toLowerCase().startsWith(langPrefix));
        }
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          console.log(`✅ 使用語音: ${selectedVoice.name} (${selectedVoice.lang}) 播放文字: "${text}"`);
          return true;
        } else {
          if (language === 'th') {
            if (isMobile) {
              console.warn(`❌ 手機未找到泰語語音`);
              console.log(`建議解決方案：`);
              if (isIOS) {
                console.log(`iOS: 設定 → 一般 → 輔助使用 → 語音朗讀 → 聲音 → 新增泰語`);
              } else {
                console.log(`Android: 設定 → 語言與輸入法 → 文字轉語音輸出 → 新增泰語語音`);
              }
            } else {
              console.warn(`❌ 系統未安裝泰語語音包`);
              console.log(`建議解決方案：`);
              console.log(`1. Windows: 前往設定 → 時間與語言 → 語音 → 新增語音`);
              console.log(`2. 或使用線上翻譯工具如 Google 翻譯進行泰語發音`);
            }
          } else {
            console.warn(`❌ 找不到 ${language} (${langCode}) 語音，將使用系統預設語音`);
          }
          console.log(`總共有 ${voices.length} 個可用語音，設備類型: ${isMobile ? '手機' : '電腦'}`);
          return false;
        }
      };
      
      // 如果語音列表未準備好，等待載入
      if (speechSynthesis.getVoices().length === 0) {
        const handleVoicesChanged = () => {
          findVoice();
          speechSynthesis.speak(utterance);
          speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        };
        speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      } else {
        findVoice();
        speechSynthesis.speak(utterance);
      }
    }, delay);
  };

  const getCategoryTitle = () => {
    switch (sourceLanguage) {
      case 'en':
        return categoryData.titleEn;
      case 'th':
        return categoryData.titleTh;
      case 'ja':
        return categoryData.titleJa;
      default:
        return categoryData.titleZh;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header with Back Button */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/phrases"
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 
                       hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">返回</span>
            </Link>
          </div>

          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-2">
              {getCategoryTitle()}
            </h1>
          </div>

          {/* Language Switcher */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
            <div className="flex items-center justify-center gap-4">
              <select
                value={sourceLanguage}
                onChange={(e) => setSourceLanguage(e.target.value as LanguageCode)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              
              <button
                onClick={swapLanguages}
                className="p-2 text-teal-600 dark:text-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/20 
                         rounded-full transition-colors"
                title="交換語言"
              >
                <ArrowLeftRight size={24} />
              </button>
              
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value as LanguageCode)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        {/* Phrases List */}
        <main className="space-y-8">
          {categoryData.categories.map((subcategory, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                {sourceLanguage === 'en' ? subcategory.titleEn :
                 sourceLanguage === 'th' ? subcategory.titleTh :
                 sourceLanguage === 'ja' ? subcategory.titleJa :
                 subcategory.titleZh}
              </h2>
              
              <div className="space-y-4">
                {subcategory.phrases.map((phrase, phraseIndex) => (
                  <div key={phraseIndex} className="border-l-4 border-teal-400 pl-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-r-md">
                    <div className="mb-2">
                      <p className="text-gray-800 dark:text-white font-medium">
                        {phrase[sourceLanguage]}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <p className="text-gray-600 dark:text-gray-300 flex-1">
                        {phrase[targetLanguage]}
                      </p>
                      
                      <div className="flex gap-1">
                        <button
                          onClick={() => copyToClipboard(phrase[targetLanguage], `${index}-${phraseIndex}-target`)}
                          className="p-2 text-slate-500 hover:text-slate-600 dark:text-slate-400 
                                   dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900/20 
                                   rounded-full transition-colors"
                          title="複製譯文"
                        >
                          {copiedItem === `${index}-${phraseIndex}-target` ? <Check size={18} /> : <Copy size={18} />}
                        </button>
                        
                        <button
                          onClick={() => speakText(phrase[targetLanguage], targetLanguage)}
                          className="p-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 
                                   dark:hover:text-teal-300 hover:bg-teal-50 dark:hover:bg-teal-900/20 
                                   rounded-full transition-colors"
                          title="播放發音"
                        >
                          <Volume2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}