import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getOrganizerEventsApi, deleteOrganizerEventApi } from '../../services/organizerService';
import { Event } from '../../types';
import { OrganizerEventCard } from '../../components/OrganizerEventCard';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorState } from '../../components/ErrorState';
import { EmptyState } from '../../components/EmptyState';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { COLORS, SPACING } from '../../constants/theme';

export default function MyEventsScreen() {
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete dialog state
  const [selectedEventToDelete, setSelectedEventToDelete] = useState<Event | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrganizerEvents = async () => {
    setError(null);
    try {
      const data = await getOrganizerEventsApi();
      setEvents(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your events.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrganizerEvents();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchOrganizerEvents();
  };

  const handleDeletePress = (event: Event) => {
    setSelectedEventToDelete(event);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEventToDelete) return;

    setIsDeleting(true);
    try {
      await deleteOrganizerEventApi(selectedEventToDelete.id);
      await fetchOrganizerEvents();
      setSelectedEventToDelete(null);
      Alert.alert('Success', 'Event deleted successfully.');
    } catch (err: any) {
      Alert.alert('Cannot Delete Event', err.message || 'Could not delete event.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Events</Text>
      </View>

      {isLoading && !isRefreshing ? (
        <LoadingIndicator message="Loading your events..." fullScreen={false} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchOrganizerEvents} />
      ) : (
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyState
              iconName="calendar-outline"
              title="You haven't created any events yet"
              description="Start hosting events by clicking the Create Event button below!"
              buttonTitle="Create Event"
              onButtonPress={() => router.push('/(organizer)/create')}
            />
          }
          renderItem={({ item }) => (
            <OrganizerEventCard
              event={item}
              onView={() => router.push(`/organizer/event/${item.id}`)}
              onEdit={() => router.push({ pathname: '/organizer/event/edit', params: { id: item.id } })}
              onDelete={() => handleDeletePress(item)}
              onViewBookings={() => router.push({ pathname: '/organizer/event/bookings', params: { id: item.id } })}
            />
          )}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        visible={!!selectedEventToDelete}
        title="Delete Event"
        message={`Are you sure you want to delete "${selectedEventToDelete?.title}"?\n\nThis action cannot be undone.`}
        confirmText="Delete Event"
        cancelText="Cancel"
        isDanger
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setSelectedEventToDelete(null)}
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
  listContent: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl,
  },
});
