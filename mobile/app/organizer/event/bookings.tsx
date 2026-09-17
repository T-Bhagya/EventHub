import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getEventBookingsApi } from '../../../services/organizerService';
import { EventBookingsSummary } from '../../../types';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ErrorState } from '../../../components/ErrorState';
import { EmptyState } from '../../../components/EmptyState';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { formatDate, formatPrice } from '../../../utils/formatters';

export default function EventBookingsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [summaryData, setSummaryData] = useState<EventBookingsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    if (!id) return;
    setError(null);
    try {
      const data = await getEventBookingsApi(id);
      setSummaryData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [id]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBookings();
  };

  if (isLoading && !isRefreshing) {
    return <LoadingIndicator message="Loading customer bookings..." fullScreen />;
  }

  if (error || !summaryData) {
    return <ErrorState message={error || 'Event not found.'} onRetry={() => router.back()} />;
  }

  const { event, summary, bookings } = summaryData;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader title="Event Bookings" showBack />

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
        }
        ListHeaderComponent={
          <View style={styles.headerCard}>
            <Text style={styles.eventTitle}>{event.title}</Text>

            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Bookings</Text>
                <Text style={styles.statVal}>{summary.totalConfirmedBookings}</Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Tickets Reserved</Text>
                <Text style={[styles.statVal, { color: COLORS.primary }]}>
                  {summary.totalTicketsReserved}
                </Text>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Available Seats</Text>
                <Text style={[styles.statVal, { color: COLORS.success }]}>{summary.availableSeats}</Text>
              </View>
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            iconName="people-outline"
            title="No Bookings Yet"
            description="No attendees have booked tickets for this event so far."
          />
        }
        renderItem={({ item }) => (
          <View style={styles.bookingItemCard}>
            <View style={styles.itemHeader}>
              <View style={styles.userCol}>
                <Text style={styles.userName}>{item.user?.name || 'Customer'}</Text>
                <Text style={styles.userEmail}>{item.user?.email || 'N/A'}</Text>
              </View>

              <View style={[styles.statusBadge, item.status === 'CONFIRMED' ? styles.statusConfirmed : styles.statusCancelled]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>

            <View style={styles.itemDetailsGrid}>
              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Ref Code</Text>
                <Text style={styles.detailVal}>{item.bookingReference}</Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Quantity</Text>
                <Text style={styles.detailVal}>{item.ticketQuantity} Ticket(s)</Text>
              </View>

              <View style={styles.detailBox}>
                <Text style={styles.detailLabel}>Total Paid</Text>
                <Text style={[styles.detailVal, { color: COLORS.primary }]}>{formatPrice(item.totalPrice)}</Text>
              </View>
            </View>

            <View style={styles.phoneRow}>
              <Ionicons name="call-outline" size={14} color={COLORS.secondaryText} />
              <Text style={styles.phoneText}>Phone: {item.phone}</Text>
              <Text style={styles.dateText}>Booked: {formatDate(item.createdAt.split('T')[0])}</Text>
            </View>

            {item.note ? (
              <View style={styles.noteBox}>
                <Text style={styles.noteText}>Note: "{item.note}"</Text>
              </View>
            ) : null}
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  headerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    padding: SPACING.xl,
    marginVertical: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.border,
  },
  bookingItemCard: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  userCol: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm + 2,
    paddingVertical: 2,
    borderRadius: RADIUS.sm,
  },
  statusConfirmed: {
    backgroundColor: '#ECFDF5',
  },
  statusCancelled: {
    backgroundColor: '#FEF2F2',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.text,
  },
  itemDetailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FC',
    borderRadius: RADIUS.md,
    padding: SPACING.sm + 2,
    marginBottom: SPACING.sm,
  },
  detailBox: {
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: 10,
    color: COLORS.secondaryText,
    textTransform: 'uppercase',
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  phoneText: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginLeft: 4,
  },
  dateText: {
    fontSize: 11,
    color: COLORS.secondaryText,
  },
  noteBox: {
    marginTop: SPACING.sm,
    padding: SPACING.xs + 2,
    backgroundColor: '#FFFBEB',
    borderRadius: RADIUS.sm,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noteText: {
    fontSize: 12,
    color: '#D97706',
    fontStyle: 'italic',
  },
});
