import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { getOrganizerEventByIdApi, deleteOrganizerEventApi } from '../../../services/organizerService';
import { Event } from '../../../types';
import { ScreenHeader } from '../../../components/ScreenHeader';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { LoadingIndicator } from '../../../components/LoadingIndicator';
import { ErrorState } from '../../../components/ErrorState';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { COLORS, RADIUS, SPACING } from '../../../constants/theme';
import { formatDate, formatTime, formatPrice } from '../../../utils/formatters';

export default function OrganizerEventDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchEvent = async () => {
      try {
        const data = await getOrganizerEventByIdApi(id);
        setEvent(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load event details.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleConfirmDelete = async () => {
    if (!event) return;
    setIsDeleting(true);
    try {
      await deleteOrganizerEventApi(event.id);
      setShowDeleteModal(false);
      Alert.alert('Success', 'Event deleted successfully.', [
        { text: 'OK', onPress: () => router.replace('/(organizer)/events') },
      ]);
    } catch (err: any) {
      Alert.alert('Cannot Delete Event', err.message || 'Failed to delete event.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return <LoadingIndicator message="Loading event details..." fullScreen />;
  }

  if (error || !event) {
    return <ErrorState message={error || 'Event not found.'} onRetry={() => router.back()} />;
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80';
  const bookedSeats = event.totalSeats - event.availableSeats;

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader
        title="Manage Event"
        showBack
        rightAction={
          <TouchableOpacity
            onPress={() => router.push({ pathname: '/organizer/event/edit', params: { id: event.id } })}
            style={{ padding: 4 }}
          >
            <Ionicons name="create-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={{ uri: event.imageUrl || defaultImage }}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.contentCard}>
          <Text style={styles.title}>{event.title}</Text>
          <Text style={styles.categoryBadge}>{event.category}</Text>

          {/* Seat Capacity Statistics Box */}
          <View style={styles.statsCard}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Capacity</Text>
              <Text style={styles.statVal}>{event.totalSeats}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Booked Seats</Text>
              <Text style={[styles.statVal, { color: COLORS.primary }]}>{bookedSeats}</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Available Seats</Text>
              <Text style={[styles.statVal, { color: COLORS.success }]}>{event.availableSeats}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
            <Text style={styles.detailText}>
              {formatDate(event.date)} at {formatTime(event.time)}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <Text style={styles.detailText}>{event.location}</Text>
          </View>

          <View style={styles.detailRow}>
            <Ionicons name="cash-outline" size={18} color={COLORS.primary} />
            <Text style={styles.detailText}>{formatPrice(event.price)} per ticket</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{event.description}</Text>
          </View>

          <View style={styles.actionsContainer}>
            <PrimaryButton
              title="View Customer Bookings"
              onPress={() => router.push({ pathname: '/organizer/event/bookings', params: { id: event.id } })}
              icon={<Ionicons name="people-outline" size={20} color={COLORS.surface} />}
            />

            <PrimaryButton
              title="Edit Event Details"
              onPress={() => router.push({ pathname: '/organizer/event/edit', params: { id: event.id } })}
              variant="outline"
            />

            <PrimaryButton
              title="Delete Event"
              onPress={() => setShowDeleteModal(true)}
              variant="danger"
            />
          </View>
        </View>
      </ScrollView>

      <ConfirmDialog
        visible={showDeleteModal}
        title="Delete Event"
        message={`Are you sure you want to delete "${event.title}"?\n\nEvents with active bookings cannot be deleted.`}
        confirmText="Delete Event"
        cancelText="Cancel"
        isDanger
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteModal(false)}
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
    paddingBottom: SPACING.xl,
  },
  image: {
    width: '100%',
    height: 200,
    backgroundColor: '#E5E7EB',
  },
  contentCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    marginTop: -RADIUS.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#EEF2FF',
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: RADIUS.sm,
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  statsCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#F8F9FC',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
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
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  detailText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: SPACING.sm,
  },
  section: {
    marginTop: SPACING.md,
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  description: {
    fontSize: 14,
    color: COLORS.secondaryText,
    lineHeight: 22,
  },
  actionsContainer: {
    gap: SPACING.md,
  },
});
