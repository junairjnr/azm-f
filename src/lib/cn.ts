import { type ClassValue, clsx } from 'clsx';

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export type CardVariant = 'liquid' | 'liquid-gold' | 'glass' | 'clay' | 'neo';

export const cardVariants: Record<CardVariant, string> = {
  liquid: 'card-liquid',
  'liquid-gold': 'card-liquid-gold',
  glass: 'card-glass',
  clay: 'card-clay',
  neo: 'card-neo',
};
