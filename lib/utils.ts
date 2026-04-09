import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn/ui's `cn` helper — merges Tailwind classes with conflict resolution.
 * This is the one utility every shadcn component imports.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
