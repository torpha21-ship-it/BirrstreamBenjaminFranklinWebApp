import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "am";

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  t: (key: string, fallback?: string) => string;
  isAmharic: boolean;
}

const DICTIONARY: Record<Language, Record<string, string>> = {
  en: {
    // Nav & Common
    "nav.home": "Home",
    "nav.tasks": "Tasks",
    "nav.deposit": "Deposit",
    "nav.games": "Games",
    "nav.profile": "Profile",
    "nav.admin": "Admin",
    "nav.balance": "Balance",

    // Dashboard
    "dash.welcome": "Welcome back",
    "dash.main_balance": "MAIN BALANCE",
    "dash.current_balance": "Current Available Balance",
    "dash.deposit": "Deposit",
    "dash.withdraw": "Withdraw",
    "dash.deposit_sub": "Add funds instant",
    "dash.withdraw_sub": "Fast payout",
    "dash.referral_network": "My Referral Network",
    "dash.referral_sub": "Invite friends & earn 10% lifetime commission",
    "dash.daily_tasks": "Daily Tasks",
    "dash.daily_tasks_sub": "Earn +100 ETB daily",
    "dash.time_cards": "Time Cards",
    "dash.time_cards_sub": "Hourly yield boosters",
    "dash.login_streak": "Login Streak",
    "dash.login_streak_sub": "Daily check-in multiplier",
    "dash.check_in": "Check In Today",
    "dash.checked_in": "Checked In Today!",
    "dash.vip_upgrade": "VIP Upgrade Goals",
    "dash.vip_upgrade_sub": "Unlock higher daily limits",
    "dash.progress_to_vip": "Progress to VIP",
    "dash.partner_brands": "Official Ecosystem Partners",

    // Tasks
    "tasks.title": "DAILY TASKS",
    "tasks.subtitle": "Complete tasks to earn Birr rewards instantly",
    "tasks.completed": "Completed",
    "tasks.claim": "Claim Reward",
    "tasks.claimed": "Claimed",
    "tasks.go_to_task": "Go to Task",
    "tasks.telegram": "Join Official Telegram",
    "tasks.youtube": "Subscribe to YouTube",
    "tasks.watch_video": "Watch Video Ad",

    // Profile
    "profile.title": "MY PROFILE",
    "profile.total_deposited": "Total Deposited",
    "profile.total_yield": "Total Yield",
    "profile.total_withdrawn": "Total Withdrawn",
    "profile.reserve_floor": "Reserve Floor",
    "profile.withdrawal_settings": "Withdrawal Settings",
    "profile.transaction_history": "Transaction History",
    "profile.support": "Customer Support",
    "profile.terms": "Terms & Conditions",
    "profile.logout": "Logout",

    // Games / Arcade
    "games.title": "NAOMI ARCADE",
    "games.subtitle": "Play games & earn Birr rewards",
    "games.featured": "MINECRAFT MOB SPINNER",
    "games.featured_desc": "Spin the voxel mob picker to win instant ETB prizes up to 500 ETB!",
    "games.play_now": "PLAY MOB SPINNER",
    "games.coming_soon": "MORE GAMES COMING SOON",
    "games.coming_soon_desc": "Exciting multiplayer arcade and mini-games will be added here soon.",
    "games.spin_button": "START AUTO-PICKER (SPIN)",
    "games.spinning": "SPINNING AUTO-PICKER...",
    "games.back_to_arcade": "Back to Arcade",
    "games.roster_title": "Selected Mob Roster (15 Mobs)",
    "games.power_rating": "Power Rating:",
    "games.agility_stat": "Agility Stat:",
    "games.birr_potential": "Birr Potential:",
    "games.special_skill": "Special Skill:",
  },
  am: {
    // Nav & Common
    "nav.home": "መነሻ",
    "nav.tasks": "ተግባራት",
    "nav.deposit": "ተቀማጭ",
    "nav.games": "ጨዋታዎች",
    "nav.profile": "መገለጫ",
    "nav.admin": "አስተዳዳሪ",
    "nav.balance": "ቀሪ ሂሳብ",

    // Dashboard
    "dash.welcome": "እንኳን ደህና መጡ",
    "dash.main_balance": "ዋና ቀሪ ሂሳብ",
    "dash.current_balance": "አሁን የሚገኝ ቀሪ ሂሳብ",
    "dash.deposit": "ገንዘብ አስገባ",
    "dash.withdraw": "ገንዘብ አውጣ",
    "dash.deposit_sub": "ፈጣን ተቀማጭ ያድርጉ",
    "dash.withdraw_sub": "ፈጣን ክፍያ ያግኙ",
    "dash.referral_network": "የግብዣ አውታረ መረብ",
    "dash.referral_sub": "ጓደኞችን ይጋብዙ እና የ 10% የህይወት ዘመን ኮሚሽን ያግኙ",
    "dash.daily_tasks": "የዕለት ተግባራት",
    "dash.daily_tasks_sub": "በየቀኑ +100 ብር ያግኙ",
    "dash.time_cards": "የጊዜ ካርዶች",
    "dash.time_cards_sub": "የሰዓት ትርፍ ማሳደጊያዎች",
    "dash.login_streak": "የዕለት ተሳትፎ",
    "dash.login_streak_sub": "የዕለታዊ መግቢያ ጉርሻ",
    "dash.check_in": "የዛሬውን ተሳትፎ ይመዝግቡ",
    "dash.checked_in": "የዛሬው ተመዝግቧል!",
    "dash.vip_upgrade": "የቪአይፒ ግቦች",
    "dash.vip_upgrade_sub": "ከፍተኛ የዕለት ገደቦችን ይክፈቱ",
    "dash.progress_to_vip": "ወደ ቪአይፒ እድገት",
    "dash.partner_brands": "ይፋዊ አጋር ድርጅቶች",

    // Tasks
    "tasks.title": "የዕለት ተግባራት",
    "tasks.subtitle": "ተግባራትን በማጠናቀቅ የብር ሽልማቶችን ወዲያውኑ ያግኙ",
    "tasks.completed": "ተጠናቋል",
    "tasks.claim": "ሽልማት ውሰድ",
    "tasks.claimed": "ተወስዷል",
    "tasks.go_to_task": "ወደ ተግባሩ ሂድ",
    "tasks.telegram": "ይፋዊ ቴሌግራም ይቀላቀሉ",
    "tasks.youtube": "ዩቲዩብን ሰብስክራይብ ያድርጉ",
    "tasks.watch_video": "የቪዲዮ ማስታወቂያ ይመልከቱ",

    // Profile
    "profile.title": "የእኔ መገለጫ",
    "profile.total_deposited": "ጠቅላላ ተቀማጭ",
    "profile.total_yield": "ጠቅላላ ትርፍ",
    "profile.total_withdrawn": "ጠቅላላ የወጣ",
    "profile.reserve_floor": "የተቀመጠ ገንዘብ",
    "profile.withdrawal_settings": "የማውጫ ቅንብሮች",
    "profile.transaction_history": "የግብይት ታሪክ",
    "profile.support": "የደንበኞች አገልግሎት",
    "profile.terms": "ውሎች እና ሁኔታዎች",
    "profile.logout": "ውጣ",

    // Games / Arcade
    "games.title": "ናኦሚ አርኬድ",
    "games.subtitle": "ጨዋታዎችን ይጫወቱ እና የብር ሽልማት ያግኙ",
    "games.featured": "የማይንክራፍት ካራክተር መምረጫ",
    "games.featured_desc": "ካራክተር በማሽከርከር እስከ 500 ብር ፈጣን የገንዘብ ሽልማት ያሸንፉ!",
    "games.play_now": "ጨዋታውን ይጀምሩ",
    "games.coming_soon": "ተጨማሪ ጨዋታዎች በቅርቡ",
    "games.coming_soon_desc": "አዳዲስ አዝናኝ እና የሽልማት ጨዋታዎች በቅርቡ እዚህ ይጨመራሉ።",
    "games.spin_button": "አሽከርክር እና ምረጥ",
    "games.spinning": "በማሽከርከር ላይ...",
    "games.back_to_arcade": "ወደ አርኬድ ተመለስ",
    "games.roster_title": "የተመረጡ 15 ካራክተሮች",
    "games.power_rating": "የኃይል ደረጃ:",
    "games.agility_stat": "ፍጥነት:",
    "games.birr_potential": "የብር መጠን:",
    "games.special_skill": "ልዩ ችሎታ:",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem("birrstream_lang");
    return saved === "am" || saved === "en" ? saved : "en";
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("birrstream_lang", newLang);
  };

  const toggleLang = () => {
    setLang(lang === "en" ? "am" : "en");
  };

  const t = (key: string, fallback?: string): string => {
    return DICTIONARY[lang]?.[key] || fallback || DICTIONARY["en"]?.[key] || key;
  };

  const isAmharic = lang === "am";

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggleLang, t, isAmharic }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}