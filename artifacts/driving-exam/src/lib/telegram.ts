declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        showAlert: (message: string, callback?: () => void) => void;
        initDataUnsafe?: {
          user?: {
            id?: number;
            first_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}

export const tg = window.Telegram?.WebApp;

export function getTelegramUser() {
  return tg?.initDataUnsafe?.user;
}

export function showAlert(msg: string): Promise<void> {
  return new Promise((resolve) => {
    if (tg) {
      tg.showAlert(msg, resolve);
    } else {
      alert(msg);
      resolve();
    }
  });
}

export function initTelegram() {
  if (tg) {
    tg.ready();
    tg.expand();
  }
}
