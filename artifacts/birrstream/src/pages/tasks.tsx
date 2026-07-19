import { useListDailyTasks, getListDailyTasksQueryKey, useCompleteTask } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, Tv, Globe, MessageCircle, Star, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { UpperScreenBg } from "@/components/upper-screen-bg";
import pointingHand from "@/assets/decor/pointing-hand.webp";
import dailyTipBg from "@/assets/decor/daily-tip-card-bg.svg";

const TASK_ICONS: Record<string, React.ComponentType<any>> = {
  stream_video: Tv,
  open_page: Globe,
  join_telegram: MessageCircle,
  other: Star,
};

const TASK_COLORS: Record<string, string> = {
  stream_video: "bg-[#C9BDF5] text-[#5B44BE]",
  open_page: "bg-[#A8D5B5] text-[#2B7A4B]",
  join_telegram: "bg-[#F5E6A3] text-[#8B7200]",
  other: "bg-[#F2A89A] text-[#C0402E]",
};

export default function Tasks() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { data: tasks, isLoading } = useListDailyTasks({ query: { queryKey: getListDailyTasksQueryKey() } });
  const completeMutation = useCompleteTask();

  const handleComplete = (id: number, title: string) => {
    completeMutation.mutate(
      { id },
      {
        onSuccess: (data) => {
          qc.invalidateQueries({ queryKey: getListDailyTasksQueryKey() });
          toast({ title: `+${data.rewardEarned} ETB earned!`, description: title });
        },
        onError: () => toast({ title: "Task already completed today", variant: "destructive" }),
      }
    );
  };

  const completed = tasks?.filter(t => t.isCompleted).length ?? 0;
  const total = tasks?.length ?? 0;
  const totalEarnable = tasks?.reduce((s, t) => s + (t.isCompleted ? 0 : t.reward), 0) ?? 0;

  return (
    <div className="px-4 py-6 max-w-md mx-auto relative">
      <UpperScreenBg />
      <div className="flex items-center gap-3 mb-2 relative z-10">
        <Link href="/dashboard" className="w-9 h-9 bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/50 shadow-sm">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="backdrop-blur-md bg-white/40 rounded-2xl px-4 py-2 shadow-sm border border-white/50">
          <h1 className="text-xl font-bold text-foreground" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>Daily Tasks</h1>
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
          <p className="text-gray-400 text-sm mb-1" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>Tasks completed today</p>
          <p className="text-3xl font-bold text-white">{completed}<span className="text-gray-400 text-xl">/{total}</span></p>
        </div>
        <div className="mt-3 h-2 bg-white/10 rounded-full overflow-hidden relative z-10">
          <div
            className="h-full bg-primary rounded-full transition-all duration-500"
            style={{ width: total ? `${(completed / total) * 100}%` : "0%" }}
          />
        </div>
        {totalEarnable > 0 && (
          <p className="text-primary text-sm mt-2 font-semibold relative z-10">+{totalEarnable.toFixed(2)} ETB available to earn</p>
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
          <p className="text-white font-bold text-sm" style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>💡 Daily Tip</p>
          <p className="text-white/90 text-xs mt-1.5 leading-relaxed">
            Complete all tasks daily to maximise your earnings. Tasks reset at midnight.
          </p>
        </div>
      </div>

      <h2 className="font-bold text-foreground mb-3 text-sm relative z-10">New habits for you</h2>

      <div className="space-y-3 relative z-10 -mx-4">
        {isLoading ? Array(4).fill(0).map((_, i) => (
          <div key={i} className="h-20 bg-card rounded-2xl animate-pulse border border-border" />
        )) : tasks?.map(task => {
          const Icon = TASK_ICONS[task.taskType] ?? Star;
          const colors = TASK_COLORS[task.taskType] ?? TASK_COLORS.other;
          return (
            <div
              key={task.id}
              className={`bg-card rounded-2xl p-4 border border-border flex items-start gap-3 transition-all ${task.isCompleted ? "opacity-60" : ""}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colors}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p className={`font-semibold text-sm ${task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"}`} style={{ fontFamily: "'Highstories', sans-serif", letterSpacing: "0.06em" }}>
                    {task.title}
                  </p>
                  <span className="text-primary font-bold text-sm flex-shrink-0">+{task.reward} ETB</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
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
            <p className="font-semibold">No tasks today</p>
            <p className="text-sm mt-1">Check back later</p>
          </div>
        )}
      </div>
    </div>
  );
}
