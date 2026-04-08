import { NextRequest, NextResponse } from 'next/server';

interface TranslateRequest {
  text: string;
  targetLanguage: string;
}

interface MyMemoryResponse {
  responseData: {
    translatedText: string;
    match: number;
  };
  quotaFinished: boolean;
  mtLangSupported: boolean;
  responseDetails: string;
  responseStatus: number;
  responderId: string;
  exception_code: string | null;
  matches: Array<{
    id: string;
    segment: string;
    translation: string;
    source: string;
    target: string;
    quality: number;
    reference: string;
    'usage-count': number;
    subject: string;
    'created-by': string;
    'last-updated-by': string;
    'create-date': string;
    'last-update-date': string;
    match: number;
  }>;
}

// 改用 MyMemory Translation API - 完全免費，無需註冊
const MYMEMORY_URL = 'https://api.mymemory.translated.net/get';

const languageMap: Record<string, string> = {
  en: 'en',
  zh: 'zh',  // 中文
  th: 'th',
  ja: 'ja'   // 日文
};

export async function POST(request: NextRequest) {
  try {
    const body: TranslateRequest = await request.json();
    
    if (!body.text || !body.targetLanguage) {
      return NextResponse.json(
        { error: '缺少必要參數：text 或 targetLanguage' },
        { status: 400 }
      );
    }

    const { text, targetLanguage } = body;
    
    if (!languageMap[targetLanguage]) {
      return NextResponse.json(
        { error: '不支援的目標語言' },
        { status: 400 }
      );
    }

    const targetLang = languageMap[targetLanguage];
    
    // 簡單的語言偵測邏輯
    const detectSourceLanguage = (text: string): string => {
      // 檢測日文假名（平假名、片假名）- 需在中文前偵測，因漢字重疊
      const japaneseRegex = /[\u3040-\u309f\u30a0-\u30ff]/;
      // 檢測中文字符（中日韓統一表意文字）
      const chineseRegex = /[\u4e00-\u9fff]/;
      // 檢測泰文字符
      const thaiRegex = /[\u0e00-\u0e7f]/;

      if (japaneseRegex.test(text)) {
        return 'ja';
      } else if (chineseRegex.test(text)) {
        return 'zh';
      } else if (thaiRegex.test(text)) {
        return 'th';
      } else {
        // 預設為英文
        return 'en';
      }
    };
    
    const sourceLang = detectSourceLanguage(text);
    
    // 如果來源語言和目標語言相同，直接返回原文
    if (sourceLang === targetLang) {
      return NextResponse.json({
        translatedText: text,
        sourceLanguage: sourceLang,
        targetLanguage: targetLang,
        match: 100
      });
    }
    
    // MyMemory API 使用 GET 請求，參數在 URL 中
    const apiUrl = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    
    console.log('Translation URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AI-Translator/1.0)',
      },
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('MyMemory API Error Response:', response.status, errorData);
      return NextResponse.json(
        { error: `翻譯服務錯誤 (${response.status}): ${errorData}` },
        { status: 500 }
      );
    }

    const data: MyMemoryResponse = await response.json();
    console.log('MyMemory API Response:', data);
    
    if (data.responseStatus !== 200) {
      return NextResponse.json(
        { error: `翻譯失敗: ${data.responseDetails}` },
        { status: 500 }
      );
    }

    if (!data.responseData || !data.responseData.translatedText) {
      return NextResponse.json(
        { error: '翻譯結果為空' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      translatedText: data.responseData.translatedText,
      sourceLanguage: sourceLang,
      targetLanguage: targetLang,
      match: data.responseData.match
    });

  } catch (error) {
    console.error('Translation API Error:', error);
    return NextResponse.json(
      { error: '伺服器內部錯誤' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      message: 'Translation API is running',
      supportedLanguages: Object.keys(languageMap),
      version: '1.0.0'
    },
    { status: 200 }
  );
}