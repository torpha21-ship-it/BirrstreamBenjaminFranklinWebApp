import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import {
  Send,
  X,
  Play,
  Pause,
  Volume2,
  Sparkles,
  CheckCircle2,
  Flame,
  Plus,
  TrendingUp,
  Award,
} from "lucide-react";
import { BSLogo } from "@/components/bs-logo";

// Social Media & Reaction Animated WebP Icons from `social icons/`
import starIcon from "@/assets/social-icons/wired-outline-237-star-hover-wink.webp";
import shockIcon from "@/assets/social-icons/wired-outline-262-emoji-shock-hover-pinch.webp";
import applauseIcon from "@/assets/social-icons/wired-outline-1092-hands-applause-hover-pinch.webp";
import confettiIcon from "@/assets/social-icons/wired-outline-1103-confetti-hover-pinch.webp";
import thumbDownIcon from "@/assets/social-icons/wired-outline-1122-thumb-down-hover-down.webp";
import heartIcon from "@/assets/social-icons/wired-outline-20-heart-hover-heartbeat.webp";

import photoIcon from "@/assets/social-icons/wired-outline-54-image-mountain-hover-pinch.webp";
import videoIcon from "@/assets/social-icons/wired-outline-1037-vlog-camera-hover-pinch.webp";
import micIcon from "@/assets/social-icons/wired-outline-188-microphone-hover-recording.webp";
import cameraIcon from "@/assets/social-icons/wired-outline-61-camera-hover-flash.webp";
import commentsIcon from "@/assets/social-icons/wired-outline-955-avatars-message-plus-hover-click.webp";
import shareIcon from "@/assets/social-icons/wired-outline-11-link-in-reveal.webp";
import trashIcon from "@/assets/social-icons/wired-outline-185-trash-bin-hover-empty (1).webp";
import pencilIcon from "@/assets/social-icons/wired-outline-35-pencil-in-reveal.webp";
import globeIcon from "@/assets/social-icons/wired-outline-27-globe-hover-rotate.webp";

import avatarWoman1 from "@/assets/social-icons/wired-outline-16-avatar-woman-hover-pinch.webp";
import avatarMan1 from "@/assets/social-icons/wired-outline-17-avatar-man-hover-pinch.webp";
import avatarMan2 from "@/assets/social-icons/wired-outline-268-avatar-man-hover-nodding.webp";
import avatarWoman2 from "@/assets/social-icons/wired-outline-269-avatar-woman-hover-wave.webp";

export type ReactionType = "star" | "shock" | "applause" | "confetti" | "thumb_down" | "heart";

export interface Comment {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  authorName: string;
  authorUsername: string;
  authorAvatar?: string;
  vipTier?: string;
  isVerified?: boolean;
  content: string;
  photos?: string[];
  videoUrl?: string;
  audioUrl?: string;
  audioDuration?: string;
  feeling?: string;
  reactions: Record<ReactionType, number>;
  userReaction?: ReactionType;
  comments: Comment[];
  sharesCount: number;
  createdAt: string;
  isUserPost?: boolean;
}

export const REACTION_CONFIG: Record<
  ReactionType,
  { label: string; labelAm: string; labelOr: string; icon: string; color: string; badgeBg: string }
> = {
  star: {
    label: "Star",
    labelAm: "ኮከብ",
    labelOr: "Urjii",
    icon: starIcon,
    color: "text-amber-500",
    badgeBg: "bg-amber-500/15 text-amber-600 dark:text-amber-300 border-amber-500/30",
  },
  shock: {
    label: "Shock",
    labelAm: "ድንጋጤ",
    labelOr: "Naasuu",
    icon: shockIcon,
    color: "text-yellow-500",
    badgeBg: "bg-yellow-500/15 text-yellow-600 dark:text-yellow-300 border-yellow-500/30",
  },
  applause: {
    label: "Applause",
    labelAm: "ጭብጨባ",
    labelOr: "Harka Rukuttaa",
    icon: applauseIcon,
    color: "text-emerald-500",
    badgeBg: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border-emerald-500/30",
  },
  confetti: {
    label: "Confetti",
    labelAm: "ደስታ",
    labelOr: "Gammachuu",
    icon: confettiIcon,
    color: "text-purple-500",
    badgeBg: "bg-purple-500/15 text-purple-600 dark:text-purple-300 border-purple-500/30",
  },
  thumb_down: {
    label: "Dislike",
    labelAm: "አልወደድኩትም",
    labelOr: "Hin Jaallanne",
    icon: thumbDownIcon,
    color: "text-red-500",
    badgeBg: "bg-red-500/15 text-red-600 dark:text-red-300 border-red-500/30",
  },
  heart: {
    label: "Love",
    labelAm: "ፍቅር",
    labelOr: "Jaalala",
    icon: heartIcon,
    color: "text-rose-500",
    badgeBg: "bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/30",
  },
};

