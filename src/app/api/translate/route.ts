import { NextRequest, NextResponse } from 'next/server';

interface TranslateRequest {
  text: string;
  targetLanguage: string;
}

interface LibreTranslateResponse {
  translatedText: string;
}

interface LibreTranslateError {
  error: string;
}

const LIBRETRANSLATE_URL = process.env.LIBRETRANSLATE_URL || 'https://libretranslate.de/translate';
const LIBRETRANSLATE_API_KEY = process.env.LIBRETRANSLATE_API_KEY;

const languageMap: Record<string, string> = {
  en: 'en',
  lo: 'lo', 
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
    
    const translatePayload = {
      q: text,
      source: 'zh',
      target: targetLang,
      format: 'text',
      ...(LIBRETRANSLATE_API_KEY && { api_key: LIBRETRANSLATE_API_KEY })
    };

    const response = await fetch(LIBRETRANSLATE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(translatePayload),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('LibreTranslate API Error:', errorData);
      return NextResponse.json(
        { error: '翻譯服務暫時無法使用' },
        { status: 500 }
      );
    }

    const data: LibreTranslateResponse | LibreTranslateError = await response.json();
    
    if ('error' in data) {
      return NextResponse.json(
        { error: `翻譯失敗: ${data.error}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      translatedText: data.translatedText,
      sourceLanguage: 'zh',
      targetLanguage: targetLang
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