import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getBookingByIdApi } from '../../services/bookingService';
import { sendBookingConfirmationNotification } from '../../utils/notifications';
import { Booking } from '../../types';
import { PrimaryButton } from '../../components/PrimaryButton';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorState } from '../../components/ErrorState';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';
import { formatDate, formatTime, formatPrice } from '../../utils/formatters';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    const fetchBooking = async () => {
      try {
        const data = await getBookingByIdApi(bookingId);
        setBooking(data);

        // Fire local notification
        if (data.event?.title && data.bookingReference) {
          sendBookingConfirmationNotification(data.event.title, data.bookingReference);
        }
      } catch (err: any) {
        setError(err.message || 'Unable to load confirmation details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (isLoading) {
    return <LoadingIndicator message="Generating booking ticket..." fullScreen />;
  }

  if (error || !booking) {
    return <ErrorState message={error || 'Booking details not found.'} onRetry={() => router.replace('/(user)')} />;
  }

  const event = booking.event;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Success Icon Badge */}
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark-circle" size={64} color={COLORS.success} />
        </View>

        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>
          Your seats are reserved. Present your booking reference upon entry.
        </Text>

        {/* Ticket Confirmation Card */}
        <View style={styles.ticketCard}>
          <View style={styles.refHeader}>
            <Text style={styles.refLabel}>Booking Reference</Text>
            <Text style={styles.refCode}>{booking.bookingReference}</Text>
          </View>

          <View style={styles.dashedDivider} />

          <View style={styles.ticketBody}>
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

            <View style={styles.detailsGrid}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Tickets</Text>
                <Text style={styles.gridValue}>{booking.ticketQuantity} Ticket(s)</Text>
              </View>

              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Total Amount</Text>
                <Text style={[styles.gridValue, { color: COLORS.primary }]}>
                  {formatPrice(booking.totalPrice)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Actions Buttons */}
        <View style={styles.actionsContainer}>
          <PrimaryButton
            title="View My Bookings"
            onPress={() => router.replace('/(user)/bookings')}
            style={styles.primaryBtn}
          />

          <PrimaryButton
            title="Back to Home"
            onPress={() => router.replace('/(user)')}
            variant="outline"
            style={styles.outlineBtn}
          />
        </View>
      </ScrollView>
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
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'center',
  },
  successIconCircle: {
    width: 90,
    height: 90,
    borderRadius: RADIUS.full,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  ticketCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: SPACING.xl,
  },
  refHeader: {
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  refLabel: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  refCode: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.surface,
    letterSpacing: 2,
    marginTop: 2,
  },
  dashedDivider: {
    height: 1,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
  },
  ticketBody: {
    padding: SPACING.xl,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
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
    flexDirection: 'row',
    backgroundColor: '#F8F9FC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginTop: SPACING.lg,
    justifyContent: 'space-around',
  },
  gridItem: {
    alignItems: 'center',
  },
  gridLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  gridValue: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  actionsContainer: {
    width: '100%',
    gap: SPACING.md,
  },
  primaryBtn: {
    width: '100%',
  },
  outlineBtn: {
    width: '100%',
  },
});
