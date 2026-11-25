export type BadgeRarity = "common" | "rare" | "epic" | "legendary" | "mythic";

export interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  rarity: BadgeRarity;
  icon: "shield" | "zap" | "flame" | "crown" | "star" | "book" | "award" | "trophy" | "fileCheck";
  unlocked: boolean;
  progress: number;
  target: number;
  xpReward: number;
}

export interface BannerPreset {
  id: string;
  name: string;
  minLevel: number;
  className: string;
  description: string;
}

export interface AvatarFrame {
  minLevel: number;
  name: string;
  ringClass: string;
  glowClass: string;
}

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  currentLevelMinXp: number;
  nextLevelXp: number | null;
  progressPercent: number;
  canUploadCustomBanner: boolean;
  avatarFrame: AvatarFrame;
}

export interface TopEarningNote {
  id: string;
  title: string;
  category: string;
  price: number;
  salesCount: number;
  totalEarned: number;
}

export interface BuyoutActivity {
  id: string;
  type: "sale" | "unlocked";
  materialId: string;
  title: string;
  amount: number;
  createdAt: string;
}

export const ADMIN_EMAILS = [
  "business.neurovane@gmail.com",
  "shariarlabib04@gmail.com",
  "tanvirshafi9510@gmail.com",
];

export const isAdminEmail = (email?: string | null): boolean => {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
};

export const AVATAR_FRAMES: AvatarFrame[] = [
  {
    minLevel: 1,
    name: "Scholar Slate Frame",
    ringClass: "ring-2 ring-slate-400/50",
    glowClass: "shadow-lg",
  },
  {
    minLevel: 2,
    name: "Cyber Teal Pulse",
    ringClass: "ring-2 ring-teal-400",
    glowClass: "shadow-[0_0_24px_rgba(45,212,191,0.45)]",
  },
  {
    minLevel: 3,
    name: "Royal Nebula Aura",
    ringClass: "ring-2 ring-purple-400",
    glowClass: "shadow-[0_0_28px_rgba(192,132,252,0.5)]",
  },
  {
    minLevel: 4,
    name: "Dean's Gold Halo",
    ringClass: "ring-[3px] ring-amber-400",
    glowClass: "shadow-[0_0_32px_rgba(251,191,36,0.55)]",
  },
  {
    minLevel: 5,
    name: "Mythic Prismatic Crown",
    ringClass: "ring-[3px] ring-fuchsia-400",
    glowClass: "shadow-[0_0_38px_rgba(232,121,249,0.65)]",
  },
];

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: "academic-slate",
    name: "Midnight Obsidian",
    minLevel: 1,
    className: "bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-teal-900/70 via-slate-900 to-zinc-950",
    description: "Signature dark academic mesh (Level 1)",
  },
  {
    id: "cyber-teal",
    name: "Cyber Teal Surge",
    minLevel: 2,
    className: "bg-gradient-to-r from-teal-600/50 via-cyan-500/35 to-blue-700/50",
    description: "Unlocked at Level 2 (150 XP)",
  },
  {
    id: "royal-nebula",
    name: "Royal Nebula",
    minLevel: 3,
    className: "bg-gradient-to-r from-purple-700/60 via-fuchsia-600/45 to-indigo-800/60",
    description: "Unlocked at Level 3 (400 XP)",
  },
  {
    id: "golden-aurora",
    name: "Golden Aurora",
    minLevel: 4,
    className: "bg-gradient-to-r from-amber-500/55 via-orange-600/40 to-rose-700/55",
    description: "Unlocked at Level 4 (800 XP)",
  },
  {
    id: "legend-hologram",
    name: "Eduminity Mythic Prism",
    minLevel: 5,
    className: "bg-[linear-gradient(120deg,rgba(168,85,247,0.65),rgba(20,184,166,0.55),rgba(244,63,94,0.65))]",
    description: "Unlocked at Level 5 (1,500 XP) — plus Custom Image Upload!",
  },
];

