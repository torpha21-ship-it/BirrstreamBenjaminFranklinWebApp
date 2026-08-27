import { useListDailyTasks, getListDailyTasksQueryKey, useCompleteTask } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import pointingHand from "@/assets/decor/pointing-hand.webp";
import dailyTipBg from "@/assets/decor/daily-tip-card-bg.svg";
import { useLanguage } from "@/context/language-context";

import videoIcon from "@/assets/daily-tasks/wired-outline-1876-video.webp";
import homepageIcon from "@/assets/daily-tasks/wired-outline-27-homepage.webp";
import telegramIcon from "@/assets/daily-tasks/wired-outline-2559-logo-telegram.webp";
import linkIcon from "@/assets/daily-tasks/wired-outline-11-link.webp";
import profileIcon from "@/assets/daily-tasks/wired-outline-471-profile-complete.webp";
import moreVideoIcon from "@/assets/daily-tasks/wired-outline-2738-2-more-video.webp";

function getTaskIcon(title: string, taskType: string): string {
  const t = title.toLowerCase();
  if (t.includes("2 more") || t.includes("additional")) return moreVideoIcon;
  if (t.includes("video") || t.includes("watch") || taskType === "stream_video") return videoIcon;
  if (t.includes("home") || t.includes("visit") || taskType === "open_page") return homepageIcon;
  if (t.includes("telegram") || taskType === "join_telegram") return telegramIcon;
  if (t.includes("referral") || t.includes("link") || t.includes("share")) return linkIcon;
  if (t.includes("profile")) return profileIcon;
  return homepageIcon;
}

const TASK_COLORS: Record<string, string> = {
  stream_video: "bg-[#C9BDF5] text-[#5B44BE]",
  open_page: "bg-[#A8D5B5] text-[#2B7A4B]",
  join_telegram: "bg-[#F5E6A3] text-[#8B7200]",
  other: "bg-[#F2A89A] text-[#C0402E]",
};

const TASK_TRANSLATIONS: Record<string, { titleAm: string; descAm: string; titleOr: string; descOr: string }> = {
  "Watch a BirrStream video": {
    titleAm: "የብርስትሪም ቪዲዮ ይመልከቱ",
    descAm: "በፕላትፎርማችን ላይ ማንኛውንም ቪዲዮ ለ 5 ደቂቃዎች ይመልከቱ",
    titleOr: "Viidiyoo BirrStream daawwadhaa",
    descOr: "Viidiyoo kamiyyuu daawwannaadhaaf daqiiqaa 5f daawwadhaa"
  },
  "Visit the BirrStream homepage": {
    titleAm: "የብርስትሪም መነሻ ገጽን ይጎብኙ",
    descAm: "የብርስትሪም ዋናውን ገጽ ከፍተው ለ 2 ደቂቃዎች ያስሱ",
    titleOr: "Fuula duraa BirrStream daawwadhaa",
    descOr: "Fuula duraa BirrStream banaatii daqiiqaa 2f daawwadhaa"
  },
  "Join BirrStream Telegram": {
    titleAm: "የብርስትሪም ቴሌግራምን ይቀላቀሉ",
    descAm: "ለአዳዲስ መረጃዎች እና ጉርሻዎች ይፋዊ የቴሌግራም ቻናላችንን ይቀላቀሉ",
    titleOr: "Telegiraamii BirrStream itti dabalamaa",
    descOr: "Odeeffannoo fi badhaasaaf chaanaalii telegiraamii keenya itti dabalamaa"
  },
  "Share your referral link": {
    titleAm: "የግብዣ ሊንክዎን ያጋሩ",
    descAm: "የእርስዎን ልዩ የግብዣ ሊንክ ዛሬ ቢያንስ ለአንድ ሰው ያጋሩ",
    titleOr: "Liinkii afeerraa keessan qoodaa",
    descOr: "Liinkii keessan addaa har'a yoo xiqqaate nama tokkoof qoodaa"
  },
  "Complete your profile": {
    titleAm: "የመገለጫ መረጃዎን ያሟሉ",
    descAm: "ሙሉ ስምዎ እና ኢሜይልዎ በመገለጫዎ ውስጥ ትክክል መሆናቸውን ያረጋግጡ",
    titleOr: "Piroofaayilii keessan guutaa",
    descOr: "Maqaa fi imeelii keessan guutuu ta'uu mirkaneessaa"
  },
  "Watch 2 more videos": {
    titleAm: "ተጨማሪ 2 ቪዲዮዎችን ይመልከቱ",
    descAm: "በብርስትሪም ላይ 2 ተጨማሪ ቪዲዮዎችን ይመልከቱ",
    titleOr: "Viidiyoowwan 2 dabalataan daawwadhaa",
    descOr: "Viidiyoowwan dabalataa 2 BirrStream irratti daawwadhaa"
  },
};

