import { Upgrade } from './types';

export const INITIAL_UPGRADES: Upgrade[] = [
  {
    id: 'clover_leaf',
    name: 'Lucky Clover',
    description: 'A three-leaf clover found in the garden.',
    baseCost: 15,
    currentCost: 15,
    cps: 0.5,
    count: 0,
    icon: '🍀'
  },
  {
    id: 'wood_bowl',
    name: 'Wooden Bowl',
    description: 'Rustic dining ware.',
    baseCost: 100,
    currentCost: 100,
    cps: 3,
    count: 0,
    icon: '🥣'
  },
  {
    id: 'straw_hat',
    name: 'Straw Hat',
    description: 'Essential for sunny travels.',
    baseCost: 500,
    currentCost: 500,
    cps: 10,
    count: 0,
    icon: '👒'
  },
  {
    id: 'frog_friend',
    name: 'Frog Friend',
    description: 'A travel companion who brings gifts.',
    baseCost: 2000,
    currentCost: 2000,
    cps: 40,
    count: 0,
    icon: '🐸'
  },
  {
    id: 'tree_house',
    name: 'Tree House',
    description: 'A cozy home high in the branches.',
    baseCost: 10000,
    currentCost: 10000,
    cps: 150,
    count: 0,
    icon: '🌳'
  },
  {
    id: 'hot_spring',
    name: 'Hot Spring',
    description: 'Relaxing natural onsen.',
    baseCost: 50000,
    currentCost: 50000,
    cps: 500,
    count: 0,
    icon: '♨️'
  }
];

export const COLOR_PALETTE = {
  bg: 'bg-[#f9f8f2]',
  primary: 'bg-[#89c965]', // Clover Green
  secondary: 'bg-[#8d6e63]', // Wood Brown
  accent: 'bg-[#ffecb3]', // Soft Yellow
  text: 'text-[#5d5555]'
};