const LEVEL_THRESHOLDS = [
  { level: 1, title: "Freshman Scholar", minXp: 0 },
  { level: 2, title: "Note Contributor", minXp: 150 },
  { level: 3, title: "Campus Mentor", minXp: 400 },
  { level: 4, title: "Dean's List Creator", minXp: 800 },
  { level: 5, title: "Eduminity Legend", minXp: 1500 },
];

export const getStudentCompletion = (meta: Record<string, any>) => {
  const fields = [
    { key: "avatar_url", label: "Profile Photo", filled: Boolean(meta?.avatar_url?.trim()) },
    { key: "full_name", label: "Full Name", filled: Boolean(meta?.full_name?.trim()) },
    { key: "institution", label: "University / College", filled: Boolean(meta?.institution?.trim()) },
    { key: "department", label: "Department / Major", filled: Boolean(meta?.department?.trim()) },
    { key: "semester", label: "Year / Semester", filled: Boolean(meta?.semester?.trim()) },
    { key: "bio", label: "Academic Bio", filled: Boolean(meta?.bio?.trim()) },
  ];
  const filledCount = fields.filter((f) => f.filled).length;
  return {
    percent: Math.round((filledCount / fields.length) * 100),
    fields,
    isComplete: filledCount === fields.length,
  };
};

export const getCreatorCompletion = (meta: Record<string, any>) => {
  const fields = [
    { key: "avatar_url", label: "Creator Photo", filled: Boolean(meta?.avatar_url?.trim()) },
    { key: "full_name", label: "Creator Name", filled: Boolean(meta?.full_name?.trim()) },
    { key: "institution", label: "University / College", filled: Boolean(meta?.institution?.trim()) },
    { key: "student_id", label: "Student ID", filled: Boolean(meta?.student_id?.trim()) },
    { key: "expertise", label: "Core Subjects", filled: Boolean(meta?.expertise?.trim()) },
    { key: "payout_number", label: "bKash / Nagad", filled: Boolean(meta?.payout_number?.trim()) },
    { key: "student_id_card_url", label: "ID Card Proof", filled: Boolean(meta?.student_id_card_url?.trim()) },
    { key: "academic_proof_url", label: "Merit / Grade Proof", filled: Boolean(meta?.academic_proof_url?.trim()) },
  ];
  const filledCount = fields.filter((f) => f.filled).length;
  return {
    percent: Math.round((filledCount / fields.length) * 100),
    fields,
    isComplete: filledCount === fields.length,
  };
};

export const getCreatorProofStatus = (meta: Record<string, any>) => {
  const hasIdProof = Boolean(meta?.student_id_card_url?.trim());
  const hasMeritProof = Boolean(meta?.academic_proof_url?.trim());
  const hasCgpa = Boolean(meta?.cgpa?.trim());
  const hasHonors = Boolean(meta?.honors?.trim());
  const hasPortfolio = Boolean(meta?.portfolio_url?.trim());

  const checks = [hasIdProof, hasMeritProof, hasCgpa, hasHonors, hasPortfolio];
  const scorePercent = Math.round((checks.filter(Boolean).length / checks.length) * 100);

  return {
    hasIdProof,
    hasMeritProof,
    hasCgpa,
    hasHonors,
    hasPortfolio,
    isFullyProven: hasIdProof && hasMeritProof,
    scorePercent,
  };
};

export const isContributorOnboardingComplete = (
  meta?: Record<string, any> | null,
  email?: string | null
): boolean => {
  if (isAdminEmail(email)) return true;
  if (!meta) return false;
  return Boolean(
    meta.institution?.trim() &&
      meta.student_id?.trim() &&
      meta.expertise?.trim() &&
      meta.payout_number?.trim()
  );
};

