import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

// Safe check: expo-notifications push functionality is disabled in Expo Go on SDK 53+
const isExpoGo = Constants.appOwnership === 'expo';

// Configure notification behavior safely
try {
  if (!isExpoGo) {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });
  }
} catch (e) {
  console.warn('[Notifications] setNotificationHandler skipped in current environment:', e);
}

export const requestNotificationPermissions = async (): Promise<boolean> => {
  if (isExpoGo) return false;
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
  if (isExpoGo) return;
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🎉 Booking Confirmed!',
        body: `You're going to ${eventName}. Reference: ${bookingRef}`,
        data: { type: 'booking_confirmation', bookingRef },
      },
      trigger: null, // trigger immediately
    });
  } catch (error) {
    console.warn('[Notifications] Failed to send confirmation notification:', error);
  }
};

export const sendBookingCancellationNotification = async (eventName: string) => {
  if (isExpoGo) return;
  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '❌ Booking Cancelled',
        body: `Your booking for ${eventName} has been cancelled successfully.`,
        data: { type: 'booking_cancellation' },
      },
      trigger: null, // trigger immediately
    });
  } catch (error) {
    console.warn('[Notifications] Failed to send cancellation notification:', error);
  }
};

