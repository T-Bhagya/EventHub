import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getMyBookingsApi, cancelBookingApi } from '../../services/bookingService';
import { sendBookingCancellationNotification } from '../../utils/notifications';
import { Booking } from '../../types';
import { BookingCard } from '../../components/BookingCard';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function BookingsScreen() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'upcoming' | 'previous'>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cancel dialog state
  const [selectedBookingToCancel, setSelectedBookingToCancel] = useState<Booking | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = async () => {
    setError(null);
    try {
      const data = await getMyBookingsApi();
      setBookings(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch your bookings.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchBookings();
  };

  const handleCancelPress = (booking: Booking) => {
    setSelectedBookingToCancel(booking);
  };

  const handleConfirmCancel = async () => {
    if (!selectedBookingToCancel) return;

    setIsCancelling(true);
    try {
      await cancelBookingApi(selectedBookingToCancel.id);
      
      // Local notification trigger
      sendBookingCancellationNotification(selectedBookingToCancel.event?.title || 'Event');

      // Refresh list
      await fetchBookings();
      setSelectedBookingToCancel(null);
    } catch (err: any) {
      Alert.alert('Cancellation Failed', err.message || 'Could not cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingBookings = bookings.filter((b) => {
    const isUpcomingDate = b.event ? b.event.date >= todayStr : true;
    return isUpcomingDate && (b.status === 'CONFIRMED' || b.status === 'CANCELLED');
  });

  const previousBookings = bookings.filter((b) => {
    const isPastDate = b.event ? b.event.date < todayStr : false;
    return isPastDate || b.status === 'COMPLETED';
  });

  const currentList = activeTab === 'upcoming' ? upcomingBookings : previousBookings;

  return (
    <SafeAreaView style={styles.container}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
      </View>

      {/* Segmented Control Tabs */}
      <View style={styles.tabBarContainer}>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'upcoming' && styles.activeTabButton]}
            onPress={() => setActiveTab('upcoming')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
              Upcoming ({upcomingBookings.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'previous' && styles.activeTabButton]}
            onPress={() => setActiveTab('previous')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'previous' && styles.activeTabText]}>
              Previous ({previousBookings.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List content */}
      {isLoading && !isRefreshing ? (
        <LoadingIndicator message="Loading your bookings..." fullScreen={false} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBookings} />
      ) : (
        <FlatList
          data={currentList}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="ticket-outline"
              title={activeTab === 'upcoming' ? 'No upcoming bookings' : 'No previous bookings'}
              description={
                activeTab === 'upcoming'
                  ? "You haven't booked any upcoming events yet. Explore events and book your tickets today!"
                  : "You don't have any past completed event bookings."
              }
              buttonTitle={activeTab === 'upcoming' ? 'Explore Events' : undefined}
              onButtonPress={activeTab === 'upcoming' ? () => router.push('/(user)/explore') : undefined}
            />
          }
          renderItem={({ item }) => (
            <BookingCard
              booking={item}
              onView={() => router.push(`/booking/${item.id}`)}
              onCancel={item.status === 'CONFIRMED' ? () => handleCancelPress(item) : undefined}
            />
          )}
        />
      )}

      {/* Cancel Confirmation Modal Dialog */}
      <ConfirmDialog
        visible={!!selectedBookingToCancel}
        title="Cancel Booking"
        message={`Are you sure you want to cancel your booking for "${selectedBookingToCancel?.event?.title}"?\n\nThis will release your seats back to event availability.`}
        confirmText="Cancel Booking"
        cancelText="Keep Booking"
        isDanger
        isLoading={isCancelling}
        onConfirm={handleConfirmCancel}
        onCancel={() => setSelectedBookingToCancel(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xs,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  tabBarContainer: {
    paddingHorizontal: SPACING.xl,
    marginVertical: SPACING.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: RADIUS.md,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: SPACING.sm,
    alignItems: 'center',
    borderRadius: RADIUS.sm,
  },
  activeTabButton: {
    backgroundColor: COLORS.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.secondaryText,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
});
