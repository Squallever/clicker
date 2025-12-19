
export interface Upgrade {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  currentCost: number;
  cps: number; // Clicks (Purrs) Per Second
  count: number;
  icon: string; // Emoji or SVG path
}

export interface GameState {
  purrs: number;
  totalPurrs: number;
  clickCount: number;
  pettingPurrs: number; // Lifetime score from petting
  startTime: number;
  combo: number;
  multiplier: number;
  isFeverMode: boolean;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  isFever?: boolean;
}
