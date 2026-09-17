import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getBookingByIdApi, cancelBookingApi } from '../../services/bookingService';
import { sendBookingCancellationNotification } from '../../utils/notifications';
import { Booking } from '../../types';
import { ScreenHeader } from '../../components/ScreenHeader';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorState } from '../../components/ErrorState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { formatDate, formatTime, formatPrice } from '../../utils/formatters';

export default function SingleBookingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      const data = await getBookingByIdApi(id);
      setBooking(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load booking details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleConfirmCancel = async () => {
    if (!booking) return;
    setIsCancelling(true);
    try {
      await cancelBookingApi(booking.id);
      sendBookingCancellationNotification(booking.event?.title || 'Event');
      await fetchDetails();
      setShowCancelModal(false);
      Alert.alert('Booking Cancelled', 'Your booking has been cancelled and seats restored.');
    } catch (err: any) {
      Alert.alert('Cancellation Error', err.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator message="Loading booking details..." fullScreen />;
  }

  if (error || !booking) {
    return <ErrorState message={error || 'Booking not found.'} onRetry={() => router.back()} />;
  }

  const event = booking.event;
  const isCancellable = booking.status === 'CONFIRMED';

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return styles.statusConfirmed;
      case 'CANCELLED':
        return styles.statusCancelled;
      default:
        return styles.statusCompleted;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Booking Details" showBack />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.statusRow}>
            <Text style={styles.refCode}>{booking.bookingReference}</Text>
            <View style={[styles.statusBadge, getBadgeStyle(booking.status)]}>
              <Text style={styles.statusText}>{booking.status}</Text>
            </View>
          </View>

          <View style={styles.eventSection}>
            <Text style={styles.eventTitle}>{event?.title}</Text>
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {formatDate(event?.date || '')} • {formatTime(event?.time || '')}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={16} color={COLORS.secondaryText} />
              <Text style={styles.infoText}>{event?.location}</Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.gridRow}>
              <Text style={styles.label}>Ticket Quantity</Text>
              <Text style={styles.val}>{booking.ticketQuantity} Ticket(s)</Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.label}>Total Price</Text>
              <Text style={[styles.val, { color: COLORS.primary, fontWeight: '800' }]}>
                {formatPrice(booking.totalPrice)}
              </Text>
            </View>
            <View style={styles.gridRow}>
              <Text style={styles.label}>Contact Phone</Text>
              <Text style={styles.val}>{booking.phone}</Text>
            </View>
            {booking.note ? (
              <View style={styles.gridRow}>
                <Text style={styles.label}>Special Note</Text>
                <Text style={styles.val}>{booking.note}</Text>
              </View>
            ) : null}
          </View>

          {isCancellable && (
            <PrimaryButton
              title="Cancel Booking"
              onPress={() => setShowCancelModal(true)}
              variant="danger"
              style={styles.cancelBtn}
            />
          )}
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showCancelModal}
        title="Cancel Booking"
        message={`Are you sure you want to cancel your booking for "${event?.title}"?`}
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        isDanger
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setShowCancelModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  refCode: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.primary,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
  },
  statusConfirmed: {
    backgroundColor: '#ECFDF5',
  },
  statusCancelled: {
    backgroundColor: '#FEF2F2',
  },
  statusCompleted: {
    backgroundColor: '#F3F4F6',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },
  eventSection: {
    marginBottom: SPACING.lg,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginLeft: 6,
  },
  detailsGrid: {
    backgroundColor: '#F8F9FC',
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    gap: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    color: COLORS.secondaryText,
  },
  val: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  cancelBtn: {
    marginTop: SPACING.xl,
  },
});