const INITIAL_POSTS: Post[] = [
  {
    id: "post-1",
    authorName: "Naomi Official",
    authorUsername: "naomilabs",
    authorAvatar: avatarMan1,
    isVerified: true,
    vipTier: "VIP 5 Apex",
    content: "🚀 Welcome to Naomi Community! Share your daily yield milestones, VIP upgrades, video reactions, and withdrawal proofs with everyone! 🎉 #BirrStream #NaomiLabs #EarnDaily",
    photos: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=60"],
    feeling: "Celebrating 🎉",
    reactions: { star: 184, applause: 142, confetti: 95, heart: 120, shock: 12, thumb_down: 2 },
    userReaction: "star",
    comments: [
      {
        id: "c1",
        authorName: "Abebe Kebede",
        authorUsername: "abebe_k",
        authorAvatar: avatarMan2,
        text: "Just received my daily yield for VIP3! Love this platform 🔥",
        createdAt: "10m ago",
      },
      {
        id: "c2",
        authorName: "Selamawit T.",
        authorUsername: "selam_t",
        authorAvatar: avatarWoman1,
        text: "Best earning experience in Ethiopia 🇪🇹",
        createdAt: "5m ago",
      }
    ],
    sharesCount: 36,
    createdAt: "25m ago",
  },
  {
    id: "post-2",
    authorName: "Dawit Haile",
    authorUsername: "dawit_eth",
    authorAvatar: avatarMan2,
    vipTier: "VIP 4 Titan",
    isVerified: true,
    content: "Listen to my quick audio review on how fast Telebirr withdrawals are approved today! Over 5,000 ETB received in under 10 minutes 💰🎧",
    audioUrl: "https://actions.google.com/sounds/v1/water/waves_crashing_on_rocks.ogg",
    audioDuration: "0:24",
    feeling: "Blessed 🌟",
    reactions: { star: 78, applause: 64, confetti: 45, heart: 89, shock: 8, thumb_down: 0 },
    userReaction: "applause",
    comments: [
      {
        id: "c3",
        authorName: "Kassahun B.",
        authorUsername: "kassa22",
        authorAvatar: avatarMan1,
        text: "Telebirr is super fast indeed brother!",
        createdAt: "15m ago",
      }
    ],
    sharesCount: 19,
    createdAt: "1h ago",
  }
];

