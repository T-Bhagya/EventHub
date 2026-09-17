import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { getDashboardStatsApi } from '../../services/organizerService';
import { DashboardStats } from '../../types';
import { LoadingIndicator } from '../../components/LoadingIndicator';
import { ErrorState } from '../../components/ErrorState';
import { EventCard } from '../../components/EventCard';
import { COLORS, RADIUS, SPACING } from '../../constants/theme';

export default function OrganizerDashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setError(null);
    try {
      const data = await getDashboardStatsApi();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchStats();
    }, [])
  );

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchStats();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome, {user?.name?.split(' ')[0] || 'Organizer'} 🎪</Text>
          <Text style={styles.subheading}>Organizer Management Dashboard</Text>
        </View>
        <TouchableOpacity style={styles.createIconButton} onPress={() => router.push('/(organizer)/create')}>
          <Ionicons name="add" size={24} color={COLORS.surface} />
        </TouchableOpacity>
      </View>

      {isLoading && !isRefreshing ? (
        <LoadingIndicator message="Loading dashboard statistics..." fullScreen={false} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStats} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[COLORS.primary]} />}
        >
          {/* Analytics Stats Grid */}
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="calendar-outline" size={22} color={COLORS.primary} />
              </View>
              <Text style={styles.statNumber}>{stats?.totalEvents || 0}</Text>
              <Text style={styles.statLabel}>Total Events</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: '#ECFDF5' }]}>
                <Ionicons name="time-outline" size={22} color={COLORS.success} />
              </View>
              <Text style={styles.statNumber}>{stats?.upcomingEvents || 0}</Text>
              <Text style={styles.statLabel}>Upcoming Events</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="ticket-outline" size={22} color={COLORS.warning} />
              </View>
              <Text style={styles.statNumber}>{stats?.totalBookings || 0}</Text>
              <Text style={styles.statLabel}>Total Bookings</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconBg, { backgroundColor: '#F3E8FF' }]}>
                <Ionicons name="people-outline" size={22} color="#9333EA" />
              </View>
              <Text style={styles.statNumber}>{stats?.totalTicketsBooked || 0}</Text>
              <Text style={styles.statLabel}>Tickets Booked</Text>
            </View>
          </View>

          {/* Quick Action Banner */}
          <TouchableOpacity
            style={styles.createBanner}
            onPress={() => router.push('/(organizer)/create')}
            activeOpacity={0.9}
          >
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Host a New Event</Text>
              <Text style={styles.bannerSubtitle}>Publish your event and start selling tickets</Text>
            </View>
            <View style={styles.bannerButton}>
              <Text style={styles.bannerButtonText}>Create</Text>
            </View>
          </TouchableOpacity>

          {/* Recent Events Section */}
          <View style={styles.recentSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Events</Text>
              <TouchableOpacity onPress={() => router.push('/(organizer)/events')}>
                <Text style={styles.seeAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {stats?.recentEvents && stats.recentEvents.length > 0 ? (
              stats.recentEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onPress={() => router.push(`/organizer/event/${event.id}`)}
                />
              ))
            ) : (
              <View style={styles.emptyRecent}>
                <Text style={styles.emptyRecentText}>You haven't created any events yet.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.text,
  },
  subheading: {
    fontSize: 13,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  createIconButton: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginVertical: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    width: '47.5%',
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.secondaryText,
    marginTop: 2,
  },
  createBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
  },
  bannerTextContainer: {
    flex: 1,
    marginRight: SPACING.md,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.surface,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: COLORS.secondary,
    marginTop: 2,
  },
  bannerButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 2,
    borderRadius: RADIUS.md,
  },
  bannerButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  recentSection: {
    marginTop: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  emptyRecent: {
    backgroundColor: COLORS.surface,
    padding: SPACING.xl,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyRecentText: {
    color: COLORS.secondaryText,
    fontSize: 14,
  },
});
