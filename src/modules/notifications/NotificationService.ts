import { Notification, NotificationType } from '../../../libs/ui-components/src/components/Notifications/NotificationTypes';

export interface NotificationConfig {
  maxNotifications: number;
  defaultDuration: number;
  enableSound: boolean;
  enableVibration: boolean;
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
}

class NotificationService {
  private static instance: NotificationService;
  private listeners: Array<(notifications: Notification[]) => void> = [];
  private notifications: Notification[] = [];
  private config: NotificationConfig = {
    maxNotifications: 5,
    defaultDuration: 5000,
    enableSound: false,
    enableVibration: false,
    position: 'top-right',
  };

  private constructor() {
    // Request notification permission if available
    if ('Notification' in window && 'requestPermission' in Notification) {
      Notification.requestPermission();
    }
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Configuration
  configure(config: Partial<NotificationConfig>) {
    this.config = { ...this.config, ...config };
  }

  getConfig(): NotificationConfig {
    return { ...this.config };
  }

  // Event listeners
  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    listener(this.notifications);
    
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  // Core notification methods
  addNotification(notification: Omit<Notification, 'id' | 'timestamp'>): string {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: Date.now(),
    };

    // Add to notifications array
    this.notifications.push(newNotification);

    // Limit number of notifications
    if (this.notifications.length > this.config.maxNotifications) {
      this.notifications = this.notifications.slice(-this.config.maxNotifications);
    }

    // Trigger browser notification if permission granted
    this.triggerBrowserNotification(newNotification);

    // Trigger sound/vibration if enabled
    this.triggerFeedback(newNotification.type);

    // Notify listeners
    this.notifyListeners();

    return newNotification.id;
  }

  removeNotification(id: string): boolean {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index > -1) {
      this.notifications.splice(index, 1);
      this.notifyListeners();
      return true;
    }
    return false;
  }

  clearAllNotifications() {
    this.notifications = [];
    this.notifyListeners();
  }

  // Convenience methods
  showSuccess(title: string, message?: string, duration?: number): string {
    return this.addNotification({
      type: 'success',
      title,
      message,
      duration: duration || this.config.defaultDuration,
    });
  }

  showError(title: string, message?: string, duration?: number): string {
    return this.addNotification({
      type: 'error',
      title,
      message,
      duration: duration || 0, // Errors persist by default
    });
  }

  showWarning(title: string, message?: string, duration?: number): string {
    return this.addNotification({
      type: 'warning',
      title,
      message,
      duration: duration || this.config.defaultDuration,
    });
  }

  showInfo(title: string, message?: string, duration?: number): string {
    return this.addNotification({
      type: 'info',
      title,
      message,
      duration: duration || this.config.defaultDuration,
    });
  }

  // Transaction-specific notifications
  showTransactionSuccess(txHash: string, amount?: string): string {
    return this.addNotification({
      type: 'success',
      title: 'Transaction Successful',
      message: amount ? `Transaction for ${amount} completed` : 'Transaction completed successfully',
      duration: 8000,
      action: {
        label: 'View Transaction',
        onClick: () => {
          window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
        },
      },
    });
  }

  showTransactionError(error: string, txHash?: string): string {
    return this.addNotification({
      type: 'error',
      title: 'Transaction Failed',
      message: error || 'Transaction could not be completed',
      duration: 0, // Persistent
      action: txHash ? {
        label: 'View Details',
        onClick: () => {
          window.open(`https://etherscan.io/tx/${txHash}`, '_blank');
        },
      } : undefined,
    });
  }

  showBridgeCompleted(fromChain: string, toChain: string, amount: string): string {
    return this.addNotification({
      type: 'success',
      title: 'Bridge Completed',
      message: `Successfully bridged ${amount} from ${fromChain} to ${toChain}`,
      duration: 10000,
    });
  }

  showBridgeFailed(fromChain: string, toChain: string, error: string): string {
    return this.addNotification({
      type: 'error',
      title: 'Bridge Failed',
      message: `Failed to bridge from ${fromChain} to ${toChain}: ${error}`,
      duration: 0, // Persistent
    });
  }

  // Private helper methods
  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private triggerBrowserNotification(notification: Notification) {
    if ('Notification' in window && Notification.permission === 'granted') {
      const browserNotification = new Notification(notification.title, {
        body: notification.message,
        icon: this.getNotificationIcon(notification.type),
        tag: notification.id,
      });

      // Auto-close browser notification
      if (notification.duration && notification.duration > 0) {
        setTimeout(() => {
          browserNotification.close();
        }, notification.duration);
      }

      // Focus window when clicked
      browserNotification.onclick = () => {
        window.focus();
        browserNotification.close();
      };
    }
  }

  private triggerFeedback(type: NotificationType) {
    // Sound feedback
    if (this.config.enableSound) {
      this.playNotificationSound(type);
    }

    // Vibration feedback
    if (this.config.enableVibration && 'vibrate' in navigator) {
      const pattern = this.getVibrationPattern(type);
      navigator.vibrate(pattern);
    }
  }

  private getNotificationIcon(type: NotificationType): string {
    // In a real app, these would be actual icon files
    const icons = {
      success: '/icons/success.png',
      error: '/icons/error.png',
      warning: '/icons/warning.png',
      info: '/icons/info.png',
    };
    return icons[type];
  }

  private playNotificationSound(type: NotificationType) {
    // In a real app, these would be actual sound files
    const audio = new Audio();
    switch (type) {
      case 'success':
        audio.src = '/sounds/success.mp3';
        break;
      case 'error':
        audio.src = '/sounds/error.mp3';
        break;
      case 'warning':
        audio.src = '/sounds/warning.mp3';
        break;
      case 'info':
        audio.src = '/sounds/info.mp3';
        break;
    }
    audio.play().catch(() => {
      // Ignore audio play errors (user may not have interacted with page)
    });
  }

  private getVibrationPattern(type: NotificationType): number[] {
    switch (type) {
      case 'success':
        return [100, 50, 100];
      case 'error':
        return [200, 100, 200, 100, 200];
      case 'warning':
        return [150];
      case 'info':
        return [50];
      default:
        return [100];
    }
  }

  // Get current notifications
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Get notification by ID
  getNotification(id: string): Notification | undefined {
    return this.notifications.find(n => n.id === id);
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();
