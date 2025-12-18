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
  startTime: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

export enum OracleMode {
  WISDOM = 'WISDOM',
  NAME = 'NAME',
  STORY = 'STORY'
}