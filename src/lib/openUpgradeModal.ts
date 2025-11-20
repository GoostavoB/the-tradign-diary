import { UpgradeSource, UpgradeIllustration } from '@/components/UpgradeModal';

/**
 * Configuration for opening the upgrade modal
 */
export interface UpgradeModalConfig {
  source: UpgradeSource;
  title?: string;
  message?: string;
  illustration?: UpgradeIllustration;
  requiredPlan?: 'starter' | 'pro' | 'elite';
  onPlanSelected?: (planId: string) => void;
  onDismiss?: () => void;
}

/**
 * Global event bus for upgrade modal
 * This allows opening the modal from anywhere without requiring the hook
 */
class UpgradeModalEventBus {
  private listeners: Array<(config: UpgradeModalConfig) => void> = [];

  subscribe(listener: (config: UpgradeModalConfig) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(config: UpgradeModalConfig) {
    this.listeners.forEach((listener) => listener(config));
  }
}

export const upgradeModalBus = new UpgradeModalEventBus();

/**
 * Open the upgrade modal from anywhere in the application
 *
 * @example
 * // In upload handler
 * if (!isAdmin && creditsRemaining === 0) {
 *   openUpgradeModal({
 *     source: 'upload_zero_credits',
 *     illustration: 'credits'
 *   });
 *   return;
 * }
 *
 * @example
 * // With custom message
 * openUpgradeModal({
 *   source: 'feature_lock',
 *   requiredPlan: 'pro',
 *   title: 'Advanced Analytics',
 *   message: 'This feature requires Pro plan or higher.'
 * });
 */
export function openUpgradeModal(config: UpgradeModalConfig): void {
  upgradeModalBus.emit(config);
}