function getLocalizedTask(title: string, desc: string, isAmharic: boolean, isOromo?: boolean) {
  if (isOromo) {
    const match = TASK_TRANSLATIONS[title];
    if (match) return { title: match.titleOr, description: match.descOr };
    let tOr = title;
    let dOr = desc;
    if (title.toLowerCase().includes("video")) tOr = "Viidiyoo daawwadhaa";
    if (title.toLowerCase().includes("telegram")) tOr = "Chaanaalii Telegiraamii itti dabalamaa";
    if (title.toLowerCase().includes("referral")) tOr = "Liinkii afeerraa qoodaa";
    if (title.toLowerCase().includes("profile")) tOr = "Piroofaayilii keessan guutaa";
    if (title.toLowerCase().includes("home") || title.toLowerCase().includes("visit")) tOr = "Fuula duraa daawwadhaa";
    return { title: tOr, description: dOr };
  }
  if (!isAmharic) return { title, description: desc };
  const match = TASK_TRANSLATIONS[title];
  if (match) return { title: match.titleAm, description: match.descAm };
  
  // Generic fallback translators if dynamic backend tasks added
  let tAm = title;
  let dAm = desc;
  if (title.toLowerCase().includes("video")) tAm = "ቪዲዮ ይመልከቱ";
  if (title.toLowerCase().includes("telegram")) tAm = "የቴሌግራም ቻናል ይቀላቀሉ";
  if (title.toLowerCase().includes("referral")) tAm = "የግብዣ ሊንክ ያጋሩ";
  if (title.toLowerCase().includes("profile")) tAm = "መገለጫዎን ያሟሉ";
  if (title.toLowerCase().includes("home") || title.toLowerCase().includes("visit")) tAm = "መነሻ ገጹን ይጎብኙ";

  return { title: tAm, description: dAm };
}

