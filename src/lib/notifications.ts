export async function setupNotifications() {
  try {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    if (Notification.permission === 'default') {
      // Do not force permission popup on load in web/iframe environments unless supported
      return;
    }
  } catch (e) {
    console.log('Local notifications are not available in this environment (likely web).', e);
  }
}
