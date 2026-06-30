declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        showAlert: (msg: string, cb?: () => void) => void;
        initDataUnsafe?: {
          user?: { id?: number; first_name?: string; username?: string };
        };
      };
    };
  }
}

export const tg = window.Telegram?.WebApp;

export function initTelegram() {
  tg?.ready();
  tg?.expand();
}

export function getTelegramUser() {
  return tg?.initDataUnsafe?.user;
}