export default function Tasks() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { t, isAmharic, isOromo, currency } = useLanguage();
  const { data: tasks, isLoading } = useListDailyTasks({ query: { queryKey: getListDailyTasksQueryKey() } });
  const completeMutation = useCompleteTask();

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Highstories', sans-serif",
    letterSpacing: isAmharic ? "0" : "0.06em",
  };

  const handleComplete = (id: number, title: string) => {
    const localized = getLocalizedTask(title, "", isAmharic, isOromo);
    completeMutation.mutate(
      { id },
      {
        onSuccess: (data) => {
          qc.invalidateQueries({ queryKey: getListDailyTasksQueryKey() });
          toast({
            title: `+${data.rewardEarned} ${currency} ${t("tasks.earned")}`,
            description: localized.title
          });
        },
        onError: () => toast({ title: t("tasks.already_completed"), variant: "destructive" }),
      }
    );
  };

  const completed = tasks?.filter(t => t.isCompleted).length ?? 0;
  const total = tasks?.length ?? 0;
  const totalEarnable = tasks?.reduce((s, t) => s + (t.isCompleted ? 0 : t.reward), 0) ?? 0;

  return (
    <div className="px-4 py-6 max-w-md mx-auto relative">
      <div className="flex items-center gap-3 mb-2 relative z-10">
        <Link href="/dashboard" className="w-9 h-9 bg-white rounded-full flex items-center justify-center border border-gray-200 shadow-sm flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-black" />
        </Link>
        <div className="bg-white rounded-2xl px-4 py-2 shadow-sm border border-gray-200">
          <h1 className="text-[20px] font-bold text-black" style={displayFont}>
            {t("tasks.title")}
          </h1>
        </div>
      </div>

      {/* Summary card */}
      <div className="bg-[#1A1A1A] rounded-3xl p-5 mb-5 mt-3 relative overflow-hidden z-10 -mx-4">
        <img
          src={pointingHand}
          alt=""
          aria-hidden="true"
          className="absolute right-0 top-0 h-1/2 object-contain object-right-top pointer-events-none select-none opacity-90"
        />
        <div className="relative z-10 pr-32">
          <p className="text-gray-400 text-[18px] mb-1" style={displayFont}>
            {t("tasks.completed_today")}
          </p>
          <p className="text-3xl font-bold text-white">{completed}<span className="text-gray-400 text-xl">/{total}</span></p>
        </div>
        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: total ? `${(completed / total) * 100}%` : "0%" }}
          />
        </div>
        {totalEarnable > 0 && (
          <p className="text-primary text-sm mt-2 font-semibold relative z-10" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            +{totalEarnable.toFixed(2)} {currency} {t("tasks.available_to_earn")}
          </p>
        )}
      </div>

      {/* Daily Tip card — SVG used as blurred background; purple overlay preserves text readability */}
      <div className="rounded-2xl mb-5 relative z-10 overflow-hidden -mx-4">
        {/* Blurred background: scale-110 prevents blur edge bleed-through */}
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center"
          style={{ backgroundImage: `url(${dailyTipBg})`, filter: "blur(10px)" }}
          aria-hidden="true"
        />
        {/* Semi-transparent purple overlay so white text pops cleanly */}
        <div className="absolute inset-0 bg-[#4A35A8]/65" aria-hidden="true" />
        {/* Text above both layers */}
        <div className="relative z-10 p-4">
          <p className="text-white font-bold text-[20px]" style={displayFont}>
            💡 {t("tasks.tip_title")}
          </p>
          <p className="text-white/90 text-xs mt-1.5 leading-relaxed" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>
            {t("tasks.tip_desc")}
          </p>
        </div>
      </div>

      <h2 className="font-bold text-foreground mb-3 text-sm relative z-10" style={displayFont}>
        {t("tasks.new_habits")}
      </h2>

      <div className="space-y-3 relative z-10 -mx-4">
        {isLoading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-20 bg-card rounded-2xl animate-pulse border border-border" />
        )) : tasks?.map(task => {
          const iconSrc = getTaskIcon(task.title, task.taskType);
          const colors = TASK_COLORS[task.taskType] ?? TASK_COLORS.other;
          const loc = getLocalizedTask(task.title, task.description, isAmharic, isOromo);
          return (
            <div
              key={task.id}
              className={`bg-card rounded-2xl p-4 border border-border flex items-start gap-3 transition-all ${task.isCompleted ? "opacity-60" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors}`}>
                <img src={iconSrc} alt="" className="w-6 h-6 object-contain" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-semibold text-[18px] leading-tight ${task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`} style={displayFont}>
                    {loc.title}
                  </p>
                  <span className="text-primary font-bold text-sm flex-shrink-0">+{task.reward} {currency}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>{loc.description}</p>
              </div>
              <button
                onClick={() => !task.isCompleted && handleComplete(task.id, task.title)}
                disabled={task.isCompleted || completeMutation.isPending}
                className="flex-shrink-0"
              >
                {task.isCompleted
                  ? <CheckCircle2 className="w-6 h-6 text-accent-foreground" />
                  : <Circle className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors" />
                }
              </button>
            </div>
          );
        })}
        {tasks?.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-semibold" style={displayFont}>{t("tasks.no_tasks")}</p>
            <p className="text-sm mt-1" style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}>{t("tasks.check_back")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
