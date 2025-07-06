import tokens from '../data/designLanguage.json';

export type DesignTokens = typeof tokens;

export const designTokens = tokens;
 
export function getToken(path: string): any {
  return path.split('.').reduce((obj, key) => (obj && obj[key] !== undefined ? obj[key] : undefined), tokens);
} 