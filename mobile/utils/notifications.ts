import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestNotificationPermissions = async (): Promise<boolean> => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  } catch (error) {
    console.warn('Failed to request notification permissions:', error);
    return false;
  }
};

export const sendBookingConfirmationNotification = async (eventName: string, bookingRef: string) => {
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
    console.warn('Failed to send confirmation notification:', error);
  }
};

export const sendBookingCancellationNotification = async (eventName: string) => {
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
    console.warn('Failed to send cancellation notification:', error);
  }
};
