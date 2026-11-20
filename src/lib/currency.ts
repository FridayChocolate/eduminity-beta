// Currency Constants and Utilities
// ================================
// This file centralizes all currency-related constants and calculations

// Core Exchange Rates
export const COINS_PER_TAKA = 120; // 1 Taka = 120 coins
export const COINS_PER_AD = 30; // Earn 30 coins per ad
export const ADS_PER_TAKA = 4; // 4 ads = 1 Taka (4 x 30 = 120 coins)
export const CONVERSION_FEE_RATE = 0.05; // 5% conversion fee when converting coins to Taka

// Helper Functions
export function coinsToTaka(coins: number): number {
  return coins / COINS_PER_TAKA;
}

export function takaToCoins(taka: number): number {
  return taka * COINS_PER_TAKA;
}

export function calculateConversionFee(coins: number): number {
  const takaValue = coinsToTaka(coins);
  return takaValue * CONVERSION_FEE_RATE;
}

export function coinsToTakaAfterFee(coins: number): number {
  const takaValue = coinsToTaka(coins);
  const fee = calculateConversionFee(coins);
  return takaValue - fee;
}

export function formatCoins(coins: number): string {
  return coins.toLocaleString();
}

export function formatTaka(taka: number): string {
  return `৳${taka.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// Display helpers
export function getExchangeRateText(): string {
  return `${COINS_PER_TAKA} Coins = 1 BDT`;
}

export function getAdEarningsText(): string {
  return `Earn ${COINS_PER_AD} coins per ad`;
}

export function getConversionFeeText(): string {
  return `${CONVERSION_FEE_RATE * 100}% conversion fee`;
}
