<<<<<<< HEAD
# AI 即時翻譯網頁應用程式

支援中文轉英文、寮語、泰語的智能翻譯工具，具備語音輸入功能和響應式設計。

## 🚀 功能特色

- ✅ **文字翻譯** - 支援中文轉英文/寮語/泰語
- ✅ **語音輸入** - 使用瀏覽器原生語音辨識 API
- ✅ **響應式設計** - 支援桌面和行動裝置
- ✅ **即時翻譯** - 快速翻譯回應
- ✅ **深色模式** - 支援明亮/深色主題切換

## 🛠 技術棧

**前端：**
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Lucide React Icons
- Web Speech API

**後端：**
- Next.js API Routes
- MyMemory Translation API

## 📦 本地開發

### 安裝相依套件

```bash
npm install
```

### 啟動開發伺服器

```bash
npm run dev
```

在瀏覽器開啟 [http://localhost:3000](http://localhost:3000) 查看結果。

### 環境變數設定

專案使用 MyMemory Translation API（免費，無需 API Key）。

如需使用其他翻譯服務，請在 `.env.local` 中設定：

```bash
# MyMemory API 設定（預設）
MYMEMORY_URL=https://api.mymemory.translated.net/get

# 如果有自己的翻譯 API Key 可以在這裡設定
# TRANSLATION_API_KEY=your_api_key_here
```

## 🚀 部署至 Vercel

### 1. 上傳至 GitHub

```bash
# 初始化 Git 儲存庫（如果尚未初始化）
git init

# 新增所有檔案
git add .

# 提交變更
git commit -m "Initial commit: AI Translation Web App"

# 連接到你的 GitHub 儲存庫
git remote add origin https://github.com/你的用戶名/ai-translator.git

# 推送至 GitHub
git push -u origin main
```

### 2. 在 Vercel 部署

1. 前往 [Vercel](https://vercel.com)
2. 點擊 "Add New..." → "Project"
3. 選擇你的 GitHub 儲存庫
4. 點擊 "Import"
5. Vercel 會自動偵測 Next.js 專案並部署

### 3. 環境變數設定（Vercel）

由於使用免費的 MyMemory API，不需要設定額外的環境變數。

如果未來要使用其他翻譯服務，可在 Vercel Dashboard 中設定環境變數。

## 📱 支援的瀏覽器

- ✅ Chrome/Edge (完整支援，包含語音功能)
- ✅ Firefox (完整支援，包含語音功能)
- ✅ Safari (文字翻譯，語音功能有限)
- ✅ 行動裝置瀏覽器

## 🎯 使用方式

1. **文字輸入**：直接在文字框中輸入中文
2. **語音輸入**：點擊麥克風按鈕開始語音辨識
3. **選擇語言**：從下拉選單選擇目標語言
4. **開始翻譯**：點擊翻譯按鈕取得結果

## 📝 授權

MIT License

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

由 Next.js 和 Claude Code 協力開發 🤖
=======
# translator
>>>>>>> dec25519a3caa6ac64f3c72ae1b26f9f646aecce
