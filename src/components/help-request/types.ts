import { COINS_PER_TAKA, CONVERSION_FEE_RATE } from "@/lib/currency";

export type HelpType = "quick-clarification" | "notes-help" | "session";

export type RequestStatus = "pending" | "accepted" | "declined" | "completed" | "cancelled";

export interface HelpRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar: string | null;
  contributorId: string;
  contributorName: string;
  topic: string;
  helpType: HelpType;
  estimatedDuration: number; // in minutes
  coinCost: number; // in coins
  platformCommission: number; // in coins
  contributorEarnings: number; // in coins
  status: RequestStatus;
  message?: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

export interface ChatMessage {
  id: string;
  requestId: string;
  senderId: string;
  senderName: string;
  content: string;
  isSystemMessage: boolean;
  createdAt: string;
}

// Base rates in coins (120 coins = 1 Taka)
export const HELP_TYPES: { value: HelpType; label: string; description: string; baseRate: number }[] = [
  { 
    value: "quick-clarification", 
    label: "Quick Clarification", 
    description: "A brief question answered in 5-10 minutes",
    baseRate: 120 // 1 Taka worth of coins
  },
  { 
    value: "notes-help", 
    label: "Notes Help", 
    description: "Help understanding specific notes or topics",
    baseRate: 300 // 2.5 Taka worth of coins
  },
  { 
    value: "session", 
    label: "Study Session", 
    description: "An in-depth tutoring session",
    baseRate: 600 // 5 Taka worth of coins
  },
];

export const DURATION_OPTIONS = [
  { value: 10, label: "10 minutes" },
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
];

export const PLATFORM_COMMISSION_RATE = 0.15; // 15%

export function calculateCost(helpType: HelpType, duration: number): { 
  totalCost: number; // in coins
  commission: number; // in coins
  contributorEarnings: number; // in coins
  totalCostInTaka: number;
  contributorEarningsInTaka: number;
} {
  const helpTypeConfig = HELP_TYPES.find(h => h.value === helpType);
  const baseRate = helpTypeConfig?.baseRate || 120;
  const totalCost = Math.round(baseRate * (duration / 15)); // Price per 15-min increment
  const commission = Math.round(totalCost * PLATFORM_COMMISSION_RATE);
  const contributorEarnings = totalCost - commission;
  
  return { 
    totalCost, 
    commission, 
    contributorEarnings,
    totalCostInTaka: totalCost / COINS_PER_TAKA,
    contributorEarningsInTaka: contributorEarnings / COINS_PER_TAKA
  };
}

// Mock data for incoming requests (costs in coins)
export const mockIncomingRequests: HelpRequest[] = [
  {
    id: "req-1",
    studentId: "student-1",
    studentName: "Ahmed Khan",
    studentAvatar: null,
    contributorId: "contributor-1",
    contributorName: "Mohammad Rahman",
    topic: "Quantum Mechanics - Wave Functions",
    helpType: "notes-help",
    estimatedDuration: 30,
    coinCost: 600, // 5 Taka worth
    platformCommission: 90,
    contributorEarnings: 510,
    status: "pending",
    message: "I'm struggling to understand the concept of wave function collapse. Could you help explain it with examples?",
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: "req-2",
    studentId: "student-2",
    studentName: "Fatima Begum",
    studentAvatar: null,
    contributorId: "contributor-1",
    contributorName: "Mohammad Rahman",
    topic: "Calculus - Integration by Parts",
    helpType: "quick-clarification",
    estimatedDuration: 10,
    coinCost: 120, // 1 Taka worth
    platformCommission: 18,
    contributorEarnings: 102,
    status: "pending",
    message: "Quick question about when to use integration by parts vs substitution",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
];

// Mock active session (costs in coins)
export const mockActiveSession: HelpRequest = {
  id: "req-3",
  studentId: "student-3",
  studentName: "Nadia Rahman",
  studentAvatar: null,
  contributorId: "contributor-1",
  contributorName: "Mohammad Rahman",
  topic: "Thermodynamics - Entropy",
  helpType: "session",
  estimatedDuration: 45,
  coinCost: 1800, // 15 Taka worth
  platformCommission: 270,
  contributorEarnings: 1530,
  status: "accepted",
  message: "I need help preparing for my thermodynamics exam, specifically entropy concepts",
  createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  acceptedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
};

export const mockChatMessages: ChatMessage[] = [
  {
    id: "msg-1",
    requestId: "req-3",
    senderId: "system",
    senderName: "System",
    content: "Session started. Remember: No sharing of personal contact information. This session will last approximately 45 minutes.",
    isSystemMessage: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "msg-2",
    requestId: "req-3",
    senderId: "contributor-1",
    senderName: "Mohammad Rahman",
    content: "Hi Nadia! I'd be happy to help you with entropy concepts. Let's start with the basics - what do you already know about entropy?",
    isSystemMessage: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
  {
    id: "msg-3",
    requestId: "req-3",
    senderId: "student-3",
    senderName: "Nadia Rahman",
    content: "I understand it's related to disorder, but I'm confused about how to calculate it and when it increases vs decreases.",
    isSystemMessage: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
  },
];
