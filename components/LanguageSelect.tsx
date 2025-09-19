"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const languages = [
  { code: "en", label: "English", flag: "🇦🇺" },
  { code: "cn", label: "中文", flag: "🇨🇳" },
];

export default function LanguageSelect() {
  const router = useRouter();

  const [currentLocale, setCurrentLocale] = useState("en");

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Get current locale from cookie

    const locale =
      document.cookie

        .split("; ")

        .find((row) => row.startsWith("locale="))

        ?.split("=")[1] || "en";

    setCurrentLocale(locale);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    // Set cookie for locale
    document.cookie = `locale=${newLocale}; path=/; max-age=31536000; SameSite=Strict`;
    setCurrentLocale(newLocale); // Refresh the page to apply new locale
    router.refresh();
  };

  if (!isClient) {
    return (
      <div className="w-[180px] h-10 bg-gray-100 rounded-md animate-pulse" />
    );
  }

  const currentLanguage = languages.find((lang) => lang.code === currentLocale);

  return (
    <Select value={currentLocale} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select language">
          {currentLanguage && (
            <span className="flex items-center gap-2">
              <span>{currentLanguage.flag}</span>
              <span>{currentLanguage.label}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {languages.map((language) => (
          <SelectItem key={language.code} value={language.code}>
            <span className="flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{language.label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
