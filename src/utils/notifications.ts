import { NotificationLog, TicketRecord } from '../types';

export class NotificationManager {
  private static STORAGE_KEY = 'planet_asahi_notifications';

  public static async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await this.sendLocalNotification(
          '搭乗整理券の呼出通知が設定されました',
          '順番になりましたらこちらの端末へ通知が届きます。',
          'asahi-setup-notification'
        );
      }
      return permission;
    } catch {
      return 'denied';
    }
  }

  public static getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  public static async sendLocalNotification(title: string, body: string, tag?: string): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {}
    }

    if (Notification.permission !== 'granted') {
      return;
    }

    try {
      const iconUrl = `${import.meta.env.BASE_URL || './'}pwa-192x192.png`;
      const badgeUrl = `${import.meta.env.BASE_URL || './'}favicon.png`;
      const notifTag = tag || 'asahi-ticket-call';

      const notifOptions: NotificationOptions = {
        body,
        icon: iconUrl,
        badge: badgeUrl,
        tag: notifTag,
        renotify: true,
        vibrate: [200, 100, 200],
        data: {
          url: typeof window !== 'undefined' ? window.location.href : '/',
          timestamp: Date.now()
        }
      } as NotificationOptions;

      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && reg.showNotification) {
            await reg.showNotification(title, notifOptions);
            return;
          }
        } catch {}
      }

      new Notification(title, {
        body,
        icon: iconUrl,
        badge: badgeUrl,
        tag: notifTag
      });
    } catch {}
  }

  public static async sendCallNotification(ticket: TicketRecord): Promise<NotificationLog> {
    const title = `【2年K組】お呼出（整理券 #${ticket.ticketNumber}）`;
    const name = ticket.representativeName || ticket.name;
    const body = `${name} 様、順番になりました！2年K組「今日、迷子になりました。～惑星朝日編～」入口へお越しください。`;
    const tag = `call-${ticket.id}`;

    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([200, 100, 200]);
      } catch {}
    }

    await this.sendLocalNotification(title, body, tag);

    const log: NotificationLog = {
      id: 'NOTIF-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      ticketId: ticket.id,
      recipientEmail: ticket.email || '',
      recipientName: name,
      title,
      body,
      sentAt: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: Notification.permission === 'granted' ? 'delivered' : 'simulated'
    };

    this.saveNotificationLog(log);
    return log;
  }

  public static async sendPushNotification(
    ticketId: string,
    recipientEmail: string,
    recipientName: string,
    title: string,
    body: string
  ): Promise<NotificationLog> {
    const log: NotificationLog = {
      id: 'NOTIF-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5),
      ticketId,
      recipientEmail,
      recipientName,
      title,
      body,
      sentAt: new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      status: 'simulated'
    };

    await this.sendLocalNotification(title, body, `call-${ticketId}`);
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      log.status = 'delivered';
    }

    this.saveNotificationLog(log);
    return log;
  }

  public static getNotificationLogs(): NotificationLog[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  public static saveNotificationLog(log: NotificationLog) {
    if (typeof window === 'undefined') return;
    try {
      const current = this.getNotificationLogs();
      const updated = [log, ...current].slice(0, 50);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }

  public static clearLogs() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
