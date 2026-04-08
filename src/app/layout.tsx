import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Geist Sans：主要內文字體
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

// Geist Mono：程式碼等寬字體
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "即時翻譯工具",
  description: "支援英文、中文、泰語、日文的智能翻譯工具",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning：防止瀏覽器擴充套件（如翻譯、拼字檢查）
    // 在 <html> 注入額外屬性時觸發 React hydration mismatch 警告。
    // 此 prop 僅作用於當前元素本身，不會向下傳播至子元素。
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
