/**
 * Category color mappings for consistent visualization
 * Uses HSL colors that work in both light and dark modes
 */

const CATEGORY_COLOR_MAP: Record<string, { light: string; dark: string }> = {
  // Layer 1 & Infrastructure
  'Layer 1': { light: 'hsl(217, 91%, 60%)', dark: 'hsl(217, 91%, 70%)' },
  'Smart Contract Platform': { light: 'hsl(262, 83%, 58%)', dark: 'hsl(262, 83%, 68%)' },
  'Ethereum Ecosystem': { light: 'hsl(262, 52%, 47%)', dark: 'hsl(262, 52%, 57%)' },
  
  // DeFi
  'Decentralized Finance (DeFi)': { light: 'hsl(142, 71%, 45%)', dark: 'hsl(142, 71%, 55%)' },
  'Decentralized Exchange (DEX)': { light: 'hsl(158, 64%, 52%)', dark: 'hsl(158, 64%, 62%)' },
  'Lending/Borrowing': { light: 'hsl(173, 80%, 40%)', dark: 'hsl(173, 80%, 50%)' },
  'Yield Farming': { light: 'hsl(142, 76%, 36%)', dark: 'hsl(142, 76%, 46%)' },
  'Liquid Staking': { light: 'hsl(199, 89%, 48%)', dark: 'hsl(199, 89%, 58%)' },
  
  // Stablecoins
  'Stablecoins': { light: 'hsl(84, 81%, 44%)', dark: 'hsl(84, 81%, 54%)' },
  'Algorithmic Stablecoin': { light: 'hsl(84, 65%, 55%)', dark: 'hsl(84, 65%, 65%)' },
  
  // Gaming & Metaverse
  'Gaming': { light: 'hsl(291, 64%, 42%)', dark: 'hsl(291, 64%, 52%)' },
  'Metaverse': { light: 'hsl(271, 81%, 56%)', dark: 'hsl(271, 81%, 66%)' },
  'NFT': { light: 'hsl(340, 82%, 52%)', dark: 'hsl(340, 82%, 62%)' },
  'Play To Earn': { light: 'hsl(291, 47%, 51%)', dark: 'hsl(291, 47%, 61%)' },
  
  // AI & Data
  'Artificial Intelligence': { light: 'hsl(280, 100%, 60%)', dark: 'hsl(280, 100%, 70%)' },
  'Big Data': { light: 'hsl(207, 90%, 54%)', dark: 'hsl(207, 90%, 64%)' },
  'Oracle': { light: 'hsl(217, 71%, 53%)', dark: 'hsl(217, 71%, 63%)' },
  
  // Privacy & Security
  'Privacy Coins': { light: 'hsl(0, 0%, 40%)', dark: 'hsl(0, 0%, 60%)' },
  'Zero Knowledge Proof': { light: 'hsl(0, 0%, 30%)', dark: 'hsl(0, 0%, 70%)' },
  
  // Infrastructure
  'Interoperability': { light: 'hsl(24, 95%, 53%)', dark: 'hsl(24, 95%, 63%)' },
  'Scaling': { light: 'hsl(201, 96%, 32%)', dark: 'hsl(201, 96%, 42%)' },
  'Storage': { light: 'hsl(43, 96%, 56%)', dark: 'hsl(43, 96%, 66%)' },
  
  // Meme & Community
  'Meme': { light: 'hsl(51, 100%, 50%)', dark: 'hsl(51, 100%, 60%)' },
  'Dog Themed': { light: 'hsl(38, 92%, 50%)', dark: 'hsl(38, 92%, 60%)' },
  
  // Real World Assets
  'Real World Assets': { light: 'hsl(16, 100%, 50%)', dark: 'hsl(16, 100%, 60%)' },
  'Tokenized Real Estate': { light: 'hsl(27, 98%, 54%)', dark: 'hsl(27, 98%, 64%)' },
  
  // Exchange & Trading
  'Centralized Exchange (CEX)': { light: 'hsl(203, 89%, 53%)', dark: 'hsl(203, 89%, 63%)' },
  'Exchange-based Tokens': { light: 'hsl(211, 100%, 50%)', dark: 'hsl(211, 100%, 60%)' },
  
  // Fallback
  'Uncategorized': { light: 'hsl(0, 0%, 50%)', dark: 'hsl(0, 0%, 60%)' },
};

/**
 * Generates a deterministic color from a string using HSL
 */
function hashStringToHSL(str: string, isDarkMode: boolean): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  const hue = Math.abs(hash % 360);
  const saturation = 65 + (Math.abs(hash) % 20); // 65-85%
  const lightness = isDarkMode ? 60 : 45; // Lighter in dark mode
  
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

/**
 * Get color for a category name
 */
export function getCategoryColor(category: string, isDarkMode: boolean = true): string {
  const colors = CATEGORY_COLOR_MAP[category];
  
  if (colors) {
    return isDarkMode ? colors.dark : colors.light;
  }
  
  // Generate deterministic color for unmapped categories
  return hashStringToHSL(category, isDarkMode);
}

/**
 * Get all predefined category names
 */
export function getPredefinedCategories(): string[] {
  return Object.keys(CATEGORY_COLOR_MAP).filter(cat => cat !== 'Uncategorized');
}
