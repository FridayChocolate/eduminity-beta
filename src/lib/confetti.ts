import confetti from "canvas-confetti";

export const fireConfetti = () => {
  const colors = ["#14b8a6", "#8b5cf6", "#f59e0b", "#38bdf8"];

  // Left cannon
  confetti({
    particleCount: 55,
    angle: 60,
    spread: 60,
    origin: { x: 0, y: 0.7 },
    colors,
  });

  // Right cannon
  confetti({
    particleCount: 55,
    angle: 120,
    spread: 60,
    origin: { x: 1, y: 0.7 },
    colors,
  });
};