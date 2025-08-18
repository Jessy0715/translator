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
  th: 'th'
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
    
    // 如果目標語言是中文，直接返回原文
    if (targetLanguage === 'zh') {
      return NextResponse.json({
        translatedText: text,
        sourceLanguage: 'zh',
        targetLanguage: 'zh',
        match: 100
      });
    }
    
    // MyMemory API 使用 GET 請求，參數在 URL 中
    const apiUrl = `${MYMEMORY_URL}?q=${encodeURIComponent(text)}&langpair=zh|${targetLang}`;
    
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
      sourceLanguage: 'zh',
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