export const calculateWeeklyPublishingStreak = (materials: any[]): number => {
  if (!materials || materials.length === 0) return 0;

  const weekStarts = new Set<number>();
  for (const m of materials) {
    if (!m.created_at) continue;
    const d = new Date(m.created_at);
    const day = d.getUTCDay();
    const diff = d.getUTCDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), diff));
    weekStarts.add(monday.getTime());
  }

  const sortedWeeks = Array.from(weekStarts).sort((a, b) => b - a);
  if (sortedWeeks.length === 0) return 0;

  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  let streak = 1;
  for (let i = 0; i < sortedWeeks.length - 1; i++) {
    if (sortedWeeks[i] - sortedWeeks[i + 1] <= oneWeekMs + 1000) {
      streak++;
    } else {
      break;
    }
  }
  return streak;
};

export const computeProfileGamification = (params: {
  meta: Record<string, any>;
  email?: string | null;
  publishedMaterials: any[];
  salesRows: any[];
  unlockedPurchases: any[];
  reviewsWrittenCount: number;
  averageRating: number;
}) => {
  const {
    meta,
    email,
    publishedMaterials,
    salesRows,
    unlockedPurchases,
    reviewsWrittenCount,
    averageRating,
  } = params;

  const admin = isAdminEmail(email);
  const studentComp = getStudentCompletion(meta);
  const creatorComp = getCreatorCompletion(meta);
  const proofStatus = getCreatorProofStatus(meta);
  const weeklyStreak = calculateWeeklyPublishingStreak(publishedMaterials);

  const publishedCount = publishedMaterials.length;
  const approvedSales = salesRows.filter(
    (s) => String(s.status || "").toLowerCase() === "approved"
  );
  const approvedUnlocks = unlockedPurchases.filter(
    (p) => String(p.status || "").toLowerCase() === "approved"
  );

  // XP Calculation
  let xp = 0;
  xp += publishedCount * 120;
  xp += approvedSales.length * 60;
  xp += approvedUnlocks.length * 30;
  xp += reviewsWrittenCount * 25;
  if (studentComp.isComplete) xp += 50;
  if (creatorComp.isComplete) xp += 75;
  if (proofStatus.hasIdProof) xp += 50;
  if (proofStatus.hasMeritProof) xp += 50;
  if (admin) xp = Math.max(xp, 1500);

  let currentTier = LEVEL_THRESHOLDS[0];
  let nextTier: (typeof LEVEL_THRESHOLDS)[number] | null = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].minXp) {
      currentTier = LEVEL_THRESHOLDS[i];
      nextTier = LEVEL_THRESHOLDS[i + 1] || null;
    }
  }

  const progressPercent = nextTier
    ? Math.min(
        100,
        Math.round(
          ((xp - currentTier.minXp) / (nextTier.minXp - currentTier.minXp)) * 100
        )
      )
    : 100;

  const avatarFrame =
    AVATAR_FRAMES.find((f) => f.minLevel === currentTier.level) || AVATAR_FRAMES[0];

  const levelInfo: LevelInfo = {
    level: currentTier.level,
    title: currentTier.title,
    xp,
    currentLevelMinXp: currentTier.minXp,
    nextLevelXp: nextTier ? nextTier.minXp : null,
    progressPercent,
    canUploadCustomBanner: currentTier.level >= 5 || admin,
    avatarFrame,
  };

  // 9 Tiered Badges
  const badges: AchievementBadge[] = [
    {
      id: "verified-scholar",
      name: "Verified Scholar",
      description: "Complete 100% of your Student Profile including a profile photo.",
      rarity: "common",
      icon: "shield",
      unlocked: studentComp.isComplete,
      progress: studentComp.percent,
      target: 100,
      xpReward: 50,
    },
    {
      id: "proven-credentials",
      name: "Authenticated Creator",
      description: "Upload both your University ID Card & Academic Merit Proof.",
      rarity: "rare",
      icon: "fileCheck",
      unlocked: proofStatus.isFullyProven,
      progress: (proofStatus.hasIdProof ? 1 : 0) + (proofStatus.hasMeritProof ? 1 : 0),
      target: 2,
      xpReward: 100,
    },
    {
      id: "first-drop",
      name: "First Drop",
      description: "Publish your first study material on Eduminity.",
      rarity: "common",
      icon: "zap",
      unlocked: publishedCount >= 1,
      progress: Math.min(publishedCount, 1),
      target: 1,
      xpReward: 120,
    },
    {
      id: "streak-master",
      name: "Streak Master",
      description: "Publish 3+ study notes or sustain a 2-week upload streak.",
      rarity: "rare",
      icon: "flame",
      unlocked: publishedCount >= 3 || weeklyStreak >= 2,
      progress: Math.min(Math.max(publishedCount, weeklyStreak), 3),
      target: 3,
      xpReward: 200,
    },
    {
      id: "knowledge-collector",
      name: "Knowledge Collector",
      description: "Unlock 3+ study materials in the Study Hub.",
      rarity: "rare",
      icon: "book",
      unlocked: approvedUnlocks.length >= 3,
      progress: Math.min(approvedUnlocks.length, 3),
      target: 3,
      xpReward: 90,
    },
    {
      id: "peer-critic",
      name: "Peer Critic",
      description: "Write 3+ helpful material reviews for fellow students.",
      rarity: "rare",
      icon: "award",
      unlocked: reviewsWrittenCount >= 3,
      progress: Math.min(reviewsWrittenCount, 3),
      target: 3,
      xpReward: 75,
    },
    {
      id: "crowd-favorite",
      name: "Crowd Favorite",
      description: "Reach 5+ approved student buyouts on your published notes.",
      rarity: "epic",
      icon: "trophy",
      unlocked: approvedSales.length >= 5,
      progress: Math.min(approvedSales.length, 5),
      target: 5,
      xpReward: 300,
    },
    {
      id: "top-rated",
      name: "Top Rated Author",
      description: "Maintain a 4.5+ star rating with at least 1 published note.",
      rarity: "legendary",
      icon: "star",
      unlocked: publishedCount >= 1 && averageRating >= 4.5,
      progress: publishedCount >= 1 ? Number(averageRating.toFixed(1)) : 0,
      target: 4.5,
      xpReward: 350,
    },
    {
      id: "eduminity-legend",
      name: "Eduminity Legend",
      description: "Hit Level 5 (1,500 XP) to unlock Custom Cover Banners & Mythic Frame.",
      rarity: "mythic",
      icon: "crown",
      unlocked: levelInfo.level >= 5,
      progress: Math.min(xp, 1500),
      target: 1500,
      xpReward: 500,
    },
  ];

  const materialMap = new Map<string, any>(
    publishedMaterials.map((m) => [m.id, m])
  );
  const earningsByMaterial = new Map<string, { salesCount: number; totalEarned: number }>();

  for (const sale of approvedSales) {
    const mat = materialMap.get(sale.material_id);
    if (!mat) continue;
    const unitPrice = Number(sale.amount ?? mat.price ?? 0);
    const creatorNet = Math.round(unitPrice * 0.8);
    const prev = earningsByMaterial.get(mat.id) || { salesCount: 0, totalEarned: 0 };
    earningsByMaterial.set(mat.id, {
      salesCount: prev.salesCount + 1,
      totalEarned: prev.totalEarned + creatorNet,
    });
  }

  const highestEarningNotes: TopEarningNote[] = publishedMaterials
    .map((m) => {
      const stats = earningsByMaterial.get(m.id) || { salesCount: 0, totalEarned: 0 };
      return {
        id: m.id,
        title: m.title || "Untitled Note",
        category: m.category || "General",
        price: Number(m.price || 0),
        salesCount: stats.salesCount,
        totalEarned: stats.totalEarned,
      };
    })
    .sort((a, b) => b.totalEarned - a.totalEarned || b.salesCount - a.salesCount)
    .slice(0, 5);

  return {
    levelInfo,
    badges,
    weeklyStreak,
    studentComp,
    creatorComp,
    proofStatus,
    highestEarningNotes,
    totalCreatorEarnings: highestEarningNotes.reduce((sum, n) => sum + n.totalEarned, 0),
    totalSalesCount: approvedSales.length,
    totalUnlockedCount: approvedUnlocks.length,
  };
};