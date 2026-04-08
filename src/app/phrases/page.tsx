"use client";

import { useState } from "react";
import { Search, ArrowLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { locales, type LocaleKey, defaultLocale } from "@/locales";

// 分類資料
const categories = [
  {
    id: "airport",
    icon: "✈️",
    titleZh: "機場與交通",
    titleEn: "Airport and Transportation",
    titleTh: "สนามบินและการขนส่ง",
    titleJa: "空港と交通"
  },
  {
    id: "accommodation",
    icon: "🏨",
    titleZh: "住宿",
    titleEn: "Accommodation",
    titleTh: "ที่พัก",
    titleJa: "宿泊"
  },
  {
    id: "dining",
    icon: "🍽️",
    titleZh: "用餐",
    titleEn: "Dining",
    titleTh: "การรับประทานอาหาร",
    titleJa: "食事"
  },
  {
    id: "shopping",
    icon: "🛍️",
    titleZh: "購物",
    titleEn: "Shopping",
    titleTh: "ช้อปปิ้ง",
    titleJa: "ショッピング"
  },
  {
    id: "emergency",
    icon: "🚨",
    titleZh: "緊急狀況與一般實用片語",
    titleEn: "Emergencies and General Phrases",
    titleTh: "เหตุฉุกเฉินและวลีที่ใช้ทั่วไป",
    titleJa: "緊急事態と一般フレーズ"
  }
];

export default function Phrasebook() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentLocale, setCurrentLocale] = useState<LocaleKey>(defaultLocale);
  
  const t = locales[currentLocale];

  // 根據搜尋詞過濾分類
  const filteredCategories = categories.filter(category => {
    const title = category[`title${currentLocale.charAt(0).toUpperCase() + currentLocale.slice(1)}` as keyof typeof category] as string;
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getCategoryTitle = (category: typeof categories[0]) => {
    switch (currentLocale) {
      case 'en':
        return category.titleEn;
      case 'th':
        return category.titleTh;
      case 'ja':
        return category.titleJa;
      default:
        return category.titleZh;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header with Back Button */}
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <Link
              href="/"
              className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-300 
                       hover:text-teal-600 dark:hover:text-teal-400 transition-colors"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">{currentLocale === 'zh' ? '返回' : currentLocale === 'en' ? 'Back' : currentLocale === 'ja' ? '戻る' : 'กลับ'}</span>
            </Link>
          </div>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
              {t.phrasebook}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {currentLocale === 'zh' ? '出國旅遊常用語速查手冊' :
               currentLocale === 'en' ? 'Quick reference guide for travel phrases' :
               currentLocale === 'ja' ? '旅行に役立つフレーズ集' :
               'คู่มืออ้างอิงด่วนสำหรับวลีการเดินทาง'}
            </p>
          </div>
        </header>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={currentLocale === 'zh' ? '搜尋分類...' :
                          currentLocale === 'en' ? 'Search categories...' :
                          currentLocale === 'ja' ? 'カテゴリを検索...' :
                          'ค้นหาหมวดหมู่...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                       bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-teal-500 focus:border-transparent
                       placeholder-gray-500 dark:placeholder-gray-400"
            />
          </div>
        </div>

        {/* Categories List */}
        <main className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-6 text-center">
            {currentLocale === 'zh' ? '情境分類' :
             currentLocale === 'en' ? 'Categories' :
             currentLocale === 'ja' ? 'シチュエーション別' :
             'หมวดหมู่สถานการณ์'}
          </h2>

          <div className="grid gap-4">
            {filteredCategories.length === 0 ? (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                {currentLocale === 'zh' ? '找不到相關分類' :
                 currentLocale === 'en' ? 'No categories found' :
                 currentLocale === 'ja' ? '該当するカテゴリが見つかりません' :
                 'ไม่พบหมวดหมู่'}
              </div>
            ) : (
              filteredCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/phrases/${category.id}`}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg
                           border border-gray-200 dark:border-gray-700 p-6 transition-all
                           hover:border-teal-300 dark:hover:border-teal-600 group block"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{category.icon}</div>
                      <div className="text-left">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {getCategoryTitle(category)}
                        </h3>
                      </div>
                    </div>
                    <ChevronRight 
                      className="text-gray-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 
                               transition-colors" 
                      size={24} 
                    />
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>

        {/* Language Switcher */}
        <div className="fixed bottom-6 right-6">
          <select
            value={currentLocale}
            onChange={(e) => setCurrentLocale(e.target.value as LocaleKey)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 
                     rounded-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300
                     shadow-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="zh">中文</option>
            <option value="en">English</option>
            <option value="th">ไทย</option>
            <option value="ja">日本語</option>
          </select>
        </div>
      </div>
    </div>
  );
}