export default function Feed() {
  const { user } = useAuth();
  const { isAmharic, isOromo, currency } = useLanguage();
  const { toast } = useToast();

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem("birrstream_social_posts_v2");
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [filter, setFilter] = useState<"all" | "photos" | "videos" | "audio" | "my">("all");
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  // Composer Form State
  const [postText, setPostText] = useState("");
  const [postPhotos, setPostPhotos] = useState<string[]>([]);
  const [postVideo, setPostVideo] = useState<string | null>(null);
  const [postAudio, setPostAudio] = useState<string | null>(null);
  const [postAudioDuration, setPostAudioDuration] = useState<string>("0:15");
  const [postFeeling, setPostFeeling] = useState<string>("");

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Open comments tracking
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});

  // Audio Playback state
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Active Reaction Picker Menu
  const [hoveredReactionPostId, setHoveredReactionPostId] = useState<string | null>(null);

  const filePhotoRef = useRef<HTMLInputElement>(null);
  const fileVideoRef = useRef<HTMLInputElement>(null);
  const fileAudioRef = useRef<HTMLInputElement>(null);

  const displayFont = {
    fontFamily: isAmharic ? "'LogaComic', sans-serif" : "'Plus Jakarta Sans', sans-serif",
    letterSpacing: isAmharic ? "0.045em" : "-0.01em",
  };

  // Save posts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("birrstream_social_posts_v2", JSON.stringify(posts));
    } catch {
      // ignore
    }
  }, [posts]);

  // Voice Recorder Timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const reader = new FileReader();
        reader.onloadend = () => {
          setPostAudio(reader.result as string);
          setPostAudioDuration(`0:${recordingSeconds.toString().padStart(2, "0")}`);
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast({
        title: isAmharic ? "ማይክሮፎን አልተገኘም" : "Microphone Access Denied",
        description: isAmharic ? "እባክዎ የማይክሮፎን ፈቃድ ይስጡ።" : "Please enable microphone permission to record audio.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = () => {
        setPostPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPostVideo(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCreatePost = () => {
    if (!postText.trim() && postPhotos.length === 0 && !postVideo && !postAudio) {
      toast({
        title: isAmharic ? "ባዶ ጽሁፍ መለጠፍ አይቻልም" : "Post is empty",
        description: isAmharic ? "እባክዎ ጽሁፍ፣ ፎቶ፣ ቪዲዮ ወይም የድምፅ መልዕክት ያክሉ።" : "Please add text, photos, video, or audio to share.",
        variant: "destructive",
      });
      return;
    }

    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorName: user?.fullName || "Naomi Member",
      authorUsername: user?.username || "member",
      authorAvatar: avatarWoman2,
      vipTier: "VIP Member",
      isVerified: true,
      content: postText.trim(),
      photos: postPhotos.length > 0 ? postPhotos : undefined,
      videoUrl: postVideo || undefined,
      audioUrl: postAudio || undefined,
      audioDuration: postAudioDuration || undefined,
      feeling: postFeeling || undefined,
      reactions: { star: 1, shock: 0, applause: 0, confetti: 0, thumb_down: 0, heart: 0 },
      userReaction: "star",
      comments: [],
      sharesCount: 0,
      createdAt: "Just now",
      isUserPost: true,
    };

    setPosts([newPost, ...posts]);
    setIsComposerOpen(false);
    setPostText("");
    setPostPhotos([]);
    setPostVideo(null);
    setPostAudio(null);
    setPostFeeling("");

    toast({
      title: isAmharic ? "መልዕክትዎ በተሳካ ሁኔታ ተለጥፏል! 🎉" : "Post Shared to Community! 🎉",
    });
  };

  const handleReaction = (postId: string, reaction: ReactionType) => {
    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        const currentReaction = p.userReaction;
        const nextReactions = { ...p.reactions };

        if (currentReaction === reaction) {
          // Toggle off
          nextReactions[reaction] = Math.max(0, (nextReactions[reaction] || 1) - 1);
          return { ...p, reactions: nextReactions, userReaction: undefined };
        }

        if (currentReaction) {
          nextReactions[currentReaction] = Math.max(0, (nextReactions[currentReaction] || 1) - 1);
        }

        nextReactions[reaction] = (nextReactions[reaction] || 0) + 1;
        return { ...p, reactions: nextReactions, userReaction: reaction };
      })
    );
    setHoveredReactionPostId(null);
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      authorName: user?.fullName || "Naomi Member",
      authorUsername: user?.username || "member",
      authorAvatar: avatarWoman2,
      text,
      createdAt: "Just now",
    };

    setPosts(prev =>
      prev.map(p => {
        if (p.id !== postId) return p;
        return { ...p, comments: [...p.comments, newComment] };
      })
    );

    setCommentInputs(prev => ({ ...prev, [postId]: "" }));
  };

  const handleDeletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    toast({
      title: isAmharic ? "መልዕክቱ ተሰርዟል" : "Post deleted",
    });
  };

  const handleShare = async (post: Post) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${post.authorName} on Naomi Feed`,
          text: post.content,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      navigator.clipboard.writeText(`${post.authorName}: ${post.content}\n${window.location.href}`);
      toast({
        title: isAmharic ? "የመልዕክቱ ሊንክ ተቀድቷል!" : "Post link copied to clipboard!",
      });
    }
  };

  const toggleAudio = (postId: string, url: string) => {
    if (playingAudioId === postId) {
      audioRef.current?.pause();
      setPlayingAudioId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.play();
      setPlayingAudioId(postId);
      audio.onended = () => setPlayingAudioId(null);
    }
  };

  // Filtered Posts
  const filteredPosts = posts.filter(post => {
    if (filter === "photos") return !!post.photos && post.photos.length > 0;
    if (filter === "videos") return !!post.videoUrl;
    if (filter === "audio") return !!post.audioUrl;
    if (filter === "my") return !!post.isUserPost;
    return true;
  });

  return (
    <div className="px-3 pt-2 pb-24 max-w-md mx-auto relative">
      {/* Brand Header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <BSLogo />
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 bg-primary/15 text-primary border border-primary/30 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span style={displayFont}>{isAmharic ? "ማህበራዊ ፊድ" : isOromo ? "Hawaasa" : "Community"}</span>
          </span>
        </div>
      </div>

      {/* Stories / Highlights Carousel */}
      <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-2 mb-3 -mx-3 px-3">
        {/* Create Story Button */}
        <div
          onClick={() => setIsComposerOpen(true)}
          className="relative w-20 h-28 rounded-2xl bg-gradient-to-b from-card to-card/60 border border-border flex flex-col items-center justify-between p-2 flex-shrink-0 cursor-pointer group hover:border-primary/50 transition-all shadow-sm"
        >
          <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-primary mt-2 group-hover:scale-110 transition-transform">
            <Plus className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold text-center text-foreground leading-tight" style={displayFont}>
            {isAmharic ? "አጋራ" : isOromo ? "Qoodaa" : "Add Story"}
          </span>
        </div>

        {/* Community Story Badges */}
        {[
          { name: "Daily Yields", icon: TrendingUp, color: "from-amber-500/30 to-yellow-600/40", border: "border-yellow-500/40" },
          { name: "VIP Upgrades", icon: Flame, color: "from-purple-500/30 to-indigo-600/40", border: "border-purple-500/40" },
          { name: "Withdrawals", icon: Award, color: "from-emerald-500/30 to-green-600/40", border: "border-emerald-500/40" },
        ].map((story, i) => {
          const Icon = story.icon;
          return (
            <div
              key={i}
              className={`relative w-20 h-28 rounded-2xl bg-gradient-to-b ${story.color} border ${story.border} flex flex-col items-center justify-between p-2 flex-shrink-0 cursor-pointer shadow-sm`}
            >
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white mt-2">
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-bold text-center text-white leading-tight">
                {story.name}
              </span>
            </div>
          );
        })}
      </div>

      {/* "What's on your mind?" Composer Box with WebP Action Icons */}
      <div className="bg-card rounded-3xl p-3.5 mb-4 border border-border shadow-sm">
        <div className="flex items-center gap-3 pb-3 border-b border-border/60">
          <div className="w-10 h-10 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src={avatarWoman2} alt="User Avatar" className="w-full h-full object-cover" />
          </div>
          <button
            type="button"
            onClick={() => setIsComposerOpen(true)}
            className="flex-1 bg-muted/40 hover:bg-muted/70 text-left px-4 py-2.5 rounded-full text-xs text-muted-foreground transition-all cursor-pointer truncate flex items-center gap-2"
          >
            <img src={pencilIcon} alt="" className="w-3.5 h-3.5 object-contain opacity-70" />
            <span>
              {isAmharic
                ? `${user?.fullName?.split(" ")[0] || "አባል"}፣ ምን እያሰቡ ነው?`
                : isOromo
                ? `Maal yaadaa jirtu, ${user?.fullName?.split(" ")[0] || "Miseensa"}?`
                : `What's on your mind, ${user?.fullName?.split(" ")[0] || "member"}?`}
            </span>
          </button>
        </div>

        {/* Quick Media Action Row with WebP icons */}
        <div className="grid grid-cols-3 gap-1 pt-2">
          <button
            type="button"
            onClick={() => { setIsComposerOpen(true); setTimeout(() => filePhotoRef.current?.click(), 100); }}
            className="py-1.5 px-2 rounded-xl hover:bg-muted/50 flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
          >
            <img src={photoIcon} alt="Photo" className="w-5 h-5 object-contain" />
            <span className="text-[11px] text-foreground font-bold" style={displayFont}>{isAmharic ? "ፎቶ" : "Photo"}</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsComposerOpen(true); setTimeout(() => fileVideoRef.current?.click(), 100); }}
            className="py-1.5 px-2 rounded-xl hover:bg-muted/50 flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
          >
            <img src={videoIcon} alt="Video" className="w-5 h-5 object-contain" />
            <span className="text-[11px] text-foreground font-bold" style={displayFont}>{isAmharic ? "ቪዲዮ" : "Video"}</span>
          </button>

          <button
            type="button"
            onClick={() => { setIsComposerOpen(true); }}
            className="py-1.5 px-2 rounded-xl hover:bg-muted/50 flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer transition-colors"
          >
            <img src={micIcon} alt="Audio" className="w-5 h-5 object-contain" />
            <span className="text-[11px] text-foreground font-bold" style={displayFont}>{isAmharic ? "ድምፅ" : "Audio"}</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-4">
        {[
          { id: "all", label: isAmharic ? "ሁሉም" : isOromo ? "Hunda" : "All" },
          { id: "photos", label: isAmharic ? "ፎቶዎች" : "Photos" },
          { id: "videos", label: isAmharic ? "ቪዲዮዎች" : "Videos" },
          { id: "audio", label: isAmharic ? "ድምፅ" : "Voice Notes" },
          { id: "my", label: isAmharic ? "የእኔ ልጥፎች" : "My Posts" },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              filter === tab.id
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                : "bg-card border border-border text-muted-foreground hover:text-foreground"
            }`}
            style={displayFont}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── FEED POSTS LIST ── */}
      <div className="space-y-4">
        {filteredPosts.map(post => {
          const totalReactions = Object.values(post.reactions).reduce((a, b) => a + b, 0);
          const isAudioPlaying = playingAudioId === post.id;
          const userReactionConfig = post.userReaction ? REACTION_CONFIG[post.userReaction] : null;

          return (
            <div
              key={post.id}
              className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden transition-all"
            >
              {/* Post Header */}
              <div className="p-4 pb-2.5 flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full border border-border overflow-hidden bg-muted flex-shrink-0">
                    <img
                      src={post.authorAvatar || avatarMan1}
                      alt={post.authorName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-bold text-sm text-foreground leading-tight" style={displayFont}>
                        {post.authorName}
                      </h4>
                      {post.isVerified && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 fill-blue-500/20" />
                      )}
                      {post.vipTier && (
                        <span className="px-2 py-0.2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-300 border border-emerald-500/25 rounded-full text-[10px] font-extrabold">
                          {post.vipTier}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                      <span>@{post.authorUsername}</span>
                      <span>•</span>
                      <span>{post.createdAt}</span>
                      {post.feeling && (
                        <>
                          <span>•</span>
                          <span className="text-amber-500 font-semibold">{post.feeling}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {post.isUserPost && (
                  <button
                    type="button"
                    onClick={() => handleDeletePost(post.id)}
                    className="w-8 h-8 rounded-full hover:bg-red-500/10 text-muted-foreground hover:text-red-500 flex items-center justify-center transition-colors cursor-pointer"
                    title="Delete post"
                  >
                    <img src={trashIcon} alt="Delete" className="w-4 h-4 object-contain" />
                  </button>
                )}
              </div>

              {/* Post Text */}
              {post.content && (
                <div className="px-4 py-1.5 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                  {post.content}
                </div>
              )}

              {/* Post Photos */}
              {post.photos && post.photos.length > 0 && (
                <div className="mt-2.5 relative bg-black/10">
                  {post.photos.length === 1 ? (
                    <img
                      src={post.photos[0]}
                      alt="Post attachment"
                      className="w-full max-h-96 object-cover"
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-1">
                      {post.photos.slice(0, 4).map((photo, pIdx) => (
                        <img
                          key={pIdx}
                          src={photo}
                          alt="Post gallery"
                          className="w-full h-44 object-cover"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Post Video */}
              {post.videoUrl && (
                <div className="mt-2.5 bg-black rounded-2xl overflow-hidden mx-3">
                  <video
                    src={post.videoUrl}
                    controls
                    className="w-full max-h-80 object-contain"
                  />
                </div>
              )}

              {/* Post Audio / Voice Note Player */}
              {post.audioUrl && (
                <div className="mx-3 mt-3 p-3 bg-primary/10 border border-primary/25 rounded-2xl flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleAudio(post.id, post.audioUrl!)}
                    className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                  >
                    {isAudioPlaying ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                        <Volume2 className="w-3.5 h-3.5 text-primary" />
                        <span>{isAmharic ? "የድምፅ መልዕክት" : "Voice Recording"}</span>
                      </span>
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {post.audioDuration || "0:24"}
                      </span>
                    </div>

                    {/* Animated Soundwave Bars */}
                    <div className="flex items-center gap-1 h-5">
                      {[40, 75, 55, 90, 100, 65, 80, 45, 95, 70, 60, 85, 50, 70, 90, 40].map((h, bIdx) => (
                        <div
                          key={bIdx}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            isAudioPlaying ? "bg-primary animate-pulse" : "bg-primary/40"
                          }`}
                          style={{ height: isAudioPlaying ? `${h}%` : "35%" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Reactions & Stats Counts with Star, Applause & Confetti badges */}
              <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-b border-border/40 mt-2">
                <div className="flex items-center gap-1.5">
                  <div className="flex -space-x-1.5">
                    <img src={starIcon} alt="Star" className="w-5 h-5 object-contain" />
                    <img src={heartIcon} alt="Heart" className="w-5 h-5 object-contain" />
                    <img src={applauseIcon} alt="Applause" className="w-5 h-5 object-contain" />
                  </div>
                  <span className="font-bold text-foreground pl-1">{totalReactions}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                    className="hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <img src={commentsIcon} alt="" className="w-3.5 h-3.5 object-contain" />
                    <span>{post.comments.length} {isAmharic ? "አስተያየቶች" : "comments"}</span>
                  </button>
                  <span className="flex items-center gap-1">
                    <img src={shareIcon} alt="" className="w-3.5 h-3.5 object-contain" />
                    <span>{post.sharesCount} {isAmharic ? "ማጋራቶች" : "shares"}</span>
                  </span>
                </div>
              </div>

              {/* Action Buttons with 6 Interactive WebP Reactions (Star, Shock, Applause, Confetti, Thumb Down, Heart) */}
              <div className="relative px-2 py-1 flex items-center justify-around">
                {/* Reaction Trigger */}
                <div
                  className="relative flex-1"
                  onMouseEnter={() => setHoveredReactionPostId(post.id)}
                  onMouseLeave={() => setHoveredReactionPostId(null)}
                >
                  {/* Floating 6-Reaction Animated WebP Drawer */}
                  {hoveredReactionPostId === post.id && (
                    <div className="absolute bottom-full left-0 mb-1 z-30 flex items-center gap-1.5 bg-card/95 backdrop-blur-md p-1.5 rounded-full border border-border shadow-2xl animate-in zoom-in-95 duration-150">
                      {(Object.keys(REACTION_CONFIG) as ReactionType[]).map((rKey) => (
                        <button
                          key={rKey}
                          type="button"
                          onClick={() => handleReaction(post.id, rKey)}
                          className="w-9 h-9 p-1 rounded-full hover:bg-muted/80 hover:scale-130 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
                          title={isAmharic ? REACTION_CONFIG[rKey].labelAm : REACTION_CONFIG[rKey].label}
                        >
                          <img src={REACTION_CONFIG[rKey].icon} alt={REACTION_CONFIG[rKey].label} className="w-full h-full object-contain" />
                        </button>
                      ))}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => handleReaction(post.id, post.userReaction || "star")}
                    className={`w-full py-2 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all cursor-pointer ${
                      userReactionConfig
                        ? `${userReactionConfig.badgeBg} border`
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    }`}
                  >
                    <img
                      src={userReactionConfig ? userReactionConfig.icon : starIcon}
                      alt="Reaction"
                      className="w-5 h-5 object-contain"
                    />
                    <span style={displayFont}>
                      {userReactionConfig
                        ? (isAmharic ? userReactionConfig.labelAm : isOromo ? userReactionConfig.labelOr : userReactionConfig.label)
                        : (isAmharic ? "ኮከብ" : isOromo ? "Urjii" : "Star")}
                    </span>
                  </button>
                </div>

                {/* Comment Button */}
                <button
                  type="button"
                  onClick={() => setActiveCommentsPostId(activeCommentsPostId === post.id ? null : post.id)}
                  className="flex-1 py-2 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all cursor-pointer"
                >
                  <img src={commentsIcon} alt="Comment" className="w-5 h-5 object-contain" />
                  <span style={displayFont}>{isAmharic ? "አስተያየት" : isOromo ? "Yaada" : "Comment"}</span>
                </button>

                {/* Share Button */}
                <button
                  type="button"
                  onClick={() => handleShare(post)}
                  className="flex-1 py-2 rounded-2xl flex items-center justify-center gap-1.5 text-xs font-bold text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all cursor-pointer"
                >
                  <img src={shareIcon} alt="Share" className="w-5 h-5 object-contain" />
                  <span style={displayFont}>{isAmharic ? "አጋራ" : isOromo ? "Qoodaa" : "Share"}</span>
                </button>
              </div>

              {/* Comments Thread Section */}
              {activeCommentsPostId === post.id && (
                <div className="px-4 pt-2 pb-4 bg-muted/20 border-t border-border/50 animate-in fade-in duration-200">
                  {/* List existing comments */}
                  <div className="space-y-2 mb-3">
                    {post.comments.map(c => (
                      <div key={c.id} className="flex items-start gap-2 text-xs">
                        <div className="w-7 h-7 rounded-full border border-border overflow-hidden bg-muted flex-shrink-0 mt-0.5">
                          <img src={c.authorAvatar || avatarMan1} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 bg-card p-2.5 rounded-2xl border border-border">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-foreground text-[11px]">{c.authorName}</span>
                            <span className="text-[10px] text-muted-foreground">{c.createdAt}</span>
                          </div>
                          <p className="text-foreground text-xs">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Comment Input Box */}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ""}
                      onChange={e => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleAddComment(post.id);
                      }}
                      placeholder={isAmharic ? "አስተያየት ጻፍ..." : isOromo ? "Yaada barreessi..." : "Write a comment..."}
                      className="flex-1 px-3.5 py-2 bg-card border border-border rounded-full text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddComment(post.id)}
                      className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 active:scale-95 transition-all flex-shrink-0 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* ── CREATE POST MODAL ── */}
      {isComposerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-3 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-card rounded-3xl border border-border shadow-2xl overflow-hidden animate-in slide-in-from-bottom-6 duration-200">
            {/* Modal Header */}
            <div className="p-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <img src={pencilIcon} alt="" className="w-5 h-5 object-contain" />
                <h3 className="font-bold text-base text-foreground" style={displayFont}>
                  {isAmharic ? "አዲስ መልዕክት አጋራ" : isOromo ? "Maxxansa Haaraa" : "Create Post"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsComposerOpen(false)}
                className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 max-h-[70vh] overflow-y-auto space-y-3">
              {/* User badge */}
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full border border-border overflow-hidden bg-muted">
                  <img src={avatarWoman2} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground leading-tight" style={displayFont}>
                    {user?.fullName || "Naomi Member"}
                  </h4>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
                    <img src={globeIcon} alt="Public" className="w-3.5 h-3.5 object-contain" />
                    <span>Public • Community</span>
                  </div>
                </div>
              </div>

              {/* Text Area */}
              <textarea
                value={postText}
                onChange={e => setPostText(e.target.value)}
                placeholder={isAmharic ? "ምን እያሰቡ ነው? ስለ ዕለታዊ ገቢዎ፣ ቪአይፒ ፓኬጅ ወይም ተሞክሮዎ ያጋሩ..." : "What's on your mind? Share your daily yield, VIP upgrade, or milestone..."}
                rows={4}
                className="w-full p-3 bg-muted/20 border border-border rounded-2xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                style={isAmharic ? { fontFamily: "'Noto Sans Ethiopic', sans-serif" } : {}}
              />

              {/* Attachments Preview Grid */}
              {postPhotos.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {postPhotos.map((photo, i) => (
                    <div key={i} className="relative rounded-xl overflow-hidden border border-border">
                      <img src={photo} alt="" className="w-full h-28 object-cover" />
                      <button
                        type="button"
                        onClick={() => setPostPhotos(postPhotos.filter((_, idx) => idx !== i))}
                        className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Video Preview */}
              {postVideo && (
                <div className="relative rounded-2xl overflow-hidden bg-black">
                  <video src={postVideo} controls className="w-full max-h-48 object-contain" />
                  <button
                    type="button"
                    onClick={() => setPostVideo(null)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Audio Preview */}
              {postAudio && (
                <div className="p-3 bg-primary/10 border border-primary/30 rounded-2xl flex items-center justify-between">
                  <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Volume2 className="w-4 h-4 text-primary" />
                    <span>Voice Note Ready ({postAudioDuration})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setPostAudio(null)}
                    className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-muted-foreground"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Voice Recorder Active Box */}
              {isRecording && (
                <div className="p-3 bg-red-500/15 border border-red-500/30 rounded-2xl flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                    <span>Recording: 0:{recordingSeconds.toString().padStart(2, "0")}</span>
                  </div>
                  <button
                    type="button"
                    onClick={stopVoiceRecording}
                    className="px-3 py-1 bg-red-500 text-white rounded-full text-xs font-bold"
                  >
                    Stop & Save
                  </button>
                </div>
              )}

              {/* Add to post media bar with WebP Icons */}
              <div className="p-3 rounded-2xl bg-muted/40 border border-border flex items-center justify-between">
                <span className="text-xs font-bold text-foreground" style={displayFont}>
                  {isAmharic ? "ማያያዣዎችን ጨምር፦" : "Add to your post:"}
                </span>

                <div className="flex items-center gap-1.5">
                  {/* Photo picker */}
                  <input
                    ref={filePhotoRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => filePhotoRef.current?.click()}
                    className="p-1.5 rounded-xl hover:bg-muted transition-all cursor-pointer hover:scale-115"
                    title="Add Photo"
                  >
                    <img src={photoIcon} alt="Photo" className="w-6 h-6 object-contain" />
                  </button>

                  {/* Video picker */}
                  <input
                    ref={fileVideoRef}
                    type="file"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileVideoRef.current?.click()}
                    className="p-1.5 rounded-xl hover:bg-muted transition-all cursor-pointer hover:scale-115"
                    title="Add Video"
                  >
                    <img src={videoIcon} alt="Video" className="w-6 h-6 object-contain" />
                  </button>

                  {/* Audio / Voice Record trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isRecording) stopVoiceRecording();
                      else startVoiceRecording();
                    }}
                    className={`p-1.5 rounded-xl hover:bg-muted transition-all cursor-pointer hover:scale-115 ${
                      isRecording ? "bg-red-500/20 rounded-xl" : ""
                    }`}
                    title="Record Voice Note"
                  >
                    <img src={micIcon} alt="Mic" className="w-6 h-6 object-contain" />
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer Submit */}
            <div className="p-4 border-t border-border">
              <button
                type="button"
                onClick={handleCreatePost}
                className="w-full py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-lg shadow-primary/25 hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
                style={displayFont}
              >
                <Send className="w-4 h-4" />
                <span>{isAmharic ? "አሁን ለጥፍ" : isOromo ? "Amma Maxxansi" : "Post to Feed"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
