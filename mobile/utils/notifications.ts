import Constants from 'expo-constants';

// Only load expo-notifications if NOT running in Expo Go (since SDK 53+ removed push from Expo Go)
let Notifications: typeof import('expo-notifications') | null = null;

if (Constants.appOwnership !== 'expo') {
  try {
    Notifications = require('expo-notifications');
    Notifications?.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (e) {
    console.warn('[Notifications] Failed to initialize expo-notifications:', e);
  }
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (!Notifications) return false;
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('[Notifications] Failed to request permissions:', error);
    return false;
  }
};

export const sendBookingConfirmationNotification = async (eventName: string, bookingRef: string) => {
  if (!Notifications) return;
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Booking Confirmed!',
        body: `You're going to ${eventName}. Reference: ${bookingRef}`,
        data: { type: 'booking_confirmation', bookingRef },
      },
      trigger: null,
    });
  } catch (error) {
    console.warn('[Notifications] Failed to send confirmation notification:', error);
  }
};

export const sendBookingCancellationNotification = async (eventName: string) => {
  if (!Notifications) return;
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '❌ Booking Cancelled',
        body: `Your booking for ${eventName} has been cancelled successfully.`,
        data: { type: 'booking_cancellation' },
      },
      trigger: null,
    });
  } catch (error) {
    console.warn('[Notifications] Failed to send cancellation notification:', error);
  }
};


